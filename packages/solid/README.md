# smooth-corners-solid

Smooth corners for SolidJS, built on [smooth-corners-js](https://www.npmjs.com/package/smooth-corners-js).

```bash
npm install smooth-corners-solid
```

## Directive

```tsx
import { smoothCorners } from 'smooth-corners-solid';

false && smoothCorners;

export function Card() {
  return <div use:smoothCorners={{ radius: 24, smoothing: 0.6 }}>Hello</div>;
}
```

The `false && smoothCorners` line stops your bundler from removing the import, as Solid directives require. The options can be a signal read, so the corners follow it.

## Whole app

```tsx
import { useAutoSmoothCorners } from 'smooth-corners-solid';

export default function App() {
  useAutoSmoothCorners({ smoothing: 0.6 });
  return <Routes />;
}
```

Everything from smooth-corners-js is re-exported.

MIT
