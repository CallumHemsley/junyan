import {test,expect} from '@playwright/test';
import {playOpening} from '../../../../e2e/opening';
import {writeFile,appendFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import definitions from './maps.json' with {type:'json'};
import {restaurantMap} from './restaurant.mjs';
import {findPath,canStand} from './geometry.mjs';
import {projectGarden,furnitureColliders} from './dynamic.mjs';
import {cameraForMap,project} from './camera.mjs';
const dir='docs/evidence/0088/integrated-23be251';
const maps=Object.fromEntries([restaurantMap,...definitions].map(m=>[m.id,m]));
async function game(page:any){return page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return await new Promise<any>((resolve,reject)=>{const t=db.transaction('saves');const r=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(r.result);db.close()};t.onerror=()=>reject(t.error)})})}
function dynamicMap(id:string,saved:any){const base=maps[id];if(id==='rooftop')return {...base,colliders:[...base.colliders,...projectGarden(saved.neighbourhood.garden).colliders]};if(id==='apartment')return {...base,colliders:[...base.colliders,...furnitureColliders(saved.neighbourhood.apartment)]};return base;}
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
  const camera=cameraForMap(maps[expectedMap].bounds,from,Math.ceil(rect.width/2),Math.ceil(rect.height/2),rect.width<600?11:15);
  const p=project(local,camera);const x=rect.x+p.x*rect.width/camera.width,y=rect.y+p.y*rect.height/camera.height;
  if(x<rect.x||x>rect.x+rect.width||y<rect.y||y>rect.y+rect.height)throw new Error(`Route target outside camera ${expectedMap}`);
  await page.mouse.click(x,y);await page.waitForTimeout(limit/5*1000+180);
  const after=await world(page);if(after.mapId===expectedMap&&Math.hypot(after.position.x-from.x,after.position.y-from.y)<.025)throw new Error(`Input stalled ${expectedMap} at ${JSON.stringify(from)} toward ${JSON.stringify(local)}`);
 }
 throw new Error(`Route timeout ${expectedMap}`);
}
async function closeActivity(page:any){const close=page.getByRole('button',{name:'关闭',exact:true});if(await close.count())await close.last().click();const walk=page.getByRole('button',{name:'继续走走',exact:true});if(await walk.count())await walk.click();}
async function enter(page:any,id:string){const w=await world(page),a=maps[w.mapId].anchors.find((a:any)=>a.id===id);if(!a)throw new Error(`anchor absent ${id}`);let target=a.position;if(!canStand(maps[w.mapId],target)){const options=[];for(let x=-a.radius;x<=a.radius;x+=.3)for(let y=-a.radius;y<=a.radius;y+=.3){const p={x:a.position.x+x,y:a.position.y+y};if(Math.hypot(x,y)<=a.radius&&canStand(maps[w.mapId],p))options.push(p)}target=options.sort((p,q)=>Math.hypot(p.x-w.position.x,p.y-w.position.y)-Math.hypot(q.x-w.position.x,q.y-w.position.y))[0];}if(!target)throw new Error('no anchor approach');await walkTo(page,target,w.mapId);await page.locator(`[data-world-anchor="${id}"]`).click();}

