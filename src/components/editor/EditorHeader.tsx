import React from 'react';
import { ArrowLeft, Undo2, Redo2, Download, Sparkles, Clock } from 'lucide-react';
import { useEditorStore } from '../../store/editor.store';
import { Button } from '../ui/button';
import { formatTime } from '../../utils/formatTime';

interface EditorHeaderProps {
  onBackToDashboard: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onBackToDashboard }) => {
  const {
    project,
    duration,
    canUndo,
    canRedo,
    undo,
    redo,
    setIsExportModalOpen,
    autoGenerateZoomKeyframes
  } = useEditorStore();

  return (
    <header className="h-14 border-b border-card-border/80 bg-secondary/80 backdrop-blur-md px-4 flex items-center justify-between select-none z-30">
      {/* Left: Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          title="Back to Dashboard"
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-card border border-transparent hover:border-card-border transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-card-border/80" />

        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-text-primary truncate max-w-xs">
            {project?.name || 'Untitled Video'}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-card-border text-[11px] font-mono text-text-muted">
            <Clock className="w-3 h-3 text-accent-sky" />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Center: Undo / Redo & Smart Zoom Action */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-card-border">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none hover:bg-secondary transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={autoGenerateZoomKeyframes}
          title="Auto-detect clicks and idle dwells to create smart cursor zooms"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-purple/15 hover:bg-accent-purple/25 text-accent-purple border border-accent-purple/30 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto Zooms</span>
        </button>
      </div>

      {/* Right: Export Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="gradient"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          className="shadow-glow-purple font-semibold px-4"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Video
        </Button>
      </div>
    </header>
  );
};
