/**
 * Private helpers for the back wall, its caps and windows. Not a sprite set.
 *
 * Back wall slice, 32×96, rows:
 *   0–5   cap: the wall top seen from above (outer edge, timber plate, plaster core, lit lip, inner edge)
 *   6–9   cornice moulding on the wall face
 *   10–61 plaster (10–13 the soft shadow under the cornice)
 *   62–87 dado: tea-wood rail (62–65), its shadow, one fielded jade panel per slice (67–85), grime (86–87)
 *   88–95 tea-wood skirting
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

/** The side-cap profile, outer edge to inner edge, 16px: plate, core, lipped inner plate. */
export const SIDE_PROFILE = "12221pppp1234421";
/** The back cap, rows 0–5, outer (north) to inner. */
export const BACK_PROFILE = "12pp41";
/** The front cap, rows 0–9, inner (north, against the floor) to outer. */
export const FRONT_PROFILE = "1243ppp221";

/**
 * Texture laid along a cap run, by position along the run (`t`) and across it (profile index `i`):
 * grain streaks in the plates, flecks and hairline cracks in the plaster, glints on the lip.
 * Returns a replacement profile letter or the original.
 */
export function capTexture(letter: string, t: number, i: number, seed: number): string {
  const r = hash(t >> 2, i, seed);
  if (letter === "2" && hash(t >> 3, i, seed + 1) > 0.7) return "1";
  if (letter === "p" && hash(t >> 1, i, seed + 2) > 0.94) return "P";
  if (letter === "4" && r > 0.75) return "5";
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
 * Plaster rows 10–61 with the cornice's shadow and trowel strokes. Strokes are 4–9px runs, lit (the
 * ridge a trowel leaves) or shaded (the hollow beside it), placed from `seed` so every slice differs.
 */
export function plaster(p: Px, seed: number, strokes = 7): void {
  p.rect(0, 10, 32, 52, "cream4");
  p.hline(0, 10, 32, "cream2").hline(0, 11, 32, "cream3").hline(0, 12, 32, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 13, seed) > 0.45) p.px(x, 13, "cream3");
  for (let i = 0; i < strokes; i++) {
    const x = 1 + Math.floor(hash(i, 0, seed) * 22), y = 16 + Math.floor(hash(i, 1, seed) * 42);
    const n = 5 + Math.floor(hash(i, 2, seed) * 6), lit = hash(i, 3, seed) > 0.2;
    // A soft lit cluster (lime wash laid thicker) or, rarely, a shallow trowel hollow.
    if (lit) p.hline(x + 2, y, n - 3, "cream5").hline(x, y + 1, n, "cream5").hline(x + 1, y + 2, n - 2, "cream5");
    else p.hline(x, y, n - 1, "cream3").hline(x + 2, y + 1, n - 4, "cream3");
  }
}

// ── dado and skirting ────────────────────────────────────────────────────────

/** Rail and fielded panel. The panel's bevels are mitred at the corners and lit from the upper left. */
export function dado(p: Px, seed: number): void {
  p.hline(0, 62, 32, "wood5").hline(0, 63, 32, "wood4").hline(0, 64, 32, "wood3").hline(0, 65, 32, "wood2");
  for (let x = 0; x < 32; x++) if (hash(x >> 3, 62, seed) > 0.6) p.px(x, 62, "wood6");
  p.hline(0, 66, 32, "jade1");
  p.rect(0, 67, 32, 19, "jade3").hline(0, 67, 32, "jade2");
  // Panel: recess x4–27, rows 70–84. Edge distance picks recess line, bevel or field.
  const left = 4, right = 27, top = 70, bottom = 84;
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    const dl = x - left, dr = right - x, dt = (y - top), db = bottom - y;
    const d = Math.min(dl, dr, dt, db);
    // Which edge is nearest decides the plane (ties resolve as a mitre toward top/left).
    const side = d === dt ? "t" : d === dl ? "l" : d === db ? "b" : "r";
    let c: Color;
    if (d === 0) c = side === "t" || side === "l" ? "jade2" : "jade4";
    else if (d <= 2) c = side === "t" || side === "l" ? "jade4" : "jade2";
    else c = "jade3";
    p.px(x, y, c);
  }
  // Sun-faded paint on the upper stiles.
  for (const x of [1, 30]) p.vline(x, 69, 4 + Math.floor(hash(x, 0, seed) * 8), "jade4");
  // Grime gathering toward the floor.
  p.hline(0, 86, 32, "jade2").hline(0, 87, 32, "jade2");
  for (let x = 0; x < 32; x++) if ((x + (seed & 1)) % 2 === 0) p.px(x, 85, "jade2");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 87, seed) > 0.5) p.px(x, 87, "jade1");
}

export function skirting(p: Px, seed: number): void {
  p.hline(0, 88, 32, "wood5").rect(0, 89, 32, 3, "wood4").rect(0, 92, 32, 2, "wood3").hline(0, 94, 32, "wood2").hline(0, 95, 32, "wood1");
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(hash(i, 0, seed) * 22), y = 89 + Math.floor(hash(i, 1, seed) * 4);
    p.hline(x, y, 5 + Math.floor(hash(i, 2, seed) * 6), y < 91 ? "wood5" : "wood3");
  }
  // A shoe scuff or two near the floor.
  p.hline(3 + Math.floor(hash(seed, 9, 1) * 20), 93, 3, "wood2");
}

/** A complete, quiet dining-wall slice. */
export function diningWall(p: Px, seed: number, strokes = 7): void {
  capAndCornice(p, seed);
  plaster(p, seed, strokes);
  dado(p, seed);
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

/** Kitchen cap, cornice, plaster band (10–21), tiles (22–61), jade trim (62–66), tiles (67–87), jade cove skirting. */
export function kitchenWall(p: Px, seed: number, face?: Parameters<typeof wallTiles>[4]): void {
  capAndCornice(p, seed);
  p.rect(0, 10, 32, 12, "cream4");
  p.hline(0, 10, 32, "cream2").hline(0, 11, 32, "cream3").hline(0, 12, 32, "cream3");
  for (let x = 0; x < 32; x++) if (hash(x >> 1, 13, seed) > 0.45) p.px(x, 13, "cream3");
  p.hline(3 + Math.floor(hash(seed, 1, 3) * 16), 16, 6, "cream5");
  wallTiles(p, 22, 61, 0, face);
  // Bullnose: the top course turns over toward the plaster.
  p.hline(0, 21, 32, "cream3");
  // Jade pencil trim, with its own grout joints.
  p.hline(0, 62, 32, "jade6").hline(0, 63, 32, "jade5").hline(0, 64, 32, "jade4").hline(0, 65, 32, "jade3").hline(0, 66, 32, "stone3");
  for (const x of [7, 23]) p.vline(x, 62, 4, "jade2");
  wallTiles(p, 67, 87, 1, face);
  // Cove skirting tiles in deep jade.
  p.hline(0, 88, 32, "jade5").rect(0, 89, 32, 4, "jade3").rect(0, 93, 32, 2, "jade2").hline(0, 95, 32, "jade1");
  p.hline(2, 89, 9, "jade4").hline(19, 89, 7, "jade4");
  for (const x of [15, 31]) p.vline(x, 88, 8, "stone3");
}
