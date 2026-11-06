import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://localhost:5499/docs/evidence/world/0091/study.html');await page.waitForFunction(()=>window.__FOLIAGE_STUDY__);
for(const id of ['native','desktop','phone','evening'])await page.locator('#'+id).screenshot({path:new URL('./'+id+'.png',import.meta.url).pathname});
const result=await page.evaluate(()=>window.__FOLIAGE_STUDY__);result.consoleErrors=errors;await writeFile(new URL('./checks.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));await browser.close();
