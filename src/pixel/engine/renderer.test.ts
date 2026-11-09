import { describe, expect, it, vi } from "vitest";
import { hash, PALETTE, type Color } from "../kit/index.ts";
import exemplar from "../sprites/exemplar/exemplar.ts";
import demo from "../scenes/demo.ts";
import { createAtlas } from "./atlas.ts";
import { createFrame, hashFrame } from "./frame.ts";
import { createSceneRenderer, renderToFrame } from "./renderer.ts";
import { compileScene, defineScene } from "./scene.ts";
import { testSprites } from "./test-sprites.ts";
import type { Actor, FrameState, Prop, Scene } from "./types.ts";

const atlas = createAtlas(testSprites);
const rgb = (c: Color) => [parseInt(PALETTE[c].slice(1, 3), 16), parseInt(PALETTE[c].slice(3, 5), 16), parseInt(PALETTE[c].slice(5, 7), 16)];
const at = (frame: { w: number; data: Uint8ClampedArray }, x: number, y: number) => Array.from(frame.data.subarray((y * frame.w + x) * 4, (y * frame.w + x) * 4 + 3));

const room = (extra: Partial<Scene> = {}): Scene => defineScene({
  id: "test", size: [4, 4], background: "ink",
  layers: [{ rows: ["aaaa", "aaaa", "aaaa", "aaaa"], legend: { a: "t/floor-a" } }],
  ...extra,
});
/** Midday has an ambient of exactly 1, so with no lights pixels are the art's own colours. */
const draw = (scene: Scene, state: Partial<FrameState> = {}) =>
  renderToFrame(createSceneRenderer(scene, atlas), { x: 0, y: 0, w: scene.size[0] * 16, h: scene.size[1] * 16 }, { time: 0, phase: "midday", ...state });

describe("draw order", () => {
  it("draws the more southern object over the northern one", () => {
    const north: Prop = { sprite: "t/red", at: [1, 1] }, south: Prop = { sprite: "t/blue", at: [1.25, 1.125] };
    expect(at(draw(room({ props: [south, north] })), 17, 12)).toEqual(rgb("blue3"));
    expect(at(draw(room({ props: [{ ...south, at: [1.25, 0.875] }, north] })), 17, 12)).toEqual(rgb("red3"));
  });

  it("keeps scene order on ties, and draws actors after props on ties", () => {
    const a: Prop = { sprite: "t/red", at: [1, 1] }, b: Prop = { sprite: "t/blue", at: [1, 1] };
    expect(at(draw(room({ props: [a, b] })), 16, 12)).toEqual(rgb("blue3"));
    expect(at(draw(room({ props: [b, a] })), 16, 12)).toEqual(rgb("red3"));
    const actor: Actor = { id: "w", sprite: "ex/waiter", at: [1, 1 + 15 / 16] };
    // The waiter's anchor row is 31 of 32, so its feet at y=31px sort after a prop at y=16px.
    expect(at(draw(room({ props: [a] }), { actors: [actor] }), 16, 12)).toEqual(rgb("jade4"));
  });

  it("puts floor props under objects and over props above actors", () => {
    const scene = room({ props: [{ sprite: "t/lamp", at: [1, 0.75] }, { sprite: "t/rug", at: [0.5, 1] }] });
    const frame = draw(scene, { actors: [{ id: "w", sprite: "ex/waiter", at: [1, 2.5] }] });
    expect(at(frame, 16, 10)).toEqual(rgb("gold4"));
    expect(at(frame, 1, 10)).toEqual(rgb("red3"));
  });

  it("honours sortY for things that sit on other things", () => {
    const table: Prop = { sprite: "t/red", at: [1, 1] }, bowl: Prop = { sprite: "t/blue", at: [1, 0.9], sortY: 1.01 };
    expect(at(draw(room({ props: [bowl, table] })), 16, 12)).toEqual(rgb("blue3"));
  });

  it("draws run-time props like scene props", () => {
    const frame = draw(room(), { props: [{ sprite: "t/red", at: [1, 1] }] });
    expect(at(frame, 16, 12)).toEqual(rgb("red3"));
  });

  it("mirrors flipped props around their anchor", () => {
    const frame = draw(room({ props: [{ sprite: "t/half", at: [1, 1], flipX: true }] }));
    // Anchor x=1 of 4 mirrors to 3: drawn columns 0..1 become 2..3, so x=16+0..1 is solid.
    expect(at(frame, 16, 15)).toEqual(rgb("ink"));
    expect(at(frame, 14, 15)).toEqual(rgb("oak4"));
  });
});

