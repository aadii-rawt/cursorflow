import { useEffect, useCallback } from 'react';
import { useRecordingStore } from '../store/recording.store';
import { recordingService } from '../services/recording.service';

export function useMediaDevices() {
  const {
    sources,
    setSources,
    selectedSource,
    setSelectedSource,
    audioDevices,
    setAudioDevices,
    videoDevices,
    setVideoDevices
  } = useRecordingStore();

  const refreshDevicesAndSources = useCallback(async () => {
    // 1. Get desktop sources (screens and windows)
    try {
      const desktopSources = await recordingService.getDesktopSources();
      setSources(desktopSources);

      // Default select the first screen if nothing selected
      if (!selectedSource && desktopSources.length > 0) {
        const firstScreen = desktopSources.find((s) => s.isScreen) || desktopSources[0];
        setSelectedSource(firstScreen);
      }
    } catch (e) {
      console.warn('Error fetching desktop sources:', e);
    }

    // 2. Audio input devices
    try {
      const audioInputs = await recordingService.getAudioDevices();
      setAudioDevices(
        audioInputs.map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`
        }))
      );
    } catch (e) {
      console.warn('Error fetching audio devices:', e);
    }

    // 3. Video input devices (cameras)
    try {
      const videoInputs = await recordingService.getVideoDevices();
      setVideoDevices(
        videoInputs.map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 5)}`
        }))
      );
    } catch (e) {
      console.warn('Error fetching video devices:', e);
    }
  }, [selectedSource, setSources, setSelectedSource, setAudioDevices, setVideoDevices]);

  useEffect(() => {
    refreshDevicesAndSources();

    const handleDeviceChange = () => {
      refreshDevicesAndSources();
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refreshDevicesAndSources]);

  return {
    sources,
    selectedSource,
    setSelectedSource,
    audioDevices,
    videoDevices,
    refreshDevicesAndSources
  };
}
