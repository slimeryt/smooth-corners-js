# smooth-corners-js

Continuous-curvature ("smooth") corners for the web, the same corner shape Figma and iOS use. A normal `border-radius` corner stops at a point where the curve suddenly starts. A smooth corner eases into the curve, which looks softer and more natural.

Zero dependencies, about 10 KB, works with any framework or none.

```bash
npm install smooth-corners-js
```

## Smooth every rounded element

```ts
import { enableAutoSmoothCorners } from 'smooth-corners-js';

const stop = enableAutoSmoothCorners({ smoothing: 0.6 });
```

Call it once after the page has loaded. Every element with a `border-radius` gets smooth corners, including elements added later, and it re-checks on hover, focus and theme changes. Your CSS stays as it is.

| Option | Default | Meaning |
| --- | --- | --- |
| `smoothing` | `0.6` | `0` is a normal circular corner, `1` is the broadest curve |
| `minRadius` | `6` | Elements with a smaller radius are left alone |

Add `data-no-smooth` to an element to skip it and everything inside it.

Backgrounds, borders, ring shadows and soft shadows are redrawn to follow the curve. Elements that cannot be smoothed safely keep their normal rounded corners: circles and pills, percentage radii, dashed or mixed-colour borders, borders over a background image, inset shadows, and elements with a child sitting in a corner.

## Smooth one element

```ts
import { applySmoothCorners } from 'smooth-corners-js';

const stop = applySmoothCorners(document.querySelector('.card')!, { radius: 24, smoothing: 0.6 });
```

This clips the element to the shape and follows its size. It also clips shadows and anything that overflows, so use it for simple elements.

## Get the path yourself

```ts
import { createSmoothCornerPath, createSmoothRectPath } from 'smooth-corners-js';

const d = createSmoothCornerPath(320, 200, { radius: 24, smoothing: 0.6 });

const mixed = createSmoothRectPath(320, 200, { tl: 32, tr: 32, br: 0, bl: 0 }, 0.6);
```

## Notes

- Browser only (it uses `getComputedStyle`, `ResizeObserver` and `MutationObserver`).
- Pages with a strict Content-Security-Policy may block the inline SVG images it paints. Allow `img-src data:`.
- Smoothing makes a corner look a little rounder than the same radius would, so you may want a slightly smaller radius.

MIT
