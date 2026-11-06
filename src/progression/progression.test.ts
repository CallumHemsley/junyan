import { describe, expect, it } from "vitest";
import type { GameState } from "../contracts";
import { KITCHEN, TABLES } from "../contracts";
import { content } from "../neighbourhood/registry";
import { createGame, getOrder, orderTotal, reduceGame } from "../game";
import { reduceNeighbourhoodGame, type NeighbourhoodAction } from "../neighbourhood/transitions";
import { validateSavedGame } from "../save";
import { balance, canonicalWords, catalog, chooseOrder, initialProgression, orderTargets, REAL_DAY, recordPractice, validateCatalog } from "./model";
import { availableScenarios, recommendation } from "./scenarios";
import { purchaseFurniture } from "./purchases";
import { createRenderer } from "../scene/renderer.js";
import { captureCanvas, sha256 } from "../scene/scene-frame-hashes.mjs";
import { apartmentScene } from "../features/apartment/scene-data";
import { nextDots } from "../recovery";

function practice(game: GameState, context: string, words: string[], now: number): GameState {
  return { ...game, progression: recordPractice(game, context, words, now) };
}
function act(game: GameState, action: NeighbourhoodAction) { return reduceNeighbourhoodGame(game, action, content); }
function visit(game: GameState, location: "apartment" | "cats" | "repairs" | "garden" | "restaurant") { return act(game, { type: "visit-location", location }); }
function shift(game: GameState, now = 100): GameState {
  game = visit(game, "restaurant");
  for (const { table } of TABLES) {
    const order = getOrder(game, table, content)!;
    game = reduceGame(game, { type: "move", position: { x: table % 2 ? 4.5 : 7.5, y: table < 3 ? 4 : 8 } }, content);
    game = reduceGame(game, { type: "interact", table }, content);
    game = reduceGame(game, { type: "move", position: { x: KITCHEN.x, y: 2.5 } }, content);
    for (const item of order.items) for (let n = 0; n < item.quantity; n++) game = reduceGame(game, { type: "pickup", foodId: item.foodId }, content);
    game = reduceGame(game, { type: "move", position: { x: table % 2 ? 4.5 : 7.5, y: table < 3 ? 4 : 8 } }, content);
    game = reduceGame(game, { type: "deliver", table, now }, content);
    game = reduceGame(game, { type: "pay", table, change: order.paid - orderTotal(order, content) }, content);
  }
  expect(game.ended).toBe(true);
  return game;
}
function lamp(game: GameState, now: number) {
  game = act(game, { type: "follow-scenario", id: "repairs.lamp" });
  for (const action of [{ type: "select", job: "lamp", part: "bulb" }, { type: "turn", job: "lamp", direction: "tighten" }, { type: "test", job: "lamp" }, { type: "return", job: "lamp" }] as const) game = act(game, { type: "feature-action", feature: "repairs", action, now });
  return game;
}

