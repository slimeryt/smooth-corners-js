# smooth-corners-element

A `<smooth-corners>` web component, built on [smooth-corners-js](https://www.npmjs.com/package/smooth-corners-js). It works in plain HTML and in any framework.

```bash
npm install smooth-corners-element
```

## Use it

```html
<script type="module">
  import 'smooth-corners-element/define';
</script>

<smooth-corners radius="24" smoothing="0.6" style="background:#0a6cff;color:#fff;padding:24px">
  Hello
</smooth-corners>
```

Change the `radius` or `smoothing` attribute and the corners update. The element is `display: block` unless you set a display yourself.

## Pick another tag name

```ts
import { defineSmoothCorners } from 'smooth-corners-element';

defineSmoothCorners('my-card');
```

Everything from smooth-corners-js is re-exported.

MIT
