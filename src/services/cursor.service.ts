import { CursorEvent, ZoomKeyframe, CursorSettings } from '../types/cursor.types';
import { lerp, easeInOutCubic, computeCameraTransform } from '../utils/geometry';

export interface CursorStateAtTime {
  x: number;
  y: number;
  isClicking: boolean;
  clickProgress: number; // 0 to 1 for ripple animation
  clickType?: 'left' | 'right' | 'middle';
  isIdle: boolean;
  zoomScale: number;
  cameraTransform: {
    originX: number;
    originY: number;
    translateXPercent: number;
    translateYPercent: number;
  };
}

export const cursorService = {
  /**
   * Finds or interpolates cursor position and state at any millisecond timestamp.
   */
  getCursorState(
    timeMs: number,
    events: CursorEvent[],
    zoomKeyframes: ZoomKeyframe[],
    settings: CursorSettings
  ): CursorStateAtTime {
    if (!settings.enabled || events.length === 0) {
      return {
        x: 0.5,
        y: 0.5,
        isClicking: false,
        clickProgress: 0,
        isIdle: true,
        zoomScale: 1,
        cameraTransform: { originX: 50, originY: 50, translateXPercent: 0, translateYPercent: 0 }
      };
    }

    // Binary search for closest events around timeMs
    let low = 0;
    let high = events.length - 1;
    let index = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (events[mid].timestamp <= timeMs) {
        index = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const prev = events[index];
    const next = index < events.length - 1 ? events[index + 1] : prev;

    let x = prev.x;
    let y = prev.y;

    if (next && next !== prev && next.timestamp > prev.timestamp) {
      const alpha = Math.min(1, Math.max(0, (timeMs - prev.timestamp) / (next.timestamp - prev.timestamp)));
      x = lerp(prev.x, next.x, alpha);
      y = lerp(prev.y, next.y, alpha);
    }

    if (settings.offsetX) x += settings.offsetX;
    if (settings.offsetY) y += settings.offsetY;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    // Check for recent clicks (within 600ms) for click ripple animation
    let isClicking = false;
    let clickProgress = 0;
    let clickType: 'left' | 'right' | 'middle' | undefined;

    for (let i = Math.max(0, index - 5); i <= Math.min(events.length - 1, index + 5); i++) {
      const ev = events[i];
      if (ev.type === 'click' || ev.type === 'contextmenu') {
        const diff = timeMs - ev.timestamp;
        if (diff >= 0 && diff <= 600) {
          isClicking = true;
          clickProgress = diff / 600; // 0 (start) to 1 (done)
          clickType = ev.button || (ev.type === 'contextmenu' ? 'right' : 'left');
          break;
        }
      }
    }

    // Calculate Zoom scale & camera focus
    let targetScale = 1.0;
    let targetFocusX = x;
    let targetFocusY = y;

    // Check if within any ZoomKeyframe
    for (const kf of zoomKeyframes) {
      const kfStart = kf.timestamp;
      const kfEnd = kf.timestamp + kf.duration;
      const transTime = kf.transitionDuration || settings.zoomTransitionDuration || 400;

      if (timeMs >= kfStart && timeMs <= kfEnd) {
        // Zoom is active
        targetFocusX = kf.targetX;
        targetFocusY = kf.targetY;

        // Transition in
        if (timeMs - kfStart < transTime) {
          const t = easeInOutCubic((timeMs - kfStart) / transTime);
          targetScale = lerp(1, kf.scale, t);
        }
        // Transition out
        else if (kfEnd - timeMs < transTime) {
          const t = easeInOutCubic((kfEnd - timeMs) / transTime);
          targetScale = lerp(1, kf.scale, t);
        } else {
          targetScale = kf.scale;
        }
        break;
      }
    }

    const cameraTransform = computeCameraTransform(targetFocusX, targetFocusY, targetScale);

    return {
      x,
      y,
      isClicking,
      clickProgress,
      clickType,
      isIdle: prev.type === 'idle',
      zoomScale: targetScale,
      cameraTransform
    };
  }
};
