import {authoredLocalLights} from './local-lights';
import type {AtmosphereHooks,Point,Rect} from './index';

export type AtmosphereMap = {
  id:string;
  terrain:readonly {id:string;rect:Rect;material:string}[];
  props:readonly {id:string;kind:string;position:Point;width:number;height:number}[];
};
const trees=new Set(['mature-tree','tree','willow','bamboo','courtyard-tree','tree-bed']);
const plants=new Set(['grass','reeds','flowers','planter','plant','raised-bed','trellis-bed','border-pot','hedge']);
const windows=new Set(['window','warm-window']);
const lamps=new Set(['lamp','lantern','street-lamp','floor-lamp','wall-lamp','task-lamp']);
const interiors=new Set(['restaurant','apartment','workshop','residential-hall','residential-stairs','reading-room']);

function subtractWaterRect(water:Rect,deck:Rect):Rect[] {
  const left=Math.max(water.x,deck.x),top=Math.max(water.y,deck.y),right=Math.min(water.x+water.width,deck.x+deck.width),bottom=Math.min(water.y+water.height,deck.y+deck.height);
  if(left>=right||top>=bottom)return [water];
  return [
    {x:water.x,y:water.y,width:water.width,height:top-water.y},
    {x:water.x,y:bottom,width:water.width,height:water.y+water.height-bottom},
    {x:water.x,y:top,width:left-water.x,height:bottom-top},
    {x:right,y:top,width:water.x+water.width-right,height:bottom-top},
  ].filter(r=>r.width>0&&r.height>0);
}

/** Compile once when the validated map is registered; owners can override any hook. */
export function atmosphereHooksForMap(map:AtmosphereMap, overrides:AtmosphereHooks={}): AtmosphereHooks {
  const decks=map.terrain.filter(t=>['bridge','boardwalk','deck'].includes(t.material));
  const water=map.terrain.filter(t=>t.material==='water').flatMap(t=>{
    let regions=[t.rect];
    for(const deck of decks)regions=regions.flatMap(rect=>subtractWaterRect(rect,deck.rect));
    return regions.map((rect,i)=>({id:`${t.id}:${i}`,rect,shore:['north','east','south','west'] as const}));
  });
  const foliage=map.props.filter(p=>trees.has(p.kind)||plants.has(p.kind)).map((p,i)=>({id:p.id,motion:p.kind==='willow'||i%4===0,depth:p.position.x+p.position.y+p.width/2+p.height/2+.01,position:{...p.position,z:trees.has(p.kind)?Math.max(1,p.height*.65):.15},radius:Math.min(1.5,Math.max(.3,p.width*.4)),kind:trees.has(p.kind)?'leaves' as const:'grass' as const}));
  const lights=map.props.filter(p=>windows.has(p.kind)||lamps.has(p.kind)).map(p=>({id:p.id,position:{...p.position,z:1.5},radius:2.4,kind:windows.has(p.kind)?'window' as const:'lamp' as const}));
  const landscape=map.id==='park'||map.id==='riverbank';
  const shadows=map.props.filter(p=>trees.has(p.kind)||lamps.has(p.kind)).map(p=>({
    id:p.id,position:p.position,
    radius:trees.has(p.kind)?Math.min(3.2,p.width*(p.kind==='mature-tree'?.325:.275)):.28,
    height:Math.min(6,p.kind==='mature-tree'?p.height*.6:p.height*.55),
    shape:p.kind==='bamboo'?'bamboo' as const:p.kind==='willow'?'willow' as const:trees.has(p.kind)?'canopy' as const:'column' as const,
    contact:(!landscape||!trees.has(p.kind))&&!(map.id==='rooftop'&&p.kind==='tree-bed'),
  }));
  return {interior:interiors.has(map.id),water,foliage,lights,shadows,shadowExclusions:decks.map(t=>t.rect),...authoredLocalLights(map),...overrides};
}
