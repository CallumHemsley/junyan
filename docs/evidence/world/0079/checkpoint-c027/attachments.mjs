import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const out=resolve('docs/evidence/0079');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
async function journey(device,viewport,touch) {
 const context=await browser.newContext({viewport,isMobile:touch,hasTouch:touch,reducedMotion:'no-preference',recordVideo:{dir:resolve('output/0079-raw'),size:viewport}});
 const page=await context.newPage();const errors=[];const steps=[];let lastCommand=null;
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const state=()=>page.evaluate(()=>window.__TEST__.getState().world);
 try {
  await page.goto('http://127.0.0.1:5481/?test=1&seed=42');
  await page.getByRole('button',{name:'开门迎客'}).click();
  await page.locator('[data-testid="world-viewport"]').focus();
  await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowLeft');
  await page.waitForSelector('[data-map="town"]',{timeout:10000});
  await page.keyboard.up('ArrowDown');await page.keyboard.up('ArrowLeft');
  steps.push({action:'keyboard left restaurant',state:await state()});
  async function walkPoint(target,label) {
   const targetMapId="town";
   const before=await state();const mapId=before.mapId;
   const route=await page.evaluate(async({target})=>{const {worldMaps}=await import('/src/world/registry.ts');const {findPath}=await import('/src/world/geometry.ts');const s=window.__TEST__.getState().world;return findPath(worldMaps[s.mapId],s.position,target);},{target});
   if(!route.length)throw Error(`No route ${mapId} to ${targetMapId}`);
   let transitioned=false;
   for(const waypoint of route) {
    for(let i=0;i<120;i++) {
     await page.waitForTimeout(150);
     const s=await state();if(s.mapId!==mapId){transitioned=true;break;}
     const dx=waypoint.x-s.position.x,dy=waypoint.y-s.position.y,d=Math.hypot(dx,dy);if(d<.12)break;
     const next={x:s.position.x+dx*Math.min(1,2.3/d),y:s.position.y+dy*Math.min(1,2.3/d)};
     const p=await page.evaluate(async next=>{
      const {cameraForMap,project}=await import('/src/world/camera.ts');
      const {worldMaps}=await import('/src/world/registry.ts');
      const s=window.__TEST__.getState().world;
      const canvas=document.querySelector('[data-testid="world-viewport"] canvas');
      const rect=canvas.getBoundingClientRect();
      const camera=cameraForMap(worldMaps[s.mapId].bounds,s.position,canvas.width,canvas.height,rect.width<600?11:15);
      const point=project(next,camera);
      return{x:rect.x+point.x*rect.width/canvas.width,y:rect.y+point.y*rect.height/canvas.height};
     },next);
     lastCommand={mapId,targetMapId,waypoint,from:s.position,next,p};
     if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
     await page.waitForFunction(({next,mapId})=>{const s=window.__TEST__.getState().world;return s.mapId!==mapId||Math.hypot(s.position.x-next.x,s.position.y-next.y)<.11;},{next,mapId},{timeout:10000});
    }
    if(transitioned)break;
   }
   await page.waitForTimeout(200);
   const after=await state();if(after.mapId!==targetMapId||Math.hypot(after.position.x-target.x,after.position.y-target.y)>.32)throw Error(`Approach failed ${label}`);
   steps.push({action:`${touch?'touch':'pointer'} approach ${label}`,state:after});
   await page.screenshot({path:resolve(out,`depth-${device}-${label}.png`)});
   console.log(`${device}: ${label}`);
  }
  for(const [label,target] of [ ['book-front-left-fixed',{x:7,y:29.4}], ['book-front-right-fixed',{x:14,y:29.4}], ['book-rear-fixed',{x:13,y:23.5}], ['residence-laundry-visible',{x:22.5,y:22}], ['south-laundry-visible',{x:23.5,y:51}] ])await walkPoint(target,label);
  if(errors.length)throw Error(errors.join('\n'));
  const video=page.video();await context.close();
  return {device,sourceHead,normalMotion:true,steps,consoleErrors:errors,rawVideo:await video.path()};
 } catch(error) {await page.screenshot({path:resolve(out,`depth-${device}-failure.png`)}).catch(()=>{});const failedState=await state().catch(()=>null);await context.close();return{device,sourceHead,steps,consoleErrors:errors,failure:String(error),lastCommand,failedState};}
}
try {
 const results=await Promise.all(false?[journey('desktop',{width:1280,height:800},false)]:[journey('desktop',{width:1280,height:800},false),journey('phone',{width:390,height:844},true)]);
 await writeFile(resolve(out,'attachment-depth-proof.json'),JSON.stringify({sourceHead,capturedAt:new Date().toISOString(),results},null,2)+'\n');
 if(results.some(result=>result.failure))throw Error('Depth journey failed; see depth-proof.json');
} finally {await browser.close();}
