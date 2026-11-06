import {test,expect} from '@playwright/test';
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

test('ordinary travel then one pointer route behind workshop lamp bench',async({page},info)=>{
 await start(page);const stages:any[]=[];const note=async(stage:string)=>{stages.push({stage,world:await world(page)});};
 await travel(page,['town','workshop'],note);await walkTo(page,{x:8,y:6.8},'workshop');
 const before=await world(page),canvas=page.getByTestId('world-viewport').locator('canvas'),rect=await canvas.boundingBox();if(!rect)throw Error('canvas absent');
 const camera=cameraForMap(maps.workshop.bounds,before.position,await canvas.evaluate((c:any)=>c.width),await canvas.evaluate((c:any)=>c.height),rect.width<600?11:15);const target={x:8,y:10.8},at=project(target,camera),point={x:rect.x+at.x*rect.width/camera.width,y:rect.y+at.y*rect.height/camera.height};
 expect(await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.tagName,point)).toBe('CANVAS');await page.screenshot({path:`${dir}/${info.project.name}-waypoint-before.png`});
 const started=Date.now();if(info.project.name==='phone')await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
 await expect.poll(async()=>{const w=await world(page);return Math.hypot(w.position.x-target.x,w.position.y-target.y);},{timeout:15000}).toBeLessThan(.15);
 const after=await world(page);await page.screenshot({path:`${dir}/${info.project.name}-waypoint-after.png`});await writeFile(`${dir}/${info.project.name}-waypoint-runtime.json`,JSON.stringify({head:HEAD,kind:'normal opening and physical doors; one actual canvas target around lamp bench; no fixture/save writes',input:info.project.name==='phone'?'native touchscreen.tap':'mouse.click',before,target,after,durationMs:Date.now()-started,stages},null,2));
});
