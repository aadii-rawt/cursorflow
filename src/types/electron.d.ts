import { DesktopSource, RecordingMetadata } from './recording.types';
import { CursorEvent } from './cursor.types';
import { ExportProgress } from './editor.types';

export interface ElectronAPI {
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  getDesktopSources: () => Promise<DesktopSource[]>;

  startCursorTracking: (sourceBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
    displayId?: string;
  }) => Promise<{ started: boolean }>;
  stopCursorTracking: () => Promise<CursorEvent[]>;
  getCurrentCursorPos: () => Promise<{ x: number; y: number }>;

  saveRecording: (data: {
    buffer: Uint8Array;
    metadata: Omit<RecordingMetadata, 'id' | 'videoPath' | 'thumbnailPath' | 'cursorEventsPath'> & {
      thumbnailDataUrl?: string;
    };
    cursorEvents: CursorEvent[];
  }) => Promise<{ success: boolean; filePath: string; id: string }>;
  loadRecordings: () => Promise<RecordingMetadata[]>;
  deleteRecording: (id: string) => Promise<boolean>;
  openInFolder: (filePath: string) => Promise<void>;

  exportVideo: (options: {
    inputPath: string;
    outputPath: string;
    format: 'mp4' | 'webm';
    resolution: '720p' | '1080p' | '1440p' | '4k';
    fps: number;
    trimStart?: number;
    trimEnd?: number;
  }) => Promise<{ success: boolean; outputPath: string }>;
  saveExportBuffer: (data: {
    buffer: Uint8Array;
    format: string;
    fileName: string;
  }) => Promise<{ success: boolean; filePath: string }>;
  onExportProgress: (
    callback: (data: {
      progress: number;
      currentFrame: number;
      totalFrames: number;
      fps: number;
      timeRemaining: string;
    }) => void
  ) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
