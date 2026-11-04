import { describe, expect, it } from "vitest";
import { KITCHEN, TABLES, TRAY_CAPACITY } from "./contracts";
import type { Action, Content, GameState, Order, Word } from "./contracts";
import {
  canVisitKitchen,
  createGame,
  getOrder,
  isNear,
  orderTotal,
  recoverWords,
  reduceGame,
} from "./game";

const word: Word = {
  id: "bun",
  hanzi: "包子",
  pinyin: "bāozi",
  gloss: "bun",
  audio: "/bun.wav",
};
const line = { id: "line", tokens: [word], audio: "/line.wav" };
const content: Content = {
  help: {welcome: line, lookup: line, pace: line, steps: [
    {id: "order", line}, {id: "kitchen", line}, {id: "deliver", line},
  ]},
  characters: [],
  foods: [
    { id: "bun", word, price: 2, kind: "bun" },
    {
      id: "milk",
      word: { ...word, id: "milk", hanzi: "豆浆" },
      price: 3,
      kind: "milk",
    },
  ],
  orders: [1, 2, 3].flatMap((level) =>
    TABLES.flatMap(({ table }) =>
      [0, 1].map((variant) => ({
        id: `${level}-${table}-${variant}`,
        level,
        table,
        customer: `regular-${table}`,
        line,
        items:
          level === 1
            ? [{ foodId: variant ? "milk" : "bun", quantity: 1 }]
            : level === 2
              ? [{ foodId: "bun", quantity: 2 + variant }]
              : [
                  { foodId: "bun", quantity: 2 },
                  { foodId: "milk", quantity: 1 + variant },
                ],
        paid: 20,
      })),
    ),
  ),
  thanks: {
    ...line,
    id: "thanks",
    tokens: [{ ...word, id: "thanks", hanzi: "多谢" }],
  },
  retry: {
    ...line,
    id: "retry",
    tokens: [{ ...word, id: "retry", hanzi: "再试试" }],
  },
  opening: { cast: [], tray: [], steps: [] },
};

function act(state: GameState, action: Action): GameState {
  return reduceGame(state, action, content);
}
function visit(state: GameState, table: number): GameState {
  const position = TABLES.find((entry) => entry.table === table)!;
  return act(state, {
    type: "move",
    position: { x: position.x, y: position.y + 1.3 },
  });
}
function takeOrder(state: GameState, table = 1): GameState {
  return act(visit(state, table), { type: "interact", table });
}
function loadOrder(state: GameState, table: number): GameState {
  state = act(state, { type: "move", position: KITCHEN });
  for (const item of getOrder(state, table, content)!.items) {
    for (let count = 0; count < item.quantity; count++)
      state = act(state, { type: "pickup", foodId: item.foodId });
  }
  return state;
}
function checkout(state: GameState, table = 1): GameState {
  return act(visit(loadOrder(takeOrder(state, table), table), table), {
    type: "deliver",
    table,
    now: 1,
  });
}
function serve(state: GameState, table: number): GameState {
  state = checkout(state, table);
  const order = getOrder(state, table, content)!;
  return act(state, {
    type: "pay",
    table,
    change: order.paid - orderTotal(order, content),
  });
}
function finishDay(state: GameState): GameState {
  return TABLES.reduce((current, { table }) => serve(current, table), state);
}

function freeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
freeze(content);

