import {compileLife,sampleLife,type Navigation,type LifePlan,type LifeContext} from "./life";
import {canStand,canWalk,findPath} from "./geometry";
import type {WorldMapDefinition,WorldState} from "./schema";
import type {GameState} from "../contracts";
const plans=new WeakMap<WorldMapDefinition,LifePlan>();
export function navigationFor(map:WorldMapDefinition):Navigation {
 return {canStand:(p,radius)=>canStand(map,p,radius),canWalk:(a,b,radius)=>canWalk(map,a,b,radius),route:(a,b,radius,exclusions)=>findPath({...map,colliders:[...map.colliders,...exclusions.map((rect,i)=>({id:`life-exclusion-${i}`,rect})) ]},a,b,radius)};
}
export function planFor(map:WorldMapDefinition):LifePlan {let plan=plans.get(map);if(!plan){plan=compileLife(map,navigationFor(map));plans.set(map,plan);}return plan;}
export function lifeContext(game:GameState,world:WorldState,elapsedMs:number,reducedMotion:boolean):LifeContext {
 return {day:game.day,seed:game.seed,elapsedMs,player:world.position,reducedMotion,cats:game.neighbourhood?.cats,gardenMature:Object.values(game.neighbourhood?.garden.plants??{}).some(p=>p.growth===3)};
}
export function actorsFor(map:WorldMapDefinition,game:GameState,world:WorldState,elapsedMs:number,reducedMotion:boolean) {return sampleLife(planFor(map),lifeContext(game,world,elapsedMs,reducedMotion));}
