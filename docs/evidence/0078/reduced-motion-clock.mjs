import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
// Observe the real viewport-to-painter seam without altering its input or simulation.
await page.route('**/src/world/painter.ts*',async route=>{
 const response=await route.fetch(),source=await response.text();
 const signature='export function paintWorld(ctx, map, view, facing, moving, scale, game, world, motion) {';
 if(!source.includes(signature))throw Error('Painter instrumentation boundary changed');
 await route.fulfill({response,body:source.replace(signature,signature+`\n const records=globalThis.__clockFrames??=[];records.push({at:performance.now(),elapsedMs:view.elapsedMs,reducedMotion:view.reducedMotion,positions:actorsFor(map,game,world,view.elapsedMs,view.reducedMotion).map(a=>({id:a.id,position:a.position,phaseMs:a.phaseMs}))});if(records.length>200)records.shift();`)});
});
await page.goto('http://127.0.0.1:5480/audio/manifest.json');
await page.evaluate(async()=>{
 const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{worldMaps}=await import('/src/world/registry.ts'),{createWorld}=await import('/src/world/state.ts'),{initialLifeState}=await import('/src/world/life/index.ts'),{validateSavedGame}=await import('/src/save.ts');
 const game=createGame(content,42);game.world={...createWorld(worldMaps),mapId:'town',position:worldMaps.town.defaultSpawn,life:{...initialLifeState(),elapsedMs:22000}};
 if(!validateSavedGame(game,content))throw Error('Invalid declared reduced-motion arrival fixture');
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
});
await page.goto('http://127.0.0.1:5480/');await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');
const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.click();
await page.waitForTimeout(1500);
const result=await page.evaluate(()=>{const frames=globalThis.__clockFrames,first=frames[0],last=frames.at(-1),recent=frames.filter(f=>f.at>last.at-1000);return {first,last,framesInLastSecond:recent.length,advances:last.elapsedMs>first.elapsedMs&&first.elapsedMs>=22000,staticPoses:frames.every(f=>f.positions.every(a=>a.phaseMs===0))};});
await mkdir('docs/evidence/0078/reduced-motion',{recursive:true});
await page.screenshot({path:'docs/evidence/0078/reduced-motion/phone.png'});
await writeFile('docs/evidence/0078/reduced-motion/results.json',JSON.stringify({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTreeObserved:true,method:'Actual App reduced-motion saved arrival; observation-only instrumented painter boundary',...result,errors},null,2));
await browser.close();
if(!result.advances||!result.staticPoses||result.framesInLastSecond>35||errors.length)throw Error('Reduced-motion rendering clock/cadence regression');
