import { describe, expect, it, vi } from "vitest";
import { actorFrame, createActorResolver, resolveActorSprite } from "./actors.ts";
import { createAtlas } from "./atlas.ts";
import { testSprites } from "./test-sprites.ts";

const atlas = createAtlas(testSprites);

describe("actor sprite resolution", () => {
  it("uses the exact action and facing", () => {
    const r = resolveActorSprite(atlas, "char/cook", "walk", "down");
    expect([r.sprite.id, r.flipX, r.fallback]).toEqual(["char/cook/walk-down", false, undefined]);
  });

  it("mirrors right for left without warning", () => {
    const r = resolveActorSprite(atlas, "char/cook", "walk", "left");
    expect([r.sprite.id, r.flipX, r.fallback]).toEqual(["char/cook/walk-right", true, undefined]);
  });

  it("falls back to idle for an unknown action", () => {
    const r = resolveActorSprite(atlas, "char/cook", "dance", "right");
    expect(r.sprite.id).toBe("char/cook/idle-right");
    expect(r.fallback).toContain("char/cook/dance-right");
  });

  it("falls back to idle-down for an unknown facing", () => {
    expect(resolveActorSprite(atlas, "char/cook", "idle", "up").sprite.id).toBe("char/cook/idle-down");
  });

  it("falls back to ex/waiter for a missing character", () => {
    const r = resolveActorSprite(atlas, "char/nobody", "walk", "up");
    expect(r.sprite.id).toBe("ex/waiter");
    expect(r.fallback).toBeDefined();
  });

  it("accepts a plain sprite id quietly", () => {
    const r = resolveActorSprite(atlas, "ex/waiter", "walk", "left");
    expect([r.sprite.id, r.fallback]).toEqual(["ex/waiter", undefined]);
  });

  it("warns once per distinct fallback", () => {
    const warn = vi.fn();
    const resolve = createActorResolver(atlas, warn);
    for (let i = 0; i < 3; i++) resolve({ id: "a", sprite: "char/nobody", at: [0, 0] });
    resolve({ id: "b", sprite: "char/cook", at: [0, 0], facing: "left" });
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("actor frames", () => {
  const walk = atlas.get("char/cook/walk-down");

  it("animate by injected time", () => {
    expect(actorFrame({ id: "a", sprite: "char/cook", at: [0, 0], action: "walk" }, walk, 0)).toBe(0);
    expect(actorFrame({ id: "a", sprite: "char/cook", at: [0, 0], action: "walk" }, walk, 125)).toBe(1);
    expect(actorFrame({ id: "a", sprite: "char/cook", at: [0, 0], action: "walk" }, walk, 500)).toBe(0);
  });

  it("step by distance when distance is given", () => {
    const at = (distance: number) => actorFrame({ id: "a", sprite: "char/cook", at: [0, 0], action: "walk", distance }, walk, 99999);
    expect(at(0)).toBe(0);
    expect(at(6 / 16)).toBe(1);
    expect(at(24 / 16)).toBe(0);
  });
});
