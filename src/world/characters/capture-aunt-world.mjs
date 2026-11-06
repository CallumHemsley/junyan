import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output=new URL('../../../docs/evidence/0085/contact/world/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
async function worldState(page){return page.evaluate(async()=>{const game=window.__TEST__.getState();const{mapsForNeighbourhood}=await import('/src/world/dynamic.ts');const{restoreWorld}=await import('/src/world/state.ts');const maps=mapsForNeighbourhood(game.neighbourhood,game.day);return restoreWorld(game.world,maps,game.neighbourhood.location);});}
async function walkTo(page,target,expectedMap){
 const compass=[{x:1,y:0,keys:['ArrowDown','ArrowRight']},{x:0,y:1,keys:['ArrowDown','ArrowLeft']},{x:-1,y:0,keys:['ArrowUp','ArrowLeft']},{x:0,y:-1,keys:['ArrowUp','ArrowRight']},{x:Math.SQRT1_2,y:Math.SQRT1_2,keys:['ArrowDown']},{x:-Math.SQRT1_2,y:-Math.SQRT1_2,keys:['ArrowUp']},{x:Math.SQRT1_2,y:-Math.SQRT1_2,keys:['ArrowRight']},{x:-Math.SQRT1_2,y:Math.SQRT1_2,keys:['ArrowLeft']}];
 for(let i=0;i<1200;i++) {
  const world=await worldState(page);if(expectedMap&&world.mapId!==expectedMap)return;
  if(Math.hypot(world.position.x-target.x,world.position.y-target.y)<.18)return;
  const step=await page.evaluate(async({target,expectedMap})=>{
   const game=window.__TEST__.getState();const{mapsForNeighbourhood}=await import('/src/world/dynamic.ts');const{restoreWorld}=await import('/src/world/state.ts');const{findPath,canWalk}=await import('/src/world/geometry.ts');
   const maps=mapsForNeighbourhood(game.neighbourhood,game.day),world=restoreWorld(game.world,maps,game.neighbourhood.location);if(expectedMap&&world.mapId!==expectedMap)return{done:true};
   const map=maps[world.mapId],path=findPath(map,world.position,target);
   if(!path.length)return{error:'No collision-safe route '+map.id+' '+JSON.stringify(world.position)};
   const next=path.find(p=>Math.hypot(p.x-world.position.x,p.y-world.position.y)>.12&&canWalk(map,world.position,p))??path[0];
   return{dx:next.x-world.position.x,dy:next.y-world.position.y};
  },{target,expectedMap});
  if(step.done)return;if(step.error)throw new Error(step.error);
  const distance=Math.hypot(step.dx,step.dy);if(distance<.001)continue;
  const direction=compass.reduce((best,d)=>d.x*step.dx+d.y*step.dy>best.x*step.dx+best.y*step.dy?d:best);
  await page.getByTestId('world-viewport').focus();
  for(const key of direction.keys)await page.keyboard.down(key);
  await page.waitForTimeout(Math.max(18,Math.min(100,distance/5*800)));
  for(const key of direction.keys)await page.keyboard.up(key);
 }
 throw new Error('Ordinary keyboard traversal exceeded bounded step count '+JSON.stringify(await worldState(page)));
}
async function exitTo(page,targetMap){const current=await worldState(page);const target=await page.evaluate(async({mapId,targetMap})=>{const{worldMaps}=await import('/src/world/registry.ts');const exit=worldMaps[mapId].exits.find(e=>e.targetMapId===targetMap);if(!exit)throw new Error('Missing map edge');return{x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2};},{mapId:current.mapId,targetMap});await walkTo(page,target,current.mapId);assert.equal((await worldState(page)).mapId,targetMap);}
try {
 for(const[name,width,height,dpr]of[['desktop',1280,900,1],['phone',390,844,2]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,recordVideo:{dir:output+'raw',size:{width,height}}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto('http://127.0.0.1:5487/?test=1&seed=42&opening=skip');await page.getByRole('button',{name:/开门迎客/}).click();await page.getByTestId('world-viewport').waitFor();
  await exitTo(page,'town');await exitTo(page,'courtyard');await walkTo(page,{x:23,y:8.5});
  await page.screenshot({path:output+name+'-aunt-landmark.png'});
  await page.waitForTimeout(2500);await page.screenshot({path:output+name+'-aunt-motion.png'});
  const world=await worldState(page),catalog=await page.evaluate(async()=>{const{supportedActorIds,diagnoseActorIds,getActorDefinition}=await import('/src/world/characters/index.ts');return{supportedActorIds,aunt:getActorDefinition('aunt'),diagnostic:diagnoseActorIds(['aunt','player'])};});
  assert.equal(world.mapId,'courtyard');assert.equal(errors.length,0,errors.join('\n'));assert.deepEqual(catalog.diagnostic,[]);
  results.push({name,width,height,dpr,world,catalog,errors,source:{foundation:'31908fd',actor:'418933f'},scope:'Actual App ordinary keyboard traversal from restaurant through town to courtyard. Dev test hook skips opening and reads state only; no dispatch, teleport or save writes. SeatHeight is not yet passed by foundation and is not accepted by this aunt proof.'});
  const video=page.video();await context.close();if(video)await video.saveAs(output+name+'-courtyard-walk.webm');
 }
 await writeFile(output+'results.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
console.log(JSON.stringify(results));
