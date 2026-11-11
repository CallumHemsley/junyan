/**
 * Private helpers for the town's ground tiles. Not a sprite set.
 *
 * Every ground tile is 32×32, anchored top-left, on the floor layer. Texture that might cross a tile edge
 * is drawn through `wrap`, so a tile always meets a copy of itself; anything that must also meet the
 * other variants keeps one pixel clear of the edges or sits on the material's fixed joint grid.
 */
import { hash, type Color, type Legend, type Px, type SpriteDef } from "../../kit/index.ts";

export const T = 32;

/** A static ground tile. */
export const tile = (draw: (p: Px) => void): SpriteDef => ({ w: T, h: T, anchor: [0, 0], layer: "floor", draw: (p) => draw(p) });

/** An animated ground tile (water). Slow, seamless loops. */
export const animated = (frames: number, fps: number, draw: (p: Px, frame: number) => void): SpriteDef =>
  ({ w: T, h: T, anchor: [0, 0], layer: "floor", frames, fps, draw });

export const mod = (v: number, m = T) => ((v % m) + m) % m;

/** Plot a pixel, wrapping round the tile so texture crossing an edge reappears on the far side. */
export function wrap(p: Px, x: number, y: number, c: Color | null): void {
  p.px(mod(x), mod(y), c);
}

/** Stamp hand-placed rows through `wrap`. `.` and space skip. */
export function stamp(p: Px, x: number, y: number, rows: readonly string[], legend: Legend, wrapEdges = true): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const key = row[i];
      if (key === "." || key === " ") continue;
      if (!(key in legend)) throw new Error(`stamp(): "${key}" is not in the legend (row ${j}: "${row}")`);
      if (wrapEdges) wrap(p, x + i, y + j, legend[key]);
      else p.px(x + i, y + j, legend[key]);
    }
  });
}

/**
 * Points on a jittered grid: one per `cell`×`cell` square, offset inside it by the hash. Even cover with
 * no clumps and no visible grid. Points stay `margin` px inside their square.
 */
export function jitter(cell: number, seed: number, margin = 1): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let j = 0; j < T / cell; j++) for (let i = 0; i < T / cell; i++) {
    const span = cell - margin * 2;
    const x = i * cell + margin + Math.floor(hash(i, j, seed) * span);
    const y = j * cell + margin + Math.floor(hash(i, j, seed + 101) * span);
    out.push([x, y, hash(i, j, seed + 202)]);
  }
  return out;
}

/** True inside a soft ellipse centred on (cx, cy). */
export const inBlob = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;

export type Side = "n" | "s" | "w" | "e";
export type Corner = "nw" | "ne" | "sw" | "se";

/**
 * Draw an edge once, as if it ran along the north side, and land it on any side. `draw(plot)` gets
 * `plot(along, depth, colour)`: `along` runs 0..31 along the edge, `depth` 0..31 inward from it.
 * West and east edges run north to south; north and south run west to east, so `along` keeps the
 * same direction as the neighbouring tiles' edges and joints line up.
 */
export function sided(p: Px, side: Side, draw: (plot: (along: number, depth: number, c: Color | null) => void) => void): void {
  draw((a, d, c) => {
    if (a < 0 || a >= T || d < 0 || d >= T) return;
    if (side === "n") p.px(a, d, c);
    else if (side === "s") p.px(a, T - 1 - d, c);
    else if (side === "w") p.px(d, a, c);
    else p.px(T - 1 - d, a, c);
  });
}
