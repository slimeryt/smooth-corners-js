import { createEffect, onCleanup, onMount, type Accessor } from 'solid-js';
import { applySmoothCorners, enableAutoSmoothCorners } from 'smooth-corners-js';

export type SmoothCornersOptions = { radius: number; smoothing?: number; pill?: boolean };

export function smoothCorners(element: HTMLElement, options: Accessor<SmoothCornersOptions>) {
  createEffect(() => {
    const stop = applySmoothCorners(element, options());
    onCleanup(stop);
  });
}

export function useAutoSmoothCorners(options?: { smoothing?: number; minRadius?: number; pills?: boolean }) {
  onMount(() => {
    const stop = enableAutoSmoothCorners(options);
    onCleanup(stop);
  });
}

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      smoothCorners: SmoothCornersOptions;
    }
  }
}

export { applySmoothCorners, enableAutoSmoothCorners, createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';