describe("conservative spaced evidence", () => {
  it("requires both real time and a later game day, preserves early due times, and grows in a changed context", () => {
    let game = practice(createGame(content), "restaurant.order-01", ["豆浆"], 100);
    expect(game.progression!.review["豆浆"].successes).toBe(1);
    game = practice(game, "restaurant.order-02", ["豆浆"], 2 * REAL_DAY);
    expect(game.progression!.review["豆浆"].successes).toBe(1);
    game = practice({ ...game, day: 2 }, "restaurant.order-05", ["豆浆"], 100);
    expect(game.progression!.review["豆浆"]).toMatchObject({ successes: 1, dueAt: REAL_DAY + 100 });
    game = practice({ ...game, day: 3 }, "restaurant.order-09", ["豆浆"], REAL_DAY + 100);
    expect(game.progression!.review["豆浆"]).toMatchObject({ successes: 2, interval: 2 });
  });
  it("keeps repeated same-day and same-encounter practice bounded", () => {
    let game = createGame(content);
    game = practice(game, "restaurant.order-01", ["豆浆"], 100);
    const first = game.progression;
    for (let i = 0; i < 100; i++) game = practice(game, "restaurant.order-01", ["豆浆"], REAL_DAY * 20);
    expect(game.progression).toEqual(first);
    game = practice({ ...game, day: 2 }, "restaurant.order-01", ["豆浆"], 2 * REAL_DAY);
    expect(game.progression!.review["豆浆"]).toMatchObject({ encounters: 2, successes: 2, interval: 1 });
  });
  it("records help without penalizing earnings or inferring independent recall", () => {
    let game = createGame(content);
    game = reduceGame(game, { type: "lookup", wordId: "apartment.cat", now: 10 }, content);
    game = practice(game, "cats.reunion", canonicalWords(["cats.cat"], content), 20);
    expect(game.progression!.review["猫"]).toMatchObject({ successes: 0, encounters: 1, interval: 1 });
    expect(game.earnings).toBe(0);
    expect(game.journal["apartment.cat"].recovered).toBe(false);
  });
  it("does not turn wrong-food retries into independent successes", () => {
    let game = createGame(content);
    const order = getOrder(game, 1, content)!;
    game = reduceGame(game, { type: "move", position: { x: 4.5, y: 4 } }, content);
    game = reduceGame(game, { type: "interact", table: 1 }, content);
    game = reduceGame(game, { type: "deliver", table: 1, now: 1 }, content);
    expect(game.mistakes).toBe(1);
    game = shift(game);
    for (const word of orderTargets(order, content)) expect(game.progression!.review[word].successes).toBe(0);
    expect(game.earnings).toBeGreaterThanOrEqual(8);
  });
  it("reanchors a rolled-back clock without crediting it or blocking play", () => {
    let game = practice(createGame(content), "restaurant.order-01", ["豆浆"], 10 * REAL_DAY);
    game = practice({ ...game, day: 2 }, "restaurant.order-05", ["豆浆"], 100);
    expect(game.progression!.review["豆浆"]).toMatchObject({ successes: 1, dueAt: REAL_DAY + 100 });
    game = practice({ ...game, day: 3 }, "restaurant.order-09", ["豆浆"], 2 * REAL_DAY);
    expect(game.progression!.review["豆浆"].successes).toBe(2);
  });
  it("merges reviewed same-sense aliases, separates homographs, and isolates unknown future duplicates", () => {
    expect(canonicalWords(["cats.cat", "apartment.cat"], content)).toEqual(["猫"]);
    expect(canonicalWords(["cats.bench", "apartment.chair"], content)).toEqual(["椅子#bench", "椅子"]);
    expect(canonicalWords(["repairs.replace", "apartment.change"], content)).toEqual(["换#replace", "换#change"]);
    const future = { ...content, neighbourhood: { ...content.neighbourhood!, words: [...content.neighbourhood!.words, { id: "future.cat", hanzi: "猫", pinyin: "māo", gloss: "another sense", audio: "/audio/cat.wav" }] } };
    expect(canonicalWords(["future.cat"], future)).toEqual(["猫#future.cat"]);
  });
});

