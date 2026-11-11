/**
 * The player's head (ticket 0193 pass three, landed in 0194): a round, friendly head on the cast's
 * proportions (about 24 wide and 25 tall with the hair, chin on the collar), with big hair masses.
 * Shared by `char/player` and `char/patient` (the same young man, before the apron).
 *
 * Hair is a few chunky clumps laid out pixel by pixel as row spans, not strands: from the front a
 * clump left of the parting over the near temple, two fringe clumps sweeping toward screen-left with
 * their tips over the forehead, a side clump over the far ear, and the cowlick. Two rules shade it:
 * the underside and the right-hand edge of every clump step down to `hair1` (the sun is upper left),
 * and each clump gets one bold highlight shape, a `hair3` crescent with a `stone2` core on the lit
 * side. Short separation lines in `hair1` split the clumps where they meet.
 *
 * The face has six expressions (neutral, happy, surprised, puzzled, embarrassed, laugh) with brows
 * that move per expression, eyes 2 wide and 4 tall with a catch-light, and blush.
 */
import type { Color, Px } from "../../kit/index.ts";
import type { Expr, Eyes } from "./_hero-poses.ts";

export type HeadFrame = { bob: number; nod: number; tip: number; lean: number; expr: Expr; eyes: Eyes };
type Span = readonly [number, number];
type Grid = string[][];

const ROWS = 36;
const blank = (): Grid => Array.from({ length: ROWS }, () => Array<string>(32).fill("."));
const isHair = (c: string | undefined) => c === "h" || c === "d" || c === "H" || c === "L";

function cover(g: Grid, spans: Record<number, readonly Span[]>, ch = "h"): void {
  for (const [row, list] of Object.entries(spans)) for (const [a, b] of list) for (let x = a; x <= b; x++) g[Number(row)][x] = ch;
}
function dots(g: Grid, ch: string, pts: readonly (readonly [number, number])[]): void {
  for (const [x, y] of pts) if (isHair(g[y][x])) g[y][x] = ch;
}
/** A continuous separation line in `hair1`, only over hair. */
function seg(g: Grid, x0: number, y0: number, x1: number, y1: number, ch = "d"): void {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
    if (isHair(g[y][x])) g[y][x] = ch;
  }
}
/** Highlight spans: `[row, x0, x1, ch]`. */
function shine(g: Grid, list: readonly (readonly [number, number, number, string])[]): void {
  for (const [y, a, b, ch] of list) for (let x = a; x <= b; x++) if (isHair(g[y][x])) g[y][x] = ch;
}
/** Underside and right-hand rims of the clumps step down a tone. */
function rim(g: Grid, from: number): void {
  const src = g.map((r) => [...r]);
  for (let y = from; y < ROWS - 1; y++) for (let x = 0; x < 32; x++) {
    if (src[y][x] !== "h") continue;
    if (!isHair(src[y + 1][x]) || !isHair(src[y][x + 1])) g[y][x] = "d";
  }
}

const HAIR: Record<string, Color> = { h: "hair2", d: "hair1", H: "hair3", L: "stone2" };

/** Paint the hair grid; rows from `split` down hang free and ride `tip` pixels behind. */
function paintHair(p: Px, g: Grid, x0: number, y: number, split: number, tip: number): void {
  const row = (r: number, dy: number) => {
    for (let x = 0; x < 32; x++) { const c = g[r][x]; if (c !== ".") p.px(x + x0, r + dy, HAIR[c]); }
  };
  for (let r = 0; r < ROWS; r++) if (r < split) row(r, y);
  for (let r = split; r < ROWS; r++) row(r, y + tip);
  // Bridge the gap when the tips lag downward.
  for (let k = 0; k < tip; k++) row(split, y + k);
}

// ── front ─────────────────────────────────────────────────────────────────

const COWLICK: Record<number, readonly Span[]> = { 1: [[21, 22]], 2: [[20, 21], [23, 23]], 3: [[19, 20], [23, 23]], 4: [[19, 20]], 5: [[18, 19]] };

