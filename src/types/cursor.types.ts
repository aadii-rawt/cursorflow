export type MouseEventType = 'move' | 'click' | 'contextmenu' | 'idle';

export interface CursorEvent {
  timestamp: number; // in milliseconds relative to recording start
  x: number; // normalized 0 to 1, or absolute in source bounds
  y: number; // normalized 0 to 1, or absolute in source bounds
  type: MouseEventType;
  button?: 'left' | 'right' | 'middle';
}

export interface ZoomKeyframe {
  id: string;
  timestamp: number; // in milliseconds
  duration: number; // how long zoom stays active in ms
  scale: number; // e.g. 1.25, 1.5, 2.0, etc.
  targetX: number; // normalized 0 to 1
  targetY: number; // normalized 0 to 1
  transitionDuration: number; // in ms
  type: 'auto-idle' | 'auto-click' | 'manual';
}

export interface CursorSettings {
  enabled: boolean;
  cursorPointerMode: 'captured' | 'vector' | 'hidden'; // 'captured' uses original cursor (no duplicate), 'vector' draws custom SVG, 'hidden' hides pointer
  autoZoom: boolean;
  defaultZoomLevel: number; // 1 to 3
  zoomTransitionDuration: number; // e.g. 300ms to 800ms
  zoomIntensity: number; // damping / responsiveness
  spotlightEnabled: boolean;
  spotlightRadius: number; // e.g. 100px
  spotlightOpacity: number; // e.g. 0.4
  highlightRingEnabled: boolean;
  highlightColor: string;
  clickAnimationEnabled: boolean;
  clickColor: string;
  cursorStyle: 'default' | 'macos-black' | 'macos-white' | 'circle' | 'minimal-dot';
  cursorSize: number; // multiplier e.g. 1.0, 1.25, 1.5
  smoothFollowSpeed: number; // 0.1 to 1.0 lerp factor
  offsetX?: number; // manual calibration offset (-0.2 to +0.2)
  offsetY?: number; // manual calibration offset (-0.2 to +0.2)
}
