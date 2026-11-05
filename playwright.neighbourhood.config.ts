import { defineConfig, devices } from "@playwright/test";
import { verificationPort } from "./playwright.config";

const preview = process.env.JUNYAN_NEIGHBOURHOOD_PREVIEW === "1";
const port = verificationPort(preview ? process.env.JUNYAN_PREVIEW_PORT : process.env.JUNYAN_DEV_PORT, preview ? 5566 : 5466);
const baseURL = `http://127.0.0.1:${port}${preview ? "/junyan/" : ""}`;
process.env.AUDIO_PREVIEW_URL = baseURL;
process.env.JUNYAN_PREVIEW_URL = baseURL;
process.env.JUNYAN_HELP_PREVIEW_URL = baseURL;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "output/neighbourhood/results",
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["json", { outputFile: "output/neighbourhood/results.json" }]],
  use: {
    baseURL,
    actionTimeout: 15000,
    launchOptions: {
      executablePath: process.env.JUNYAN_BROWSER_PATH,
      args: ["--mute-audio"],
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "phone", testIgnore: ["**/offline.spec.ts", "**/overnight-offline.spec.ts"], use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: {
    command: `${preview ? "pnpm build && " : ""}node node_modules/vite/bin/vite.js ${preview ? "preview --base /junyan/" : ""} --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
