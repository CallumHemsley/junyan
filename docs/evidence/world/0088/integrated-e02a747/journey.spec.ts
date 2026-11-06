import {test,expect} from '@playwright/test';
import {probeAudio} from '../../../../../e2e/audio-fixtures';
import {playOpening} from '../../../../../e2e/opening';
import {writeFile,appendFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import definitions from './maps.json' with {type:'json'};
import {restaurantMap} from './restaurant.mjs';
import {findPath,canStand} from './geometry.mjs';
import {createRequire} from 'node:module';
const requireHere=createRequire(import.meta.url);
const {buildSync}=createRequire(requireHere.resolve('vite/package.json'))('esbuild');
import {execFileSync} from 'node:child_process';
const runtimeExports:{exports:any}={exports:{}};
const source=buildSync({stdin:{contents:"export {projectGarden} from './src/world/maps/rooftop'; export {furnitureColliders} from './src/features/apartment/world'; export {courtyardForCats} from './src/world/maps/courtyard'; export {restaurantPresence} from './src/world/presence';",resolveDir:'/workspace/junyan-review-integration',loader:'ts'},bundle:true,write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
new Function('module','exports',source)(runtimeExports,runtimeExports.exports);
const {projectGarden,furnitureColliders,courtyardForCats,restaurantPresence}=runtimeExports.exports;
const HEAD='e02a747c3b4d4fc6a476ea744ecb6bdc1a738132';
import {cameraForMap,project} from './camera.mjs';
const dir='docs/evidence/world/0088/integrated-e02a747';
const maps=Object.fromEntries([restaurantMap,...definitions].map(m=>[m.id,m]));
async function game(page:any){return page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return await new Promise<any>((resolve,reject)=>{const t=db.transaction('saves');const r=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(r.result);db.close()};t.onerror=()=>reject(t.error)})})}
function dynamicMap(id:string,saved:any){const base=maps[id];if(id==='rooftop'){const g=projectGarden(saved.neighbourhood.garden);return {...base,colliders:[...base.colliders,...g.colliders],anchors:[...base.anchors,...g.anchors]};}if(id==='apartment')return {...base,colliders:[...base.colliders,...furnitureColliders(saved.neighbourhood.apartment)]};if(id==='courtyard')return courtyardForCats(base,saved.neighbourhood.cats,saved.day);return base;}
async function world(page:any){return (await game(page))?.world??{mapId:'restaurant',position:{x:12,y:17},activeActivity:null}}
async function walkTo(page:any,target:any,expectedMap:string){
 const canvas=page.getByTestId('world-viewport').locator('canvas');
 for(let attempt=0;attempt<240;attempt++){
  const state=await world(page);if(state.mapId!==expectedMap)return;
  const from=state.position,d=Math.hypot(target.x-from.x,target.y-from.y);if(d<.18)return;
  const path=findPath(dynamicMap(expectedMap,await game(page)),from,target);if(!path.length)throw new Error(`No route ${expectedMap} ${JSON.stringify(from)} -> ${JSON.stringify(target)}`);
  const step=path.find((p:any)=>Math.hypot(p.x-from.x,p.y-from.y)>.15)??target;
  const length=Math.hypot(step.x-from.x,step.y-from.y),limit=Math.min(length,4);
  const local={x:from.x+(step.x-from.x)/length*limit,y:from.y+(step.y-from.y)/length*limit};
  const rect=await canvas.boundingBox();if(!rect)throw new Error('canvas missing');
  const camera=cameraForMap(maps[expectedMap].bounds,from,await canvas.evaluate((c:any)=>c.width),await canvas.evaluate((c:any)=>c.height),rect.width<600?11:15);
  const p=project(local,camera);const x=rect.x+p.x*rect.width/camera.width,y=rect.y+p.y*rect.height/camera.height;
  if(x<rect.x||x>rect.x+rect.width||y<rect.y||y>rect.y+rect.height)throw new Error(`Route target outside camera ${expectedMap}`);
  await page.mouse.click(x,y);await expect.poll(async()=>{const w=await world(page);return w.mapId!==expectedMap||Math.hypot(w.position.x-local.x,w.position.y-local.y)<.18;},{timeout:15000}).toBe(true);
  const after=await world(page);if(after.mapId===expectedMap&&Math.hypot(after.position.x-from.x,after.position.y-from.y)<.025)throw new Error(`Input stalled ${expectedMap} at ${JSON.stringify(from)} toward ${JSON.stringify(local)}`);
 }
 throw new Error(`Route timeout ${expectedMap}`);
}
async function closeActivity(page:any){const close=page.getByRole('button',{name:'关闭',exact:true});if(await close.count())await close.last().click();const walk=page.getByRole('button',{name:'继续走走',exact:true});if(await walk.count())await walk.click();await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));}
async function enter(page:any,id:string){const w=await world(page),m=dynamicMap(w.mapId,await game(page)),a=m.anchors.find((a:any)=>a.id===id);if(!a)throw new Error(`anchor absent ${id}`);let target=a.position;if(!canStand(m,target)){const options=[];for(let x=-a.radius;x<=a.radius;x+=.3)for(let y=-a.radius;y<=a.radius;y+=.3){const p={x:a.position.x+x,y:a.position.y+y};if(Math.hypot(x,y)<=a.radius&&canStand(m,p))options.push(p)}target=options.sort((p,q)=>Math.hypot(p.x-w.position.x,p.y-w.position.y)-Math.hypot(q.x-w.position.x,q.y-w.position.y))[0];}if(!target)throw new Error('no anchor approach');await walkTo(page,target,w.mapId);await page.locator(`[data-world-anchor="${id}"]`).click();}

