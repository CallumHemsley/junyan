import {readingRoomHost} from "../features/reading-room/neighbours";
import {lifeExcludedCharacterIds} from "./life/resident-presence";
import {compileLife,sampleLife,interactLife,restoreLife,courtyardHabitats,type LifePlan,type LifeContext} from "./life";
import {navigationFor} from "./life/navigation";
import {catHabitat} from "./maps/courtyard/habitat";
export {navigationFor} from "./life/navigation";
import type {WorldMapDefinition,WorldState} from "./schema";
import type {GameState} from "../contracts";
const plans=new WeakMap<WorldMapDefinition,LifePlan>();
const courtyardPlans=new WeakMap<object,LifePlan>();
export type WorldLifeAction={type:"world-life";actionId:string;elapsedMs:number};
export function planFor(map:WorldMapDefinition,game?:GameState):LifePlan {
 if(map.id==="courtyard"&&game?.neighbourhood){
  const cats=game.neighbourhood.cats;let plan=courtyardPlans.get(cats);
  if(!plan){const habitat=catHabitat(cats,game.day);const hooks=map.npcHooks.filter(h=>!["cats.white","cats.black","white-cat","black-cat"].includes(h.characterId));
   plan=compileLife({...map,npcHooks:[...hooks,{id:"courtyard.story-white",position:habitat.white,route:[],characterId:"white-cat"},{id:"courtyard.story-black",position:habitat.black,route:[],characterId:"black-cat"}]},navigationFor(map));courtyardPlans.set(cats,plan);}
  return plan;
 }
 let plan=plans.get(map);if(!plan){plan=compileLife(map,navigationFor(map));plans.set(map,plan);}return plan;
}
export function lifeContext(game:GameState,world:WorldState,elapsedMs:number,reducedMotion:boolean):LifeContext {
 const cats=game.neighbourhood?.cats,habitat=cats&&world.mapId==="courtyard"?catHabitat(cats,game.day):null;
 const excludedCharacterIds=lifeExcludedCharacterIds(game,restoreLife(world.life),world.mapId,elapsedMs);
 return {day:game.day,seed:game.seed,elapsedMs,player:world.position,reducedMotion,cats,excludedCharacterIds,
  habitats:habitat?courtyardHabitats(habitat):undefined,
  gardenMature:game.neighbourhood?.garden.restored === true && game.neighbourhood.garden.plants.tree.growth === 3};
}
export function actorsFor(map:WorldMapDefinition,game:GameState,world:WorldState,elapsedMs:number,reducedMotion:boolean) {
 const context=lifeContext(game,world,elapsedMs,reducedMotion);
 const actors=sampleLife(planFor(map,game),context,navigationFor(map),restoreLife(world.life));
 return map.id==="reading-room"&&game.neighbourhood?[...actors,...readingRoomHost(game.neighbourhood["reading-room"],context,map)]:actors;
}
export function performLifeInteraction(map:WorldMapDefinition,game:GameState,world:WorldState,action:WorldLifeAction) {
 return interactLife(restoreLife(world.life),planFor(map,game),actorsFor(map,game,world,action.elapsedMs,false),lifeContext(game,world,action.elapsedMs,false),action.actionId,navigationFor(map));
}
