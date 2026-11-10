/**
 * Private helpers for the room-shell floor tiles. Not a sprite set.
 */
import { hash, type Color, type Legend, type Px } from "../../kit/index.ts";

/** Stamp a hand-drawn block, checking the row count and that every row has the same width. */
export function block(p: Px, x: number, y: number, rows: readonly string[], legend: Legend, name = "block"): void {
  const w = rows[0]?.length ?? 0;
  rows.forEach((row, i) => {
    if (row.length !== w) throw new Error(`${name}: row ${i} "${row}" is ${row.length} wide, expected ${w}`);
  });
  p.rows(x, y, rows, legend);
}

export const T = 32;

/** One board tone: face, lit figure and lip, dark grain and seam. */
type Tone = { face: Color; light: Color; dark: Color; seam: Color; nail: Color };
export const OAK_TONES: Record<"old" | "normal" | "new", Tone> = {
  /** An older, darker board that has soaked up decades of tea and mop water. */
  old: { face: "oak3", light: "oak4", dark: "oak2", seam: "oak2", nail: "oak1" },
  normal: { face: "oak4", light: "oak5", dark: "oak3", seam: "oak3", nail: "oak2" },
  /** A newer replacement: the same tone, but clean (no grain shows), a crisp unbroken lit edge and bright new nail heads. */
  new: { face: "oak4", light: "oak5", dark: "oak4", seam: "oak3", nail: "steel3" },
};

export type BoardSpec = {
  /** Butt-joint x positions in this board (the gap column). */
  joints?: readonly number[];
  /** Override the tone between two x positions [from, to) — always bounded by joints or the tile edge. */
  tone?: readonly [number, number, keyof typeof OAK_TONES];
  /** Number of grain streaks (default and maximum 2). Fewer is calmer. */
  grain?: number;
};

/**
 * Four 8px honey-oak boards per 32px tile, running east–west. Seams sit on rows 7, 15, 23, 31 and the
 * lit board lips on rows 0, 8, 16, 24 in every variant, so any mix tiles seamlessly. Grain streaks stay
 * one pixel clear of the tile edges and of joints, so nothing is cut off at a seam.
 */
export function oakBoards(p: Px, seed: number, boards: readonly BoardSpec[]): void {
  boards.forEach((spec, b) => {
    const top = b * 8, joints = spec.joints ?? [];
    const toneAt = (x: number): Tone => (spec.tone && x >= spec.tone[0] && x < spec.tone[1] ? OAK_TONES[spec.tone[2]] : OAK_TONES.normal);
    for (let x = 0; x < T; x++) {
      const t = toneAt(x);
      p.vline(x, top, 7, t.face).px(x, top + 7, t.seam);
      // The lip of the board catches the sun in broken runs. No sheen bands below it: across a big floor
      // any lighter run reads as a pale board segment and the floor gets busy.
      if (t === OAK_TONES.new || hash(x >> 2, b, seed) > 0.3) p.px(x, top, t.light);
    }
    // Grain: long quiet streaks that follow the board and drift a row once.
    const near = (x: number) => x < 1 || x > T - 2 || joints.some((j) => Math.abs(x - j) <= 1);
    for (let s = 0; s < Math.min(spec.grain ?? 2, 2); s++) {
      const x0 = 1 + Math.floor(hash(s, b, seed + 7) * 22), len = 5 + Math.floor(hash(s, b, seed + 13) * 9);
      let y = top + 2 + Math.floor(hash(s, b, seed + 11) * 4);
      const lit = hash(s, b, seed + 17) > 0.4, step = 2 + Math.floor(hash(s, b, seed + 19) * (len - 3));
      const drift = hash(s, b, seed + 23) > 0.5 ? 1 : -1;
      for (let i = 0; i < len; i++) {
        const x = x0 + i;
        if (i === step && y + drift >= top + 1 && y + drift <= top + 6) y += drift;
        if (near(x)) continue;
        const t = toneAt(x);
        p.px(x, y, lit ? t.light : t.dark);
      }
    }
    // Joints: a gap, lit end grain to its right, a nail either side.
    for (const j of joints) {
      const t = toneAt(j), right = toneAt(j + 1), left = toneAt(j - 1);
      p.vline(j, top, 7, t.seam).vline(j, top + 2, 3, t.dark === "oak4" ? "oak3" : "oak2");
      p.px(j + 1, top + 1, right.light).px(j + 1, top + 2, right.light);
      p.px(j - 2, top + 2, left.nail).px(j + 2, top + 5, right.nail);
    }
  });
}

/** Honey-oak stamp legend for hand-drawn floor stories. */
export const OAK: Legend = { a: "oak4", b: "oak3", c: "oak2", d: "oak1", l: "oak5", w: "cream4", W: "cream5", s: "stone2" };
