import {chromium} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const source='origin/codex/0084-landscape';
const tip=execFileSync('git',['rev-parse',source],{encoding:'utf8'}).trim();
const maps=['park','riverbank'].map(id=>JSON.parse(execFileSync('git',['show',`${source}:src/world/maps/landscape/${id}.json`],{encoding:'utf8'})));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:5488/src/world/atmosphere/harness.html');
await page.waitForFunction(()=>window.__ATMOSPHERE__?.frames>30);
const measure=async iterations=>page.evaluate(async({maps,iterations})=>{
 const {sampleAtmosphere,atmosphereHooksForMap,drawAtmosphere}=window.__ATMOSPHERE__;
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;const ctx=canvas.getContext('2d');
 const rows=[];
 for(const map of maps){
  const hooks=atmosphereHooksForMap(map), camera={x:map.bounds.width*.55,y:map.bounds.height*.5};
  const view={pass:'ground',project:(p,z=0)=>({x:320+(p.x-camera.x-p.y+camera.y)*13,y:180+(p.x-camera.x+p.y-camera.y)*6.5-z*13})};
  const viewport={x:camera.x-22,y:camera.y-22,width:44,height:44};
  const run=draw=>{let commands=0;const start=performance.now();for(let i=0;i<iterations;i++){
   const frame=sampleAtmosphere({mapId:map.id,day:2,timeOfDay:.8,elapsedMs:i*33,seed:42,reducedMotion:false},hooks,viewport);
   commands+=frame.commands.length;
   if(draw){ctx.clearRect(0,0,640,360);drawAtmosphere(ctx,frame,view);drawAtmosphere(ctx,frame,{...view,pass:'foreground'});for(const object of window.__ATMOSPHERE__.renderAtmosphereObjects(frame))object.draw(ctx,{...view,pass:'objects'});}
  }return {msPerFrame:(performance.now()-start)/iterations,commandsPerFrame:commands/iterations};};
  run(true);
  const samples=[];for(let i=0;i<5;i++)samples.push({sample:run(false),sampleAndDraw:run(true)});
  const pixel=ctx.getImageData(320,180,1,1).data;
  rows.push({mapId:map.id,bounds:map.bounds,hooks:{water:hooks.water.length,foliage:hooks.foliage.length,shadows:hooks.shadows.length,lights:hooks.lights.length},samples,centerPixel:[...pixel]});
 }
 const times=window.__ATMOSPHERE__.measures.slice();times.sort((a,b)=>a-b);
 return {rows,studyFrame:{count:times.length,medianMs:times[Math.floor(times.length/2)],minMs:times[0],maxMs:times.at(-1)}};
},{maps,iterations});
const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
await measure(50);const {profile}=await cdp.send('Profiler.stop');
const hotspots=profile.nodes.filter(n=>n.hitCount>0).sort((a,b)=>b.hitCount-a.hitCount).slice(0,8).map(n=>({function:n.callFrame.functionName,url:n.callFrame.url,hits:n.hitCount}));
const results=await measure(200);
await writeFile('/workspace/junyan/docs/evidence/world/0086/cost.json',JSON.stringify({source,tip,claim:'Absolute isolated atmosphere sampling and Canvas2D drawing cost on authored broad-map hooks; no end-to-end traversal performance claim.',iterations:200,runs:5,surface:'production-built isolated study',logicalCanvas:[640,360],visibleWorld:[44,44],errors,hotspots,...results},null,2));
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify(results));
