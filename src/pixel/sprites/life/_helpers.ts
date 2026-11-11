/**
 * Private drawing helpers for the town's market and daily-life props (`town/` market kinds and the
 * `life/` extras). Not a sprite set: the leading `_` keeps the loader away.
 *
 * Everything here blocks in a material or a small object; each sprite finishes by hand. Light is the
 * style bible's: from the upper left, tops lightest, right and under edges darkest.
 */
import { Px, hash, type Color, type Legend } from "../../kit/index.ts";
import { footprintPx, type TownProp } from "../../town/map.ts";

export { autoOutline, cylinder, stamp, lance } from "../decor/_helpers.ts";
export { dome, part, relief } from "../food/_helpers.ts";

export type Ramp = readonly Color[];

export const BAMBOO: Ramp = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];
export const OAK: Ramp = ["oak1", "oak2", "oak3", "oak4", "oak5"];
export const STONE: Ramp = ["stone1", "stone2", "stone3", "stone4", "stone5"];
export const STEEL: Ramp = ["steel1", "steel2", "steel3", "steel4", "steel5", "steel6"];
export const BLUE: Ramp = ["blue1", "blue2", "blue3", "blue4", "blue5"];
export const JADE: Ramp = ["jade1", "jade2", "jade3", "jade4", "jade5"];
export const GOLD: Ramp = ["gold1", "gold2", "gold3", "gold4", "gold5"];
export const LEAF: Ramp = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
export const CREAM: Ramp = ["cream1", "cream2", "cream3", "cream4", "cream5"];
export const PLUM: Ramp = ["plum1", "plum2", "plum3", "plum4"];
export const ROSE: Ramp = ["rose1", "rose2", "rose3", "rose4"];
/** Expanded polystyrene: bright, with cool shadows. */
export const FOAM: Ramp = ["steel3", "steel4", "steel5", "steel6", "white"];

/** `rows()` under a short name. Rows are left-aligned; `.` skips. */
export function art(p: Px, x: number, y: number, rows: readonly string[], legend: Legend): Px {
  return p.rows(x, y, rows, legend);
}

/** A ramp step, clamped. `i` is 0-based from the darkest. */
export const step = (ramp: Ramp, i: number): Color => ramp[Math.max(0, Math.min(ramp.length - 1, i))];

/**
 * The sprite frame for a town prop of a footprint kind: exactly the footprint's width, `rise` art px
 * taller than its depth, anchored on the footprint's bottom-centre (pixel-contracts). `gy` is the
 * ground row the footprint's front edge stands on, `back` the row of its back edge.
 */
export function townFrame(prop: TownProp, rise: number) {
  const { w, h: depth } = footprintPx(prop);
  const h = depth + rise;
  return { w, h, depth, gy: h - 1, back: h - depth, anchor: [Math.round(w / 2), h - 1] as const };
}

/** The solid footprint relative to the anchor, for `foot`. */
export function townFoot(prop: TownProp): [number, number, number, number] {
  const { w, h } = footprintPx(prop);
  return [-Math.round(w / 2), -h, w, h];
}

/** A per-instance seed from a prop id, so two props of one variant still differ. */
export function seedOf(id: string): number {
  let n = 7;
  for (let i = 0; i < id.length; i++) n = (Math.imul(n, 31) + id.charCodeAt(i)) | 0;
  return n >>> 0;
}


// ── woven bamboo ───────────────────────────────────────────────────────────────

/**
 * Woven bamboo: two-pixel strands with ribs every four, staggered row to row, lit from the left.
 * `(i, j)` are local to the woven face, `w` its width (for the left-lit, right-shaded falloff).
 */
export function weaveAt(i: number, j: number, w: number, ramp: Ramp = BAMBOO, lift = 0): Color {
  const strand = Math.floor(j / 2), top = j % 2 === 0;
  const rib = (i + (strand % 2) * 2) % 4 === 0;
  const t = (i + 0.5) / w;
  const light = t < 0.15 ? 1 : t < 0.45 ? 1 : t < 0.75 ? 0 : -1;
  const base = rib ? 1 : top ? 3 : 2;
  return step(ramp, base + light + lift);
}

