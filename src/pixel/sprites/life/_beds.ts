/**
 * Private helpers for brick raised beds and the small vegetables and herbs planted in them, shared by
 * the courtyard's beds and the rooftop's planters. Not a sprite set (the leading `_` keeps the loader
 * away). Plants set into soil carry their own outline (`sticker`), since the soil round them is not
 * transparent.
 */
import { hash, type Color, type Px } from "../../kit/index.ts";
import { mound, stamp, sticker } from "../plant/_helpers.ts";
import { art, townFrame } from "./_helpers.ts";

/** Height of a bed's brick front face, art px. */
export const WALL = 12;
/** Room above the bed for its tallest plants and trellis. */
export const PLANTS = 40;

export type Frame = ReturnType<typeof townFrame>;
/** The soil rectangle seen from above, in sprite px. */
export type Soil = { x: number; y: number; w: number; h: number };

// ── the bed ────────────────────────────────────────────────────────────────────

/** Grey-blue and red bricks laid in courses, a lit coping, soil inside; moss at the foot, a missing brick, salt bloom. */
export function brickBed(p: Px, f: Frame, seed: number): Soil {
  const W = f.w, G = f.gy;
  const top = G - f.depth + 1 - WALL, front = G - WALL + 1;
  // Top: coping ring of bricks round the soil.
  p.rect(0, top, W, front - top, "rose3");
  p.hline(0, top, W, "rose4").vline(0, top, front - top, "rose4");
  for (let x = 4; x < W; x += 8) { p.px(x, top + 1, "stone3"); p.px(x + 2, front - 2, "stone3"); }
  const soil = { x: 4, y: top + 4, w: W - 8, h: front - top - 7 };
  p.rect(soil.x, soil.y, soil.w, soil.h, "brown2");
  p.hline(soil.x, soil.y, soil.w, "brown1");
  p.over(() => { p.speckle(soil.x, soil.y + 1, soil.w, soil.h - 1, "brown3", 0.16, seed); p.speckle(soil.x, soil.y + 1, soil.w, soil.h - 1, "wood1", 0.05, seed + 1); });
  // Front face: courses three high, joints staggered, each brick its own tone.
  for (let j = 0; j < WALL; j++) {
    const course = Math.floor(j / 3), mortar = j % 3 === 2;
    for (let x = 0; x < W; x++) {
      const bx = Math.floor((x + (course % 2) * 4) / 8);
      const joint = (x + (course % 2) * 4) % 8 === 7;
      const tone = hash(bx, course, seed);
      const c: Color = mortar || joint ? "stone3" : tone < 0.18 ? "steel3" : tone < 0.6 ? "rose3" : "rose2";
      p.px(x, front + j, c);
    }
  }
  p.hline(0, front, W, "rose4");
  p.vline(W - 1, front, WALL, "rose1");
  // A brick missing from the second course, and white salt bloom, and moss along the foot.
  const mx = 8 + Math.floor(hash(1, 2, seed) * (W - 20));
  p.rect(mx, front + 3, 7, 2, "wood1");
  p.over(() => {
    for (let x = 0; x < W; x++) if (hash(x, 9, seed) < 0.35) p.px(x, G, hash(x, 8, seed) < 0.5 ? "leaf2" : "leaf3");
    for (let k = 0; k < 3; k++) { const sx = Math.floor(hash(k, 7, seed) * (W - 6)); p.hline(sx, front + 6 + k, 4, "cream3"); }
  });
  return soil;
}

// ── plants ─────────────────────────────────────────────────────────────────────

/** A tuft of scallions, foot at (x, base). */
export function scallions(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 3, base - 14, 8, 15, (q) => {
    for (let i = 0; i < 4; i++) {
      const sx = 1 + i * 2, top = 1 + Math.floor(hash(i, 1, seed) * 5), lean = [-1, 0, 1, 1][i];
      q.line(sx, 14, sx, top + 4, i % 2 ? "leaf2" : "leaf3");
      q.line(sx, top + 4, sx + lean, top, i % 2 ? "leaf3" : "leaf4");
      q.px(sx, 13, "cream4");
    }
  });
}

/** A chilli bush with a few hanging pods, most still green, two turned red. */
export function chilli(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 6, base - 12, 12, 12, (q) => {
    q.vline(6, 7, 5, "leaf2");
    mound(q, 6, 5, 5.5, 4.5, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed);
    for (let k = 0; k < 4; k++) {
      const cx = 2 + Math.floor(hash(k, 1, seed) * 8), cy = 4 + Math.floor(hash(k, 2, seed) * 4);
      art(q, cx, cy, ["c", "C"], k < 2 ? { c: "red3", C: "red2" } : { c: "leaf4", C: "leaf3" });
    }
  });
}

/** Perilla (紫苏): broad crinkled leaves, purple on top. */
export function perilla(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 6, base - 13, 12, 13, (q) => {
    q.vline(6, 6, 7, "plum2");
    mound(q, 6, 5, 5.5, 5, ["plum1", "plum1", "plum2", "plum3", "plum4"], seed, [["33", "21"], [".3", "32"]], [3, 2]);
  }, { plum: "plum1" });
}

