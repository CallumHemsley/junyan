/**
 * Private helpers for the back wall, its caps and windows. Not a sprite set.
 *
 * Back wall slice, 16×48, rows:
 *   0–4   cap: the wall top seen from above (outer edge, plaster core, lit lip, inner edge)
 *   5–30  plaster (5–7 the soft shadow under the cap)
 *   31–43 dado: tea-wood rail (31–32), shadow (33), one recessed jade panel per slice (34–43)
 *   44–47 tea-wood skirting
 */
import type { Legend, Px } from "../../kit/index.ts";

/** Stamp a hand-drawn block, checking the row count and every row's width. */
export function block(p: Px, x: number, y: number, w: number, h: number, rows: readonly string[], legend: Legend, name = "block"): void {
  if (rows.length !== h) throw new Error(`${name}: ${rows.length} rows, expected ${h}`);
  rows.forEach((row, i) => {
    if (row.length !== w) throw new Error(`${name}: row ${i} "${row}" is ${row.length} wide, expected ${w}`);
  });
  p.rows(x, y, rows, legend);
}

/**
 * Wall-top (cap) legend shared by the back-wall cap rows and the cap tiles.
 * `v` void outside the room, `1` outer/inner edge, `2` timber plate, `3` lit lip, `4` glint,
 * `p` plaster core, `P` plaster fleck, `q` plaster pit.
 */
export const CAP: Legend = { v: "ink", o: "ink2", 1: "wood1", 2: "wood2", 3: "wood3", 4: "wood4", p: "cream1", P: "cream2", q: "stone2" };

/** The back wall's cap, rows 0–4: outer edge, two rows of plaster core, the lit lip, the inner edge. */
export function backCap(p: Px, variant = 0): void {
  const caps = [
    [
      "1111111111111111",
      "pppppppppppppppp",
      "pppppppPPppppppp",
      "3333433333333343",
      "1111111111111111",
    ],
    [
      "1111111111111111",
      "ppPPpppppppppppp",
      "pppppppppppppppp",
      "3343333333333333",
      "1111111111111111",
    ],
  ];
  block(p, 0, 0, 16, 5, caps[variant % caps.length], CAP, "back-cap");
}

/** Plaster legend: `c` body, `C` lit trowel ridge, `k` shade, `K` deep shade and cracks, `W` palest. */
export const PLASTER: Legend = { W: "cream5", C: "cream5", c: "cream4", k: "cream3", K: "cream2", n: "stone2", w: "white" };

/** Rows 5–30: plaster with the soft shadow of the cap above it and a few trowel marks. */
export function plaster(p: Px, marks: readonly (readonly [number, number, number])[] = []): void {
  p.rect(0, 5, 16, 26, "cream4");
  p.hline(0, 5, 16, "cream2");
  p.hline(0, 6, 16, "cream3");
  block(p, 0, 7, 16, 1, ["kkkk..kk...kkk.."], PLASTER, "cap-shadow");
  // Lit trowel ridges (0–2) and a rare shallow pit (3). Strokes run with the trowel, never single pixels.
  const motifs = [
    ["CCCC"],
    ["CC..", ".CCC"],
    [".CCC", "CC.."],
    ["kk"],
  ];
  for (const [x, y, m] of marks) p.rows(x, y, motifs[m], PLASTER);
}

/** Dado legend: tea-wood rail, jade paint. */
export const DADO: Legend = { 5: "wood5", 4: "wood4", 3: "wood3", 2: "wood2", 1: "wood1", a: "jade2", b: "jade3", c: "jade4", d: "jade5", e: "jade1", w: "wood4", x: "wood3" };

/** The clean dado, rows 31–43: rail, its shadow, a recessed panel between two half-stiles. */
export const DADO_ROWS = [
  "4444444444444444",
  "3333333333333333",
  "aaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbb",
  "bbaaaaaaaaaaaabb",
  "bbabcccbbbbbbcbb",
  "bbacbbbbbbbbbcbb",
  "bbabbbbbbbbbbcbb",
  "bbabbbbbbbbbbcbb",
  "bbabbbbbbbbbbcbb",
  "bbabbbbbbbbbbcbb",
  "bbacccccccccccbb",
  "bbbbbbbbbbbbbbbb",
] as const;

export function dado(p: Px, rows: readonly string[] = DADO_ROWS): void {
  block(p, 0, 31, 16, 13, rows, DADO, "dado");
}

export const SKIRTING_ROWS = [
  "4444444444444444",
  "3333333333333333",
  "3333333333333333",
  "1111111111111111",
] as const;

export function skirting(p: Px, rows: readonly string[] = SKIRTING_ROWS): void {
  block(p, 0, 44, 16, 4, rows, DADO, "skirting");
}

/** A whole clean dining-wall slice. */
export function diningWall(p: Px, marks: readonly (readonly [number, number, number])[], capVariant = 0): void {
  backCap(p, capVariant);
  plaster(p, marks);
  dado(p);
  skirting(p);
}
