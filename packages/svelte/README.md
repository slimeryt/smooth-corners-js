# smooth-corners-svelte

Smooth corners for Svelte, built on [smooth-corners-js](https://www.npmjs.com/package/smooth-corners-js). It is a plain `use:` action, so it works in Svelte 3, 4 and 5.

```bash
npm install smooth-corners-svelte
```

## Action

```svelte
<script>
  import { smoothCorners } from 'smooth-corners-svelte';
</script>

<div use:smoothCorners={{ radius: 24, smoothing: 0.6 }}>Hello</div>
```

Change the options and the corners update. The action cleans up when the element is removed.

## Whole app

In your root layout, smooth every element that has a `border-radius`:

```svelte
<script>
  import { onMount } from 'svelte';
  import { enableAutoSmoothCorners } from 'smooth-corners-svelte';

  onMount(() => enableAutoSmoothCorners({ smoothing: 0.6 }));
</script>
```

Everything from smooth-corners-js is re-exported.

MIT
