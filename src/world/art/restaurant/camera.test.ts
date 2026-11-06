import {expect,it} from 'vitest';
import {restaurantCamera} from './camera';
import {project,pointerGround} from '../../camera';
import {restaurantMap} from '../../restaurant';
import {findPath,canStand} from '../../geometry';
import {restoreWorld,createWorld} from '../../state';
import {worldMaps} from '../../registry';

it('keeps faces at readable scale and roundtrips native pointer coordinates around every service anchor',()=>{
 for(const [width,height,inset] of [[195,386,0],[297,389,0],[195,386,180],[720,458,0]])for(const anchor of restaurantMap.anchors){
  const camera=restaurantCamera(restaurantMap.bounds,anchor.position,width,height,inset);
  expect(camera.scale).toBeGreaterThanOrEqual(11);
  const screen=project(anchor.position,camera);
  expect(screen.x).toBeGreaterThan(0);expect(screen.x).toBeLessThan(width);
  expect(screen.y).toBeGreaterThan(0);expect(screen.y).toBeLessThan(height-Math.max(66,inset));
  const picked=pointerGround({x:screen.x*2+10,y:screen.y*2+68},{left:10,top:68,width:width*2,height:height*2},camera);
  expect(picked.x).toBeCloseTo(anchor.position.x);expect(picked.y).toBeCloseTo(anchor.position.y);
 }
});
it('connects all four seats to the real kitchen and reciprocal door after compacting the room',()=>{
 const spawn=restaurantMap.defaultSpawn,kitchen=restaurantMap.anchors.find(a=>a.id==='restaurant.kitchen')!.position;
 for(const anchor of restaurantMap.anchors){
  expect(canStand(restaurantMap,anchor.position)).toBe(true);
  expect(findPath(restaurantMap,spawn,anchor.position).length).toBeGreaterThan(0);
  if(anchor.id!=='restaurant.kitchen')expect(findPath(restaurantMap,anchor.position,kitchen).length).toBeGreaterThan(0);
 }
 const entrance=restaurantMap.entrances[0].position;
 expect(canStand(restaurantMap,entrance)).toBe(true);
 const old={...createWorld(worldMaps),position:{x:22,y:20},returnPositions:{restaurant:{x:22,y:20,facing:'north' as const}}};
 const restored=restoreWorld(old,worldMaps);
 expect(canStand(restaurantMap,restored.position)).toBe(true);expect(restored.returnPositions.restaurant).toBeUndefined();
});
