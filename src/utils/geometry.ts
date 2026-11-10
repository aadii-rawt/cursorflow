/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Ease in out cubic for cinema-grade smooth camera transitions
 */
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates camera pan offset given a zoom scale and target focus point (normalized 0..1).
 * Clamps viewport so camera never exposes black area outside bounds.
 */
export function computeCameraTransform(
  targetX: number,
  targetY: number,
  scale: number
): { originX: number; originY: number; translateXPercent: number; translateYPercent: number } {
  if (scale <= 1) {
    return {
      originX: 50,
      originY: 50,
      translateXPercent: 0,
      translateYPercent: 0
    };
  }

  // Margin threshold so cursor isn't glued to the exact edge
  const halfVisibleWidth = 0.5 / scale;
  const halfVisibleHeight = 0.5 / scale;

  const clampedX = clamp(targetX, halfVisibleWidth, 1 - halfVisibleWidth);
  const clampedY = clamp(targetY, halfVisibleHeight, 1 - halfVisibleHeight);

  // Normalized origin in percent
  const originX = clampedX * 100;
  const originY = clampedY * 100;

  // Translation offset in percentage
  const translateXPercent = (0.5 - clampedX) * (scale - 1) * 100;
  const translateYPercent = (0.5 - clampedY) * (scale - 1) * 100;

  return {
    originX,
    originY,
    translateXPercent,
    translateYPercent
  };
}
