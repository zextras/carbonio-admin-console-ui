import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: false,
  bundle: true,
  target: 'node22',
  outDir: 'dist',
  shims: true,
  // Externalize vite and its optional dependencies that can't be bundled
  external: ['vite', 'lightningcss', 'esbuild'],
});
