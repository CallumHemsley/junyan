import {courtyardForCats} from "./maps/courtyard";
import {furnitureColliders} from "../features/apartment/world";
import {projectGarden} from "./maps/rooftop";
import type {NeighbourhoodState} from "../neighbourhood/model";
import type {WorldMapDefinition,Point} from "./schema";
import {worldMaps,type MapRegistry} from "./registry";
import {safeExitPosition} from "./exit-safety";
const apartments=new WeakMap<object,WorldMapDefinition>(),roofs=new WeakMap<object,WorldMapDefinition>(),courtyards=new WeakMap<object,{day:number;map:WorldMapDefinition}>();
export function mapsForNeighbourhood(state:NeighbourhoodState,day=state.garden.day??1):MapRegistry {
 let apartment=apartments.get(state.apartment.placements),rooftop=roofs.get(state.garden);
 if(!apartment&&worldMaps.apartment){apartment={...worldMaps.apartment,colliders:[...worldMaps.apartment.colliders,...furnitureColliders(state.apartment)]};apartments.set(state.apartment.placements,apartment);}
 if(!rooftop&&worldMaps.rooftop){const projected=projectGarden(state.garden);rooftop={...worldMaps.rooftop,anchors:[...worldMaps.rooftop.anchors,...projected.anchors],props:[...worldMaps.rooftop.props,...projected.props],colliders:[...worldMaps.rooftop.colliders,...projected.colliders],occluders:[...worldMaps.rooftop.occluders,...projected.occluders]};roofs.set(state.garden,rooftop);}
 let courtyard=courtyards.get(state.cats);if(worldMaps.courtyard&&courtyard?.day!==day){courtyard={day,map:courtyardForCats(worldMaps.courtyard,state.cats,day)};courtyards.set(state.cats,courtyard);}
 return {...worldMaps,...(courtyard?{courtyard:courtyard.map}:{}),...(apartment?{apartment}:{}),...(rooftop?{rooftop}:{})};
}
export function safeAfterEdit(_before:WorldMapDefinition,after:WorldMapDefinition,position:Point):Point|null {
 return safeExitPosition(after,position);
}
