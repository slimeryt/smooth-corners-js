import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, type ElementType, type HTMLAttributes, type ReactNode, type RefObject } from 'react';
import { applySmoothCorners, enableAutoSmoothCorners } from 'smooth-corners-js';

export type SmoothCornersOptions = { radius: number; smoothing?: number; pill?: boolean };

export function useSmoothCorners<T extends HTMLElement>(ref: RefObject<T | null>, options: SmoothCornersOptions) {
  const { radius, smoothing, pill } = options;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return applySmoothCorners(element, { radius, smoothing, pill });
  }, [ref, radius, smoothing, pill]);
}

export type SmoothCornersProps = HTMLAttributes<HTMLElement> & SmoothCornersOptions & { as?: ElementType; children?: ReactNode };

export const SmoothCorners = forwardRef<HTMLElement, SmoothCornersProps>(function SmoothCorners({ radius, smoothing, pill, as = 'div', children, ...rest }, forwardedRef) {
  const inner = useRef<HTMLElement>(null);
  useImperativeHandle(forwardedRef, () => inner.current as HTMLElement);
  useSmoothCorners(inner, { radius, smoothing, pill });
  return createElement(as, { ...rest, ref: inner }, children);
});

export type AutoSmoothCornersProps = { smoothing?: number; minRadius?: number; pills?: boolean };

export function AutoSmoothCorners({ smoothing, minRadius, pills }: AutoSmoothCornersProps) {
  useEffect(() => enableAutoSmoothCorners({ smoothing, minRadius, pills }), [smoothing, minRadius, pills]);
  return null;
}

export { applySmoothCorners, enableAutoSmoothCorners, createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';
