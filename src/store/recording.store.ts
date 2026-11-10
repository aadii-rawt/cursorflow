import { create } from 'zustand';
import { DesktopSource, AudioDevice, VideoDevice, RecordingOptions, RecordingStatus, RecordingMetadata } from '../types/recording.types';

interface RecordingStore {
  // Status
  status: RecordingStatus;
  setStatus: (status: RecordingStatus) => void;
  elapsedSeconds: number;
  setElapsedSeconds: (seconds: number | ((prev: number) => number)) => void;
  countdown: number;
  setCountdown: (count: number) => void;

  // Devices & Sources
  sources: DesktopSource[];
  setSources: (sources: DesktopSource[]) => void;
  selectedSource: DesktopSource | null;
  setSelectedSource: (source: DesktopSource | null) => void;

  audioDevices: AudioDevice[];
  setAudioDevices: (devices: AudioDevice[]) => void;
  videoDevices: VideoDevice[];
  setVideoDevices: (devices: VideoDevice[]) => void;

  // Options
  options: RecordingOptions;
  updateOptions: (options: Partial<RecordingOptions>) => void;

  // Camera overlay state
  cameraPosition: { x: number; y: number };
  setCameraPosition: (pos: { x: number; y: number }) => void;
  cameraSize: 'sm' | 'md' | 'lg';
  setCameraSize: (size: 'sm' | 'md' | 'lg') => void;
  cameraShape: 'circle' | 'rounded' | 'square';
  setCameraShape: (shape: 'circle' | 'rounded' | 'square') => void;

  // Recent recordings
  recordings: RecordingMetadata[];
  setRecordings: (recordings: RecordingMetadata[]) => void;
  addRecording: (recording: RecordingMetadata) => void;
  deleteRecording: (id: string) => void;

  // UI state
  isSetupModalOpen: boolean;
  setIsSetupModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useRecordingStore = create<RecordingStore>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
  elapsedSeconds: 0,
  setElapsedSeconds: (seconds) =>
    set((state) => ({
      elapsedSeconds: typeof seconds === 'function' ? seconds(state.elapsedSeconds) : seconds
    })),
  countdown: 3,
  setCountdown: (countdown) => set({ countdown }),

  sources: [],
  setSources: (sources) => set({ sources }),
  selectedSource: null,
  setSelectedSource: (source) => set({ selectedSource: source }),

  audioDevices: [],
  setAudioDevices: (devices) => set({ audioDevices: devices }),
  videoDevices: [],
  setVideoDevices: (devices) => set({ videoDevices: devices }),

  options: {
    sourceId: '',
    sourceName: '',
    isScreen: true,
    resolution: '1080p',
    frameRate: 60,
    includeMic: true,
    micDeviceId: 'default',
    includeSystemAudio: true,
    includeCamera: false,
    cameraDeviceId: 'default',
    countdownSeconds: 3
  },
  updateOptions: (newOpts) =>
    set((state) => ({ options: { ...state.options, ...newOpts } })),

  cameraPosition: { x: 40, y: 40 },
  setCameraPosition: (cameraPosition) => set({ cameraPosition }),
  cameraSize: 'md',
  setCameraSize: (cameraSize) => set({ cameraSize }),
  cameraShape: 'circle',
  setCameraShape: (cameraShape) => set({ cameraShape }),

  recordings: [],
  setRecordings: (recordings) => set({ recordings }),
  addRecording: (recording) =>
    set((state) => ({ recordings: [recording, ...state.recordings] })),
  deleteRecording: (id) =>
    set((state) => ({
      recordings: state.recordings.filter((r) => r.id !== id)
    })),

  isSetupModalOpen: false,
  setIsSetupModalOpen: (isSetupModalOpen) => set({ isSetupModalOpen }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery })
}));
