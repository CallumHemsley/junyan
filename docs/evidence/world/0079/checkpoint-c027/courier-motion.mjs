import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const out=resolve('docs/evidence/0079'), sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
async function run(device,viewport,touch) {
 const context=await browser.newContext({viewport,isMobile:touch,hasTouch:touch,reducedMotion:'no-preference',recordVideo:{dir:resolve('output/0079-raw'),size:viewport}});
 const page=await context.newPage(), errors=[], samples=[], landmarks=new Set();
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try {
  await page.goto('http://127.0.0.1:5481/?test=1&seed=42');
  await page.waitForSelector('[data-testid="world-viewport"]');
  const origin=await page.evaluate(()=>performance.now());
  await page.getByRole('button',{name:'开门迎客'}).click();
  await page.locator('[data-testid="world-viewport"]').focus();
  await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowLeft');
  await page.waitForSelector('[data-map="town"]',{timeout:10000});
  await page.keyboard.up('ArrowDown');await page.keyboard.up('ArrowLeft');
  const plan=await page.evaluate(async()=>{const {planFor}=await import('/src/world/life-bridge.ts');const {worldMaps}=await import('/src/world/registry.ts');const game=window.__TEST__.getState();const plan=planFor(worldMaps.town,game);const actor=plan.actors.find(a=>a.characterId==='resident-courier');return{diagnostics:plan.diagnostics,actors:plan.actors.filter(a=>a.characterId==='resident-courier').length,route:actor.phases,durationMs:actor.durationMs,hasGreeting:!!actor.profile.greeting};});
  if(plan.actors!==1||plan.diagnostics.length||plan.hasGreeting)throw Error('Canonical courier precondition failed');
  const deadline=Date.now()+Math.min(160000,plan.durationMs+18000);
  let index=0;
  while(Date.now()<deadline) {
   const sample=await page.evaluate(async origin=>{
    const {actorsFor}=await import('/src/world/life-bridge.ts');const {worldMaps}=await import('/src/world/registry.ts');const {canStand,findPath}=await import('/src/world/geometry.ts');const {cameraForMap,project}=await import('/src/world/camera.ts');
    const game=window.__TEST__.getState(), world=game.world,map=worldMaps[world.mapId],elapsedEstimate=performance.now()-origin;
    const courier=actorsFor(map,game,world,elapsedEstimate,false).find(a=>a.characterId==='resident-courier');
    if(!courier)throw Error('Courier omitted from shared sampling');
    let route=[];
    for(const [dx,dy]of[[1.8,1.8],[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[3,0],[0,3],[-3,0],[0,-3]]){
     const target={x:courier.position.x+dx,y:courier.position.y+dy};if(!canStand(map,target))continue;
     route=findPath(map,world.position,target);if(route.length)break;
    }
    const target=route[0];let click=null;
    if(target){const dx=target.x-world.position.x,dy=target.y-world.position.y,d=Math.hypot(dx,dy);if(d>.15){const next={x:world.position.x+dx*Math.min(1,2.3/d),y:world.position.y+dy*Math.min(1,2.3/d)};const canvas=document.querySelector('[data-testid="world-viewport"] canvas'),r=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,world.position,canvas.width,canvas.height,r.width<600?11:15),p=project(next,camera);click={x:r.x+p.x*r.width/canvas.width,y:r.y+p.y*r.height/canvas.height};}}
    const stops=[['market',{x:35.5,y:44.1}],['book-window',{x:7.2,y:30.2}],['junction',{x:24.3,y:29.2}]];
    const stop=stops.find(([,p])=>Math.hypot(p.x-courier.position.x,p.y-courier.position.y)<.25)?.[0];
    return{elapsedEstimate,courier:{id:courier.characterId,position:courier.position,activity:courier.activity,action:courier.action},player:world.position,click,stop};
   },origin);
   samples.push(sample);
   if(sample.click){if(touch)await page.touchscreen.tap(sample.click.x,sample.click.y);else await page.mouse.click(sample.click.x,sample.click.y);}
   if(sample.stop&&!landmarks.has(sample.stop)){await page.screenshot({path:resolve(out,`courier-${device}-${sample.stop}.png`)});landmarks.add(sample.stop);console.log(`${device}: courier ${sample.stop}`);}
   if(index%10===0)await page.screenshot({path:resolve(out,`courier-${device}-motion-${String(index).padStart(3,'0')}.png`)});
   index++;await page.waitForTimeout(1000);
  }
  const video=page.video();await context.close();
  return{device,sourceHead,plan,samples,landmarkEstimates:[...landmarks],consoleErrors:errors,rawVideo:await video.path(),clockNote:'Passive viewport-mount wall-time estimate guides only real player input. It does not set world time or NPC state. Images and video must be inspected for visible proof.'};
 }catch(error){await page.screenshot({path:resolve(out,`courier-${device}-failure.png`)}).catch(()=>{});await context.close();return{device,sourceHead,consoleErrors:errors,samples,failure:String(error)};}
}
try {
 const results=await Promise.all([run('desktop',{width:1280,height:800},false),run('phone',{width:390,height:844},true)]);
 await writeFile(resolve(out,'courier-motion-proof.json'),JSON.stringify({sourceHead,capturedAt:new Date().toISOString(),results},null,2)+'\n');
 if(results.some(r=>r.failure||r.consoleErrors.length))throw Error('Courier production proof failed');
}finally{await browser.close();}
