import {chromium} from '@playwright/test';
import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url).pathname;
const cameraSource=await readFile('src/world/camera.ts','utf8');
const {cameraForMap,project}=await import(`data:text/javascript;base64,${Buffer.from(ts.transpile(cameraSource,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022})).toString('base64')}`);
const prepared=JSON.parse(await readFile(`${dir}fixtures.json`,'utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const reports=[];
for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]]){
 const game=structuredClone(prepared.fixtures.find(f=>f.phase==='morning').game);game.world.position={x:12.5,y:29};game.neighbourhood.garden.plants.climber.care='dry';game.neighbourhood.garden.plants.climber.site=2;
 const context=await browser.newContext({viewport:{width,height},hasTouch:device==='phone',isMobile:device==='phone',serviceWorkers:'block',recordVideo:{dir,size:{width,height}}});
 await context.addInitScript(save=>{if(!localStorage.getItem('world-0083-started')){localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(save));localStorage.setItem('world-0083-started','yes');}},game);
 const page=await context.newPage(),errors=[],steps=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});const video=page.video();
 const read=()=>page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);return new Promise((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves'),q=tx.objectStore('saves').get('v1');tx.oncomplete=()=>{resolve(q.result);db.close();};tx.onerror=()=>reject(tx.error);};request.onerror=()=>reject(request.error);});});
 await page.goto('http://127.0.0.1:5485/');await page.locator('[data-map=rooftop] canvas[data-rendered=true]').waitFor();const welcome=page.getByRole('button',{name:/^开门迎客/});if(await welcome.isVisible())await welcome.click();await page.locator('.modal-backdrop').waitFor({state:'hidden'});
 const shot=label=>page.screenshot({path:`${dir}${device}-${label}.png`,fullPage:true});
 const walk=async(target,map='rooftop',nextMap=map)=>{
  const canvas=page.locator(`[data-map="${map}"] canvas[data-rendered=true]`);await canvas.waitFor();await page.waitForTimeout(180);const before=await read(),box=await canvas.boundingBox(),logical=await canvas.evaluate(c=>({width:c.width,height:c.height}));
  const bounds=map==='rooftop'?{width:48,height:36}:{width:24,height:43};const p=project(target,cameraForMap(bounds,before.world.position,logical.width,logical.height,box.width<600?11:15));const pixel={x:box.x+p.x*box.width/logical.width,y:box.y+p.y*box.height/logical.height};
  if(pixel.x<box.x||pixel.x>box.x+box.width||pixel.y<box.y||pixel.y>box.y+box.height)throw new Error(`Target offscreen ${JSON.stringify({target,pixel,box})}`);
  if(device==='phone')await page.touchscreen.tap(pixel.x,pixel.y);else await page.mouse.click(pixel.x,pixel.y);
  let after;for(let i=0;i<140;i++){await page.waitForTimeout(100);after=await read();if(nextMap!==map?after.world.mapId===nextMap:Math.hypot(after.world.position.x-target.x,after.world.position.y-target.y)<.18)break;}
  if(nextMap!==map?after.world.mapId!==nextMap:Math.hypot(after.world.position.x-target.x,after.world.position.y-target.y)>.18)throw new Error(`Input did not reach target ${JSON.stringify({target,before:before.world.position,after:after.world})}`);
  steps.push({input:device==='phone'?'ordinary touchscreen ground tap':'ordinary mouse ground click',map,target,pixel,from:before.world.position,to:after.world.position,toMap:after.world.mapId});
 };
 await shot('arrival');await walk({x:14.44,y:27.09});await shot('under-threshold');await walk({x:17,y:24});await walk({x:19,y:20});await shot('care-reached');
 await page.locator('[data-world-anchor="rooftop.garden"]').click();await page.locator('[data-presentation=controls]').waitFor();await page.locator('.garden-pot-select[aria-label="选藤"]').click();const before=await read();await page.locator('.garden-tool-button[aria-label="浇水"]').click();await page.waitForTimeout(450);const watered=await read();if(watered.neighbourhood.garden.plants.climber.care!=='ready')throw new Error('Water did not persist');for(const id of ['flower','tree'])if(JSON.stringify(before.neighbourhood.garden.plants[id])!==JSON.stringify(watered.neighbourhood.garden.plants[id]))throw new Error('Other plant changed');
 await page.locator('.garden-tool-button[aria-label="搬"]').click();const targets=await page.locator('.garden-placement-choices button').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));if(targets.some(t=>t.width<44||t.height<44))throw new Error('Small target');await page.locator('.garden-placement-choices button').nth(1).click();await page.waitForTimeout(450);const moved=await read();if(moved.neighbourhood.garden.plants.climber.site!==1)throw new Error('Pot move did not persist');await shot('watered-and-moved-controls');await page.getByRole('button',{name:'继续走走'}).click();await page.waitForTimeout(450);await shot('moved-pot-real-scene');
 await page.reload();await page.locator('[data-map=rooftop] canvas[data-rendered=true]').waitFor();await page.waitForTimeout(300);const reloaded=await read();if(reloaded.neighbourhood.garden.plants.climber.site!==1||reloaded.neighbourhood.garden.plants.climber.care!=='ready')throw new Error('Reload lost consequences');if(reloaded.day!==game.day||reloaded.served!==game.served)throw new Error('Garden advanced service/day');await shot('reload-consequences');
 await walk({x:17,y:24});await walk({x:14.44,y:27.09});await walk({x:12.5,y:29});await walk({x:10,y:29},'rooftop','residential-stairs');await shot('ordinary-stair-departure');await walk({x:3.5,y:5.5},'residential-stairs','rooftop');await shot('ordinary-stair-return');const returned=await read();
 reports.push({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),device,kind:'Production App ordinary inputs after explicitly declared arrival save; not full opening/service journey',cameraSourceSha256:createHash('sha256').update(cameraSource).digest('hex'),steps,targets,beforeGarden:before.neighbourhood.garden,wateredGarden:watered.neighbourhood.garden,movedGarden:moved.neighbourhood.garden,reloadedWorld:reloaded.world,returnedWorld:returned.world,day:returned.day,served:returned.served,errors});
 await context.close();await video.saveAs(`${dir}${device}-actual-traversal.webm`);
}
await browser.close();await writeFile(`${dir}traversal.json`,JSON.stringify(reports,null,2));if(reports.some(r=>r.errors.length))throw new Error('Browser errors');