const FRONT = (() => {
  const g = blank();
  cover(g, {
    ...COWLICK,
    // A front clump breaks the top edge left of the parting; two-deep notches at the parting, between
    // the fringe clumps and above the side tufts keep the outline lumpy, not a bowl.
    5: [[9, 11], [18, 19]],
    6: [[8, 11], [14, 16], [18, 19]], 7: [[7, 11], [13, 23]], 8: [[6, 25]], 9: [[5, 26]],
    10: [[4, 27]], 11: [[6, 27]], 12: [[4, 27]], 13: [[4, 26]], 14: [[4, 25]],
    15: [[4, 15], [17, 25]],
    16: [[4, 7], [10, 14], [17, 21], [23, 27]],
    17: [[4, 7], [10, 13], [17, 20], [24, 27]],
    18: [[4, 6], [10, 11], [17, 18], [25, 27]],
    19: [[4, 6], [25, 27]],
    20: [[4, 6], [25, 27]],
    21: [[4, 5], [26, 27]],
  });
  rim(g, 12);
  // The parting and the splits between clumps.
  seg(g, 12, 7, 8, 15);
  seg(g, 17, 8, 16, 14);
  seg(g, 23, 10, 22, 15);
  // One highlight per clump: a hair3 crescent along its upper-left curve, a stone2 core when lit.
  shine(g, [
    [8, 8, 10, "H"], [9, 6, 6, "H"], [9, 7, 9, "L"], [9, 10, 10, "H"], [10, 5, 5, "H"], [10, 6, 7, "L"], [10, 8, 8, "H"], [11, 5, 6, "H"], [12, 5, 5, "H"],
    [7, 13, 15, "H"], [8, 13, 13, "H"], [8, 14, 15, "L"], [8, 16, 16, "H"], [9, 12, 12, "H"], [9, 13, 14, "L"], [9, 15, 15, "H"], [10, 12, 13, "H"],
    [8, 18, 20, "H"], [9, 18, 18, "H"], [9, 19, 20, "L"], [9, 21, 21, "H"], [10, 17, 18, "H"], [10, 19, 19, "H"],
    [10, 24, 24, "H"], [11, 24, 25, "H"], [12, 24, 24, "H"],
    // The lit edge of each fringe tip, so the tips read as separate clumps.
    [15, 10, 10, "H"], [16, 10, 10, "H"], [15, 17, 17, "H"], [16, 17, 17, "H"], [13, 5, 5, "H"], [14, 5, 5, "H"],
    [1, 21, 21, "L"], [2, 20, 20, "H"], [3, 19, 19, "H"], [4, 19, 19, "H"],
    // The front clump that breaks the top edge.
    [5, 9, 9, "H"], [5, 10, 10, "L"], [6, 8, 8, "H"], [6, 9, 9, "L"], [7, 7, 7, "H"],
  ]);
  return g;
})();

/** Skin rows of the round front face: [first, last] column per row. */
const FACE_SPANS: Record<number, Span> = {
  11: [10, 21], 12: [8, 23], 13: [7, 24], 29: [7, 24], 30: [8, 23], 31: [9, 22], 32: [11, 20],
};
for (let r = 14; r <= 28; r++) FACE_SPANS[r] = [6, 25];

function skullFront(p: Px, y: number): void {
  // The neck stops at the collar (the head is drawn after the shirt).
  p.rect(12, 30 + y, 8, 3, "skin2");
  for (const [r, [a, b]] of Object.entries(FACE_SPANS)) {
    const row = Number(r) + y;
    p.hline(a, row, b - a + 1, "skin4");
    // The shaded side and the underside of the chin, cut by plane.
    const shade = Number(r) >= 31 ? Math.ceil((a + b) / 2) - 2 : b - 1;
    p.hline(shade, row, b - shade + 1, "skin3");
  }
  // Ears, the near one lit.
  p.rows(4, 22 + y, [".s", "Ss", "Sk", "sk", ".s"], { S: "skin4", s: "skin3", k: "skin2" });
  p.rows(26, 22 + y, ["s.", "ks", "ks", "kk", "k."], { s: "skin3", k: "skin2" });
}

const F: Record<string, Color> = { r: "hair1", e: "ink", w: "white", E: "brown2", m: "skin1", R: "red2", W: "white", b: "blush", n: "skin3", p: "pink2" };

