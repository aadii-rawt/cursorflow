import { create } from 'zustand';
import {
  BackgroundSettings,
  FrameSettings,
  VideoTrimSettings,
  VideoProject,
  ExportSettings,
  ExportProgress
} from '../types/editor.types';
import { CursorEvent, CursorSettings, ZoomKeyframe } from '../types/cursor.types';
import { BACKGROUND_PRESETS } from '../utils/presets';

interface EditorStore {
  // Project State
  project: VideoProject | null;
  setProject: (project: VideoProject | null) => void;
  loadRecordingIntoEditor: (
    metadata: { id: string; title: string; videoPath: string; duration: number },
    cursorEvents?: CursorEvent[]
  ) => void;

  // Playback
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;

  // Trim
  trim: VideoTrimSettings;
  setTrim: (trim: Partial<VideoTrimSettings>) => void;

  // Background
  background: BackgroundSettings;
  setBackground: (settings: Partial<BackgroundSettings>) => void;
  applyBackgroundPreset: (presetId: string) => void;

  // Frame
  frame: FrameSettings;
  setFrame: (settings: Partial<FrameSettings>) => void;

  // Cursor Settings
  cursorSettings: CursorSettings;
  setCursorSettings: (settings: Partial<CursorSettings>) => void;

  // Cursor & Zoom Events
  cursorEvents: CursorEvent[];
  setCursorEvents: (events: CursorEvent[]) => void;
  zoomKeyframes: ZoomKeyframe[];
  setZoomKeyframes: (keyframes: ZoomKeyframe[]) => void;
  addZoomKeyframe: (keyframe: ZoomKeyframe) => void;
  updateZoomKeyframe: (id: string, updates: Partial<ZoomKeyframe>) => void;
  deleteZoomKeyframe: (id: string) => void;
  selectedKeyframeId: string | null;
  setSelectedKeyframeId: (id: string | null) => void;

  // Auto-generate zoom keyframes from cursor idle/click events
  autoGenerateZoomKeyframes: () => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: () => void;

  // UI state
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  activeTab: 'background' | 'frame' | 'cursor' | 'zoom' | 'audio';
  setActiveTab: (tab: 'background' | 'frame' | 'cursor' | 'zoom' | 'audio') => void;
  timelineZoom: number; // 1 to 5
  setTimelineZoom: (zoom: number) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  exportSettings: ExportSettings;
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  exportProgress: ExportProgress;
  setExportProgress: (progress: Partial<ExportProgress>) => void;
}

const defaultBackground: BackgroundSettings = {
  type: 'gradient',
  color: '#7928CA',
  gradient: {
    start: '#7928CA',
    end: '#FF0080',
    angle: 135,
    preset: 'purple-nebula'
  },
  blurAmount: 0,
  opacity: 1,
  padding: 56
};

const defaultFrame: FrameSettings = {
  mockup: 'macbook',
  cornerRadius: 16,
  shadowIntensity: 65,
  shadowColor: 'rgba(0, 0, 0, 0.7)',
  scale: 0.9,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.12)',
  aspectRatio: '16:9'
};

