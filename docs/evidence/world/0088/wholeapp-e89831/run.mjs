import {chromium} from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
const out='/workspace/junyan/docs/evidence/world/0088/wholeapp-e89831',mode=process.env.MODE||'production';
const source='/workspace/junyan-wholeapp-e89831';
const fixture=process.env.APARTMENT_ORIGINAL?JSON.parse(fs.readFileSync(out+'/apartment-original-fixture.json')):JSON.parse(fs.readFileSync('/workspace/junyan/docs/evidence/world/0088/app-perf-1cf3532/recorded-journey-fixture.json')).state;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--mute-audio']});
const report={head:'e89831bf65a4d7a7fd0ecca17e3deca047b011b0',mode,started:new Date().toISOString(),hardware:{cpus:os.cpus().map(x=>x.model),memory:os.totalmem(),load:os.loadavg()},browser:browser.version(),rows:[],errors:[]};
const persist=()=>fs.writeFileSync(`${out}/${mode}.json`,JSON.stringify(report,null,2));
async function state(page){return page.evaluate(async()=>{const p=localStorage.getItem('junyan-waiter-pending-v1');if(p)return JSON.parse(p);return await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('saves'),q=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(q.result);db.close()};t.onerror=()=>reject(t.error)}})});}
async function measure(page,scenario,viewport,kind,iteration,profile=false){
const before=await state(page);let cdp,events=[],cpu;
if(profile){cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');cdp.on('Tracing.dataCollected',p=>events.push(...p.value));await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline',options:'record-as-much-as-possible'});}
await page.evaluate(()=>{const p=window.__wp;p.frames=[];p.tasks=[];p.calls={};p.workload=null;p.paintStarts=[];p.paintEnds=[];p.appRafTimes=[];p.last=0;p.active=true;p.start=performance.now();});
let samples=[];
if(kind==='idle')await page.waitForTimeout(10000);else for(let i=0;i<10;i++){const key=scenario==='apartment'?(i%2?'ArrowRight':'ArrowLeft'):(i%2?'ArrowDown':'ArrowUp');await page.keyboard.down(key);await page.waitForTimeout(1000);await page.keyboard.up(key);const s=await state(page);samples.push({map:s.world.mapId,position:s.world.position});}
const metrics=await page.evaluate(()=>{const p=window.__wp;p.active=false;return {duration:performance.now()-p.start,frames:p.frames,tasks:p.tasks,calls:p.calls,workload:p.workload,paintStarts:p.paintStarts,paintEnds:p.paintEnds,appRafTimes:p.appRafTimes,fontStatus:document.fonts.status,visibility:document.visibilityState,focused:document.hasFocus(),canvas:[...document.querySelectorAll('canvas')].map(c=>({width:c.width,height:c.height,rect:{width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height}})),hardwareConcurrency:navigator.hardwareConcurrency,dpr:devicePixelRatio};});
if(profile){cpu=await cdp.send('Profiler.stop');await new Promise(async resolve=>{cdp.once('Tracing.tracingComplete',resolve);await cdp.send('Tracing.end')});fs.writeFileSync(`${out}/${mode}-${viewport}-${scenario}-${kind}.cpuprofile`,JSON.stringify(cpu.profile));fs.writeFileSync(`${out}/${mode}-${viewport}-${scenario}-${kind}.trace.json`,JSON.stringify({traceEvents:events}));await cdp.detach();}
const after=await state(page);report.rows.push({scenario,viewport,kind,iteration,profile,before,after,samples,metrics,load:os.loadavg()});persist();
const f=[...metrics.frames].sort((a,b)=>a-b);console.log(JSON.stringify({mode,viewport,scenario,kind,iteration,frames:f.length,p95:f[Math.floor(f.length*.95)],max:f.at(-1),longtasks:metrics.tasks.length,positionBefore:before.world.position,positionAfter:after.world.position}));
}
try{
for(const viewport of (process.env.VIEWPORTS||'phone,desktop').split(',')){
const context=await browser.newContext({viewport:viewport==='phone'?{width:390,height:process.env.MATCH_ORIGINAL?844:664}:{width:1440,height:process.env.MATCH_ORIGINAL?1000:900},deviceScaleFactor:viewport==='phone'&&!process.env.MATCH_ORIGINAL?3:1,isMobile:viewport==='phone'&&!process.env.MATCH_ORIGINAL,hasTouch:viewport==='phone'&&!process.env.MATCH_ORIGINAL,serviceWorkers:'block',reducedMotion:'no-preference'});
await context.addInitScript(()=>{const p={active:false,frames:[],tasks:[],calls:{},last:0,start:0,add(name,ms){const a=this.calls[name]??={count:0,total:0,max:0};a.count++;a.total+=ms;a.max=Math.max(a.max,ms);}};window.__wp=p;window.__wpSpan=(name,fn)=>{const t=performance.now();try{return fn();}finally{if(p.active)p.add(name,performance.now()-t)}};requestAnimationFrame(function tick(t){if(p.active&&p.last)p.frames.push(t-p.last);p.last=t;requestAnimationFrame(tick)});new PerformanceObserver(l=>{if(p.active)for(const e of l.getEntries())if(e.startTime>=p.start)p.tasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});});
const page=await context.newPage();page.on('pageerror',e=>{report.errors.push(e.message);persist()});page.on('console',m=>{if(m.type()==='error'){report.errors.push('console:'+m.text());persist()}});
for(const scenario of (process.env.SCENARIOS||'restaurant,town,park').split(',')){
await page.goto('http://127.0.0.1:5490/junyan/audio/manifest.json');
const s=structuredClone(fixture);s.customers.forEach(c=>c.phase='seated');s.served=0;s.earnings=0;s.ended=false;s.receipt=null;s.activeTable=null;s.feedback='none';s.world.mapId=scenario;s.world.position=scenario==='apartment'?fixture.world.position:scenario==='restaurant'?{x:12,y:17}:scenario==='town'?{x:34,y:32}:{x:30,y:27};s.world.activeActivity=null;s.world.activeAnchorId=null;s.world.life.serviceDepartures=[];s.neighbourhood.location='restaurant';s.neighbourhood.apartment.selected=null;s.neighbourhood.apartment.draft=null;
await page.evaluate(async save=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise((resolve,reject)=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(save,'v1');t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)});localStorage.removeItem('junyan-waiter-pending-v1')},s);
await page.goto('http://127.0.0.1:5490/junyan/?seed=42');await page.getByTestId('world-viewport').waitFor();const welcome=page.getByRole('button',{name:'开门迎客'});if(await welcome.isVisible())await welcome.click();await page.bringToFront();await page.getByTestId('world-viewport').focus();await page.waitForTimeout(10000);
await page.screenshot({path:`${out}/${mode}-${viewport}-${scenario}.png`});
for(let iteration=0;iteration<Number(process.env.REPEATS||2);iteration++){await measure(page,scenario,viewport,'idle',iteration,mode.includes('profile'));await measure(page,scenario,viewport,'movement',iteration,mode.includes('profile'));}
}
await context.close();
}
}finally{report.finished=new Date().toISOString();persist();await browser.close();}
