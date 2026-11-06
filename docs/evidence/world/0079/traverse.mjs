import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const out = resolve('docs/evidence/world/0079');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--mute-audio'] });
const results = [];
try {
 for (const [device, viewport, touch] of [['desktop',{width:1280,height:800},false],['phone',{width:390,height:844},true]]) {
  const context = await browser.newContext({ viewport, isMobile:touch, hasTouch:touch, recordVideo:{dir:out,size:viewport}, reducedMotion:'reduce' });
  const page = await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5481/?test=1&seed=42');
  await page.getByRole('button',{name:'开门迎客'}).click();
  await page.locator('[data-testid="world-viewport"]').focus();
  const state=()=>page.evaluate(async()=>{const {restoreWorld}=await import('/src/world/state.ts');const {worldMaps}=await import('/src/world/registry.ts');return restoreWorld(window.__TEST__.getState().world,worldMaps);});
  const walking=[];
  await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(()=>window.__TEST__.getState().world?.mapId==='town',{},{timeout:6000});
  await page.keyboard.up('ArrowDown');await page.keyboard.up('ArrowLeft');
  walking.push({action:'real keyboard restaurant door',state:await state()});
  await page.screenshot({path:resolve(out,`integrated-${device}-breakfast.png`)});
  async function walkTo(target,label) {
   const route=await page.evaluate(async({target})=>{const {findPath}=await import('/src/world/geometry.ts');const {worldMaps}=await import('/src/world/registry.ts');const s=window.__TEST__.getState().world;return findPath(worldMaps[s.mapId],s.position,target);},{target});
   if(!route.length)throw Error(`No production route to ${label}`);
   for(const waypoint of route) {
    for(let attempts=0;attempts<200;attempts++) {
     const s=await state();if(s.mapId!=='town')return;
     const dx=waypoint.x-s.position.x,dy=waypoint.y-s.position.y,d=Math.hypot(dx,dy);if(d<.13)break;
     const next={x:s.position.x+dx*Math.min(1,2.5/d),y:s.position.y+dy*Math.min(1,2.5/d)};
     const rect=await page.locator('[data-testid="world-viewport"] canvas').boundingBox();
     const scale=rect.width<600?18:24;
     const click={x:rect.x+rect.width/2+(next.x-next.y-s.position.x+s.position.y)*scale,y:rect.y+rect.height/2+(next.x+next.y-s.position.x-s.position.y)*scale*.5};
     if(touch)await page.touchscreen.tap(click.x,click.y);else await page.mouse.click(click.x,click.y);
     await page.waitForFunction(({next})=>{const s=window.__TEST__.getState().world;return s.mapId!=='town'||Math.hypot(s.position.x-next.x,s.position.y-next.y)<.11;},{next},{timeout:4000});
    }
   }
   walking.push({action:`${touch?'touch':'pointer'} walking ${label}`,state:await state()});
   await page.screenshot({path:resolve(out,`integrated-${device}-${label}.png`)});
  }
  for(const [label,target] of [['laundry',{x:19.7,y:22.5}],['moon-gate',{x:45,y:9.5}],['market',{x:33,y:40.5}],['workshop',{x:73.25,y:31.4}],['river',{x:67,y:49}]])await walkTo(target,label);
  await walkTo({x:34,y:28.7},'return-restaurant');
  if((await state()).mapId!=='restaurant')throw Error('Restaurant return door failed');
  if(errors.length)throw Error(errors.join('\n'));
  results.push({device,walking,consoleErrors:errors,saveReload:'not covered by test-mode journey',fullGraph:'other owner modules not yet present'});
  const video=page.video();await context.close();await video.saveAs(resolve(out,`integrated-${device}-traversal.webm`));
 }
 await writeFile(resolve(out,'traversal.json'),JSON.stringify(results,null,2)+'\n');
} finally {await browser.close();}
