import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const page=await browser.newPage();await page.goto('http://127.0.0.1:5484/src/world/art/workshop/walk.html');
const result=await page.evaluate(async()=>{
 const {worldMapSchema}=await import('/src/world/schema.ts');const {workshopDefinition}=await import('/src/world/maps/workshop/index.ts');const {canWalk,findPath}=await import('/src/world/geometry.ts');
 const map=worldMapSchema.parse(workshopDefinition),queue=[{x:15,y:25}],seen=new Set(['15,25']);
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy]of[[.5,0],[-.5,0],[0,.5],[0,-.5]]){const next={x:p.x+dx,y:p.y+dy},key=`${next.x},${next.y}`;if(!seen.has(key)&&canWalk(map,p,next)){seen.add(key);queue.push(next);}}}
 const targets=[...map.anchors.map(a=>({id:a.id,position:a.position})),{id:'workshop.shelf-approach',position:{x:23,y:5}},{id:'workshop.joinery-approach',position:{x:12,y:18.8}},{id:'workshop.sewing-approach',position:{x:22,y:19.1}}];
 const paths=targets.map(target=>{const path=findPath(map,map.defaultSpawn,target.position);let previous=map.defaultSpawn,length=0;for(const p of path){length+=Math.hypot(p.x-previous.x,p.y-previous.y);previous=p;}return{id:target.id,length,segments:path.length};});
 return{method:'0.5-tile center lattice flood fill from safe town arrival; each edge uses foundation footprint-aware canWalk',reachableSamples:seen.size,approximateReachableFloorArea:seen.size*.25,boundsArea:map.bounds.width*map.bounds.height,landmarks:map.landmarks.length,props:map.props.length,anchors:map.anchors.length,paths};
});
await fs.writeFile('docs/evidence/0082/reachability.json',JSON.stringify(result,null,2));await browser.close();
