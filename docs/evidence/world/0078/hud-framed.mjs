import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});await mkdir('docs/evidence/world/0078/hud-framed',{recursive:true});const records=[];
for(const [device,width,height] of [['desktop',1440,1000],['phone',390,844]])for(const phase of ['ordered','checkout','served']){
 const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5480/audio/manifest.json');
 await page.evaluate(async phase=>{
  const {createGame,orderTotal}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{worldMaps}=await import('/src/world/registry.ts'),{createWorld}=await import('/src/world/state.ts'),{validateSavedGame}=await import('/src/save.ts');
  const game=createGame(content,42),customer=game.customers.find(c=>c.table===2),order=content.orders.find(o=>o.id===customer.orderId),total=orderTotal(order,content);
  game.world={...createWorld(worldMaps),position:{x:18.5,y:9}};
  if(phase!=='ordered'){customer.phase=phase;game.activeTable=2;}
  if(phase==='served'){game.served=1;game.earnings=total;game.receipt={table:2,total,change:order.paid-total};game.feedback='thanks';}
  if(!validateSavedGame(game,content))throw new Error('Invalid declared phase fixture');
  const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onupgradeneeded=()=>request.result.createObjectStore('saves');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
 },phase);
 await page.goto('http://127.0.0.1:5480/');await page.waitForFunction(()=>document.querySelector('.connected-world canvas')?.dataset.rendered==='true');const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.click();
 await page.locator('[data-world-anchor="restaurant.table-2"]').click();await page.locator('.world-context').waitFor();await page.waitForTimeout(250);
 const metrics=await page.evaluate(async()=>{
  const {cameraForMap,project}=await import('/src/world/camera.ts'),{worldMaps}=await import('/src/world/registry.ts');const panel=document.querySelector('.world-context').getBoundingClientRect(),canvas=document.querySelector('.connected-world canvas'),rect=canvas.getBoundingClientRect();
  const camera=cameraForMap(worldMaps.restaurant.bounds,{x:18.5,y:9},canvas.width,canvas.height,rect.width<600?11:15,rect.width<800?(panel.height+84)/2:0,rect.width>=800?(panel.width+32)/2:0),pixel=project({x:18.5,y:9},camera);
  const player={x:rect.left+pixel.x/canvas.width*rect.width,y:rect.top+pixel.y/canvas.height*rect.height};
  const button=document.querySelector('.world-context-actions button'),style=getComputedStyle(button),bounds=button.getBoundingClientRect();
  return {panel:panel.toJSON(),player,playerCovered:player.x>=panel.left&&player.x<=panel.right&&player.y>=panel.top&&player.y<=panel.bottom,footer:{color:style.color,background:style.backgroundColor,width:bounds.width,height:bounds.height},nestedButtons:document.querySelectorAll('button button').length};
 });
 if(metrics.playerCovered)throw new Error(`Player remains covered in ${device}/${phase}`);
 await page.screenshot({path:`docs/evidence/world/0078/hud-framed/${device}-${phase}.png`});records.push({device,phase,metrics,errors});await context.close();
}
await writeFile('docs/evidence/world/0078/hud-framed/results.json',JSON.stringify({sourceHead:'2f1fcaa720ffd15fbbed10a3a061a14f3671af8a',method:'Validated saved table-phase fixtures; actual physical anchor click and current App/HUD/renderer; not normal service journey',records},null,2));await browser.close();
