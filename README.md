# Cursorful Studio — Premium Desktop Screen Recorder & Video Editor

**Cursorful Studio** is a professional desktop screen recording and video editing application inspired by **Cursorful** and **Screen Studio**. It enables creators, developers, and educators to capture high-definition recordings with synchronized cursor telemetry, smooth automatic zoom-in effects, elegant device mockup frames, designer gradient backgrounds, and hardware-accelerated video exports powered by FFmpeg.

---

## 🌟 Key Features

### 1. Advanced Screen Capture
- **Full Screen & Window Capture**: Capture any active display/monitor or application window using Electron's `desktopCapturer`.
- **Audio Mixing**: Simultaneous system audio and microphone recording with selectable input devices.
- **Picture-in-Picture Webcam Overlay**: Draggable, resizable circular or rounded webcam preview overlay.
- **Countdown Timer**: Configurable 3-second animated countdown before capture starts.
- **Floating Controls**: Minimalist floating HUD during recording displaying live elapsed time, pause, resume, and stop controls.

### 2. Cursor Telemetry & Automatic Zoom Engine
- **Synchronized Cursor Tracking**: Cursor coordinates and timestamps are recorded separately during capture into structured JSON without permanently embedding them into the raw video.
- **Smart Auto-Zoom**: Automatically zooms into cursor coordinates when the mouse pauses or clicks.
- **Cinema-Grade Smooth Transitions**: Cubic easing camera pans that center on the mouse focus point while clamping within screen bounds.
- **Adjustable Zoom Levels**: 1.25x, 1.5x, 1.75x, 2.0x, 2.5x, 3.0x.
- **Visual Enhancements**:
  - Spotlight focus effect (dims surrounding backdrop to emphasize pointer focus).
  - Mouse click ripple indicators (distinct left and right click animations).
  - Glowing highlight rings.
  - High-resolution SVG cursor arrows (Dark & Light macOS style, dot pulse).

### 3. Background & Device Mockup Customization
- **Preset Designer Backgrounds**: Purple Nebula, Cyber Horizon, Sunset Glow, Dark Obsidian, Emerald Aurora, Pro Charcoal, Minimal Light, and Cosmic Mesh.
- **Custom Gradients & Colors**: 360° gradient angle selector, color pickers, adjustable padding, and background blur.
- **Device Mockups**:
  - **MacBook Pro**: Window header with red, yellow, and green traffic lights.
  - **Modern Browser**: Clean URL address bar and tabs.
  - **Minimal Glass**: Sleek translucent border with subtle drop shadow.
  - **Clean Borderless**: Pure rounded video.
- **Adjustable Parameters**: Corner radius (0–32px), drop shadow intensity (0–100%), video scale, and aspect ratios (16:9, 9:16, 1:1, 4:3).

### 4. Professional Multi-Track Video Editor
- **Multi-Track Timeline**:
  - **Video Track**: Visual waveform track with start/end trim handles.
  - **Zoom Keyframes Track**: Visual zoom blocks that can be added, moved, resized, or deleted.
  - **Cursor Activity Track**: High-density cursor events and click markers.
- **Playhead & Scrubbing**: Smooth real-time scrubbing with milliseconds accuracy.
- **Undo / Redo**: Multi-level state history (with `Ctrl+Z` and `Ctrl+Y`).
- **Interactive Preview**: Real-time canvas compositing that mirrors changes instantly at 60 FPS.

### 5. Hardware-Accelerated Video Export
- **Formats**: MP4 (H.264 + AAC) and WebM (VP9 + Opus).
- **Resolutions**: 720p, 1080p (FHD), 1440p (2K), 4K (UHD) at 30 or 60 FPS.
- **Integrated FFmpeg Engine**: Bundled standalone FFmpeg binary for post-processing and compositing.
- **Progress Tracking**: Real-time progress bar, frame count, rendering speed (FPS), and time remaining.
- **Export Management**: Direct "Show in Folder" action and confetti celebration upon completion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Desktop Shell** | Electron 33 |
| **Frontend Framework** | React 18, TypeScript |
| **Styling** | Tailwind CSS, Lucide React Icons |
| **State Management** | Zustand |
| **Video Processing** | Native FFmpeg (`ffmpeg-static`), MediaRecorder API, HTML5 Canvas 2D |
| **Animations** | Framer Motion, Canvas Confetti |
| **Build Tooling** | Vite 5, TypeScript Compiler (`tsc`), Concurrently |

---

## 📁 Project Architecture

```
cursorful-studio/
├── electron/
│   ├── main.ts             # Electron main process, IPC handlers, FFmpeg integration, cursor polling
│   └── preload.ts          # Secure contextBridge API exposing window.electronAPI
├── src/
│   ├── components/
│   │   ├── common/         # Frameless TitleBar and window control buttons
│   │   ├── dashboard/      # HomeDashboard, RecordingCard
│   │   ├── recorder/       # RecordingSetupModal, FloatingRecordingBar, CountdownOverlay, CameraOverlay
│   │   ├── editor/         # VideoEditor, EditorHeader, PreviewCanvas, LeftSidebar, RightSidebar
│   │   ├── timeline/       # Multi-track Timeline, Playhead, Trim Handles, Zoom Markers
│   │   ├── export/         # ExportModal with progress bar and format selectors
│   │   └── ui/             # Reusable UI primitives: Button, Slider, Switch, Dialog
│   ├── hooks/
│   │   ├── useScreenRecording.ts
│   │   └── useMediaDevices.ts
│   ├── services/
│   │   ├── recording.service.ts  # Desktop capturer & MediaRecorder manager
│   │   ├── cursor.service.ts     # Telemetry interpolation & camera geometry math
│   │   ├── export.service.ts     # Offscreen canvas compositor & frame renderer
│   │   └── storage.service.ts    # File system recording storage & metadata
│   ├── store/
│   │   ├── recording.store.ts    # Zustand store for recording session & sources
│   │   └── editor.store.ts       # Zustand store for project state, undo/redo & keyframes
│   ├── types/                    # TypeScript interfaces for recording, cursor, editor, and electron
│   ├── utils/
│   │   ├── formatTime.ts         # Time, duration, and file size formatting
│   │   ├── geometry.ts           # Lerp, cubic easing, and camera viewport clamping
│   │   └── presets.ts            # Gradient and solid background presets
│   ├── App.tsx                   # Main application entry orchestrating screens & shortcuts
│   ├── main.tsx
│   └── index.css                 # Dark theme design system & scrollbars
├── dist/                         # Vite production build
├── dist-electron/                # Compiled Electron main & preload bundles
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Windows (Windows 10 / 11) or macOS / Linux

### Installation

```bash
cd "C:\Users\conne\.gemini\antigravity\scratch\cursorful-studio"
npm install
```

### Running the Application

To launch the desktop application directly:
```bash
npm start
```

To run in live development mode (Vite HMR + Electron watch):
```bash
npm run dev
```

### Building for Production

To create the production bundles:
```bash
npm run build
```
