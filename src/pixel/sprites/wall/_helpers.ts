/**
 * Private helpers for the back wall, its caps and windows. Not a sprite set.
 *
 * Back wall slice, 32×96, rows (a 1930s Concession bistro):
 *   0–5   cap: the wall top seen from above (dark timber, one lit line on the inner edge)
 *   6–9   cornice moulding on the wall face
 *   10–57 plaster (10–13 the soft shadow under the cornice)
 *   58–87 dark-stained wainscot: moulded top rail (58–62), one raised panel per slice (63–87)
 *   88–95 dark skirting
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

// ── caps ─────────────────────────────────────────────────────────────────────

/** Wall-top colours by profile letter: edge, timber plate, plaster core, lit lip, glint. */
export const CAP: Legend = { v: "ink", 1: "wood1", 2: "wood2", 3: "wood3", 4: "wood4", 5: "wood5", p: "cream1", P: "cream2", q: "wood1", n: "wood1" };

/** The side-cap profile, outer edge to inner edge, 16px: dark timber, one lit line on the inner edge. */
export const SIDE_PROFILE = "1222222222222241";
/** The back cap, rows 0–5, outer (north) to inner. */
export const BACK_PROFILE = "122241";
/** The front cap, rows 0–9, inner (north, against the floor) to outer. */
export const FRONT_PROFILE = "1422222221";

/**
 * Texture laid along a cap run, by position along the run (`t`) and across it (profile index `i`).
 * Returns a replacement profile letter or the original.
 */
export function capTexture(letter: string, t: number, i: number, seed: number): string {
  // Long, quiet grain in the timber: a darker run now and then, aligned to 8px so it never cuts at a seam.
  if (letter === "2" && i % 3 === 1 && hash(t >> 3, i, seed + 1) > 0.72) return "1";
  return letter;
}

// ── plaster ──────────────────────────────────────────────────────────────────

export const PLASTER: Legend = {
  W: "white", C: "cream5", c: "cream4", k: "cream3", K: "cream2", m: "cream1",
  n: "stone2", N: "stone1", s: "stone3", y: "bamboo4", Y: "bamboo3", z: "bamboo2", r: "red3", R: "red2",
};

/** The cap (rows 0–5) and cornice moulding (6–9). */
export function capAndCornice(p: Px, seed: number): void {
  for (let x = 0; x < 32; x++) for (let y = 0; y < 6; y++) p.px(x, y, CAP[capTexture(BACK_PROFILE[y], x, y, seed)] as Color);
  p.hline(0, 6, 32, "wood2").hline(0, 7, 32, "wood4").hline(0, 8, 32, "wood3").hline(0, 9, 32, "wood1");
  // The bead of the moulding catches the sun in broken runs; small dentil shadows under it.
  for (let x = 0; x < 32; x++) if (hash(x >> 2, 7, seed) > 0.4) p.px(x, 7, "wood5");
  for (let x = 1; x < 32; x += 4) p.px(x, 8, "wood2");
}

/**
 * Plaster rows 10–57: flat lime wash under the cornice's soft shadow. Deliberately quiet; the stories
 * on the wall (crack, ghost rectangle, patch, stain, switch) carry the interest. Light washes of any
 * shape were tried and read as clouds or drips at play zoom, so the field stays one tone.
 */
export function plaster(p: Px, seed: number): void {
  p.rect(0, 10, 32, 48, "cream4");
  p.hline(0, 10, 32, "cream2").hline(0, 11, 32, "cream3").hline(0, 12, 32, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 13, seed) > 0.45) p.px(x, 13, "cream3");
  // Grime gathers faintly just above the rail, where hands and chair backs reach.
  for (let x = 0; x < 32; x++) if (hash(x >> 2, 57, seed) > 0.5) p.px(x, 57, "cream3");
}

// ── dado and skirting ────────────────────────────────────────────────────────

/** Colours of one raised panel: field, its lit and shaded bevels, and the recess lines round it. */
export type PanelTone = { field: Color; lit: Color; shade: Color; grain: Color };
export const DARK_PANEL: PanelTone = { field: "wood2", lit: "wood3", shade: "wood1", grain: "wood3" };
/** A panel replaced after a stool went through it: paler, newer wood that was never stained to match. */
export const PALE_PANEL: PanelTone = { field: "wood3", lit: "wood4", shade: "wood2", grain: "wood4" };

/**
 * Dark-stained wainscot, rows 58–87: a moulded top rail (lit top, bead, shadow), then a frame with
 * one raised panel per slice. The panel's bevels are mitred, lit top-left and shaded bottom-right; the
 * recess line round it is the reverse. Varnish holds a long soft highlight on the frame.
 */
