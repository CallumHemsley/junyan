import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const records=[];await mkdir('docs/evidence/world/0078/assembly-main',{recursive:true});
for(const [device,width,height] of [['desktop',1440,1000],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:device==='phone'?2:1});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5480/');
 for(const phase of ['morning','evening'])for(const mapId of ['restaurant','town','courtyard','residential-hall','residential-stairs','apartment','workshop','rooftop','park','riverbank']){
  await page.goto('http://127.0.0.1:5480/audio/manifest.json');
  const fixture=await page.evaluate(async ({mapId,phase})=>{
   const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{worldMaps}=await import('/src/world/registry.ts'),{createWorld}=await import('/src/world/state.ts'),{validateSavedGame}=await import('/src/save.ts'),{orderTotal}=await import('/src/game.ts');
   const game=createGame(content,42),map=worldMaps[mapId];game.world={...createWorld(worldMaps),mapId,position:{x:map.defaultSpawn.x,y:map.defaultSpawn.y},facing:map.defaultSpawn.facing};
   game.world.life.elapsedMs=22000;
   if(phase==='evening'){for(const customer of game.customers.slice(0,3)){customer.phase='served';const order=content.orders.find(o=>o.id===customer.orderId);game.earnings+=orderTotal(order,content);}game.served=3;}
   if(!validateSavedGame(game,content))throw Error('Invalid '+phase+'/'+mapId+' fixture');
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
   await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();localStorage.removeItem('junyan-waiter-pending-v1');return {mapId,phase,position:game.world.position,lifeElapsedMs:game.world.life.elapsedMs};
  },{mapId,phase});
  await page.goto('http://127.0.0.1:5480/');
  await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');
  const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.click();
  await page.waitForFunction(()=>!document.querySelector('.modal-backdrop'));await page.waitForTimeout(200);
  const actualMap=await page.getByTestId('world-viewport').getAttribute('data-map');if(actualMap!==mapId)throw new Error(`Fixture mismatch ${mapId} -> ${actualMap}`);
  await page.screenshot({path:`docs/evidence/world/0078/assembly-main/${device}-${phase}-${mapId}.png`});
  records.push({device,...fixture,errors:[...errors],method:'Declared ordinary saved-arrival fixture; production App/registry/painter, no internal dispatch; visual assembly only'});
 }
 await context.close();
}
await writeFile('docs/evidence/world/0078/assembly-main/results.json',JSON.stringify({sourceHead:'c5cee1a9',records},null,2));await browser.close();