describe("waiter journey", () => {
  it("collects orders, delivers, pays four regulars, and closes the day", () => {
    let state = createGame(content, 42);
    expect(state.customers).toHaveLength(4);
    expect(state.customers.map((entry) => entry.table)).toEqual([1, 2, 3, 4]);
    let earnings = 0;
    for (const { table } of TABLES) {
      state = takeOrder(state, table);
      expect(state.activeTable).toBe(table);
      expect(
        state.customers.find((entry) => entry.table === table)?.phase,
      ).toBe("ordered");
      const order = getOrder(state, table, content)!;
      state = loadOrder(state, table);
      state = act(visit(state, table), { type: "deliver", table, now: 1 });
      expect(state.tray).toEqual([]);
      expect(
        state.customers.find((entry) => entry.table === table)?.phase,
      ).toBe("checkout");
      const total = orderTotal(order, content);
      const change = order.paid - total;
      state = act(state, { type: "pay", table, change });
      earnings += total;
      expect(state.receipt).toEqual({ table, total, change });
      expect(state.feedback).toBe("thanks");
      expect(state.earnings).toBe(earnings);
      expect(state.served).toBe(table);
      expect(state.ended).toBe(table === 4);
      expect(act(state, { type: "pay", table, change })).toBe(state);
    }
    expect(state.customers.every((entry) => entry.phase === "served")).toBe(
      true,
    );
    expect(act(state, { type: "move", position: KITCHEN })).toBe(state);
  });

  it("keeps wrong-food and wrong-change attempts retryable", () => {
    let state = takeOrder(createGame(content));
    const order = getOrder(state, 1, content)!;
    const wrong = order.items[0].foodId === "bun" ? "milk" : "bun";
    state = act(state, { type: "move", position: KITCHEN });
    state = act(state, { type: "pickup", foodId: wrong });
    state = act(visit(state, 1), { type: "deliver", table: 1, now: 1 });
    expect(state.feedback).toBe("wrong-food");
    expect(state.tray).toEqual([wrong]);
    expect(state.customers[0].phase).toBe("ordered");
    state = act(state, { type: "move", position: KITCHEN });
    state = act(state, { type: "return-food", index: 0 });
    state = act(visit(loadOrder(state, 1), 1), { type: "deliver", table: 1, now: 1 });
    state = act(state, { type: "pay", table: 1, change: 0 });
    expect(state.feedback).toBe("wrong-change");
    expect(state.customers[0].phase).toBe("checkout");
    expect(state.earnings).toBe(0);
    expect(state.receipt).toBeNull();
    state = act(state, {
      type: "pay",
      table: 1,
      change: order.paid - orderTotal(order, content),
    });
    expect(state.feedback).toBe("thanks");
    expect(state.mistakes).toBe(2);
  });

  it("requires the entire tray to match, independent of item order", () => {
    let state = act(
      finishDay(act(finishDay(createGame(content)), { type: "next-day" })),
      { type: "next-day" },
    );
    state = takeOrder(state);
    const order = getOrder(state, 1, content)!;
    const tray = order.items.flatMap((item) =>
      Array<string>(item.quantity).fill(item.foodId),
    );
    for (const invalid of [
      [],
      tray.slice(1),
      [...tray, "bun"],
      tray.map(() => "milk"),
    ]) {
      const wrong = act(
        { ...state, tray: invalid },
        { type: "deliver", table: 1, now: 1 },
      );
      expect(wrong.feedback).toBe("wrong-food");
      expect(wrong.customers[0].phase).toBe("ordered");
    }
    expect(
      act({ ...state, tray: tray.reverse() }, { type: "deliver", table: 1, now: 1 })
        .customers[0].phase,
    ).toBe("checkout");
  });
});

