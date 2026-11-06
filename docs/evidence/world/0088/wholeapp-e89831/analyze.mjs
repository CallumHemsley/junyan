import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{TraceMap,originalPositionFor}=require('/workspace/junyan/node_modules/.pnpm/@jridgewell+trace-mapping@0.3.31/node_modules/@jridgewell/trace-mapping');
const out='/workspace/junyan/docs/evidence/world/0088/wholeapp-e89831';
const percentile=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(s.length*p))]??null};
const summary={};
for(const file of fs.readdirSync(out).filter(x=>/^(production|apartment-production|diagnostic|apartment-diagnostic|profile|apartment-profile)\.json$/.test(x))){
 const d=JSON.parse(fs.readFileSync(out+'/'+file));summary[file]={errors:d.errors,hardware:d.hardware,browser:d.browser,rows:d.rows.map(r=>{let pos=r.before.world.position,travel=0;for(const s of r.samples){travel+=Math.hypot(s.position.x-pos.x,s.position.y-pos.y);pos=s.position;}return {scenario:r.scenario,viewport:r.viewport,kind:r.kind,iteration:r.iteration,profile:r.profile,duration:r.metrics.duration,frames:r.metrics.frames.length,p50:percentile(r.metrics.frames,.5),p95:percentile(r.metrics.frames,.95),p99:percentile(r.metrics.frames,.99),max:Math.max(...r.metrics.frames),longtasks:r.metrics.tasks,observedTravelLowerBound:travel,before:r.before.world.position,after:r.after.world.position,mapAfter:r.after.world.mapId,returnPositions:Object.keys(r.before.world.returnPositions).length,visibility:r.metrics.visibility,focused:r.metrics.focused,canvas:r.metrics.canvas,dpr:r.metrics.dpr,workload:r.metrics.workload,calls:r.metrics.calls};})};
}
fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2));
const profiles={};
for(const file of fs.readdirSync(out).filter(x=>x.endsWith('.cpuprofile'))){
 const d=JSON.parse(fs.readFileSync(out+'/'+file)),nodes=new Map(d.nodes.map(n=>[n.id,n])),parents=new Map(),maps=new Map();for(const n of d.nodes)for(const c of n.children??[])parents.set(c,n.id);
 function loc(n){const cf=n.callFrame;if(!cf.url)return {name:cf.functionName,file:'(runtime)',line:0};const chunk=path.basename(cf.url),mapPath=out+'/'+(file.includes('diagnostic')?'diagnostic-dist':'mapping-dist')+'/assets/'+chunk+'.map';if(!maps.has(chunk)){const compressed=out+'/source-maps/'+chunk+'.map.gz';maps.set(chunk,fs.existsSync(mapPath)?new TraceMap(JSON.parse(fs.readFileSync(mapPath))):fs.existsSync(compressed)?new TraceMap(JSON.parse(gunzipSync(fs.readFileSync(compressed)))):null);}const map=maps.get(chunk);if(!map)return {name:cf.functionName,file:cf.url,line:cf.lineNumber+1};const p=originalPositionFor(map,{line:cf.lineNumber+1,column:cf.columnNumber});return {name:p.name||cf.functionName,file:p.source||cf.url,line:p.line,column:p.column};}
 const self=new Map(),inclusive=new Map(),files=new Map();let total=0;
 for(let i=0;i<d.samples.length;i++){const id=d.samples[i],ms=(d.timeDeltas?.[i]??1000)/1000;total+=ms;self.set(id,(self.get(id)||0)+ms);let a=id;const seen=new Set();while(a){inclusive.set(a,(inclusive.get(a)||0)+ms);const n=nodes.get(a),l=loc(n);seen.add(l.file);a=parents.get(a);}for(const f of seen)files.set(f,(files.get(f)||0)+ms);}
 profiles[file]={sampledMs:total,self:[...self].map(([id,ms])=>({...loc(nodes.get(id)),ms})).sort((a,b)=>b.ms-a.ms).slice(0,40),inclusive:[...inclusive].map(([id,ms])=>({...loc(nodes.get(id)),ms})).sort((a,b)=>b.ms-a.ms).slice(0,45),fileInclusive:[...files].sort((a,b)=>b[1]-a[1]).slice(0,30)};
}
fs.writeFileSync(out+'/profile-summary.json',JSON.stringify(profiles,null,2));
const traces={};
for(const file of fs.readdirSync(out).filter(x=>x.endsWith('.trace.json.gz')||(x.endsWith('.trace.json')&&!fs.existsSync(out+'/'+x+'.gz')))){const d=JSON.parse(file.endsWith('.gz')?gunzipSync(fs.readFileSync(out+'/'+file)):fs.readFileSync(out+'/'+file)),main=d.traceEvents.filter(e=>e.name==='thread_name'&&e.args?.name==='CrRendererMain'),keys=new Set(main.map(e=>`${e.pid}/${e.tid}`)),groups={};for(const e of d.traceEvents)if(e.ph==='X'&&keys.has(`${e.pid}/${e.tid}`)){const g=groups[e.name]??={count:0,totalMs:0,maxMs:0};g.count++;g.totalMs+=(e.dur||0)/1000;g.maxMs=Math.max(g.maxMs,(e.dur||0)/1000);}traces[file]={main,events:Object.entries(groups).sort((a,b)=>b[1].totalMs-a[1].totalMs)};}
fs.writeFileSync(out+'/trace-summary.json',JSON.stringify(traces,null,2));
console.log(JSON.stringify(summary,null,2).slice(0,1000));
