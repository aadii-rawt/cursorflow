import { CursorEvent, CursorSettings, ZoomKeyframe } from './cursor.types';

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'blur';

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  gradient: {
    start: string;
    end: string;
    angle: number; // in degrees
    preset?: string;
  };
  imageUrl?: string;
  blurAmount: number; // 0 to 40 px
  opacity: number; // 0 to 1
  padding: number; // padding around the recording frame in px or %
}

export type FrameMockupType = 'none' | 'macbook' | 'browser' | 'minimal' | 'glass';
export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:3' | 'custom';

export interface FrameSettings {
  mockup: FrameMockupType;
  cornerRadius: number; // e.g. 0 to 32px
  shadowIntensity: number; // 0 to 100
  shadowColor: string;
  scale: number; // 0.5 to 1.0 (video scale inside background)
  borderWidth: number;
  borderColor: string;
  aspectRatio: AspectRatioType;
  customWidth?: number;
  customHeight?: number;
}

export interface VideoTrimSettings {
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface VideoProject {
  id: string;
  name: string;
  videoSrc: string; // file:// or blob:
  duration: number; // in seconds
  currentTime: number;
  isPlaying: boolean;
  trim: VideoTrimSettings;
  background: BackgroundSettings;
  frame: FrameSettings;
  cursorSettings: CursorSettings;
  cursorEvents: CursorEvent[];
  zoomKeyframes: ZoomKeyframe[];
  selectedKeyframeId: string | null;
  volume: number;
  isMuted: boolean;
  history: {
    past: Array<{
      background: BackgroundSettings;
      frame: FrameSettings;
      cursorSettings: CursorSettings;
      zoomKeyframes: ZoomKeyframe[];
    }>;
    future: Array<{
      background: BackgroundSettings;
      frame: FrameSettings;
      cursorSettings: CursorSettings;
      zoomKeyframes: ZoomKeyframe[];
    }>;
  };
}

export interface ExportSettings {
  format: 'mp4' | 'webm';
  resolution: '720p' | '1080p' | '1440p' | '4k';
  frameRate: 30 | 60;
  quality: 'standard' | 'high' | 'ultra';
  fileName: string;
  outputPath?: string;
}

export interface ExportProgress {
  isExporting: boolean;
  progress: number; // 0 to 100
  currentFrame: number;
  totalFrames: number;
  fps: number;
  timeRemaining: string;
  outputPath?: string;
  error?: string;
}
