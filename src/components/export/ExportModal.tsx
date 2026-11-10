import React, { useState } from 'react';
import {
  Download,
  Film,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  Loader2,
  ExternalLink,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEditorStore } from '../../store/editor.store';
import { exportService } from '../../services/export.service';
import { storageService } from '../../services/storage.service';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import clsx from 'clsx';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    exportSettings,
    setExportSettings,
    exportProgress,
    setExportProgress,
    project,
    background,
    frame,
    cursorSettings,
    cursorEvents,
    zoomKeyframes,
    trim
  } = useEditorStore();

  const [exportedFilePath, setExportedFilePath] = useState<string | null>(null);

  const handleStartExport = async () => {
    setExportedFilePath(null);
    setExportProgress({
      isExporting: true,
      progress: 0,
      currentFrame: 0,
      totalFrames: 100,
      fps: 0,
      timeRemaining: 'Starting compositing engine...'
    });

    try {
      // Find or create hidden video element for offscreen frame compositing
      let videoEl = document.querySelector('video') as HTMLVideoElement;
      if (!videoEl && project?.videoSrc) {
        videoEl = document.createElement('video');
        videoEl.src = project.videoSrc;
        videoEl.muted = true;
        await new Promise((res) => {
          videoEl.onloadedmetadata = () => res(true);
        });
      }

      const res = await exportService.exportVideo(
        videoEl,
        background,
        frame,
        cursorSettings,
        cursorEvents,
        zoomKeyframes,
        exportSettings,
        trim,
        (progress) => setExportProgress(progress)
      );

      if (res.success && res.filePath) {
        setExportedFilePath(res.filePath);
        setExportProgress({ isExporting: false, progress: 100 });
        // Fire confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        alert(`Export failed: ${res.error || 'Unknown error'}`);
        setExportProgress({ isExporting: false, progress: 0 });
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export error: ${err.message}`);
      setExportProgress({ isExporting: false, progress: 0 });
    }
  };

  const handleCancelExport = () => {
    exportService.cancel();
    setExportProgress({ isExporting: false, progress: 0 });
  };

  const handleOpenFolder = () => {
    if (exportedFilePath) {
      storageService.openInFolder(exportedFilePath);
    }
  };

  return (
    <Dialog
      isOpen={isExportModalOpen}
      onClose={() => !exportProgress.isExporting && setIsExportModalOpen(false)}
      title="Export Video"
      description="Composite your screen recording with backgrounds, mockup frame, and smooth cursor zooms."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* If completed */}
        {exportedFilePath ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-emerald/20 text-accent-emerald flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Video Exported Successfully!</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm truncate">
                Saved to: {exportedFilePath}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="secondary" size="md" onClick={handleOpenFolder}>
                <FolderOpen className="w-4 h-4 mr-1.5" />
                Show in Folder
              </Button>
              <Button
                variant="gradient"
                size="md"
                onClick={() => setIsExportModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : exportProgress.isExporting ? (
          /* Export in Progress view */
          <div className="space-y-5 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent-purple" />
                Compositing & Rendering Video...
              </span>
              <span className="font-mono font-bold text-accent-sky text-sm">
                {exportProgress.progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-card-border p-0.5">
              <div
                style={{ width: `${exportProgress.progress}%` }}
                className="h-full bg-gradient-to-r from-accent-purple to-accent-sky rounded-full transition-all duration-150"
              />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-secondary p-2.5 rounded-xl border border-card-border">
                <div className="text-[10px] text-text-subtle">Frame</div>
                <div className="font-mono font-semibold text-white mt-0.5">
                  {exportProgress.currentFrame} / {exportProgress.totalFrames}
                </div>
              </div>
              <div className="bg-secondary p-2.5 rounded-xl border border-card-border">
                <div className="text-[10px] text-text-subtle">Speed</div>
                <div className="font-mono font-semibold text-accent-purple mt-0.5">
                  {exportProgress.fps} fps
                </div>
              </div>
              <div className="bg-secondary p-2.5 rounded-xl border border-card-border">
                <div className="text-[10px] text-text-subtle">Time Remaining</div>
                <div className="font-mono font-semibold text-accent-sky mt-0.5">
                  {exportProgress.timeRemaining}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="danger" size="sm" onClick={handleCancelExport}>
                Cancel Export
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Export Configuration Form */
          <div className="space-y-5">
            {/* Resolution Selector */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Resolution</label>
              <div className="grid grid-cols-4 gap-2">
                {(['720p', '1080p', '1440p', '4k'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setExportSettings({ resolution: res })}
                    className={clsx(
                      'py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all',
                      exportSettings.resolution === res
                        ? 'border-accent-purple bg-accent-purple/15 text-white ring-1 ring-accent-purple'
                        : 'border-card-border text-text-muted hover:bg-secondary'
                    )}
                  >
                    {res.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Frame Rate</label>
              <div className="grid grid-cols-2 gap-2">
                {([30, 60] as const).map((fps) => (
                  <button
                    key={fps}
                    onClick={() => setExportSettings({ frameRate: fps })}
                    className={clsx(
                      'py-2 rounded-xl text-xs font-medium border text-center transition-all',
                      exportSettings.frameRate === fps
                        ? 'border-accent-purple bg-accent-purple/15 text-white ring-1 ring-accent-purple'
                        : 'border-card-border text-text-muted hover:bg-secondary'
                    )}
                  >
                    {fps} FPS (Smooth)
                  </button>
                ))}
              </div>
            </div>

            {/* Video Format (MP4 or WebM) */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                {(['mp4', 'webm'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportSettings({ format: fmt })}
                    className={clsx(
                      'py-2 rounded-xl text-xs font-medium border text-center transition-all uppercase',
                      exportSettings.format === fmt
                        ? 'border-accent-purple bg-accent-purple/15 text-white ring-1 ring-accent-purple'
                        : 'border-card-border text-text-muted hover:bg-secondary'
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* File Name */}
            <div>
              <label className="text-xs font-semibold text-white block mb-1.5">File Name</label>
              <input
                type="text"
                value={exportSettings.fileName}
                onChange={(e) => setExportSettings({ fileName: e.target.value })}
                className="w-full bg-secondary border border-card-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-card-border/60">
              <span className="text-[11px] text-text-subtle">
                Post-processed with FFmpeg compositing
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setIsExportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleStartExport}
                  className="shadow-glow-purple font-semibold px-5"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Render & Export
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
