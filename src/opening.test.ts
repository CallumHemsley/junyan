import { afterEach, describe, expect, it, vi } from "vitest";
import { content } from "./content";
import { KITCHEN, TABLES } from "./contracts";
import type { Action, GameState } from "./contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "./game";
import {
  NEXT_BED,
  createOpening,
  createSession,
  handoffJournal,
  reduceOpening,
  reduceSession,
} from "./opening";
import type { OpeningAction, OpeningState, Session, SessionAction } from "./opening";

const steps = content.opening.steps;
const END_NOW = 5000;

function indexOf(predicate: (step: (typeof steps)[number]) => boolean): number {
  const index = steps.findIndex(predicate);
  if (index === -1) throw new Error("step not found");
  return index;
}

const milkStep = indexOf((step) => step.type === "request" && step.want === "milk");
const replyStep = indexOf((step) => step.type === "reply");

function optionFor(wordId: string): number {
  const step = steps[replyStep];
  if (step.type !== "reply") throw new Error("not a reply step");
  return step.options.findIndex((option) => option.word.id === wordId);
}

function settle(index: number, replyWord: string): OpeningAction[] {
  const step = steps[index];
  switch (step.type) {
    case "say-en":
    case "say":
      return [{ type: "advance", now: 100 + index }];
    case "request":
      return [
        { type: "pickup", foodId: step.want },
        { type: "deliver", table: NEXT_BED },
        { type: "advance", now: 100 + index },
      ];
    case "reply":
      return [
        { type: "reply", option: optionFor(replyWord) },
        { type: "advance", now: 100 + index },
      ];
    case "end":
      return [{ type: "advance", now: END_NOW }];
  }
}

function script(replyWord = "good"): OpeningAction[] {
  return steps.flatMap((_, index) => settle(index, replyWord));
}

function replay(
  actions: SessionAction[],
  session: Session = createSession(content, 42, "opening"),
): Session {
  return actions.reduce((current, action) => reduceSession(current, action, content), session);
}

function openingAt(index: number, replyWord = "good"): OpeningState {
  let state = createOpening(content, 42);
  for (let step = 0; step < index; step++)
    for (const action of settle(step, replyWord)) state = reduceOpening(state, action, content);
  expect(state.step).toBe(index);
  return state;
}

function completedDay(): Action[] {
  const actions: Action[] = [];
  let state = createGame(content);
  const push = (action: Action) => {
    actions.push(action);
    state = reduceGame(state, action, content);
  };
  push({ type: "lookup", wordId: content.foods[0].word.id, now: 1234 });
  for (const position of TABLES) {
    const table = position.table;
    const order = getOrder(state, table, content)!;
    push({ type: "move", position: { x: position.x, y: position.y - 1.5 } });
    push({ type: "interact", table });
    push({ type: "move", position: KITCHEN });
    for (const item of order.items)
      for (let count = 0; count < item.quantity; count++) push({ type: "pickup", foodId: item.foodId });
    push({ type: "move", position: { x: position.x, y: position.y - 1.5 } });
    push({ type: "deliver", table });
    push({ type: "pay", table, change: order.paid - orderTotal(order, content) });
  }
  expect(state.ended).toBe(true);
  return actions;
}

function freeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function expectDay(session: Session): GameState {
  if (session.phase !== "day") throw new Error(`still in the opening at step ${session.opening.step}`);
  return session.game;
}

function expectOpening(session: Session): OpeningState {
  if (session.phase !== "opening") throw new Error("already in the day");
  return session.opening;
}

afterEach(() => vi.restoreAllMocks());

