import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});
try {
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
 const metrics=await page.evaluate(async()=>{
  const {mapDefinitions}=await import('/src/world/maps/landscape/index.ts');
  const {worldMapSchema}=await import('/src/world/schema.ts');
  const {canStand,findPath}=await import('/src/world/geometry.ts');
  const {renderObjects}=await import('/src/world/art/landscape/index.ts');
  return mapDefinitions.map(raw=>{
   const m=worldMapSchema.parse(raw),queue=[m.defaultSpawn],seen=new Set([`${m.defaultSpawn.x},${m.defaultSpawn.y}`]);
   for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const p={x:queue[i].x+dx,y:queue[i].y+dy},key=`${p.x},${p.y}`;if(!seen.has(key)&&canStand(m,p)){seen.add(key);queue.push(p);}}
   const routes=m.landmarks.map(l=>{const path=findPath(m,m.defaultSpawn,l.position);let from=m.defaultSpawn,length=0;for(const to of path){length+=Math.hypot(to.x-from.x,to.y-from.y);from=to;}return {id:l.id,lengthTiles:Number(length.toFixed(2)),reachable:!!path.length};});
   const view={project:point=>point,elapsedMs:0,reducedMotion:true,playerPosition:m.defaultSpawn,width:1440,height:960,pass:'objects'};
   const objects=renderObjects(m,view);
   return {mapId:m.id,bounds:m.bounds,footprintRadius:.22,sampledReachableAreaTiles:seen.size/4,props:m.props.length,distinctPropKinds:[...new Set(m.props.map(p=>p.kind))],landmarks:routes,customObjectCount:objects.length,allObjectPropsOverrideFallback:m.props.filter(p=>p.layer!=='ground').every(p=>objects.some(o=>o.id===p.id)),registeredResidentHooks:m.npcHooks.map(h=>h.id),note:'Half-tile shared-footprint flood area is a sampled estimate. Route distances use shared smoothed findPath. These measure authored content, not experience quality.'};
  });
 });
 await writeFile('docs/evidence/0084/metrics.json',JSON.stringify(metrics,null,2)+'\n');console.log(JSON.stringify(metrics,null,2));
}finally{await browser.close();}
