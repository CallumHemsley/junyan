import {releaseServedCustomer,restoreLife} from "../world/life";
import {performLifeInteraction,type WorldLifeAction} from "../world/life-bridge";
import { mapsForNeighbourhood, safeAfterEdit } from "../world/dynamic";
import { restoreWorld, reduceWorld, type WorldAction } from "../world/state";
import type { Content, GameState } from "../contracts";
import { recoverWords, reduceGame } from "../game";
import {TABLES,KITCHEN} from "../contracts";
import {repairActionForWorldAnchor} from "../features/repairs/world";
import { contentWords } from "../content/words";
import * as apartment from "../features/apartment/rules";
import * as cats from "../features/cats/rules";
import * as repairs from "../features/repairs/rules";
import * as readingRoom from "../features/reading-room/rules";
import * as garden from "../features/garden/rules";
import type { GiftId, LocationId } from "./contracts";
import { availableGifts, createNeighbourhood } from "./model";
import { claimGift, visitLocation } from "./state";
import { availableScenarios, practiceForTransition } from "../progression/scenarios";
import { purchaseFurniture } from "../progression/purchases";

export type NeighbourhoodAction =
  | WorldAction
  | WorldLifeAction
  | {type:"advance-world-day";now?:number}
  | { type: "purchase-furniture"; id: string }
  | { type: "follow-scenario"; id: string }
  | { type: "visit-location"; location: LocationId }
  | { type: "claim-neighbourhood-gift"; giftId: GiftId }
  | ({ type: "feature-action"; now: number } & (
    | { feature: "apartment"; action: apartment.Action }
    | { feature: "cats"; action: cats.Action }
    | { feature: "repairs"; action: repairs.Action }
    | { feature: "garden"; action: garden.Action }
    | { feature: "reading-room"; action: readingRoom.Action }
  ));

export function isNeighbourhoodAction(action: { type: string }): action is NeighbourhoodAction {
  return action.type === "follow-scenario" || action.type === "purchase-furniture" || action.type==="advance-world-day" || action.type.startsWith("world-") || action.type === "visit-location" || action.type === "feature-action" || action.type === "claim-neighbourhood-gift";
}


