import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = defineConfig({
  testDir: './visual',
  fullyParallel: true,
  reporter: 'list',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:20023',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: {
    command: 'node ./visual/server.ts',
    port: 20_023,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    { name: 'chromium' },
    // Same specs against the no-View-Transition fallback path: the API is
    // removed before navigation, so every transition commits instantly.
    // Baselines are shared on purpose — settled end states must be identical.
    { name: 'no-vt' },
    // Same specs under forced reduced motion: updates must complete with
    // effectively no visible animation, i.e. identical settled end states.
    { name: 'reduced', use: { contextOptions: { reducedMotion: 'reduce' } } },
  ],
});

export default config;
