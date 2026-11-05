import { fileURLToPath } from 'node:url';
import config from '../../playwright.config';

const root = fileURLToPath(new URL('../..', import.meta.url));
export default {
  ...config,
  testDir: `${root}/e2e`,
  outputDir: `${root}/evidence/0068/playwright`,
  webServer: config.webServer.map(server => ({ ...server, cwd: root })),
  use: { ...config.use, launchOptions: { executablePath: process.env.JUNYAN_CHROMIUM ?? '/usr/bin/chromium' } },
};
