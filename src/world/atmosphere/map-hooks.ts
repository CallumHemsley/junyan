import type {AtmosphereHooks,Point,Rect} from './index';

export type AtmosphereMap = {
  id:string;
  terrain:readonly {id:string;rect:Rect;material:string}[];
  props:readonly {id:string;kind:string;position:Point;width:number;height:number}[];
};
const trees=new Set(['tree','willow','bamboo']);
const plants=new Set(['grass','reeds','flowers','planter','plant']);
const windows=new Set(['window','warm-window']);
const lamps=new Set(['lamp','lantern','street-lamp']);
const interiors=new Set(['restaurant','apartment','workshop','residential-hall','residential-stairs']);

/** Compile once when the validated map is registered; owners can override any hook. */
export function atmosphereHooksForMap(map:AtmosphereMap, overrides:AtmosphereHooks={}): AtmosphereHooks {
  const water=map.terrain.filter(t=>t.material==='water').map(t=>({id:t.id,rect:t.rect,shore:['north','east','south','west'] as const}));
  const foliage=map.props.filter(p=>trees.has(p.kind)||plants.has(p.kind)).map((p,i)=>({id:p.id,motion:p.kind==='willow'||i%4===0,depth:p.position.x+p.position.y+p.width/2+p.height/2+.01,position:{...p.position,z:trees.has(p.kind)?Math.max(1,p.height*.65):.15},radius:Math.min(1.5,Math.max(.3,p.width*.4)),kind:trees.has(p.kind)?'leaves' as const:'grass' as const}));
  const lights=map.props.filter(p=>windows.has(p.kind)||lamps.has(p.kind)).map(p=>({id:p.id,position:{...p.position,z:1.5},radius:2.4,kind:windows.has(p.kind)?'window' as const:'lamp' as const}));
  const shadows=map.props.filter(p=>trees.has(p.kind)||lamps.has(p.kind)).map(p=>({id:p.id,position:p.position,radius:Math.min(1.2,p.width*.4),height:Math.min(4,p.height)}));
  return {interior:interiors.has(map.id),water,foliage,lights,shadows,...overrides};
}
