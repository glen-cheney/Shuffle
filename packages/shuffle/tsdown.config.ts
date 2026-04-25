import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig[] = defineConfig([
  {
    entry: './src/shuffle.ts',
    format: 'esm',
    target: ['node24', 'es2024'],
    outDir: './dist',
    sourcemap: true,
    dts: true,
  },
  {
    entry: './src/shuffle-lanes.ts',
    format: 'esm',
    target: ['node24', 'es2024'],
    outDir: './dist',
    sourcemap: true,
    dts: true,
  },
]);

export default config;
