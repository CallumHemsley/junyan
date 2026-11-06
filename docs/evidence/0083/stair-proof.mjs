import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const dir=new URL('./stairs/',import.meta.url).pathname;await mkdir(dir,{recursive:true});
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const results=[];
for(const [device,width,height] of [['desktop',1440,900],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:device==='phone',isMobile:device==='phone',serviceWorkers:'block',recordVideo:{dir,size:{width,height}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const video=page.video();
 await page.goto('http://127.0.0.1:5485/src/world/art/rooftop/harness.html?test=1');
 await page.evaluate(async()=>{
  const {createGame}=await import('/src/game.ts');const {content}=await import('/src/neighbourhood/registry.ts');const {saveGame}=await import('/src/save.ts');
  const game=createGame(content,42);game.neighbourhood.location='garden';localStorage.removeItem('junyan-waiter-pending-v1');await saveGame(game);
 });
 await page.goto('http://127.0.0.1:5485/?seed=42');
 const read=()=>page.evaluate(async()=>{const raw=localStorage.getItem('junyan-waiter-pending-v1');if(raw)return JSON.parse(raw);const {loadGame}=await import('/src/save.ts');const {content}=await import('/src/neighbourhood/registry.ts');return loadGame(content);});
 const transitions=[];
 for(const [from,to,target] of [['rooftop','residential-stairs',{x:10,y:29}],['residential-stairs','rooftop',{x:3.5,y:5.5}]]){
  const canvas=page.locator(`[data-map="${from}"] canvas[data-rendered="true"]`);await canvas.waitFor();await page.waitForTimeout(200);
  const box=await canvas.boundingBox(),game=await read();
  const pixel=await page.evaluate(async({target,width,height,game,from})=>{
   const {worldMaps}=await import('/src/world/registry.ts');const {cameraForMap,project}=await import('/src/world/camera.ts');
   const canvas=document.querySelector(`[data-map="${from}"] canvas`);const map=worldMaps[from];
   const position=game.world?.position??map.defaultSpawn;const camera=cameraForMap(map.bounds,position,canvas.width,canvas.height,width<600?11:15);const p=project(target,camera);
   return {x:p.x*width/canvas.width,y:p.y*height/canvas.height};
  },{target,width:box.width,height:box.height,game,from});
  await page.screenshot({path:`${dir}${device}-before-${from}.png`});
  if(device==='phone')await page.touchscreen.tap(box.x+pixel.x,box.y+pixel.y);else await page.mouse.click(box.x+pixel.x,box.y+pixel.y);
  await page.locator(`[data-map="${to}"] canvas[data-rendered="true"]`).waitFor();await page.waitForTimeout(250);
  const saved=await read();if(saved.world.mapId!==to)throw new Error(`Portal state mismatch ${to}`);
  transitions.push({from,to,world:saved.world});await page.screenshot({path:`${dir}${device}-arrived-${to}.png`});
 }
 await page.reload();await page.locator('[data-map="rooftop"] canvas[data-rendered="true"]').waitFor();
 results.push({sourceHead,device,transitions,reloaded:(await read()).world,errors,note:'Real App ground input through reciprocal roof/stair triggers. Seeded legacy garden start; full town/courtyard journey remains global verification.'});
 await context.close();await video.saveAs(`${dir}${device}-stairs.webm`);
}
await browser.close();await writeFile(`${dir}proof.json`,JSON.stringify(results,null,2));if(results.some(r=>r.errors.length))throw new Error('Page error');
