import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {playOpening} from '../../../../e2e/opening';
async function stores(page:Page){return page.evaluate(async()=>{
 const checkpoint=JSON.parse(localStorage.getItem('junyan-waiter-pending-v1')??'null');
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const saved=await new Promise<any>((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return {checkpoint,saved};
});}
async function state(page:Page){const s=await stores(page);return s.checkpoint??s.saved;}
async function walkTo(page:Page,target:{x:number;y:number},expectedMap?:string){
 for(let iteration=0;iteration<240;iteration++){
  const before=await state(page),mapId=before.world?.mapId??'restaurant';if(expectedMap&&mapId!==expectedMap)return;
  const step=await page.evaluate(async({save,target})=>{
   const {mapsForNeighbourhood}=await import('/src/world/dynamic.ts');const {restoreWorld}=await import('/src/world/state.ts');const {findPath}=await import('/src/world/geometry.ts');const {cameraForMap,project}=await import('/src/world/camera.ts');const {surfaceHeight}=await import('/src/world/surfaces.ts');
   const maps=mapsForNeighbourhood(save.neighbourhood),world=restoreWorld(save.world,maps,save.neighbourhood.location),map=maps[world.mapId];
   const distance=Math.hypot(world.position.x-target.x,world.position.y-target.y);if(distance<.19)return {done:true};
   const path=findPath(map,world.position,target);if(!path.length)return {error:`No path ${map.id} ${JSON.stringify(world.position)} to ${JSON.stringify(target)}`};
   const next=path[0],dx=next.x-world.position.x,dy=next.y-world.position.y,length=Math.hypot(dx,dy),amount=Math.min(1,2.5/length),point={x:world.position.x+dx*amount,y:world.position.y+dy*amount};
   const canvas=document.querySelector<HTMLCanvasElement>('.connected-world canvas')!,rect=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,world.position,canvas.width,canvas.height,rect.width<600?11:15,0,0,surfaceHeight(map.id,world.position)),pixel=project(point,camera,surfaceHeight(map.id,point));
   return {point,from:world.position,x:rect.left+pixel.x/canvas.width*rect.width,y:rect.top+pixel.y/canvas.height*rect.height,mapId:map.id};
  },{save:before,target});
  if(step.done)return;if(step.error)throw new Error(step.error);
  if(mapId==='residential-stairs'){
   const dx=step.point!.x-step.from!.x,dy=step.point!.y-step.from!.y;
   const keys=Math.abs(dx)>Math.abs(dy)*2?(dx>0?['ArrowDown','ArrowRight']:['ArrowUp','ArrowLeft']):Math.abs(dy)>Math.abs(dx)*2?(dy>0?['ArrowDown','ArrowLeft']:['ArrowUp','ArrowRight']):(dx>0?(dy>0?['ArrowDown']:['ArrowRight']):(dy>0?['ArrowLeft']:['ArrowUp']));
   await page.getByTestId('world-viewport').focus();for(const key of keys)await page.keyboard.down(key);
   await page.waitForTimeout(Math.min(380,Math.hypot(dx,dy)/5*1000));for(const key of keys)await page.keyboard.up(key);
   await page.waitForTimeout(80);continue;
  }
  if(test.info().project.name==='phone')await page.touchscreen.tap(step.x!,step.y!);else await page.mouse.click(step.x!,step.y!);
  await expect.poll(async()=>{const after=await state(page);return after.world?.mapId!==mapId||Math.hypot(after.world.position.x-step.point!.x,after.world.position.y-step.point!.y)<.24;},{timeout:12000}).toBe(true);
 }
 throw new Error(`Traversal exceeded 240 real input steps: ${JSON.stringify({target,expectedMap,current:await state(page)})}`);
}
async function anchor(page:Page,id:string){const target=await page.evaluate(async id=>{const {worldMaps}=await import('/src/world/registry.ts');return Object.values(worldMaps).flatMap(m=>m.anchors).find(a=>a.id===id)!.position;},id);await walkTo(page,target);await page.locator(`[data-world-anchor="${id}"]`).click();}
async function exit(page:Page,targetMap:string){const save=await state(page),mapId=save.world?.mapId??'restaurant';const target=await page.evaluate(async({mapId,targetMap})=>{const {worldMaps}=await import('/src/world/registry.ts');const e=worldMaps[mapId].exits.find(e=>e.targetMapId===targetMap)!;if(!e)throw new Error(`Missing edge ${mapId} -> ${targetMap}`);return {x:e.rect.x+e.rect.width/2,y:e.rect.y+e.rect.height/2};},{mapId,targetMap});await walkTo(page,target,mapId);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',targetMap);}
test('ordinary opening, physical service, connected travel and reload',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
 const checkpoints:any[]=[],frameEvidence:any[]=[];
 const performanceSession=await page.context().newCDPSession(page);await performanceSession.send('Performance.enable');
 const measure=async(label:string)=>{
  const before=await performanceSession.send('Performance.getMetrics');
  await page.evaluate(()=>{const times:number[]=[];const observer=new MutationObserver(()=>times.push(performance.now()));observer.observe(document.querySelector('.connected-world canvas')!,{attributes:true,attributeFilter:['data-rendered']});Object.assign(window,{__LIGHT_FRAME_PROOF__:{times,observer}});});
  await page.waitForTimeout(1600);
  const times=await page.evaluate(()=>{const p=(window as any).__LIGHT_FRAME_PROOF__;p.observer.disconnect();return p.times as number[];});
  const after=await performanceSession.send('Performance.getMetrics');
  const metric=(list:any[],name:string)=>list.find(m=>m.name===name)?.value??0;
  const intervals=times.slice(1).map((t:number,i:number)=>t-times[i]).sort((a:number,b:number)=>a-b);
  frameEvidence.push({label,paintCompletions:times.length,intervalP50:intervals[Math.floor(intervals.length*.5)],intervalP95:intervals[Math.floor(intervals.length*.95)],taskDurationMs:(metric(after.metrics,'TaskDuration')-metric(before.metrics,'TaskDuration'))*1000,windowMs:1600,scope:'Whole production App browser CPU and paint-completion cadence with proof video/tracing enabled; not GPU FPS or input latency.'});
 };
 const tour=async(phase:string)=>{
  const route=['town','workshop','town','courtyard','residential-hall','residential-stairs','rooftop','residential-stairs','residential-hall','town',...(phase==='evening'?['park','riverbank','town']:[]),'restaurant'];
  for(const destination of route){
   console.log('ordinary door',phase,(await state(page)).world?.mapId,destination);await exit(page,destination);if(destination==='park'||destination==='riverbank')await measure(`${phase}/${destination}/arrival`);
   const landmarks=destination==='workshop'?[['bench',{x:11.5,y:8.8}],['entry',{x:15,y:22.5}]]:destination==='courtyard'?[['window',{x:23.5,y:21.5}],['laundry',{x:6,y:11.5}]]:destination==='rooftop'?[['threshold',{x:12.5,y:29}],['care',{x:19,y:20}]]:[];
   for(const [name,point] of landmarks){await walkTo(page,point as {x:number;y:number});await page.screenshot({path:`docs/evidence/world/0086/ordinary/${test.info().project.name}-${destination}-${name}-${phase}.png`});checkpoints.push({destination,name,phase,state:await state(page)});await measure(`${phase}/${destination}/${name}`);}
   if(phase==='morning'&&destination==='workshop'){
    await anchor(page,'workshop.lamp');await page.getByTestId('repair-part-bulb').click();await page.locator('.repair-part-actions').getByRole('button',{name:'拧紧',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'试试',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'放回',exact:true}).click();
    expect((await state(page)).neighbourhood.repairs.completed).toContain('lamp');await page.screenshot({path:`docs/evidence/world/0086/ordinary/${info.project.name}-repair-returned.png`});await page.getByRole('button',{name:'继续走走',exact:true}).click();
    checkpoints.push({activity:'lamp-returned',state:await state(page)});
   }
   if(phase==='morning'&&destination==='rooftop'){
    await anchor(page,'rooftop.garden');
    const labels=await page.evaluate(async()=>{const{label}=await import('/src/features/garden/content.ts');return Object.fromEntries(['tidy','select','climber','water-verb'].map(id=>[id,label(id).tokens.map(w=>w.hanzi).join('')]));});
    await page.locator('.garden-arrival button.garden-tool-button').click();await page.locator(`button.garden-pot-select[aria-label="${labels.select+labels.climber}"]`).click();await page.locator(`button.garden-tool-button[aria-label="${labels['water-verb']}"]`).click();
    expect((await state(page)).neighbourhood.garden.plants.climber.care).toBe('ready');await page.screenshot({path:`docs/evidence/world/0086/ordinary/${info.project.name}-garden-watered.png`});await page.getByRole('button',{name:'继续走走',exact:true}).click();
    checkpoints.push({activity:'garden-watered',state:await state(page)});
   }
  }
 };
 await tour('morning');
 for(const table of [1,2,3]){
  await anchor(page,`restaurant.table-${table}`);await expect(page.getByRole('dialog',{name:`${table}桌点餐`})).toBeVisible();
  if(table===1){await page.locator('.world-context .spoken .word').first().click();await expect(page.locator('.word-popover .pinyin')).toBeVisible();await page.getByRole('button',{name:'关闭词卡'}).click();}
  const save=await state(page),order=await page.evaluate(async({save,table})=>{const {content}=await import('/src/neighbourhood/registry.ts');const order=content.orders.find(o=>o.id===save.customers.find((c:any)=>c.table===table).orderId)!;return {...order,foods:order.items.map(i=>({name:content.foods.find(f=>f.id===i.foodId)!.word.hanzi,quantity:i.quantity,price:content.foods.find(f=>f.id===i.foodId)!.price}))};},{save,table});
  await page.getByRole('button',{name:'继续走走',exact:true}).click();await anchor(page,'restaurant.kitchen');
  for(const item of order.foods)for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${item.name}`,exact:true}).click();
  await page.getByRole('button',{name:'端好了，去上菜'}).click();await anchor(page,`restaurant.table-${table}`);
  await page.getByRole('button',{name:'上菜',exact:false}).last().click();
  const total=order.foods.reduce((sum:any,f:any)=>sum+f.price*f.quantity,0);for(let n=0;n<order.paid-total;n++)await page.getByRole('button',{name:'+1块',exact:true}).click();
  await page.getByRole('button',{name:'递上找零'}).click();await expect(page.locator('.thanks-chop')).toBeVisible();await page.getByRole('button',{name:'继续招呼'}).click();
  checkpoints.push({table,state:await state(page)});
 }
 await page.screenshot({path:`docs/evidence/world/0086/ordinary/${info.project.name}-service-world.png`});
 await tour('evening');
 const world=page.getByTestId('world-viewport');await world.focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(180);await page.keyboard.up('ArrowUp');await page.waitForTimeout(900);
 const before=await stores(page);await page.reload();await page.waitForTimeout(900);const after=await stores(page);
 expect(after.saved.world.position).toEqual(before.saved.world.position);expect(after.saved.served).toBe(3);expect(Object.keys(after.saved.journal).length).toBeGreaterThan(0);expect(errors).toEqual([]);
 await writeFile(`docs/evidence/world/0086/ordinary/${info.project.name}-journey-proof.json`,JSON.stringify({checkpoints,frameEvidence,before,after,errors,method:'Ordinary opening and real pointer/keyboard UI; reads state only; no save injection or internal dispatch'},null,2));
});