describe("movement and action guards", () => {
  it("uses the inclusive 1.8-unit Euclidean interaction radius", () => {
    expect(isNear({ x: 0, y: 0 }, { x: 1.8, y: 0 })).toBe(true);
    expect(isNear({ x: 0, y: 0 }, { x: 1.81, y: 0 })).toBe(false);
    expect(isNear({ x: 0, y: 0 }, { x: 1.3, y: 1.3 })).toBe(false);
    expect(isNear({ x: NaN, y: 0 }, KITCHEN)).toBe(false);
  });

  it.each([
    { x: -1, y: 2 },
    { x: 13, y: 2 },
    { x: 2, y: -1 },
    { x: 2, y: 11 },
    { x: NaN, y: 1 },
    { x: 1, y: Infinity },
  ])("rejects invalid move %o", (position) => {
    const state = createGame(content);
    expect(act(state, { type: "move", position })).toBe(state);
  });

  it("accepts world edges and does not retain the action position reference", () => {
    const position = { x: 12, y: 10 };
    const state = act(createGame(content), { type: "move", position });
    position.x = 99;
    expect(state.player).toEqual({ x: 12, y: 10 });
    expect(
      act(state, { type: "move", position: { x: 0, y: 0 } }).player,
    ).toEqual({ x: 0, y: 0 });
  });

  it("ignores early, far away, unavailable and unknown-table actions", () => {
    const initial = createGame(content);
    for (const action of [
      { type: "interact", table: 1 },
      { type: "interact", table: 99 },
      { type: "deliver", table: 1, now: 1 },
      { type: "pay", table: 1, change: 18 },
      { type: "pickup", foodId: "bun" },
      { type: "next-day" },
    ] satisfies Action[])
      expect(act(initial, action)).toBe(initial);
    const ordered = takeOrder(initial);
    expect(act(ordered, { type: "pickup", foodId: "bun" })).toBe(ordered);
    expect(act(ordered, { type: "pay", table: 1, change: 18 })).toBe(ordered);
    const reselected = act(
      { ...ordered, activeTable: null },
      { type: "interact", table: 1 },
    );
    expect(reselected.activeTable).toBe(1);
    expect(reselected.customers[0].phase).toBe("ordered");
    const loaded = loadOrder(ordered, 1);
    expect(act(loaded, { type: "deliver", table: 1, now: 1 })).toBe(loaded);
    expect(act(loaded, { type: "pickup", foodId: "missing" })).toBe(loaded);
    expect(
      act(visit(loaded, 1), { type: "return-food", index: 0 }).tray,
    ).toEqual(loaded.tray);
    const bill = checkout(initial);
    const farBill = act(bill, { type: "move", position: KITCHEN });
    expect(act(farBill, { type: "pay", table: 1, change: 18 })).toBe(farBill);
    expect(act(farBill, { type: "pickup", foodId: "bun" })).toBe(farBill);
    expect(act(bill, { type: "deliver", table: 1, now: 1 })).toBe(bill);
    expect(act(bill, { type: "interact", table: 1 }).customers[0].phase).toBe(
      "checkout",
    );
  });

  it("caps the tray at six and permits returning food at the kitchen", () => {
    let state = act(takeOrder(createGame(content)), {
      type: "move",
      position: KITCHEN,
    });
    expect(canVisitKitchen(state)).toBe(true);
    for (let i = 0; i < TRAY_CAPACITY; i++)
      state = act(state, { type: "pickup", foodId: "bun" });
    state = act(state, { type: "pickup", foodId: "milk" });
    expect(state.tray).toHaveLength(6);
    expect(state.feedback).toBe("full");
    for (const index of [-1, 6, 1.5, NaN])
      expect(act(state, { type: "return-food", index })).toBe(state);
    state = act(state, { type: "return-food", index: 2 });
    expect(state.tray).toHaveLength(5);
    expect(state.feedback).toBe("none");
    expect(act(state, { type: "pickup", foodId: "milk" }).tray.at(-1)).toBe(
      "milk",
    );
    expect(canVisitKitchen({ ...state, ended: true })).toBe(false);
  });

  it.each([NaN, Infinity, -1])("ignores invalid change %s", (change) => {
    const state = checkout(createGame(content));
    expect(act(state, { type: "pay", table: 1, change })).toBe(state);
  });
});