/**
 * A round basket seen from three-quarters: an elliptical rim on top, a woven body tapering by
 * `taper` px each side toward the base. Returns its geometry so contents can be piled in, and a
 * `front()` that repaints the front half of the rim over them.
 */
export function basket(
  p: Px, x: number, y: number, w: number, rimH: number, bodyH: number,
  options: { taper?: number; ramp?: Ramp; interior?: Color } = {},
) {
  const ramp = options.ramp ?? BAMBOO, taper = options.taper ?? 2;
  const cx = x + w / 2, cy = y + rimH / 2, rx = w / 2, ry = rimH / 2;
  const top = Math.round(cy);
  // Body: woven rows narrowing to the base, the last row a dark foot.
  for (let j = 0; j < bodyH; j++) {
    const k = Math.round((taper * j) / Math.max(1, bodyH - 1));
    for (let i = k; i < w - k; i++) {
      const foot = j === bodyH - 1;
      p.px(x + i, top + j, foot ? step(ramp, 0) : weaveAt(i - k, j, w - 2 * k, ramp));
    }
  }
  // Rim: a lit outer ring, the dark interior with the far wall's weave showing.
  const ring = (lit: boolean) => {
    for (let yy = Math.floor(cy - ry); yy <= Math.ceil(cy + ry); yy++)
      for (let xx = Math.floor(x); xx < x + w; xx++) {
        const u = (xx + 0.5 - cx) / rx, v = (yy + 0.5 - cy) / ry;
        if (u * u + v * v > 1) continue;
        const iu = (xx + 0.5 - cx) / (rx - 1.6), iv = (yy + 0.5 - cy) / Math.max(1, ry - 1.2);
        const inside = iu * iu + iv * iv <= 1;
        if (lit) {
          if (inside) p.px(xx, yy, yy < cy - ry * 0.15 ? weaveAt(xx - x, yy, w, ramp, -1) : options.interior ?? step(ramp, 0));
          else p.px(xx, yy, u < 0.3 && v < 0.3 ? step(ramp, 4) : step(ramp, 3));
        } else if (!inside && yy + 0.5 >= cy) p.px(xx, yy, u < -0.5 ? step(ramp, 4) : u > 0.55 ? step(ramp, 2) : step(ramp, 3));
      }
  };
  ring(true);
  return { cx, cy, rx, ry, top, front: () => ring(false) };
}

/** A flat winnowing tray (簸箕 / 筛子): a wide shallow ellipse with a bound rim. Contents go on after. */
export function tray(p: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp = BAMBOO): void {
  // The rim's front face, two pixels deep.
  p.ellipse(cx, cy + 2, rx, ry, step(ramp, 1));
  p.ellipse(cx, cy, rx, ry, step(ramp, 3));
  p.ellipse(cx, cy, rx - 1.5, ry - 1, step(ramp, 2));
  // The woven floor: a fine check.
  p.clip(0, 0, p.w, p.h, () => {
    for (let y = Math.floor(cy - ry + 1); y < cy + ry - 1; y++)
      for (let x = Math.floor(cx - rx + 2); x < cx + rx - 2; x++) {
        const u = (x + 0.5 - cx) / (rx - 1.5), v = (y + 0.5 - cy) / (ry - 1);
        if (u * u + v * v > 1) continue;
        p.px(x, y, (x + y) % 2 ? step(ramp, 3) : step(ramp, 2));
      }
  });
  // The rim binding catches light on its upper left.
  for (let x = Math.floor(cx - rx); x < cx + rx; x++) {
    const u = (x + 0.5 - cx) / rx;
    const yy = Math.round(cy - ry * Math.sqrt(Math.max(0, 1 - u * u)));
    if (u < 0.2) p.px(x, yy, step(ramp, 4));
  }
}

// ── produce ────────────────────────────────────────────────────────────────────

const ORANGE: Legend = { O: "orange3", o: "orange2", d: "orange1", h: "gold4", s: "leaf2" };