/** One front eye, 2 wide and 4 tall at its open size, with the catch-light upper left. */
function eyeRows(f: HeadFrame, right: boolean): string[] {
  const shut = f.eyes === "shut" || f.expr === "happy" || f.expr === "laugh";
  // Both drawn from a 4-wide box: the left at x 9, the right at x 19; the lash flicks outward.
  if (shut) return ["", ".ee.", "e..e"];
  if (f.eyes === "blink") return ["", "", right ? ".eee" : "eee."];
  return right ? [".ee.", ".wee", ".ee.", ".EE."] : [".ee.", "ewe.", ".ee.", ".EE."];
}

const BROWS: Record<Expr, { l: string[]; r: string[]; dy: number }> = {
  neutral: { l: ["rrr"], r: ["rrr"], dy: 0 },
  happy: { l: [".rr", "r.."], r: ["rr.", "..r"], dy: -1 },
  surprised: { l: ["rrr"], r: ["rrr"], dy: -1 },
  puzzled: { l: ["rrr"], r: ["", "rr.", "..r"], dy: -1 },
  embarrassed: { l: ["..r", "rr."], r: ["r..", ".rr"], dy: 0 },
  laugh: { l: [".rr", "r.."], r: ["rr.", "..r"], dy: -1 },
};

const MOUTHS: Record<Expr, string[]> = {
  neutral: ["m..m", ".mm."],
  happy: ["m...m", ".mRm.", "..m.."],
  surprised: [".mm.", "mRRm", ".mm."],
  puzzled: ["...m", ".mm.", "m..."],
  embarrassed: [".m.m", "m.m."],
  laugh: ["mmmmmm", "mWWWWm", "mRppRm", ".mmmm."],
};

function faceFront(p: Px, f: HeadFrame, y: number): void {
  const e = f.expr;
  const b = BROWS[e];
  p.rows(9, 20 + b.dy + y, b.l, F);
  p.rows(20, 20 + b.dy + y, b.r, F);
  const g = f.eyes === "glance" ? 1 : e === "puzzled" ? 1 : e === "embarrassed" ? -1 : 0;
  const ey = 22 + (e === "surprised" ? -1 : 0) + y;
  p.rows(9 + g, ey, eyeRows(f, false), F);
  p.rows(19 + g, ey, eyeRows(f, true), F);
  const cheek = e === "embarrassed" ? ["bbb", ".bb"] : e === "happy" || e === "laugh" ? ["bbb"] : ["bb"];
  p.rows(e === "happy" || e === "laugh" || e === "embarrassed" ? 7 : 8, 26 + y, cheek, F);
  p.rows(22, 26 + y, cheek.map((r) => [...r].reverse().join("")), F);
  p.px(16, 26 + y, "skin3");
  const m = MOUTHS[e];
  p.rows(16 - Math.floor(m[0].length / 2), (e === "laugh" ? 27 : 28) + y, m, F);
}

// ── back ──────────────────────────────────────────────────────────────────

const BACK = (() => {
  const g = blank();
  cover(g, {
    ...COWLICK,
    6: [[10, 19]], 7: [[8, 23]], 8: [[6, 25]], 9: [[5, 26]],
    ...Object.fromEntries([10, 12, 13, 14, 15, 17, 18, 19].map((r) => [r, [[4, 27]]])),
    11: [[6, 27]], 16: [[4, 25]],
    20: [[5, 26]], 21: [[5, 26]], 22: [[6, 25]], 23: [[6, 25]], 24: [[6, 25]], 25: [[6, 25]], 26: [[7, 24]], 27: [[7, 24]], 28: [[8, 23]],
    29: [[9, 13], [14, 18], [19, 22]], 30: [[10, 12], [15, 17], [20, 21]], 31: [[16, 16]],
  });
  rim(g, 12);
  // Three hanging clumps from the crown, split by two curving lines; one big highlight across the
  // lit upper left and one on the right clump.
  seg(g, 15, 9, 12, 18); seg(g, 12, 18, 12, 29);
  seg(g, 19, 9, 20, 18); seg(g, 20, 18, 19, 29);
  shine(g, [
    [7, 9, 12, "H"], [8, 7, 7, "H"], [8, 8, 11, "L"], [8, 12, 13, "H"], [9, 6, 6, "H"], [9, 7, 9, "L"], [9, 10, 10, "H"], [10, 5, 5, "H"], [10, 6, 7, "L"], [10, 8, 8, "H"], [11, 5, 6, "H"], [12, 5, 5, "H"], [13, 5, 5, "H"],
    [9, 21, 23, "H"], [10, 21, 21, "H"], [10, 22, 23, "L"], [10, 24, 24, "H"], [11, 22, 24, "H"],
    [1, 21, 21, "L"], [2, 20, 20, "H"], [3, 19, 19, "H"], [4, 19, 19, "H"],
  ]);
  return g;
})();

