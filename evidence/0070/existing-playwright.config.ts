import {fileURLToPath} from 'node:url';
import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir: '../../e2e', testMatch: 'waiter.spec.ts', workers: 1, timeout: 90000,
  outputDir: './existing-results', reporter: [['list'], ['json', {outputFile: fileURLToPath(new URL('./existing-results.json', import.meta.url))}]],
  use: {baseURL: 'http://127.0.0.1:5470', launchOptions: {executablePath: process.env.JUNYAN_CHROMIUM_EXECUTABLE, args: ['--mute-audio']}, trace: 'retain-on-failure'},
  projects: [{name: 'existing-desktop', use: {...devices['Desktop Chrome'], viewport: {width:1440, height:1000}}}, {name: 'existing-phone', use: {...devices['iPhone 13'], defaultBrowserType: 'chromium'}}],
});
