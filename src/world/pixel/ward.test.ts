import { describe, expect, it } from "vitest";
import ward from "../../pixel/scenes/ward.ts";
import { compileScene, createAtlas, type Actor, type Prop } from "../../pixel/engine/index.ts";
import { scenes } from "../../pixel/scenes/index.ts";
import { sprites } from "../../pixel/registry.ts";
import { TILE } from "../../pixel/kit/index.ts";
import { content } from "../../content";
import { createOpening, NEXT_BED, reduceOpening, type OpeningAction, type OpeningState } from "../../opening";
import { wardFrame, type WardFrame } from "../../opening-view";
import { IN_BED_OFFSET, WARD_FOCUS, WARD_VIEW, wardMark, wardStage, wardZoom, type HasSprite } from "./ward";

/** Today's sprites: no `ward/*` art and no ward cast yet. */
const today: HasSprite = (id) => id in sprites;
/** Every contract id drawn: everything is registered. */
const drawn: HasSprite = () => true;
/** The contract's art without the optional `lie-awake`. */
const noAwake: HasSprite = (id) => !id.includes("/lie-awake-");

const frame = (overrides: Partial<WardFrame> = {}): WardFrame => ({
  elder: "sitting", player: "lying", present: [], table: ["milk", "egg", "bread"], held: null, ...overrides,
});
const prop = (props: readonly Prop[], id: string) => props.find((p) => p.id === id);
const actor = (actors: readonly Actor[], id: string) => actors.find((a) => a.id === id)!;
/** Whether the engine draws an actor as asked, without falling back. */
const resolves = (a: Actor) => {
  const facing = a.facing ?? "down", action = a.action ?? "idle";
  return `${a.sprite}/${action}-${facing}` in sprites || (facing === "left" && `${a.sprite}/${action}-right` in sprites);
};

describe("the ward scene", () => {
  it("is registered and compiles against today's sprites", () => {
    expect(scenes.ward).toBe(ward);
    expect(() => compileScene(ward, createAtlas(sprites))).not.toThrow();
  });

  it("keeps every mark of the contract with the game", () => {
    const names = ["bed/player", "bed/elder", "cabinet", "food/milk", "food/egg", "food/bread", "held", "stand/doctor", "stand/nurse", "stand/aunt", "door", "view"];
    for (const name of names) expect(() => wardMark(name)).not.toThrow();
    for (const id of content.opening.tray) expect(() => wardMark(`food/${id}`)).not.toThrow();
    for (const id of ["doctor", "nurse", "aunt"]) expect(wardMark(`stand/${id}`).facing).toBeDefined();
  });

  it("keeps the camera's view inside the room, at the world panel's 6 : 5", () => {
    const [x, y] = WARD_VIEW.at, [w, h] = WARD_VIEW.size!;
    expect(w / h).toBeCloseTo(6 / 5);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(x + w).toBeLessThanOrEqual(ward.size[0]);
    expect(y + h).toBeLessThanOrEqual(ward.size[1]);
    expect(WARD_FOCUS).toEqual([x + w / 2, y + h / 2]);
  });

  it("frames everything the story needs: the beds, the cabinet's foods, the held food and the visitors", () => {
    const [x, y] = WARD_VIEW.at, [w, h] = WARD_VIEW.size!;
    for (const name of ["bed/player", "bed/elder", "cabinet", "food/milk", "food/egg", "food/bread", "held", "stand/doctor", "stand/nurse", "stand/aunt"]) {
      const [mx, my] = wardMark(name).at;
      expect(mx > x + 0.4 && mx < x + w - 0.4 && my > y + 2 && my <= y + h, name).toBe(true);
    }
  });
});

describe("wardStage with today's sprites", () => {
  it("draws every frame of the scripted opening with registered sprites and no actor fallbacks", () => {
    const run = (state: OpeningState, ...actions: OpeningAction[]) => actions.reduce((next, action) => reduceOpening(next, action, content), state);
    let state = createOpening(content, 42);
    const frames: WardFrame[] = [wardFrame(state, content, null)];
    const give = (food: string) => { state = run(state, { type: "pickup", foodId: food }, { type: "deliver", table: NEXT_BED, now: 1 }); frames.push(wardFrame(state, content, food)); };
    const advance = () => { state = run(state, { type: "advance", now: 1 }); frames.push(wardFrame(state, content, null)); };
    for (let i = 0; i < 6; i++) advance();
    give("bread");
    give("milk");
    advance();
    give("egg");
    for (let i = 0; i < 3; i++) advance();
    expect(frames.length).toBeGreaterThan(10);
    for (const f of frames) {
      const stage = wardStage(f, today);
      for (const p of stage.props) expect(p.sprite in sprites, p.sprite).toBe(true);
      for (const a of stage.actors) expect(resolves(a), `${a.sprite}/${a.action}-${a.facing}`).toBe(true);
      expect(() => compileScene({ ...ward, props: [...(ward.props ?? []), ...stage.props] }, createAtlas(sprites))).not.toThrow();
    }
  });

  it("stands existing characters in for the cast, sitting on benches in the beds, when the ward art is missing", () => {
    const withoutArt: HasSprite = (id) => today(id) && !/^(ward\/|char\/(patient|elder|doctor|nurse|aunt)\/)/.test(id);
    const stage = wardStage(frame({ present: ["doctor", "nurse", "aunt"] }), withoutArt);
    expect(stage.actors.map((a) => a.id)).toEqual(["patient", "elder", "doctor", "nurse", "aunt"]);
    expect(stage.actors.every((a) => !["char/patient", "char/elder", "char/doctor", "char/nurse", "char/aunt"].includes(a.sprite))).toBe(true);
    expect(actor(stage.actors, "patient").action).toBe("sit");
    expect(prop(stage.props, "bed/player")?.sprite).toBe("furn/bench");
    expect(prop(stage.props, "blanket/player")).toBeUndefined();
  });
});

