import { chromium } from '../../../node_modules/@playwright/test/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve('docs/evidence/0084');const output=root+'/'+(process.argv[2]??'preview');await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});
const evidence=[];
try {
 for(const [device,viewport] of [['desktop',{width:1440,height:960}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,hasTouch:device==='phone',isMobile:device==='phone'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [name,map,x,y] of [['pavilion','park',53,21],['pond','park',61,33],['orchard','park',16,52],['bridge','riverbank',48,19],['ferry','riverbank',62,57],['grove','riverbank',72,29]]){
   await page.goto(`http://127.0.0.1:5486/src/world/art/landscape/preview.html?map=${map}&x=${x}&y=${y}`);await page.waitForTimeout(180);
   await page.screenshot({path:`${output}/${device}-${name}.png`});
  }
  await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html?map=riverbank&x=39&y=19');await page.waitForTimeout(100);
  await page.evaluate(()=>{const chunks=[];const recorder=new MediaRecorder(document.querySelector('canvas').captureStream(20),{mimeType:'video/webm'});recorder.ondataavailable=e=>chunks.push(e.data);window.__recording={recorder,chunks};recorder.start();});
  const before=await page.evaluate(()=>window.__LANDSCAPE_PREVIEW__.getState());
  await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowDown');await page.waitForTimeout(1600);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowDown');
  const after=await page.evaluate(()=>window.__LANDSCAPE_PREVIEW__.getState());
  if(after.blocked||after.player.x<before.player.x+5)throw Error('Prototype bridge keyboard traversal did not advance');
  await page.mouse.click(viewport.width/2+45,viewport.height*.58+30);await page.waitForTimeout(500);
  const pointer=await page.evaluate(()=>window.__LANDSCAPE_PREVIEW__.getState());
  const bytes=await page.evaluate(()=>new Promise(resolve=>{const {recorder,chunks}=window.__recording;recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer())));recorder.stop();}));
  await writeFile(`${output}/${device}-bridge-walk.webm`,new Uint8Array(bytes));
  if(errors.length)throw Error(errors.join('\n'));
  evidence.push({device,before,after,pointer,consoleErrors:errors,scope:'shared geometry/camera and production art in isolated authoring harness; full App/save integration pending'});
  await context.close();
 }
 await writeFile(output+'/evidence.json',JSON.stringify(evidence,null,2)+'\n');
}finally{await browser.close();}
