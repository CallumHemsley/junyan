import { createNeighbourhood } from "./neighbourhood/model";
import { afterEach, describe, expect, it, vi } from "vitest";
import { content } from "./content";
import { KITCHEN, TABLES, type Action, type Content, type GameState } from "./contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "./game";
import { checkpointKey, loadGame, saveGame, validateSavedGame } from "./save";
import { wordState } from "./recovery";
import { reduceNeighbourhoodGame } from "./neighbourhood/transitions";
import { purchaseFurniture } from "./progression/purchases";

type LegacyJournal = Record<string, { lookups: number; lastSeen: number; recovered?: unknown }>;

function storageBoundary(value: unknown = createGame(content)) {
  const error = new DOMException("Storage unavailable", "UnknownError");
  const request = {
    result: value,
    error,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null,
  };
  const get = vi.fn(() => request);
  const put = vi.fn(() => request);
  const transaction = {
    error,
    oncomplete: null as (() => void) | null,
    onerror: null as (() => void) | null,
    onabort: null as (() => void) | null,
    objectStore: () => ({ get, put }),
  };
  const db = { transaction: () => transaction, close: vi.fn() };
  const open = {
    result: db,
    error,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null,
    onblocked: null as (() => void) | null,
  };
  vi.stubGlobal("indexedDB", { open: () => open });
  const connect = async () => {
    open.onsuccess?.();
    await Promise.resolve();
  };
  return { request, transaction, db, open, error, connect, get, put };
}

