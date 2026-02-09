import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: isCi,
    },
  },
});
