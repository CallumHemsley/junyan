/**
 * Baking a scene's art ahead of time (ticket 0200), so the first step into a map does not stall on
 * hundreds of sprites. Pure TypeScript: no DOM, safe in a worker and in Node.
 *
 *  - `bakeFrame` bakes one frame of one sprite to the exact bytes the atlas would bake lazily.
 *  - `sceneSprites` lists the real sprites a compiled scene draws, floor first (the static floor
 *    cache needs those), so they can be baked elsewhere and handed to the atlas (`AtlasSprite.adopt`).
 *  - `createIdleQueue` runs small tasks in idle time, never starting one when the slice is spent.
 */
import { Px, type SpriteDef } from "../kit/index.ts";
import type { AtlasSprite } from "./atlas.ts";
import type { SceneRenderer } from "./renderer.ts";
import type { CompiledScene } from "./scene.ts";

/** Frame `index` of a sprite as straight RGBA: byte for byte what `Atlas.frame` bakes. */
export function bakeFrame(def: SpriteDef, index: number): Uint8ClampedArray {
  const p = new Px(def.w, def.h);
  def.draw(p, index);
  return p.toRGBA();
}

/** The real sprites (no placeholders) a compiled scene draws, each once: floor first, then objects and over props. */
export function sceneSprites(compiled: CompiledScene): AtlasSprite[] {
  const seen = new Set<AtlasSprite>();
  for (const list of [compiled.floor, compiled.objects, compiled.over]) for (const p of list) if (!p.sprite.placeholder) seen.add(p.sprite);
  return [...seen];
}

/**
 * Free the memory of scenes the player has left: every baked frame of the `drop` renderers' sprites
 * that no `keep` scene draws, and the dropped renderers' floor caches and view buffers. Sprites
 * outside every scene (characters, critters) are never touched. Everything rebuilds lazily (or by
 * prebaking) if a dropped scene is drawn again. Returns the bytes released.
 */
export function releaseScenes(keep: readonly CompiledScene[], drop: readonly SceneRenderer[]): number {
  const kept = new Set<AtlasSprite>();
  for (const compiled of keep) for (const sprite of sceneSprites(compiled)) kept.add(sprite);
  let freed = 0;
  for (const renderer of drop) {
    for (const sprite of sceneSprites(renderer.compiled)) if (!kept.has(sprite)) freed += sprite.release();
    freed += renderer.cachedBytes();
    renderer.release();
  }
  return freed;
}

/** Frames of `sprite` not baked yet. */
export const unbakedFrames = (sprite: AtlasSprite): number[] => Array.from({ length: sprite.frameCount }, (_, i) => i).filter((i) => !sprite.baked(i));

/** What an idle callback is told: how long is left of the idle period, and whether it ran late. */
export type IdleDeadline = { timeRemaining(): number; readonly didTimeout?: boolean };
/** Calls `run` in the next idle period (`requestIdleCallback`, or a timer in its stead). */
export type IdleSchedule = (run: (deadline: IdleDeadline) => void) => void;

export type IdleQueue = {
  push(task: () => void): void;
  /** Tasks waiting. */
  readonly pending: number;
  clear(): void;
};

/**
 * Run tasks in idle slices. A task starts only while more than `reserve` ms of the slice is left
 * (or when the browser ran the callback late, so the queue always moves); tasks never split, so
 * keep each one short. FIFO, deterministic, one scheduled callback at a time.
 */
export function createIdleQueue(schedule: IdleSchedule, reserve = 2): IdleQueue {
  const tasks: (() => void)[] = [];
  let scheduled = false;
  const run = (deadline: IdleDeadline) => {
    scheduled = false;
    let first = true;
    while (tasks.length && (deadline.timeRemaining() > reserve || (first && deadline.didTimeout))) {
      first = false;
      tasks.shift()!();
    }
    kick();
  };
  const kick = () => {
    if (scheduled || !tasks.length) return;
    scheduled = true;
    schedule(run);
  };
  return {
    push(task) { tasks.push(task); kick(); },
    get pending() { return tasks.length; },
    clear() { tasks.length = 0; },
  };
}

/** The browser's idle schedule: `requestIdleCallback` (run within a second at the latest), else 8 ms timer slices. */
export function browserIdleSchedule(): IdleSchedule {
  const ric = (globalThis as { requestIdleCallback?: (cb: (d: IdleDeadline) => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) return (run) => { ric(run, { timeout: 1000 }); };
  return (run) => {
    setTimeout(() => {
      const start = performance.now();
      run({ timeRemaining: () => Math.max(0, 8 - (performance.now() - start)), didTimeout: true });
    }, 16);
  };
}
