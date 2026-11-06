import type { GameState } from "../contracts";
import { createNeighbourhood } from "../neighbourhood/model";
import { balance, catalog, progressionForDay, type Progression } from "./model";
import type { State } from "../features/apartment/rules";

export function restorePurchases(home: State, p: Progression): State {
  const missing = p.purchases.filter(id => !home.owned.includes(id));
  return missing.length ? { ...home, owned: [...home.owned, ...missing] } : home;
}
export function purchaseFurniture(game: GameState, id: string): GameState {
  const n = game.neighbourhood ?? createNeighbourhood(game.day);
  const item = catalog.furniture.find(f => f.id === id);
  if (n.location !== "apartment" || !item || n.apartment.owned.includes(item.id) || balance(game) < item.price) return game;
  const p = progressionForDay(game);
  if (p.purchases.includes(item.id)) return game;
  const progression = { ...p, spent: p.spent + item.price, purchases: [...p.purchases, item.id] };
  return { ...game, progression, neighbourhood: { ...n, apartment: restorePurchases(n.apartment, progression) } };
}
