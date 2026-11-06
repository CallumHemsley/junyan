import {chromium} from '@playwright/test';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const dir=new URL('./performance/',import.meta.url).pathname;await mkdir(dir,{recursive:true});
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const host={uptime:execFileSync('uptime',{encoding:'utf8'}).trim(),cores:Number(execFileSync('nproc',{encoding:'utf8'}))};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const release=process.env.PROOF_RELEASE==='1';
const fixture=release?JSON.parse(await readFile(`${dir}fixture.json`,'utf8')):null;
const runs=[];
for(let run=-1;run<5;run++){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(fixture) await context.addInitScript(game=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game)),fixture);
 else {await page.goto('http://127.0.0.1:5485/src/world/art/rooftop/harness.html?test=1');
 await page.evaluate(async()=>{
  const {createGame}=await import('/src/game.ts');const {content}=await import('/src/neighbourhood/registry.ts');const {saveGame}=await import('/src/save.ts');
  const game=createGame(content,42);game.neighbourhood.location='garden';game.neighbourhood.garden.restored=true;
  game.world={version:1,mapId:'rooftop',position:{x:23,y:20},facing:'east',returnPositions:{},activeActivity:null,activeAnchorId:null};
  localStorage.removeItem('junyan-waiter-pending-v1');await saveGame(game);
 });}
 await page.goto('http://127.0.0.1:5485/?seed=42');await page.locator('[data-map=rooftop] canvas[data-rendered=true]').waitFor();await page.waitForTimeout(1000);
 const cdp=await context.newCDPSession(page);
 if(run===-1){await cdp.send('Profiler.enable');await cdp.send('Profiler.start');}
 await page.evaluate(()=>{
  const canvas=document.querySelector('[data-map=rooftop] canvas'),samples={start:performance.now(),backgroundDraws:0,raf:[],longTasks:[]};
  const original=CanvasRenderingContext2D.prototype.fillRect;
  CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(this.canvas===canvas&&x===0&&y===0&&w===canvas.width&&h===canvas.height)samples.backgroundDraws++;return original.call(this,x,y,w,h);};
  const observer=new PerformanceObserver(list=>samples.longTasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask',buffered:false});
  let id=0,last=performance.now();const tick=now=>{samples.raf.push(now-last);last=now;id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);
  window.__ROOF_PERF__={samples,stop(){observer.disconnect();cancelAnimationFrame(id);CanvasRenderingContext2D.prototype.fillRect=original;return {...samples,durationMs:performance.now()-samples.start};}};
 });
 await page.getByTestId('world-viewport').focus();await page.keyboard.down('ArrowRight');await page.waitForTimeout(1000);await page.keyboard.up('ArrowRight');await page.waitForTimeout(2000);
 const samples=await page.evaluate(()=>window.__ROOF_PERF__.stop());
 const position=await page.evaluate(async()=>{const raw=localStorage.getItem('junyan-waiter-pending-v1');if(raw)return JSON.parse(raw).world.position;const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});return new Promise((resolve,reject)=>{const tx=db.transaction('saves'),request=tx.objectStore('saves').get('v1');tx.oncomplete=()=>{db.close();resolve(request.result.world.position);};tx.onerror=()=>reject(tx.error);});});
 if(!samples.backgroundDraws||Math.hypot(position.x-23,position.y-20)<.5)throw new Error('Measured work did not include actual drawing and movement');
 if(run===-1){const {profile}=await cdp.send('Profiler.stop');await writeFile(`${dir}profile.json`,JSON.stringify(profile));const nodes=new Map(profile.nodes.map(n=>[n.id,n.callFrame]));const counts=new Map();for(const id of profile.samples??[]){const f=nodes.get(id),key=`${f?.functionName||'(anonymous)'} ${f?.url||''}:${f?.lineNumber??0}`;counts.set(key,(counts.get(key)??0)+1);}await writeFile(`${dir}profile-top.json`,JSON.stringify([...counts].sort((a,b)=>b[1]-a[1]).slice(0,20),null,2));}
 else runs.push({run,position,errors,...samples});
 await context.close();
}
await browser.close();
const sorted=runs.map(r=>r.backgroundDraws/r.durationMs*1000).sort((a,b)=>a-b);
await writeFile(`${dir}results.json`,JSON.stringify({sourceHead,execution:release?'production preview':'Vite development',host,claim:'Five-run observational cloud Chromium main-thread/draw-cadence snapshot during real rooftop movement. No speedup, hardware-phone or total-game performance claim.',viewport:{width:390,height:844},runs,drawsPerSecond:{median:sorted[2],range:[sorted[0],sorted.at(-1)]},profile:'Unreported separate profiled run in profile.json/profile-top.json. Measures browser-main-thread Canvas work; excludes GPU, mobile hardware, memory and full-world navigation.'},null,2));
if(runs.some(r=>r.errors.length))throw new Error('Page errors');
