import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const results=[];
try{
 for(const[device,viewport]of[['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5481/?test=1&seed=42');await page.getByRole('button',{name:'开门迎客'}).click();await page.locator('[data-testid="world-viewport"]').focus();
  await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowLeft');await page.waitForSelector('[data-map="town"]',{timeout:10000});await page.keyboard.up('ArrowDown');await page.keyboard.up('ArrowLeft');await page.waitForTimeout(700);
  const before=await page.evaluate(()=>window.__TEST__.getState().world);
  const cdp=await context.newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  const inputs=[['ArrowDown','ArrowRight'],['ArrowUp','ArrowLeft'],['ArrowDown','ArrowLeft'],['ArrowUp','ArrowRight']];
  for(const keys of inputs){for(const key of keys)await page.keyboard.down(key);await page.waitForTimeout(1400);for(const key of keys)await page.keyboard.up(key);}
  const{profile}=await cdp.send('Profiler.stop');await cdp.send('Profiler.disable');
  const after=await page.evaluate(()=>window.__TEST__.getState().world);
  await page.screenshot({path:`docs/evidence/0079/profile-${device}-town.png`});await writeFile(`docs/evidence/0079/profile-${device}.cpuprofile`,JSON.stringify(profile));
  if(!profile.samples?.length||before.mapId!=='town'||after.mapId!=='town'||errors.length)throw Error('Profile work or console precondition failed');
  results.push({device,viewport,logicalCanvas:await page.locator('canvas').first().evaluate(c=>({width:c.width,height:c.height})),before,after,errors,profile:`profile-${device}.cpuprofile`,profiledInputs:inputs});await context.close();
 }
 await writeFile('docs/evidence/0079/profile-report.json',JSON.stringify({sourceHead,browser:await browser.version(),purpose:'Diagnostic CPU profiles of actual production town rendering and real keyboard movement. Not a benchmark or a phone-hardware FPS acceptance claim.',controlled:'Sequential contexts; existing caches warmed after actual restaurant exit; no competing proof browser. Timings inside profiler are diagnostic only.',results,performanceAcceptance:'open for central profiling and broader devices'},null,2)+'\n');
}finally{await browser.close();}
