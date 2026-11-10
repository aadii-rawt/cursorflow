import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useEditorStore } from '../../store/editor.store';
import { cursorService } from '../../services/cursor.service';
import { formatTime } from '../../utils/formatTime';
import clsx from 'clsx';

export const PreviewCanvas: React.FC = () => {
  const {
    project,
    currentTime,
    setCurrentTime,
    duration,
    isPlaying,
    setIsPlaying,
    background,
    frame,
    cursorSettings,
    cursorEvents,
    zoomKeyframes,
    volume,
    isMuted
  } = useEditorStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Compute cursor state at current playback time
  const cursorState = useMemo(() => {
    return cursorService.getCursorState(
      currentTime * 1000,
      cursorEvents,
      zoomKeyframes,
      cursorSettings
    );
  }, [currentTime, cursorEvents, zoomKeyframes, cursorSettings]);

  // Video element sync with store
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.15) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // Handle Play / Pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(console.warn);

      const updateLoop = () => {
        if (videoRef.current && !videoRef.current.paused) {
          setCurrentTime(videoRef.current.currentTime);
          animationFrameRef.current = requestAnimationFrame(updateLoop);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    } else {
      video.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, setCurrentTime]);

  // Sync volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  // Background style computation
  const backgroundStyle = useMemo(() => {
    if (background.type === 'image' && background.imageUrl) {
      return {
        backgroundImage: `url("${background.imageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    if (background.type === 'solid') {
      return { backgroundColor: background.color };
    }
    return {
      background: `linear-gradient(${background.gradient.angle || 135}deg, ${background.gradient.start}, ${background.gradient.end})`
    };
  }, [background]);

  // Camera Zoom Transform
  const scale = cursorState.zoomScale;
  const { originX, originY, translateXPercent, translateYPercent } = cursorState.cameraTransform;

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden select-none">
      {/* Top Preview Canvas Stage */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-6 relative overflow-hidden"
      >
        {/* Background Canvas Card */}
        <div
          style={{
            ...backgroundStyle,
            padding: `${background.padding}px`
          }}
          className="relative max-w-full max-h-full aspect-video rounded-3xl flex items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Frame Container with Mockup & Shadow */}
          <div
            style={{
              borderRadius: `${frame.cornerRadius}px`,
              boxShadow:
                frame.shadowIntensity > 0
                  ? `0 ${frame.shadowIntensity * 0.4}px ${frame.shadowIntensity * 0.8}px rgba(0, 0, 0, ${frame.shadowIntensity / 100})`
                  : 'none',
              transform: `scale(${frame.scale})`,
              transformOrigin: 'center center'
            }}
            className={clsx(
              'relative flex flex-col overflow-hidden transition-transform duration-200 border border-white/10 bg-[#121318]',
              frame.aspectRatio === '16:9' ? 'aspect-video w-[820px] max-w-full' : 'w-[820px] max-w-full aspect-video'
            )}
          >
            {/* Mockup Header: MacBook Style */}
            {frame.mockup === 'macbook' && (
              <div className="h-8 bg-[#1e2026] px-3.5 flex items-center justify-between border-b border-white/5 shrink-0 z-20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm" />
                </div>
                <div className="text-[11px] font-medium text-text-subtle font-mono">
                  {project?.name || 'Screen Recording'}
                </div>
                <div className="w-12" />
              </div>
            )}

            {/* Mockup Header: Browser Style */}
            {frame.mockup === 'browser' && (
              <div className="h-10 bg-[#1a1c22] px-3 flex items-center gap-3 border-b border-white/5 shrink-0 z-20">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 max-w-xs mx-auto bg-[#242731] h-6 rounded-md px-3 flex items-center text-[10px] text-text-muted border border-white/5 truncate">
                  https://cursorful.studio/recordings/demo
                </div>
              </div>
            )}

            {/* Video Viewport with Smooth Zoom Camera */}
            <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
              {/* Camera Transform Container */}
              <div
                style={{
                  transformOrigin: `${originX}% ${originY}%`,
                  transform: `scale(${scale}) translate(${translateXPercent}%, ${translateYPercent}%)`,
                  transition: `transform ${cursorSettings.zoomTransitionDuration || 400}ms cubic-bezier(0.25, 1, 0.5, 1)`
                }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Real Recorded Video Screen */}
                {project?.videoSrc ? (
                  <video
                    ref={videoRef}
                    src={project.videoSrc}
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // Clean screen placeholder with no watermark or text
                  <div className="w-full h-full bg-[#111216] flex items-center justify-center relative overflow-hidden select-none">
                    <div className="w-full h-full p-8 flex flex-col justify-between">
                      <div className="flex justify-between items-center opacity-60">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-accent-purple/20 flex items-center justify-center text-accent-purple text-xs font-bold">
                            C
                          </div>
                          <span className="text-xs font-medium text-text-primary">Recorded Screen</span>
                        </div>
                      </div>

                      <div className="max-w-md mx-auto w-full grid grid-cols-2 gap-3 opacity-80">
                        <div className="p-4 rounded-xl bg-card border border-card-border/60">
                          <div className="text-xs text-text-muted">Cursor Focus</div>
                          <div className="text-lg font-semibold mt-1 text-accent-sky">Centered</div>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-card-border/60">
                          <div className="text-xs text-text-muted">Dynamic Camera</div>
                          <div className="text-lg font-semibold mt-1 text-accent-purple">Active</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-text-subtle text-center opacity-60">
                        Scratch or play timeline to preview cursor zoom tracking
                      </div>
                    </div>
                  </div>
                )}

                {/* Spotlight Overlay */}
                {cursorSettings.enabled && cursorSettings.spotlightEnabled && scale > 1.05 && (
                  <div
                    style={{
                      background: `radial-gradient(circle at ${cursorState.x * 100}% ${cursorState.y * 100}%, transparent 40px, rgba(0, 0, 0, ${cursorSettings.spotlightOpacity || 0.4}) 160px)`
                    }}
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  />
                )}

                {/* Mouse Click Ripple Indicator */}
                {cursorSettings.enabled &&
                  cursorSettings.clickAnimationEnabled &&
                  cursorState.isClicking && (
                    <div
                      style={{
                        left: `${cursorState.x * 100}%`,
                        top: `${cursorState.y * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className="absolute pointer-events-none"
                    >
                      <span className="block w-12 h-12 rounded-full border-2 border-accent-sky/80 animate-ping" />
                      <span className="block w-6 h-6 rounded-full bg-accent-purple/30 absolute inset-0 m-auto animate-pulse" />
                    </div>
                  )}

                {/* Cursor Highlight Ring */}
                {cursorSettings.enabled && cursorSettings.highlightRingEnabled && (
                  <div
                    style={{
                      left: `${cursorState.x * 100}%`,
                      top: `${cursorState.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      borderColor: cursorSettings.highlightColor || '#8B5CF6'
                    }}
                    className="absolute w-8 h-8 rounded-full border-2 bg-accent-purple/10 pointer-events-none transition-transform duration-75"
                  />
                )}

                {/* Custom Cursor Pointer SVG - only if vector mode enabled or previewing demo without video */}
                {cursorSettings.enabled &&
                  (cursorSettings.cursorPointerMode === 'vector' ||
                    (!project?.videoSrc && cursorSettings.cursorPointerMode !== 'hidden')) && (
                  <div
                    style={{
                      left: `${cursorState.x * 100}%`,
                      top: `${cursorState.y * 100}%`,
                      transform: `scale(${cursorSettings.cursorSize || 1.25}) translate(0, 0)`,
                      transformOrigin: 'top left'
                    }}
                    className="absolute pointer-events-none z-30 transition-transform duration-75 drop-shadow-md"
                  >
                    {cursorSettings.cursorStyle === 'circle' ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-accent-purple border-2 border-white shadow" />
                    ) : (
                      <svg
                        width="20"
                        height="24"
                        viewBox="0 0 16 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L1 17L4.8 13.2L8.8 20L11.2 18.6L7.2 11.8L12.5 11.8L1 1Z"
                          fill={cursorSettings.cursorStyle === 'macos-white' ? '#FFFFFF' : '#111317'}
                          stroke={cursorSettings.cursorStyle === 'macos-white' ? '#111317' : '#FFFFFF'}
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Canvas Quick Playback Toolbar */}
      <div className="h-12 bg-secondary/80 border-t border-card-border/80 px-6 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-card hover:bg-card-hover border border-card-border text-white flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleRestart}
            title="Restart playback"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="font-mono text-text-primary text-[11px] bg-card px-2.5 py-1 rounded-md border border-card-border">
            <span className="text-white font-semibold">{formatTime(currentTime, true)}</span>
            <span className="text-text-subtle mx-1">/</span>
            <span className="text-text-muted">{formatTime(duration, true)}</span>
          </div>
        </div>

        {/* Current Camera Zoom Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-card-border text-[11px]">
            <span className="text-text-subtle">Zoom:</span>
            <span className="font-mono font-semibold text-accent-sky">
              {scale.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
