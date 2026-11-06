import {it,expect} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import {content} from '../../src/neighbourhood/registry';
import {validateSavedGame} from '../../src/save';
import {mapsForNeighbourhood} from '../../src/world/dynamic';
import {canStand} from '../../src/world/geometry';
import {createWorld} from '../../src/world/state';
import {reduceGame,orderTotal} from '../../src/game';
import {TABLES} from '../../src/contracts';
import {renderObjects} from '../../src/world/art/landscape';
import {landscapeFoliageBounds} from '../../src/world/art/landscape/draw';
import {occludesPlayer} from '../../src/world/occlusion';
import {sampleActor} from '../../src/world/characters';
import {projectActorBounds} from '../../src/world/characters/adapter';
import type {WorldRenderView} from '../../src/world/render-contract';
it('validates revision3 phases, sites and an actual canopy-bound comparison',()=>{
 const base=JSON.parse(readFileSync('/tmp/e02-visual/ordinary-base.json','utf8'));
 const maps=mapsForNeighbourhood(base.neighbourhood,base.day);
 const specs:any[]=[];
 for(const [mapId,id] of [['riverbank','riverbank.old-ferry'],['riverbank','first-arrival'],['park','first-arrival'],['park','park.orchard-basket'],['rooftop','first-arrival'],['rooftop','rooftop.pots']]){
  const map=maps[mapId],target=id==='first-arrival'?map.entrances[0]:map.landmarks.find(l=>l.id===id)!;
  specs.push({id:id==='first-arrival'?`${mapId}-first-arrival`:id.replace('.','-'),mapId,position:target.position,facing:id==='first-arrival'?map.entrances[0].facing:'north',subject:id});
 }
 const map=maps.riverbank,tree=map.props.find(p=>p.id==='riverbank.ferry-copse-tree-0')!;
 const view:WorldRenderView={project:(p,z=0)=>({x:(p.x-p.y)*18,y:(p.x+p.y)*9-z*18}),elapsedMs:0,reducedMotion:true,playerPosition:{x:0,y:0},width:2000,height:2000,pass:'objects'};
 const object=renderObjects(map,view).find(o=>o.id===tree.id)!;
 const b=landscapeFoliageBounds(tree)!,origin=view.project(tree.position),canopy={x:origin.x+b.minX,y:origin.y+b.minY,width:b.maxX-b.minX,height:b.maxY-b.minY};
 const sample=sampleActor({characterId:'player',facing:'north',action:'idle',elapsedMs:0,reducedMotion:true});
 const overlap=(a:any,b:any)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 const candidates:any[]=[];
 for(let x=59;x<=73;x+=.25)for(let y=53;y<=68;y+=.25){const position={x,y};if(!canStand(map,position))continue;const actor=projectActorBounds(view,sample,position);candidates.push({position,actor,overlap:overlap(actor,canopy),fades:occludesPlayer(object.occlusion!,position),treeAfterPlayer:tree.position.x+tree.position.y>x+y});}
 const behind=candidates.filter(p=>p.overlap&&p.fades&&p.treeAfterPlayer&&p.actor.x>=canopy.x&&p.actor.y>=canopy.y&&p.actor.x+p.actor.width<=canopy.x+canopy.width&&p.actor.y+p.actor.height<=canopy.y+canopy.height).sort((a,b)=>Math.hypot(a.position.x-65,a.position.y-61)-Math.hypot(b.position.x-65,b.position.y-61))[0];
 expect(behind).toBeDefined();
 const outside=candidates.filter(p=>!p.overlap&&!p.fades).sort((a,b)=>Math.hypot(a.position.x-behind.position.x,a.position.y-behind.position.y)-Math.hypot(b.position.x-behind.position.x,b.position.y-behind.position.y))[0];
 expect(outside).toBeDefined();
 for(const [id,row] of [['old-ferry-canopy-behind',behind],['old-ferry-canopy-outside',outside]] as const)specs.push({id,mapId:'riverbank',position:row.position,facing:'north',subject:`${tree.id} ${id}`,onlyMorning:true,occlusionEvidence:{treeId:tree.id,treePosition:tree.position,occlusion:object.occlusion,canonicalProjectedCanopyBounds:canopy,canonicalProjectedActorBounds:row.actor,projectedBoundsOverlap:row.overlap,compositorFadePredicate:row.fades,treeSortedAfterPlayer:row.treeAfterPlayer,expectedObjectAlpha:row.fades?.45:1}});
 const fixtures=[];
 for(const spec of specs)for(const phase of spec.onlyMorning?['morning']:['morning','evening']){
  let game=structuredClone(base);
  if(phase==='evening')for(const table of [1,2,3]){const customer=game.customers.find((c:any)=>c.table===table),order=content.orders.find(o=>o.id===customer.orderId)!;game={...game,customers:game.customers.map((c:any)=>c.table===table?{...c,phase:'checkout'}:c),player:{x:TABLES[table-1].x+1.4,y:TABLES[table-1].y}};game=reduceGame(game,{type:'pay',table,change:order.paid-orderTotal(order,content)},content);}
  expect(game.served).toBe(phase==='evening'?3:0);
  expect(canStand(maps[spec.mapId],spec.position),spec.id).toBe(true);
  game.world={...createWorld(maps),mapId:spec.mapId,position:spec.position,facing:spec.facing};
  const restored=validateSavedGame(game,content);expect(restored,spec.id).not.toBeNull();expect(restored!.world!.mapId,spec.id).toBe(spec.mapId);expect(restored!.world!.position,spec.id).toEqual(spec.position);
  fixtures.push({...spec,id:`${spec.id}-${phase}`,phase,served:game.served,save:restored});
 }
 writeFileSync('audit/revision3/fixtures.json',JSON.stringify({method:'Revision3 actual-App declared visual/setup fixtures. Morning served0; evening served3 via existing pay reducers for tables1-3. NOT ordinary travel, route motion, progression or semantic merge acceptance.',canopyComparison:{treeId:tree.id,initialBoundsOnlyPositionRejected:{x:63,y:58},behind:behind.position,outside:outside.position},fixtures},null,2)+'\n');
});
