import {performLifeInteraction,type WorldLifeAction} from "../world/life-bridge";
import { mapsForNeighbourhood, safeAfterEdit } from "../world/dynamic";
import { restoreWorld, reduceWorld, type WorldAction } from "../world/state";
import type { Content, GameState } from "../contracts";
import { recoverWords } from "../game";
import {TABLES,KITCHEN} from "../contracts";
import {repairActionForWorldAnchor} from "../features/repairs/world";
import { contentWords } from "../content/words";
import * as apartment from "../features/apartment/rules";
import * as cats from "../features/cats/rules";
import * as repairs from "../features/repairs/rules";
import * as garden from "../features/garden/rules";
import { wordByHanzi } from "../features/apartment/content";
import type { GiftId, LocationId } from "./contracts";
import { availableGifts, createNeighbourhood } from "./model";
import { claimGift, visitLocation } from "./state";

export type NeighbourhoodAction =
  | WorldAction
  | WorldLifeAction
  | { type: "visit-location"; location: LocationId }
  | { type: "claim-neighbourhood-gift"; giftId: GiftId }
  | ({ type: "feature-action"; now: number } & (
    | { feature: "apartment"; action: apartment.Action }
    | { feature: "cats"; action: cats.Action }
    | { feature: "repairs"; action: repairs.Action }
    | { feature: "garden"; action: garden.Action }
  ));

export function isNeighbourhoodAction(action: { type: string }): action is NeighbourhoodAction {
  return action.type.startsWith("world-") || action.type === "visit-location" || action.type === "feature-action" || action.type === "claim-neighbourhood-gift";
}

function apartmentRecovery(before: apartment.State, action: apartment.Action, after: apartment.State): string[] {
  let words: string[] = [];
  if (action.type === "accept-starter" && after.owned.length !== before.owned.length) words = ["桌子", "椅子"];
  if (action.type === "choose-colour" && before.colour !== after.colour) words = [after.colour === "blue" ? "蓝色" : "米色", "靠垫"];
  const changed = JSON.stringify(before.placements) !== JSON.stringify(after.placements);
  if (action.type === "store" && changed) words = ["收起来"];
  if (action.type === "place" && changed && before.selected) {
    const names: Record<apartment.ItemId, string[]> = {
      bed: ["床"], table: ["桌子"], chair: ["椅子"], rug: ["地毯"], cushion: ["靠垫"],
      "repairs.stool": ["凳子"], "garden.planter": ["盆栽"], "cats.cushion": ["猫", "靠垫"],
      vase: ["花瓶"], basket: ["篮子"], lamp: ["灯"],
    };
    words = [...names[before.selected], "放", "这里"];
  }
  return words.map(hanzi => wordByHanzi[hanzi].id);
}

export function reduceNeighbourhoodGame(game: GameState, action: NeighbourhoodAction, content: Content): GameState {
  const state = game.neighbourhood ?? createNeighbourhood(game.day);
  if(action.type==="world-life") {
    const maps=mapsForNeighbourhood(state),world=restoreWorld(game.world,maps,state.location);
    const result=performLifeInteraction(maps[world.mapId],game,world,action);
    if(result.state===world.life)return game;
    return {...game,world:{...world,life:result.state}};
  }
  if (action.type === "world-move" || action.type === "world-interact" || action.type === "world-close") {
    const maps = mapsForNeighbourhood(state);
    const world = restoreWorld(game.world, maps, state.location);
    const next = reduceWorld(world, action, maps);
    if (next === world) return game;
    let player=game.player;
    let neighbourhood=next.activeActivity ? { ...state, location: next.activeActivity } : state;
    if(action.type==="world-interact" && next.activeActivity) {
      const anchor=maps[next.mapId].anchors.find(a=>a.id===next.activeAnchorId);
      if(next.activeActivity==="restaurant"&&anchor) {
        const table=TABLES.find(t=>anchor.interactionId===`table-${t.table}`);
        player=table?{x:table.x+1.4,y:table.y}:{x:KITCHEN.x,y:KITCHEN.y+1.3};
      }
      if(next.activeActivity==="repairs"&&anchor) {
        const repairAction=repairActionForWorldAnchor(anchor.interactionId);
        if(repairAction)neighbourhood={...neighbourhood,repairs:repairs.reduce(state.repairs,repairAction,game.day)};
      }
    }
    return { ...game, player, world: next, neighbourhood };
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
      recovered = apartmentRecovery(state.apartment, action.action, after);
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
    if(beforeMap&&afterMap&&beforeMap!==afterMap)world={...world,position:safeAfterEdit(beforeMap,afterMap,world.position)};
  }
  return { ...game, ...(world?{world}:{}), neighbourhood: next, journal };
}
