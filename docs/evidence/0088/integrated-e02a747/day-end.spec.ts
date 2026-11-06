import {test,expect} from '@playwright/test';
import {expectNativeSpeech} from '../../../../e2e/neighbourhood-audio';
import {probeAudio} from '../../../../e2e/audio-fixtures';
import {playOpening} from '../../../../e2e/opening';
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
const dir='docs/evidence/0088/integrated-e02a747';
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
  let local={x:from.x+(step.x-from.x)/length*limit,y:from.y+(step.y-from.y)/length*limit};
  const rect=await canvas.boundingBox();if(!rect)throw new Error('canvas missing');
  const camera=cameraForMap(maps[expectedMap].bounds,from,await canvas.evaluate((c:any)=>c.width),await canvas.evaluate((c:any)=>c.height),rect.width<600?11:15);
  let x=0,y=0,canvasHit=false;
  for(const fraction of [1,.75,.5,.25,.125]){local={x:from.x+(step.x-from.x)/length*limit*fraction,y:from.y+(step.y-from.y)/length*limit*fraction};const p=project(local,camera);x=rect.x+p.x*rect.width/camera.width;y=rect.y+p.y*rect.height/camera.height;canvasHit=await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.tagName==='CANVAS',{x,y});if(canvasHit)break;}
  if(!canvasHit)throw Error('Ordinary ground route obscured by HUD; no forced click');
  if(x<rect.x||x>rect.x+rect.width||y<rect.y||y>rect.y+rect.height)throw new Error(`Route target outside camera ${expectedMap}`);
  await page.evaluate(p=>{((window as any).__navigationReview??=[]).push({kind:'planned-click',at:performance.now(),...p,hit:document.elementFromPoint(p.x,p.y)?.outerHTML?.slice(0,300)});},{x,y,from,local,camera});await page.mouse.click(x,y);await expect.poll(async()=>{const w=await world(page);return w.mapId!==expectedMap||Math.hypot(w.position.x-local.x,w.position.y-local.y)<.18;},{timeout:15000}).toBe(true);
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


