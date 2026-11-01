import { defineConfig, devices } from "@playwright/test";

process.env.AUDIO_PREVIEW_URL ??= "http://127.0.0.1:5185/junyan/";
process.env.JUNYAN_PREVIEW_URL ??= "http://127.0.0.1:5185/junyan/";

export default defineConfig({
  testDir: "./e2e", workers: 1, timeout: 90000,
  expect: { timeout: 10000 },
  outputDir: "output/playwright/audio-results",
  use: { baseURL: "http://localhost:5181", trace: "retain-on-failure" },
  projects: [
    { name: "audio-webkit", testMatch: "audio.spec.ts", use: { ...devices["iPhone 13"], browserName: "webkit" } },
    {
      name: "audio-chromium", testMatch: "audio.spec.ts",
      use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--mute-audio", "--autoplay-policy=user-gesture-required"] } },
    },
    {
      name: "audio-desktop-journey", testMatch: ["waiter.spec.ts", "offline.spec.ts", "overlay-focus.spec.ts", "save.spec.ts"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 }, launchOptions: { args: ["--mute-audio"] } },
    },
    {
      name: "audio-phone-journey", testMatch: ["waiter.spec.ts", "overlay-focus.spec.ts", "save.spec.ts"],
      use: { ...devices["iPhone 13"], browserName: "chromium", launchOptions: { args: ["--mute-audio"] } },
    },
  ],
  webServer: [
    { command: "pnpm dev --config vite.audio.config.ts --port 5181 --strictPort", url: "http://localhost:5181", reuseExistingServer: true },
    {
      command: "pnpm build && pnpm exec vite preview --config vite.audio.config.ts --base /junyan/ --host 127.0.0.1 --port 5185 --strictPort",
      url: "http://127.0.0.1:5185/junyan/", reuseExistingServer: true,
    },
  ],
});
