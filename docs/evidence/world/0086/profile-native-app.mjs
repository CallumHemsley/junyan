import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root='/workspace/junyan/docs/evidence/world/0086';
const variant=process.env.LOCAL_LIGHT_VARIANT??'candidate';
const proof=JSON.parse(await readFile(`${root}/ordinary/desktop-journey-proof.json`,'utf8'));
const records=proof.checkpoints.filter(c=>c.phase==='evening');
// Six states are unmodified snapshots from normal walking/service. Two broad-map
// cost fixtures use explicit default arrivals, never claimed as journey evidence.
const maps=Object.fromEntries(await Promise.all(['park','riverbank'].map(async id=>[id,JSON.parse(await readFile(`/workspace/junyan/output/world-0086-local-light-app/src/world/maps/landscape/${id}.json`,'utf8'))])));
for(const [id,map]of Object.entries(maps)){
 const state=structuredClone(records[0].state);
 state.world={...state.world,mapId:id,position:{x:map.defaultSpawn.x,y:map.defaultSpawn.y},facing:map.defaultSpawn.facing,activeActivity:null,activeAnchorId:null};
 records.push({destination:id,name:'default-arrival',phase:'evening',state,declaredArrivalFixture:true});
}
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:false,args:['--no-sandbox','--mute-audio']});
const evidence=[],errors=[];
for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]])for(const record of records){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(save=>{localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(save));},record.state);
 await page.goto('http://127.0.0.1:5488/');await page.locator('.connected-world canvas[data-rendered="true"]').waitFor();
 if(await page.evaluate(()=>'__TEST__'in window))throw Error('Unexpected internal test mode');
 await page.waitForTimeout(1500);
 const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
 await page.evaluate(()=>{
  const times=[],longTasks=[];
  const paints=new MutationObserver(()=>times.push(performance.now()));paints.observe(document.querySelector('.connected-world canvas'),{attributes:true,attributeFilter:['data-rendered']});
  const tasks=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));tasks.observe({type:'longtask',buffered:false});
  Object.assign(window,{__APP_COST_OBSERVATION__:{times,longTasks,paints,tasks}});
 });
 const before=await cdp.send('Performance.getMetrics');await page.waitForTimeout(3000);const after=await cdp.send('Performance.getMetrics');
 const observation=await page.evaluate(()=>{const x=window.__APP_COST_OBSERVATION__;x.paints.disconnect();x.tasks.disconnect();return {times:x.times,longTasks:x.longTasks,hidden:document.hidden,canvas:[document.querySelector('canvas').width,document.querySelector('canvas').height]};});
 const metric=(metrics,name)=>metrics.find(m=>m.name===name)?.value??0;
 const elapsedMs=(metric(after.metrics,'Timestamp')-metric(before.metrics,'Timestamp'))*1000;
 const intervals=observation.times.slice(1).map((t,i)=>t-observation.times[i]).sort((a,b)=>a-b);
 const result={device,mapId:record.destination,site:record.name,declaredArrivalFixture:record.declaredArrivalFixture??false,elapsedMs,taskDurationMs:(metric(after.metrics,'TaskDuration')-metric(before.metrics,'TaskDuration'))*1000,scriptDurationMs:(metric(after.metrics,'ScriptDuration')-metric(before.metrics,'ScriptDuration'))*1000,paintCompletions:observation.times.length,paintIntervalP50:intervals[Math.floor(intervals.length*.5)],paintIntervalP95:intervals[Math.floor(intervals.length*.95)],longTasks:observation.longTasks,hidden:observation.hidden,canvas:observation.canvas};
 evidence.push(result);console.log(`${variant} ${device}/${record.destination}/${record.name}: CPU ${result.taskDurationMs.toFixed(1)}/${elapsedMs.toFixed(1)}ms; p95 interval ${result.paintIntervalP95.toFixed(1)}ms`);
 await context.close();
}
await browser.close();await mkdir(`${root}/app-cost`,{recursive:true});await writeFile(`${root}/app-cost/${variant}.json`,JSON.stringify({variant,source:'Pinned foundation e48b10e plus declared owner overlay; mainReconciled:false',method:'Whole actual App, no video/trace; reduced motion enabled. Six unmodified ordinary journey snapshots and two declared broad-map default-arrival fixtures. No internal dispatch/test mode. TaskDuration is browser CPU; paint-completion cadence is not GPU FPS/input latency.',errors,evidence},null,2));if(errors.length)throw Error(errors.join('\n'));
