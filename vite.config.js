import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const fromRoot = path => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  build: {
    // The large visualization chunks are intentionally lazy; the separate
    // build-budget check limits only code required for initial page startup.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: {
        home: fromRoot('./index.html'),
        projectileMotion: fromRoot('./tutorials/projectile-motion/index.html'),
        graphs2d: fromRoot('./tutorials/2d-graphs/index.html')
      }
    }
  }
});
