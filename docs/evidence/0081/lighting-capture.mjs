import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
const evidence=fileURLToPath(new URL('.',import.meta.url));
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});const results=[];
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [phase,lit] of [['morning',0],['evening',0],['evening',1]]){
  await page.goto(`http://127.0.0.1:5483/src/world/art/residential/lighting.html?phase=${phase}&lit=${lit}`);await page.locator('canvas[data-ready=true]').waitFor();
  await page.screenshot({path:`${evidence}${name}-${phase}-${lit?'lit':'materials'}.png`});
  const pixels=await page.locator('canvas').evaluate(canvas=>{const ctx=canvas.getContext('2d'),samples=[];for(const [x,y] of [[.5,.4],[.45,.3],[.6,.6],[.7,.4]])samples.push({x:Math.floor(canvas.width*x),y:Math.floor(canvas.height*y),rgba:[...ctx.getImageData(Math.floor(canvas.width*x),Math.floor(canvas.height*y),1,1).data]});return samples;});
  results.push({name,phase,lit,pixels,errors});
 }
 await page.close();
}
await browser.close();writeFileSync(evidence+'lighting-proof.json',JSON.stringify({scope:'production paintWorld with authoritative named phase; camera and real saved furniture placements held fixed; material captures disable particles via reduced motion',results},null,2));console.log(results.map(r=>({name:r.name,phase:r.phase,lit:r.lit,errors:r.errors})));