describe("wardStage with the contract's art", () => {
  it("lays the waking player flat, awake, under the lying blanket", () => {
    const stage = wardStage(frame(), drawn);
    const bed = wardMark("bed/player").at;
    const patient = actor(stage.actors, "patient");
    expect(patient).toMatchObject({ sprite: "char/patient", action: "lie-awake", facing: "down", at: bed, offset: IN_BED_OFFSET.lying });
    expect(prop(stage.props, "bed/player")).toMatchObject({ sprite: "ward/bed-player-flat", at: bed });
    expect(prop(stage.props, "blanket/player")).toMatchObject({ sprite: "ward/blanket-player-lying", at: bed });
    expect(actor(wardStage(frame(), noAwake).actors, "patient").action).toBe("lie");
  });

  it("raises the beds of those sitting up, and sorts frame, occupant, blanket, held food in that order", () => {
    const stage = wardStage(frame({ player: "sitting", held: "milk", table: ["egg", "bread"] }), drawn);
    expect(actor(stage.actors, "patient")).toMatchObject({ action: "sit-bed", offset: IN_BED_OFFSET.sitting });
    expect(actor(stage.actors, "elder")).toMatchObject({ sprite: "char/elder", action: "sit-bed" });
    expect(prop(stage.props, "bed/elder")?.sprite).toBe("ward/bed-elder-raised");
    expect(prop(stage.props, "blanket/elder")?.sprite).toBe("ward/blanket-elder-sitting");
    const order = [prop(stage.props, "bed/player")!.sortY!, actor(stage.actors, "patient").sortY!, prop(stage.props, "blanket/player")!.sortY!, prop(stage.props, "held")!.sortY!];
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(new Set(order).size).toBe(4);
    // All within a few art pixels of the bed, so nothing else can slip between them.
    expect(order[3] - order[0]).toBeLessThan(4 / TILE);
  });

  it("puts each visitor present on their mark, facing as it says", () => {
    const stage = wardStage(frame({ present: ["aunt"] }), drawn);
    expect(stage.actors.map((a) => a.id)).toEqual(["patient", "elder", "aunt"]);
    const mark = wardMark("stand/aunt");
    expect(actor(stage.actors, "aunt")).toMatchObject({ sprite: "char/aunt", action: "idle", at: mark.at, facing: mark.facing });
  });
});

describe("foods", () => {
  it("stand on the cabinet's marks, back ones first, sorted with the cabinet", () => {
    const stage = wardStage(frame(), today);
    const foods = stage.props.filter((p) => p.id?.startsWith("food/"));
    expect(foods.map((p) => p.sprite).sort()).toEqual(["food/bread", "food/egg", "food/milk"]);
    for (const p of foods) expect(p.at).toEqual(wardMark(p.id!).at);
    const cabinet = wardMark("cabinet").at[1];
    const byDepth = [...foods].sort((a, b) => a.at[1] - b.at[1]);
    expect(byDepth.map((p) => p.sortY)).toEqual([1, 2, 3].map((n) => cabinet + n / TILE));
  });

  it("leaves the cabinet when held, and is held at the held mark", () => {
    const stage = wardStage(frame({ player: "sitting", table: ["milk", "egg"], held: "bread" }), today);
    expect(stage.props.filter((p) => p.id?.startsWith("food/")).map((p) => p.id)).toEqual(["food/milk", "food/egg"].sort((a, b) => wardMark(a).at[1] - wardMark(b).at[1]));
    expect(prop(stage.props, "held")).toMatchObject({ sprite: "food/bread", at: wardMark("held").at });
    expect(prop(wardStage(frame(), today).props, "held")).toBeUndefined();
  });
});

describe("wardZoom", () => {
  it("is the largest whole zoom that fits the view, never below 1", () => {
    // The opening's world panel at 1440×900 (dpr 1, 6 : 5) and on a 390-wide phone (dpr 3, 3 : 2).
    expect(wardZoom(552, 460, 1)).toBe(2);
    expect(wardZoom(364, 303, 3)).toBe(4);
    expect(wardZoom(364, 243, 3)).toBe(3);
    expect(wardZoom(528, 440, 1)).toBe(2);
    expect(wardZoom(527, 439, 1)).toBe(1);
    expect(wardZoom(100, 80, 1)).toBe(1);
    for (const [w, h, dpr] of [[552, 460, 1], [364, 303, 3], [800, 667, 2]]) {
      const zoom = wardZoom(w, h, dpr);
      expect(Number.isInteger(zoom)).toBe(true);
      expect(WARD_VIEW.size![0] * TILE * zoom).toBeLessThanOrEqual(w * dpr);
      expect(WARD_VIEW.size![1] * TILE * zoom).toBeLessThanOrEqual(h * dpr);
    }
  });
});
