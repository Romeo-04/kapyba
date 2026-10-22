import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const MAIL_FILE = join(tmpdir(), "kapyba-e2e-mail.txt");

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100" },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run build && npx next start -p 3100",
        url: "http://127.0.0.1:3100/api/health",
        timeout: 240_000,
        reuseExistingServer: false,
        env: {
          DATABASE_URL: "pglite:memory",
          ALLOW_PGLITE: "1",
          AUTH_SECRET: "e2e-auth-secret-16chars",
          QR_SIGNING_SECRET: "e2e-qr-secret-16chars",
          E2E_MAIL_FILE: MAIL_FILE,
        },
      },
});
