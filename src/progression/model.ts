import { z } from "zod";
import type { Content, GameState, Order } from "../contracts";
import { contentWords } from "../content/words";
import data from "./catalog.json" with { type: "json" };
import identityData from "./identities.json" with { type: "json" };

export const identities = z.record(z.string(), z.array(z.string()).min(1)).parse(identityData);
const identityById = new Map(Object.entries(identities).flatMap(([identity, ids]) => ids.map(id => [id, identity] as const)));
export const scenarioIds = ["cats.reunion", "cats.sunny", "cats.rainy", "cats.route", "repairs.lamp", "repairs.toy", "garden.water", "garden.observe", "apartment.place"] as const;

export const catalog = z.strictObject({
  furniture: z.array(z.strictObject({ id: z.enum(["blue-vase", "large-basket", "small-lamp"]), word: z.string(), modifier: z.string(), price: z.number().int().positive() })),
  scenarios: z.array(z.strictObject({ id: z.enum(scenarioIds), location: z.enum(["cats", "repairs", "garden", "apartment"]), label: z.array(z.string()).min(1), targets: z.array(z.string()).min(1) })),
}).parse(data);
export function validateCatalog(content: Content): void {
  const words = contentWords(content);
  const wordIds = new Set(words.map(w => w.id));
  const registeredIds = Object.values(identities).flat();
  if (new Set(registeredIds).size !== registeredIds.length) throw new Error("A word has multiple semantic identities");
  for (const [identity, ids] of Object.entries(identities)) {
    if (!ids.every(id => wordIds.has(id))) throw new Error(`Unknown semantic identity: ${identity}`);
  }
  for (const item of catalog.furniture) {
    if (!wordIds.has(item.word) || !wordIds.has(item.modifier)) throw new Error(`Unknown furniture vocabulary: ${item.id}`);
  }
  for (const scenario of catalog.scenarios) {
    if (!scenario.label.every(word => wordIds.has(word)) || !scenario.targets.every(word => wordIds.has(word))) throw new Error(`Unknown scenario vocabulary: ${scenario.id}`);
  }
  if (new Set(catalog.scenarios.map(s => s.id)).size !== catalog.scenarios.length || new Set(catalog.furniture.map(f => f.id)).size !== catalog.furniture.length) throw new Error("Duplicate progression content");
}
export type Scenario = typeof catalog.scenarios[number];
export type PurchaseId = typeof catalog.furniture[number]["id"];
export type Review = {
  successes: number; encounters: number; interval: number; dueDay: number; dueAt: number;
  lastDay: number; lastAt: number; context: string;
};
export type Progression = {
  version: 1; spent: number; purchases: PurchaseId[];
  review: Record<string, Review>;
  daily: { day: number; completed: string[]; supported: string[] };
  lastContext: string | null;
};
export const REAL_DAY = 24 * 60 * 60 * 1000;
export function initialProgression(day: number): Progression {
  return { version: 1, spent: 0, purchases: [], review: {}, daily: { day, completed: [], supported: [] }, lastContext: null };
}
export function progressionForDay(game: Pick<GameState, "day" | "progression">): Progression {
  const p = game.progression ?? initialProgression(game.day);
  return p.daily.day === game.day ? p : { ...p, daily: { day: game.day, completed: [], supported: [] } };
}
export function canonicalWords(ids: readonly string[], content: Content): string[] {
  const words = contentWords(content);
  return [...new Set(ids.flatMap(id => {
    const word = words.find(word => word.id === id);
    if (!word) return [];
    return [identityById.get(id) ?? `word:${id}`];
  }))];
}
export function supportWords(game: GameState, words: readonly string[]): Progression {
  const p = progressionForDay(game);
  return { ...p, daily: { ...p.daily, supported: [...new Set([...p.daily.supported, ...words])] } };
}
export function recordPractice(game: GameState, context: string, words: readonly string[], now: number): Progression {
  const p = progressionForDay(game);
  if (!Number.isFinite(now) || now < 0 || p.daily.completed.includes(context)) return p;
  const review = { ...p.review };
  for (const word of new Set(words)) {
    const previous = review[word];
    if (previous && previous.lastDay >= game.day) continue;
    const supported = p.daily.supported.includes(word);
    const spaced = !previous || (game.day >= previous.dueDay && now >= previous.dueAt);
    const rollback = previous && now < previous.lastAt;
    const independent = !supported && spaced && !rollback;
    // A different purpose is needed before intervals grow beyond the first revisit.
    const varied = !previous || previous.context !== context;
    const successes = (previous?.successes ?? 0) + (independent ? 1 : 0);
    const interval = supported ? 1 : independent && varied ? Math.min(7, (previous?.interval ?? 0) + 1) : previous?.interval ?? 1;
    review[word] = {
      successes, encounters: (previous?.encounters ?? 0) + 1, interval,
      dueDay: previous && !spaced && !supported && !rollback ? previous.dueDay : game.day + interval,
      dueAt: previous && !spaced && !supported && !rollback ? previous.dueAt : now + interval * REAL_DAY,
      lastDay: game.day, lastAt: now, context,
    };
  }
  return { ...p, review, lastContext: context, daily: { ...p.daily, completed: [...p.daily.completed, context] } };
}
export function dueScore(p: Progression, words: readonly string[], day: number, now: number, context: string): number {
  return words.reduce((score, word) => {
    const r = p.review[word];
    if (!r) return score + 1;
    const due = day >= r.dueDay || now >= r.dueAt;
    return score + (due ? 4 + (r.context !== context ? 2 : 0) : 0);
  }, 0);
}
export function orderTargets(order: Order, content: Content): string[] {
  return canonicalWords(order.items.flatMap(item => content.foods.find(food => food.id === item.foodId)?.word.id ?? []), content);
}
export function chooseOrder(orders: Order[], previousId: string | undefined, p: Progression, day: number, now: number, random: number, content: Content): Order {
  const alternatives = orders.filter(order => order.id !== previousId);
  const eligible = alternatives.length ? alternatives : orders;
  const scores = eligible.map(order => dueScore(p, orderTargets(order, content), day, now, `restaurant.${order.id}`));
  const best = Math.max(...scores);
  const finalists = eligible.filter((_, index) => scores[index] === best);
  return finalists[Math.floor(random * finalists.length)];
}
export function balance(game: GameState): number { return Math.max(0, game.earnings - (game.progression?.spent ?? 0)); }
