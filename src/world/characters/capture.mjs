import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output=new URL('../../../docs/evidence/0085/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
try {
 for(const [name,width,height] of [['desktop',1280,900],['phone',390,844]]) {
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:output+'video/',size:{width,height}},hasTouch:name==='phone'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5487/src/world/characters/harness.html');
  await page.waitForFunction(()=>window.__ACTOR_FIXTURE__);
  await page.screenshot({path:output+name+'-comparison.png',fullPage:true});
  if(name==='desktop'){const data=await page.locator('#sheet').evaluate(canvas=>canvas.toDataURL('image/png').split(',')[1]);await writeFile(output+'revised-directions-2x.png',Buffer.from(data,'base64'));}
  await page.locator('#after').focus();
  const start=await page.evaluate(()=>({...window.__ACTOR_FIXTURE__.state}));
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(850);await page.keyboard.up('ArrowRight');
  const east=await page.evaluate(()=>({...window.__ACTOR_FIXTURE__.state}));
  assert(east.x>start.x+1&&east.facing==='east');
  await page.keyboard.down('ArrowUp');await page.waitForTimeout(700);await page.keyboard.up('ArrowUp');
  const north=await page.evaluate(()=>({...window.__ACTOR_FIXTURE__.state}));
  assert(north.y<east.y-1&&north.facing==='north');
  await page.locator('#after').scrollIntoViewIfNeeded();
  const box=await page.locator('#after').boundingBox();
  await page.locator('#after')[name==='phone'?'tap':'click']({position:{x:box.width*.72,y:box.height*.68}});
  await page.waitForTimeout(1400);
  const touch=await page.evaluate(()=>({...window.__ACTOR_FIXTURE__.state}));
  assert(Math.hypot(touch.x-north.x,touch.y-north.y)>1);
  await page.selectOption('#cast','xiao-zhou');await page.selectOption('#pose','crouch');
  await page.screenshot({path:output+name+'-crouch.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});
  const first=await page.evaluate(()=>Array.from(window.__ACTOR_FIXTURE__.sample().frame.pixels));
  await page.waitForTimeout(350);
  const second=await page.evaluate(()=>Array.from(window.__ACTOR_FIXTURE__.sample().frame.pixels));
  assert.deepEqual(first,second);
  assert.equal(errors.length,0,errors.join('\n'));
  results.push({name,start,east,north,touch,errors,reducedMotionPixelsEqual:true});
  const video=page.video();
  await context.close();
  if(video)await video.saveAs(output+name+'-motion.webm');
 }
 await writeFile(output+'fixture-results.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
console.log(JSON.stringify(results));
