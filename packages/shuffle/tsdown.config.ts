import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './src/shuffle.js',
  format: 'esm',
  outDir: './dist',
  sourcemap: true,
  dts: true,
  exports: true,
});
