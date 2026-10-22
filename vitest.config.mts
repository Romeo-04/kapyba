import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": import.meta.dirname } },
  test: { include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"] },
});
