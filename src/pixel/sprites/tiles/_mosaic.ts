/**
 * Private helper: the dining room's mosaic, shared by the floor variants and the border tiles.
 *
 * Small cream octagons on an 8px pitch with a dark cabochon dot where four meet: the classic Paris
 * bistro floor, laid when the building was new. 7px cells read as mosaic at play zoom. The pattern
 * repeats every 8px, so every 32px tile meets its neighbours exactly.
 */
import { hash, type Color, type Px } from "../../kit/index.ts";

export type Kind = "cell" | "dot" | "grout";
export type Cell = { kind: Kind; /** Cell index in the tile, 0–15 (4×4), or the dot's corner index. */ key: number; u: number; v: number };

/** What lies under tile pixel (x, y): an octagon cell, a cabochon dot centred on each 8px corner, or grout. */
export function cellAt(x: number, y: number): Cell {
  const u = ((x % 8) + 8) % 8, v = ((y % 8) + 8) % 8;
  const du = u <= 4 ? u : u - 8, dv = v <= 4 ? v : v - 8;
  const md = Math.abs(du) + Math.abs(dv);
  const ci = ((Math.floor(x / 8) % 4) + 4) % 4, cj = ((Math.floor(y / 8) % 4) + 4) % 4;
  if (md <= 1) {
    const di = ((Math.round(x / 8) % 4) + 4) % 4, dj = ((Math.round(y / 8) % 4) + 4) % 4;
    return { kind: "dot", key: di + dj * 4, u, v };
  }
  if (md === 2 || u === 0 || v === 0) return { kind: "grout", key: ci + cj * 4, u, v };
  return { kind: "cell", key: ci + cj * 4, u, v };
}

export type Palette = { cream: Color; aged: Color; lit: Color; shade: Color; ink: Color; inkLit: Color; grout: Color };
export const MOSAIC: Palette = { cream: "cream4", aged: "cream3", lit: "cream5", shade: "cream3", ink: "stone2", inkLit: "stone3", grout: "cream3" };

/**
 * Lay the mosaic over the whole tile. `tint(cell, x, y)` may override the palette for a cell (a
 * replaced patch, a stain, the worn path). A few cells are yellowed a step; each cell catches a little
 * light on its top-left edge; each dot keeps a lit pixel so it reads as glazed.
 */
export function mosaic(p: Px, seed: number, tint?: (c: Cell, x: number, y: number) => Partial<Palette> | undefined): void {
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const c = cellAt(x, y);
    const pal = { ...MOSAIC, ...(tint?.(c, x, y) ?? {}) };
    if (c.kind === "grout") { p.px(x, y, pal.grout); continue; }
    if (c.kind === "dot") { p.px(x, y, c.u === 7 && c.v === 0 ? pal.inkLit : pal.ink); continue; }
    const aged = hash(c.key, 3, seed) < 0.14;
    const lit = cellAt(x, y - 1).kind !== "cell" && c.u < 5;
    p.px(x, y, aged ? pal.aged : lit ? pal.lit : pal.cream);
  }
}

/**
 * The border band that runs round the mosaic where it meets the walls, `depth` px in from the wall
 * and `along` px along it: plain cream strip tiles, an ink line, a row of ink dentils, an ink line,
 * more strip tiles. 16px deep, so the mosaic resumes on its 8px grid.
 */
export function bandColor(depth: number, along: number): Color {
  const strip = (d: number) => (d === 0 || along % 8 === 0 ? "cream3" : d === 1 ? "cream5" : "cream4");
  switch (depth) {
    case 0: case 4: case 11: case 15: return "cream3";
    case 1: case 2: case 3: return strip(depth - 1);
    case 12: case 13: case 14: return strip(depth - 12);
    case 5: case 10: return "stone2";
    case 7: case 8: return along % 4 < 2 ? "stone2" : "cream4";
    default: return "cream4";
  }
}

/** A border tile with the band on the given sides (n = wall to the north, …) and mosaic elsewhere. */
export function border(p: Px, sides: readonly ("n" | "s" | "w" | "e")[], seed: number): void {
  mosaic(p, seed);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const options = sides.map((s) => (s === "n" ? [y, x] : s === "s" ? [31 - y, x] : s === "w" ? [x, y] : [31 - x, y]) as [number, number]);
    const near = options.filter(([d]) => d < 16).sort((a, b) => a[0] - b[0])[0];
    if (near) p.px(x, y, bandColor(near[0], near[1]));
  }
}