export function wainscot(p: Px, seed: number, panel: PanelTone = DARK_PANEL): void {
  p.hline(0, 58, 32, "wood4").hline(0, 59, 32, "wood3").hline(0, 60, 32, "wood2").hline(0, 61, 32, "wood3").hline(0, 62, 32, "wood1");
  for (let x = 0; x < 32; x++) if (hash(x >> 3, 58, seed) > 0.55) p.px(x, 58, "wood5");
  p.rect(0, 63, 32, 25, "wood2");
  p.hline(0, 63, 32, "wood1").hline(0, 64, 32, "wood3");
  const left = 4, right = 27, top = 67, bottom = 83;
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    const dl = x - left, dr = right - x, dt = y - top, db = bottom - y;
    const d = Math.min(dl, dr, dt, db);
    const side = d === dt ? "t" : d === dl ? "l" : d === db ? "b" : "r";
    const upLeft = side === "t" || side === "l";
    let c: Color;
    if (d === 0) c = upLeft ? "wood1" : "wood3";
    else if (d <= 2) c = upLeft ? panel.lit : panel.shade;
    else c = panel.field;
    p.px(x, y, c);
  }
  // Grain in the field: long quiet vertical streaks.
  for (let i = 0; i < 2; i++) {
    const x = 9 + i * 8 + Math.floor(hash(i, 1, seed) * 5), y = 71 + Math.floor(hash(i, 2, seed) * 3);
    p.vline(x, y, 6 + Math.floor(hash(i, 3, seed) * 4), panel.grain);
  }
  // Varnish catching the light on the stiles, and the bottom rail darkening toward the floor.
  for (const x of [1, 29]) p.vline(x, 66, 6 + Math.floor(hash(x, 0, seed) * 8), "wood3");
  p.hline(0, 86, 32, "wood1");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 87, seed) > 0.5) p.px(x, 87, "wood1");
}

export function skirting(p: Px, seed: number): void {
  p.hline(0, 88, 32, "wood3").rect(0, 89, 32, 4, "wood2").rect(0, 93, 32, 2, "wood1").hline(0, 95, 32, "ink");
  p.hline(Math.floor(hash(seed, 1, 2) * 16), 90, 9, "wood3");
  // A shoe scuff or two near the floor.
  p.hline(3 + Math.floor(hash(seed, 9, 1) * 20), 92, 3, "wood1");
}

/** A complete, quiet dining-wall slice. */
export function diningWall(p: Px, seed: number): void {
  capAndCornice(p, seed);
  plaster(p, seed);
  wainscot(p, seed);
  skirting(p, seed);
}

// ── kitchen tiles ────────────────────────────────────────────────────────────

/**
 * White glazed wall tiles, 16×8 on a stone grout grid (15×7 visible), each course offset by half a tile.
 * `face(x, y)` may tint individual tiles (grease, a replacement); it receives the tile's column and course.
 */
export function wallTiles(p: Px, top: number, bottom: number, course0: number, face?: (col: number, course: number) => { lit: Color; face: Color; shade: Color; grout?: Color } | undefined): void {
  for (let y = top, course = course0; y <= bottom; y += 8, course++) {
    const offset = course % 2 ? 8 : 0;
    for (let col = -1; col < 3; col++) {
      const x0 = col * 16 + offset;
      const t = face?.(col, course) ?? { lit: "white" as Color, face: "cream5" as Color, shade: "cream4" as Color };
      const grout = t.grout ?? "stone4";
      p.clip(0, y, 32, Math.min(8, bottom - y + 1), (q) => {
        q.rect(x0, 0, 15, 7, t.face);
        q.hline(x0, 0, 14, t.lit).vline(x0, 1, 2, t.lit);
        q.hline(x0 + 1, 6, 14, t.shade).vline(x0 + 14, 3, 3, t.shade);
        // The window's reflection, a little different on alternate tiles.
        if ((col + course) % 2) q.hline(x0 + 3, 2, 3, "white").px(x0 + 2, 3, "white");
        else q.px(x0 + 4, 2, "white").px(x0 + 3, 3, "white").px(x0 + 2, 4, "white");
        q.vline(x0 + 15, 0, 8, grout).hline(x0, 7, 16, grout);
      });
    }
  }
}

/** Kitchen cap, cornice, plaster band (10–17), metro tiles (18–57), black trim course (58–62), tiles (63–87), black skirting tiles. */
export function kitchenWall(p: Px, seed: number, face?: Parameters<typeof wallTiles>[4]): void {
  capAndCornice(p, seed);
  p.rect(0, 10, 32, 8, "cream4");
  p.hline(0, 10, 32, "cream2").hline(0, 11, 32, "cream3").hline(0, 12, 32, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 13, seed) > 0.45) p.px(x, 13, "cream3");
  wallTiles(p, 18, 57, 0, face);
  p.hline(0, 17, 32, "cream3");
  // Black glazed trim course: a lit top edge, a gloss streak, its own grout joints.
  p.hline(0, 58, 32, "steel3").rect(0, 59, 32, 3, "steel1").hline(0, 62, 32, "stone3");
  for (let x = 0; x < 32; x++) if (hash(x >> 3, 59, seed) > 0.5) p.px(x, 59, "steel2");
  for (const x of [7, 23]) p.vline(x, 58, 4, "stone3");
  wallTiles(p, 63, 87, 1, face);
  // Black skirting tiles.
  p.hline(0, 88, 32, "steel3").rect(0, 89, 32, 5, "steel1").hline(0, 94, 32, "ink").hline(0, 95, 32, "ink");
  p.hline(2, 89, 9, "steel2").hline(19, 89, 7, "steel2");
  for (const x of [15, 31]) p.vline(x, 88, 7, "stone3");
}
