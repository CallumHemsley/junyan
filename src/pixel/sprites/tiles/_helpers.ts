/**
 * Private helpers for the room-shell tiles (floors, caps, doorway). Not a sprite set.
 */
import type { Legend, Px } from "../../kit/index.ts";

/** Stamp a hand-drawn block, checking that every row is exactly `w` wide and there are `h` rows. */
export function block(p: Px, x: number, y: number, w: number, h: number, rows: readonly string[], legend: Legend, name = "block"): void {
  if (rows.length !== h) throw new Error(`${name}: ${rows.length} rows, expected ${h}`);
  rows.forEach((row, i) => {
    if (row.length !== w) throw new Error(`${name}: row ${i} "${row}" is ${row.length} wide, expected ${w}`);
  });
  p.rows(x, y, rows, legend);
}

/** A full 16×16 hand-drawn tile. */
export function tile16(p: Px, rows: readonly string[], legend: Legend, name = "tile"): void {
  block(p, 0, 0, 16, 16, rows, legend, name);
}

/**
 * Honey oak floorboards. `a` is the board face, `b` grain and seams, `c` the deep gap and knot rim,
 * `d` the knot heart, `l` lit figure and board-top highlights, `w` the palest worn finish.
 */
export const OAK: Legend = { a: "oak4", b: "oak3", c: "oak2", d: "oak1", l: "oak5", w: "cream4" };