function headBack(p: Px, y: number, tip: number): void {
  // A short neck: only a couple of rows show between the nape and the collar.
  p.rect(12, 28 + y, 8, 7 - y, "skin3");
  p.rect(12, 28 + y, 8, 2, "skin2");
  p.ellipse(15.5, 21 + y, 10, 10, "skin3");
  p.rows(4, 22 + y, [".s", "ss", "sk", "sk", ".k"], { s: "skin3", k: "skin2" });
  p.rows(26, 22 + y, ["k.", "kk", "kk", "kk", "k."], { k: "skin2" });
  paintHair(p, BACK, 0, y, 20, tip);
}

// ── profile, facing right ─────────────────────────────────────────────────

const SIDE = (() => {
  const g = blank();
  cover(g, {
    1: [[19, 20]], 2: [[18, 19], [21, 21]], 3: [[17, 18], [21, 21]], 4: [[17, 18]], 5: [[9, 10], [16, 17]],
    6: [[8, 11], [13, 17]], 7: [[7, 11], [13, 20]], 8: [[6, 22]], 9: [[5, 23]], 10: [[4, 24]],
    11: [[4, 25]], 12: [[4, 25]], 13: [[4, 26]], 14: [[4, 26]],
    15: [[4, 16], [18, 26]],
    16: [[5, 15], [19, 26]],
    17: [[4, 15], [20, 25]],
    18: [[4, 14], [22, 24]],
    19: [[4, 14]], 20: [[4, 13]], 21: [[4, 12]],
    22: [[4, 10]], 23: [[4, 10]], 24: [[4, 10]], 25: [[5, 10]], 26: [[6, 10]], 27: [[7, 9]], 28: [[8, 8]],
  });
  rim(g, 12);
  // Back clump, crown clump, fringe clump, the lock in front of the ear.
  seg(g, 15, 7, 7, 24);
  seg(g, 18, 9, 17, 14);
  seg(g, 12, 13, 11, 19);
  shine(g, [
    [7, 9, 12, "H"], [8, 7, 7, "H"], [8, 8, 10, "L"], [8, 11, 11, "H"], [9, 6, 6, "H"], [9, 7, 8, "L"], [9, 9, 9, "H"], [10, 5, 6, "H"], [11, 5, 5, "H"], [12, 5, 5, "H"],
    [7, 16, 18, "H"], [8, 15, 15, "H"], [8, 16, 18, "L"], [8, 19, 19, "H"], [9, 14, 14, "H"], [9, 15, 16, "L"], [9, 17, 17, "H"], [10, 13, 14, "H"],
    [10, 19, 21, "H"], [11, 19, 19, "H"], [11, 20, 21, "L"], [11, 22, 22, "H"], [12, 21, 22, "H"],
    [15, 12, 12, "H"], [16, 12, 12, "H"],
    [1, 19, 19, "L"], [2, 18, 18, "H"], [3, 17, 17, "H"], [4, 17, 17, "H"],
    [5, 9, 9, "L"], [6, 8, 8, "H"], [6, 9, 9, "L"],
  ]);
  return g;
})();

