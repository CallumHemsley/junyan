import config from '../../playwright.config';
export default {
  ...config, testDir: '../../e2e', testMatch: 'waiter.spec.ts', outputDir: './baseline-results',
  use: { ...config.use, launchOptions: { ...config.use?.launchOptions, executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--mute-audio'] } },
  webServer: config.webServer.map((server, index) => ({ ...server, cwd: '/workspace/junyan-repairs', reuseExistingServer: index === 0 })),
};
