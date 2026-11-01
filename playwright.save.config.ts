import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 10000 },
  projects: config.projects,
  testMatch: ["**/save.spec.ts", "**/waiter.spec.ts"],
  use: {
    ...config.use,
    baseURL: "http://127.0.0.1:5184",
    launchOptions: { args: ["--mute-audio"] },
  },
  webServer: {
    command: "VITE_PORT=5184 pnpm dev",
    url: "http://127.0.0.1:5184",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
