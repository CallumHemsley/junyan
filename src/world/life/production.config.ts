import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: 'production.spec.ts', workers: 1, timeout: 720000,
  outputDir: '../../../output/verification/0087/production/results',
  reporter: [['list'], ['json', { outputFile: 'output/verification/0087/production/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:5489', trace: 'on', video: 'on',
    launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--mute-audio'] } },
  projects: [{ name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }],
});
