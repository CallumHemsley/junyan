/**
 * Private helpers for the ward's architecture (ticket 0171). Not a sprite set.
 *
 * The ward is a 1980s wing of an old Shanghai hospital: brick walls plastered and limewashed cream,
 * a jade gloss-paint dado to waist height that has been repainted every few years, a painted timber
 * dado rail, terrazzo floors laid in one-metre panels between brass divider strips, and a terrazzo
 * cove skirting in a darker green. It is warm, worn and clean, not clinical.
 *
 * Back wall slice, 32×96, rows (same frame as the bistro's, so the scene composes the same way):
 *   0–5   cap: the wall top seen from above (cement grey, the cream face's lip catching the sun)
 *   6–9   plaster coving where the wall meets the ceiling
 *   10–53 cream limewash (10–12 the soft shadow under the coving)
 *   54–57 painted timber dado rail
 *   58–89 jade gloss paint
 *   90–95 terrazzo cove skirting
 */
import { hash, type Color, type Legend, type Px } from "../../kit/index.ts";

/** Stamp a hand-drawn block, checking that every row has the same width. */
export function block(p: Px, x: number, y: number, rows: readonly string[], legend: Legend, name = "block"): void {
  const w = rows[0]?.length ?? 0;
  rows.forEach((row, i) => {
    if (row.length !== w) throw new Error(`${name}: row ${i} "${row}" is ${row.length} wide, expected ${w}`);
  });
  p.rows(x, y, rows, legend);
}

/** Back-wall rows. */
export const RAIL = 54, PAINT = 58, SKIRT = 90;
/** Where the back wall meets the floor: wall-mounted sprites anchor at this y below the slice top. */
export const WALL_FOOT = 96;
/** Anchor y for a wall-mounted sprite whose top should land on wall row `top`, placed at (x, 96). */
export const fromTop = (top: number) => WALL_FOOT - top;

export const tile = (draw: (p: Px) => void) => ({ w: 32, h: 32, anchor: [0, 0] as const, layer: "floor" as const, draw });
export const slice = (draw: (p: Px) => void) => ({ w: 32, h: 96, anchor: [0, 0] as const, layer: "floor" as const, draw });

// ── caps ─────────────────────────────────────────────────────────────────────

/** Wall-top colours by profile letter: cement edge and core, aggregate, the cream face's lit lip. */
export const CAP: Legend = { 1: "stone1", 2: "stone2", 3: "stone3", k: "cream2", K: "cream3", v: "ink" };
/** The side-cap profile, outer edge to inner edge, 16px. */
export const SIDE_PROFILE = "1222222222223kK1";
/** The back cap, rows 0–5, outer (north) to inner. */
export const BACK_PROFILE = "12223k";
/** The front cap, rows 0–9, inner (north, against the floor) to outer. */
export const FRONT_PROFILE = "1Kk3222221";

/**
 * Texture along a cap run, by position along it (`t`) and across it (profile index `i`): now and then
 * a short pale run where the cement skim has worn to its aggregate, aligned to 4px so no seam cuts one.
 */
export function capTexture(letter: string, t: number, i: number, seed: number): string {
  if (letter === "2" && i % 4 === 2 && hash(t >> 2, i, seed + 3) > 0.8) return "3";
  return letter;
}

// ── back wall ────────────────────────────────────────────────────────────────

export const WALL: Legend = {
  W: "white", C: "cream5", c: "cream4", k: "cream3", K: "cream2", m: "cream1",
  j: "jade5", J: "jade4", h: "jade3", H: "jade2", g: "jade6", G: "jade1",
  s: "stone3", S: "stone2", n: "stone1", t: "stone4", T: "stone5",
  e: "steel5", E: "steel4", f: "steel3", F: "steel2", i: "steel1", I: "steel6",
  y: "bamboo4", Y: "bamboo3", z: "bamboo2", b: "blue5", B: "blue4", o: "oak3", O: "oak2",
};

