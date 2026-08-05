import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const fromRoot = path => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: fromRoot('./index.html'),
        projectileMotion: fromRoot('./tutorials/projectile-motion/index.html'),
        graphs2d: fromRoot('./tutorials/2d-graphs/index.html')
      }
    }
  }
});