/** Mint, low and bright. */
export function mint(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 6, base - 8, 12, 8, (q) => mound(q, 6, 4, 6, 3.5, ["leaf2", "leaf2", "leaf3", "leaf4", "leaf5"], seed, [["3", "2"], ["33", "2."]], [2, 2]));
}

/** Coriander: lacy and pale. */
export function coriander(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 5, base - 10, 10, 10, (q) => {
    for (let i = 0; i < 4; i++) {
      const sx = 1 + i * 2 + (i > 1 ? 1 : 0), top = 2 + Math.floor(hash(i, 3, seed) * 3);
      q.line(5, 9, sx, top + 2, "leaf3");
      art(q, sx - 1, top, [".4.", "434"].map((r) => r.replace(/4/g, "a").replace(/3/g, "b")), { a: "leaf4", b: "leaf3" });
    }
  });
}

/** A bok choy seen from above in the bed: a rosette of dark spoon leaves round a pale heart. */
export function choy(p: Px, x: number, base: number, flip: boolean): void {
  sticker(p, x - 4, base - 8, 8, 8, (q) => stamp(q, 0, 0, flip ? [
    ".2332..",
    "2344321",
    "34cc432",
    "24cc443",
    "2344432",
    ".23322.",
    "..111..",
  ] : [
    "..2332.",
    "1234432",
    "234cc43",
    "344cc42",
    "2344432",
    ".22332.",
    "..111..",
  ], ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"], { legend: { c: "jade6" } }));
}

/**
 * A bamboo trellis along the back of a bed: uprights tied to crossbars with wire, a vine climbing it
 * with leaves, and what it carries (`long beans` hang in pairs; a `loofah` hangs fat and has yellow flowers).
 */
export function trellis(p: Px, x0: number, x1: number, base: number, height: number, crop: "beans" | "loofah", seed: number): void {
  const top = base - height;
  for (let x = x0; x <= x1; x += 9) { p.vline(x, top, height, "bamboo3"); p.vline(x + 1, top, height, "bamboo2"); p.px(x, top, "bamboo5"); }
  for (const y of [top + 3, top + Math.round(height * 0.55)]) { p.hline(x0, y, x1 - x0 + 2, "bamboo4"); p.hline(x0, y + 1, x1 - x0 + 2, "bamboo2"); }
  sticker(p, x0 - 2, top - 4, x1 - x0 + 6, height + 2, (q) => {
    const ox = x0 - 1, oy = top - 3;
    // The vine: a wandering stem along the crossbars and up the uprights, heart leaves on it.
    for (let x = x0; x <= x1 + 2; x++) {
      const y = top + 3 + Math.round(Math.sin(x / 5 + seed) * 2) + (x % 18 < 9 ? 0 : Math.round(height * 0.3));
      q.px(x - ox, y - oy, "leaf2");
      if (hash(x, 1, seed) < 0.38) art(q, x - ox - 1, y - oy - 2, [".3.", "334", ".2."].map((r) => r.replace(/4/g, "c").replace(/3/g, "b").replace(/2/g, "a")), { a: "leaf2", b: "leaf3", c: "leaf4" });
    }
    for (let k = 0; k < Math.round((x1 - x0) / 7); k++) {
      const hx = x0 + 3 + Math.floor(hash(k, 4, seed) * (x1 - x0 - 4)) - ox, hy = top + 6 + Math.floor(hash(k, 5, seed) * height * 0.4) - oy;
      if (crop === "beans") { q.vline(hx, hy, 9, "leaf3"); q.vline(hx + 1, hy + 1, 8, "leaf4"); }
      else if (k % 3 === 0) art(q, hx - 1, hy, [".s.", "lLl", "lLl", "lLl", "lLl", "lll", ".l."], { s: "leaf2", l: "leaf3", L: "leaf4" });
      else art(q, hx, hy, ["yY", "Yy"], { y: "gold3", Y: "gold4" });
    }
  }, { gold: "wood1" });
}

/** Lay plants in rows across the soil, back row first: `rows` of plant drawers, each spaced `dx` apart. */
export function rows(p: Px, soil: Soil, list: readonly { plant: (p: Px, x: number, base: number, k: number) => void; dx: number }[]): void {
  list.forEach((row, r) => {
    const base = Math.round(soil.y + 4 + ((soil.h - 6) * (r + 0.5)) / list.length);
    let k = 0;
    // Hand-planted: each a pixel or so off the line, never a grid.
    for (let x = soil.x + 5 + (r % 2) * Math.round(row.dx / 2); x < soil.x + soil.w - 4; x += row.dx, k++)
      row.plant(p, x + Math.round((hash(k, r, soil.w) - 0.5) * 3), base + Math.round((hash(r, k, soil.h) - 0.5) * 3), k);
  });
}
