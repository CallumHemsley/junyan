import {fileURLToPath} from 'node:url';
import {defineConfig, devices} from '@playwright/test';
const evidence = fileURLToPath(new URL('../../../evidence/0070/', import.meta.url));
export default defineConfig({
  testDir: '../../../e2e', testMatch: 'garden.spec.ts', fullyParallel: false, workers: 1,
  timeout: 60000, expect: {timeout: 10000}, outputDir: `${evidence}/browser-results`,
  reporter: [['list'], ['json', {outputFile: `${evidence}/browser-results.json`}]],
  use: {baseURL: 'http://127.0.0.1:5470', launchOptions: {executablePath: process.env.JUNYAN_CHROMIUM_EXECUTABLE, args: ['--mute-audio']}, trace: 'retain-on-failure', serviceWorkers: 'block'},
  projects: [
    {name: 'garden-desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1440, height: 1000}}},
    {name: 'garden-phone', use: {...devices['iPhone 13'], defaultBrowserType: 'chromium'}},
  ],
});