/** A mandarin orange, 5×5, lit upper left. `leaf` adds a stalk with one leaf (the ones sold on the branch). */
export function orange(p: Px, x: number, y: number, leaf = false): void {
  art(p, x, y, [
    ".OOo.",
    "OhOoo",
    "OOooo",
    "ooood",
    ".ddd.",
  ], ORANGE);
  if (leaf) art(p, x + 2, y - 2, [".sS", "s.."], { s: "leaf2", S: "leaf3" });
}

/** A heap of oranges filling roughly the ellipse, back to front so the front ones overlap. */
export function orangeHeap(p: Px, cx: number, cy: number, rx: number, ry: number, seed: number): void {
  const spots: [number, number][] = [];
  for (let y = Math.floor(cy - ry); y <= cy + ry; y += 3)
    for (let x = Math.floor(cx - rx) + (((y - cy) / 3) & 1 ? 2 : 0); x <= cx + rx - 4; x += 4) {
      const u = (x + 2 - cx) / rx, v = (y + 2 - cy) / ry;
      if (u * u + v * v <= 1.05) spots.push([x, y]);
    }
  spots.forEach(([x, y], i) => orange(p, x, y, hash(i, seed, 3) < 0.12));
}

/**
 * A bunch of bok choy (青菜) standing heads-up: spoon-shaped dark leaves fanned at the top, the
 * pale jade stalks bunched into a fat white base. 8×12.
 */
export function bokChoy(p: Px, x: number, y: number, flip = false): void {
  const rows = [
    "..1221..",
    ".134431.",
    "13455431",
    "13444321",
    ".234432.",
    ".1ab321.",
    "..abba..",
    "..abbc..",
    "..abbc..",
    ".aabbcc.",
    ".abbbbc.",
    "..cccc..",
  ];
  const legend: Legend = { "1": "leaf1", "2": "leaf2", "3": "leaf3", "4": "leaf4", "5": "leaf5", a: "jade6", b: "jade5", c: "jade4" };
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const k = row[i];
      if (k === ".") continue;
      p.px(flip ? x + row.length - 1 - i : x + i, y + j, legend[k]);
    }
  });
}

/** A long purple eggplant lying on its side, 11×4, green calyx at the left. */
export function eggplant(p: Px, x: number, y: number): void {
  art(p, x, y, [
    ".gg.ppPPpp.",
    "gGgpPPPppp1",
    ".gpppppp11.",
    "...1111....",
  ], { g: "leaf2", G: "leaf3", p: "plum2", P: "plum3", "1": "plum1" });
}

/** A head of garlic, 4×4: papery white with a pinkish blush and a dry stalk. */
export function garlic(p: Px, x: number, y: number): void {
  art(p, x, y, [".bb.", "wWwc", "wwcc", ".cc."], { b: "bamboo4", w: "cream4", W: "white", c: "cream2" });
}

/** A knob of ginger, 6×3. */
export function ginger(p: Px, x: number, y: number): void {
  art(p, x, y, [".ab.a.", "abbbba", ".aa.a."], { a: "bamboo2", b: "bamboo4" });
}

/** A brown egg, 3×4. */
export function egg(p: Px, x: number, y: number, pale = false): void {
  art(p, x, y, [".a.", "aAb", "abb", ".b."], pale ? { a: "cream4", A: "white", b: "cream3" } : { a: "oak4", A: "oak5", b: "oak3" });
}

/** A scallion or leek stalk from (x, y0) at the base up to (x + lean, y1), green tops, white foot. */
export function scallion(p: Px, x: number, base: number, top: number, lean = 0, thick = false): void {
  p.line(x, base, x + lean, top, "leaf3");
  if (thick) p.line(x + 1, base, x + 1 + lean, top + 1, "leaf2");
  p.px(x + lean, top, "leaf4");
  p.vline(x, base - 3, 3, "cream4");
  if (thick) p.vline(x + 1, base - 3, 3, "cream3");
}

// ── crates ─────────────────────────────────────────────────────────────────────

/**
 * A stackable plastic crate seen from three-quarters: a rim ring around a dark well (`top` px of
 * foreshortened top), then a front face with rows of rounded slots and a hand-hold. `ramp` dark
 * to light (four or five steps). Returns the well's rectangle for contents.
 */
