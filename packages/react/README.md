# smooth-corners-react

Smooth corners for React, built on [smooth-corners-js](https://www.npmjs.com/package/smooth-corners-js).

```bash
npm install smooth-corners-react
```

## Component

```tsx
import { SmoothCorners } from 'smooth-corners-react';

export function Card() {
  return (
    <SmoothCorners radius={24} smoothing={0.6} className="card">
      Hello
    </SmoothCorners>
  );
}
```

Use `as` to render another element, for example `<SmoothCorners as="button" radius={16}>`. A `ref` gives you the element.

## Hook

```tsx
import { useRef } from 'react';
import { useSmoothCorners } from 'smooth-corners-react';

export function Panel() {
  const ref = useRef<HTMLDivElement>(null);
  useSmoothCorners(ref, { radius: 32 });
  return <div ref={ref} className="panel" />;
}
```

## Whole app

Render this once, near the root, to smooth every element that has a `border-radius`:

```tsx
import { AutoSmoothCorners } from 'smooth-corners-react';

<AutoSmoothCorners smoothing={0.6} />
```

It does nothing on the server and starts in the browser after the first render. Everything from smooth-corners-js is re-exported.

MIT
