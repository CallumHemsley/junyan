import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const page=await browser.newPage();await page.goto('http://127.0.0.1:5484/src/world/art/workshop/preview.html');
const results=await page.evaluate(async()=>{
 const {canWalk,findPath,movePlayer}=await import('/src/world/geometry.ts');const {worldMapSchema}=await import('/src/world/schema.ts');const {workshopDefinition}=await import('/src/world/maps/workshop/index.ts');const map=worldMapSchema.parse(workshopDefinition),from={x:7.999999306418678,y:6.799999583851207},target={x:8,y:10.8};
 const original=findPath(map,from,target),runs=[];
 for(const milliseconds of [16,16.6666666667,20,33.3333333333,40]){
  let position={...from},path=[...original],stall=null;
  for(let frame=0;frame<1000&&path.length;frame++){
   const point=path[0],dx=point.x-position.x,dy=point.y-position.y,d=Math.hypot(dx,dy),step=milliseconds/1000*5;
   let delta;if(d<=Math.max(step,.03)){delta={x:dx,y:dy};path.shift();}else delta={x:dx/d*step,y:dy/d*step};
   if(delta.x||delta.y){const next=movePlayer(map,position,delta);const moving=Math.hypot(next.x-position.x,next.y-position.y)>.0001;if(moving)position=next;else{stall={frame,position,next,delta,remaining:[...path],segmentIsWalkable:canWalk(map,position,target)};path=[];}}
  }
  runs.push({milliseconds,position,stall,reached:Math.hypot(position.x-target.x,position.y-target.y)<.12});
 }
 return{method:'exact viewport waypoint/move/clear sequence evaluated with actual shared geometry and authored map; this is a controller reproduction, not an independent movement engine',original,runs};
});await fs.writeFile('docs/evidence/0082/waypoint-reproduction.json',JSON.stringify(results,null,2));await browser.close();
