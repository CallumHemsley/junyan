import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
// Run against an isolated Vite server; all browser audio stays muted.
const phase=process.argv[2]||'after', root=resolve('output/playwright/0059',phase);
const url=process.argv[3]||'http://127.0.0.1:5402';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--mute-audio']});
for(const [device,viewport] of Object.entries({desktop:{width:1440,height:1000},phone:{width:390,height:844}})) for(const motion of ['no-preference','reduce']) {
 const dir=resolve(root,`${device}-${motion}`); await mkdir(dir,{recursive:true});
 const context=await browser.newContext({viewport,reducedMotion:motion,recordVideo:{dir,size:viewport}});
 const page=await context.newPage(), errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`${url}/?test=1&seed=42&opening=play`);
 await page.getByRole('button',{name:'醒来',exact:true}).click();
 for(let i=0;i<6;i++) await page.getByRole('button',{name:'继续',exact:true}).click();
 await page.locator('main.opening[data-step="6"]').waitFor();
 await page.screenshot({path:resolve(dir,'game.png'),fullPage:true});
 await page.waitForTimeout(4200);
 // Explicit time samples on a separate canvas: same production renderer/frame as the live request.
 const proof=await page.evaluate(async()=>{
  const {createRenderer}=await import('/src/scene/renderer.js');const {wardScene}=await import('/src/scene/ward.js');const {WARD_STEPS}=await import('/src/scene/ward-steps.js');
  const c=document.createElement('canvas'),r=createRenderer(c,wardScene), frame=WARD_STEPS.find(([n])=>n==='ask-milk')[1];
  const samples=[];for(const t of [0,.4,1.3,2.4,3.7]){r.draw(frame,t);samples.push({t,png:c.toDataURL(),pixels:[...c.getContext('2d').getImageData(0,0,360,280).data]});}return samples;
 });
 for(const s of proof)await writeFile(resolve(dir,`time-${s.t}.png`),Buffer.from(s.png.split(',')[1],'base64'));
 const diffs=proof.slice(1).map(s=>({t:s.t,changed:proof[0].pixels.reduce((a,v,i)=>{if(i%4===0&&s.pixels.slice(i,i+3).some((x,k)=>x!==proof[0].pixels[i+k]))a.push([i/4%360,Math.floor(i/4/360)]);return a;},[])}));
 await writeFile(resolve(dir,'frames.json'),JSON.stringify({step:6,motion,viewport,errors,diffs},null,2));
 assert.deepEqual(errors, [], `${device} ${motion} console`);
 await context.close();
 console.log(phase,device,motion,JSON.stringify({errors,changes:diffs.map(d=>[d.t,d.changed.length])}));
}
await browser.close();
