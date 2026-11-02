import { defineConfig, devices } from "@playwright/test";

export function verificationPort(value: string | undefined, fallback: number) {
  const port = Number(value ?? fallback);
  if (!Number.isInteger(port) || port < 1024 || port > 65535 || [5173, 5177].includes(port)) {
    throw new Error(`Unsafe verification port: ${value}`);
  }
  return port;
}

export const devPort = verificationPort(process.env.JUNYAN_DEV_PORT, 5200);
export const previewPort = verificationPort(process.env.JUNYAN_PREVIEW_PORT, 5201);
if (devPort === previewPort) throw new Error("Verification ports must differ");
export const devURL = `http://127.0.0.1:${devPort}`;
export const previewURL = `http://127.0.0.1:${previewPort}/junyan/`;
process.env.AUDIO_PREVIEW_URL = previewURL;
process.env.JUNYAN_PREVIEW_URL = previewURL;
process.env.JUNYAN_HELP_PREVIEW_URL = previewURL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 10000 },
  use: {
    baseURL: devURL,
    launchOptions: { args: ["--mute-audio"] },
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "phone",
      testIgnore: "**/offline.spec.ts",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: `pnpm dev --host 127.0.0.1 --port ${devPort} --strictPort`,
      url: devURL,
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command:
        `pnpm build && pnpm exec vite preview --base /junyan/ --host 127.0.0.1 --port ${previewPort} --strictPort`,
      url: previewURL,
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
