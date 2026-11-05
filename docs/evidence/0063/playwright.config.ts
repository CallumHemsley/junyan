import original from "../../../playwright.config";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

process.env.JUNYAN_CHROMIUM = "/usr/bin/chromium";

// Reuse the repository journey, isolated strict ports, system browser, silent audio.
export default defineConfig({
  ...original,
  webServer: (original.webServer as any[]).map(server => ({ ...server, cwd: fileURLToPath(new URL("../../../", import.meta.url)) })),
  testDir: "../../../e2e",
  outputDir: "../../../test-results/0063",
  use: {
    ...original.use,
    video: "off",
    launchOptions: { executablePath: "/usr/bin/chromium", args: ["--mute-audio", "--no-sandbox"] },
  },
});
