import { defineConfig, devices } from "@playwright/test";

if (!process.env.JUNYAN_PROOF_DIR || !process.env.JUNYAN_PROOF_URL) {
  throw new Error("Run verify.mjs drive after launch and doctor");
}

export default defineConfig({
  testDir: ".",
  testMatch: "proof.spec.ts",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: `${process.env.JUNYAN_PROOF_DIR}/results`,
  reporter: [["list"], ["json", { outputFile: `${process.env.JUNYAN_PROOF_DIR}/results.json` }]],
  use: {
    baseURL: process.env.JUNYAN_PROOF_URL,
    launchOptions: { args: ["--mute-audio"] },
    trace: "on",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "phone", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
});
