import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './src/shuffle.ts',
  format: 'esm',
  target: ['node24', 'es2024'],
  outDir: './dist',
  sourcemap: true,
  dts: true,
  exports: true,
});
