import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'offline.spec.ts',timeout:180000,workers:1,outputDir:'audit/offline-results',reporter:'list',use:{baseURL:'http://127.0.0.1:5497/junyan/',viewport:{width:390,height:664},launchOptions:{executablePath:'/usr/bin/chromium',args:['--mute-audio']}}});