describe("determinism, journal and content safety", () => {
  it("replays identically, chooses alternatives by seed, and caps daily levels at three", () => {
    let state = createGame(content, 42);
    let replay = createGame(content, 42);
    expect(createGame(content, NaN)).toEqual(state);
    const selections = Array.from({ length: 12 }, (_, seed) =>
      createGame(content, seed)
        .customers.map((entry) => entry.orderId)
        .join(","),
    );
    expect(new Set(selections).size).toBeGreaterThan(1);
    for (let day = 1; day <= 5; day++) {
      expect(state).toEqual(replay);
      expect(state.day).toBe(day);
      expect(state.level).toBe(Math.min(day, 3));
      expect(
        state.customers.every(
          (entry) =>
            getOrder(state, entry.table, content)?.level === state.level,
        ),
      ).toBe(true);
      const completed = finishDay(state);
      state = act(completed, { type: "next-day" });
      replay = act(finishDay(replay), { type: "next-day" });
      expect(state.earnings).toBe(completed.earnings);
      expect(state.served).toBe(0);
      expect(state.tray).toEqual([]);
      expect(state.receipt).toBeNull();
      expect(state.ended).toBe(false);
      expect(state.activeTable).toBeNull();
      expect(state.customers.every((entry) => entry.phase === "seated")).toBe(
        true,
      );
    }
  });

  it("journals words that appear only in character greetings and reactions", () => {
    const withCharacters: Content = {...content, characters: [{
      id: "teacher", name: "张老师", voiceId: "uncle-fu", personality: "Patient teacher",
      appearance: {shirt: [193,158,85], hair: [190,188,177], accessory: "glasses"},
      greeting: {...line, tokens: [{...word, id: "greeting-only"}]},
      thanks: {...line, tokens: [{...word, id: "thanks-only"}]},
      retry: {...line, tokens: [{...word, id: "retry-only"}]},
    }]};
    let state = createGame(withCharacters, 42);
    for (const wordId of ["greeting-only", "thanks-only", "retry-only"]) {
      state = reduceGame(state, {type: "lookup", wordId, now: 123}, withCharacters);
      expect(state.journal[wordId]).toEqual({lookups: 1, lastSeen: 123, recovered: false});
      state = reduceGame(state, {type: "lookup", wordId, now: 456}, withCharacters);
      expect(state.journal[wordId]).toEqual({lookups: 2, lastSeen: 456, recovered: false});
    }
    const finished = finishDay(state);
    const nextDay = reduceGame(finished, {type: "next-day"}, withCharacters);
    expect(nextDay.day).toBe(state.day + 1);
    expect(nextDay.journal).toEqual(finished.journal);
  });

  it("records only known words using injected timestamps and keeps the journal across days", () => {
    let state = freeze(createGame(content));
    for (const action of [
      { type: "lookup", wordId: "unknown", now: 100 },
      { type: "lookup", wordId: "bun", now: NaN },
      { type: "lookup", wordId: "bun", now: -1 },
    ] satisfies Action[])
      expect(act(state, action)).toBe(state);
    state = act(state, { type: "lookup", wordId: "bun", now: 100 });
    state = act(freeze(state), { type: "lookup", wordId: "bun", now: 123 });
    state = act(state, { type: "lookup", wordId: "thanks", now: 124 });
    expect(state.journal.bun).toEqual({
      lookups: 2,
      lastSeen: 123,
      recovered: false,
    });
    expect(state.journal.thanks.lookups).toBe(1);
    const completed = freeze(finishDay(state));
    const next = act(completed, { type: "next-day" });
    expect(next.journal).toEqual(completed.journal);
    expect(
      act(completed, { type: "lookup", wordId: "retry", now: 125 }).journal
        .retry.lookups,
    ).toBe(1);
  });

  it("lookup keeps a recovered word recovered and counts the lookup", () => {
    const state = freeze({
      ...createGame(content),
      journal: { bun: { lookups: 0, lastSeen: 5, recovered: true } },
    });
    expect(
      act(state, { type: "lookup", wordId: "bun", now: 9 }).journal.bun,
    ).toEqual({ lookups: 1, lastSeen: 9, recovered: true });
  });

  it("a lookup alone never recovers a word", () => {
    let state = createGame(content);
    for (let now = 1; now <= 10; now++)
      state = act(state, { type: "lookup", wordId: "bun", now });
    expect(state.journal.bun).toEqual({
      lookups: 10,
      lastSeen: 10,
      recovered: false,
    });
  });

  it("recoverWords marks words recovered without touching lookups", () => {
    const journal = freeze({
      bun: { lookups: 3, lastSeen: 7, recovered: false },
      milk: { lookups: 1, lastSeen: 2, recovered: true },
    });
    const next = recoverWords(journal, ["bun", "egg", "milk"], 20);
    expect(next).toEqual({
      bun: { lookups: 3, lastSeen: 7, recovered: true },
      egg: { lookups: 0, lastSeen: 20, recovered: true },
      milk: { lookups: 1, lastSeen: 2, recovered: true },
    });
    expect(next.milk).toBe(journal.milk);
    expect(journal.bun.recovered).toBe(false);
    expect(journal).not.toHaveProperty("egg");
    expect(recoverWords(next, ["bun", "egg", "milk"], 30)).toBe(next);
    expect(recoverWords(journal, [], 30)).toBe(journal);
  });

  it("recoverWords ignores a time that is not finite and non-negative", () => {
    const journal = freeze({});
    for (const now of [NaN, Infinity, -1])
      expect(recoverWords(journal, ["egg"], now)).toBe(journal);
  });

  it("does not mutate frozen state or content through an entire day", () => {
    let state = freeze(createGame(content));
    for (const { table } of TABLES) state = freeze(serve(state, table));
    expect(state.ended).toBe(true);
    expect(content.orders[0].items).toEqual([{ foodId: "bun", quantity: 1 }]);
  });

  it("handles missing orders and rejects unplayable content explicitly", () => {
    const state = createGame(content);
    expect(getOrder(state, 99, content)).toBeUndefined();
    expect(getOrder(state, 1, { ...content, orders: [] })).toBeUndefined();
    expect(() => createGame({ ...content, orders: [] })).toThrow(
      "No playable level 1 order for table 1",
    );
    const invalidItems = [
      [],
      [{ foodId: "missing", quantity: 1 }],
      [{ foodId: "bun", quantity: -1 }],
      [{ foodId: "bun", quantity: 1.5 }],
      [{ foodId: "bun", quantity: 7 }],
    ];
    for (const items of invalidItems) {
      const broken = {
        ...content,
        orders: content.orders.map((order) => ({ ...order, items })),
      };
      expect(() => createGame(broken)).toThrow("No playable");
    }
    for (const paid of [NaN, Infinity, -1, 0]) {
      expect(() =>
        createGame({
          ...content,
          orders: content.orders.map((order) => ({ ...order, paid })),
        }),
      ).toThrow("No playable");
    }
    const missing = { ...content, orders: [] };
    const ordered = takeOrder(state);
    expect(reduceGame(ordered, { type: "deliver", table: 1, now: 1 }, missing)).toBe(
      ordered,
    );
    const bill = checkout(state);
    expect(
      reduceGame(bill, { type: "pay", table: 1, change: 18 }, missing),
    ).toBe(bill);
  });

  it("calculates quantities and repeated food entries without accepting invalid totals", () => {
    const order: Order = {
      ...content.orders[0],
      items: [
        { foodId: "bun", quantity: 2 },
        { foodId: "bun", quantity: 1 },
        { foodId: "milk", quantity: 1 },
      ],
    };
    expect(orderTotal(order, content)).toBe(9);
    for (const price of [-1, NaN, Infinity]) {
      expect(
        orderTotal(order, {
          ...content,
          foods: content.foods.map((food) => ({ ...food, price })),
        }),
      ).toBeNaN();
    }
    const state = takeOrder(createGame(content));
    const duplicate = {
      ...content,
      orders: content.orders.map((entry) =>
        entry.id === state.customers[0].orderId
          ? { ...entry, items: order.items }
          : entry,
      ),
    };
    expect(
      reduceGame(
        { ...state, tray: ["milk", "bun", "bun", "bun"] },
        { type: "deliver", table: 1, now: 1 },
        duplicate,
      ).customers[0].phase,
    ).toBe("checkout");
  });
});

