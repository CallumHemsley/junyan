/** Private drawing helpers for the furniture family. Not loaded as a sprite set. */
import { hash, type Color, type Legend, type Px } from "../../kit/index.ts";

/** `rows()` that also checks every row is exactly `w` wide, so hand-placed art cannot drift. */
export function grid(p: Px, x: number, y: number, w: number, rows: readonly string[], legend: Legend): void {
  rows.forEach((row, i) => { if (row.length !== w) throw new Error(`grid row ${i} "${row}" is ${row.length} wide, expected ${w}`); });
  p.rows(x, y, rows, legend);
}

/** A wood ramp as a light-to-dark set of roles. */
export type Tones = { hi: Color; lit: Color; base: Color; shade: Color; deep: Color };
export const TEA: Tones = { hi: "wood6", lit: "wood5", base: "wood4", shade: "wood3", deep: "wood2" };
export const ROSE: Tones = { hi: "wood4", lit: "rose4", base: "rose3", shade: "rose2", deep: "rose1" };

/**
 * A wooden top plane made of boards, lit from the upper left. Seams are a dark groove with a lit
 * lip beside it, broken where boards sit flush. Grain is long quiet streaks that follow each
 * board, placed deterministically from `seed`. Draws only over existing art.
 */
export function boards(
  p: Px, x: number, y: number, w: number, h: number,
  o: { dir: "h" | "v"; seams: readonly number[]; seed: number; t?: Tones; density?: number; flush?: readonly number[] },
): void {
  const t = o.t ?? TEA;
  p.clip(x, y, w, h, (q) => q.over(() => {
    const edges = [0, ...o.seams, o.dir === "h" ? h : w];
    for (let b = 0; b + 1 < edges.length; b++) {
      const from = edges[b], to = edges[b + 1], span = to - from;
      const count = Math.max(2, Math.round(((o.dir === "h" ? w : h) * span) / 70 * (o.density ?? 1)));
      for (let s = 0; s < count; s++) {
        const r1 = hash(s, b, o.seed), r2 = hash(s, b, o.seed + 1), r3 = hash(s, b, o.seed + 2);
        const c = r3 > 0.5 ? t.lit : t.shade;
        if (o.dir === "h") {
          const len = 5 + Math.floor(r3 * 13), sx = Math.floor(r1 * (w - len)), sy = from + 2 + Math.floor(r2 * Math.max(1, span - 3));
          q.hline(sx, sy, len, c);
          if (len > 11 && sy + 1 < to - 1) q.hline(sx + 4, sy + 1, len - 8, c);
        } else {
          const len = 3 + Math.floor(r3 * 7), sy = Math.floor(r2 * (h - len)), sx = from + 2 + Math.floor(r1 * Math.max(1, span - 3));
          q.vline(sx, sy, len, c);
        }
      }
    }
    o.seams.forEach((s, i) => {
      const gap = o.flush?.[i] ?? -99;
      if (o.dir === "h") for (let i2 = 0; i2 < w; i2++) {
        if (Math.abs(i2 - gap) < 2) continue;
        q.px(i2, s, t.shade);
        if (hash(i2 >> 2, s, o.seed + 5) > 0.3) q.px(i2, s + 1, t.lit);
      }
      else for (let j = 0; j < h; j++) {
        if (Math.abs(j - gap) < 2) continue;
        q.px(s, j, t.shade);
        if (hash(s, j >> 1, o.seed + 5) > 0.35) q.px(s + 1, j, t.lit);
      }
    });
  }));
}

/** Lit back and left edges, shaded right and front edges, on a rectangular top. */
export function topEdges(p: Px, x: number, y: number, w: number, h: number, t: Tones = TEA): void {
  p.over(() => {
    p.hline(x + 2, y, Math.floor(w * 0.45), t.hi).hline(x + 1, y + 1, Math.floor(w * 0.2), t.hi);
    p.vline(x, y + 2, Math.floor(h * 0.75), t.lit);
    p.vline(x + w - 1, y + 2, h - 2, t.shade).hline(x + 2, y + h - 1, w - 3, t.shade);
  });
}

/**
 * A square leg seen from the front: two lit columns, body, two shaded columns, and an ankle
 * ring `ankle` px above the floor (0 for none).
 */
export function squareLeg(p: Px, x: number, y: number, w: number, h: number, t: Tones = TEA, ankle = 5): void {
  p.rect(x, y, w, h, t.shade);
  p.vline(x, y + 1, h - 2, t.base).vline(x + 1, y + 1, h - 3, t.base);
  p.rect(x + w - 2, y, 2, h, t.deep);
  if (ankle) p.hline(x, y + h - ankle - 1, w, t.deep).hline(x, y + h - ankle, w, t.base);
}