export function capAndCove(p: Px, seed: number): void {
  for (let x = 0; x < 32; x++) for (let y = 0; y < 6; y++) p.px(x, y, CAP[capTexture(BACK_PROFILE[y], x, y, seed)] as Color);
  // Plaster coving: a dark crease against the ceiling, the curve lit, then turning down into the wall.
  p.hline(0, 6, 32, "cream1").hline(0, 7, 32, "cream5").hline(0, 8, 32, "cream4").hline(0, 9, 32, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 3, 7, seed) > 0.7) p.px(x, 7, "white");
}

/**
 * Cream limewash, rows 10–53, one quiet tone (washes read as clouds at play zoom; the stories on the
 * wall carry the interest), under the coving's soft shadow, with a faint grey line just above the
 * rail where hands, chair backs and the backs of heads have rested.
 */
export function plaster(p: Px, seed: number): void {
  p.rect(0, 10, 32, RAIL - 10, "cream4");
  p.hline(0, 10, 32, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 11, seed) > 0.4) p.px(x, 11, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 2, 53, seed) > 0.55) p.px(x, 53, "cream3");
}

/**
 * The dado rail, rows 54–57: a timber moulding painted the dado's darker jade, lit on its rounded top.
 * The rail takes every knock, so the paint is chipped back to the undercoat here and there.
 */
export function rail(p: Px, seed: number): void {
  p.hline(0, 54, 32, "jade4").hline(0, 55, 32, "jade3").hline(0, 56, 32, "jade2").hline(0, 57, 32, "jade1");
  for (let x = 0; x < 32; x++) if (hash(x >> 3, 54, seed) > 0.45) p.px(x, 54, "jade5");
  // A knock now and then has chipped the paint to the cream undercoat on the rail's nose.
  if (hash(seed, 5, 1) > 0.6) {
    const x = 3 + Math.floor(hash(seed, 6, 1) * 24);
    p.px(x, 55, "cream4").px(x + 1, 55, "cream3").px(x + 1, 56, "jade1");
  }
}

/**
 * The jade gloss dado, rows 58–89. Gloss holds the window as two or three long soft streaks; the
 * rail throws a shade just under itself; the bottom darkens a step where mops and feet have dulled it.
 */
export function paint(p: Px, seed: number): void {
  p.rect(0, PAINT, 32, SKIRT - PAINT, "jade5");
  p.hline(0, PAINT, 32, "jade4");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, PAINT + 1, seed) > 0.55) p.px(x, PAINT + 1, "jade4");
  // Gloss: on some slices one long soft streak where the window catches the paint; never on all of
  // them, or the dado reads as a pattern of dashes.
  if (hash(seed, 1, 7) > 0.45) {
    const y = PAINT + 6 + Math.floor(hash(seed, 2, 7) * 10);
    const x = Math.floor(hash(seed, 3, 7) * 12), n = 10 + Math.floor(hash(seed, 4, 7) * 12);
    p.hline(x, y, Math.min(n, 32 - x), "jade6");
    p.hline(x + 3, y + 1, Math.max(0, Math.min(n - 7, 29 - x)), "jade6");
  }
  for (let x = 0; x < 32; x++) if (hash(x >> 2, 88, seed) > 0.5) p.px(x, 88, "jade4");
  p.hline(0, 89, 32, "jade4");
}

/** Terrazzo cove skirting, rows 90–95: the floor's green border turning up the wall. */
export function skirting(p: Px, seed: number): void {
  p.hline(0, 90, 32, "jade5").rect(0, 91, 32, 3, "jade4").hline(0, 94, 32, "jade3").hline(0, 95, 32, "jade2");
  for (let x = 0; x < 32; x++) if (hash(x >> 2, 90, seed) > 0.6) p.px(x, 90, "jade6");
  // Chips in the cove, in small pairs.
  for (let i = 0; i < 4; i++) {
    const x = 2 + i * 8 + Math.floor(hash(i, 91, seed) * 5), y = 91 + Math.floor(hash(i, 92, seed) * 2);
    const c: Color = hash(i, 93, seed) > 0.5 ? "jade5" : "stone5";
    p.px(x, y, c).px(x + 1, y, c);
  }
}

/** A complete quiet ward-wall slice. */
export function wardWall(p: Px, seed: number): void {
  capAndCove(p, seed);
  plaster(p, seed);
  rail(p, seed);
  paint(p, seed);
  skirting(p, seed);
}