/** Profile skin: back edge and front edge per row (forehead, brow, nose, lips, chin). */
const SIDE_SPANS: Record<number, Span> = {
  11: [10, 20], 12: [8, 22], 13: [7, 23],
  24: [5, 25], 25: [5, 26], 26: [5, 25], 27: [5, 24], 28: [6, 24], 29: [8, 24], 30: [11, 23], 31: [13, 22], 32: [15, 20],
};
for (let r = 14; r <= 23; r++) SIDE_SPANS[r] = [5, 24];

function skullRight(p: Px, y: number, x: number): void {
  p.rect(12 + x, 29 + y, 7, 3, "skin2");
  for (const [r, [a, b]] of Object.entries(SIDE_SPANS)) {
    const row = Number(r) + y;
    p.hline(a + x, row, b - a + 1, "skin4");
    if (Number(r) >= 30) p.hline(a + x, row, Math.max(1, b - a - 3), "skin3");
  }
  // The back of the cheek and jaw in shade, the nose's underside.
  p.over(() => {
    p.rect(5 + x, 24 + y, 9, 7, "skin3");
    p.px(25 + x, 26 + y, "skin3").px(24 + x, 26 + y, "skin3");
  });
  // A C-shaped ear with an inner fold.
  p.rows(11 + x, 22 + y, [".kk.", "kSsk", "kSKk", "kSKk", ".kSk", "..k."], { S: "skin4", s: "skin3", k: "skin2", K: "skin1" });
}

function faceRight(p: Px, f: HeadFrame, x: number, y: number): void {
  const e = f.expr;
  const browDy = e === "surprised" || e === "happy" || e === "laugh" ? -1 : 0;
  const brow = e === "puzzled" ? ["rr..", "..rr"] : e === "embarrassed" ? ["...r", "rrr."] : ["rrrr"];
  p.rows(19 + x, 20 + browDy + y, brow, F);
  const shut = f.eyes === "shut" || e === "happy" || e === "laugh";
  const eye = shut ? ["", ".ee", "e..e"] : f.eyes === "blink" ? ["", "", "eee"] : [".ee", "ewe", ".ee", ".EE"];
  p.rows(19 + x, 22 + (e === "surprised" ? -1 : 0) + y, eye, F);
  p.rows(18 + x, 26 + y, e === "embarrassed" ? ["bbb", ".bb"] : ["bb"], F);
  const mouth: Record<Expr, string[]> = {
    neutral: ["", ".mm"],
    happy: ["..m", "mm."],
    surprised: ["..m", ".mR", "..m"],
    puzzled: ["", "mm.", "..m"],
    embarrassed: ["m.m", ".m."],
    laugh: [".mmm", ".mWW", ".mRp", "..mm"],
  };
  p.rows(21 + x, 28 + y - (e === "laugh" ? 1 : 0), mouth[e], F);
}

// ── public ────────────────────────────────────────────────────────────────

const PENCIL = { r: "red3", g: "gold2", y: "gold4", Y: "gold3", t: "wood3" } as const;

/**
 * Draw the head for one frame. `left-pencil` draws only what the left profile adds to a mirrored
 * right profile: the pencil, which lives behind the right ear. `pencil: false` leaves it off (the
 * patient has no pencil yet).
 */
export function drawHead(p: Px, dir: "down" | "up" | "right" | "left-pencil", f: HeadFrame, { pencil = true } = {}): void {
  const y = f.bob + f.nod, tip = f.tip;
  if (dir === "down") {
    skullFront(p, y);
    faceFront(p, f, y);
    paintHair(p, FRONT, 0, y, 16, tip);
    // Pencil behind the right ear: screen-left from the front.
    if (pencil) p.rows(1, 18 + y, ["r...", ".g..", "..y.", "..Y.", "...t"], PENCIL);
  } else if (dir === "up") {
    headBack(p, y, tip);
    if (pencil) p.rows(27, 18 + y, ["...r", "..g.", ".y..", ".Y..", "t..."], PENCIL);
  } else if (dir === "right") {
    const x = f.lean;
    skullRight(p, y, x);
    faceRight(p, f, x, y);
    paintHair(p, SIDE, x, y, 16, tip);
  } else if (pencil) {
    const x = -f.lean;
    p.rows(16 + x, 18 + y, ["...r", "..g.", "..y.", ".y..", ".Y..", ".t.."], PENCIL);
  }
}