/** A peg head seen from above: a dark rim with a lit crown. */
export function peg(p: Px, x: number, y: number, t: Tones = TEA): void {
  p.rows(x, y, ["dd", "dl"], { d: t.deep, l: t.lit });
}

/** A butterfly key (bowtie inlay) of paler wood across a split, 11×6. */
export function bowtie(p: Px, x: number, y: number): void {
  grid(p, x, y, 11, [
    "222.....222",
    "2662...2552",
    "25552225552",
    "25555555542",
    "2552...2442",
    "222.....222",
  ], { "2": "wood2", "5": "wood5", "6": "wood6", "4": "wood4" });
}

/**
 * A hand-tuned oval: `half` lists the half-width of each row of the top half (the bottom half
 * mirrors it), so curves step in clean runs.
 */
export function oval(half: readonly number[], left: number, top: number) {
  const height = half.length * 2, cx = left + Math.max(...half);
  const hwAt = (r: number) => half[r < half.length ? r : height - 1 - r];
  const inside = (x: number, y: number, dx = 0, dy = 0) => {
    const r = y - top - dy;
    if (r < 0 || r >= height) return false;
    const hw = hwAt(r);
    return x - dx >= cx - hw && x - dx < cx + hw;
  };
  const fill = (p: Px, c: Color, dx = 0, dy = 0) => {
    for (let r = 0; r < height; r++) p.hline(cx - hwAt(r) + dx, top + r + dy, hwAt(r) * 2, c);
  };
  return { inside, fill, height, cx };
}

/** Half-widths for an oval `w` wide and `h` tall (h even). */
export function ovalHalves(w: number, h: number): number[] {
  const a = w / 2, b = h / 2, out: number[] = [];
  for (let r = 0; r < h / 2; r++) {
    const dy = (r + 0.5 - b) / b;
    out.push(Math.max(1, Math.round(a * Math.sqrt(Math.max(0, 1 - dy * dy)))));
  }
  return out;
}

/** Round off the four corners of whatever is drawn in the box (erases). `r` is 1–4. */
export function roundCorners(p: Px, x: number, y: number, w: number, h: number, r: number, which = "tl tr bl br"): void {
  const cut = r >= 4 ? [3, 2, 1, 1] : r === 3 ? [2, 1, 1] : r === 2 ? [1, 1] : [1];
  cut.forEach((n, j) => {
    if (which.includes("tl")) p.hline(x, y + j, n, null);
    if (which.includes("tr")) p.hline(x + w - n, y + j, n, null);
    if (which.includes("bl")) p.hline(x, y + h - 1 - j, n, null);
    if (which.includes("br")) p.hline(x + w - n, y + h - 1 - j, n, null);
  });
}

/**
 * Drawing calls that can be mirrored left-to-right inside a sprite `w` wide, while vertical
 * members stay lit on their screen-left side. Used to draw left- and right-facing chairs from one
 * description without flipping the light.
 */
export function mirrorable(p: Px, w: number, flip: boolean) {
  const X = (x: number, width = 1) => (flip ? w - x - width : x);
  return {
    flip,
    X,
    rect: (x: number, y: number, rw: number, rh: number, c: Color | null) => p.rect(X(x, rw), y, rw, rh, c),
    hline: (x: number, y: number, n: number, c: Color) => p.hline(X(x, n), y, n, c),
    px: (x: number, y: number, c: Color) => p.px(X(x), y, c),
    grid: (x: number, y: number, gw: number, rows: readonly string[], legend: Legend) =>
      grid(p, X(x, gw), y, gw, flip ? rows.map((r) => [...r].reverse().join("")) : rows, legend),
    /** A vertical member lit on its screen-left: lit, base…, shade, deep. */
    post: (x: number, y: number, pw: number, ph: number, t: Tones) => {
      const left = X(x, pw);
      p.rect(left, y, pw, ph, t.base).vline(left, y, ph, t.lit);
      if (pw > 2) p.vline(left + pw - 1, y, ph, t.deep);
      if (pw > 3) p.vline(left + pw - 2, y, ph, t.shade);
    },
  };
}

/** Run `fn` for every pixel of the box. Handy for patterns that depend on position. */
export function each(x: number, y: number, w: number, h: number, fn: (x: number, y: number) => void): void {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) fn(i, j);
}
