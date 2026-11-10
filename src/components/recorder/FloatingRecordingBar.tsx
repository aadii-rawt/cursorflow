import React, { useState, useRef } from 'react';
import { Pause, Play, Square, Mic, MicOff, Camera, Video, GripVertical } from 'lucide-react';
import { useRecordingStore } from '../../store/recording.store';
import { useScreenRecording } from '../../hooks/useScreenRecording';
import { formatTime } from '../../utils/formatTime';
import clsx from 'clsx';

export const FloatingRecordingBar: React.FC = () => {
  const { status, elapsedSeconds, options } = useRecordingStore();
  const { pauseRecording, resumeRecording, stopRecording } = useScreenRecording();

  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0 });

  if (status !== 'recording' && status !== 'paused') {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.startPosX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.startPosY + dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className={clsx(
        'fixed z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/95 border border-card-border/80 shadow-2xl backdrop-blur-xl select-none transition-shadow',
        isDragging && 'shadow-glow-purple border-accent-purple/50'
      )}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="cursor-grab active:cursor-grabbing text-text-subtle hover:text-text-primary p-0.5"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Red Recording status indicator */}
      <div className="flex items-center gap-2 pr-2 border-r border-card-border/60">
        <div className="relative flex items-center justify-center">
          <span
            className={clsx(
              'w-2.5 h-2.5 rounded-full',
              status === 'recording' ? 'bg-accent-rose animate-ping absolute' : 'bg-accent-amber'
            )}
          />
          <span
            className={clsx(
              'w-2.5 h-2.5 rounded-full relative',
              status === 'recording' ? 'bg-accent-rose' : 'bg-accent-amber'
            )}
          />
        </div>
        <span className="font-mono text-sm font-semibold text-white tracking-wider">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Device Statuses */}
      <div className="flex items-center gap-2 text-text-muted pr-2 border-r border-card-border/60">
        <div
          title={options.includeMic ? 'Mic Active' : 'Mic Muted'}
          className={clsx(
            'p-1.5 rounded-lg text-xs',
            options.includeMic ? 'text-accent-sky bg-accent-sky/10' : 'text-text-subtle'
          )}
        >
          {options.includeMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </div>

        <div
          title={options.includeCamera ? 'Camera Active' : 'Camera Off'}
          className={clsx(
            'p-1.5 rounded-lg text-xs',
            options.includeCamera ? 'text-accent-purple bg-accent-purple/10' : 'text-text-subtle'
          )}
        >
          {options.includeCamera ? <Camera className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5">
        {status === 'recording' ? (
          <button
            onClick={pauseRecording}
            title="Pause Recording"
            className="p-2 rounded-xl bg-secondary hover:bg-card-hover text-text-primary hover:text-white transition-colors border border-card-border"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={resumeRecording}
            title="Resume Recording"
            className="p-2 rounded-xl bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple hover:text-white transition-colors border border-accent-purple/40"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}

        <button
          onClick={stopRecording}
          title="Stop & Save Recording"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-rose hover:bg-accent-rose/90 text-white font-medium text-xs shadow-md shadow-accent-rose/25 transition-transform active:scale-95"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Finish</span>
        </button>
      </div>
    </div>
  );
};
