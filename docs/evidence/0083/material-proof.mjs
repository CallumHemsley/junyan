import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const dir=new URL('./materials/',import.meta.url).pathname;
await mkdir(dir,{recursive:true});
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const results=[];
for(const [phase,served] of [['morning',0],['evening',3]]){
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5485/src/world/art/rooftop/harness.html?test=1');
 await page.evaluate(async served=>{
  const {createGame,getOrder,orderTotal}=await import('/src/game.ts');
  const {content}=await import('/src/neighbourhood/registry.ts');
  const {saveGame,validateSavedGame}=await import('/src/save.ts');
  const game=createGame(content,42);game.neighbourhood.location='garden';
  const garden=game.neighbourhood.garden;garden.restored=true;garden.planterEarned=true;
  for(const plant of Object.values(garden.plants)){plant.growth=3;plant.care='ready';}
  game.served=served;
  game.customers.forEach((customer,i)=>{if(i<served){customer.phase='served';game.earnings+=orderTotal(getOrder(game,customer.table,content),content);}});
  game.world={version:1,mapId:'rooftop',position:{x:23,y:20},facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null};
  if(!validateSavedGame(game,content))throw new Error('Invalid phase fixture');
  localStorage.removeItem('junyan-waiter-pending-v1');await saveGame(game);
 },served);
 await page.goto('http://127.0.0.1:5485/?seed=42');
 await page.locator('[data-map="rooftop"] canvas[data-rendered="true"]').waitFor();
 await page.waitForTimeout(300);
 const samples=await page.evaluate(async()=>{
  const {cameraForMap,project}=await import('/src/world/camera.ts');
  const {worldMaps}=await import('/src/world/registry.ts');
  const {atmosphereHooksForMap}=await import('/src/world/atmosphere/map-hooks.ts');
  const canvas=document.querySelector('[data-map="rooftop"] canvas'),ctx=canvas.getContext('2d');
  const camera=cameraForMap({width:48,height:36},{x:23,y:20},canvas.width,canvas.height,15);
  const samples={};
  for(const [id,x,y,z] of [['roof',22,18,0],['wood',33,30.4,1.15],['foliage',20,6,1.8],['stone',10,10,0]]){
   const p=project({x,y},camera,z);samples[id]={world:{x,y,z},pixel:p,rgba:Array.from(ctx.getImageData(Math.round(p.x),Math.round(p.y),1,1).data)};
  }
  return {samples,logicalCanvas:{width:canvas.width,height:canvas.height},particles:atmosphereHooksForMap(worldMaps.rooftop).particles??[],camera};
 });
 await page.screenshot({path:`${dir}${phase}-desktop.png`});
 results.push({sourceHead,phase,served,...samples,errors,note:'Actual App and production painter. Valid seeded service/garden fixtures; same map/camera. Roof has no particle hooks. Reduced motion freezes incidental animation.'});
 await context.close();
}
await browser.close();
await writeFile(`${dir}proof.json`,JSON.stringify(results,null,2));
for(const id of ['roof','wood','foliage','stone'])if(JSON.stringify(results[0].samples[id].rgba)===JSON.stringify(results[1].samples[id].rgba))throw new Error(`Material sample did not change: ${id}`);
if(results.some(r=>r.errors.length))throw new Error('Page errors');
