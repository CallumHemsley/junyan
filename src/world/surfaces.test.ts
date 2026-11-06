import {it,expect} from 'vitest';
import {canStand} from './geometry';
import {worldMaps} from './registry';
import {stairSurfaces} from './maps/residential/elevation';
import {cameraForMap,project,unprojectAtHeight} from './camera';
import {pickSurface,surfaceHeight,atFeet} from './surfaces';
import type {WorldRenderView} from './render-contract';
it('round trips every tread and landing at scrolled phone/desktop cameras',()=>{
 const map=worldMaps['residential-stairs'];
 for(const scale of [11,15])for(const surface of stairSurfaces){
  const p={x:surface.rect.x+surface.rect.width/2,y:surface.rect.y+surface.rect.height/2};
  const camera=cameraForMap(map.bounds,p,scale===11?195:720,400,scale,0,0,surface.height);
  const screen=project(p,camera,surface.height),inverse=unprojectAtHeight(screen,camera,surface.height),picked=pickSurface(screen,camera,map);
  expect(inverse.x).toBeCloseTo(p.x);expect(inverse.y).toBeCloseTo(p.y);
  expect(picked).not.toBeNull();expect(picked!.x).toBeCloseTo(p.x);expect(picked!.y).toBeCloseTo(p.y);
 }
});
it('chooses valid topmost surfaces on both sides of every tread boundary',()=>{
 const map=worldMaps['residential-stairs'];
 for(const x of [6,17])for(const y of [3,9,19,24,33,39])for(const epsilon of [-.001,.001]){
  const p={x,y:y+epsilon},z=surfaceHeight(map.id,p),camera=cameraForMap(map.bounds,p,195,400,11,0,0,z);
  const hit=pickSurface(project(p,camera,z),camera,map);
  // Surface overlap is resolved to the upper visible tread, not an iterative inverse.
  if(hit)expect(surfaceHeight(map.id,hit)).toBeGreaterThanOrEqual(z);
 }
});
it('sets an actor foot anchor explicitly without double-offsetting absolute artwork Z',()=>{
 const view={project:(p,z=0)=>({x:p.x,y:p.y-z})} as WorldRenderView;
 const actor=atFeet(view,4.8);
 expect(actor.project({x:6,y:5})).toEqual({x:6,y:.20000000000000018});
 expect(actor.project({x:6,y:5},4.8)).toEqual(actor.project({x:6,y:5}));
 expect(actor.project({x:6,y:5},0)).toEqual({x:6,y:5});
});
it('picks exact authored tread edges without floating-point gaps',()=>{
 const map=worldMaps['residential-stairs'];
 for(const surface of stairSurfaces){
  const p={x:surface.rect.x+surface.rect.width/2,y:surface.rect.y};
  if(!canStand(map,p))continue;
  for(const focus of [{x:17.0000004855,y:16.9000006242},{x:6.1781988895,y:28.5939981172}]){
   const camera=cameraForMap(map.bounds,focus,195,386,11,0,0,surfaceHeight(map.id,focus));
   const hit=pickSurface(project(p,camera,surfaceHeight(map.id,p)),camera,map);
   expect(hit,JSON.stringify({p,focus})).not.toBeNull();expect(hit!.x).toBeCloseTo(p.x);expect(hit!.y).toBeCloseTo(p.y);
  }
 }
});
