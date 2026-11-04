import { describe, expect, it } from "vitest";
import { content } from "./content";
import { createGame, reduceGame } from "./game";
import { validateSavedGame } from "./save";
import { startSession } from "./startup";

const empty = { checkpoint: null, saved: null, failed: false };
const dayOne = createGame(content, 42);
const later = reduceGame(dayOne, { type: "lookup", wordId: "milk", now: 1 }, content);

describe("startSession", () => {
  it("plays the opening on readable, empty storage", () => {
    const { session, saveError } = startSession(empty, content, 42);
    expect(session.phase).toBe("opening");
    expect(saveError).toBe(false);
  });

  it("plays the opening over an invalid save", () => {
    const saved = validateSavedGame({ ...dayOne, day: -1 }, content);
    expect(startSession({ ...empty, saved }, content, 7)).toMatchObject({
      session: { phase: "opening", opening: { seed: 7, step: 0 } },
      saveError: false,
    });
  });

  it("resumes a valid checkpoint before the saved game", () => {
    expect(startSession({ checkpoint: later, saved: dayOne, failed: false }, content, 42)).toEqual({
      session: { phase: "day", game: later },
      saveError: false,
    });
  });

  it("resumes a valid v1 save", () => {
    expect(startSession({ ...empty, saved: later }, content, 42)).toEqual({
      session: { phase: "day", game: later },
      saveError: false,
    });
  });

  it("starts a fresh day 1 with the save error when the read failed or timed out", () => {
    expect(startSession({ ...empty, failed: true }, content, 42)).toEqual({
      session: { phase: "day", game: dayOne },
      saveError: true,
    });
  });

  it("keeps a checkpoint when a store failed and still reports the error", () => {
    expect(startSession({ checkpoint: later, saved: null, failed: true }, content, 42)).toEqual({
      session: { phase: "day", game: later },
      saveError: true,
    });
  });

  it("lands on day 1 when the opening is skipped", () => {
    expect(startSession(empty, content, 42, true)).toEqual({
      session: { phase: "day", game: dayOne },
      saveError: false,
    });
  });
});
