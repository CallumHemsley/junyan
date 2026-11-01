import { describe, expect, it } from "vitest";
import { content } from "./content";
import { KITCHEN, TABLES, type Action, type Content, type GameState } from "./contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "./game";
import { validateSavedGame } from "./save";

function serve(state: GameState, table: number, apply: (action: Action) => void) {
  const position = TABLES.find((entry) => entry.table === table)!;
  const order = getOrder(state, table, content)!;
  apply({ type: "move", position: { x: position.x, y: position.y - 1.5 } });
  apply({ type: "interact", table });
  apply({ type: "move", position: KITCHEN });
  for (const item of order.items) {
    for (let count = 0; count < item.quantity; count++) apply({ type: "pickup", foodId: item.foodId });
  }
  apply({ type: "move", position: { x: position.x, y: position.y - 1.5 } });
  apply({ type: "deliver", table });
  apply({ type: "pay", table, change: order.paid - orderTotal(order, content) + 1 });
  apply({ type: "pay", table, change: order.paid - orderTotal(order, content) });
}

describe("saved-state domain validation", () => {
  it.each([0, 42, 123456, 0xffffffff])("accepts every reducer state across five days, seed %s", (seed) => {
    let state = createGame(content, seed);
    const apply = (action: Action) => {
      state = reduceGame(state, action, content);
      expect(validateSavedGame(structuredClone(state), content)).toEqual(state);
    };
    expect(validateSavedGame(state, content)).toEqual(state);
    for (let day = 1; day <= 5; day++) {
      apply({ type: "lookup", wordId: content.foods[0].word.id, now: 1234.5 });
      for (const { table } of TABLES) serve(state, table, apply);
      expect(state.ended).toBe(true);
      apply({ type: "lookup", wordId: content.foods[0].word.id, now: 5678 });
      apply({ type: "next-day" });
    }
    expect(state.day).toBe(6);
    expect(state.journal[content.foods[0].word.id].lookups).toBe(10);
  });

  it("accepts stale receipts, changed active tables, full trays and wrong answers", () => {
    let state = createGame(content);
    const apply = (action: Action) => {
      state = reduceGame(state, action, content);
      expect(validateSavedGame(state, content)).toEqual(state);
    };
    for (const table of [1, 2]) {
      const position = TABLES[table - 1];
      apply({ type: "move", position: { x: position.x, y: position.y - 1.5 } });
      apply({ type: "interact", table });
    }
    serve(state, 1, apply);
    apply({ type: "move", position: { x: 9, y: 2.5 } });
    apply({ type: "deliver", table: 2 });
    expect(state.activeTable).toBe(2);
    expect(state.receipt?.table).toBe(1);
    apply({ type: "move", position: KITCHEN });
    for (let count = 0; count < 7; count++) apply({ type: "pickup", foodId: content.foods[0].id });
    expect(state.feedback).toBe("full");
    apply({ type: "return-food", index: 0 });
    apply({ type: "return-food", index: 0 });
    apply({ type: "move", position: { x: 9, y: 2.5 } });
    apply({ type: "interact", table: 2 });
    apply({ type: "deliver", table: 2 });
    expect(state.feedback).toBe("wrong-food");
  });

  it("retains old journal word IDs and non-integer finite timestamps", () => {
    const state = createGame(content);
    state.journal["retired-word"] = { lookups: 2, lastSeen: 1.5 };
    expect(validateSavedGame(state, content)).toEqual(state);
  });

  const corruptions: [string, (state: GameState) => void][] = [
    ["duplicate tables", (state) => { state.customers[1].table = 1; }],
    ["missing table", (state) => { state.customers.pop(); }],
    ["unknown order", (state) => { state.customers[0].orderId = "missing"; }],
    ["another table's order", (state) => { state.customers[0].orderId = state.customers[1].orderId; }],
    ["another level's order", (state) => { state.customers[0].orderId = content.orders.find((order) => order.table === 1 && order.level === 2)!.id; }],
    ["served count without phases", (state) => { state.served = 4; }],
    ["served phase without count", (state) => { state.customers[0].phase = "served"; }],
    ["premature end", (state) => { state.ended = true; }],
    ["incoherent day level", (state) => { state.day = 2; }],
    ["unknown tray food", (state) => { state.tray = ["missing"]; }],
    ["unknown active table", (state) => { state.activeTable = 5; }],
    ["fractional active table", (state) => { state.activeTable = 1.5; }],
    ["seated active table", (state) => { state.activeTable = 1; }],
    ["unserved receipt", (state) => { state.receipt = { table: 1, total: 0, change: 0 }; }],
    ["blocked player", (state) => { state.player = { x: 3, y: 4 }; }],
    ["negative timestamp", (state) => { state.journal.word = { lookups: 1, lastSeen: -1 }; }],
    ["unsafe counter", (state) => { state.mistakes = Number.MAX_SAFE_INTEGER + 1; }],
    ["negative seed", (state) => { state.seed = -1; }],
    ["out-of-range seed", (state) => { state.seed = 0x100000000; }],
    ["unearned first-day earnings", (state) => { state.earnings = 1; }],
  ];
  it.each(corruptions)("rejects %s", (_, corrupt) => {
    const state = createGame(content);
    corrupt(state);
    expect(validateSavedGame(state, content)).toBeNull();
  });

  it("rejects a completed day without ended and incorrect receipt amounts", () => {
    let state = createGame(content);
    const apply = (action: Action) => { state = reduceGame(state, action, content); };
    for (const { table } of TABLES) serve(state, table, apply);
    expect(validateSavedGame({ ...state, ended: false }, content)).toBeNull();
    expect(validateSavedGame({ ...state, receipt: { ...state.receipt!, total: 0 } }, content)).toBeNull();
    expect(validateSavedGame({ ...state, receipt: { ...state.receipt!, change: -1 } }, content)).toBeNull();
    expect(validateSavedGame({ ...state, earnings: 0 }, content)).toBeNull();
  });

  it.each([NaN, Infinity, -Infinity])("rejects non-finite numbers (%s)", (invalid) => {
    const state = createGame(content);
    for (const field of ["seed", "day", "level", "served", "earnings", "mistakes", "activeTable"]) {
      expect(validateSavedGame({ ...state, [field]: invalid }, content)).toBeNull();
    }
    expect(validateSavedGame({ ...state, player: { x: invalid, y: 2 } }, content)).toBeNull();
    expect(validateSavedGame({ ...state, journal: { word: { lookups: invalid, lastSeen: 0 } } }, content)).toBeNull();
    expect(validateSavedGame({ ...state, journal: { word: { lookups: 1, lastSeen: invalid } } }, content)).toBeNull();
  });

  it("rejects orders made unplayable by current content", () => {
    const state = createGame(content);
    for (const alter of [
      (altered: Content) => { altered.foods = []; },
      (altered: Content) => { altered.characters = []; },
      (altered: Content) => { altered.orders[0].paid = 0; },
      (altered: Content) => { altered.orders[0].items[0].quantity = 7; },
    ]) {
      const altered = structuredClone(content);
      state.customers[0].orderId = altered.orders[0].id;
      alter(altered);
      expect(validateSavedGame(state, altered)).toBeNull();
    }
  });
});
