import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {playOpening} from '../../../../e2e/opening';
// Browser screencasting/video deliberately keeps pages visible in Chromium. Disable it for this check.
test.use({video:'off',trace:{mode:'retain-on-failure',screenshots:false,snapshots:true}});
test('real cloud tab visibility suspends painting and reduced motion keeps logical time',async({page,context},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 await page.locator('.connected-world canvas[data-rendered="true"]').waitFor();
 await page.evaluate(()=>{
  const canvas=document.querySelector('.connected-world canvas')!;
  const report={paints:0,timestamps:[] as number[],longTasks:[] as number[]};
  new MutationObserver(records=>{for(const r of records)if(r.attributeName==='data-rendered'){report.paints++;report.timestamps.push(performance.now());}}).observe(canvas,{attributes:true,attributeFilter:['data-rendered']});
  new PerformanceObserver(list=>{report.longTasks.push(...list.getEntries().map(e=>e.duration));}).observe({type:'longtask',buffered:false});
  Object.assign(window,{__ATMOSPHERE_SCHEDULING_REPORT__:report});
 });
 const read=()=>page.evaluate(async()=>{
  let save=JSON.parse(localStorage.getItem('junyan-waiter-pending-v1')??'null');
  if(!save){const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});save=await new Promise<any>((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();}
  return {hidden:document.hidden,elapsed:save?.world?.life?.elapsedMs,report:structuredClone((window as any).__ATMOSPHERE_SCHEDULING_REPORT__)};
 });
 await page.waitForTimeout(1400);const reducedStart=await read();await page.waitForTimeout(1400);const visibleBefore=await read();expect(visibleBefore.elapsed).toBeGreaterThan(reducedStart.elapsed);
 // Playwright 1.64 enables persistent focus emulation by default (coreBundle.js).
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:false});
 const popup=context.waitForEvent('page');await page.evaluate(()=>window.open('about:blank','_blank'));const cover=await popup;await cover.waitForLoadState();await cover.bringToFront();
 await cover.waitForTimeout(600);
 if(!(await page.evaluate(()=>document.hidden))){
  await writeFile(`docs/evidence/world/0086/ordinary/${info.project.name}-scheduling.json`,JSON.stringify({status:'hidden-tab-inconclusive',reducedStart,visibleBefore,afterNativeTabSwitch:await read(),errors,reason:'Cloud Chromium reports both real tabs visible, including after default focus emulation was disabled. No document.hidden override, no suspension acceptance claimed.'},null,2));
  test.skip(true,'Cloud Chromium did not expose a hidden tab; actual suspension proof remains required.');
 }
 await expect.poll(()=>page.evaluate(()=>document.hidden)).toBe(true);
 const hiddenStart=await read();await cover.waitForTimeout(1400);const hiddenEnd=await read();
 expect(hiddenEnd.report.paints).toBe(hiddenStart.report.paints);expect(hiddenEnd.elapsed).toBe(hiddenStart.elapsed);
 await page.bringToFront();await expect.poll(()=>page.evaluate(()=>document.hidden)).toBe(false);
 await page.waitForTimeout(1600);const resumed=await read();
 expect(resumed.report.paints).toBeGreaterThan(hiddenEnd.report.paints);expect(resumed.elapsed).toBeGreaterThan(hiddenEnd.elapsed);
 expect(resumed.elapsed-hiddenEnd.elapsed).toBeLessThan(2200);expect(errors).toEqual([]);
 await writeFile(`docs/evidence/world/0086/ordinary/${info.project.name}-scheduling.json`,JSON.stringify({visibleBefore,hiddenStart,hiddenEnd,resumed,errors,method:'Actual headed cloud Chromium background tab after disabling Playwright default persistent focus emulation; no synthetic document.hidden override. Paint-completion cadence and long tasks are browser CPU observations, not GPU FPS or input latency.'},null,2));
 await cover.close();
});
