import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

// startup-focus.spec.ts routes every playable WAV through valid silent PCM.
export default defineConfig({
  ...base,
  testMatch: 'startup-focus.spec.ts',
  outputDir: 'output/playwright/recovery-results',
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 }, launchOptions: { args: ['--mute-audio'] } } },
    { name: 'chromium-phone', use: { ...devices['iPhone 13'], browserName: 'chromium', launchOptions: { args: ['--mute-audio'] } } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 1000 } } },
    { name: 'webkit-phone', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
});