describe("recovery in the restaurant", () => {
  const soy = { ...word, id: "soy", hanzi: "豆浆" };
  const spoken = { ...line, tokens: [word, soy, word] };
  const twoWords: Content = {
    ...content,
    orders: content.orders.map((order) => ({ ...order, line: spoken })),
  };
  const play = (state: GameState, action: Action) =>
    reduceGame(state, action, twoWords);
  function ordered(journal: GameState["journal"] = {}) {
    const state = { ...createGame(twoWords), journal };
    const table = TABLES.find((entry) => entry.table === 1)!;
    const near = play(state, {
      type: "move",
      position: { x: table.x, y: table.y + 1.3 },
    });
    return play(play(near, { type: "interact", table: 1 }), {
      type: "move",
      position: KITCHEN,
    });
  }
  function deliver(state: GameState) {
    const table = TABLES.find((entry) => entry.table === 1)!;
    const near = play(state, {
      type: "move",
      position: { x: table.x, y: table.y + 1.3 },
    });
    return play(near, { type: "deliver", table: 1, now: 40 });
  }

  it("a correct deliver recovers every word of the order line and keeps lookups", () => {
    let state = ordered({ bun: { lookups: 2, lastSeen: 5, recovered: false } });
    for (const item of getOrder(state, 1, twoWords)!.items)
      for (let count = 0; count < item.quantity; count++)
        state = play(state, { type: "pickup", foodId: item.foodId });
    state = deliver(state);
    expect(state.customers[0].phase).toBe("checkout");
    expect(state.journal).toEqual({
      bun: { lookups: 2, lastSeen: 5, recovered: true },
      soy: { lookups: 0, lastSeen: 40, recovered: true },
    });
  });

  it("a deliver with an invalid time changes nothing", () => {
    let state = ordered();
    for (const item of getOrder(state, 1, twoWords)!.items)
      for (let count = 0; count < item.quantity; count++)
        state = play(state, { type: "pickup", foodId: item.foodId });
    const table = TABLES.find((entry) => entry.table === 1)!;
    const near = play(state, { type: "move", position: { x: table.x, y: table.y + 1.3 } });
    for (const now of [Number.NaN, -1, Number.POSITIVE_INFINITY])
      expect(play(near, { type: "deliver", table: 1, now })).toBe(near);
  });

  it("a wrong-food deliver recovers nothing", () => {
    let state = ordered({ bun: { lookups: 1, lastSeen: 5, recovered: false } });
    const order = getOrder(state, 1, twoWords)!;
    state = play(state, {
      type: "pickup",
      foodId: order.items[0].foodId === "bun" ? "milk" : "bun",
    });
    const before = state.journal;
    state = deliver(state);
    expect(state.feedback).toBe("wrong-food");
    expect(state.journal).toBe(before);
  });

  it("a lookup on an unrecovered word counts it and leaves it unrecovered", () => {
    const state = play(ordered(), { type: "lookup", wordId: "soy", now: 7 });
    expect(state.journal.soy).toEqual({ lookups: 1, lastSeen: 7, recovered: false });
  });
});
