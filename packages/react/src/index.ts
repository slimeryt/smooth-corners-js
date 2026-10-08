import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, type ElementType, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { applySmoothCorners, enableAutoSmoothCorners } from 'smooth-corners-js';

export type SmoothCornersOptions = { radius: number; smoothing?: number };

export function useSmoothCorners<T extends HTMLElement>(ref: RefObject<T | null>, options: SmoothCornersOptions) {
  const { radius, smoothing } = options;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return applySmoothCorners(element, { radius, smoothing });
  }, [ref, radius, smoothing]);
}

export type SmoothCornersProps = HTMLAttributes<HTMLElement> & SmoothCornersOptions & { as?: ElementType; children?: ReactNode };

export const SmoothCorners = forwardRef<HTMLElement, SmoothCornersProps>(function SmoothCorners({ radius, smoothing, as = 'div', children, ...rest }, forwardedRef) {
  const inner = useRef<HTMLElement>(null);
  useImperativeHandle(forwardedRef, () => inner.current as HTMLElement);
  useSmoothCorners(inner, { radius, smoothing });
  return createElement(as, { ...rest, ref: inner }, children);
});

export type AutoSmoothCornersProps = { smoothing?: number; minRadius?: number };

export function AutoSmoothCorners({ smoothing, minRadius }: AutoSmoothCornersProps) {
  useEffect(() => enableAutoSmoothCorners({ smoothing, minRadius }), [smoothing, minRadius]);
  return null;
}

export { applySmoothCorners, enableAutoSmoothCorners, createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';