export function plasticCrate(p: Px, x: number, y: number, w: number, top: number, front: number, ramp: Ramp, options: { slots?: boolean } = {}) {
  const n = ramp.length;
  const lit = ramp[n - 1], face = ramp[n - 2], shade = ramp[n - 3], dark = ramp[Math.max(0, n - 4)];
  // Top: the rim on all four sides, the well inside.
  p.rect(x, y, w, top, face).hline(x, y, w, lit).vline(x, y, top, lit);
  p.rect(x + 2, y + 1, w - 4, top - 2, dark);
  p.hline(x + 2, y + 1, w - 4, ramp[0]);
  // Front face: a lit lip, slot rows, a darker base band, a shaded right edge.
  const fy = y + top;
  p.rect(x, fy, w, front, face);
  p.hline(x, fy, w, lit);
  p.hline(x, fy + front - 2, w, shade).hline(x, fy + front - 1, w, dark);
  p.vline(x + w - 1, fy, front, shade).vline(x, fy, front, lit);
  // Hand-hold: a long slot through the top band.
  const hw = Math.max(6, Math.round(w * 0.4)), hx = Math.round(x + (w - hw) / 2);
  p.hline(hx, fy + 2, hw, ramp[0]).hline(hx + 1, fy + 3, hw - 2, dark);
  // The lattice: a grid of small slots between the top band and the base band, each dark at the top
  // (the rib above shades it) and catching a little light on its lower edge.
  if (options.slots !== false) {
    for (let sy = fy + 5; sy + 3 <= fy + front - 2; sy += 4)
      for (let sx = x + 2; sx + 2 <= x + w - 2; sx += 3) {
        p.hline(sx, sy, 2, ramp[0]).hline(sx, sy + 1, 2, dark).px(sx + 1, sy + 2, shade);
      }
  }
  return { wellX: x + 2, wellY: y + 1, wellW: w - 4, wellH: top - 2 };
}

/** A slatted wooden crate: rails on top, `slats` front boards with dark gaps, corner posts, nail heads. */
export function woodCrate(p: Px, x: number, y: number, w: number, top: number, front: number, options: { slats?: number; seed?: number; ramp?: Ramp } = {}) {
  const r = options.ramp ?? OAK, slats = options.slats ?? 3, seed = options.seed ?? 1;
  p.rect(x, y, w, top, r[2]).hline(x, y, w, r[4]).hline(x, y + top - 1, w, r[3]);
  p.rect(x + 2, y + 1, w - 4, top - 2, "wood1");
  const fy = y + top, sh = Math.floor((front - (slats - 1)) / slats);
  p.rect(x, fy, w, front, "wood1");
  for (let s = 0; s < slats; s++) {
    const sy = fy + s * (sh + 1);
    const hgt = s === slats - 1 ? fy + front - sy : sh;
    p.rect(x, sy, w, hgt, r[3]).hline(x, sy, w, r[4]).hline(x, sy + hgt - 1, w, r[1]);
    // Grain: short streaks.
    for (let g = 0; g < 3; g++) {
      const gx = x + 3 + Math.floor(hash(s, g, seed) * (w - 10)), gy = sy + 1 + Math.floor(hash(g, s, seed + 1) * Math.max(1, hgt - 2));
      p.hline(gx, gy, 3 + Math.floor(hash(s, g, seed + 2) * 5), r[2]);
    }
  }
  // Corner posts with nail heads.
  p.rect(x, fy, 2, front, r[2]).vline(x, fy, front, r[3]);
  p.rect(x + w - 2, fy, 2, front, r[1]).vline(x + w - 1, fy, front, r[0]);
  for (let s = 0; s < slats; s++) { p.px(x + 1, fy + s * (sh + 1) + 1, "steel2"); p.px(x + w - 2, fy + s * (sh + 1) + 1, "steel1"); }
}

