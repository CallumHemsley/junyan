import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out='docs/evidence/world/0078/app-exit-boundaries';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const results=[];
for(const [device,width,height] of [['desktop',1440,1000],['phone',390,844]]){
const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/src/world/exit-safety.ts*',async route=>{const response=await route.fetch(),source=await response.text();const signature='export function safeExitPosition(map, p) {';if(!source.includes(signature))throw Error('Safety observation boundary changed');await route.fulfill({response,body:source.replace(signature,'function observedSafeExitPosition(map,p) {')+`\nexport function safeExitPosition(map,p){const start=performance.now();const result=observedSafeExitPosition(map,p);(globalThis.__exitCalls??=[]).push({mapId:map.id,ms:performance.now()-start});return result;}`});});
await page.goto('http://127.0.0.1:5480/audio/manifest.json');
await page.evaluate(async()=>{
 const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{worldMaps}=await import('/src/world/registry.ts'),{createWorld}=await import('/src/world/state.ts'),{initialLifeState}=await import('/src/world/life/index.ts'),{validateSavedGame}=await import('/src/save.ts');
 const game=createGame(content,42);game.world={...createWorld(worldMaps),mapId:'apartment',position:worldMaps.apartment.anchors[0].position,life:{...initialLifeState(),elapsedMs:22000}};
 if(!validateSavedGame(game,content))throw Error('Invalid declared reduced-motion arrival fixture');
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
});
await page.goto('http://127.0.0.1:5480/');await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.click();
await page.evaluate(()=>{globalThis.__movementExitStart=globalThis.__exitCalls.length;globalThis.__frames=[];globalThis.__measure=true;const tick=t=>{globalThis.__frames.push(t);if(globalThis.__measure)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
await page.getByTestId('world-viewport').focus();await page.keyboard.down('ArrowLeft');await page.waitForTimeout(900);await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');await page.waitForTimeout(900);await page.keyboard.up('ArrowRight');
const movement=await page.evaluate(()=>{globalThis.__measure=false;const gaps=globalThis.__frames.slice(1).map((v,i)=>v-globalThis.__frames[i]).sort((a,b)=>a-b);return {exitCalls:globalThis.__exitCalls.length-globalThis.__movementExitStart,frames:gaps.length,p95FrameGapMs:gaps[Math.floor(gaps.length*.95)],maxFrameGapMs:Math.max(...gaps)};});if(movement.exitCalls)throw Error('Connectivity validation entered movement');
await page.locator('[data-world-anchor="apartment.furnish"]').click();await page.getByRole('button',{name:'收下',exact:true}).click();await page.locator('.apartment-items button').filter({hasText:'桌子'}).click();
await page.getByRole('button',{name:'第2行第3格',exact:true}).click();await page.getByRole('button',{name:'放这里',exact:true}).click();await page.getByRole('button',{name:'撤回',exact:true}).click();
const calls=await page.evaluate(()=>globalThis.__exitCalls);await page.screenshot({path:`${out}/${device}.png`});await page.reload();await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');
const reloadCalls=await page.evaluate(()=>globalThis.__exitCalls);if(!reloadCalls.length||errors.length)throw Error('Reload safety/errors');results.push({device,movement,calls,reloadCalls,errors});await context.close();}
await writeFile(`${out}/results.json`,JSON.stringify({method:'Validated saved apartment arrival; real keyboard walk, starter/select/preview/place/undo controls and reload. Observation-only safeExitPosition timing wrapper. Cloud Chromium, not physical phone.',workingTreeObserved:true,results},null,2));await browser.close();