describe("a director with reachable variety", () => {
  it("has resolvable catalog words and adapters for every declared scenario", () => {
    expect(() => validateCatalog(content)).not.toThrow();
    expect(catalog.scenarios.map(s => s.id).sort()).toEqual(["apartment.place", "cats.rainy", "cats.reunion", "cats.route", "cats.sunny", "garden.observe", "garden.water", "repairs.lamp", "repairs.toy"]);
  });
  it("uses due evidence to select a real authored order, not just record statistics", () => {
    const orders = content.orders.filter(o => o.table === 1);
    const p = initialProgression(4);
    for (const word of new Set(orders.flatMap(o => orderTargets(o, content)))) p.review[word] = { successes: 2, encounters: 2, interval: 7, dueDay: 10, dueAt: 10 * REAL_DAY, lastDay: 3, lastAt: 0, context: "restaurant.order-01" };
    const target = orders.find(o => orderTargets(o, content).some(w => !orderTargets(orders[0], content).includes(w)))!;
    const distinct = orderTargets(target, content).find(w => !orderTargets(orders[0], content).includes(w))!;
    p.review[distinct].dueDay = 4;
    expect(orderTargets(chooseOrder(orders, undefined, p, 4, 0, 0, content), content)).toContain(distinct);
    p.review[distinct].dueDay = 10;
    expect(chooseOrder(orders, undefined, p, 4, 20 * REAL_DAY, 0, content)).toBeDefined();
  });
  it("varies actual saved orders over twelve shifts without invalidating legacy level rules", () => {
    let game = createGame(content);
    const seen = new Set<string>();
    for (let day = 1; day <= 12; day++) {
      const previous = game.customers.map(c => c.orderId);
      game = shift(game, day * REAL_DAY);
      expect(validateSavedGame(game, content)).toEqual(game);
      game = reduceGame(game, { type: "next-day", now: (day + 1) * REAL_DAY }, content);
      expect(validateSavedGame(game, content)).toEqual(game);
      if (day >= 3) for (const [index, customer] of game.customers.entries()) {
        expect(customer.orderId).not.toBe(previous[index]); seen.add(customer.orderId);
      }
    }
    expect(seen.size).toBeGreaterThan(4);
  });
  it("makes a due changed-context invitation actionable and detects exhausted garden/cat routines", () => {
    let game = createGame(content);
    const p = initialProgression(1);
    p.review["水"] = { successes: 1, encounters: 1, interval: 7, dueDay: 8, dueAt: 100, lastDay: 1, lastAt: 0, context: "restaurant.order-01" };
    game.progression = p;
    expect(recommendation(game, REAL_DAY)?.id).toBe("garden.water");
    game = act(game, { type: "follow-scenario", id: "garden.water" });
    expect(game.neighbourhood!.location).toBe("garden");
    expect(nextDots(["milk"], createGame(content), { type: "follow-scenario", id: "garden.water" }, game)).toEqual([]);
    game = act(game, { type: "feature-action", feature: "garden", action: { type: "tidy", value: true }, now: 1 });
    for (const plant of ["flower", "climber", "tree"] as const) game = act(game, { type: "feature-action", feature: "garden", action: { type: "water", plant }, now: 1 });
    expect(availableScenarios(game).map(s => s.id)).not.toContain("garden.water");
    game = visit(game, "cats");
    for (const action of [{ type: "select", target: "white" }, { type: "crouch" }, { type: "wait" }, { type: "approach" }, { type: "follow" }, { type: "reunite" }] as const) game = act(game, { type: "feature-action", feature: "cats", action, now: 1 });
    expect(availableScenarios(game).some(s => s.location === "cats")).toBe(false);
    game = { ...game, day: 2 };
    expect(availableScenarios(game).map(s => s.id)).toContain("cats.rainy");
    game = act(game, { type: "follow-scenario", id: "cats.rainy" });
    for (const action of [{ type: "select", target: "bicycle" }, { type: "select", target: "white" }, { type: "wait" }] as const) game = act(game, { type: "feature-action", feature: "cats", action, now: REAL_DAY * 2 });
    expect(game.progression!.review["猫"]).toMatchObject({ encounters: 2, successes: 0 });
    expect(availableScenarios(game).some(s => s.location === "cats")).toBe(false);
  });
  it("records repeated valid repairs but never pays or grows recall from clicks or resets", () => {
    let game = lamp(createGame(content), 1);
    expect(game.progression!.review["台灯"]).toMatchObject({ encounters: 1, successes: 0 });
    const first = game.progression;
    game = act(game, { type: "feature-action", feature: "repairs", action: { type: "start", job: "lamp" }, now: 1 });
    game = lamp(game, REAL_DAY * 2);
    expect(game.progression).toEqual(first);
    game = lamp({ ...game, day: 2 }, REAL_DAY * 2);
    expect(game.progression!.review["台灯"]).toMatchObject({ encounters: 2, successes: 0 });
    expect(game.earnings).toBe(0);
    expect(game.progression!.spent).toBe(0);
  });
});

