import {chromium} from '@playwright/test';
import{mkdir,writeFile}from'node:fs/promises';
import assert from 'node:assert/strict';
const output=new URL('../../../docs/evidence/world/0085/current/contact/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
try {
 for(const [name,width,height]of [['desktop',1200,800],['phone',390,844]]) {
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:5487/src/world/characters/contact-proof.html');await page.waitForFunction(()=>window.__CONTACT_PROOF__);
  const data=await page.evaluate(()=>window.__CONTACT_PROOF__);assert.equal(errors.length,0,errors.join('\n'));
  await page.screenshot({path:output+name+'-comparison.png',fullPage:true});
  if(name==='desktop'){
   for(const id of ['before','attached','proportion','aunt']){const png=await page.locator('#'+id).evaluate(c=>c.toDataURL('image/png').split(',')[1]);await writeFile(output+id+'.png',Buffer.from(png,'base64'));}
   await writeFile(output+'results.json',JSON.stringify({data,errors,source:'foundation31908fd restaurant primitives plus owned actor seatHeight candidate',integrationOpen:true},null,2));
  }
  await page.close();
 }
}finally{await browser.close();}
