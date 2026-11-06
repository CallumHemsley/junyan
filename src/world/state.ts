import {safeExitPosition,isExitConnected} from "./exit-safety";
import {restoreLife,advanceLife} from "./life";
import { z } from "zod";
import { facingSchema, pointSchema, type WorldState, type Point, type FeatureId } from "./schema";
import type { MapRegistry } from "./registry";
import { canStand, canWalk, contains, nearbyAnchors } from "./geometry";
const spawn=pointSchema.extend({facing:facingSchema});
const savedSchema=z.object({version:z.literal(1),mapId:z.string(),position:pointSchema,facing:facingSchema,returnPositions:z.record(z.string(),spawn),activeActivity:z.enum(["restaurant","apartment","cats","repairs","garden"]).nullable(),activeAnchorId:z.string().nullable().default(null),life:z.unknown().optional()});
const locationMap:Record<string,string>={restaurant:"restaurant",apartment:"apartment",cats:"courtyard",repairs:"workshop",garden:"rooftop"};
export function createWorld(maps:MapRegistry,location="restaurant"):WorldState {
  const map=maps[locationMap[location]]??maps.restaurant;
  return {version:1,mapId:map.id,position:{x:map.defaultSpawn.x,y:map.defaultSpawn.y},facing:map.defaultSpawn.facing,returnPositions:{},activeActivity:null,activeAnchorId:null,life:restoreLife(null)};
}
export function restoreWorld(value:unknown,maps:MapRegistry,location="restaurant",checkExitConnectivity=true):WorldState {
  const parsed=savedSchema.safeParse(value);
  if(!parsed.success) return createWorld(maps,location);
  const state=parsed.data,map=maps[state.mapId];
  if(!map) return createWorld(maps,location);
  const position=checkExitConnectivity?safeExitPosition(map,state.position):(canStand(map,state.position)?state.position:map.defaultSpawn);
  const returnPositions=Object.fromEntries(Object.entries(state.returnPositions).filter(([id,p])=>maps[id]&&(checkExitConnectivity?isExitConnected(maps[id],p):canStand(maps[id],p))));
  const activeActivity=state.activeActivity && nearbyAnchors(map,position).some(a=>a.featureId===state.activeActivity)?state.activeActivity:null;
  const activeAnchorId=activeActivity?(nearbyAnchors(map,position).find(a=>a.id===state.activeAnchorId&&a.featureId===activeActivity)?.id??nearbyAnchors(map,position).find(a=>a.featureId===activeActivity)?.id??null):null;
  return {...state,position:{x:position.x,y:position.y},returnPositions,activeActivity,activeAnchorId,life:restoreLife(state.life)};
}
export type WorldAction = {type:"world-clock";elapsedMs:number}|{type:"world-life";actionId:string;elapsedMs:number}|{type:"world-move";position:Point}|{type:"world-interact";anchorId:string}|{type:"world-close"};
export function reduceWorld(state:WorldState,action:WorldAction,maps:MapRegistry):WorldState {
  if(action.type==="world-clock") {const previous=restoreLife(state.life);const life=advanceLife(previous,action.elapsedMs-previous.elapsedMs,true);return life===previous?state:{...state,life};}
  if(action.type==="world-life")return state;
  const map=maps[state.mapId];
  if(!map) return createWorld(maps);
  if(action.type==="world-close") return state.activeActivity?{...state,activeActivity:null,activeAnchorId:null}:state;
  if(action.type==="world-interact") {
    const anchor=nearbyAnchors(map,state.position).find(a=>a.id===action.anchorId);
    if(!anchor||anchor.featureId==="exploration") return state;
    return {...state,activeActivity:anchor.featureId,activeAnchorId:anchor.id};
  }
  if(state.activeActivity || !canWalk(map,state.position,action.position)) return state;
  const dx=action.position.x-state.position.x,dy=action.position.y-state.position.y;
  if(!dx&&!dy) return state;
  const facing=Math.abs(dx)>Math.abs(dy)?dx>0?"east":"west":dy>0?"south":"north";
  const exit=map.exits.find(exit=>contains(exit.rect,action.position));
  if(exit) {
    const target=maps[exit.targetMapId],entrance=target?.entrances.find(e=>e.id===exit.targetEntranceId);
    if(target&&entrance&&canStand(target,entrance.position)) return {...state,mapId:target.id,position:entrance.position,facing:entrance.facing,returnPositions:{...state.returnPositions,[map.id]:{...state.position,facing}},activeActivity:null,activeAnchorId:null};
  }
  return {...state,position:action.position,facing};
}
export function activityLocation(feature:Exclude<FeatureId,"exploration">) {return feature;}
