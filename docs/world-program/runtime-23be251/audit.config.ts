import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'audit.spec.ts',outputDir:'/tmp/junyan-audit-23be-results',use:{baseURL:'http://localhost:5495/junyan/',browserName:'chromium',launchOptions:{executablePath:'/usr/bin/chromium'},viewport:{width:1440,height:1000}},reporter:'list',timeout:60000});