describe("opening rules", () => {
  it("starts a session in the opening or straight in the day", () => {
    expect(createSession(content, 42, "opening")).toEqual({
      phase: "opening",
      opening: { seed: 42, step: 0, tray: [], feedback: "none", reply: null, recovered: {}, journal: {} },
    });
    expect(createSession(content, 7, "day")).toEqual({ phase: "day", game: createGame(content, 7) });
    expect(createOpening(content, NaN).seed).toBe(42);
    expect(createOpening(content, -1).seed).toBe(-1 >>> 0);
  });

  it("walks the variant A script in content order and hands off to day 1", () => {
    let session = createSession(content, 42, "opening");
    const visited: number[] = [];
    for (const action of script()) {
      const opening = expectOpening(session);
      if (visited.at(-1) !== opening.step) visited.push(opening.step);
      session = reduceSession(session, action, content);
    }
    expect(visited).toEqual(steps.map((_, index) => index));
    const game = expectDay(session);
    expect(game.day).toBe(1);
    expect(game.ended).toBe(false);
  });

  it("a wrong item gets wrong-food feedback, keeps the step and recovers nothing", () => {
    const before = openingAt(milkStep);
    let state = reduceOpening(before, { type: "pickup", foodId: "bread" }, content);
    expect(state.tray).toEqual(["bread"]);
    state = reduceOpening(state, { type: "deliver", table: NEXT_BED }, content);
    expect(state).toEqual({ ...before, feedback: "wrong-food" });
    expect(reduceOpening(state, { type: "advance", now: 1 }, content)).toBe(state);
    state = reduceOpening(state, { type: "pickup", foodId: "milk" }, content);
    expect(state.feedback).toBe("none");
    state = reduceOpening(state, { type: "deliver", table: NEXT_BED }, content);
    expect(state.feedback).toBe("thanks");
    expect(state.tray).toEqual([]);
    expect(state.recovered).toEqual({ ...before.recovered, milk: milkStep });
    state = reduceOpening(state, { type: "advance", now: 1 }, content);
    expect(state).toMatchObject({ step: milkStep + 1, feedback: "none", tray: [] });
  });

  it("recovers each step's list at that step's index", () => {
    let state = createOpening(content, 42);
    const expected: Record<string, number> = {};
    for (let index = 0; index < steps.length - 1; index++) {
      for (const action of settle(index, "good")) state = reduceOpening(state, action, content);
      const step = steps[index];
      const list =
        step.type === "say" || step.type === "request"
          ? step.recover
          : step.type === "reply"
            ? step.options[optionFor("good")].recover
            : [];
      for (const id of list) expected[id] ??= index;
      expect(state.recovered).toEqual(expected);
    }
    expect(Object.keys(expected).sort()).toEqual(["egg", "good", "milk", "thank-you"]);
  });

  it("the 好 and 谢谢 replies take their own branch", () => {
    const before = openingAt(replyStep);
    const good = reduceOpening(before, { type: "reply", option: optionFor("good") }, content);
    expect(good.reply).toBe(optionFor("good"));
    expect(good.recovered).toEqual({ ...before.recovered, good: replyStep });
    const thanks = reduceOpening(before, { type: "reply", option: optionFor("thank-you") }, content);
    expect(thanks.reply).toBe(optionFor("thank-you"));
    expect(thanks.recovered).toBe(before.recovered);
    expect(reduceOpening(good, { type: "reply", option: optionFor("thank-you") }, content)).toBe(good);
    expect(reduceOpening(thanks, { type: "reply", option: optionFor("good") }, content)).toBe(thanks);
    for (const option of [-1, 2, 0.5, NaN])
      expect(reduceOpening(before, { type: "reply", option }, content)).toBe(before);

    const thanksDay = expectDay(replay(script("thank-you")));
    expect(thanksDay.journal).not.toHaveProperty("good");
    for (const id of ["milk", "egg", "thank-you"]) expect(thanksDay.journal[id].recovered).toBe(true);
  });

  it("advance waits for an unsettled request or reply, and illegal actions are no-ops", () => {
    const request = openingAt(milkStep);
    expect(reduceOpening(request, { type: "advance", now: 1 }, content)).toBe(request);
    const holding = reduceOpening(request, { type: "pickup", foodId: "milk" }, content);
    expect(reduceOpening(holding, { type: "advance", now: 1 }, content)).toBe(holding);
    expect(reduceOpening(holding, { type: "pickup", foodId: "egg" }, content)).toBe(holding);
    expect(reduceOpening(holding, { type: "deliver", table: NEXT_BED + 1 }, content)).toBe(holding);
    expect(reduceOpening(holding, { type: "return-food", index: 1 }, content)).toBe(holding);
    expect(reduceOpening(holding, { type: "return-food", index: 0 }, content)).toEqual(request);
    expect(reduceOpening(request, { type: "pickup", foodId: "porridge" }, content)).toBe(request);
    expect(reduceOpening(request, { type: "pickup", foodId: "nope" }, content)).toBe(request);
    expect(reduceOpening(request, { type: "deliver", table: NEXT_BED }, content)).toBe(request);
    expect(reduceOpening(request, { type: "reply", option: 0 }, content)).toBe(request);
    const settled = reduceOpening(holding, { type: "deliver", table: NEXT_BED }, content);
    expect(reduceOpening(settled, { type: "pickup", foodId: "egg" }, content)).toBe(settled);

    const reply = openingAt(replyStep);
    expect(reduceOpening(reply, { type: "advance", now: 1 }, content)).toBe(reply);

    const start = createOpening(content, 42);
    expect(reduceOpening(start, { type: "pickup", foodId: "milk" }, content)).toBe(start);
    expect(reduceOpening(start, { type: "deliver", table: NEXT_BED }, content)).toBe(start);
    expect(reduceOpening(start, { type: "reply", option: 0 }, content)).toBe(start);
    for (const now of [NaN, -1, Infinity])
      expect(reduceOpening(start, { type: "advance", now }, content)).toBe(start);

    const session: Session = { phase: "opening", opening: start };
    for (const action of [
      { type: "move", position: { x: 1, y: 1 } },
      { type: "interact", table: 1 },
      { type: "pay", table: 1, change: 0 },
      { type: "next-day" },
    ] satisfies Action[])
      expect(reduceSession(session, action, content)).toBe(session);

    const atEnd = replay(script().slice(0, -1));
    expect(expectOpening(atEnd).step).toBe(steps.length - 1);
    for (const now of [NaN, -1])
      expect(reduceSession(atEnd, { type: "advance", now }, content)).toBe(atEnd);
    const day = replay(script());
    expect(reduceSession(day, { type: "advance", now: 1 }, content)).toBe(day);
  });

  it("the handoff equals createGame plus the recovered journal", () => {
    const actions: OpeningAction[] = [{ type: "lookup", wordId: "milk", now: 10 }, ...script()];
    const atEnd = expectOpening(replay(actions.slice(0, -1)));
    const game = expectDay(replay(actions));
    const journal = handoffJournal(atEnd, END_NOW);
    expect(game).toEqual({ ...createGame(content, 42), journal });
    expect(Object.keys(journal).sort()).toEqual(["egg", "good", "milk", "thank-you"]);
    for (const entry of Object.values(journal)) expect(entry.recovered).toBe(true);
    expect(journal.milk).toEqual({ lookups: 1, lastSeen: 10, recovered: true });
    expect(journal.egg).toEqual({ lookups: 0, lastSeen: END_NOW, recovered: true });
  });

  it("a lookup in the opening counts but does not recover", () => {
    const say = steps.find((step) => step.type === "say");
    if (say?.type !== "say") throw new Error("no say step");
    const fogged = say.line.tokens.find((token) => !["milk", "egg", "thank-you", "good"].includes(token.id))!;
    let session = createSession(content, 42, "opening");
    session = reduceSession(session, { type: "lookup", wordId: fogged.id, now: 1 }, content);
    session = reduceSession(session, { type: "lookup", wordId: fogged.id, now: 2 }, content);
    const opening = expectOpening(session);
    expect(opening.journal[fogged.id]).toEqual({ lookups: 2, lastSeen: 2, recovered: false });
    expect(opening.recovered).toEqual({});
    expect(reduceSession(session, { type: "lookup", wordId: "unknown", now: 3 }, content)).toBe(session);
    expect(reduceSession(session, { type: "lookup", wordId: fogged.id, now: NaN }, content)).toBe(session);
    const game = expectDay(replay(script(), session));
    expect(game.journal[fogged.id]).toEqual({ lookups: 2, lastSeen: 2, recovered: false });
  });

  it("replays deterministically from the injected seed and time", () => {
    vi.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("Date.now called");
    });
    vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random called");
    });
    const first = expectDay(replay(script()));
    const second = expectDay(replay(script()));
    expect(second).toEqual(first);
    const seven = expectDay(replay(script(), createSession(content, 7, "opening")));
    const fresh = createGame(content, 7);
    expect(seven).toEqual({ ...first, seed: fresh.seed, customers: fresh.customers });
  });

  it("does not mutate frozen session or content", () => {
    const frozen = freeze(structuredClone(content));
    let session: Session = freeze(createSession(frozen, 42, "opening"));
    for (const action of [{ type: "lookup", wordId: "milk", now: 1 } as const, ...script()])
      session = freeze(reduceSession(session, action, frozen));
    expectDay(session);
    for (const action of completedDay()) session = freeze(reduceSession(session, action, frozen));
    expect(expectDay(session).ended).toBe(true);
  });

  it("a day session routes to reduceGame unchanged", () => {
    const actions = completedDay();
    let session: Session = createSession(content, 42, "day");
    let game = createGame(content, 42);
    for (const action of actions) {
      session = reduceSession(session, action, content);
      game = reduceGame(game, action, content);
    }
    expect(expectDay(session)).toEqual(game);
    expect(reduceSession(session, { type: "advance", now: 1 }, content)).toBe(session);
    expect(reduceSession(session, { type: "reply", option: 0 }, content)).toBe(session);
  });
});
