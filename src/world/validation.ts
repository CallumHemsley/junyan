import type {MapRegistry} from "./registry";
import { canStand, findPath } from "./geometry";
export function validateWorldGraph(maps:MapRegistry):string[] {
 const errors:string[]=[];
 for(const map of Object.values(maps)) {
  if(!canStand(map,map.defaultSpawn)) errors.push(`${map.id}: blocked default spawn`);
  for(const entry of map.entrances) if(!canStand(map,entry.position)) errors.push(`${map.id}/${entry.id}: blocked arrival`);
  for(const exit of map.exits) {
   const target=maps[exit.targetMapId];
   if(!target?.entrances.some(e=>e.id===exit.targetEntranceId)) errors.push(`${map.id}/${exit.id}: unknown destination ${exit.targetMapId}/${exit.targetEntranceId}`);
   const rect=exit.rect;
   if(!findPath(map,map.defaultSpawn,{x:rect.x+rect.width/2,y:rect.y+rect.height/2}).length) errors.push(`${map.id}/${exit.id}: unreachable exit`);
  }
  for(const a of map.anchors) {
   const approaches=[a.position,...Array.from({length:16},(_,i)=>({x:a.position.x+Math.cos(i*Math.PI/8)*a.radius*.9,y:a.position.y+Math.sin(i*Math.PI/8)*a.radius*.9}))];
   if(!approaches.some(point=>findPath(map,map.defaultSpawn,point).length))errors.push(`${map.id}/${a.id}: unreachable anchor approach`);
  }
 }
 return errors;
}
