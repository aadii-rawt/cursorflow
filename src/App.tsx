import React, { useEffect } from 'react';
import { useRecordingStore } from './store/recording.store';
import { useEditorStore } from './store/editor.store';
import { storageService } from './services/storage.service';
import { TitleBar } from './components/common/TitleBar';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { VideoEditor } from './components/editor/VideoEditor';
import { RecordingSetupModal } from './components/recorder/RecordingSetupModal';
import { CountdownOverlay } from './components/recorder/CountdownOverlay';
import { FloatingRecordingBar } from './components/recorder/FloatingRecordingBar';
import { CameraOverlay } from './components/recorder/CameraOverlay';
import { ExportModal } from './components/export/ExportModal';

export const App: React.FC = () => {
  const { setRecordings, status } = useRecordingStore();
  const { project, setProject, isPlaying, setIsPlaying, undo, redo, theme } = useEditorStore();

  // Sync theme class on HTML element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Load existing recordings on launch
  useEffect(() => {
    storageService.loadRecordings().then((recs) => {
      if (recs && recs.length > 0) {
        setRecordings(recs);
      }
    });
  }, [setRecordings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Space: Play / Pause in editor
      if (e.code === 'Space' && project) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }

      // Ctrl+Z: Undo
      if (e.ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((e.ctrlKey && e.key.toLowerCase() === 'y') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, isPlaying, setIsPlaying, undo, redo]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-text-primary select-none font-sans">
      {/* 1. Frameless Custom Window Titlebar */}
      <TitleBar />

      {/* 2. Main Viewport: Either Video Editor or Dashboard */}
      <main className="flex-1 flex overflow-hidden relative">
        {project && status === 'idle' ? (
          <VideoEditor onBackToDashboard={() => setProject(null)} />
        ) : (
          <HomeDashboard />
        )}
      </main>

      {/* 3. Floating Overlays & Modals */}
      <RecordingSetupModal />
      <CountdownOverlay />
      <FloatingRecordingBar />
      <CameraOverlay />
      <ExportModal />
    </div>
  );
};

export default App;
