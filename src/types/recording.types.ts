export interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string; // data URL or base64 image
  display_id?: string;
  appIcon?: string;
  isScreen: boolean;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  groupId?: string;
}

export interface VideoDevice {
  deviceId: string;
  label: string;
}

export interface RecordingOptions {
  sourceId: string;
  sourceName: string;
  isScreen: boolean;
  resolution: '720p' | '1080p' | '1440p' | '4k';
  frameRate: 30 | 60;
  includeMic: boolean;
  micDeviceId: string;
  includeSystemAudio: boolean;
  includeCamera: boolean;
  cameraDeviceId: string;
  countdownSeconds: number;
}

export interface RecordingMetadata {
  id: string;
  title: string;
  createdAt: number;
  duration: number; // in seconds
  sourceName: string;
  resolution: { width: number; height: number };
  videoPath: string;
  thumbnailPath: string;
  cursorEventsPath: string;
  fileSize: number; // in bytes
}

export type RecordingStatus = 'idle' | 'countdown' | 'recording' | 'paused' | 'stopped';
