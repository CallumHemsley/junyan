import {expect,it} from 'vitest';
import {cameraForMap,explorationCamera,project} from './camera';
import {worldMaps} from './registry';
import {pickSurface,surfaceHeight} from './surfaces';
import {stairSurfaces} from './maps/residential/elevation';

it('follows portrait exploration in a local ground window above the controls',()=>{
 const bounds={width:120,height:120};
 const from={x:40,y:74},to={x:40.5,y:74.5};
 const first=explorationCamera(bounds,from,195,386),next=explorationCamera(bounds,to,195,386);
 expect(first.scale).toBe(11);
 expect(project(from,first)).toEqual({x:97.5,y:222.5});
 expect(project(to,next)).toEqual(project(from,first));
 expect(project(from,next).y-project(from,first).y).toBeCloseTo(-5.5);
 // The rooftop's full portrait height must not clamp the local follow upward.
 const roof={x:24,y:27.3};
 expect(project(roof,explorationCamera(worldMaps.rooftop.bounds,roof,195,386)).y).toBeCloseTo(222.5);
});

it('keeps every stair support pickable when phone panels open and close',()=>{
 const map=worldMaps['residential-stairs'];
 for(const surface of stairSurfaces){
  const position={x:surface.rect.x+surface.rect.width/2,y:surface.rect.y+surface.rect.height/2};
  const z=surfaceHeight(map.id,position);
  const closed=explorationCamera(map.bounds,position,195,386,0,0,z);
  for(const inset of [0,180,260,0]){
   const camera=explorationCamera(map.bounds,position,195,386,inset,0,z),screen=project(position,camera,z);
   expect(pickSurface(screen,camera,map)).toEqual(position);
   expect(screen.y).toBeGreaterThan(0);
   expect(screen.y).toBeLessThan(386-Math.max(66,inset));
   if(inset===0)expect(camera).toEqual(closed);
  }
 }
});

it('keeps a fitting small-room overview and follows locally only when a panel needs space',()=>{
 const bounds={width:30,height:22},position={x:11.5,y:7};
 const room={...worldMaps.apartment,id:'small-room',bounds,walkable:[{x:0,y:0,...bounds}],colliders:[]};
 const closed=explorationCamera(bounds,position,195,386);
 expect(closed).toEqual(cameraForMap(bounds,position,195,386,11,66));
 expect(project({x:0,y:0},closed).y*2).toBeLessThan(66);
 const open=explorationCamera(bounds,position,195,386,180);
 expect(open).not.toEqual(cameraForMap(bounds,position,195,386,11,180));
 for(const camera of [closed,open,explorationCamera(bounds,position,195,386)]){
  const screen=project(position,camera);
  expect(pickSurface(screen,camera,room)).toEqual(position);
  expect(screen.y).toBeGreaterThan(0);
  if(camera===open)expect(screen.y).toBeLessThan(386-180);
 }
 expect(explorationCamera(bounds,position,195,386)).toEqual(closed);
});

it('preserves desktop and explicit-scale cameras',()=>{
 const bounds={width:24,height:22},position={x:18.5,y:9};
 expect(explorationCamera(bounds,position,720,458,0,256,2.4)).toEqual(cameraForMap(bounds,position,720,458,15,0,256,2.4));
 expect(cameraForMap(bounds,position,195,386,11).scale).toBe(11);
});
