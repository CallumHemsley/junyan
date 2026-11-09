/** Private drawing helpers for the furniture family. Not loaded as a sprite set. */
import type { Color, Legend, Px } from "../../kit/index.ts";

/** A short grain streak or wear mark: `[x, y, length, colour]`, horizontal. */
export type Streak = readonly [x: number, y: number, length: number, c: Color];

/** Draw hand-placed horizontal streaks, only over existing art. */
export function streaks(p: Px, list: readonly Streak[]): void {
  p.over(() => { for (const [x, y, n, c] of list) p.hline(x, y, n, c); });
}

/**
 * A square-section leg seen from the front: lit left face, body, shaded right face,
 * and a darker scuffed foot row. `w` is 2 or 3.
 */
export function leg(p: Px, x: number, y: number, h: number, w = 3, tones: readonly [Color, Color, Color] = ["wood4", "wood3", "wood2"]): void {
  const [lit, body, dark] = tones;
  p.rect(x, y, w, h, body);
  if (w >= 3) p.vline(x, y + 1, h - 2, lit);
  p.vline(x + w - 1, y, h, dark);
  p.hline(x, y + h - 1, w, dark);
}

/**
 * A hand-tuned oval: `half` lists the half-width of each row of the top half (the bottom half
 * mirrors it), so curves step in clean runs. Returns an inside test for pixel (x, y) with the
 * oval's top-left at (left, top) and an optional offset, plus a filler.
 */
export function oval(half: readonly number[], left: number, top: number) {
  const height = half.length * 2, cx = left + Math.max(...half);
  const inside = (x: number, y: number, dx = 0, dy = 0) => {
    const r = y - top - dy;
    if (r < 0 || r >= height) return false;
    const hw = half[r < half.length ? r : height - 1 - r];
    return x - dx >= cx - hw && x - dx < cx + hw;
  };
  const fill = (p: Px, c: Color, dx = 0, dy = 0) => {
    for (let r = 0; r < height; r++) {
      const hw = half[r < half.length ? r : height - 1 - r];
      p.hline(cx - hw + dx, top + r + dy, hw * 2, c);
    }
  };
  return { inside, fill, height, width: Math.max(...half) * 2 };
}

/** `rows()` that also checks every row is exactly `w` wide, so hand-placed art cannot drift. */
export function grid(p: Px, x: number, y: number, w: number, rows: readonly string[], legend: Legend): void {
  rows.forEach((row, i) => { if (row.length !== w) throw new Error(`grid row ${i} "${row}" is ${row.length} wide, expected ${w}`); });
  p.rows(x, y, rows, legend);
}

/** Mirror an x coordinate inside a sprite of width `w` when `flip` is set. */
export const mx = (w: number, flip: boolean) => (x: number) => (flip ? w - 1 - x : x);
