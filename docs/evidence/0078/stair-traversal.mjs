import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const out='docs/evidence/0078/stair-traversal';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',recordVideo:{dir:out,size:{width:390,height:844}}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/src/world/painter.ts*',async route=>{
 const response=await route.fetch(),source=await response.text();
 const signature='export function drawPlayer(ctx, view, p, facing, moving, _scale, motion, carrying = false) {';
 if(!source.includes(signature))throw Error('Player observation boundary changed');
 await route.fulfill({response,body:source.replace(signature,signature+`const entries=globalThis.__feet??=[];entries.push({at:performance.now(),position:p,pixel:view.project(p),elapsedMs:view.elapsedMs});if(entries.length>6000)entries.shift();`)});
});
await page.goto('http://127.0.0.1:5480/audio/manifest.json');
await page.evaluate(async()=>{
 const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{worldMaps}=await import('/src/world/registry.ts'),{createWorld}=await import('/src/world/state.ts'),{initialLifeState}=await import('/src/world/life/index.ts'),{validateSavedGame}=await import('/src/save.ts');
 const game=createGame(content,42);game.world={...createWorld(worldMaps),mapId:'residential-stairs',position:worldMaps['residential-stairs'].defaultSpawn,life:{...initialLifeState(),elapsedMs:22000}};
 if(!validateSavedGame(game,content))throw Error('Invalid declared stair arrival fixture');
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
});
await page.goto('http://127.0.0.1:5480/');await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');
const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.tap();
async function current(){return page.evaluate(async()=>{
 const pending=JSON.parse(localStorage.getItem('junyan-waiter-pending-v1')??'null');if(pending)return pending;
 const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);});
 const result=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});db.close();return result;
});}
const stops=[];
async function walk(target,mapId){
 for(let attempt=0;attempt<100;attempt++){
  const game=await current();if(game.world.mapId!==mapId)return;
  if(Math.hypot(game.world.position.x-target.x,game.world.position.y-target.y)<.2)return;
  const step=await page.evaluate(async({game,target})=>{
   const {worldMaps}=await import('/src/world/registry.ts'),{findPath}=await import('/src/world/geometry.ts'),{surfaceHeight}=await import('/src/world/surfaces.ts'),{cameraForMap,project}=await import('/src/world/camera.ts');
   const world=game.world,map=worldMaps[world.mapId],path=findPath(map,world.position,target);if(!path.length)throw Error('No stair route');
   const next=path[0],length=Math.hypot(next.x-world.position.x,next.y-world.position.y),fraction=Math.min(1,2.3/length),p={x:world.position.x+(next.x-world.position.x)*fraction,y:world.position.y+(next.y-world.position.y)*fraction};
   const canvas=document.querySelector('.connected-world canvas'),rect=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,world.position,canvas.width,canvas.height,11,0,0,surfaceHeight(map.id,world.position)),pixel=project(p,camera,surfaceHeight(map.id,p));
   return {point:p,x:rect.left+pixel.x/canvas.width*rect.width,y:rect.top+pixel.y/canvas.height*rect.height};
  },{game,target});
  await page.touchscreen.tap(step.x,step.y);
  const deadline=Date.now()+6000;let reached=false;
  while(Date.now()<deadline){await page.waitForTimeout(100);const after=await current();if(after.world.mapId!==mapId||Math.hypot(after.world.position.x-step.point.x,after.world.position.y-step.point.y)<.22){reached=true;break;}}
  if(!reached)throw Error('Touch route stalled '+JSON.stringify({step,state:(await current()).world}));
 }
 throw Error('Route exceeded bounded steps');
}
async function capture(name){await page.screenshot({path:`${out}/${name}.png`});stops.push({name,world:(await current()).world});}
async function portal(destination){const game=await current(),target=await page.evaluate(async({mapId,destination})=>{const {worldMaps}=await import('/src/world/registry.ts');const r=worldMaps[mapId].exits.find(e=>e.targetMapId===destination).rect;return {x:r.x+r.width/2,y:r.y+r.height/2};},{mapId:game.world.mapId,destination});await walk(target,game.world.mapId);if((await current()).world.mapId!==destination)throw Error('Portal not reached '+destination);}
try{
 await capture('hall-landing');
 await walk({x:6,y:28},'residential-stairs');await capture('lower-flight');
 await walk({x:6,y:22},'residential-stairs');await capture('home-landing');
 await portal('apartment');await capture('apartment');await portal('residential-stairs');
 await walk({x:17,y:14},'residential-stairs');await capture('upper-flight');
 await walk({x:17,y:5.5},'residential-stairs');await capture('roof-landing');
 await portal('rooftop');await capture('rooftop');await portal('residential-stairs');
 await walk({x:17,y:5.5},'residential-stairs');await walk({x:17,y:21.5},'residential-stairs');
 await walk({x:6,y:21.5},'residential-stairs');await walk({x:6,y:37},'residential-stairs');await portal('residential-hall');await capture('descent-hall');
 const feet=await page.evaluate(()=>globalThis.__feet);await page.waitForTimeout(500);const before=(await current()).world;await page.reload();await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');await page.waitForTimeout(400);const after=(await current()).world;
 if(before.mapId!==after.mapId||JSON.stringify(before.position)!==JSON.stringify(after.position)||errors.length)throw Error('Reload/errors');
 await writeFile(`${out}/results.json`,JSON.stringify({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),method:'Declared saved stair arrival, real touchscreen taps thereafter; observation-only drawn-foot sampling, no internal dispatch',stops,feet,before,after,errors},null,2));
}finally{await context.close();await browser.close();}
