import React from 'react';
import { Sparkles, Trash2, Sliders, Info, Eye, Clock, Layers } from 'lucide-react';
import { useEditorStore } from '../../store/editor.store';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { formatTime } from '../../utils/formatTime';

export const RightSidebar: React.FC = () => {
  const {
    selectedKeyframeId,
    zoomKeyframes,
    updateZoomKeyframe,
    deleteZoomKeyframe,
    project,
    cursorEvents,
    duration,
    cursorSettings
  } = useEditorStore();

  const selectedKeyframe = zoomKeyframes.find((k) => k.id === selectedKeyframeId);

  return (
    <aside className="w-72 border-l border-card-border/80 bg-card/60 backdrop-blur-md flex flex-col h-full select-none">
      <div className="h-12 border-b border-card-border/60 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent-purple" />
          <span className="text-xs font-semibold text-text-primary">
            {selectedKeyframe ? 'Zoom Keyframe Properties' : 'Project Inspector'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedKeyframe ? (
          <div className="space-y-5">
            {/* Active Keyframe Info */}
            <div className="p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-accent-purple flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Active Zoom Event
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  {formatTime(selectedKeyframe.timestamp / 1000, true)}
                </span>
              </div>
            </div>

            {/* Zoom Scale */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">
                Zoom Scale: {selectedKeyframe.scale}x
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[1.25, 1.5, 2.0, 2.5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => updateZoomKeyframe(selectedKeyframe.id, { scale: lvl })}
                    className={`py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      selectedKeyframe.scale === lvl
                        ? 'bg-accent-purple text-white border-accent-purple shadow-sm'
                        : 'border-card-border text-text-muted hover:bg-secondary'
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Duration */}
            <Slider
              label="Active Duration"
              min={600}
              max={5000}
              step={100}
              unit="ms"
              value={selectedKeyframe.duration}
              onChange={(val) => updateZoomKeyframe(selectedKeyframe.id, { duration: val })}
            />

            {/* Transition Speed */}
            <Slider
              label="Camera Transition"
              min={200}
              max={1000}
              step={50}
              unit="ms"
              value={selectedKeyframe.transitionDuration || 400}
              onChange={(val) =>
                updateZoomKeyframe(selectedKeyframe.id, { transitionDuration: val })
              }
            />

            {/* Focus Target (X, Y) */}
            <div className="pt-2 border-t border-card-border/60">
              <span className="text-xs font-semibold text-white block mb-2">Focus Coordinates</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-text-muted">
                <div className="p-2 bg-secondary rounded-lg border border-card-border">
                  X: {Math.round(selectedKeyframe.targetX * 100)}%
                </div>
                <div className="p-2 bg-secondary rounded-lg border border-card-border">
                  Y: {Math.round(selectedKeyframe.targetY * 100)}%
                </div>
              </div>
            </div>

            {/* Delete Zoom Event */}
            <div className="pt-4 border-t border-card-border/60">
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteZoomKeyframe(selectedKeyframe.id)}
                className="w-full text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove Zoom Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-card-border/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Video Duration</span>
                <span className="font-mono text-white font-medium">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Recorded Cursor Events</span>
                <span className="font-mono text-white font-medium">{cursorEvents.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Active Zoom Keyframes</span>
                <span className="font-mono text-accent-purple font-medium">
                  {zoomKeyframes.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Default Camera Zoom</span>
                <span className="font-mono text-accent-sky font-medium">
                  {cursorSettings.defaultZoomLevel}x
                </span>
              </div>
            </div>

            <div className="text-xs text-text-subtle p-3 rounded-xl border border-dashed border-card-border flex items-start gap-2">
              <Info className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
              <span>
                Click any zoom marker on the timeline to customize its scale, duration, and easing.
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
