import { describe, expect, it, vi } from "vitest";
import { TILE as T, PALETTE, type Color } from "../kit/index.ts";
import { createActorResolver, resolveActorSprite } from "./actors.ts";
import { createAtlas, type Placeholder } from "./atlas.ts";
import { createSceneRenderer, renderToFrame } from "./renderer.ts";
import { compileScene, defineScene } from "./scene.ts";
import { testSprites } from "./test-sprites.ts";
import type { Scene } from "./types.ts";

const rgb = (c: Color) => [parseInt(PALETTE[c].slice(1, 3), 16), parseInt(PALETTE[c].slice(3, 5), 16), parseInt(PALETTE[c].slice(5, 7), 16)];
const at = (frame: { w: number; data: Uint8ClampedArray }, x: number, y: number) => Array.from(frame.data.subarray((y * frame.w + x) * 4, (y * frame.w + x) * 4 + 3));

/** Boxes for the `todo/` domain only: an 8×4 prop, a 32×32 opaque tile, a 10×20 character. */
const spec = (id: string): Placeholder | null =>
  id === "todo/tile" ? { w: T, h: T, color: "leaf3", alpha: 1, layer: "floor" }
    : id.startsWith("todo/char") ? { w: 10, h: 20, color: "blue4" }
      : id.startsWith("todo/") ? { w: 8, h: 4, color: "red4" } : null;

const scene = (extra: Partial<Scene> = {}): Scene => defineScene({
  id: "todo", size: [2, 2], background: "ink",
  layers: [{ rows: ["aa", "aa"], legend: { a: "todo/tile" } }],
  ...extra,
});

describe("missing-sprite placeholders", () => {
  it("are off by default: an unknown id still throws", () => {
    const atlas = createAtlas(testSprites);
    expect(atlas.find("todo/x")).toBeUndefined();
    expect(() => atlas.get("todo/x")).toThrow(/No sprite "todo\/x"/);
    expect(() => compileScene(scene(), atlas)).toThrow(/unknown sprite "todo\/tile"/);
  });

  it("stand in for missing ids the option covers, never for real ones, and report each id once", () => {
    const onPlaceholder = vi.fn();
    const atlas = createAtlas(testSprites, { placeholder: spec, onPlaceholder });
    expect(atlas.has("todo/bench")).toBe(false);
    const box = atlas.get("todo/bench");
    expect([box.placeholder, box.w, box.h, box.anchor]).toEqual([true, 8, 4, [4, 4]]);
    atlas.get("todo/bench");
    atlas.find("todo/bench");
    expect(onPlaceholder).toHaveBeenCalledTimes(1);
    expect(onPlaceholder).toHaveBeenCalledWith("todo/bench");
    expect(atlas.get("t/red").placeholder).toBeUndefined();
    expect(atlas.find("other/x")).toBeUndefined();
    expect(atlas.ids()).not.toContain("todo/bench");
  });

  it("draw a quiet translucent box on the footprint, and opaque tiles", () => {
    const atlas = createAtlas(testSprites, { placeholder: spec });
    // The box's base sits on its anchor: anchored at (1, 1) tiles it covers x T-4..T+3, y T-4..T-1.
    const frame = renderToFrame(createSceneRenderer(scene({ props: [{ id: "bench", sprite: "todo/bench", at: [1, 1] }] }), atlas, { grade: false }),
      { x: 0, y: 0, w: 2 * T, h: 2 * T }, { time: 0, phase: "midday" });
    const ground = rgb("leaf3"), red = rgb("red4");
    expect(at(frame, 2, 2)).toEqual(ground);
    expect(at(frame, T - 5, T - 2)).toEqual(ground);
    for (const [x, y] of [[T - 4, T - 4], [T, T - 2]]) {
      const pixel = at(frame, x, y);
      // Tinted towards the box colour, but the ground still shows through.
      expect(pixel).not.toEqual(ground);
      expect(pixel).not.toEqual(red);
      pixel.forEach((v, i) => expect(Math.abs(v - red[i])).toBeLessThan(Math.abs(ground[i] - red[i]) + 1));
    }
  });

  it("never stand in for optional props: those are left out when their art is missing", () => {
    const atlas = createAtlas(testSprites, { placeholder: spec });
    const compiled = compileScene(scene({ props: [{ id: "shade", sprite: "todo/shade", at: [1, 1], optional: true, layer: "floor" }, { id: "real", sprite: "t/rug", at: [1, 1], optional: true }] }), atlas);
    const ids = [...compiled.floor, ...compiled.objects].map(p => p.prop?.id).filter(Boolean);
    expect(ids).toEqual(["real"]);
    const plain = scene({ layers: [{ rows: ["aa", "aa"], legend: { a: "t/floor-a" } }], props: [{ sprite: "nope/x", at: [1, 1], optional: true }] });
    expect(compileScene(plain, createAtlas(testSprites)).objects).toEqual([]);
  });

  it("stand in for a missing character before the stand-in waiter, quietly", () => {
    const warn = vi.fn();
    const atlas = createAtlas(testSprites, { placeholder: spec });
    const r = resolveActorSprite(atlas, "todo/char-courier", "walk", "left");
    expect([r.sprite.id, r.sprite.placeholder, r.flipX]).toEqual(["todo/char-courier", true, false]);
    // Real characters resolve exactly as without the option; unknown domains still get the waiter.
    expect(resolveActorSprite(atlas, "char/cook", "walk", "left").sprite.id).toBe("char/cook/walk-right");
    expect(resolveActorSprite(atlas, "char/nobody", "walk", "up").sprite.id).toBe("ex/waiter");
    const resolve = createActorResolver(atlas, warn);
    resolve({ id: "c", sprite: "todo/char-courier", at: [0, 0], action: "walk" });
    expect(warn).not.toHaveBeenCalled();
  });
});