/** A glass bottle's neck and shoulders seen standing in a crate: 3 wide, `h` tall, a crown cap on top. */
export function bottleNeck(p: Px, x: number, y: number, h: number, glass: Ramp, cap: Color | null = "steel4"): void {
  if (cap) p.hline(x, y, 3, cap).px(x + 2, y, "steel2");
  for (let j = cap ? 1 : 0; j < h; j++) {
    const wide = j > h - 4;
    p.px(x, y + j, glass[2]).px(x + 1, y + j, j < 3 ? glass[3] : glass[4]).px(x + 2, y + j, glass[1]);
    if (wide) p.px(x - 1, y + j, glass[2]).px(x + 3, y + j, glass[0]);
  }
}

/** Green beer-bottle glass and brown soy-bottle glass. */
export const GREEN_GLASS: Ramp = ["jade1", "jade2", "jade3", "jade4", "jade6"];
export const BROWN_GLASS: Ramp = ["rose1", "wood2", "wood3", "wood4", "gold3"];

/** Flattened cardboard cartons in a pile, tied with string: `n` sheets, each a slightly different size and offset. */
export function cardboardPile(p: Px, x: number, y: number, w: number, n: number, seed: number): void {
  for (let i = 0; i < n; i++) {
    const off = Math.floor(hash(i, 1, seed) * 4) - 1, ww = w - Math.floor(hash(i, 2, seed) * 4);
    const yy = y + (n - 1 - i) * 3;
    p.rect(x + off, yy, ww, 3, "oak4").hline(x + off, yy, ww, "oak5").hline(x + off, yy + 2, ww, "oak2");
    // Corrugation at the cut edge, the odd printed panel ghosting through.
    for (let k = 0; k < ww; k += 2) p.px(x + off + k, yy + 1, "oak3");
    if (hash(i, 3, seed) < 0.5) p.hline(x + off + 4, yy + 1, 5, "oak2");
  }
  // The string: two loops round the pile, knotted on top.
  const h = n * 3;
  for (const sx of [x + Math.round(w * 0.28), x + Math.round(w * 0.7)]) p.vline(sx, y, h, "cream3");
  art(p, x + Math.round(w * 0.28) - 1, y - 2, ["c.c", ".c."], { c: "cream3" });
}

// ── laundry ────────────────────────────────────────────────────────────────────

/** A bamboo laundry pole along y from x0 to x1: two pixels, lit on top, nodes every 18–24 px. */
export function pole(p: Px, x0: number, x1: number, y: number, seed: number): void {
  p.hline(x0, y, x1 - x0, "bamboo4").hline(x0, y + 1, x1 - x0, "bamboo2");
  p.hline(x0, y + 2, x1 - x0, "bamboo1");
  for (let x = x0 + 6 + Math.floor(hash(seed, 0, 5) * 10); x < x1 - 3; x += 18 + Math.floor(hash(x, seed, 6) * 7)) {
    p.px(x, y, "bamboo5").px(x, y + 1, "bamboo1").px(x + 1, y, "bamboo3");
  }
}

/** A wooden or plastic peg gripping cloth at the pole: 2×3. */
export function peg(p: Px, x: number, y: number, plastic: Color | null = null): void {
  const a: Color = plastic ?? "oak4", b: Color = plastic ? "steel3" : "oak2";
  art(p, x, y, ["ab", "ab", "b."], { a, b });
}

export type Cloth = { ramp: Ramp; print?: (p: Px, x: number, y: number, w: number, h: number) => void };

/**
 * Hanging cloth: fills a hand-drawn silhouette (rows of `#`) with the cloth ramp lit from the left,
 * vertical fold streaks hanging from the pegs, and a hemline shadow. `shape` rows are left-aligned.
 */
