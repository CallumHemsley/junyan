import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'../../../e2e', testMatch: ['apartment.spec.ts','waiter.spec.ts'], workers:1, timeout:180000,
  outputDir:'./results', reporter:[['list'],['json',{outputFile:'results.json'}]],
  use:{baseURL:'http://127.0.0.1:5467', launchOptions:{executablePath:'/usr/bin/chromium',args:['--mute-audio']},trace:'retain-on-failure'},
  projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},{name:'phone',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
  webServer:{command:'node_modules/.bin/vite --host 127.0.0.1 --port 5467 --strictPort',url:'http://127.0.0.1:5467',reuseExistingServer:false,cwd:process.cwd()},
});
