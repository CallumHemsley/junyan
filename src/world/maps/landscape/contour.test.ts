import {expect,it} from 'vitest';
import {worldMaps} from '../../registry';
import {canStand,canWalk,findPath} from '../../geometry';
import {isExitConnected} from '../../exit-safety';
import {createWorld,restoreWorld} from '../../state';

const map=worldMaps.riverbank;
it('uses exactly the same cut contour for visible wet ground and water collisions',()=>{
 const canonical=(rects:typeof map.colliders[number]['rect'][])=>rects.map(r=>JSON.stringify(r)).sort();
 expect(canonical(map.terrain.filter(t=>t.material==='water').map(t=>t.rect))).toEqual(canonical(map.colliders.filter(c=>c.id.startsWith('riverbank.water-')).map(c=>c.rect)));
 for(const t of map.terrain.filter(t=>t.material==='water')){
  const r=t.rect;
  if(r.width>.6&&r.height>.6)expect(canStand(map,{x:r.x+r.width/2,y:r.y+r.height/2})).toBe(false);
 }
 // The adaptive geometry stays within the measured budget; no global quarter-strip explosion.
 expect(map.colliders.length).toBeLessThanOrEqual(260);
 expect(map.terrain.filter(t=>t.material==='water').length).toBeLessThanOrEqual(185);
 expect(map.props).toHaveLength(162);
});

it('retains both crossing supports, work anchors and dry radius-safe approaches',()=>{
 expect(map.terrain.find(t=>t.id==='riverbank.moon-bridge')!.rect).toEqual({x:34,y:17.6,width:27,height:2.8000000000000007});
 expect(map.terrain.find(t=>t.id==='riverbank.low-footbridge')!.rect).toEqual({x:30,y:55.6,width:31,height:2.799999999999997});
 for(const [id,x,y]of [['washing-stones',40,74],['old-ferry',62,57],['lower-crossing',45,57]] as const){
  const goal=map.anchors.find(a=>a.id===`riverbank.${id}`)!.position;
  expect(goal).toEqual({x,y});expect(canStand(map,goal,.3)).toBe(true);
  const path=findPath(map,map.defaultSpawn,goal,.3);expect(path.length).toBeGreaterThan(0);
  let from=map.defaultSpawn;for(const to of path){expect(canWalk(map,from,to,.3)).toBe(true);from={...to,facing:map.defaultSpawn.facing};}
 }
 for(const y of [19,57])expect(canWalk(map,{x:35,y},{x:59,y},.3)).toBe(true);
});

it('restores legacy dry-bank saves beside the new coves to nearby exit-connected dry feet',()=>{
 // Valid dry feet on the pre-0128 water contour; widening a cove must not strand them.
 const legacy=[{x:53.25,y:60},{x:53.5,y:61},{x:54,y:62.5},{x:44.25,y:73.5},{x:44,y:74.5},{x:45.25,y:76}];
 for(const position of legacy){
  const saved={...createWorld(worldMaps),mapId:'riverbank',position,facing:'east' as const};
  const restored=restoreWorld(saved,worldMaps);
  expect(restored.mapId).toBe('riverbank');expect(restored.facing).toBe('east');
  expect(canStand(map,restored.position)).toBe(true);expect(isExitConnected(map,restored.position)).toBe(true);
  expect(Math.hypot(restored.position.x-position.x,restored.position.y-position.y)).toBeLessThan(3.75);
 }
});