export function cloth(p: Px, x: number, y: number, shape: readonly string[], fabric: Cloth, folds: readonly number[] = [], sway = 0): void {
  const n = fabric.ramp.length;
  const w = Math.max(...shape.map((r) => r.length)), h = shape.length;
  const isIn = (i: number, j: number) => j >= 0 && j < h && i >= 0 && i < shape[j].length && shape[j][i] !== ".";
  // Paint on a canvas of its own, so the print and folds never touch what hangs behind.
  const q = new Px(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (!isIn(i, j)) continue;
    const t = (i + 0.5) / w;
    let lvl = t < 0.2 ? n - 1 : t < 0.7 ? n - 2 : n - 3;
    if (!isIn(i + 1, j) || !isIn(i, j + 1)) lvl = Math.min(lvl, n - 3);
    if (!isIn(i - 1, j) && t < 0.5) lvl = n - 1;
    if (shape[j][i] === "s") lvl = n - 3;
    if (shape[j][i] === "d") lvl = n - 4;
    q.px(i, j, fabric.ramp[Math.max(0, lvl)]);
  }
  if (fabric.print) q.over(() => fabric.print!(q, 0, 0, w, h));
  for (const f of folds) for (let j = 1; j < h; j++) {
    if (isIn(f, j) && isIn(f, j + 1)) q.px(f, j, fabric.ramp[Math.max(0, n - 3)]);
    if (isIn(f - 1, j) && isIn(f, j + 1) && j % 3 === 0) q.px(f - 1, j, fabric.ramp[n - 1]);
  }
  if (!sway) { p.blit(q, x, y); return; }
  // A breeze from the west: the lower part of the cloth lifts a pixel to the east.
  const cut = Math.max(3, Math.floor(h * 0.55));
  p.clip(x - 2, y, w + 4, cut, (c) => c.blit(q, 2, 0));
  p.clip(x - 2, y + cut, w + 4, h - cut, (c) => c.blit(q, 2 + sway, -cut));
}

/** Small repeated motif for a print: `motif` rows stamped on a grid of `dx`×`dy`, staggered. */
export function printMotif(motif: readonly string[], legend: Legend, dx: number, dy: number, phase = 0) {
  return (p: Px, x: number, y: number, w: number, h: number) => {
    for (let j = -dy, row = 0; j < h + dy; j += dy, row++)
      for (let i = -dx + ((row + phase) % 2 ? Math.floor(dx / 2) : 0); i < w + dx; i += dx) art(p, x + i, y + j, motif, legend);
  };
}

/** A stripe print, `colors` repeating every `width` px, horizontal or vertical. */
export function printStripes(colors: readonly (Color | null)[], width: number, vertical = false) {
  return (p: Px, x: number, y: number, w: number, h: number) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = Math.floor((vertical ? i : j) / width) % colors.length;
      const c = colors[k];
      if (c && p.solid(x + i, y + j)) p.px(x + i, y + j, c);
    }
  };
}

/** A check (gingham): darker where the bands cross. */
export function printCheck(band: Color, cross: Color, size: number) {
  return (p: Px, x: number, y: number, w: number, h: number) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const a = Math.floor(i / size) % 2 === 0, b = Math.floor(j / size) % 2 === 0;
      if (a && b) p.px(x + i, y + j, cross);
      else if (a || b) p.px(x + i, y + j, band);
    }
  };
}

// ── stone and ceramics ─────────────────────────────────────────────────────────

/**
 * A stone drum stool (鼓凳): a barrel bulging a pixel at its waist, one carved band and a row of studs
 * like a drum's nails, a lit elliptical seat. `w` wide, `h` tall overall; (x, y) is the seat's top-left.
 */
export function drumStool(p: Px, x: number, y: number, w: number, h: number, ramp: Ramp = STONE, seed = 1): void {
  const topH = Math.max(4, Math.round(w * 0.4));
  const by = y + Math.round(topH / 2), bodyH = h - Math.round(topH / 2);
  for (let j = 0; j < bodyH; j++) {
    const t = j / Math.max(1, bodyH - 1);
    const k = t < 0.12 || t > 0.9 ? 2 : t > 0.3 && t < 0.7 ? 0 : 1;
    for (let i = k; i < w - k; i++) {
      const u = (i - k + 0.5) / (w - 2 * k);
      p.px(x + i, by + j, step(ramp, j === bodyH - 1 ? 0 : u < 0.28 ? 3 : u < 0.62 ? 2 : u < 0.86 ? 1 : 0));
    }
  }
  // Two carved bands, like a drum's hoops.
  p.over(() => {
    for (const band of [by + 2, by + bodyH - 4]) p.hline(x, band, w, step(ramp, 1)).hline(x, band + 1, w, step(ramp, 3));
  });
  // The seat: a rim, a lit face, the front edge shaded where it rolls over.
  const cx = x + w / 2, cy = y + topH / 2;
  p.ellipse(cx, cy, w / 2, topH / 2, step(ramp, 2));
  p.ellipse(cx, cy - 0.5, w / 2, topH / 2 - 0.5, step(ramp, 3));
  p.ellipse(cx - 0.5, cy - 0.5, w / 2 - 1.5, topH / 2 - 1, step(ramp, 4));
  p.over(() => p.speckle(x, by, w, bodyH, step(ramp, 1), 0.04, seed));
}