describe("contact shadows", () => {
  const floor = rgb("oak4"), plum = rgb("plum1");
  const toward = (pixel: number[], amount: number) => pixel.map((c, i) => Math.round(c + (plum[i] - c) * amount));

  it("centres a stepped plum ellipse on the anchor", () => {
    const frame = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }));
    const core = at(frame, 32, 32), rim = at(frame, 35, 32);
    expect(core).toEqual(toward(floor, 82 / 255));
    expect(rim).toEqual(toward(floor, 44 / 255));
    expect(at(frame, 36, 32)).toEqual(floor);
    expect(at(frame, 28, 32)).toEqual(rim);
    expect(at(frame, 32, 34)).toEqual(floor);
  });

  it("merges overlapping shadows instead of stacking them", () => {
    const one = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }));
    const two = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }, { sprite: "t/shadowed", at: [2, 2] }] }));
    expect(hashFrame(two)).toBe(hashFrame(one));
  });

  it("never darkens to black", () => {
    const frame = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }));
    expect(Math.min(...at(frame, 32, 32))).toBeGreaterThan(40);
  });
});

describe("tile layers", () => {
  const varied = (seed = 0) => room({ layers: [{ rows: ["vvvv", "vvvv", "vvvv", "vvvv"], seed, legend: { v: ["t/floor-a", "t/floor-b", "t/floor-c"] } }] });

  it("picks variants deterministically by hash(x, y, seed)", () => {
    const compiled = compileScene(varied(), atlas);
    const ids = ["t/floor-a", "t/floor-b", "t/floor-c"];
    compiled.floor.forEach((cell) => {
      const x = cell.left / 16, y = cell.top / 16;
      expect(cell.sprite.id).toBe(ids[Math.floor(hash(x, y, 0) * 3)]);
    });
    expect(hashFrame(draw(varied()))).toBe(hashFrame(draw(varied())));
    expect(new Set(compiled.floor.map((c) => c.sprite.id)).size).toBeGreaterThan(1);
    expect(compileScene(varied(7), atlas).floor.map((c) => c.sprite.id)).not.toEqual(compiled.floor.map((c) => c.sprite.id));
  });

  it("anchors tall tiles at their top-left cell", () => {
    const frame = draw(room({ layers: [{ rows: ["aaaa", "aaaa", "aaaa", "aaaa"], legend: { a: "t/floor-a" } }, { rows: ["w..."], legend: { w: "t/wall" } }] }));
    expect(at(frame, 3, 40)).toEqual(rgb("cream4"));
    expect(at(frame, 3, 50)).toEqual(rgb("oak4"));
  });

  it("fails loudly on authoring mistakes", () => {
    expect(() => compileScene(room({ layers: [{ rows: ["aaaaa"], legend: { a: "t/floor-a" } }] }), atlas)).toThrow(/wider/);
    expect(() => compileScene(room({ layers: [{ rows: ["x"], legend: {} }] }), atlas)).toThrow(/legend/);
    expect(() => compileScene(room({ layers: [{ rows: ["a"], legend: { a: "nope" } }] }), atlas)).toThrow(/unknown sprite "nope"/);
    expect(() => compileScene(room({ props: [{ sprite: "nope", at: [0, 0] }] }), atlas)).toThrow(/unknown sprite/);
  });

  it("caches the static floor and redraws animated floor content in order", () => {
    const scene = room({
      layers: [{ rows: ["wa..", "aaaa", "aaaa", "aaaa"], legend: { a: "t/floor-a", w: "t/water" } }],
      props: [{ sprite: "t/rug", at: [0.25, 1], layer: "floor" }],
    });
    expect(compileScene(scene, atlas).staticFloor).toBe(0);
    const renderer = createSceneRenderer(scene, atlas), frame = createFrame(64, 64);
    renderer.render(frame, { x: 0, y: 0 }, { time: 0, phase: "midday" });
    expect(at(frame, 12, 2)).toEqual(rgb("jade3"));
    expect(at(frame, 3, 3)).toEqual(rgb("red3"));
    renderer.render(frame, { x: 0, y: 0 }, { time: 600, phase: "midday" });
    expect(at(frame, 12, 2)).toEqual(rgb("jade5"));
    expect(at(frame, 3, 3)).toEqual(rgb("red3"));
    expect(at(frame, 40, 2)).toEqual(rgb("ink"));
  });
});

