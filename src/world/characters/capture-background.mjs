import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output=new URL('../../../docs/evidence/world/0085/current/background/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
try {
 for(const [name,width,height,dpr]of [['desktop',1280,1000,1],['phone',390,844,2]]) {
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:true,recordVideo:{dir:output+'raw',size:{width,height}}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5487/src/world/characters/background-harness.html');
  await page.waitForFunction(()=>window.__BACKGROUND_FIXTURE__);
  if(name==='desktop')for(const id of ['directions','motion']) {
   const data=await page.locator('#'+id).evaluate(canvas=>canvas.toDataURL('image/png').split(',')[1]);
   await writeFile(output+id+'-native.png',Buffer.from(data,'base64'));
  }
  await page.screenshot({path:output+name+'-sheet.png',fullPage:true});
  await page.locator('#stage').scrollIntoViewIfNeeded();await page.locator('#stage').focus();
  const first=await page.evaluate(()=>({...window.__BACKGROUND_FIXTURE__.state}));
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(850);await page.keyboard.up('ArrowRight');
  const walking=await page.evaluate(()=>({...window.__BACKGROUND_FIXTURE__.state}));
  assert(walking.distance>first.distance+.5);
  await page.screenshot({path:output+name+'-walking.png',fullPage:true});
  await page.waitForTimeout(1400);
  await page.screenshot({path:output+name+'-working.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  const a=await page.evaluate(()=>window.__BACKGROUND_FIXTURE__.samples().map(s=>Array.from(s.frame.pixels)));
  await page.waitForTimeout(400);
  const b=await page.evaluate(()=>window.__BACKGROUND_FIXTURE__.samples().map(s=>Array.from(s.frame.pixels)));
  assert.deepEqual(a,b);assert.equal(errors.length,0,errors.join('\n'));
  results.push({name,width,height,dpr,first,walking,errors,reducedMotionPixelsEqual:true,scope:'Unregistered visual candidate. Courtyard backdrop is real production paintWorld; staged resident cohort is an owned art fixture, not a life/map integration or collision proof.'});
  const video=page.video();await context.close();if(video)await video.saveAs(output+name+'-motion.webm');
 }
 await writeFile(output+'results.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
console.log(JSON.stringify(results));
