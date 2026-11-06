import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const output=new URL('../../../docs/evidence/world/0085/current/lighting/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
try {
 const page=await browser.newPage({viewport:{width:1480,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5487/src/world/characters/lighting-proof.html');
 await page.waitForFunction(()=>window.__ACTOR_LIGHTING_PROOF__);
 const results=await page.evaluate(()=>window.__ACTOR_LIGHTING_PROOF__);
 assert.deepEqual(results.morning.camera,results.evening.camera);
 assert.deepEqual(results.morning.position,results.evening.position);
 assert.notDeepEqual(results.morning.actorPixels,results.evening.actorPixels);
 for(const [phase,value]of Object.entries(results)) {
  await writeFile(output+phase+'.png',Buffer.from(value.png,'base64'));
  value.actorPixelHash=createHash('sha256').update(Buffer.from(value.actorPixels)).digest('hex');delete value.png;delete value.actorPixels;
 }
 assert.equal(errors.length,0,errors.join('\n'));
 await page.screenshot({path:output+'same-camera-comparison.png',fullPage:true});
 await writeFile(output+'results.json',JSON.stringify({results,errors,productionSource:'foundation74a5213 plus explicit actor shadeColor consumer',limitation:'Foundation still has the returned transitional context proxy. This demonstrates this actor consumer, not final whole-scene lighting acceptance.'},null,2));
}finally{await browser.close();}
