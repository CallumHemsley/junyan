import type { Rect, Vec } from "./types.ts";

/** Half-extents of a mover's box around its feet, tile units. A number means a square. */
export type Radius = number | Vec;

/** Default mover box for a person: 8 px wide, 5 px deep, centred on the feet. */
export const PERSON_RADIUS: Vec = [0.25, 0.15];

/**
 * Move a box centred on `position` by `delta`, one axis at a time, so it slides along walls instead
 * of sticking. Each axis is swept: the box stops flush against the first collider it would cross,
 * so a large step never tunnels. Colliders the box already overlaps are ignored, so something
 * spawned inside furniture can walk out. `walkable`, if given, is a rectangle the box must stay in.
 * Touching is not overlapping. Pure; everything is in tile units.
 */
export function move(position: Vec, delta: Vec, radius: Radius, colliders: readonly Rect[], walkable?: Rect): [number, number] {
  const [rx, ry] = typeof radius === "number" ? [radius, radius] : radius;
  let x = position[0], y = position[1];
  x = sweep(x, delta[0], rx, y, ry, colliders, 0);
  if (walkable) x = clampAxis(x, position[0], rx, walkable[0], walkable[2]);
  y = sweep(y, delta[1], ry, x, rx, colliders, 1);
  if (walkable) y = clampAxis(y, position[1], ry, walkable[1], walkable[3]);
  return [x, y];
}

/** Sweep one axis. `along` is the moving coordinate, `across` the fixed one. */
function sweep(along: number, step: number, r: number, across: number, rAcross: number, colliders: readonly Rect[], axis: 0 | 1): number {
  if (step === 0) return along;
  let next = along + step;
  const lo = across - rAcross, hi = across + rAcross;
  for (const c of colliders) {
    const cStart = c[axis], cEnd = c[axis] + c[axis + 2];
    const oStart = c[1 - axis], oEnd = c[1 - axis] + c[3 - axis];
    if (oEnd <= lo || oStart >= hi) continue; // no overlap on the other axis
    if (step > 0) {
      // Was fully before the collider, would end past its near edge.
      if (along + r <= cStart + 1e-9 && next + r > cStart) next = Math.min(next, cStart - r);
    } else if (along - r >= cEnd - 1e-9 && next - r < cEnd) next = Math.max(next, cEnd + r);
  }
  return next;
}

function clampAxis(value: number, from: number, r: number, start: number, size: number): number {
  const min = start + r, max = start + size - r;
  if (min > max) return from;
  // Never push something already outside further out; only stop it leaving.
  if (value < min) return from < min ? Math.max(value, from) : min;
  if (value > max) return from > max ? Math.min(value, from) : max;
  return value;
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
}

/** Is a box at `position` free of every collider (and inside `walkable`)? */
export function isFree(position: Vec, radius: Radius, colliders: readonly Rect[], walkable?: Rect): boolean {
  const [rx, ry] = typeof radius === "number" ? [radius, radius] : radius;
  const box: Rect = [position[0] - rx, position[1] - ry, rx * 2, ry * 2];
  if (walkable && (box[0] < walkable[0] || box[1] < walkable[1] || box[0] + box[2] > walkable[0] + walkable[2] || box[1] + box[3] > walkable[1] + walkable[3])) return false;
  return colliders.every((c) => !overlaps(box, c));
}
