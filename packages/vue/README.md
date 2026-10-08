# smooth-corners-vue

Smooth corners for Vue 3, built on [smooth-corners-js](https://www.npmjs.com/package/smooth-corners-js).

```bash
npm install smooth-corners-vue
```

## Plugin and directive

```ts
import { createApp } from 'vue';
import { SmoothCornersPlugin } from 'smooth-corners-vue';
import App from './App.vue';

createApp(App).use(SmoothCornersPlugin).mount('#app');
```

```vue
<template>
  <div v-smooth-corners="{ radius: 24, smoothing: 0.6 }">Hello</div>
</template>
```

To smooth every element that has a `border-radius`, pass `auto`:

```ts
app.use(SmoothCornersPlugin, { auto: true, smoothing: 0.6 });
```

## Composable

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useSmoothCorners } from 'smooth-corners-vue';

const el = ref<HTMLElement | null>(null);
useSmoothCorners(el, () => ({ radius: 32 }));
</script>

<template>
  <div ref="el">Hello</div>
</template>
```

You can also import the directive directly: `import { vSmoothCorners } from 'smooth-corners-vue'`. Everything from smooth-corners-js is re-exported.

MIT
