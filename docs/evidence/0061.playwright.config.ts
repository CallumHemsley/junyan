import { fileURLToPath } from "node:url";
import base, { devPort, previewPort } from "../../playwright.config";

if (devPort !== 5404 || previewPort !== 5405)
  throw new Error("Ticket 0061 requires JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405");
const root = fileURLToPath(new URL("../../", import.meta.url));
export default {
  ...base,
  testDir: `${root}e2e`,
  outputDir: `${root}output/playwright/0061/results`,
  use: {
    ...base.use,
    video: "off" as const,
    reducedMotion: process.env.JUNYAN_REDUCED_MOTION === "reduce" ? "reduce" as const : "no-preference" as const,
    launchOptions: {
      args: ["--mute-audio"],
      ...(process.env.JUNYAN_CHROMIUM ? { executablePath: process.env.JUNYAN_CHROMIUM } : {}),
    },
  },
  webServer: base.webServer.map(server => ({ ...server, cwd: root })),
};
