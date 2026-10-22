import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": import.meta.dirname } },
  test: {
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    // Each database test file starts its own in-process Postgres (WASM). Many at once crash workers on Windows.
    maxWorkers: 2,
  },
});
