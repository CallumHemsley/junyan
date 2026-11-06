import type {Point,WorldMapDefinition} from './schema';
import type {WorldRenderView} from './render-contract';
import {surfaceHeight as residentialHeight,surfaceLevels as residentialLevels} from './maps/residential';
import {unprojectAtHeight,type Camera} from './camera';
import {canStand} from './geometry';
// The residential owner is the single authority for both tread art and support Z.
export const surfaceHeight=residentialHeight;
export const surfaceLevels=residentialLevels;
export function pickSurface(screen:Point,camera:Camera,map:WorldMapDefinition):Point|null {
 for(const z of [...surfaceLevels(map.id)].sort((a,b)=>b-a)){
  const inverse=unprojectAtHeight(screen,camera,z);
  // CSS touch coordinates can arrive as float32. Normalize sub-pixel noise
  // before sampling half-open tread intervals, so an exact edge has no gap.
  const point={x:Math.round(inverse.x*1e5)/1e5,y:Math.round(inverse.y*1e5)/1e5};
  if(Math.abs(surfaceHeight(map.id,point)-z)<1e-7&&canStand(map,point))return point;
 }
 return null;
}
// Actor adapters project their anchor with no explicit Z. This actor-only view
// supplies its absolute foot Z; explicit artwork Z remains absolute, never added.
export function atFeet(view:WorldRenderView,footZ:number):WorldRenderView {
 return {...view,project:(point,z=footZ)=>view.project(point,z)};
}
