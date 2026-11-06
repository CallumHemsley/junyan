import{chromium}from'@playwright/test';
import{ACTOR_PIXELS_PER_WORLD_UNIT}from'./calibration.mjs';
import{mkdir,writeFile}from'node:fs/promises';
import assert from'node:assert/strict';
const output=new URL('../../../docs/evidence/world/0085/reference-scale-v1/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
try{
 for(const[name,width,height,dpr,scale]of[['desktop-18',1320,1000,1,18],['desktop-24',1320,1000,1,24],['phone-18-dpr1',390,844,1,18],['phone-24-dpr2',390,844,2,24]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5487/src/world/characters/reference-study.html?scale='+scale);await page.waitForFunction(()=>window.__REFERENCE_SCALE_STUDY__);
  const cast=name.startsWith('desktop')?['lin-jie','xiao-li','zhang-laoshi','xiao-zhou','player','aunt','resident-reader','resident-courier','resident-groundskeeper','resident-laundry-neighbour','resident-river-walker']:['lin-jie','zhang-laoshi'];
  for(const actor of cast){
   await page.selectOption('#actor',actor);const state=await page.evaluate(()=>window.__REFERENCE_SCALE_STUDY__);assert.equal(state.records.length,15);assert(state.records.every(r=>r.objects>=2));
   for(const record of state.records)if(record.contacts.requestedSeatHeight!==undefined)assert(Math.abs(record.contacts.pelvis.height-record.contacts.requestedSeatHeight)<=1/record.pixelsPerWorldUnit);
   await page.screenshot({path:output+name+'-'+actor+'.png',fullPage:true});
   if(name==='desktop-24'&&actor==='lin-jie')for(const reference of ['door','chair','dining','workbench','bed'])for(const study of ['contact18','common15','local18']){const data=await page.locator(`canvas[data-reference="${reference}"][data-study="${study}"]`).evaluate(c=>c.toDataURL('image/png').split(',')[1]);await writeFile(output+reference+'-'+study+'.png',Buffer.from(data,'base64'));}
   results.push({name,dpr,scale,actor,records:state.records,errors:[...errors]});
  }
  assert.equal(errors.length,0,errors.join('\n'));await page.close();
 }
 await writeFile(output+'results.json',JSON.stringify({sourceDependency:'31908fd',chosenPlan:'f876255',d196PhysicalProfile:{tableTop:1.44,stoolTop:.77,rearStoolCenterOffsetY:-.52},studiesOnly:true,productionDefaultPixelsPerUnit:ACTOR_PIXELS_PER_WORLD_UNIT,results},null,2));
}finally{await browser.close();}
