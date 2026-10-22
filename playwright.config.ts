import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100" },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run build && npx next start -p 3100", url: "http://127.0.0.1:3100/api/health", timeout: 180_000, reuseExistingServer: !process.env.CI },
});