test('fourth customer receipt, ended exploration and visible next-day advancement',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const log=`${dir}/${info.project.name}-day-end-events.jsonl`;await writeFile(log,'');let sequence=0;
 const note=async(stage:string)=>{const state=await game(page);const ui=await page.locator('button').evaluateAll((buttons:any[])=>buttons.filter(b=>b.getClientRects().length&&!b.closest('[inert]')).map(b=>({label:b.getAttribute('aria-label'),text:b.innerText,disabled:b.disabled,anchor:b.dataset.worldAnchor??null})));await appendFile(log,JSON.stringify({head:HEAD,stage,at:new Date().toISOString(),state,presence:state?restaurantPresence(state):null,visibleButtons:ui})+'\n');console.log(info.project.name,stage);await page.screenshot({path:`${dir}/${info.project.name}-day-end-${String(sequence++).padStart(2,'0')}-${stage}.png`,fullPage:true});};
 await page.addInitScript(()=>{
 const log:any[]=[];(window as any).__navigationReview=log;
 window.addEventListener('pointerdown',(e:any)=>log.push({kind:'pointer',at:performance.now(),x:e.clientX,y:e.clientY,tag:e.target?.tagName,className:e.target?.className}),true);
 const Native=window.Worker;class Observed extends Native{constructor(url:any,options?:any){super(url,options);this.addEventListener('message',(e:any)=>log.push({kind:'reply',at:performance.now(),data:structuredClone(e.data)}));}postMessage(data:any,options?:any){log.push({kind:'request',at:performance.now(),data:structuredClone(data)});if(arguments.length>1)super.postMessage(data,options);else super.postMessage(data);}}window.Worker=Observed as any;
 });await probeAudio(page);
 try{
  await start(page);await note('opened');
  for(const table of [1,2,3,4]){
   await enter(page,`restaurant.table-${table}`);const dialog=page.locator('.world-context[data-target="table"]');await expect(dialog).toBeVisible();const customer=(await game(page)).customers.find((c:any)=>c.table===table),order=content.orders.find((o:any)=>o.id===customer.orderId);
   await closeActivity(page);await enter(page,'restaurant.kitchen');const kitchen=page.locator('.world-context[data-target="kitchen"]');await expect(kitchen).toBeVisible();
   for(const item of order.items){const food=content.foods.find((f:any)=>f.id===item.foodId);for(let n=0;n<item.quantity;n++)await kitchen.getByRole('button',{name:`拿${food.word.hanzi}`,exact:true}).click();}
   await closeActivity(page);await enter(page,`restaurant.table-${table}`);await dialog.getByRole('button',{name:'上菜',exact:true}).click();await expect.poll(async()=> (await game(page)).customers.find((c:any)=>c.table===table).phase).toBe('checkout');
   const total=order.items.reduce((sum:number,item:any)=>sum+content.foods.find((f:any)=>f.id===item.foodId).price*item.quantity,0);for(let n=0;n<order.paid-total;n++)await dialog.getByRole('button',{name:'+1块',exact:true}).click();
   if(table===4)await note('fourth-before-payment');await dialog.getByRole('button',{name:'递上找零',exact:true}).click();await expect(dialog.locator('.world-table-receipt .thanks-chop')).toBeVisible();await expect.poll(async()=> (await game(page)).served).toBe(table);
   const receipt=await game(page);expect(restaurantPresence(receipt).find((p:any)=>p.table===table)).toMatchObject({phase:'served',inside:true,reactionVisible:true});expect(receipt.ended).toBe(table===4);
   if(table===4){
    await note('fourth-receipt-seated');const thanks=content.characters.find((c:any)=>c.name===order.customer).thanks;await expectNativeSpeech(page,thanks.audio);let since=await page.evaluate(()=> (window as any).__audioProbe.length);
    await dialog.locator('.world-context-dialogue .round-button').first().click();await expectNativeSpeech(page,thanks.audio,since);
    const token=dialog.locator('.world-context-dialogue [data-word-lookup]').first();await expect(token).toHaveText(thanks.tokens[0].hanzi);since=await page.evaluate(()=> (window as any).__audioProbe.length);await token.click();await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();await expectNativeSpeech(page,thanks.tokens[0].audio,since);await note('fourth-word-card');
    await page.getByRole('button',{name:'关闭词卡',exact:true}).click();await expect(token).toBeFocused();expect(restaurantPresence(await game(page)).find((p:any)=>p.table===4).inside).toBe(true);await note('fourth-replay-retained');
   }
   await dialog.getByRole('button',{name:'继续招呼',exact:true}).click();await expect(dialog).toHaveCount(0);await expect.poll(async()=>restaurantPresence(await game(page)).find((p:any)=>p.table===table).inside).toBe(false);await note(`explicit-close-${table}`);
  }
  const ended=await game(page);expect(ended.ended).toBe(true);expect(ended.world.life.serviceDepartures).toHaveLength(4);await note('ended-controls');
  const summary=page.getByRole('dialog',{name:'今日小结',exact:true});if(await summary.isVisible())await summary.getByRole('button',{name:'出去走走',exact:true}).click();
  await travel(page,['town'],note);expect((await game(page)).ended).toBe(true);expect((await game(page)).day).toBe(ended.day);await note('ended-town');await travel(page,['restaurant'],note);await note('ended-return');
  // Inspect the real closure workstation; no dispatch, debug hook or forced summary.
  if(!await summary.isVisible())await enter(page,'restaurant.kitchen');await note('ended-kitchen-controls');
  await expect(summary,'A normal reachable next-day summary must exist after returning to the closed restaurant and using its kitchen anchor').toBeVisible();await summary.getByRole('button',{name:/^明天见/}).click();
  await expect.poll(async()=> (await game(page)).day).toBe(ended.day+1);const next=await game(page);expect(next.ended).toBe(false);expect(next.served).toBe(0);expect(next.earnings).toBe(ended.earnings);expect(next.journal).toEqual(ended.journal);expect(next.tray).toEqual([]);expect(next.customers.every((c:any)=>c.phase==='seated')).toBe(true);expect(next.world.life.serviceDepartures).toEqual([]);expect(restaurantPresence(next).every((p:any)=>p.inside)).toBe(true);
  for(const feature of ['apartment','cats','repairs'])expect(next.neighbourhood[feature]).toEqual(ended.neighbourhood[feature]);expect(next.neighbourhood.garden.day).toBe(ended.day+1);await note('advanced-day');await closeActivity(page);
  const beforeReload=await game(page);await page.reload();await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',beforeReload.world.mapId);await expect.poll(async()=> (await game(page)).customers).toEqual(beforeReload.customers);expect((await game(page)).world.position).toEqual(beforeReload.world.position);expect((await game(page)).journal).toEqual(beforeReload.journal);expect((await game(page)).world.life.serviceDepartures).toEqual([]);await note('day-two-reloaded');const welcome=page.getByRole('button',{name:'开门迎客'});if(await welcome.isVisible())await welcome.click();await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));
  await travel(page,['town','restaurant'],note);const returned=await game(page);expect(returned.day).toBe(ended.day+1);expect(returned.customers).toEqual(beforeReload.customers);expect(returned.earnings).toBe(ended.earnings);expect(returned.world.life.serviceDepartures).toEqual([]);await note('day-two-return');expect(errors).toEqual([]);
 }finally{await writeFile(`${dir}/${info.project.name}-day-end-final.json`,JSON.stringify({head:HEAD,errors,navigation:await page.evaluate(()=> (window as any).__navigationReview??[]),state:await game(page),audio:await page.evaluate(()=> (window as any).__audioProbe??[])},null,2));await page.screenshot({path:`${dir}/${info.project.name}-day-end-final.png`,fullPage:true});}
});
