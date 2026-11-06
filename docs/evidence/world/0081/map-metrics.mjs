import {chromium} from '../../../../node_modules/@playwright/test/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const evidence=fileURLToPath(new URL('.',import.meta.url)),home=JSON.parse(readFileSync(evidence+'production-proof.json','utf8'))[0].home;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});
try {
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5483/src/world/art/residential/harness.html');
 const maps=await page.evaluate(async home=>{
  const [{createGame},{content},{mapsForNeighbourhood},{canStand,canWalk,findPath}]=await Promise.all([import('/src/game.ts'),import('/src/content/index.ts'),import('/src/world/dynamic.ts'),import('/src/world/geometry.ts')]);
  const game=createGame(content);game.neighbourhood.apartment=home;const registry=mapsForNeighbourhood(game.neighbourhood),result=[];
  for(const id of ['residential-hall','residential-stairs','apartment']){
   const map=registry[id],queue=[{x:map.defaultSpawn.x,y:map.defaultSpawn.y}],seen=new Set();
   for(let i=0;i<queue.length;i++){
    const p=queue[i],key=`${p.x},${p.y}`;if(seen.has(key)||!canStand(map,p))continue;seen.add(key);
    for(const [dx,dy] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const next={x:p.x+dx,y:p.y+dy};if(!seen.has(`${next.x},${next.y}`)&&canWalk(map,p,next))queue.push(next);}
   }
   let rawArea=0;for(let x=.5;x<map.bounds.width;x++)for(let y=.5;y<map.bounds.height;y++)if(map.walkable.some(r=>x>=r.x&&y>=r.y&&x<r.x+r.width&&y<r.y+r.height))rawArea++;
   const destinations=[...map.entrances.map(e=>({id:e.id,position:e.position,kind:'entrance'})),...map.landmarks];
   result.push({id,bounds:map.bounds,authoredWalkableUnionAreaTiles:rawArea,reachableHalfTileSamples:seen.size,estimatedPlayerReachableAreaTiles:seen.size*.25,landmarks:destinations.map(target=>{const path=findPath(map,map.defaultSpawn,target.position);let p=map.defaultSpawn,length=0;for(const node of path){length+=Math.hypot(node.x-p.x,node.y-p.y);p=node;}return {id:target.id,kind:target.kind,position:target.position,reachable:path.length>0,pathLengthTiles:Number(length.toFixed(3))};})});
  }
  return result;
 },home);
 writeFileSync(evidence+'map-metrics.json',JSON.stringify({method:'integer-aligned authored floor union; footprint-aware half-tile BFS through shared canWalk; actual saved six-object home; point samples estimate accessible player area and do not measure real-world size',maps},null,2));console.log(maps.map(m=>({id:m.id,authoredArea:m.authoredWalkableUnionAreaTiles,playerSamples:m.reachableHalfTileSamples,landmarks:m.landmarks.length,allReachable:m.landmarks.every(l=>l.reachable)})));
}finally{await browser.close();}