describe("colliders and marks", () => {
  it("derives colliders from sprite feet, overrides and blocked rects", () => {
    const compiled = compileScene(room({
      props: [{ sprite: "t/red", at: [1, 1] }, { sprite: "t/red", at: [2, 2], solid: false }, { sprite: "t/blue", at: [3, 3], solid: [-2, -2, 4, 2] }],
      blocked: [[0, 0, 4, 0.5]],
    }), atlas);
    expect(compiled.colliders).toEqual([[0.75, 0.875, 0.5, 0.125], [2.875, 2.875, 0.25, 0.125], [0, 0, 4, 0.5]]);
  });

  it("normalises marks", () => {
    const compiled = compileScene(room({ marks: { door: [2, 4], seat: { at: [1, 1], facing: "left" } } }), atlas);
    expect(compiled.marks).toEqual({ door: { at: [2, 4] }, seat: { at: [1, 1], facing: "left" } });
  });
});

describe("light", () => {
  const lit = room({
    lights: [
      { kind: "glow", at: [2, 2], radius: 1.5, strength: 0.8, flicker: 0.5 },
      { kind: "shaft", from: [0, 0], width: 1.5, length: 3, panes: [2, 2], motes: 6 },
    ],
  });

  it("is deterministic for a given time and phase", () => {
    for (const phase of ["morning", "evening", "night"] as const) {
      expect(hashFrame(draw(lit, { phase, time: 1234 }))).toBe(hashFrame(draw(lit, { phase, time: 1234 })));
    }
  });

  it("warms the morning, dims the night and lights a pool around a glow", () => {
    const dark = draw(room(), { phase: "night" }), night = draw(lit, { phase: "night" });
    const sum = (p: number[]) => p[0] + p[1] + p[2];
    expect(sum(at(dark, 60, 60))).toBeLessThan(sum(rgb("oak4")) * 0.7);
    expect(sum(at(night, 32, 32))).toBeGreaterThan(sum(at(dark, 32, 32)) * 1.3);
    const morning = at(draw(room(), { phase: "morning" }), 60, 60);
    expect(morning[0] - morning[2]).toBeGreaterThan(rgb("oak4")[0] - rgb("oak4")[2]);
  });

  it("only shows shafts in their phases", () => {
    const shaft = room({ lights: [{ kind: "shaft", from: [0, 0], width: 2, length: 3 }] });
    expect(hashFrame(draw(shaft, { phase: "night" }))).toBe(hashFrame(draw(room(), { phase: "night" })));
    expect(hashFrame(draw(shaft, { phase: "morning" }))).not.toBe(hashFrame(draw(room(), { phase: "morning" })));
  });

  it("flickers and drifts motes over time, and freezes them for reduced motion", () => {
    const renderer = createSceneRenderer(lit, atlas);
    const keys = new Set([0, 700, 1400, 2100, 2800].map((time) => renderer.timeKey({ time, phase: "morning" })));
    expect(keys.size).toBeGreaterThan(1);
    const frozen = new Set([0, 700, 5000].map((time) => renderer.timeKey({ time, phase: "morning", reducedMotion: true })));
    expect(frozen.size).toBe(1);
    expect(hashFrame(draw(lit, { time: 0, reducedMotion: true, phase: "night" }))).toBe(hashFrame(draw(lit, { time: 9000, reducedMotion: true, phase: "night" })));
  });

  it("changes the time key exactly when an animation frame changes", () => {
    const renderer = createSceneRenderer(room(), atlas);
    const cook: Actor = { id: "c", sprite: "char/cook", at: [2, 3] };
    const key = (time: number) => renderer.timeKey({ time, phase: "midday", actors: [cook] });
    expect(key(0)).toBe(key(400));
    expect(key(0)).not.toBe(key(600));
  });
});

