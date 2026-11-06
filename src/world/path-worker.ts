import {findPath} from "./geometry";
import type {Point,WorldMapDefinition} from "./schema";
let current:WorldMapDefinition|undefined;
self.onmessage=(event:MessageEvent<{id:number;map?:WorldMapDefinition;from:Point;to:Point}>)=>{
 const {id,map,from,to}=event.data;
 if(map)current=map;
 const path=current?findPath(current,from,to):[];
 self.postMessage({id,path,mapId:current?.id});
};
