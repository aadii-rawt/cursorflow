import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  Plus,
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useEditorStore } from '../../store/editor.store';
import { formatTime } from '../../utils/formatTime';
import { ZoomKeyframe } from '../../types/cursor.types';
import clsx from 'clsx';

export const Timeline: React.FC = () => {
  const {
    currentTime,
    setCurrentTime,
    duration,
    isPlaying,
    setIsPlaying,
    trim,
    setTrim,
    zoomKeyframes,
    addZoomKeyframe,
    deleteZoomKeyframe,
    selectedKeyframeId,
    setSelectedKeyframeId,
    cursorEvents,
    cursorSettings,
    timelineZoom,
    setTimelineZoom
  } = useEditorStore();

  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Time to pixel conversion
  const effectiveDuration = Math.max(1, duration);
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100));

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineTrackRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.min(1, Math.max(0, clickX / rect.width));
      const targetTime = percent * effectiveDuration;
      setCurrentTime(targetTime);
    },
    [effectiveDuration, setCurrentTime]
  );

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScrubbing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!timelineTrackRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const clickX = moveEvent.clientX - rect.left;
      const percent = Math.min(1, Math.max(0, clickX / rect.width));
      const targetTime = percent * effectiveDuration;
      setCurrentTime(targetTime);
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAddZoomAtPlayhead = () => {
    const currentMs = currentTime * 1000;
    // Find closest cursor event for focus coordinate
    const closestEvent = cursorEvents.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - currentMs) < Math.abs(prev.timestamp - currentMs)
        ? curr
        : prev;
    }, cursorEvents[0] || { x: 0.5, y: 0.5 });

    const newKeyframe: ZoomKeyframe = {
      id: `manual-zoom-${Date.now()}`,
      timestamp: Math.max(0, currentMs - 200),
      duration: 1800,
      scale: cursorSettings.defaultZoomLevel || 1.75,
      targetX: closestEvent.x,
      targetY: closestEvent.y,
      transitionDuration: cursorSettings.zoomTransitionDuration || 400,
      type: 'manual'
    };

    addZoomKeyframe(newKeyframe);
  };

  // Generate ruler markers (e.g., every 1s or 2s)
  const markerStep = effectiveDuration > 30 ? 5 : effectiveDuration > 15 ? 2 : 1;
  const markers = [];
  for (let s = 0; s <= effectiveDuration; s += markerStep) {
    markers.push(s);
  }

  // Filter click events for display on cursor track
  const clickMarkers = cursorEvents.filter(
    (ev) => ev.type === 'click' || ev.type === 'contextmenu'
  );

  return (
    <div className="h-56 bg-card border-t border-card-border/80 flex flex-col select-none z-30">
      {/* Top Toolbar Controls */}
      <div className="h-10 border-b border-card-border/60 px-4 flex items-center justify-between text-xs bg-secondary/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-purple hover:bg-accent-purple/90 text-white font-medium shadow-sm transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <div className="h-4 w-[1px] bg-card-border mx-1" />

          {/* Add Zoom Event at Playhead */}
          <button
            onClick={handleAddZoomAtPlayhead}
            title="Insert Zoom Keyframe at Current Time"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-card-hover border border-card-border text-text-primary hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent-purple" />
            <span>Add Zoom</span>
          </button>

          {/* Trim Actions */}
          <button
            onClick={() => setTrim({ startTime: currentTime })}
            title="Trim video start to current playhead"
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary text-text-muted hover:text-text-primary transition-colors text-[11px]"
          >
            <Scissors className="w-3 h-3 text-accent-sky" />
            <span>Trim Start</span>
          </button>

          <button
            onClick={() => setTrim({ endTime: currentTime })}
            title="Trim video end to current playhead"
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-secondary text-text-muted hover:text-text-primary transition-colors text-[11px]"
          >
            <Scissors className="w-3 h-3 text-accent-rose" />
            <span>Trim End</span>
          </button>
        </div>

        {/* Zoom In/Out on timeline */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-subtle font-mono">
            {formatTime(currentTime)} / {formatTime(effectiveDuration)}
          </span>
          <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-lg border border-card-border">
            <button
              onClick={() => setTimelineZoom(Math.max(1, timelineZoom - 0.25))}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-card transition-colors"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-text-muted">
              {timelineZoom}x
            </span>
            <button
              onClick={() => setTimelineZoom(Math.min(3, timelineZoom + 0.25))}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-card transition-colors"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Track Timeline Stage */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 relative flex flex-col">
        {/* Track Headers (Left Labels) and Tracks Area */}
        <div className="relative flex-1 w-full flex">
          {/* Track Labels Column */}
          <div className="w-24 shrink-0 flex flex-col justify-around pr-3 text-[10px] font-semibold text-text-subtle border-r border-card-border/60">
            <div className="flex items-center gap-1">
              <span>Time</span>
            </div>
            <div className="flex items-center gap-1 text-accent-sky">
              <span>Video</span>
            </div>
            <div className="flex items-center gap-1 text-accent-purple">
              <Sparkles className="w-3 h-3" />
              <span>Zoom</span>
            </div>
            <div className="flex items-center gap-1 text-accent-amber">
              <MousePointer className="w-3 h-3" />
              <span>Clicks</span>
            </div>
          </div>

          {/* Tracks Timeline Body */}
          <div
            ref={timelineTrackRef}
            onClick={handleTimelineClick}
            style={{ width: `${100 * timelineZoom}%` }}
            className="flex-1 relative h-full flex flex-col justify-around px-2 cursor-pointer group"
          >
            {/* 1. Ruler Track */}
            <div className="relative h-5 w-full flex items-center border-b border-card-border/40">
              {markers.map((sec) => {
                const percent = (sec / effectiveDuration) * 100;
                return (
                  <div
                    key={sec}
                    style={{ left: `${percent}%` }}
                    className="absolute top-0 bottom-0 flex flex-col items-start -translate-x-1/2 pointer-events-none"
                  >
                    <div className="w-[1px] h-2 bg-text-subtle/50" />
                    <span className="text-[9px] font-mono text-text-muted mt-0.5">
                      {formatTime(sec)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 2. Video Track with Trim Region */}
            <div className="relative h-6 w-full rounded-md bg-secondary/80 border border-card-border overflow-hidden">
              {/* Active trimmed video bar */}
              <div
                style={{
                  left: `${(trim.startTime / effectiveDuration) * 100}%`,
                  width: `${((trim.endTime - trim.startTime) / effectiveDuration) * 100}%`
                }}
                className="absolute inset-y-0 bg-accent-sky/25 border-x-2 border-accent-sky rounded"
              />
              <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] text-text-muted pointer-events-none">
                <span>Video Stream Track</span>
                <span>{formatTime(trim.endTime - trim.startTime)}</span>
              </div>
            </div>

            {/* 3. Zoom Keyframes Track */}
            <div className="relative h-6 w-full rounded-md bg-secondary/50 border border-card-border/60">
              {zoomKeyframes.map((kf) => {
                const startPercent = (kf.timestamp / (effectiveDuration * 1000)) * 100;
                const widthPercent = (kf.duration / (effectiveDuration * 1000)) * 100;
                const isSelected = selectedKeyframeId === kf.id;

                return (
                  <div
                    key={kf.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKeyframeId(kf.id);
                    }}
                    style={{
                      left: `${startPercent}%`,
                      width: `${Math.max(2, widthPercent)}%`
                    }}
                    className={clsx(
                      'absolute inset-y-0.5 rounded flex items-center px-2 cursor-pointer transition-all border text-[10px] font-mono',
                      isSelected
                        ? 'bg-accent-purple text-white border-white shadow-glow-purple z-10'
                        : 'bg-accent-purple/30 text-accent-purple hover:bg-accent-purple/50 border-accent-purple/60'
                    )}
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-1 shrink-0" />
                    <span className="truncate">{kf.scale}x</span>
                  </div>
                );
              })}
            </div>

            {/* 4. Mouse Clicks Track */}
            <div className="relative h-4 w-full flex items-center">
              {clickMarkers.map((ev, idx) => {
                const percent = (ev.timestamp / (effectiveDuration * 1000)) * 100;
                return (
                  <div
                    key={idx}
                    style={{ left: `${percent}%` }}
                    title={`Click at ${formatTime(ev.timestamp / 1000, true)}`}
                    className="absolute -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-accent-amber border border-black shadow-sm"
                  />
                );
              })}
            </div>

            {/* Scrubbing Playhead */}
            <div
              style={{ left: `${playheadPercent}%` }}
              onMouseDown={handlePlayheadMouseDown}
              className="absolute top-0 bottom-0 w-[2px] bg-accent-rose z-20 pointer-events-auto cursor-ew-resize group/playhead"
            >
              {/* Playhead handle indicator */}
              <div className="w-4 h-4 rounded-full bg-accent-rose text-white -translate-x-[7px] -translate-y-1 shadow-md flex items-center justify-center transform group-hover/playhead:scale-110 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
