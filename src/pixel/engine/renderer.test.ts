import { describe, expect, it, vi } from "vitest";
import { TILE as T, hash, PALETTE, type Color } from "../kit/index.ts";
import exemplar from "../sprites/exemplar/exemplar.ts";
import demo from "../scenes/demo.ts";
import { createAtlas } from "./atlas.ts";
import { createFrame, hashFrame } from "./frame.ts";
import { createSceneRenderer, renderToFrame } from "./renderer.ts";
import { compileScene, defineScene } from "./scene.ts";
import { testSprites } from "./test-sprites.ts";
import type { Actor, FrameState, Prop, Scene } from "./types.ts";

const atlas = createAtlas(testSprites);
/** Every pixel position below is derived from the tile size, so the suite holds at 16 or 32 px tiles. */
const n = (tiles: number, px = 0) => tiles + px / T;
const rgb = (c: Color) => [parseInt(PALETTE[c].slice(1, 3), 16), parseInt(PALETTE[c].slice(3, 5), 16), parseInt(PALETTE[c].slice(5, 7), 16)];
const at = (frame: { w: number; data: Uint8ClampedArray }, x: number, y: number) => Array.from(frame.data.subarray((y * frame.w + x) * 4, (y * frame.w + x) * 4 + 3));

const room = (extra: Partial<Scene> = {}): Scene => defineScene({
  id: "test", size: [4, 4], background: "ink",
  layers: [{ rows: ["aaaa", "aaaa", "aaaa", "aaaa"], legend: { a: "t/floor-a" } }],
  ...extra,
});
/**
 * Ungraded (`grade: false`, see grade.test.ts for the grade): midday has an ambient of exactly 1, so
 * with no lights pixels are the art's own colours.
 */
const draw = (scene: Scene, state: Partial<FrameState> = {}) =>
  renderToFrame(createSceneRenderer(scene, atlas, { grade: false }), { x: 0, y: 0, w: scene.size[0] * T, h: scene.size[1] * T }, { time: 0, phase: "midday", ...state });

describe("draw order", () => {
  it("draws the more southern object over the northern one", () => {
    // red covers x T-4..T+3, y T-8..T-1; blue sits 4 px right and 2 px south (or north) of it.
    const north: Prop = { sprite: "t/red", at: [1, 1] }, south: Prop = { sprite: "t/blue", at: [n(1, 4), n(1, 2)] };
    expect(at(draw(room({ props: [south, north] })), T + 1, T - 4)).toEqual(rgb("blue3"));
    expect(at(draw(room({ props: [{ ...south, at: [n(1, 4), n(1, -2)] }, north] })), T + 1, T - 4)).toEqual(rgb("red3"));
  });

  it("keeps scene order on ties, and draws actors after props on ties", () => {
    const a: Prop = { sprite: "t/red", at: [1, 1] }, b: Prop = { sprite: "t/blue", at: [1, 1] };
    expect(at(draw(room({ props: [a, b] })), T, T - 4)).toEqual(rgb("blue3"));
    expect(at(draw(room({ props: [b, a] })), T, T - 4)).toEqual(rgb("red3"));
    // The waiter's feet 15 px south of the prop's: it covers the prop and sorts after it.
    const actor: Actor = { id: "w", sprite: "ex/waiter", at: [1, n(1, 15)] };
    expect(at(draw(room({ props: [a] }), { actors: [actor] }), T, T - 4)).toEqual(rgb("jade4"));
  });

  it("puts floor props under objects and over props above actors", () => {
    const lampY = Math.round(0.75 * T);
    const scene = room({ props: [{ sprite: "t/lamp", at: [1, 0.75] }, { sprite: "t/rug", at: [0.5, 1] }] });
    // The waiter stands south of the lamp's anchor and covers it, yet the over-layer lamp wins.
    const frame = draw(scene, { actors: [{ id: "w", sprite: "ex/waiter", at: [1, n(0, lampY + 20)] }] });
    expect(at(frame, T, lampY - 2)).toEqual(rgb("gold4"));
    expect(at(frame, T + 5, lampY - 2)).toEqual(rgb("jade4"));
    expect(at(frame, 1, lampY - 2)).toEqual(rgb("red3"));
  });

  it("fades props named in state.fade, by id, and leaves the rest opaque", () => {
    const north: Prop = { id: "tree", sprite: "t/red", at: [1, 1] }, other: Prop = { id: "post", sprite: "t/blue", at: [3, 1] };
    const frame = draw(room({ props: [north, other] }), { fade: { tree: 0.5 } });
    const pixel = at(frame, T, T - 4), red = rgb("red3"), floor = rgb("oak4");
    pixel.forEach((v, i) => expect(v).toBeCloseTo((red[i] + floor[i]) / 2, -0.5));
    expect(at(frame, 3 * T, T - 4)).toEqual(rgb("blue3"));
    expect(at(draw(room({ props: [north] })), T, T - 4)).toEqual(red);
  });

  it("honours sortY for things that sit on other things", () => {
    const table: Prop = { sprite: "t/red", at: [1, 1] }, bowl: Prop = { sprite: "t/blue", at: [1, 0.9], sortY: 1.01 };
    expect(at(draw(room({ props: [bowl, table] })), T, T - 4)).toEqual(rgb("blue3"));
  });

  it("lights run-time lights from state.lights like the scene's own, and only while they are given", () => {
    const lamp = [{ kind: "glow" as const, at: [2, 2] as const, radius: 1.5, color: "gold4" as const, strength: 0.8 }];
    const dark = draw(room(), { phase: "night" }), lit = draw(room(), { phase: "night", lights: lamp });
    const sum = (f: { w: number; data: Uint8ClampedArray }) => at(f, 2 * T, 2 * T).reduce((a, b) => a + b, 0);
    expect(sum(lit)).toBeGreaterThan(sum(dark) + 20);
    // A corner far outside the glow is untouched.
    expect(at(lit, 1, 1)).toEqual(at(dark, 1, 1));
    // Same renderer, lights withdrawn: back to dark.
    const renderer = createSceneRenderer(room(), atlas, { grade: false }), view = { x: 0, y: 0, w: 4 * T, h: 4 * T };
    renderToFrame(renderer, view, { time: 0, phase: "night", lights: lamp });
    expect(at(renderToFrame(renderer, view, { time: 0, phase: "night" }), 2 * T, 2 * T)).toEqual(at(dark, 2 * T, 2 * T));
  });

  it("draws run-time props like scene props", () => {
    const frame = draw(room(), { props: [{ sprite: "t/red", at: [1, 1] }] });
    expect(at(frame, T, T - 4)).toEqual(rgb("red3"));
  });

  it("mirrors flipped props around their anchor", () => {
    const frame = draw(room({ props: [{ sprite: "t/half", at: [1, 1], flipX: true }] }));
    // Anchor x=1 of 4 mirrors to 3: drawn columns 0..1 become 2..3, so x=T-1..T is solid.
    expect(at(frame, T, T - 1)).toEqual(rgb("ink"));
    expect(at(frame, T - 2, T - 1)).toEqual(rgb("oak4"));
  });
});

