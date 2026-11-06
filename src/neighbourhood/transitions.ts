import type { Content, GameState } from "../contracts";
import { recoverWords } from "../game";
import { contentWords } from "../content/words";
import * as apartment from "../features/apartment/rules";
import * as cats from "../features/cats/rules";
import * as repairs from "../features/repairs/rules";
import * as garden from "../features/garden/rules";
import { wordByHanzi } from "../features/apartment/content";
import type { GiftId, LocationId } from "./contracts";
import { availableGifts, createNeighbourhood } from "./model";
import { claimGift, visitLocation } from "./state";
import { availableScenarios, practiceForTransition } from "../progression/scenarios";
import { purchaseFurniture } from "../progression/purchases";

export type NeighbourhoodAction =
  | { type: "purchase-furniture"; id: string }
  | { type: "follow-scenario"; id: string }
  | { type: "visit-location"; location: LocationId }
  | { type: "claim-neighbourhood-gift"; giftId: GiftId }
  | ({ type: "feature-action"; now: number } & (
    | { feature: "apartment"; action: apartment.Action }
    | { feature: "cats"; action: cats.Action }
    | { feature: "repairs"; action: repairs.Action }
    | { feature: "garden"; action: garden.Action }
  ));

export function isNeighbourhoodAction(action: { type: string }): action is NeighbourhoodAction {
  return action.type === "follow-scenario" || action.type === "purchase-furniture" || action.type === "visit-location" || action.type === "feature-action" || action.type === "claim-neighbourhood-gift";
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
      vase: ["花瓶"], basket: ["篮子"], lamp: ["灯"], "blue-vase": ["蓝色", "花瓶"], "large-basket": ["大", "篮子"], "small-lamp": ["小", "灯"],
    };
    words = [...names[before.selected], "放", "这里"];
  }
  return words.map(hanzi => wordByHanzi[hanzi].id);
}

export function reduceNeighbourhoodGame(game: GameState, action: NeighbourhoodAction, content: Content): GameState {
  if (action.type === "purchase-furniture") return purchaseFurniture(game, action.id);
  const state = game.neighbourhood ?? createNeighbourhood(game.day);
  if (action.type === "follow-scenario") {
    const scenario = availableScenarios(game).find(s => s.id === action.id);
    if (!scenario) return game;
    let next = visitLocation(state, scenario.location);
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
  const after = { ...game, neighbourhood: next, journal };
  return { ...after, progression: practiceForTransition({ ...game, neighbourhood: state }, action, after, content) };
}
