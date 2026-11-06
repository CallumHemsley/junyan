import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'audit.spec.ts',workers:1,timeout:120000,use:{baseURL:'http://127.0.0.1:5497/junyan/',launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']},viewport:{width:390,height:664}},reporter:'list',outputDir:'/tmp/junyan-0090-e02-results'});