export function reduceNeighbourhoodGame(game: GameState, action: NeighbourhoodAction, content: Content): GameState {
  if (action.type === "purchase-furniture") {
    if(game.world && game.world.mapId !== "apartment")return game;
    return purchaseFurniture(game, action.id);
  }
  const state = game.neighbourhood ?? createNeighbourhood(game.day);
  if(action.type==="advance-world-day") {
    const next=reduceGame(game,{type:"next-day",now:action.now},content);
    return next===game?game:{...next,...(game.world?{world:{...game.world,life:{...restoreLife(game.world.life),serviceDepartures:[]}}}:{})};
  }
  if(action.type==="world-life") {
    const maps=mapsForNeighbourhood(state),world=restoreWorld(game.world,maps,state.location,false);
    const result=performLifeInteraction(maps[world.mapId],game,world,action);
    if(result.state===world.life)return game;
    return {...game,world:{...world,life:result.state}};
  }
  if (action.type === "world-clock" || action.type === "world-move" || action.type === "world-interact" || action.type === "world-close") {
    const maps = mapsForNeighbourhood(state);
    const world = restoreWorld(game.world, maps, state.location, false);
    let next = reduceWorld(world, action, maps);
    if(action.type==="world-close"&&world.activeActivity==="restaurant") {
      const table=Number(world.activeAnchorId?.split("table-")[1]);
      next={...next,life:releaseServedCustomer(restoreLife(world.life),game,table)};
    }
    if (next === world) return game;
    let player=game.player;
    const physicalLocation:LocationId|undefined=({restaurant:"restaurant",apartment:"apartment",courtyard:"cats",workshop:"repairs",rooftop:"garden","reading-room":"reading-room"} as Record<string,LocationId>)[next.mapId];
    const neighbourhood=physicalLocation&&physicalLocation!==state.location?{...state,location:physicalLocation}:state;
    if(action.type==="world-interact" && next.activeActivity) {
      const anchor=maps[next.mapId].anchors.find(a=>a.id===next.activeAnchorId);
      if(next.activeActivity==="restaurant"&&anchor) {
        const table=TABLES.find(t=>anchor.interactionId===`table-${t.table}`);
        player=table?{x:table.x+1.4,y:table.y}:{x:KITCHEN.x,y:KITCHEN.y+1.3};
      }
      if(next.activeActivity==="cats"&&anchor) {
        const target=anchor.interactionId.replace(/^cats\./,"");
        const selected=cats.targets.find(id=>id===target);
        if(selected)return reduceNeighbourhoodGame({...game,player,world:next,neighbourhood},{type:"feature-action",feature:"cats",action:{type:"select",target:selected},now:action.now??0},content);
      }
      if(next.activeActivity==="repairs"&&anchor) {
        const repairAction=repairActionForWorldAnchor(anchor.interactionId);
        if(repairAction)return reduceNeighbourhoodGame({...game,player,world:next,neighbourhood},{type:"feature-action",feature:"repairs",action:repairAction,now:action.now??0},content);
      }
    }
    return { ...game, player, world: next, neighbourhood };
  }
  if (action.type === "follow-scenario") {
    const scenario = availableScenarios(game).find(s => s.id === action.id);
    if (!scenario) return game;
    let next = game.world ? state : visitLocation(state, scenario.location);
    if (scenario.id === "repairs.lamp" || scenario.id === "repairs.toy") {
      const job = scenario.id === "repairs.lamp" ? "lamp" : "toy";
      next = { ...next, repairs: repairs.reduce(next.repairs, { type: next.repairs.jobs[job] ? "switch" : "start", job }, game.day) };
    }
    if (scenario.location === "cats" && scenario.id !== "cats.reunion" && next.cats.repeat.status !== "active") {
      next = { ...next, cats: cats.reduce(next.cats, { type: "begin" }, game.day) };
    }
    return { ...game, neighbourhood: next };
  }
  if (action.type === "visit-location") {
    const next = visitLocation(state, action.location);
    return next === state ? game : { ...game, neighbourhood: next };
  }
  if (action.type === "claim-neighbourhood-gift") {
    const next = claimGift(state, action.giftId, availableGifts(state), (home, giftId) => apartment.reduce(home, { type: "receive-gift", giftId }, game.day));
    return next === state ? game : { ...game, neighbourhood: next };
  }
  if (action.feature !== state.location || !Number.isFinite(action.now) || action.now < 0) return game;
  let next = state;
  let recovered: string[] = [];
  switch (action.feature) {
    case "apartment": {
      if (action.action.type === "receive-gift") return game;
      const after = apartment.reduce(state.apartment, action.action, game.day);
      if (after === state.apartment) return game;
      next = { ...state, apartment: after };
      recovered = apartment.recoveryForTransition(state.apartment, action.action, after);
      break;
    }
    case "cats": {
      const after = cats.reduce(state.cats, action.action, game.day);
      if (after === state.cats) return game;
      next = { ...state, cats: after };
      recovered = cats.recoveryForTransition(state.cats, after);
      break;
    }
    case "repairs": {
      const after = repairs.reduce(state.repairs, action.action, game.day);
      if (after === state.repairs) return game;
      next = { ...state, repairs: after };
      recovered = repairs.recovered(state.repairs, action.action, after);
      break;
    }
    case "reading-room": {
      if (game.world && (game.world.mapId !== "reading-room" || game.world.activeActivity !== "reading-room")) return game;
      const after = readingRoom.reduce(state["reading-room"], action.action);
      if (after === state["reading-room"]) return game;
      next = { ...state, "reading-room": after };
      recovered = readingRoom.recoveryForTransition(state["reading-room"], action.action, after);
      break;
    }
    case "garden": {
      const after = garden.reduce(state.garden, action.action, game.day);
      if (after === state.garden) return game;
      next = { ...state, garden: after };
      recovered = garden.recoveryForTransition(state.garden, after, action.action);
    }
  }
  const known = new Set(contentWords(content).map(word => word.id));
  const journal = recoverWords(game.journal, recovered.filter(id => known.has(id)), action.now);
  let world = game.world;
  if(world) {
    const beforeMap=mapsForNeighbourhood(state)[world.mapId],afterMap=mapsForNeighbourhood(next)[world.mapId];
    if(beforeMap&&afterMap&&beforeMap!==afterMap){
      const position=safeAfterEdit(beforeMap,afterMap,world.position);
      if(!position)return game; // Reject the whole edit: feature, journal and world stay atomic.
      world={...world,position};
    }
  }
  const after = { ...game, ...(world?{world}:{}), neighbourhood: next, journal };
  return { ...after, progression: practiceForTransition({ ...game, neighbourhood: state }, action, after, content) };
}