describe("contact shadows", () => {
  const floor = rgb("oak4"), plum = rgb("plum1");
  const toward = (pixel: number[], amount: number) => pixel.map((c, i) => Math.round(c + (plum[i] - c) * amount));

  it("centres a stepped plum ellipse on the anchor", () => {
    const frame = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }));
    const c = 2 * T, core = at(frame, c, c), rim = at(frame, c + 3, c);
    expect(core).toEqual(toward(floor, 82 / 255));
    expect(rim).toEqual(toward(floor, 44 / 255));
    expect(at(frame, c + 4, c)).toEqual(floor);
    expect(at(frame, c - 4, c)).toEqual(rim);
    expect(at(frame, c, c + 2)).toEqual(floor);
  });

  it("merges overlapping shadows instead of stacking them", () => {
    const one = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }));
    const two = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }, { sprite: "t/shadowed", at: [2, 2] }] }));
    expect(hashFrame(two)).toBe(hashFrame(one));
  });

  it("never darkens to black", () => {
    const frame = draw(room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }));
    expect(Math.min(...at(frame, 2 * T, 2 * T))).toBeGreaterThan(40);
  });
});

describe("tile layers", () => {
  const varied = (seed = 0) => room({ layers: [{ rows: ["vvvv", "vvvv", "vvvv", "vvvv"], seed, legend: { v: ["t/floor-a", "t/floor-b", "t/floor-c"] } }] });

  it("picks variants deterministically by hash(x, y, seed)", () => {
    const compiled = compileScene(varied(), atlas);
    const ids = ["t/floor-a", "t/floor-b", "t/floor-c"];
    compiled.floor.forEach((cell) => {
      const x = cell.left / T, y = cell.top / T;
      expect(cell.sprite.id).toBe(ids[Math.floor(hash(x, y, 0) * 3)]);
    });
    expect(hashFrame(draw(varied()))).toBe(hashFrame(draw(varied())));
    expect(new Set(compiled.floor.map((c) => c.sprite.id)).size).toBeGreaterThan(1);
    expect(compileScene(varied(7), atlas).floor.map((c) => c.sprite.id)).not.toEqual(compiled.floor.map((c) => c.sprite.id));
  });

  it("anchors tall tiles at their top-left cell", () => {
    const frame = draw(room({ layers: [{ rows: ["aaaa", "aaaa", "aaaa", "aaaa"], legend: { a: "t/floor-a" } }, { rows: ["w..."], legend: { w: "t/wall" } }] }));
    expect(at(frame, 3, Math.round(2.5 * T))).toEqual(rgb("cream4"));
    expect(at(frame, 3, 3 * T + 2)).toEqual(rgb("oak4"));
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
    // The rug covers the water cell's left three quarters; its right quarter shows the water.
    const renderer = createSceneRenderer(scene, atlas, { grade: false }), frame = createFrame(4 * T, 4 * T);
    renderer.render(frame, { x: 0, y: 0 }, { time: 0, phase: "midday" });
    expect(at(frame, T - 2, 2)).toEqual(rgb("jade3"));
    expect(at(frame, 3, 3)).toEqual(rgb("red3"));
    renderer.render(frame, { x: 0, y: 0 }, { time: 600, phase: "midday" });
    expect(at(frame, T - 2, 2)).toEqual(rgb("jade5"));
    expect(at(frame, 3, 3)).toEqual(rgb("red3"));
    expect(at(frame, Math.round(2.5 * T), 2)).toEqual(rgb("ink"));
  });
});

