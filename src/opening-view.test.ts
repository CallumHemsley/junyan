import { describe, expect, it } from "vitest";
import { content } from "./content";
import { createOpening, NEXT_BED, reduceOpening, type OpeningAction, type OpeningState } from "./opening";
import { tokenLook, wardFrame } from "./opening-view";
import { WARD_STEPS } from "./scene/ward-steps.js";

const frames = Object.fromEntries(WARD_STEPS);
const run = (state: OpeningState, ...actions: OpeningAction[]) =>
  actions.reduce((next, action) => reduceOpening(next, action, content), state);
const advance: OpeningAction = { type: "advance", now: 1 };
const give = (foodId: string): OpeningAction[] => [
  { type: "pickup", foodId },
  { type: "deliver", table: NEXT_BED, now: 1 },
];

describe("wardFrame", () => {
  it("stages the scripted run as the ward's step frames", () => {
    let state = createOpening(content, 42);
    const seen: [string, ReturnType<typeof wardFrame>][] = [];
    const look = (name: string, offered: string | null = null) => seen.push([name, wardFrame(state, content, offered)]);
    look("wake");
    for (const name of ["premise-2", "premise-3", "premise-4", "doctor-zh", "nurse-reply", "ask-milk"]) {
      state = run(state, advance);
      look(name);
    }
    state = run(state, ...give("bread"));
    look("wrong-bread", "bread");
    state = run(state, ...give("milk"));
    look("hand-milk", "milk");
    state = run(state, advance);
    look("ask-egg");
    state = run(state, ...give("egg"));
    look("hand-egg", "egg");
    state = run(state, advance);
    look("aunt-arrives");
    state = run(state, advance);
    look("aunt-asks");
    state = run(state, advance, { type: "reply", option: 0 });
    look("reply");
    state = run(state, advance);
    look("end");
    expect(Object.fromEntries(seen)).toEqual(frames);
  });
});

describe("tokenLook", () => {
  it("fogs a word until it is recovered, dots it for two steps, then shows it plain", () => {
    let state = run(createOpening(content, 42), advance, advance, advance, advance, advance, advance);
    expect(tokenLook(state, "milk")).toBe("fogged");
    state = run(state, ...give("milk"));
    expect(tokenLook(state, "milk")).toBe("dot");
    state = run(state, advance);
    expect(tokenLook(state, "milk")).toBe("dot");
    state = run(state, ...give("egg"), advance);
    expect(tokenLook(state, "milk")).toBe("plain");
    expect(tokenLook(state, "egg")).toBe("dot");
    expect(tokenLook(state, "person")).toBe("fogged");
  });
});
