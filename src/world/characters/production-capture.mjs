import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output=new URL('../../../docs/evidence/world/0085/current/production/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
try {
 for(const [name,width,height,dpr] of [['desktop',1280,900,1],['phone-dpr1',390,844,1],['phone-dpr2',390,844,2]]) {
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:dpr,hasTouch:name!=='desktop',recordVideo:{dir:output+'raw',size:{width,height}}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5487/?test=1&seed=42&opening=skip');
  const start=page.getByRole('button',{name:/开门迎客/});await start.waitFor();await start.click();
  const world=page.getByTestId('world-viewport');await world.waitFor();
  const close=page.getByRole('button',{name:'继续走走',exact:true});if(await close.count())await close.click();
  await world.focus();await page.waitForTimeout(300);
  const initial=await page.evaluate(async()=>{const {restoreWorld}=await import('/src/world/state.ts');const {worldMaps}=await import('/src/world/registry.ts');return restoreWorld(window.__TEST__.getState().world,worldMaps);});
  await page.screenshot({path:output+name+'-start.png'});
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(900);await page.screenshot({path:output+name+'-walk.png'});await page.keyboard.up('ArrowRight');
  const right=await page.evaluate(()=>window.__TEST__.getState().world);
  assert(Math.hypot(right.position.x-initial.position.x,right.position.y-initial.position.y)>1);
  await page.keyboard.down('ArrowUp');await page.waitForTimeout(900);await page.keyboard.up('ArrowUp');
  await page.screenshot({path:output+name+'-scenery.png'});
  const finish=await page.evaluate(()=>window.__TEST__.getState().world);
  const canvas=await world.locator('canvas').evaluate(c=>({width:c.width,height:c.height,cssWidth:c.getBoundingClientRect().width,cssHeight:c.getBoundingClientRect().height,dpr:devicePixelRatio}));
  assert.equal(canvas.dpr,dpr);
  assert.equal(errors.length,0,errors.join('\n'));
  const video=page.video();await context.close();if(video)await video.saveAs(output+name+'-motion.webm');
  results.push({name,dpr,initial,right,finish,canvas,errors,source:'foundation 1450bf6 plus character 8ff0220'});
 }
 await writeFile(output+'results.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
console.log(JSON.stringify(results));