describe("colliders and marks", () => {
  it("derives colliders from sprite feet, overrides and blocked rects", () => {
    const compiled = compileScene(room({
      props: [{ sprite: "t/red", at: [1, 1] }, { sprite: "t/red", at: [2, 2], solid: false }, { sprite: "t/blue", at: [3, 3], solid: [-2, -2, 4, 2] }],
      blocked: [[0, 0, 4, 0.5]],
    }), atlas);
    expect(compiled.colliders).toEqual([[(T - 4) / T, (T - 2) / T, 8 / T, 2 / T], [(3 * T - 2) / T, (3 * T - 2) / T, 4 / T, 2 / T], [0, 0, 4, 0.5]]);
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
    const corner = 4 * T - 4, centre = 2 * T;
    expect(sum(at(dark, corner, corner))).toBeLessThan(sum(rgb("oak4")) * 0.7);
    expect(sum(at(night, centre, centre))).toBeGreaterThan(sum(at(dark, centre, centre)) * 1.3);
    const morning = at(draw(room(), { phase: "morning" }), corner, corner);
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
    // Pinned per tile size: the art scale legitimately changes every pixel. Add an entry when TILE changes.
    const PINS: Record<number, string> = { 16: "822d800b", 32: "c3ebd3aa" };
    expect(hashFrame(frame)).toBe(PINS[T]);
  });

  it("renders the demo scene identically twice", () => {
    const warn = vi.fn();
    const demoAtlas = createAtlas(exemplar);
    const render = () => renderToFrame(createSceneRenderer(demo, demoAtlas, { warn }), { x: 0, y: 0, w: demo.size[0] * T, h: demo.size[1] * T }, { time: 2500, phase: "morning", actors: demo.actors });
    expect(hashFrame(render())).toBe(hashFrame(render()));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("char/waiter/idle-down → ex/waiter"));
  });

  it("composites a full 1280×800 view in a few milliseconds", () => {
    const W = 1280, H = 800, cols = Math.ceil(W / T) + 2, rows = Math.ceil(H / T) + 2;
    const big = defineScene({
      id: "big", size: [cols, rows], background: "ink",
      layers: [{ rows: Array.from({ length: rows }, () => "v".repeat(cols)), legend: { v: ["t/floor-a", "t/floor-b", "t/floor-c"] } }],
      props: Array.from({ length: 120 }, (_, i): Prop => ({ sprite: i % 3 ? "t/red" : "t/shadowed", at: [1 + (i % 15) * (cols - 2) / 15, 1 + Math.floor(i / 15) * (rows - 2) / 8] })),
      lights: [
        { kind: "glow", at: [cols / 4, rows / 2], radius: 4, flicker: 0.2 }, { kind: "glow", at: [(3 * cols) / 4, rows / 2], radius: 4 },
        { kind: "shaft", from: [2, 0], width: 3, length: 8, motes: 8 }, { kind: "shaft", from: [9, 0], width: 3, length: 8, motes: 8 },
      ],
    });
    const renderer = createSceneRenderer(big, atlas), frame = createFrame(W, H);
    const cast: Actor[] = Array.from({ length: 12 }, (_, i) => ({ id: `a${i}`, sprite: "char/cook", at: [3 + i * 3, rows / 2], action: "walk" }));
    const view = { x: T / 2, y: T / 4 };
    for (let i = 0; i < 20; i++) renderer.render(frame, view, { time: i * 16, phase: "morning", actors: cast });
    const runs = 60, start = performance.now();
    for (let i = 0; i < runs; i++) renderer.render(frame, view, { time: i * 16, phase: "morning", actors: cast });
    const ms = (performance.now() - start) / runs;
    console.log(`${W}x${H} composite at ${T}px tiles: ${ms.toFixed(2)} ms/frame`);
    expect(ms).toBeLessThan(16);
  });
});
