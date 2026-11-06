import {fileURLToPath} from 'node:url';
import base from '../../../src/features/garden/playwright.config';
export default {
  ...base,
  testDir: '../../../e2e',
  outputDir: './legacy-results',
  reporter: [['list'], ['json', {outputFile: fileURLToPath(new URL('./legacy-results.json', import.meta.url))}]],
  use: {...base.use, baseURL: 'http://127.0.0.1:5485', launchOptions: {executablePath: '/usr/bin/chromium', args: ['--mute-audio']}},
};
