import React from 'react';
import { Video, Plus, Search, Sparkles, Film, HardDrive, MonitorPlay } from 'lucide-react';
import { useRecordingStore } from '../../store/recording.store';
import { useEditorStore } from '../../store/editor.store';
import { RecordingCard } from './RecordingCard';
import { Button } from '../ui/button';
import { RecordingMetadata } from '../../types/recording.types';

export const HomeDashboard: React.FC = () => {
  const {
    recordings,
    deleteRecording,
    setIsSetupModalOpen,
    searchQuery,
    setSearchQuery,
    addRecording
  } = useRecordingStore();

  const { loadRecordingIntoEditor } = useEditorStore();

  const filteredRecordings = recordings.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sourceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEditor = (rec: RecordingMetadata) => {
    loadRecordingIntoEditor(rec);
  };

  const handleCreateDemoRecording = () => {
    // Generates a mock recording with sample cursor movement and clicks to showcase auto zoom immediately!
    const demoId = `rec_demo_${Date.now()}`;
    const demoEvents = [
      { timestamp: 500, x: 0.2, y: 0.3, type: 'move' as const },
      { timestamp: 1200, x: 0.45, y: 0.4, type: 'move' as const },
      { timestamp: 1800, x: 0.48, y: 0.42, type: 'click' as const, button: 'left' as const },
      { timestamp: 2400, x: 0.5, y: 0.43, type: 'idle' as const },
      { timestamp: 3500, x: 0.7, y: 0.6, type: 'move' as const },
      { timestamp: 4200, x: 0.75, y: 0.65, type: 'click' as const, button: 'left' as const },
      { timestamp: 5000, x: 0.3, y: 0.5, type: 'move' as const }
    ];

    const demoRec: RecordingMetadata = {
      id: demoId,
      title: 'Demo Walkthrough (with Cursor Zooms)',
      createdAt: Date.now(),
      duration: 8,
      sourceName: 'Primary Display',
      resolution: { width: 1920, height: 1080 },
      videoPath: '', // Will render interactive animated canvas
      thumbnailPath: '',
      cursorEventsPath: '',
      fileSize: 4200000
    };

    addRecording(demoRec);
    loadRecordingIntoEditor(demoRec, demoEvents);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background p-8">
      {/* Top Welcome / Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-card-border/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cursorful Studio 2.0 • AI-Grade Zoom Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Screen Recordings & Projects
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-xl">
            Record crystal-clear screen captures with automatic cursor zoom, smooth camera pans,
            and designer mockup frames.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCreateDemoRecording}
            className="border-card-border text-xs"
          >
            <MonitorPlay className="w-4 h-4 text-accent-sky" />
            Explore Demo Project
          </Button>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setIsSetupModalOpen(true)}
            className="shadow-glow-purple font-semibold"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            New Recording
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/15 text-accent-purple flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{recordings.length}</div>
            <div className="text-xs text-text-muted">Total Recordings</div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-sky/15 text-accent-sky flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">Auto 60fps</div>
            <div className="text-xs text-text-muted">Cursor Tracking Active</div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-emerald/15 text-accent-emerald flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">FFmpeg 6.1</div>
            <div className="text-xs text-text-muted">Hardware Accelerated</div>
          </div>
        </div>
      </div>

      {/* Recordings Section Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Recent Recordings</h2>
          <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded-full text-text-muted border border-card-border">
            {filteredRecordings.length}
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-card-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-accent-purple transition-colors"
          />
        </div>
      </div>

      {/* Grid of Recordings */}
      {filteredRecordings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecordings.map((recording) => (
            <RecordingCard
              key={recording.id}
              recording={recording}
              onOpenEditor={handleOpenEditor}
              onDelete={deleteRecording}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-[320px] rounded-2xl border border-dashed border-card-border flex flex-col items-center justify-center p-8 text-center bg-card/20">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-text-subtle mb-4 border border-card-border">
            <Video className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No recordings yet</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mb-6">
            Click &quot;New Recording&quot; to capture your screen, monitor, or any active window with
            synchronized cursor zoom.
          </p>
          <Button
            variant="gradient"
            size="md"
            onClick={() => setIsSetupModalOpen(true)}
            className="shadow-glow-purple"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Start First Recording
          </Button>
        </div>
      )}
    </div>
  );
};
