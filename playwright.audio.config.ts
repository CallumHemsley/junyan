import { defineConfig, devices } from "@playwright/test";
import base, { devURL } from "./playwright.config";

export default defineConfig({
  testDir: "./e2e", workers: 1, timeout: 90000,
  expect: { timeout: 10000 },
  outputDir: "output/playwright/audio-results",
  use: { baseURL: devURL, trace: "retain-on-failure", launchOptions: { args: ["--mute-audio"] } },
  projects: [
    { name: "audio-webkit", testMatch: ["audio.spec.ts", "overnight-audio.spec.ts"], use: { ...devices["iPhone 13"], browserName: "webkit", launchOptions: { args: [] } } },
    {
      name: "audio-chromium", testMatch: ["audio.spec.ts", "overnight-audio.spec.ts"],
      use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--mute-audio", "--autoplay-policy=user-gesture-required"] } },
    },
    {
      name: "audio-desktop-journey", testMatch: ["waiter.spec.ts", "offline.spec.ts", "overlay-focus.spec.ts", "save.spec.ts", "learning-help.spec.ts"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 }, launchOptions: { args: ["--mute-audio"] } },
    },
    {
      name: "audio-phone-journey", testMatch: ["waiter.spec.ts", "overlay-focus.spec.ts", "save.spec.ts", "learning-help.spec.ts"],
      use: { ...devices["iPhone 13"], browserName: "chromium", launchOptions: { args: ["--mute-audio"] } },
    },
  ],
  webServer: base.webServer,
});