describe("IndexedDB recovery", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(["zh-CN", "fr-FR"])("keeps purchased furniture and review evidence in the %s save slot", async languageId => {
    let state = createGame(content);
    for (const { table } of TABLES) serve(state, table, action => { state = reduceGame(state, action, content); });
    state = reduceNeighbourhoodGame(state, { type: "visit-location", location: "apartment" }, content);
    state = purchaseFurniture(state, "blue-vase");
    expect(state.progression).toMatchObject({ spent: 8, purchases: ["blue-vase"] });
    expect(Object.keys(state.progression!.review).length).toBeGreaterThan(0);
    const storage = storageBoundary(state);
    const saving = saveGame(state, languageId);
    await storage.connect();
    expect(storage.put).toHaveBeenCalledWith(state, languageId === "zh-CN" ? "v1" : "v1:fr-FR");
    storage.transaction.oncomplete?.(); await saving;
    const loading = loadGame({ ...content, language: languageId });
    await storage.connect(); storage.transaction.oncomplete?.();
    expect(await loading).toEqual(state);
  });

  it.each([
    [undefined, "v1", "junyan-waiter-pending-v1"],
    ["zh-CN", "v1", "junyan-waiter-pending-v1"],
    ["fr-FR", "v1:fr-FR", "junyan-waiter-pending-v1:fr-FR"],
  ])("keeps %s progress in its own save and recovery slots", async (languageId, key, pendingKey) => {
    const state = createGame(content);
    const storage = storageBoundary(state);
    const saving = saveGame(state, languageId);
    await storage.connect();
    expect(storage.put).toHaveBeenCalledWith(state, key);
    storage.transaction.oncomplete?.();
    await saving;
    const loading = loadGame({ ...content, language: languageId });
    await storage.connect();
    expect(storage.get).toHaveBeenCalledWith(key);
    storage.transaction.oncomplete?.();
    expect(await loading).toEqual(state);
    expect(checkpointKey(languageId)).toBe(pendingKey);
  });

  it.each([loadGame, () => saveGame(createGame(content))])("reports database open failure", async (operation) => {
    const storage = storageBoundary();
    const pending = operation(content);
    const rejected = expect(pending).rejects.toBe(storage.error);
    storage.open.onerror?.();
    await rejected;
  });

  it.each([loadGame, () => saveGame(createGame(content))])("reports a blocked open and releases a late connection", async (operation) => {
    const storage = storageBoundary();
    const pending = operation(content);
    const rejected = expect(pending).rejects.toBeInstanceOf(DOMException);
    storage.open.onblocked?.();
    await rejected;
    await storage.connect();
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it("does not restore a read from an aborted transaction", async () => {
    const storage = storageBoundary();
    const pending = loadGame(content);
    const rejected = expect(pending).rejects.toBe(storage.error);
    await storage.connect();
    storage.request.onsuccess?.();
    storage.transaction.onabort?.();
    await rejected;
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it("reports an aborted read even without a request error", async () => {
    const storage = storageBoundary();
    const pending = loadGame(content);
    const rejected = expect(pending).rejects.toBe(storage.error);
    await storage.connect();
    storage.transaction.onabort?.();
    await rejected;
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it.each(["onerror", "onabort"] as const)("reports write %s without claiming progress was saved", async (event) => {
    const storage = storageBoundary();
    const pending = saveGame(createGame(content));
    const rejected = expect(pending).rejects.toBe(storage.error);
    await storage.connect();
    storage.transaction[event]?.();
    await rejected;
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it("reports a failed read and releases its connection", async () => {
    const storage = storageBoundary();
    const pending = loadGame(content);
    const rejected = expect(pending).rejects.toBe(storage.error);
    await storage.connect();
    storage.request.onerror?.();
    await rejected;
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it.each([null, {}, { ...createGame(content), ended: true }])("returns no saved game for missing or corrupt data: %j", async (value) => {
    const storage = storageBoundary(value);
    const pending = loadGame(content);
    await storage.connect();
    storage.request.onsuccess?.();
    storage.transaction.oncomplete?.();
    expect(await pending).toBeNull();
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it.each([loadGame, () => saveGame(createGame(content))])("reports missing object stores and releases the connection", async (operation) => {
    const storage = storageBoundary();
    storage.db.transaction = () => { throw new DOMException("Missing store", "NotFoundError"); };
    const pending = operation(content);
    const rejected = expect(pending).rejects.toMatchObject({ name: "NotFoundError" });
    await storage.connect();
    await rejected;
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it("confirms a write only after its transaction completes", async () => {
    const storage = storageBoundary();
    let saved = false;
    const pending = saveGame(createGame(content)).then(() => { saved = true; });
    await storage.connect();
    storage.request.onsuccess?.();
    await Promise.resolve();
    expect(saved).toBe(false);
    storage.transaction.oncomplete?.();
    await pending;
    expect(saved).toBe(true);
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it("returns the committed read with its journal and stale receipt intact", async () => {
    let state = createGame(content);
    const apply = (action: Action) => { state = reduceGame(state, action, content); };
    serve(state, 1, apply);
    apply({ type: "move", position: KITCHEN });
    const journal: LegacyJournal = { ...state.journal, "retired-word": { lookups: 3, lastSeen: 1.5 } };
    const storage = storageBoundary({ ...state, journal });
    const pending = loadGame(content);
    await storage.connect();
    storage.request.onsuccess?.();
    storage.transaction.oncomplete?.();
    expect(await pending).toMatchObject({
      ...state,
      journal: { ...state.journal, "retired-word": { lookups: 3, lastSeen: 1.5, recovered: true } },
    });
    expect(storage.db.close).toHaveBeenCalledOnce();
  });

  it("restores the v1 progress format from product baseline 5dfad15", async () => {
    const historical = {
      seed: 955863294, day: 1, level: 1,
      player: { x: 3, y: 2.5 },
      customers: [
        { table: 1, orderId: "order-01", phase: "served" },
        { table: 2, orderId: "order-02", phase: "seated" },
        { table: 3, orderId: "order-03", phase: "seated" },
        { table: 4, orderId: "order-04", phase: "seated" },
      ],
      tray: [], served: 1, earnings: 2, mistakes: 0,
      activeTable: 1, feedback: "thanks",
      receipt: { table: 1, total: 2, change: 3 },
      journal: { bun: { lookups: 2, lastSeen: 1.5 } }, ended: false,
    };
    const storage = storageBoundary(historical);
    const pending = loadGame(content);
    await storage.connect();
    storage.request.onsuccess?.();
    storage.transaction.oncomplete?.();
    expect(await pending).toMatchObject({
      ...historical,
      neighbourhood: createNeighbourhood(historical.day),
      journal: { bun: { lookups: 2, lastSeen: 1.5, recovered: true } },
    });
  });
});

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
  apply({ type: "deliver", table, now: 1 });
  apply({ type: "pay", table, change: order.paid - orderTotal(order, content) + 1 });
  apply({ type: "pay", table, change: order.paid - orderTotal(order, content) });
}

describe("saved-state domain validation", () => {
  it.each([0, 42, 123456, 0xffffffff])("accepts every reducer state across five days, seed %s", (seed) => {
    let state = createGame(content, seed);
    const apply = (action: Action) => {
      state = reduceGame(state, action, content);
      expect(validateSavedGame(structuredClone(state), content)).toMatchObject(state);
    };
    expect(validateSavedGame(state, content)).toMatchObject(state);
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
      expect(validateSavedGame(state, content)).toMatchObject(state);
    };
    for (const table of [1, 2]) {
      const position = TABLES[table - 1];
      apply({ type: "move", position: { x: position.x, y: position.y - 1.5 } });
      apply({ type: "interact", table });
    }
    serve(state, 1, apply);
    apply({ type: "move", position: { x: 9, y: 2.5 } });
    apply({ type: "deliver", table: 2, now: 1 });
    expect(state.activeTable).toBe(2);
    expect(state.receipt?.table).toBe(1);
    apply({ type: "move", position: KITCHEN });
    for (let count = 0; count < 7; count++) apply({ type: "pickup", foodId: content.foods[0].id });
    expect(state.feedback).toBe("full");
    apply({ type: "return-food", index: 0 });
    apply({ type: "return-food", index: 0 });
    apply({ type: "move", position: { x: 9, y: 2.5 } });
    apply({ type: "interact", table: 2 });
    apply({ type: "deliver", table: 2, now: 1 });
    expect(state.feedback).toBe("wrong-food");
  });

  it("retains old journal word IDs and non-integer finite timestamps", () => {
    const state = createGame(content);
    const journal: LegacyJournal = {
      "retired-word": { lookups: 2, lastSeen: 1.5 },
      "looked-up": { lookups: 0, lastSeen: 0, recovered: false },
    };
    expect(validateSavedGame({ ...state, journal }, content)).toMatchObject({
      ...state,
      journal: {
        "retired-word": { lookups: 2, lastSeen: 1.5, recovered: true },
        "looked-up": { lookups: 0, lastSeen: 0, recovered: false },
      },
    });
  });

  it("treats a journal word saved without a recovery flag as recovered", () => {
    const state = createGame(content);
    const journal: LegacyJournal = {
      legacy: { lookups: 4, lastSeen: 2 },
      unrecovered: { lookups: 1, lastSeen: 3, recovered: false },
    };
    expect(validateSavedGame({ ...state, journal }, content)?.journal).toEqual({
      legacy: { lookups: 4, lastSeen: 2, recovered: true },
      unrecovered: { lookups: 1, lastSeen: 3, recovered: false },
    });
  });

  it("renders every word of a legacy journal plain", () => {
    const journal: LegacyJournal = {
      bun: { lookups: 2, lastSeen: 1.5 },
      thanks: { lookups: 0, lastSeen: 3 },
    };
    const loaded = validateSavedGame({ ...createGame(content), journal }, content)!;
    expect(
      Object.keys(journal).map((id) => wordState(loaded.journal[id], false)),
    ).toEqual(["plain", "plain"]);
  });

  it("retains an earlier receipt while another customer rejects the change", () => {
    let state = createGame(content);
    const apply = (action: Action) => { state = reduceGame(state, action, content); };
    serve(state, 2, (action) => {
      if (action.type !== "pay") apply(action);
    });
    serve(state, 1, apply);
    apply({ type: "move", position: { x: 9, y: 2.5 } });
    const order = getOrder(state, 2, content)!;
    apply({ type: "pay", table: 2, change: order.paid - orderTotal(order, content) + 1 });
    expect(state.feedback).toBe("wrong-change");
    expect(state.activeTable).toBe(2);
    expect(state.receipt?.table).toBe(1);
    expect(validateSavedGame(state, content)).toMatchObject(state);
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
    ["negative timestamp", (state) => { state.journal.word = { lookups: 1, lastSeen: -1, recovered: false }; }],
    ["non-boolean recovered flag", (state) => { (state.journal as LegacyJournal).word = { lookups: 1, lastSeen: 0, recovered: "yes" }; }],
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
    expect(validateSavedGame({ ...state, journal: { word: { lookups: invalid, lastSeen: 0, recovered: true } } }, content)).toBeNull();
    expect(validateSavedGame({ ...state, journal: { word: { lookups: 1, lastSeen: invalid, recovered: true } } }, content)).toBeNull();
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
