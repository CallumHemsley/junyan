import { chromium } from '../../../node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
const evidence=fileURLToPath(new URL('.',import.meta.url));
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});
const results=[];
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:name==='phone',hasTouch:name==='phone',recordVideo:{dir:evidence+'traversal-video',size:{width:Math.min(width,960),height:Math.min(height,900)}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5483/src/world/art/residential/traversal.html');
 await page.locator('canvas[data-rendered=true]').waitFor();
 const state=async()=>JSON.parse(await page.locator('[data-residential-state]').getAttribute('data-residential-state'));
 const route=[];
 async function go(x,y,expected){
  const s=await state(),rect=await page.locator('.connected-world canvas').boundingBox(),scale=rect.width<600?18:24;
  const cx=rect.x+rect.width/2+(x-s.position.x-y+s.position.y)*scale;
  const cy=rect.y+rect.height/2+(x-s.position.x+y-s.position.y)*scale*.5;
  if(cx<rect.x||cy<rect.y||cx>rect.x+rect.width||cy>rect.y+rect.height)throw Error('target outside viewport '+[x,y]);
  if(name==='phone')await page.touchscreen.tap(cx,cy);else await page.mouse.click(cx,cy);
  await page.waitForFunction(({x,y,expected})=>{const s=JSON.parse(document.querySelector('[data-residential-state]').getAttribute('data-residential-state'));return expected?s.mapId===expected:Math.hypot(s.position.x-x,s.position.y-y)<.1},{x,y,expected},{timeout:15000});
  route.push(await state());
 }
 const before=await state();
 await page.locator('.connected-world').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');
 const after=await state();if(Math.hypot(after.position.x-before.position.x,after.position.y-before.position.y)<.2)throw Error('keyboard did not move');
 for(const [x,y,expected] of [[16,14],[16,7],[16,3.5,'residential-stairs'],[6,36],[5.5,29],[5.5,21.5],[12,21.5],[19.2,21.5,'apartment']])await go(x,y,expected);
 await page.screenshot({path:`${evidence}${name}-actual-viewport-apartment.png`});
 for(const [x,y,expected] of [[27.5,21.5,'residential-stairs'],[12,21.5],[5.5,21.5],[5.5,29],[5.5,36],[11.5,39.5,'residential-hall']])await go(x,y,expected);
 await page.screenshot({path:`${evidence}${name}-actual-viewport-return.png`});
 results.push({name,errors,route,keyboardDistance:Math.hypot(after.position.x-before.position.x,after.position.y-before.position.y)});
 await context.close();
}
await browser.close();writeFileSync(evidence+'local-traversal.json',JSON.stringify({scope:'real shared viewport and three residential maps; external graph, activity, furniture save not integrated',results},null,2));console.log(results.map(r=>({name:r.name,errors:r.errors,steps:r.route.length})));
