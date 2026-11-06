import {landscapeFoliageBounds} from './art/landscape/draw';
import type {WorldMapDefinition,Rect} from './schema';
import type {WorldRenderView} from './render-contract';
type Prop=WorldMapDefinition['props'][number];
type Bounds=NonNullable<ReturnType<typeof landscapeFoliageBounds>>;
const nativeBounds=new WeakMap<WorldMapDefinition,{prop:Prop;bounds:Bounds}[]>();
export function projectFoliageBounds(prop:Prop,bounds:Bounds,view:WorldRenderView):Rect {
 const p=view.project(prop.position,0),origin=view.project({x:0,y:0},0),axis=view.project({x:1,y:0},0),scale=Math.abs(axis.x-origin.x)/18;
 // The cached native foliage image includes its final pixel at maxX/maxY.
 return {x:Math.round(p.x)+bounds.minX*scale,y:Math.round(p.y)+bounds.minY*scale,width:(bounds.maxX+bounds.size-bounds.minX)*scale,height:(bounds.maxY+bounds.size-bounds.minY)*scale};
}
/** Current known landscape adapter; no changes to artist modules or collision. */
export function foliageOcclusionBounds(map:WorldMapDefinition,view:WorldRenderView):Map<string,Rect>{
 if(map.id!=='park'&&map.id!=='riverbank')return new Map();
 let entries=nativeBounds.get(map);
 if(!entries){entries=map.props.flatMap(prop=>{const bounds=landscapeFoliageBounds(prop);return bounds?[{prop,bounds}]:[];});nativeBounds.set(map,entries);}
 return new Map(entries.map(({prop,bounds})=>[prop.id,projectFoliageBounds(prop,bounds,view)]));
}