/** One step darker, for the soft occlusion where the back wall meets a side wall. */
export const DOWN: Partial<Record<Color, Color>> = {
  white: "cream5", cream5: "cream4", cream4: "cream3", cream3: "cream2", cream2: "cream1",
  jade6: "jade5", jade5: "jade4", jade4: "jade3", jade3: "jade2", jade2: "jade1",
  stone5: "stone4", stone4: "stone3", stone3: "stone2", oak4: "oak3", oak3: "oak2",
};

/** Soft occlusion in the room's corner. `depth[i]` is how far down column i darkens from row 10. */
export function cornerShadow(p: Px, side: "left" | "right"): void {
  const at = (i: number) => (side === "left" ? i : 31 - i);
  const depth = side === "left" ? [80, 80, 62, 40, 20] : [80, 60, 30];
  depth.forEach((rows, i) => {
    for (let y = 10; y < 10 + rows && y < 90; y++) {
      if (i > 0 && y > 10 + rows - 6 && (y + i) % 2 === 1) continue;
      const c = p.get(at(i), y);
      if (c && DOWN[c as Color]) p.px(at(i), y, DOWN[c as Color]!);
    }
  });
}

// ── floor ────────────────────────────────────────────────────────────────────

/**
 * Terrazzo: cement with marble chips, ground flat and waxed, cast in one-metre (32px) panels between
 * brass divider strips (gone grey under forty years of wax). The strips run along each tile's top row and left column, so any mix of
 * variants tiles into one grid. Chips sit in a jittered 5×5 grid, never within a pixel of a strip.
 */
export type Terrazzo = { base: Color; chips: readonly Color[]; strip: Color };
export const FLOOR: Terrazzo = {
  base: "stone5",
  // Weighted by repetition: mostly quiet greys and white marble, a little jade.
  chips: ["stone4", "stone4", "stone4", "white", "white", "white", "cream5", "jade5"],
  strip: "stone4",
};
/** The darker green terrazzo of the border band and skirting. */
export const BAND: Terrazzo = { base: "jade4", chips: ["jade5", "jade5", "jade3", "jade6", "stone5"], strip: "jade3" };

const CHIP_SHAPES: readonly (readonly [number, number])[][] = [
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [1, 1]],
  [[1, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1]],
];

/** Chips inside a region (tile px). `keep(x, y)` may veto a pixel (a strip, a patch). */
export function chips(p: Px, seed: number, t: Terrazzo, x0: number, y0: number, w: number, h: number, density = 0.42, keep: (x: number, y: number) => boolean = () => true): void {
  const cell = 6;
  for (let cy = y0; cy + 3 <= y0 + h; cy += cell) for (let cx = x0; cx + 3 <= x0 + w; cx += cell) {
    if (hash(cx, cy, seed) > density) continue;
    const shape = CHIP_SHAPES[Math.floor(hash(cx, cy, seed + 1) * CHIP_SHAPES.length)];
    const c = t.chips[Math.floor(hash(cx, cy, seed + 2) * t.chips.length)];
    const ox = cx + Math.floor(hash(cx, cy, seed + 3) * (cell - 3)), oy = cy + Math.floor(hash(cx, cy, seed + 4) * (cell - 3));
    for (const [dx, dy] of shape) {
      const x = ox + dx, y = oy + dy;
      if (x >= x0 && x < x0 + w && y >= y0 && y < y0 + h && keep(x, y)) p.px(x, y, c);
    }
  }
}

/** A terrazzo panel filling the tile, with its strips on the top row and left column. */
export function terrazzo(p: Px, seed: number, t: Terrazzo = FLOOR): void {
  p.rect(0, 0, 32, 32, t.base);
  chips(p, seed, t, 2, 2, 29, 29);
  strips(p, t);
}

/**
 * The divider strips, top row and left column: brass gone grey under the wax. (A gold glint at a fixed
 * spot was tried and repeated into a dot grid across the room; the glints live on the border band and
 * the worn track instead.)
 */
export function strips(p: Px, t: Terrazzo = FLOOR): void {
  p.hline(0, 0, 32, t.strip).vline(0, 0, 32, t.strip);
}
