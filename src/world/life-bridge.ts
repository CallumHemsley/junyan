import {compileLife,sampleLife,interactLife,restoreLife,type LifePlan,type LifeContext} from "./life";
import {navigationFor} from "./life/navigation";
import {catHabitat} from "./maps/courtyard/habitat";
import {content} from "../content";
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
 const seated=world.mapId==="restaurant"?game.customers.filter(c=>c.phase!=="served").flatMap(c=>{const order=content.orders.find(o=>o.id===c.orderId);const actor=content.characters.find(a=>a.name===order?.customer);return actor?[actor.id]:[];}):[];
 return {day:game.day,seed:game.seed,elapsedMs,player:world.position,reducedMotion,cats,excludedCharacterIds:seated,
  habitats:habitat?[{characterId:"white-cat",position:habitat.white,activity:"sit"},{characterId:"black-cat",position:habitat.black,activity:"sit"}]:undefined,
  gardenMature:Object.values(game.neighbourhood?.garden.plants??{}).some(p=>p.growth===3)};
}
export function actorsFor(map:WorldMapDefinition,game:GameState,world:WorldState,elapsedMs:number,reducedMotion:boolean) {return sampleLife(planFor(map,game),lifeContext(game,world,elapsedMs,reducedMotion),navigationFor(map));}
export function performLifeInteraction(map:WorldMapDefinition,game:GameState,world:WorldState,action:WorldLifeAction) {
 return interactLife(restoreLife(world.life),planFor(map,game),actorsFor(map,game,world,action.elapsedMs,false),lifeContext(game,world,action.elapsedMs,false),action.actionId,navigationFor(map));
}
