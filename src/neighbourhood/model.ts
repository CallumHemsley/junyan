import * as apartment from "../features/apartment/rules";
import * as cats from "../features/cats/rules";
import * as repairs from "../features/repairs/rules";
import * as garden from "../features/garden/rules";
import type { GiftId, Neighbourhood } from "./contracts";
import { initialNeighbourhood, restoreClaimedGifts, validateNeighbourhood } from "./state";

export type NeighbourhoodState = Neighbourhood<apartment.State, cats.State, repairs.State, garden.State>;
const boundaries = { apartment, cats, repairs, garden };

export function createNeighbourhood(day: number): NeighbourhoodState {
  const state = initialNeighbourhood(boundaries);
  return { ...state, garden: garden.reduce(state.garden, { type: "sync" }, day) };
}

export function advanceNeighbourhood(state: NeighbourhoodState, day: number): NeighbourhoodState {
  const next = garden.reduce(state.garden, { type: "sync" }, day);
  return next === state.garden ? state : { ...state, garden: next };
}

export function restoreNeighbourhood(value: unknown, day: number): NeighbourhoodState {
  const state = validateNeighbourhood(value, boundaries);
  if (state.apartment.lastGiftDay > day) state.apartment = apartment.initialState();
  const storyDay = state.cats.story.node === "reunited" ? state.cats.story.day : 0;
  const repeatDay = state.cats.repeat.status === "active" ? state.cats.repeat.encounter.day : state.cats.repeat.status === "complete" ? state.cats.repeat.finishedDay : 0;
  if (Math.max(storyDay, repeatDay, state.cats.lastCompletedDay ?? 0) > day) state.cats = cats.initialState();
  if (state.garden.day !== null && state.garden.day > day) state.garden = garden.initialState();
  const restored = restoreClaimedGifts(state, (home, giftId) => apartment.reduce(home, { type: "receive-gift", giftId }, day));
  return advanceNeighbourhood(restored, day);
}

export function availableGifts(state: NeighbourhoodState): GiftId[] {
  return [...repairs.gifts(state.repairs), ...garden.gifts(state.garden), ...cats.gifts(state.cats)]
    .filter((id): id is GiftId => id === "repairs.stool" || id === "garden.planter" || id === "cats.cushion")
    .filter(id => !state.claimedGiftIds.includes(id));
}
