import { describe, expect, it } from "vitest";
import type { GameState } from "./contracts";
import { freshWords, nextDots, wordState } from "./recovery";

const seen = (recovered: boolean, lookups = 0) => ({ lookups, lastSeen: 1, recovered });

describe("wordState", () => {
  it("fogs a word with no journal entry", () => {
    expect(wordState(undefined, false)).toBe("fogged");
    expect(wordState(undefined, true)).toBe("fogged");
  });

  it("fogs a word that was only looked up", () => {
    expect(wordState(seen(false, 3), false)).toBe("fogged");
    expect(wordState(seen(false, 3), true)).toBe("fogged");
  });

  it("dots a word recovered by the latest deliver", () => {
    expect(wordState(seen(true), true)).toBe("dot");
  });

  it("shows an earlier recovered word plain", () => {
    expect(wordState(seen(true, 2), false)).toBe("plain");
  });
});

describe("freshWords", () => {
  const day1: GameState["journal"] = { bun: seen(false, 1) };
  const firstDeliver = { ...day1, bun: seen(true, 1), soy: seen(true) };
  const secondDeliver = { ...firstDeliver, egg: seen(true) };

  it("returns the words whose recovery flipped on each deliver", () => {
    expect(freshWords(day1, firstDeliver)).toEqual(["bun", "soy"]);
    expect(freshWords(firstDeliver, secondDeliver)).toEqual(["egg"]);
  });

  it("returns nothing for a lookup or a day boundary", () => {
    const lookedUp = { ...secondDeliver, tea: seen(false, 1) };
    expect(freshWords(secondDeliver, lookedUp)).toEqual([]);
    expect(freshWords(lookedUp, lookedUp)).toEqual([]);
  });
});

describe("nextDots", () => {
  const state = (
    phase: GameState["customers"][number]["phase"],
    journal: GameState["journal"],
  ) => ({ customers: [{ table: 1, phase }], journal }) as unknown as GameState;
  const deliver = { type: "deliver", table: 1, now: 2 } as const;
  const known = { bun: seen(true) };
  const withSoy = { ...known, soy: seen(true) };

  it("dots the words a correct serve recovers", () => {
    expect(nextDots([], state("ordered", known), deliver, state("checkout", withSoy))).toEqual(["soy"]);
  });

  it("clears the dots on the next correct serve, even one with no new words", () => {
    const before = state("ordered", withSoy);
    expect(nextDots(["soy"], before, deliver, state("checkout", withSoy))).toEqual([]);
  });

  it("keeps the dots through a wrong serve, a lookup and a pay", () => {
    const before = state("ordered", withSoy);
    const wrong = { ...before, mistakes: 1 } as GameState;
    expect(nextDots(["soy"], before, deliver, wrong)).toEqual(["soy"]);
    const looked = state("ordered", { ...withSoy, tea: seen(false, 1) });
    expect(nextDots(["soy"], before, { type: "lookup", wordId: "tea", now: 3 }, looked)).toEqual(["soy"]);
    const paid = state("served", withSoy);
    expect(nextDots(["soy"], state("checkout", withSoy), { type: "pay", table: 1, change: 0 }, paid)).toEqual(["soy"]);
  });

  it("clears the dots on a new day", () => {
    const ended = state("served", withSoy);
    expect(nextDots(["soy"], ended, { type: "next-day" }, state("ordered", withSoy))).toEqual([]);
  });

  it("keeps the dots when the action changes nothing", () => {
    const same = state("ordered", withSoy);
    expect(nextDots(["soy"], same, { type: "next-day" }, same)).toEqual(["soy"]);
  });
});