/**
 * A glazed pot: a belly-shaped body shaded as a cylinder, a rolled rim, dark soil inside.
 * Returns the soil ellipse's centre and radii.
 */
export function pot(p: Px, x: number, y: number, w: number, h: number, glaze: Ramp, options: { belly?: number; foot?: number; rim?: Ramp; soil?: boolean } = {}) {
  const belly = options.belly ?? 2, foot = options.foot ?? 2;
  const rimH = Math.max(4, Math.round(w * 0.3));
  const body = h - Math.round(rimH / 2);
  const by = y + Math.round(rimH / 2);
  const n = glaze.length;
  for (let j = 0; j < body; j++) {
    const t = j / Math.max(1, body - 1);
    const k = Math.round(t < 0.35 ? belly * (1 - Math.sin((t / 0.35) * Math.PI / 2)) * 0.6 : belly * ((t - 0.35) / 0.65) * 1.0 + (t > 0.9 ? foot - belly * 0.6 : 0));
    const width = w - 2 * Math.max(0, k);
    for (let i = 0; i < width; i++) {
      const u = (i + 0.5) / width;
      const lvl = u < 0.12 ? n - 2 : u < 0.3 ? n - 1 : u < 0.55 ? n - 2 : u < 0.8 ? n - 3 : n - 4;
      p.px(x + Math.max(0, k) + i, by + j, glaze[Math.max(0, lvl)]);
    }
  }
  const rim = options.rim ?? glaze;
  const cx = x + w / 2, cy = y + rimH / 2;
  p.ellipse(cx, cy, w / 2, rimH / 2, rim[Math.max(0, rim.length - 2)]);
  p.ellipse(cx, cy, w / 2 - 1.5, rimH / 2 - 1, options.soil === false ? rim[0] : "brown1");
  if (options.soil !== false) p.ellipse(cx + 0.5, cy + 0.5, w / 2 - 2.5, rimH / 2 - 1.6, "brown2");
  // Glaze highlight along the rim's upper left.
  p.px(Math.round(x + w * 0.2), Math.round(y), rim[rim.length - 1]);
  p.hline(Math.round(x + w * 0.2), Math.round(y), Math.max(1, Math.round(w * 0.25)), rim[rim.length - 1]);
  return { cx, cy, rx: w / 2 - 2, ry: rimH / 2 - 1, by, body };
}

/**
 * A low square plastic stool (小板凳), 19×13: a lid with a hand slot, a skirt, splayed legs with an
 * arch cut between them. `ramp` has five steps, dark to light; `dent` adds a dent in the lid.
 */
export function lowPlasticStool(p: Px, x: number, y: number, ramp: Ramp, dent = false): void {
  art(p, x, y, [
    ".5555555555555555.",
    "54444444444444443.",
    "54444444444444443.",
    dent ? "54444444444443443." : "54444444444444443.",
    "3333333333333333322",
    "322222222222222221.",
    ".32.............21.",
    ".32.............21.",
    ".32...2222222...21.",
    ".32..2.......2..21.",
    ".32.2.........2.21.",
    ".32.............21.",
    ".21.............11.",
  ], { "1": step(ramp, 0), "2": step(ramp, 1), "3": step(ramp, 2), "4": step(ramp, 3), "5": step(ramp, 4) });
  art(p, x + 7, y + 2, ["2222"], { "2": step(ramp, 1) });
}
