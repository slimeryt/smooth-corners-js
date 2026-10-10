import { applySmoothCorners } from 'smooth-corners-js';

export type SmoothCornersOptions = { radius: number; smoothing?: number; pill?: boolean };

export function smoothCorners(node: HTMLElement, options: SmoothCornersOptions) {
  let stop = applySmoothCorners(node, options);
  return {
    update(next: SmoothCornersOptions) {
      stop();
      stop = applySmoothCorners(node, next);
    },
    destroy() {
      stop();
    },
  };
}

export { applySmoothCorners, enableAutoSmoothCorners, createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';
