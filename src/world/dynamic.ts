import {courtyardForCats} from "./maps/courtyard";
import {furnitureColliders} from "../features/apartment/world";
import {projectGarden} from "./maps/rooftop";
import type {NeighbourhoodState} from "../neighbourhood/model";
import type {WorldMapDefinition,Point} from "./schema";
import {worldMaps,type MapRegistry} from "./registry";
import {canStand,canWalk} from "./geometry";
const apartments=new WeakMap<object,WorldMapDefinition>(),roofs=new WeakMap<object,WorldMapDefinition>(),courtyards=new WeakMap<object,{day:number;map:WorldMapDefinition}>();
export function mapsForNeighbourhood(state:NeighbourhoodState,day=state.garden.day??1):MapRegistry {
 let apartment=apartments.get(state.apartment),rooftop=roofs.get(state.garden);
 if(!apartment&&worldMaps.apartment){apartment={...worldMaps.apartment,colliders:[...worldMaps.apartment.colliders,...furnitureColliders(state.apartment)]};apartments.set(state.apartment,apartment);}
 if(!rooftop&&worldMaps.rooftop){const projected=projectGarden(state.garden);rooftop={...worldMaps.rooftop,anchors:[...worldMaps.rooftop.anchors,...projected.anchors],props:[...worldMaps.rooftop.props,...projected.props],colliders:[...worldMaps.rooftop.colliders,...projected.colliders],occluders:[...worldMaps.rooftop.occluders,...projected.occluders]};roofs.set(state.garden,rooftop);}
 let courtyard=courtyards.get(state.cats);if(worldMaps.courtyard&&courtyard?.day!==day){courtyard={day,map:courtyardForCats(worldMaps.courtyard,state.cats,day)};courtyards.set(state.cats,courtyard);}
 return {...worldMaps,...(courtyard?{courtyard:courtyard.map}:{}),...(apartment?{apartment}:{}),...(rooftop?{rooftop}:{})};
}
export function safeAfterEdit(before:WorldMapDefinition,after:WorldMapDefinition,position:Point):Point {
 if(canStand(after,position))return position;
 for(let radius=.5;radius<=Math.hypot(after.bounds.width,after.bounds.height);radius+=.5){
  const candidates:Point[]=[];
  for(let dx=-radius;dx<=radius;dx+=.5)for(const dy of [-radius,radius])candidates.push({x:position.x+dx,y:position.y+dy});
  for(let dy=-radius+.5;dy<radius;dy+=.5)for(const dx of [-radius,radius])candidates.push({x:position.x+dx,y:position.y+dy});
  candidates.sort((a,b)=>Math.hypot(a.x-position.x,a.y-position.y)-Math.hypot(b.x-position.x,b.y-position.y)||a.y-b.y||a.x-b.x);
  for(const candidate of candidates)if(canStand(after,candidate)&&canWalk(before,position,candidate))return candidate;
 }
 return after.defaultSpawn;
}
