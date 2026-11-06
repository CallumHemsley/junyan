import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'../../../e2e',testMatch:'waiter.spec.ts',workers:1,timeout:90000,
 outputDir:'../../../output/0085-regression',
 use:{baseURL:'http://127.0.0.1:5487',launchOptions:{executablePath:'/usr/bin/chromium',args:['--mute-audio']},trace:'retain-on-failure'},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},{name:'phone',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
});
