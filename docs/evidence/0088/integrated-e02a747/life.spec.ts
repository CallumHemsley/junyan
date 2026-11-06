import {test,expect} from '@playwright/test';
import {playOpening} from '../../../../e2e/opening';
import {writeFile} from 'node:fs/promises';
import definitions from './maps.json' with {type:'json'};
import {restaurantMap} from './restaurant.mjs';
import {findPath} from './geometry.mjs';
import {cameraForMap,project} from './camera.mjs';
const maps=Object.fromEntries([restaurantMap,...definitions].map(m=>[m.id,m]));
async function game(page:any){return page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return await new Promise<any>((resolve,reject)=>{const t=db.transaction('saves');const r=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(r.result);db.close()};t.onerror=()=>reject(t.error)})})}
async function world(page:any){return (await game(page))?.world??{mapId:'restaurant',position:{x:12,y:17},activeActivity:null}}
async function walkTo(page:any,target:any,expectedMap:string){
 const canvas=page.getByTestId('world-viewport').locator('canvas');
 for(let attempt=0;attempt<240;attempt++){
  const state=await world(page);if(state.mapId!==expectedMap)return;
  const from=state.position,d=Math.hypot(target.x-from.x,target.y-from.y);if(d<.18)return;
  const path=findPath(maps[expectedMap],from,target);if(!path.length)throw new Error(`No route ${expectedMap} ${JSON.stringify(from)} -> ${JSON.stringify(target)}`);
  const step=path.find((p:any)=>Math.hypot(p.x-from.x,p.y-from.y)>.15)??target;
  const length=Math.hypot(step.x-from.x,step.y-from.y),limit=Math.min(length,4);
  const local={x:from.x+(step.x-from.x)/length*limit,y:from.y+(step.y-from.y)/length*limit};
  const rect=await canvas.boundingBox();if(!rect)throw new Error('canvas missing');
  const camera=cameraForMap(maps[expectedMap].bounds,from,Math.ceil(rect.width/2),Math.ceil(rect.height/2),rect.width<600?11:15);
  const p=project(local,camera);const x=rect.x+p.x*rect.width/camera.width,y=rect.y+p.y*rect.height/camera.height;
  if(x<rect.x||x>rect.x+rect.width||y<rect.y||y>rect.y+rect.height)throw new Error(`Route target outside camera ${expectedMap}`);
  await page.mouse.click(x,y);await page.waitForTimeout(limit/5*1000+180);
  const after=await world(page);if(after.mapId===expectedMap&&Math.hypot(after.position.x-from.x,after.position.y-from.y)<.025)throw new Error(`Input stalled ${expectedMap} at ${JSON.stringify(from)} toward ${JSON.stringify(local)}`);
 }
 throw new Error(`Route timeout ${expectedMap}`);
}
const dir='docs/evidence/0088/integrated-e02a747';
test('normal-input discovery, native touch, pockets, reload and actual offline cache',async({page,context},info)=>{
 const events:any[]=[],failures:string[]=[],errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const shot=async(name:string)=>page.screenshot({path:`${dir}/${info.project.name}-life-${name}.png`,fullPage:true});
 const step=async(name:string,fn:()=>Promise<any>)=>{const start=Date.now();try{const result=await fn();events.push({name,pass:true,ms:Date.now()-start,result});}catch(e){failures.push(`${name}: ${String(e)}`);events.push({name,pass:false,error:String(e),ms:Date.now()-start});await shot(`failure-${name}`).catch(()=>{});}};
 let discovered:any[]=[],reactions:any[]=[];
 try {
  // No test query, seed query, save import, teleport or mocked network.
  await page.goto('./');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await page.waitForTimeout(700);expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
  await step('native-touch-pad',async()=>{
   const before=await world(page),pad=page.getByRole('button',{name:'向右走',exact:true}),r=await pad.boundingBox();if(!r)throw Error('pad absent');
   const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]});await page.waitForTimeout(350);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await page.waitForTimeout(200);
   const after=await world(page);await page.waitForTimeout(250);const stopped=await world(page);await shot('touch');expect(Math.hypot(after.position.x-before.position.x,after.position.y-before.position.y)).toBeGreaterThan(.1);expect(Math.hypot(stopped.position.x-after.position.x,stopped.position.y-after.position.y)).toBeLessThan(.05);return {before,after,stopped};
  });
  await step('word-card-and-pocket-panels',async()=>{
   const token=page.locator('.world-place [data-word-lookup]').first();const word=await token.innerText();await token.click();await expect(page.getByRole('button',{name:'关闭词卡',exact:true})).toBeVisible();await shot('word-card');await page.getByRole('button',{name:'关闭词卡',exact:true}).click();
   const sizes=[];for(const name of ['本子','托盘']){const control=page.locator('.world-pocket-bar').getByRole('button',{name,exact:true});sizes.push({name,rect:await control.boundingBox()});await control.click();await expect(page.getByRole('dialog',{name,exact:true})).toBeVisible();await shot(name==='本子'?'journal':'tray');await page.getByRole('button',{name:'关闭',exact:true}).click();}return {word,sizes,journal:(await game(page)).journal,tray:(await game(page)).tray};
  });
  await step('walk-town-inspect',async()=>{
   const e=maps.restaurant.exits.find((x:any)=>x.targetMapId==='town');await walkTo(page,{x:e.rect.x+e.rect.width/2,y:e.rect.y+e.rect.height/2},'restaurant');await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map','town');
   // Town's real arrival landmark is at its actual door spawn; no debug repositioning.
   const options=page.locator('.world-life-options .world-anchor > button:not([data-word-lookup])');await expect(options.first()).toBeVisible();const labels=await options.allTextContents();
   for(let i=0;i<Math.min(2,await options.count());i++){await options.nth(i).click();await page.waitForTimeout(120);if((await game(page)).world?.life?.discoveries?.length)break;}
   const state=await game(page);discovered=state.world.life.discoveries;reactions=state.world.life.reactions;await shot('discovery');expect(discovered.some((d:any)=>d.mapId==='town')).toBe(true);expect(reactions.some((r:any)=>r.mapId==='town')).toBe(true);return {labels,state};
  });
  await step('reload-discovery-persistence',async()=>{const before=await world(page);await page.reload();await expect(page.getByTestId('world-viewport')).toBeVisible();await page.waitForTimeout(350);const after=await world(page);expect(after.mapId).toBe(before.mapId);expect(after.life.discoveries).toEqual(discovered);for(const reaction of reactions)expect(after.life.reactions).toContainEqual(reaction);await shot('reloaded');return {before,after};});
  await step('warm-actual-service-worker',async()=>{
   const status=await page.evaluate(async()=>{if(!('serviceWorker' in navigator))return {supported:false};const ready=await Promise.race([navigator.serviceWorker.ready.then(r=>({scope:r.scope,state:r.active?.state})),new Promise(resolve=>setTimeout(()=>resolve(null),8000))]);const registrations=await navigator.serviceWorker.getRegistrations();return {supported:true,ready,controller:navigator.serviceWorker.controller?.scriptURL,registrations:registrations.map(r=>({scope:r.scope,active:r.active?.state})),caches:await caches.keys()};});
   // Real online reload allows an activated worker to control this page and warm actual assets.
   await page.reload();await expect(page.getByTestId('world-viewport')).toBeVisible();await page.waitForTimeout(800);const after=await page.evaluate(()=>({controller:navigator.serviceWorker.controller?.scriptURL}));return {status,after};
  });
  await step('offline-reload-real-cache',async()=>{
   const before=await world(page);await context.setOffline(true);let navigationError=null;try{await page.reload({waitUntil:'domcontentloaded',timeout:15000});}catch(e){navigationError=String(e);}
   const viewport=page.getByTestId('world-viewport');await expect(viewport).toBeVisible({timeout:10000});const after=await world(page);await shot('offline');expect(after.mapId).toBe(before.mapId);expect(after.life.discoveries).toEqual(before.life.discoveries);return {navigationError,before,after,controller:await page.evaluate(()=>navigator.serviceWorker.controller?.scriptURL)};
  });
 } finally {
  await context.setOffline(false).catch(()=>{});
  await writeFile(`${dir}/${info.project.name}-life-results.json`,JSON.stringify({head:'e02a747c3b4d4fc6a476ea744ecb6bdc1a738132',evidence:'Ordinary opening/walking and actual controls; native CDP touch; saves read only; real SW/cache offline reload; no mocks.',failures,errors,events},null,2));
 }
 expect(failures).toEqual([]);expect(errors).toEqual([]);
});
