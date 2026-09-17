import { defaultExclude, defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    // Playwright specs live alongside the package but run under `yarn test:e2e`.
    exclude: [...defaultExclude, '**/visual/**'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
  },
});