describe("frames", () => {
  const busy = room({
    layers: [{ rows: ["vvvv", "vvvv", "vvvv", "vvvv"], seed: 2, legend: { v: ["t/floor-a", "t/floor-b", "t/floor-c"] } }],
    props: [{ sprite: "t/red", at: [1, 1.5] }, { sprite: "t/shadowed", at: [3, 3] }, { sprite: "t/lamp", at: [2, 1] }, { sprite: "t/glass", at: [0.5, 3] }],
    lights: [{ kind: "glow", at: [2, 2], radius: 2, flicker: 0.3 }, { kind: "shaft", from: [0, 0.5], width: 1.25, length: 3, panes: [2, 1] }],
  });
  const actors: Actor[] = [{ id: "c", sprite: "char/cook", at: [2.2, 3.4], facing: "left", action: "walk", distance: 3.3 }];

  it("hash is stable (update the pin only for a deliberate engine change)", () => {
    const frame = draw(busy, { time: 1234, phase: "morning", actors, debug: true });
    expect(hashFrame(frame)).toBe(hashFrame(draw(busy, { time: 1234, phase: "morning", actors, debug: true })));
    expect(hashFrame(frame)).toMatchInlineSnapshot(`"2587f850"`);
  });

  it("renders the demo scene identically twice", () => {
    const warn = vi.fn();
    const demoAtlas = createAtlas(exemplar);
    const render = () => renderToFrame(createSceneRenderer(demo, demoAtlas, { warn }), { x: 0, y: 0, w: 192, h: 144 }, { time: 2500, phase: "morning", actors: demo.actors });
    expect(hashFrame(render())).toBe(hashFrame(render()));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("char/waiter/idle-down → ex/waiter"));
  });

  it("composites a 480×270 view in a few milliseconds", () => {
    const big = defineScene({
      id: "big", size: [32, 18], background: "ink",
      layers: [{ rows: Array.from({ length: 18 }, () => "v".repeat(32)), legend: { v: ["t/floor-a", "t/floor-b", "t/floor-c"] } }],
      props: Array.from({ length: 60 }, (_, i): Prop => ({ sprite: i % 3 ? "t/red" : "t/shadowed", at: [1 + (i % 15) * 2, 1 + Math.floor(i / 15) * 4] })),
      lights: [{ kind: "glow", at: [8, 8], radius: 4, flicker: 0.2 }, { kind: "glow", at: [24, 8], radius: 4 }, { kind: "shaft", from: [2, 0], width: 3, length: 8, motes: 8 }],
    });
    const renderer = createSceneRenderer(big, atlas), frame = createFrame(480, 270);
    const cast: Actor[] = Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, sprite: "char/cook", at: [3 + i * 3, 10], action: "walk" }));
    for (let i = 0; i < 20; i++) renderer.render(frame, { x: 16, y: 8 }, { time: i * 16, phase: "morning", actors: cast });
    const runs = 100, start = performance.now();
    for (let i = 0; i < runs; i++) renderer.render(frame, { x: 16, y: 8 }, { time: i * 16, phase: "morning", actors: cast });
    const ms = (performance.now() - start) / runs;
    console.log(`480x270 composite: ${ms.toFixed(2)} ms/frame`);
    expect(ms).toBeLessThan(25);
  });
});
