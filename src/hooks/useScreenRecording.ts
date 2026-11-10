import { useEffect, useRef, useCallback } from 'react';
import { useRecordingStore } from '../store/recording.store';
import { useEditorStore } from '../store/editor.store';
import { recordingService } from '../services/recording.service';
import { storageService } from '../services/storage.service';

export function useScreenRecording() {
  const {
    status,
    setStatus,
    elapsedSeconds,
    setElapsedSeconds,
    countdown,
    setCountdown,
    options,
    selectedSource,
    addRecording,
    setIsSetupModalOpen
  } = useRecordingStore();

  const { loadRecordingIntoEditor } = useEditorStore();

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const startCountdownAndRecord = useCallback(async () => {
    setIsSetupModalOpen(false);
    setStatus('countdown');
    setCountdown(options.countdownSeconds || 3);

    try {
      // 1. Pre-acquire streams so countdown 3-2-1 never freezes or lags!
      await recordingService.prepareRecording({
        ...options,
        sourceId: selectedSource?.id || '',
        sourceName: selectedSource?.name || 'Screen',
        isScreen: selectedSource?.isScreen ?? true
      });

      let currentCount = options.countdownSeconds || 3;
      setCountdown(currentCount);

      countdownIntervalRef.current = setInterval(async () => {
        currentCount--;
        if (currentCount > 0) {
          setCountdown(currentCount);
        } else {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }

          // Instant start since media streams are already prepared
          await recordingService.startRecording({
            ...options,
            sourceId: selectedSource?.id || '',
            sourceName: selectedSource?.name || 'Screen',
            isScreen: selectedSource?.isScreen ?? true
          });

          setStatus('recording');
          setElapsedSeconds(0);

          timerIntervalRef.current = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
          }, 1000);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Failed to prepare recording:', err);
      alert(`Could not start capture: ${err.message || 'Permission denied'}`);
      setStatus('idle');
    }
  }, [options, selectedSource, setIsSetupModalOpen, setStatus, setCountdown, setElapsedSeconds]);

  const pauseRecording = useCallback(() => {
    recordingService.pauseRecording();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStatus('paused');
  }, [setStatus]);

  const resumeRecording = useCallback(() => {
    recordingService.resumeRecording();
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    setStatus('recording');
  }, [setStatus, setElapsedSeconds]);

  const stopRecording = useCallback(async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setStatus('stopped');

    try {
      const result = await recordingService.stopRecording();
      const arrayBuffer = await result.blob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const title = `Recording — ${new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // Save recording to disk / store
      const saveRes = await storageService.saveRecording(
        buffer,
        {
          title,
          duration: result.duration,
          sourceName: selectedSource?.name || 'Screen',
          resolution: { width: 1920, height: 1080 },
          thumbnailDataUrl: result.thumbnailDataUrl
        },
        result.cursorEvents
      );

      const newRecord = {
        id: saveRes.id || `rec_${Date.now()}`,
        title,
        createdAt: Date.now(),
        duration: result.duration,
        sourceName: selectedSource?.name || 'Screen',
        resolution: { width: 1920, height: 1080 },
        videoPath: saveRes.filePath || URL.createObjectURL(result.blob),
        thumbnailPath: result.thumbnailDataUrl || '',
        cursorEventsPath: '',
        fileSize: buffer.byteLength
      };

      addRecording(newRecord);

      // Immediately open Video Editor screen with this recording!
      loadRecordingIntoEditor(newRecord, result.cursorEvents);
      setStatus('idle');
    } catch (err: any) {
      console.error('Failed to stop/save recording:', err);
      setStatus('idle');
    }
  }, [setStatus, selectedSource, addRecording, loadRecordingIntoEditor]);

  return {
    status,
    elapsedSeconds,
    countdown,
    startCountdownAndRecord,
    pauseRecording,
    resumeRecording,
    stopRecording
  };
}
