import { DesktopSource, RecordingOptions } from '../types/recording.types';
import { CursorEvent } from '../types/cursor.types';

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private screenStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private cameraStream: MediaStream | null = null;
  private combinedStream: MediaStream | null = null;
  private startTime = 0;
  private simulatedCursorEvents: CursorEvent[] = [];
  private isSimulatingCursor = false;

  async getDesktopSources(): Promise<DesktopSource[]> {
    if (window.electronAPI?.getDesktopSources) {
      return await window.electronAPI.getDesktopSources();
    }
    return [];
  }

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'audioinput');
    } catch (e) {
      console.warn('Failed to enumerate audio devices', e);
      return [];
    }
  }

  async getVideoDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'videoinput');
    } catch (e) {
      console.warn('Failed to enumerate video devices', e);
      return [];
    }
  }

  async prepareRecording(
    options: RecordingOptions,
    onDataAvailable?: (chunk: Blob) => void
  ): Promise<MediaStream> {
    this.recordedChunks = [];
    this.simulatedCursorEvents = [];

    const resolutionMap = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '1440p': { width: 2560, height: 1440 },
      '4k': { width: 3840, height: 2160 }
    };
    const res = resolutionMap[options.resolution] || { width: 1920, height: 1080 };

    // 1. Get Screen Stream
    if (window.electronAPI && options.sourceId) {
      // Electron desktopCapturer stream
      const constraints: any = {
        audio: options.includeSystemAudio
          ? {
              mandatory: {
                chromeMediaSource: 'desktop'
              }
            }
          : false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: options.sourceId,
            minWidth: 1280,
            maxWidth: res.width,
            minHeight: 720,
            maxHeight: res.height,
            maxFrameRate: options.frameRate
          }
        }
      };

      try {
        this.screenStream = await (navigator.mediaDevices as any).getUserMedia(constraints);
      } catch (err) {
        console.warn('Failed with mandatory desktop constraints, falling back to basic', err);
        this.screenStream = await (navigator.mediaDevices as any).getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: options.sourceId
            }
          }
        });
      }
    } else {
      // Standard browser getDisplayMedia fallback
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: res.width },
          height: { ideal: res.height },
          frameRate: { ideal: options.frameRate }
        },
        audio: options.includeSystemAudio
      });
    }

    // 2. Microphone Stream
    if (options.includeMic) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio:
            options.micDeviceId && options.micDeviceId !== 'default'
              ? { deviceId: { exact: options.micDeviceId } }
              : true
        });
      } catch (err) {
        console.warn('Could not acquire mic stream:', err);
      }
    }

    // 3. Camera Stream (if overlay enabled)
    if (options.includeCamera) {
      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video:
            options.cameraDeviceId && options.cameraDeviceId !== 'default'
              ? { deviceId: { exact: options.cameraDeviceId }, width: 480, height: 480 }
              : { width: 480, height: 480 }
        });
      } catch (err) {
        console.warn('Could not acquire camera stream:', err);
      }
    }

    // Combine tracks into one stream for MediaRecorder
    const tracks: MediaStreamTrack[] = [
      ...this.screenStream.getVideoTracks()
    ];

    if (this.screenStream.getAudioTracks().length > 0) {
      tracks.push(...this.screenStream.getAudioTracks());
    }
    if (this.micStream && this.micStream.getAudioTracks().length > 0) {
      tracks.push(...this.micStream.getAudioTracks());
    }

    this.combinedStream = new MediaStream(tracks);

    // Pick best supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];
    let selectedMimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';

    this.mediaRecorder = new MediaRecorder(this.combinedStream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: options.resolution === '4k' ? 25000000 : 12000000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
        if (onDataAvailable) onDataAvailable(event.data);
      }
    };

    return this.combinedStream;
  }

  async startRecording(
    options: RecordingOptions,
    onDataAvailable?: (chunk: Blob) => void
  ): Promise<MediaStream> {
    if (!this.mediaRecorder) {
      await this.prepareRecording(options, onDataAvailable);
    }

    let displayId: string | undefined;
    if (options.sourceId.startsWith('screen:')) {
      const parts = options.sourceId.split(':');
      displayId = parts[1];
    }

    // Start high-precision cursor tracking
    if (window.electronAPI?.startCursorTracking) {
      await window.electronAPI.startCursorTracking({
        displayId
      });
    } else {
      // Fallback in-browser cursor event listener
      this.isSimulatingCursor = true;
      this.startTime = Date.now();
      const onMouseMove = (e: MouseEvent) => {
        if (!this.isSimulatingCursor) return;
        this.simulatedCursorEvents.push({
          timestamp: Date.now() - this.startTime,
          x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
          y: Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
          type: 'move'
        });
      };
      const onMouseDown = (e: MouseEvent) => {
        if (!this.isSimulatingCursor) return;
        this.simulatedCursorEvents.push({
          timestamp: Date.now() - this.startTime,
          x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
          y: Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
          type: 'click',
          button: e.button === 2 ? 'right' : 'left'
        });
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onMouseDown);
    }

    this.startTime = Date.now();
    this.mediaRecorder?.start(1000); // 1-second chunks

    return this.combinedStream!;
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  async stopRecording(): Promise<{
    blob: Blob;
    duration: number;
    cursorEvents: CursorEvent[];
    thumbnailDataUrl: string;
  }> {
    return new Promise(async (resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recorder'));
        return;
      }

      const duration = (Date.now() - this.startTime) / 1000;
      this.isSimulatingCursor = false;

      // Stop electron cursor tracking or retrieve events
      let events: CursorEvent[] = [];
      if (window.electronAPI?.stopCursorTracking) {
        try {
          events = await window.electronAPI.stopCursorTracking();
        } catch (e) {
          console.warn('Failed to stop electron cursor tracking', e);
        }
      } else {
        events = this.simulatedCursorEvents;
      }

      // Generate a thumbnail from the screen video stream before closing tracks
      let thumbnailDataUrl = '';
      try {
        const videoTrack = this.screenStream?.getVideoTracks()[0];
        if (videoTrack) {
          const imageCapture = (window as any).ImageCapture
            ? new (window as any).ImageCapture(videoTrack)
            : null;
          if (imageCapture) {
            const bitmap = await imageCapture.grabFrame();
            const canvas = document.createElement('canvas');
            canvas.width = 480;
            canvas.height = 270;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
              thumbnailDataUrl = canvas.toDataURL('image/png', 0.85);
            }
          }
        }
      } catch (err) {
        console.warn('Could not capture frame thumbnail:', err);
      }

      this.mediaRecorder.onstop = () => {
        const finalBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.cleanupStreams();

        resolve({
          blob: finalBlob,
          duration,
          cursorEvents: events,
          thumbnailDataUrl
        });
      };

      this.mediaRecorder.stop();
    });
  }

  getCameraStream(): MediaStream | null {
    return this.cameraStream;
  }

  cleanupStreams(): void {
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.cameraStream?.getTracks().forEach((t) => t.stop());
    this.combinedStream?.getTracks().forEach((t) => t.stop());
    this.screenStream = null;
    this.micStream = null;
    this.cameraStream = null;
    this.combinedStream = null;
  }
}

export const recordingService = new RecordingService();
