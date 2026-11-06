import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {playOpening} from '../../../e2e/opening';
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
   const {mapsForNeighbourhood}=await import('/src/world/dynamic.ts');const {restoreWorld}=await import('/src/world/state.ts');const {findPath}=await import('/src/world/geometry.ts');const {cameraForMap,project}=await import('/src/world/camera.ts');
   const maps=mapsForNeighbourhood(save.neighbourhood),world=restoreWorld(save.world,maps,save.neighbourhood.location),map=maps[world.mapId];
   const distance=Math.hypot(world.position.x-target.x,world.position.y-target.y);if(distance<.19)return {done:true};
   const path=findPath(map,world.position,target);if(!path.length)return {error:`No path ${map.id} ${JSON.stringify(world.position)} to ${JSON.stringify(target)}`};
   const next=path[0],dx=next.x-world.position.x,dy=next.y-world.position.y,length=Math.hypot(dx,dy),amount=Math.min(1,2.5/length),point={x:world.position.x+dx*amount,y:world.position.y+dy*amount};
   const canvas=document.querySelector<HTMLCanvasElement>('.connected-world canvas')!,rect=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,world.position,canvas.width,canvas.height,rect.width<600?11:15),pixel=project(point,camera);
   return {point,x:rect.left+pixel.x/canvas.width*rect.width,y:rect.top+pixel.y/canvas.height*rect.height,mapId:map.id};
  },{save:before,target});
  if(step.done)return;if(step.error)throw new Error(step.error);
  await page.mouse.click(step.x!,step.y!);
  await expect.poll(async()=>{const after=await state(page);return after.world?.mapId!==mapId||Math.hypot(after.world.position.x-step.point!.x,after.world.position.y-step.point!.y)<.24;},{timeout:12000}).toBe(true);
 }
 throw new Error('Traversal exceeded 240 real click steps');
}
async function anchor(page:Page,id:string){const target=await page.evaluate(async id=>{const {worldMaps}=await import('/src/world/registry.ts');return Object.values(worldMaps).flatMap(m=>m.anchors).find(a=>a.id===id)!.position;},id);await walkTo(page,target);await page.locator(`[data-world-anchor="${id}"]`).click();}
async function exit(page:Page,targetMap:string){const save=await state(page),mapId=save.world.mapId;const target=await page.evaluate(async({mapId,targetMap})=>{const {worldMaps}=await import('/src/world/registry.ts');const e=worldMaps[mapId].exits.find(e=>e.targetMapId===targetMap)!;if(!e)throw new Error(`Missing edge ${mapId} -> ${targetMap}`);return {x:e.rect.x+e.rect.width/2,y:e.rect.y+e.rect.height/2};},{mapId,targetMap});await walkTo(page,target,mapId);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',targetMap);}
test('ordinary opening, physical service, connected travel and reload',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
 const checkpoints:any[]=[];
 for(const table of [1,2,3]){
  await anchor(page,`restaurant.table-${table}`);await expect(page.getByRole('dialog',{name:`${table}桌点餐`})).toBeVisible();
  if(table===1){await page.locator('.paper-panel .spoken .word').first().click();await expect(page.locator('.word-popover .pinyin')).toBeVisible();await page.getByRole('button',{name:'关闭词卡'}).click();}
  const save=await state(page),order=await page.evaluate(async({save,table})=>{const {content}=await import('/src/neighbourhood/registry.ts');const order=content.orders.find(o=>o.id===save.customers.find((c:any)=>c.table===table).orderId)!;return {...order,foods:order.items.map(i=>({name:content.foods.find(f=>f.id===i.foodId)!.word.hanzi,quantity:i.quantity,price:content.foods.find(f=>f.id===i.foodId)!.price}))};},{save,table});
  await page.getByRole('button',{name:'关闭',exact:true}).click();await anchor(page,'restaurant.kitchen');
  for(const item of order.foods)for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${item.name}`,exact:true}).click();
  await page.getByRole('button',{name:'端好了，去上菜'}).click();await anchor(page,`restaurant.table-${table}`);
  await page.getByRole('button',{name:'上菜',exact:false}).last().click();
  const total=order.foods.reduce((sum:any,f:any)=>sum+f.price*f.quantity,0);for(let n=0;n<order.paid-total;n++)await page.getByRole('button',{name:'+1块',exact:true}).click();
  await page.getByRole('button',{name:'递上找零'}).click();await expect(page.locator('.thanks-chop')).toBeVisible();await page.getByRole('button',{name:'继续招呼'}).click();
  checkpoints.push({table,state:await state(page)});
 }
 await page.screenshot({path:`docs/evidence/0078/${info.project.name}-service-world.png`});
 const route=info.project.name==='desktop'?['town','courtyard','residential-hall','residential-stairs','apartment','residential-stairs','rooftop','residential-stairs','residential-hall','town','workshop','town','park','riverbank','town','restaurant']:['town','courtyard','town','restaurant'];
 for(const destination of route){await exit(page,destination);await page.screenshot({path:`docs/evidence/0078/${info.project.name}-${destination}-arrival.png`});checkpoints.push({destination,state:await state(page)});}
 const world=page.getByTestId('world-viewport');await world.focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(180);await page.keyboard.up('ArrowUp');await page.waitForTimeout(900);
 const before=await stores(page);await page.reload();await page.waitForTimeout(900);const after=await stores(page);
 expect(after.saved.world.position).toEqual(before.saved.world.position);expect(after.saved.served).toBe(3);expect(Object.keys(after.saved.journal).length).toBeGreaterThan(0);expect(errors).toEqual([]);
 await writeFile(`docs/evidence/0078/${info.project.name}-journey-proof.json`,JSON.stringify({checkpoints,before,after,errors,method:'Ordinary opening and real pointer/keyboard UI; reads state only; no save injection or internal dispatch'},null,2));
});