describe("purchases and recovery", () => {
  it("affords a visible choice after a shift, debits atomically, and survives placement, undo, reload and tomorrow", () => {
    let game = visit(shift(createGame(content)), "apartment");
    const earned = game.earnings;
    expect(earned).toBeGreaterThanOrEqual(8);
    game = purchaseFurniture(game, "blue-vase");
    expect(balance(game)).toBe(earned - 8);
    expect(game.earnings).toBe(earned);
    expect(purchaseFurniture(game, "blue-vase")).toBe(game);
    const render = () => { const canvas = captureCanvas(); createRenderer(canvas as unknown as HTMLCanvasElement, apartmentScene()).draw(game.neighbourhood!.apartment); return sha256(canvas.frame); };
    const before = render();
    game = act(game, { type: "feature-action", feature: "apartment", action: { type: "select", id: "blue-vase" }, now: 2 });
    game = act(game, { type: "feature-action", feature: "apartment", action: { type: "place", x: 3, y: 1 }, now: 2 });
    expect(render()).not.toBe(before);
    expect(validateSavedGame(game, content)).toEqual(game);
    game = act(game, { type: "feature-action", feature: "apartment", action: { type: "undo" }, now: 3 });
    expect(game.neighbourhood!.apartment.owned).toContain("blue-vase");
    expect(balance(game)).toBe(earned - 8);
    game = reduceGame(visit(game, "restaurant"), { type: "next-day", now: REAL_DAY }, content);
    expect(balance(validateSavedGame(game, content)!)).toBe(earned - 8);
  });
  it("rejects insufficient, unknown, duplicate, and remote purchases", () => {
    const game = visit(createGame(content), "apartment");
    expect(purchaseFurniture(game, "blue-vase")).toBe(game);
    expect(purchaseFurniture(game, "fake")).toBe(game);
    const rich = shift(createGame(content));
    expect(purchaseFurniture(rich, "blue-vase")).toBe(rich);
    expect(purchaseFurniture(visit(rich, "apartment"), "small-lamp").progression?.purchases ?? []).not.toContain("small-lamp");
  });
  it("preserves old finds and gifts and restores paid ownership after apartment corruption", () => {
    let game = visit(shift(createGame(content)), "apartment");
    game = act(game, { type: "feature-action", feature: "apartment", action: { type: "claim-gift" }, now: 1 });
    game = purchaseFurniture(game, "blue-vase");
    expect(game.neighbourhood!.apartment.owned).toContain("vase");
    expect(game.neighbourhood!.apartment.owned).toContain("blue-vase");
    const corrupted = structuredClone(game) as unknown as { neighbourhood: { apartment: unknown } };
    corrupted.neighbourhood.apartment = { bad: true };
    const restored = validateSavedGame(corrupted, content)!;
    expect(restored.neighbourhood!.apartment.owned).toContain("blue-vase");
    expect(balance(restored)).toBe(balance(game));
    expect(validateSavedGame(restored, content)).toEqual(restored);
  });
  it("keeps valid finances when review data is damaged and rejects invalid accounting", () => {
    const game = purchaseFurniture(visit(shift(createGame(content)), "apartment"), "blue-vase");
    const damaged = { ...game, progression: { ...game.progression!, review: { "豆浆": { successes: -1 } } } };
    expect(validateSavedGame(damaged, content)!.progression).toMatchObject({ spent: 8, purchases: ["blue-vase"], review: {} });
    expect(validateSavedGame({ ...game, progression: { ...game.progression, spent: 0 } }, content)!.progression!.spent).toBe(8);
    for (const spent of [-1, Infinity, NaN, game.earnings + 1]) expect(validateSavedGame({ ...game, progression: { ...game.progression, spent } }, content)).toBeNull();
    const legacy = createGame(content);
    expect(validateSavedGame(legacy, content)).toEqual(legacy);
  });
  it("cannot farm review or money by visiting, recolouring, rearranging, or buying", () => {
    let game = visit(shift(createGame(content)), "apartment");
    game = act(game, { type: "feature-action", feature: "apartment", action: { type: "accept-starter" }, now: 1 });
    const before = game.progression;
    for (const colour of ["cream", "blue", "cream"] as const) game = act(game, { type: "feature-action", feature: "apartment", action: { type: "choose-colour", colour }, now: 1 });
    expect(game.progression).toEqual(before);
    game = purchaseFurniture(game, "blue-vase");
    expect(game.progression!.review).toEqual(before!.review);
    expect(game.earnings).toBe(10);
  });
});
