import { describe, expect, it } from "vitest";
import type { GameState } from "./contracts";
import { freshWords, wordState } from "./recovery";

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
