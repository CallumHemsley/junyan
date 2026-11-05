import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../../e2e', testMatch: 'repairs.spec.ts', workers: 1, fullyParallel: false,
  timeout: 60000, outputDir: './browser-results',
  use: { baseURL: 'http://127.0.0.1:5469', launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--mute-audio'] }, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'small-phone', use: { viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
