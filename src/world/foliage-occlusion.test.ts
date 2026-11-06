import {it,expect} from 'vitest';
import {canStand} from './geometry';
import {worldMaps} from './registry';
import {project,unprojectAtHeight} from './camera';
import {foliageOcclusionBounds} from './foliage-occlusion';
import {occludesPlayer,canFadeOccluder,overlapsPaint} from './occlusion';
import {renderObjects} from './art/landscape';
import {sampleActor,projectActorBounds} from './characters';
import {atFeet} from './surfaces';
import type {WorldRenderView} from './render-contract';
it('rejects the reproduced old-ferry false fade and retains genuine canopy overlap across pixel scales',()=>{
 const map=worldMaps.riverbank,id='riverbank.ferry-copse-tree-0';
 for(const scale of [11,18,30])for(const pixelsPerWorldUnit of [15,18])for(const [position,expected] of [[{x:62,y:57},false],[{x:66,y:62},true]] as const){
  const camera={focus:{x:0,y:0},width:400,height:400,scale},view:WorldRenderView={project:(p,z)=>project(p,camera,z),playerPosition:position,width:400,height:400,elapsedMs:0,reducedMotion:true,pass:'objects'};
  expect(canStand(map,position)).toBe(true);
  const object=renderObjects(map,view).find(o=>o.id===id)!,sample=sampleActor({characterId:'player',facing:'east',action:'idle',elapsedMs:0,reducedMotion:true,pixelsPerWorldUnit});
  const body=projectActorBounds(atFeet(view,0),sample,position),tree=foliageOcclusionBounds(map,view).get(id)!;
  expect(occludesPlayer(object.occlusion!,position)).toBe(true);
  expect(canFadeOccluder(object.occlusion!,position,true,body,tree)).toBe(expected);
 }
});
it('uses absolute elevated foot projection once for calibrated actor bounds',()=>{
 const position={x:17,y:14},camera={focus:position,focusZ:3.6,width:195,height:386,scale:11};
 const view={project:(p,z)=>project(p,camera,z)} as WorldRenderView,sample=sampleActor({characterId:'player',facing:'east',action:'idle',elapsedMs:0,reducedMotion:true});
 const flat=projectActorBounds(atFeet(view,0),sample,position),raised=projectActorBounds(atFeet(view,3.6),sample,position);
 expect(flat.y-raised.y).toBeCloseTo(3.6*11,0);expect(raised.height).toBe(flat.height);
 const foot=view.project(position,3.6);expect(unprojectAtHeight(foot,camera,3.6)).toEqual(position);
});
it('does not fade edge-only contact or objects drawn before the player at equal depth',()=>{
 const shape={rect:{x:10,y:10,width:2,height:2},height:4},player={x:9,y:9},body={x:10,y:10,width:10,height:20};
 expect(overlapsPaint(body,{x:20,y:10,width:10,height:20})).toBe(false);
 expect(canFadeOccluder(shape,player,false,body,body)).toBe(false);
 expect(canFadeOccluder(shape,player,true,body,body)).toBe(true);
});