const content=JSON.parse(readFileSync('/workspace/junyan-review-integration/src/content/content.json','utf8'));
const gardenData=JSON.parse(readFileSync('/workspace/junyan-review-integration/src/features/garden/content.json','utf8'));
const gardenName=(id:string)=>gardenData.words.find((w:any)=>w.id===gardenData.labels[id]).hanzi;
async function travel(page:any,route:string[]){for(const next of route){const before=await world(page),m=maps[before.mapId],exit=m.exits.find((e:any)=>e.targetMapId===next);if(!exit)throw new Error(`No edge ${m.id}->${next}`);await walkTo(page,{x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2},m.id);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',next);}}
test('physical service, journal, furnishing undo, garden and repair continuity; cats remain separate',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const log=`${dir}/${info.project.name}-activity-events.jsonl`;await writeFile(log,'');
 const note=async(stage:string)=>{const state=await game(page);await appendFile(log,JSON.stringify({stage,at:new Date().toISOString(),state})+'\n');console.log(info.project.name,stage);await page.screenshot({path:`${dir}/${info.project.name}-activity-${stage}.png`,fullPage:true});};
 try {
  await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await page.waitForTimeout(700);expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
  for(const table of [1,2,3]){
   await enter(page,`restaurant.table-${table}`);
   const dialog=page.getByRole('dialog',{name:`${table}桌点餐`});await expect(dialog).toBeVisible();
   const current=await game(page),customer=current.customers.find((c:any)=>c.table===table),order=content.orders.find((o:any)=>o.id===customer.orderId);
   if(table===1){await dialog.locator('[data-word-lookup]').first().click();await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();await page.getByRole('button',{name:'关闭词卡',exact:true}).click();}
   await closeActivity(page);await enter(page,'restaurant.kitchen');
   for(const item of order.items){const food=content.foods.find((f:any)=>f.id===item.foodId);for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${food.word.hanzi}`,exact:true}).click();}
   await closeActivity(page);await enter(page,`restaurant.table-${table}`);
   await dialog.getByRole('button',{name:/^上菜/}).click();
   const total=order.items.reduce((sum:number,item:any)=>sum+content.foods.find((f:any)=>f.id===item.foodId).price*item.quantity,0);
   for(let n=0;n<order.paid-total;n++)await dialog.getByRole('button',{name:'+1块',exact:true}).click();
   await dialog.getByRole('button',{name:'递上找零'}).click();await expect(dialog.locator('.thanks-chop')).toBeVisible();
   await dialog.getByRole('button',{name:/继续招呼/}).click();await closeActivity(page);
   await expect.poll(async()=> (await game(page)).served).toBe(table);await note(`served-${table}`);
  }
  await page.getByRole('button',{name:/本子/}).click();await expect(page.getByRole('dialog',{name:'本子',exact:true}).locator('.journal-list')).toBeVisible();await note('journal');await closeActivity(page);
  // Cat controls blocked at c4ec; separate unaffected activity coverage, no forced interaction.
  await travel(page,['town','courtyard']);
  await travel(page,['residential-hall','residential-stairs','apartment']);await enter(page,'apartment.furnish');await page.getByRole('button',{name:'收下',exact:true}).click();
  const original=(await game(page)).neighbourhood.apartment.placements;
  await page.locator('.apartment-items').getByRole('button',{name:/桌子/}).click();await page.getByRole('button',{name:'选格子',exact:true}).click();await page.getByRole('button',{name:/第2行第3格/}).click();await page.getByRole('button',{name:'放这里',exact:true}).click();
  await expect.poll(async()=> (await game(page)).neighbourhood.apartment.placements.find((p:any)=>p.id==='table')).toMatchObject({x:2,y:1});await note('furnished');
  await page.getByRole('button',{name:'撤回',exact:true}).click();await expect.poll(async()=> (await game(page)).neighbourhood.apartment.placements).toEqual(original);
  const beforeReload=await game(page);await page.reload();await expect(page.locator('[data-world-activity="apartment"]')).toBeVisible();
  await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(beforeReload.neighbourhood);expect((await game(page)).world.position).toEqual(beforeReload.world.position);expect((await game(page)).world.activeAnchorId).toBe('apartment.furnish');await note('undo-reloaded');await closeActivity(page);
  await travel(page,['residential-stairs','rooftop']);await enter(page,'rooftop.garden');await expect(page.getByTestId('garden-view')).toBeVisible();await page.locator(`.garden-tool-button[aria-label="${gardenName('tidy')}"]`).click();
  for(const plant of ['climber','tree']){await page.getByRole('button',{name:`${gardenName('select')}${gardenName(plant)}`,exact:true}).click();await page.locator(`.garden-tool-button[aria-label="${gardenName('water-verb')}"]`).click();await expect.poll(async()=> (await game(page)).neighbourhood.garden.plants[plant].care).toBe('ready');}
  await note('garden-cared');const cared=(await game(page)).neighbourhood;await page.reload();await expect(page.getByTestId('garden-view')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(cared);await closeActivity(page);
  await travel(page,['residential-stairs','residential-hall','town','workshop']);await enter(page,'workshop.lamp');
  await page.getByTestId('repair-part-bulb').click();await page.locator('.repair-part-actions').getByRole('button',{name:'拧紧',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'试试',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'放回',exact:true}).click();await note('lamp-repaired');
  const repaired=(await game(page)).neighbourhood;await page.reload();await expect(page.locator('[data-world-activity="repairs"]')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(repaired);await closeActivity(page);
  expect(errors).toEqual([]);
 } finally {await writeFile(`${dir}/${info.project.name}-activity-final.json`,JSON.stringify({head:'23be251185d989f7b97d36391a8f6478344b1a3b',errors,state:await game(page)},null,2));await page.screenshot({path:`${dir}/${info.project.name}-activity-final.png`,fullPage:true});}
});
