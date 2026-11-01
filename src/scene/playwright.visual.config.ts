import {fileURLToPath} from 'node:url';
import {defineConfig} from '@playwright/test';
import original from '../../playwright.config';

const cwd=fileURLToPath(new URL('../..',import.meta.url));

export default defineConfig({
  ...original,
  testDir:'../..',
  testMatch:['e2e/waiter.spec.ts','src/scene/renderer.visual.pw.ts'],
  use:{...original.use,baseURL:'http://127.0.0.1:5182',launchOptions:{args:['--mute-audio']}},
  webServer:[
    {cwd,command:'pnpm dev --host 127.0.0.1 --port 5182 --strictPort',url:'http://127.0.0.1:5182',reuseExistingServer:false},
    {cwd,command:'pnpm build && pnpm exec vite preview --base /junyan/ --host 127.0.0.1 --port 5186 --strictPort',url:'http://127.0.0.1:5186/junyan/',reuseExistingServer:false},
  ],
});
