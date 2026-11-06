import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const root='/workspace/junyan/docs/evidence/0086/shadows';await mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const errors=[],evidence=[];let pixels;
for(const [name,width,height]of[['desktop',1280,900],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5488/src/world/atmosphere/shadow-study.html');await page.waitForFunction(()=>window.__SHADOWS__);
 pixels=await page.evaluate(()=>window.__SHADOWS__.pixelProof());
 if(String(pixels.single)!==String(pixels.overlap)||Math.abs(pixels.inherited[3]-32)>1||pixels.restored!==.5||pixels.contactFull===0||Math.abs(pixels.contactFaded-pixels.contactFull*.5)>1||pixels.contactRestored!==.5||pixels.deck[3]!==0||Math.abs(pixels.outside[3]-64)>1)throw Error(JSON.stringify(pixels));
 for(const site of ['pond','bridge','grove'])for(const mode of ['ground','cast','contact','objects','combined']){
  const state=await page.evaluate(({site,mode})=>window.__SHADOWS__.draw(site,mode,'evening'),{site,mode});await page.screenshot({path:`${root}/${name}-${site}-${mode}.png`});evidence.push({name,...state});
 }
 if(name==='desktop')for(const site of ['pond','bridge','grove'])for(const mode of ['cast','combined']){
  const state=await page.evaluate(({site,mode})=>window.__SHADOWS__.draw(site,mode,'morning'),{site,mode});await page.screenshot({path:`${root}/${name}-${site}-${mode}-morning.png`});evidence.push({name,...state});
 }
 await page.close();
}
await browser.close();const sourceInputs=Object.fromEntries(await Promise.all(['src/world/atmosphere/index.ts','src/world/atmosphere/canvas.ts','src/world/atmosphere/map-hooks.ts','src/world/atmosphere/shadow-study.ts','src/world/art/landscape/index.ts','src/world/art/landscape/draw.ts'].map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));await writeFile(`${root}/proof.json`,JSON.stringify({atmosphere:'5d0609a',landscape:'52a4046',sourceInputs,claim:'Isolated native ground/contact/object callbacks and atmosphere cast layer. Ground includes contact; contact/cast/object modes are rendered alone on neutral backing.',errors,pixels,evidence},null,2));if(errors.length)throw Error(errors.join('\n'));console.log('Isolated layers captured; overlap, inherited alpha and deck exclusion pixel checks passed.');
