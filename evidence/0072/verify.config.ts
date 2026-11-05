import {defineConfig} from '@playwright/test';
import original from '../../playwright.config';
export default defineConfig({
  ...original,
  testDir:'../../e2e',
  testMatch:['waiter.spec.ts','offline.spec.ts'],
  use:{...original.use,video:'off',launchOptions:{executablePath:'/usr/bin/chromium',args:['--mute-audio']}},
  projects:original.projects!.flatMap(project=>[
    {...project,name:`${project.name}-normal`},
    {...project,name:`${project.name}-reduced`,testMatch:['waiter.spec.ts'],use:{...project.use,reducedMotion:'reduce'}},
  ]),
  webServer:(original.webServer as any[]).map((server,index)=>({...server,cwd:process.cwd(),reuseExistingServer:index===0})),
});
