import type { Content, GameState } from "../contracts";
import { recoverWords } from "../game";
import { contentWords } from "../content/words";
import * as apartment from "../features/apartment/rules";
import * as cats from "../features/cats/rules";
import * as repairs from "../features/repairs/rules";
import * as garden from "../features/garden/rules";
import type { GiftId, LocationId } from "./contracts";
import { availableGifts, createNeighbourhood } from "./model";
import { claimGift, visitLocation } from "./state";

export type NeighbourhoodAction =
  | { type: "visit-location"; location: LocationId }
  | { type: "claim-neighbourhood-gift"; giftId: GiftId }
  | ({ type: "feature-action"; now: number } & (
    | { feature: "apartment"; action: apartment.Action }
    | { feature: "cats"; action: cats.Action }
    | { feature: "repairs"; action: repairs.Action }
    | { feature: "garden"; action: garden.Action }
  ));

export function isNeighbourhoodAction(action: { type: string }): action is NeighbourhoodAction {
  return action.type === "visit-location" || action.type === "feature-action" || action.type === "claim-neighbourhood-gift";
}

export function reduceNeighbourhoodGame(game: GameState, action: NeighbourhoodAction, content: Content): GameState {
  const state = game.neighbourhood ?? createNeighbourhood(game.day);
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
    case "garden": {
      const after = garden.reduce(state.garden, action.action, game.day);
      if (after === state.garden) return game;
      next = { ...state, garden: after };
      recovered = garden.recoveryForTransition(state.garden, after, action.action);
    }
  }
  const known = new Set(contentWords(content).map(word => word.id));
  const journal = recoverWords(game.journal, recovered.filter(id => known.has(id)), action.now);
  return { ...game, neighbourhood: next, journal };
}
