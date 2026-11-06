import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const out=resolve('docs/evidence/world/0079/e02');
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
try {
 for(const [device,viewport] of [['desktop',{width:1440,height:1000}],['phone390',{width:390,height:844}],['phone320',{width:320,height:844}]]) {
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5481/src/world/art/town/preview.html');await page.waitForFunction(()=>window.townPreview);
  for(const [landmark,point] of [['breakfast',{x:34,y:32}],['book-junction',{x:10.5,y:30}],['workshop',{x:73.25,y:31.4}],['rest-junction',{x:17.5,y:30}]]) {
   for(const phase of ['morning','evening']) {
    const fixture=await page.evaluate(({point,phase})=>window.townPreview.production(point,phase,true),{point,phase});
    const filename=`${device}-${landmark}-${phase}.png`;await page.screenshot({path:resolve(out,filename)});
    results.push({device,landmark,phase,point,filename,fixture,consoleErrors:errors});
   }
  }
  results.push({device,alphaProbe:await page.evaluate(()=>window.townPreview.shadeProbe())});
  if(errors.length)throw Error(errors.join('\n'));await page.close();
 }
 await writeFile(resolve(out,'material-proof.json'),JSON.stringify({sourceHead,capturedAt:new Date().toISOString(),surface:'production paintWorld composition fixture; no traversal or phase-progression claim',particlesOff:true,results},null,2)+'\n');
} finally {await browser.close();}
