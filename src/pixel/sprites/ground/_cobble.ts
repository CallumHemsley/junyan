/**
 * Private helper: the courtyard's cobble layout, shared by the cobble tiles, the worn-path band and the
 * mossy-joint edges. Not a sprite set.
 *
 * Setts lie in five courses of different heights (5 to 8 px) whose bed joints wander a pixel up and
 * down along their length; each course is cut into setts 5 to 11 px long, a few long ones among the
 * short. The layout repeats every 32 px and is the same in every variant, so any mix tiles. Each sett
 * is a cell; joints are the pixels where a cell meets the next one to its right or below, and each
 * sett's upper-left corner pixel, which rounds it.
 */
import type { Color } from "../../kit/index.ts";
import { T } from "./_helpers.ts";

const m = (v: number) => ((v % T) + T) % T;

/** Course tops at x = 0 and how far each wanders; heights sum to 32. */
const HEIGHTS = [7, 6, 8, 5, 6];
const TOPS = HEIGHTS.map((_, i) => HEIGHTS.slice(0, i).reduce((a, b) => a + b, 0));
const wander = (r: number, x: number) => Math.round(Math.sin((x / T) * Math.PI * 2 * (1 + (r % 2)) + r * 1.7) * 0.9);

/** Sett lengths per course, summing to 32, and each course's offset. */
const CUTS: readonly { offset: number; lengths: readonly number[] }[] = [
  { offset: 0, lengths: [6, 9, 5, 7, 5] },
  { offset: 3, lengths: [11, 6, 8, 7] },
  { offset: 6, lengths: [7, 5, 6, 10, 4] },
  { offset: 1, lengths: [8, 6, 6, 6, 6] },
  { offset: 5, lengths: [5, 10, 7, 5, 5] },
];

/** Which course a pixel lies in (bed joints wander, so course membership depends on x). */
function courseAt(x: number, y: number): number {
  const yy = m(y);
  for (let r = HEIGHTS.length - 1; r >= 0; r--) {
    const top = TOPS[r] + (r === 0 ? 0 : wander(r, m(x)));
    if (yy >= top) return r;
  }
  return HEIGHTS.length - 1;
}

/** Cell id: course × 16 + sett index within the course. */
export function cellAt(x: number, y: number): number {
  const r = courseAt(x, y), { offset, lengths } = CUTS[r];
  let pos = m(x - offset), k = 0;
  while (pos >= lengths[k]) { pos -= lengths[k]; k++; }
  return r * 16 + k;
}

/** True where this pixel is joint rather than stone. */
const JOINT: boolean[] = Array.from({ length: T * T }, (_, i) => {
  const x = i % T, y = Math.floor(i / T), c = cellAt(x, y);
  if (cellAt(x + 1, y) !== c || cellAt(x, y + 1) !== c) return true;
  // Round each sett's upper-left corner (its other corners already meet joints).
  return cellAt(x, y - 1) !== c && cellAt(x - 1, y) !== c;
});
export const isJoint = (x: number, y: number) => JOINT[m(y) * T + m(x)];

/** Cells that reach a tile edge: both tiles draw half of them, so they must look the same in every variant. */
const SHARED = new Set<number>();
for (let i = 0; i < T; i++) for (const [x, y] of [[i, 0], [i, T - 1], [0, i], [T - 1, i]]) SHARED.add(cellAt(x, y));
export const isShared = (cell: number) => SHARED.has(cell);

/** A cell's middle, in tile px, for deciding which band a sett belongs to. */
const CENTRES = new Map<number, { x: number; y: number }>();
{
  const acc = new Map<number, { sx: number; sy: number; n: number; ax: number }>();
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const c = cellAt(x, y), a = acc.get(c) ?? { sx: 0, sy: 0, n: 0, ax: x };
    // Unwrap x against the first pixel seen so cells crossing the edge average sensibly.
    const ux = Math.abs(x - a.ax) > T / 2 ? x + (x < a.ax ? T : -T) : x;
    a.sx += ux; a.sy += y; a.n++; acc.set(c, a);
  }
  for (const [c, a] of acc) CENTRES.set(c, { x: m(Math.round(a.sx / a.n)), y: Math.round(a.sy / a.n) });
}
export const centreOf = (cell: number) => CENTRES.get(cell)!;
export const CELLS = [...CENTRES.keys()];

export type CobbleTone = { face: Color; lit: Color; shade: Color };

/**
 * Paint the cobbles: each sett one flat face, a single sunlit pixel at its upper-left corner, its lower
 * edge a step darker; joints in `joint`. `toneOf(cell)` picks each sett's tone.
 */
export function layCobbles(px: (x: number, y: number, c: Color) => void, toneOf: (cell: number) => CobbleTone, joint: Color, smooth = false): void {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    if (isJoint(x, y)) { px(x, y, joint); continue; }
    const t = toneOf(cellAt(x, y));
    const above = isJoint(x, y - 1), left = isJoint(x - 1, y), below = isJoint(x, y + 1);
    px(x, y, above && left ? t.lit : below && !smooth ? t.shade : t.face);
  }
}
