import {test,expect} from '@playwright/test';
import {playOpening} from '../../../../../e2e/opening';
import {writeFile,appendFile} from 'node:fs/promises';
import definitions from './maps.json' with {type:'json'};
import {restaurantMap} from './restaurant.mjs';
import {findPath,canStand} from './geometry.mjs';
import {cameraForMap,project} from './camera.mjs';
const dir='docs/evidence/world/0088/integrated-c4ec7ed';
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
async function closeActivity(page:any){const close=page.getByRole('button',{name:'关闭',exact:true});if(await close.count())await close.last().click();const walk=page.getByRole('button',{name:'继续走走',exact:true});if(await walk.count())await walk.click();}
async function enter(page:any,id:string){const w=await world(page),a=maps[w.mapId].anchors.find((a:any)=>a.id===id);if(!a)throw new Error(`anchor absent ${id}`);let target=a.position;if(!canStand(maps[w.mapId],target)){const options=[];for(let x=-a.radius;x<=a.radius;x+=.3)for(let y=-a.radius;y<=a.radius;y+=.3){const p={x:a.position.x+x,y:a.position.y+y};if(Math.hypot(x,y)<=a.radius&&canStand(maps[w.mapId],p))options.push(p)}target=options.sort((p,q)=>Math.hypot(p.x-w.position.x,p.y-w.position.y)-Math.hypot(q.x-w.position.x,q.y-w.position.y))[0];}if(!target)throw new Error('no anchor approach');await walkTo(page,target,w.mapId);await page.locator(`[data-world-anchor="${id}"]`).click();}
test('normal-input all-map route with actual contextual anchors',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const log=`${dir}/${info.project.name}-events.jsonl`;await writeFile(log,'');
 const note=async(event:any)=>{await appendFile(log,JSON.stringify({at:new Date().toISOString(),...event})+'\n');console.log(info.project.name,JSON.stringify(event));};
 await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await page.waitForTimeout(700);expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
 await page.screenshot({path:`${dir}/${info.project.name}-restaurant-entry.png`,fullPage:true});
 await enter(page,'restaurant.table-1');await expect(page.getByRole('dialog',{name:'1桌点餐'})).toBeVisible();
 await page.screenshot({path:`${dir}/${info.project.name}-table.png`,fullPage:true});
 await page.getByRole('button',{name:'去厨房',exact:true}).click();await page.waitForTimeout(300);await note({kind:'table-go-kitchen',stillTable:await page.getByRole('dialog',{name:'1桌点餐'}).isVisible()});
 await closeActivity(page);await enter(page,'restaurant.kitchen');await expect(page.getByRole('button',{name:'拿包子',exact:true})).toBeVisible();await page.getByRole('button',{name:'拿包子',exact:true}).click();await note({kind:'kitchen-pickup',tray:(await game(page)).tray});await closeActivity(page);
 const route=['town','courtyard','residential-hall','residential-stairs','apartment','residential-stairs','rooftop','residential-stairs','residential-hall','town','workshop','town','riverbank','park','courtyard','town','restaurant'];
 for(const next of route){const before=await world(page),m=maps[before.mapId],exit=m.exits.find((e:any)=>e.targetMapId===next);if(!exit)throw new Error(`No edge ${m.id}->${next}`);const started=Date.now();await walkTo(page,{x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2},m.id);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',next);await note({kind:'edge',from:m.id,to:next,durationMs:Date.now()-started,world:await world(page)});await page.screenshot({path:`${dir}/${info.project.name}-${next}.png`,fullPage:true});
 }
 await writeFile(`${dir}/${info.project.name}-final.json`,JSON.stringify({head:'c4ec7ed6ea60ced7c6c22a1514e273124ceeb678',errors,state:await game(page)},null,2));expect(errors).toEqual([]);
});
