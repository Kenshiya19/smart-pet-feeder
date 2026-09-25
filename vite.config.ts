```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/smart-pet-feeder/',
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

```

### Now do this

1. Replace your **entire `vite.config.ts`** with the code above.
2. Click **Commit changes**.
3. Wait about **1–2 minutes** for GitHub Actions to deploy again.
4. Open:

[https://kenshiya19.github.io/smart-pet-feeder/](https://kenshiya19.github.io/smart-pet-feeder/)

If it is still blank, **don't change anything else**. Send me the screenshot of **Actions → latest workflow**, and we'll fix the next issue.