const defaultCursorSettings: CursorSettings = {
  enabled: true,
  cursorPointerMode: 'captured', // 'captured' (no duplicate cursor), 'vector' (custom SVG arrow), 'hidden'
  autoZoom: true,
  defaultZoomLevel: 1.75,
  zoomTransitionDuration: 450,
  zoomIntensity: 0.8,
  spotlightEnabled: true,
  spotlightRadius: 120,
  spotlightOpacity: 0.35,
  highlightRingEnabled: false,
  highlightColor: '#8B5CF6',
  clickAnimationEnabled: true,
  clickColor: '#38BDF8',
  cursorStyle: 'macos-black',
  cursorSize: 1.25,
  smoothFollowSpeed: 0.35,
  offsetX: 0,
  offsetY: 0
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  project: null,
  setProject: (project) => set({ project }),

  loadRecordingIntoEditor: (metadata, cursorEvents = []) => {
    const duration = metadata.duration || 10;
    const initialZoomKeyframes: ZoomKeyframe[] = [];

    // Analyze cursor events to pre-populate smart zooms if any exist
    if (cursorEvents.length > 0) {
      // Find clicks or idle pauses
      for (let i = 0; i < cursorEvents.length; i++) {
        const ev = cursorEvents[i];
        if (ev.type === 'click' || ev.type === 'contextmenu') {
          // Add a zoom event centered on the click
          const timestamp = Math.max(0, ev.timestamp - 200);
          initialZoomKeyframes.push({
            id: `zoom-${Date.now()}-${i}`,
            timestamp,
            duration: 1800,
            scale: 1.8,
            targetX: ev.x,
            targetY: ev.y,
            transitionDuration: 400,
            type: 'auto-click'
          });
          // Skip next 2 seconds of events to avoid overlapping zooms
          i += 10;
        }
      }
    }

    set({
      currentTime: 0,
      duration,
      isPlaying: false,
      trim: { startTime: 0, endTime: duration },
      background: { ...defaultBackground },
      frame: { ...defaultFrame },
      cursorSettings: { ...defaultCursorSettings },
      cursorEvents,
      zoomKeyframes: initialZoomKeyframes,
      selectedKeyframeId: null,
      project: {
        id: metadata.id,
        name: metadata.title,
        videoSrc: metadata.videoPath,
        duration,
        currentTime: 0,
        isPlaying: false,
        trim: { startTime: 0, endTime: duration },
        background: { ...defaultBackground },
        frame: { ...defaultFrame },
        cursorSettings: { ...defaultCursorSettings },
        cursorEvents,
        zoomKeyframes: initialZoomKeyframes,
        selectedKeyframeId: null,
        volume: 1,
        isMuted: false,
        history: { past: [], future: [] }
      }
    });
  },

  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  duration: 10,
  setDuration: (duration) => set({ duration }),
  volume: 1,
  setVolume: (volume) => set({ volume }),
  isMuted: false,
  setIsMuted: (isMuted) => set({ isMuted }),
  playbackRate: 1,
  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  trim: { startTime: 0, endTime: 10 },
  setTrim: (trimUpdate) =>
    set((state) => ({ trim: { ...state.trim, ...trimUpdate } })),

  background: defaultBackground,
  setBackground: (settings) => {
    get().pushHistory();
    set((state) => ({ background: { ...state.background, ...settings } }));
  },
  applyBackgroundPreset: (presetId) => {
    const found = BACKGROUND_PRESETS.find((p) => p.id === presetId);
    if (found) {
      get().pushHistory();
      set({ background: { ...found.settings } });
    }
  },

  frame: defaultFrame,
  setFrame: (settings) => {
    get().pushHistory();
    set((state) => ({ frame: { ...state.frame, ...settings } }));
  },

  cursorSettings: defaultCursorSettings,
  setCursorSettings: (settings) => {
    get().pushHistory();
    set((state) => ({
      cursorSettings: { ...state.cursorSettings, ...settings }
    }));
  },

  cursorEvents: [],
  setCursorEvents: (cursorEvents) => set({ cursorEvents }),
  zoomKeyframes: [],
  setZoomKeyframes: (zoomKeyframes) => set({ zoomKeyframes }),
  addZoomKeyframe: (keyframe) => {
    get().pushHistory();
    set((state) => ({
      zoomKeyframes: [...state.zoomKeyframes, keyframe].sort(
        (a, b) => a.timestamp - b.timestamp
      ),
      selectedKeyframeId: keyframe.id
    }));
  },
  updateZoomKeyframe: (id, updates) => {
    get().pushHistory();
    set((state) => ({
      zoomKeyframes: state.zoomKeyframes.map((k) =>
        k.id === id ? { ...k, ...updates } : k
      )
    }));
  },
  deleteZoomKeyframe: (id) => {
    get().pushHistory();
    set((state) => ({
      zoomKeyframes: state.zoomKeyframes.filter((k) => k.id !== id),
      selectedKeyframeId:
        state.selectedKeyframeId === id ? null : state.selectedKeyframeId
    }));
  },
  selectedKeyframeId: null,
  setSelectedKeyframeId: (selectedKeyframeId) => set({ selectedKeyframeId }),

  autoGenerateZoomKeyframes: () => {
    const { cursorEvents, duration, cursorSettings } = get();
    if (cursorEvents.length === 0) return;

    const keyframes: ZoomKeyframe[] = [];
    const minDistanceBetweenZooms = 2000; // ms
    let lastZoomEnd = -minDistanceBetweenZooms;

    // Detect click clusters or idle dwell points
    for (let i = 0; i < cursorEvents.length; i++) {
      const ev = cursorEvents[i];
      if (ev.type === 'click' && ev.timestamp > lastZoomEnd + 800) {
        keyframes.push({
          id: `auto-zoom-${Date.now()}-${keyframes.length}`,
          timestamp: Math.max(0, ev.timestamp - 300),
          duration: 1600,
          scale: cursorSettings.defaultZoomLevel,
          targetX: ev.x,
          targetY: ev.y,
          transitionDuration: cursorSettings.zoomTransitionDuration,
          type: 'auto-click'
        });
        lastZoomEnd = ev.timestamp + 1600;
      }
    }

    get().pushHistory();
    set({ zoomKeyframes: keyframes });
  },

  canUndo: false,
  canRedo: false,
  pushHistory: () => {
    const { project, background, frame, cursorSettings, zoomKeyframes } = get();
    if (!project) return;
    const currentState = { background, frame, cursorSettings, zoomKeyframes };
    const past = [...project.history.past, currentState].slice(-20); // keep last 20
    set({
      project: {
        ...project,
        history: { past, future: [] }
      },
      canUndo: past.length > 0,
      canRedo: false
    });
  },
  undo: () => {
    const { project } = get();
    if (!project || project.history.past.length === 0) return;
    const past = [...project.history.past];
    const previous = past.pop();
    if (!previous) return;

    const current = {
      background: get().background,
      frame: get().frame,
      cursorSettings: get().cursorSettings,
      zoomKeyframes: get().zoomKeyframes
    };

    set({
      background: previous.background,
      frame: previous.frame,
      cursorSettings: previous.cursorSettings,
      zoomKeyframes: previous.zoomKeyframes,
      canUndo: past.length > 0,
      canRedo: true,
      project: {
        ...project,
        history: {
          past,
          future: [current, ...project.history.future]
        }
      }
    });
  },
  redo: () => {
    const { project } = get();
    if (!project || project.history.future.length === 0) return;
    const future = [...project.history.future];
    const next = future.shift();
    if (!next) return;

    const current = {
      background: get().background,
      frame: get().frame,
      cursorSettings: get().cursorSettings,
      zoomKeyframes: get().zoomKeyframes
    };

    set({
      background: next.background,
      frame: next.frame,
      cursorSettings: next.cursorSettings,
      zoomKeyframes: next.zoomKeyframes,
      canUndo: true,
      canRedo: future.length > 0,
      project: {
        ...project,
        history: {
          past: [...project.history.past, current],
          future
        }
      }
    });
  },

  theme: ((typeof window !== 'undefined' && localStorage.getItem('cursorful_theme')) as 'dark' | 'light') || 'dark',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cursorful_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  activeTab: 'background',
  setActiveTab: (activeTab) => set({ activeTab }),
  timelineZoom: 1,
  setTimelineZoom: (timelineZoom) => set({ timelineZoom }),

  isExportModalOpen: false,
  setIsExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
  exportSettings: {
    format: 'mp4',
    resolution: '1080p',
    frameRate: 60,
    quality: 'high',
    fileName: `recording-${Date.now()}`
  },
  setExportSettings: (settings) =>
    set((state) => ({
      exportSettings: { ...state.exportSettings, ...settings }
    })),

  exportProgress: {
    isExporting: false,
    progress: 0,
    currentFrame: 0,
    totalFrames: 0,
    fps: 0,
    timeRemaining: ''
  },
  setExportProgress: (progress) =>
    set((state) => ({
      exportProgress: { ...state.exportProgress, ...progress }
    }))
}));
