import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {playOpening} from '../e2e/opening';
async function stores(page:Page){return page.evaluate(async()=>{
 const checkpoint=JSON.parse(localStorage.getItem('junyan-waiter-pending-v1')??'null');
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 const saved=await new Promise<any>((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return {checkpoint,saved};
});}
async function state(page:Page){const s=await stores(page);return s.checkpoint??s.saved;}
async function walkTo(page:Page,target:{x:number;y:number},expectedMap?:string){
 for(let iteration=0;iteration<800;iteration++){
  const before=await state(page);if(iteration%10===0)console.log('STEP',iteration,JSON.stringify(before.world.position));const mapId=before.world?.mapId??'restaurant';if(expectedMap&&mapId!==expectedMap)return;
  const step=await page.evaluate(async({save,target})=>{
   const {mapsForNeighbourhood}=(window as any).__auditHelpers;const {restoreWorld}=(window as any).__auditHelpers;const {findPath}=(window as any).__auditHelpers;const {cameraForMap,project}=(window as any).__auditHelpers;
   const maps=mapsForNeighbourhood(save.neighbourhood),world=restoreWorld(save.world,maps,save.neighbourhood.location),map=maps[world.mapId];
   const distance=Math.hypot(world.position.x-target.x,world.position.y-target.y);if(distance<.3)return {done:true};
   const path=findPath(map,world.position,target);if(!path.length)return {error:`No path ${map.id} ${JSON.stringify(world.position)} to ${JSON.stringify(target)}`};
   const next=path.find(p=>Math.hypot(p.x-world.position.x,p.y-world.position.y)>.3)??path[0],dx=next.x-world.position.x,dy=next.y-world.position.y,length=Math.hypot(dx,dy),amount=Math.min(1,2.5/length),point={x:world.position.x+dx*amount,y:world.position.y+dy*amount};
   const canvas=document.querySelector<HTMLCanvasElement>('.connected-world canvas')!,rect=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,world.position,canvas.width,canvas.height,rect.width<600?11:15),pixel=project(point,camera);
   return {point,x:rect.left+pixel.x/canvas.width*rect.width,y:rect.top+pixel.y/canvas.height*rect.height,mapId:map.id};
  },{save:before,target});
  if(step.done)return;if(step.error)throw new Error(step.error);
  const pos=before.world.position,dx=step.point!.x-pos.x,dy=step.point!.y-pos.y;
  const angle=Math.atan2(dy,dx),oct=((Math.round(angle/(Math.PI/4))%8)+8)%8;
  const keys=[['ArrowDown','ArrowRight'],['ArrowDown'],['ArrowDown','ArrowLeft'],['ArrowLeft'],['ArrowUp','ArrowLeft'],['ArrowUp'],['ArrowUp','ArrowRight'],['ArrowRight']][oct];
  await page.getByTestId('world-viewport').focus();for(const key of keys)await page.keyboard.down(key);await page.waitForTimeout(Math.max(55,Math.min(350,Math.hypot(dx,dy)/5*1000)));for(const key of keys)await page.keyboard.up(key);await page.waitForTimeout(35);

 }
 throw new Error('Traversal exceeded 240 real click steps');
}
async function anchor(page:Page,id:string){const target=await page.evaluate(async id=>{const {worldMaps}=(window as any).__auditHelpers;return Object.values(worldMaps).flatMap(m=>m.anchors).find(a=>a.id===id)!.position;},id);await walkTo(page,target);await page.locator(`[data-world-anchor="${id}"]`).click();}
async function exit(page:Page,targetMap:string){const save=await state(page),mapId=save.world.mapId;const target=await page.evaluate(async({mapId,targetMap})=>{const {worldMaps}=(window as any).__auditHelpers;const e=worldMaps[mapId].exits.find(e=>e.targetMapId===targetMap)!;if(!e)throw new Error(`Missing edge ${mapId} -> ${targetMap}`);return {x:e.rect.x+e.rect.width/2,y:e.rect.y+e.rect.height/2};},{mapId,targetMap});await walkTo(page,target,mapId);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',targetMap);}
test('profile ordinary whole app',async({page})=>{
 const records:any[]=[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const clear=()=>page.evaluate(()=>{(window as any).__perfAudit={};});
 const snap=async(label:string)=>{records.push({label,state:await state(page),timings:await page.evaluate(()=>(window as any).__perfAudit)}); await writeFile('/tmp/exit-wholeapp-profile.json',JSON.stringify({instrumented:true,head:'1cf3532',records,errors}));console.log('PHASE',label);};
 await page.goto('/?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await snap('opening');
 await clear();await page.waitForTimeout(5000);await snap('restaurant-idle-5s');await clear();await page.getByTestId('world-viewport').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(1500);await page.keyboard.up('ArrowUp');await page.waitForTimeout(500);await snap('restaurant-keyboard-2s');await clear();await page.reload();await page.getByTestId('world-viewport').waitFor();await page.waitForTimeout(2000);await snap('restaurant-reload-2s');
 try{const saved=await state(page);await page.goto('/audio/manifest.json');await page.evaluate(async saved=>{saved.neighbourhood.location='apartment';saved.world={...saved.world,mapId:'apartment',position:{x:17.5,y:13.5},facing:'north',activeActivity:'apartment',activeAnchorId:'apartment.furnish',returnPositions:{}};localStorage.removeItem('junyan-waiter-pending-v1');const db=await new Promise<IDBDatabase>(resolve=>{const q=indexedDB.open('junyan-waiter',1);q.onsuccess=()=>resolve(q.result);});await new Promise<void>(resolve=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(saved,'v1');t.oncomplete=()=>resolve();});db.close();},saved);await page.goto('/');await page.getByTestId('world-viewport').waitFor();await page.waitForTimeout(1500);await snap('declared-apartment-active-anchor-fixture');
 const anchors=await page.evaluate(()=>(window as any).__auditHelpers.worldMaps.apartment.anchors);console.log('ANCHORS',JSON.stringify(anchors));
 if(await page.getByRole('button',{name:'收下',exact:true}).count())await page.getByRole('button',{name:'收下',exact:true}).click();
 await clear();for(let i=0;i<6;i++)await page.getByRole('button',{name:i%2?'蓝色':'米色',exact:true}).click();await snap('apartment-six-restyles');
 await clear();await page.reload();await page.waitForTimeout(2000);await snap('apartment-reload-2s');
 }catch(e){errors.push(String(e));await snap('travel-failure');await page.screenshot({path:'/tmp/exit-profile-failure.png'});}finally{await writeFile('/tmp/exit-wholeapp-profile.json',JSON.stringify({instrumented:true,head:'1cf3532',records,errors}));}
});
