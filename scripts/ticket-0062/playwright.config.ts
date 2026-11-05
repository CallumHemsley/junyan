import { defineConfig } from '@playwright/test';
import base from '../../playwright.config';
export default defineConfig({
  ...base,
  testDir: '../../e2e',
  testMatch: ['waiter.spec.ts', 'offline.spec.ts'],
  testIgnore: [],
  outputDir: '../../output/0062-browser',
  webServer: (Array.isArray(base.webServer) ? base.webServer : [base.webServer!]).map(server => ({ ...server, command: server.command.replaceAll('pnpm ', 'pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false '), cwd: new URL('../../', import.meta.url).pathname })),
  use: { ...base.use, launchOptions: { ...base.use?.launchOptions, ...(process.env.JUNYAN_CHROMIUM_PATH ? { executablePath: process.env.JUNYAN_CHROMIUM_PATH } : {}) }, video: 'on' },
  projects: base.projects!.flatMap(project => [
    project,
    { ...project, name: `${project.name}-reduced`, use: { ...project.use, reducedMotion: 'reduce' as const } },
  ]),
});
