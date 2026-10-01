import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig[] = defineConfig([
  {
    entry: './src/shuffle.ts',
    format: 'esm',
    target: ['node24', 'es2024'],
    outDir: './dist',
    // TODO: turn off sourcemaps in the next major version.
    // https://e18e.dev/blog/source-maps-or-not.html
    sourcemap: true,
    dts: true,
  },
  {
    entry: './src/shuffle-lanes.ts',
    format: 'esm',
    target: ['node24', 'es2024'],
    outDir: './dist',
    sourcemap: false,
    dts: true,
    copy: [
      { from: './src/shuffle-lanes.css', to: './dist' },
      { from: './src/shuffle-lanes.css.d.ts', to: './dist' },
    ],
  },
]);

export default config;