const content=JSON.parse(readFileSync('/workspace/junyan-review-integration/src/content/content.json','utf8'));
const gardenData=JSON.parse(readFileSync('/workspace/junyan-review-integration/src/features/garden/content.json','utf8'));
const gardenName=(id:string)=>gardenData.words.find((w:any)=>w.id===gardenData.labels[id]).hanzi;
async function travel(page:any,route:string[],note:(stage:string)=>Promise<void>){for(const next of route){const before=await world(page),m=dynamicMap(before.mapId,await game(page)),exit=m.exits.find((e:any)=>e.targetMapId===next);if(!exit)throw new Error(`No edge ${m.id}->${next}`);await walkTo(page,{x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2},m.id);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',next);await note(`route-${m.id}-to-${next}`);}}
async function start(page:any){expect(execFileSync('git',['rev-parse','HEAD'],{cwd:'/workspace/junyan-review-integration',encoding:'utf8'}).trim()).toBe(HEAD);await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await expect(page.getByTestId('world-viewport').locator('canvas')).toHaveAttribute('data-rendered','true');await page.waitForTimeout(700);expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);}

test('ordinary connected-world service, all ten places, saved activities and offline reload',async({page,context},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const log=`${dir}/${info.project.name}-journey-events.jsonl`;await writeFile(log,'');let counter=0;
 const note=async(stage:string)=>{const state=await game(page);await appendFile(log,JSON.stringify({head:HEAD,stage,at:new Date().toISOString(),state})+'\n');console.log(info.project.name,stage);await page.screenshot({path:`${dir}/${info.project.name}-journey-${String(counter++).padStart(2,'0')}-${stage}.png`,fullPage:true});};
 await probeAudio(page);
 try {
  await start(page);await note('opening');
  for(const table of [1,2,3]){
   await enter(page,`restaurant.table-${table}`);const dialog=page.locator('.world-context[data-target="table"]');await expect(dialog).toBeVisible();
   const current=await game(page),customer=current.customers.find((c:any)=>c.table===table),order=content.orders.find((o:any)=>o.id===customer.orderId);
   expect(restaurantPresence(current).find((p:any)=>p.table===table).inside).toBe(true);
   if(table===1){
    const count=await page.evaluate(()=> (window as any).__audioProbe.length);await dialog.locator('.world-context-dialogue .round-button').first().click();await expect.poll(async()=>page.evaluate((n:number)=> (window as any).__audioProbe.slice(n).some((a:any)=>a.status==='playing'),count)).toBe(true);
    await dialog.locator('.world-context-dialogue [data-word-lookup]').first().click();await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();await page.getByRole('button',{name:'关闭词卡',exact:true}).click();
   }
   await closeActivity(page);await enter(page,'restaurant.kitchen');const kitchen=page.locator('.world-context[data-target="kitchen"]');await expect(kitchen).toBeVisible();
   for(const item of order.items){const food=content.foods.find((f:any)=>f.id===item.foodId);for(let n=0;n<item.quantity;n++)await kitchen.getByRole('button',{name:`拿${food.word.hanzi}`,exact:true}).click();}
   expect((await game(page)).tray.length).toBe(order.items.reduce((n:number,i:any)=>n+i.quantity,0));await closeActivity(page);
   if(table===1){await page.getByRole('button',{name:'托盘',exact:true}).click();await expect(page.getByRole('dialog',{name:'托盘',exact:true})).toBeVisible();await note('tray');await closeActivity(page);}
   await enter(page,`restaurant.table-${table}`);await dialog.getByRole('button',{name:'上菜',exact:true}).click();
   await expect.poll(async()=> (await game(page)).customers.find((c:any)=>c.table===table).phase).toBe('checkout');
   const total=order.items.reduce((sum:number,item:any)=>sum+content.foods.find((f:any)=>f.id===item.foodId).price*item.quantity,0);
   for(let n=0;n<order.paid-total;n++)await dialog.getByRole('button',{name:'+1块',exact:true}).click();
   await dialog.getByRole('button',{name:'递上找零',exact:true}).click();await expect(dialog.locator('.world-table-receipt .thanks-chop')).toBeVisible();
   const receipt=await game(page),presence=restaurantPresence(receipt).find((p:any)=>p.table===table);
   expect(presence).toMatchObject({inside:true,reactionVisible:true,phase:'served'});expect(receipt.world.life.serviceDepartures.some((d:any)=>d.day===receipt.day&&d.table===table&&d.orderId===customer.orderId)).toBe(false);await note(`receipt-seated-${table}`);
   await dialog.getByRole('button',{name:'继续招呼',exact:true}).click();await expect(dialog).toHaveCount(0);
   await expect.poll(async()=>restaurantPresence(await game(page)).find((p:any)=>p.table===table).inside).toBe(false);await expect.poll(async()=> (await game(page)).served).toBe(table);await note(`released-${table}`);
  }
  await page.getByRole('button',{name:'本子',exact:true}).click();await expect(page.getByRole('dialog',{name:'本子',exact:true}).locator('.journal-list')).toBeVisible();await note('journal');await closeActivity(page);
  // Complete breadth first, using only physical doors and ordinary ground clicks.
  await travel(page,['town','courtyard','residential-hall','residential-stairs','apartment','residential-stairs','rooftop','residential-stairs','residential-hall','town','workshop','town','riverbank','park','courtyard','town','restaurant'],note);
  await travel(page,['town','courtyard'],note);await enter(page,'courtyard.white');await expect(page.locator('.world-context[data-target="cat"]')).toBeVisible();expect((await game(page)).neighbourhood.cats.selected).toBe('white');
  for(const action of ['crouch','wait','approach','follow','reunite']){if(action!=='crouch'){await closeActivity(page);await enter(page,'courtyard.white');}await page.getByTestId(`cats-action-${action}`).click();await note(`cat-${action}`);}
  await expect.poll(async()=> (await game(page)).neighbourhood.cats.story.node).toBe('reunited');await page.getByRole('button',{name:'收下猫靠垫',exact:true}).click();await closeActivity(page);await note('cat-world-reunited');
  await travel(page,['residential-hall','residential-stairs','apartment'],note);await enter(page,'apartment.furnish');await page.getByRole('button',{name:'收下',exact:true}).click();const original=(await game(page)).neighbourhood.apartment.placements;
  await page.locator('.apartment-items').getByRole('button',{name:/桌子/}).click();await page.getByRole('button',{name:'选格子',exact:true}).click();await page.getByRole('button',{name:/第2行第3格/}).click();await page.getByRole('button',{name:'放这里',exact:true}).click();
  await expect.poll(async()=> (await game(page)).neighbourhood.apartment.placements.find((p:any)=>p.id==='table')).toMatchObject({x:2,y:1});await note('furnished');await page.getByRole('button',{name:'撤回',exact:true}).click();await expect.poll(async()=> (await game(page)).neighbourhood.apartment.placements).toEqual(original);
  const beforeReload=await game(page);await page.reload();await expect(page.locator('.world-context[data-target="apartment"]')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(beforeReload.neighbourhood);expect((await game(page)).world.position).toEqual(beforeReload.world.position);expect((await game(page)).world.activeAnchorId).toBe('apartment.furnish');await note('undo-reloaded');await closeActivity(page);
  await travel(page,['residential-stairs','rooftop'],note);await enter(page,'rooftop.garden');await expect(page.getByTestId('garden-view')).toBeVisible();await page.locator(`.garden-tool-button[aria-label="${gardenName('tidy')}"]`).click();
  for(const plant of ['climber','tree']){await page.getByRole('button',{name:`${gardenName('select')}${gardenName(plant)}`,exact:true}).click();await page.locator(`.garden-tool-button[aria-label="${gardenName('water-verb')}"]`).click();await expect.poll(async()=> (await game(page)).neighbourhood.garden.plants[plant].care).toBe('ready');}
  await note('garden-cared');const cared=(await game(page)).neighbourhood;await page.reload();await expect(page.getByTestId('garden-view')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(cared);await closeActivity(page);
  await travel(page,['residential-stairs','residential-hall','town','workshop'],note);await enter(page,'workshop.lamp');await page.getByTestId('repair-part-bulb').click();await page.locator('.repair-part-actions').getByRole('button',{name:'拧紧',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'试试',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'放回',exact:true}).click();await note('lamp-repaired');
  const repaired=(await game(page)).neighbourhood;await page.reload();await expect(page.locator('.world-context[data-target="repair"]')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(repaired);await closeActivity(page);
  await travel(page,['town','courtyard'],note);expect((await game(page)).neighbourhood.cats.story.node).toBe('reunited');await note('cat-return');
  const offlineReady=await page.evaluate(async()=>{if(!('serviceWorker' in navigator))return {ready:false,reason:'unsupported'};return Promise.race([navigator.serviceWorker.ready.then(r=>({ready:!!r.active&&!!navigator.serviceWorker.controller,reason:navigator.serviceWorker.controller?'controlled':'not-controlled'})),new Promise<{ready:boolean;reason:string}>(resolve=>setTimeout(()=>resolve({ready:false,reason:'ready-timeout'}),15000))]);});
  await appendFile(log,JSON.stringify({stage:'offline-readiness',...offlineReady})+'\n');
  if(offlineReady.ready){const before=await game(page);await context.setOffline(true);try{await page.reload({waitUntil:'domcontentloaded',timeout:15000});await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',before.world.mapId);await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(before.neighbourhood);expect((await game(page)).world.position).toEqual(before.world.position);await note('offline-reloaded');}finally{await context.setOffline(false);}}
  expect(errors).toEqual([]);
 }finally{await context.setOffline(false);await writeFile(`${dir}/${info.project.name}-journey-final.json`,JSON.stringify({head:HEAD,errors,state:await game(page),audio:await page.evaluate(()=> (window as any).__audioProbe??[])},null,2));await page.screenshot({path:`${dir}/${info.project.name}-journey-final.png`,fullPage:true});}
});

test('native phone touch-pad holds move and release stops without teleport',async({page},info)=>{
 test.skip(info.project.name!=='phone','Native touch gate is phone-only');await start(page);const before=await world(page),button=page.getByRole('button',{name:'向后走',exact:true}),rect=await button.boundingBox();expect(rect).not.toBeNull();const client=await page.context().newCDPSession(page);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect!.x+rect!.width/2,y:rect!.y+rect!.height/2}]});await page.waitForTimeout(350);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const after=await world(page);expect(after.mapId).toBe(before.mapId);expect(Math.hypot(after.position.x-before.position.x,after.position.y-before.position.y)).toBeGreaterThan(.5);await page.waitForTimeout(250);expect((await world(page)).position).toEqual(after.position);await page.screenshot({path:`${dir}/phone-native-touch.png`,fullPage:true});await writeFile(`${dir}/phone-native-touch.json`,JSON.stringify({head:HEAD,before,after,final:await world(page)},null,2));
});
