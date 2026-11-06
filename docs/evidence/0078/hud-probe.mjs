import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});await mkdir('docs/evidence/0078/hud',{recursive:true});
const records=[];
for(const [device,width,height] of [['desktop',1440,1000],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5480/audio/manifest.json');
 await page.evaluate(async()=>{
  const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{worldMaps}=await import('/src/world/registry.ts'),{createWorld}=await import('/src/world/state.ts');
  const game=createGame(content,42);game.world={...createWorld(worldMaps),position:{x:18.5,y:9}};
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 });
 await page.goto('http://127.0.0.1:5480/');await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');
 const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.click();
 await page.locator('[data-world-anchor="restaurant.table-2"]').click();await page.locator('.world-context').waitFor();await page.waitForTimeout(300);
 const bounds=await page.evaluate(()=>({panel:document.querySelector('.world-context').getBoundingClientRect().toJSON(),footer:document.querySelector('.world-context-actions').getBoundingClientRect().toJSON(),viewport:document.querySelector('.connected-world').getBoundingClientRect().toJSON(),nestedButtons:document.querySelectorAll('button button').length}));
 await page.screenshot({path:`docs/evidence/0078/hud/${device}-table.png`});
 await page.locator('.world-context .spoken .word').first().click();await page.locator('.word-popover').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(100);
 const cardClosed=await page.locator('.word-popover').count()===0;
 await page.getByRole('button',{name:'继续走走',exact:true}).click();await page.waitForTimeout(100);
 records.push({device,bounds,cardClosed,interactionClosed:await page.locator('.world-context').count()===0,errors,method:'Declared saved arrival at physical table-2 approach; actual anchor, word lookup, Escape and close controls; no internal dispatch'});
 await context.close();
}
await writeFile('docs/evidence/0078/hud/results.json',JSON.stringify({sourceHead:'e02a747',records},null,2));await browser.close();
