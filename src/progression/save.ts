import { z } from "zod";
import type { Content, GameState } from "../contracts";
import { contentWords } from "../content/words";
import { canonicalWords, catalog, initialProgression, type Progression, type Review } from "./model";

const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const finance = z.object({ version: z.literal(1), spent: integer, purchases: z.array(z.enum(["blue-vase", "large-basket", "small-lamp"])).max(3) });
const reviewSchema = z.object({ successes: integer.max(100000), encounters: integer.max(100000), interval: integer.min(1).max(7), dueDay: integer.min(1), dueAt: integer, lastDay: integer.min(1), lastAt: integer, context: z.string().max(100) });

export function restoreProgression(value: unknown, game: Pick<GameState, "day" | "earnings">, content: Content): Progression | null {
  if (value === undefined) return initialProgression(game.day);
  const parsed = finance.safeParse(value);
  if (!parsed.success || new Set(parsed.data.purchases).size !== parsed.data.purchases.length) return null;
  const { purchases } = parsed.data;
  const paid = purchases.reduce((sum, id) => sum + catalog.furniture.find(f => f.id === id)!.price, 0);
  // Preserve an over-recorded debit rather than silently refunding corrupted spending.
  const spent = Math.max(paid, parsed.data.spent);
  if (spent > game.earnings) return null;
  const raw = z.object({ review: z.record(z.string(), z.unknown()).catch({}), daily: z.unknown().optional(), lastContext: z.string().nullable().catch(null) }).parse(value);
  const words = new Set(canonicalWords(contentWords(content).map(w => w.id), content));
  const contexts = new Set([...catalog.scenarios.map(s => s.id), ...content.orders.map(o => `restaurant.${o.id}`)]);
  const review: Record<string, Review> = {};
  const conflicted = new Set<string>();
  for (const [key, entry] of Object.entries(raw.review)) {
    const canonical = words.has(key) ? key : canonicalWords([key], content)[0];
    const result = reviewSchema.safeParse(entry);
    if (!canonical || !result.success) continue;
    const r = result.data;
    if (r.lastDay > game.day || r.dueDay > r.lastDay + 7 || r.successes > r.encounters || r.encounters > r.lastDay || !contexts.has(r.context)) continue;
    if (review[canonical] && JSON.stringify(review[canonical]) !== JSON.stringify(r)) conflicted.add(canonical);
    else review[canonical] = r;
  }
  for (const key of conflicted) delete review[key];
  const daily = z.object({ day: integer.min(1), completed: z.array(z.string()).max(contexts.size), supported: z.array(z.string()).max(words.size) }).safeParse(raw.daily);
  const validDaily = daily.success && daily.data.day === game.day;
  return {
    version: 1, spent, purchases, review, lastContext: raw.lastContext && contexts.has(raw.lastContext) ? raw.lastContext : null,
    daily: validDaily ? { day: game.day, completed: [...new Set(daily.data.completed.filter(id => contexts.has(id)))], supported: [...new Set(daily.data.supported.filter(id => words.has(id)))] }
      : { day: game.day, completed: [], supported: [...words] },
  };
}
