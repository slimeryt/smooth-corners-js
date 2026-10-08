import { onBeforeUnmount, onMounted, watch, type App, type Directive, type Ref } from 'vue';
import { applySmoothCorners, enableAutoSmoothCorners } from 'smooth-corners-js';

export type SmoothCornersOptions = { radius: number; smoothing?: number };

const stops = new WeakMap<HTMLElement, () => void>();

function release(element: HTMLElement) {
  stops.get(element)?.();
  stops.delete(element);
}

function apply(element: HTMLElement, value: SmoothCornersOptions | undefined) {
  release(element);
  if (value && value.radius > 0) stops.set(element, applySmoothCorners(element, value));
}

export const vSmoothCorners: Directive<HTMLElement, SmoothCornersOptions> = {
  mounted: (element, binding) => apply(element, binding.value),
  updated: (element, binding) => {
    if (binding.value?.radius !== binding.oldValue?.radius || binding.value?.smoothing !== binding.oldValue?.smoothing) apply(element, binding.value);
  },
  unmounted: (element) => release(element),
};

export function useSmoothCorners(target: Ref<HTMLElement | null | undefined>, options: () => SmoothCornersOptions) {
  let stop: (() => void) | undefined;
  const run = () => {
    stop?.();
    stop = undefined;
    const element = target.value;
    if (element) stop = applySmoothCorners(element, options());
  };
  onMounted(run);
  watch(options, run);
  onBeforeUnmount(() => stop?.());
}

export type SmoothCornersPluginOptions = { auto?: boolean; smoothing?: number; minRadius?: number };

export const SmoothCornersPlugin = {
  install(app: App, options: SmoothCornersPluginOptions = {}) {
    app.directive('smooth-corners', vSmoothCorners);
    if (!options.auto || typeof document === 'undefined') return;
    const start = () => enableAutoSmoothCorners({ smoothing: options.smoothing, minRadius: options.minRadius });
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  },
};

export { applySmoothCorners, enableAutoSmoothCorners, createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';
