import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const page=await browser.newPage();await page.goto('http://127.0.0.1:5485/src/world/art/rooftop/harness.html?test=1');
const metrics=await page.evaluate(async()=>{
 const {rooftopForGarden}=await import('/src/world/maps/rooftop/index.ts');const {initialState}=await import('/src/features/garden/rules.ts');
 const {worldMapSchema}=await import('/src/world/schema.ts');const {canStand,canWalk,findPath}=await import('/src/world/geometry.ts');
 const map=worldMapSchema.parse(rooftopForGarden(initialState()));
 const step=.5,queue=[map.defaultSpawn],seen=new Set([`${map.defaultSpawn.x},${map.defaultSpawn.y}`]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){
  const p={x:queue[i].x+dx,y:queue[i].y+dy},key=`${p.x},${p.y}`;
  if(!seen.has(key)&&canStand(map,p)&&canWalk(map,queue[i],p)){seen.add(key);queue.push(p);}
 }
 return {bounds:map.bounds,connectedSampledFloorArea:queue.length*step*step,samplingStep:step,playerRadius:.22,navigation:'actual foundation canStand/canWalk/findPath',landmarks:map.landmarks.map(l=>{
  const path=findPath(map,map.defaultSpawn,l.position);let p=map.defaultSpawn,distance=0;for(const to of path){distance+=Math.hypot(to.x-p.x,to.y-p.y);p=to;}
  return {id:l.id,kind:l.kind,position:l.position,reachable:path.length>0,shortestSmoothedRouteLength:distance};
 }),featureAnchors:map.anchors.filter(a=>a.featureId==='garden').map(a=>({id:a.id,interactionId:a.interactionId})),props:map.props.length,note:'Connected area is a half-tile sampling estimate, not bounds multiplied as proof. Existing garden is one activity; three stable per-plant controls are bindings, not three invented activities.'};
});await browser.close();metrics.sourceHead=sourceHead;await writeFile(new URL('./layout-metrics.json',import.meta.url),JSON.stringify(metrics,null,2));console.log(JSON.stringify(metrics,null,2));
