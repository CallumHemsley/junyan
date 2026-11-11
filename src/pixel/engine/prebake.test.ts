import { describe, expect, it } from "vitest";
import { TILE as T } from "../kit/index.ts";
import { createAtlas } from "./atlas.ts";
import { hashFrame } from "./frame.ts";
import { bakeFrame, createIdleQueue, releaseScenes, sceneSprites, unbakedFrames, type IdleDeadline } from "./prebake.ts";
import { createSceneRenderer, renderToFrame } from "./renderer.ts";
import { defineScene } from "./scene.ts";
import { testSprites } from "./test-sprites.ts";

/** A fake idle schedule over a fake clock: each `idle(ms)` runs the pending callback with that much time. */
function fakeIdle() {
  let now = 0, pending: ((d: IdleDeadline) => void) | null = null, calls = 0;
  const schedule = (run: (d: IdleDeadline) => void) => { expect(pending).toBeNull(); pending = run; calls++; };
  const idle = (ms: number, didTimeout = false) => {
    const run = pending!; pending = null;
    const end = now + ms;
    run({ timeRemaining: () => Math.max(0, end - now), didTimeout });
  };
  return { schedule, idle, advance: (ms: number) => { now += ms; }, get pending() { return pending; }, get calls() { return calls; } };
}

describe("idle queue", () => {
  it("runs tasks in order, only while the slice has more than the reserve left", () => {
    const clock = fakeIdle(), done: number[] = [];
    const queue = createIdleQueue(clock.schedule, 2);
    for (let i = 0; i < 6; i++) queue.push(() => { done.push(i); clock.advance(3); });
    expect(clock.calls).toBe(1);
    clock.idle(8); // 8 → 5 → 2: two tasks, then 2 ms left is not more than the reserve
    expect(done).toEqual([0, 1]);
    expect(queue.pending).toBe(4);
    clock.idle(1); // too short to start anything
    expect(done).toEqual([0, 1]);
    clock.idle(50);
    expect(done).toEqual([0, 1, 2, 3, 4, 5]);
    expect(clock.pending).toBeNull();
  });

  it("always moves when the browser runs the callback late, one task at a time", () => {
    const clock = fakeIdle(), done: number[] = [];
    const queue = createIdleQueue(clock.schedule);
    queue.push(() => done.push(1)); queue.push(() => done.push(2));
    clock.idle(0, true);
    expect(done).toEqual([1]);
    clock.idle(0, true);
    expect(done).toEqual([1, 2]);
  });

  it("schedules one callback at a time and none when empty; clear drops waiting tasks", () => {
    const clock = fakeIdle(), done: number[] = [];
    const queue = createIdleQueue(clock.schedule);
    queue.push(() => done.push(1)); queue.push(() => done.push(2));
    expect(clock.calls).toBe(1);
    queue.clear();
    clock.idle(50);
    expect(done).toEqual([]);
    expect(clock.pending).toBeNull();
    queue.push(() => done.push(3));
    clock.idle(50);
    expect(done).toEqual([3]);
  });
});

describe("pre-baked frames", () => {
  const scene = defineScene({
    id: "p", size: [4, 4], background: "ink",
    layers: [{ rows: ["wvvv", "vvvv", "vvvv", "vvvv"], legend: { v: ["t/floor-a", "t/floor-b", "t/floor-c"], w: "t/water" } }],
    props: [{ sprite: "t/red", at: [1, 1.5] }, { sprite: "t/lamp", at: [2, 1] }, { sprite: "t/glass", at: [0.5, 3] }, { sprite: "t/half", at: [3, 3], flipX: true }],
    lights: [{ kind: "glow", at: [2, 2], radius: 2 }],
  });
  const actors = [{ id: "c", sprite: "char/cook", at: [2.2, 3.4] as const, action: "walk" }];

  it("are the bytes the atlas bakes lazily, for every frame", () => {
    const atlas = createAtlas(testSprites);
    for (const id of atlas.ids()) {
      const sprite = atlas.get(id);
      for (let i = 0; i < sprite.frameCount; i++) expect(bakeFrame(sprite.def, i)).toEqual(sprite.frame(i).data);
    }
  });

  it("render byte-identically once adopted, and lazily bake whatever was not adopted", () => {
    const lazy = createAtlas(testSprites), pre = createAtlas(testSprites);
    const preRenderer = createSceneRenderer(scene, pre);
    const listed = sceneSprites(preRenderer.compiled);
    expect(listed[0].layer).toBe("floor");
    for (const sprite of listed) for (const i of unbakedFrames(sprite)) sprite.adopt(i, bakeFrame(sprite.def, i));
    expect(listed.every((s) => unbakedFrames(s).length === 0)).toBe(true);
    preRenderer.warm();
    for (const time of [0, 600]) {
      const state = { time, phase: "night" as const, actors };
      const view = { x: 0, y: 0, w: 4 * T, h: 4 * T };
      expect(hashFrame(renderToFrame(preRenderer, view, state))).toBe(hashFrame(renderToFrame(createSceneRenderer(scene, lazy), view, state)));
    }
  });

  it("are refused at the wrong size, and never replace a frame already baked", () => {
    const atlas = createAtlas(testSprites), red = atlas.get("t/red");
    expect(() => red.adopt(0, new Uint8ClampedArray(3))).toThrow(/bytes/);
    const first = red.frame(0);
    red.adopt(0, new Uint8ClampedArray(red.w * red.h * 4));
    expect(red.frame(0)).toBe(first);
    expect(red.baked(0)).toBe(true);
  });
});

describe("releasing scenes the player has left", () => {
  const room = (id: string, props: { sprite: string; at: readonly [number, number] }[]) => defineScene({
    id, size: [3, 3], background: "ink",
    layers: [{ rows: ["aaa", "aaa", "aaa"], legend: { a: "t/floor-a" } }],
    props: props.map((p) => ({ ...p, at: [p.at[0], p.at[1]] as const })),
    lights: [{ kind: "glow", at: [1.5, 1.5], radius: 1.5 }],
  });
  const view = { x: 0, y: 0, w: 3 * T, h: 3 * T };
  const state = { time: 0, phase: "night" as const };

  it("drops only what no kept scene draws, frees the floor cache, and redraws identically later", () => {
    const atlas = createAtlas(testSprites);
    // Both rooms share the floor; only the away room has the lamp and the blue box.
    const here = createSceneRenderer(room("here", [{ sprite: "t/red", at: [1, 1] }]), atlas);
    const away = createSceneRenderer(room("away", [{ sprite: "t/lamp", at: [1, 1] }, { sprite: "t/blue", at: [2, 2] }, { sprite: "t/red", at: [2, 1] }]), atlas);
    renderToFrame(here, view, state);
    const before = hashFrame(renderToFrame(away, view, state));
    const bytes = atlas.bakedBytes() + away.cachedBytes();
    expect(away.cachedBytes()).toBeGreaterThan(0);

    const freed = releaseScenes([here.compiled], [away]);
    expect(freed).toBeGreaterThan(0);
    expect(atlas.bakedBytes() + away.cachedBytes()).toBe(bytes - freed);
    expect(away.cachedBytes()).toBe(0);
    expect(atlas.get("t/lamp").baked(0)).toBe(false);
    expect(atlas.get("t/blue").baked(0)).toBe(false);
    expect(atlas.get("t/red").baked(0)).toBe(true); // the room the player is in still draws it
    expect(atlas.get("t/floor-a").baked(0)).toBe(true);

    expect(hashFrame(renderToFrame(away, view, state))).toBe(before);
    expect(atlas.get("t/lamp").baked(0)).toBe(true);
  });

  it("never touches sprites outside every scene (characters)", () => {
    const atlas = createAtlas(testSprites);
    const away = createSceneRenderer(room("away", [{ sprite: "t/blue", at: [2, 2] }]), atlas);
    renderToFrame(away, view, { ...state, actors: [{ id: "c", sprite: "char/cook", at: [1, 2] }] });
    const cook = atlas.get("char/cook/idle-down");
    expect(cook.baked(0)).toBe(true);
    releaseScenes([], [away]);
    expect(cook.baked(0)).toBe(true);
    expect(atlas.get("t/blue").baked(0)).toBe(false);
  });

  it("counts a sprite's bytes and frees them all on release", () => {
    const atlas = createAtlas(testSprites), half = atlas.get("t/half");
    half.frame(0); half.frame(0, true);
    expect(half.bytes()).toBe(half.w * half.h * 4 * 2);
    expect(half.release()).toBe(half.w * half.h * 4 * 2);
    expect(half.bytes()).toBe(0);
    expect(half.baked(0)).toBe(false);
  });
});
