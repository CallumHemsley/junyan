/**
 * Private helpers for the lane houses (弄堂, shikumen 石库门): brick, roofs, gates, windows and the
 * clutter of daily life hung on them. Not a sprite set.
 *
 * Every function draws into a `Px` at absolute sprite coordinates. Brick and tile textures key their
 * pattern on absolute coordinates, so pieces drawn in separate calls line up.
 *
 * Light is from the upper left: tops lightest, faces a step darker, right edges and undersides darkest.
 * Reveals: the left reveal of an opening (facing east) is shaded, the right reveal (facing west) is lit,
 * the lintel's underside is darkest.
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

const pick = <T>(list: readonly T[], t: number): T => list[Math.min(list.length - 1, Math.floor(t * list.length))];

// ── brick ────────────────────────────────────────────────────────────────────

export type BrickTone = {
  /** Brick faces, weighted by repetition. */
  faces: readonly Color[];
  /** Top-left lit edge of an occasional proud brick. */
  lit: Color;
  mortar: Color;
};
/** Shanghai grey brick (青砖): cool grey faces, lime pointing a step lighter. */
export const GREY_BRICK: BrickTone = { faces: ["steel3", "stone3", "steel3", "stone3", "steel3", "stone3", "steel3", "stone2", "steel3", "stone3"], lit: "steel4", mortar: "stone3" };
/** The red brick of the banding courses: rose, never lacquer red. */
export const RED_BRICK: BrickTone = { faces: ["rose3", "rose3", "rose2", "rose3", "rose4", "rose3"], lit: "rose4", mortar: "stone3" };
/** Sooty grey brick low on the wall, where rain splashes back and bicycles lean. */
export const SOOT_BRICK: BrickTone = { faces: ["steel2", "stone2", "steel2", "steel3"], lit: "steel3", mortar: "stone2" };

/**
 * Stretcher-bond brick: courses 4px (3 brick + 1 mortar), bricks 8px with a 1px head joint, each
 * course offset by half a brick. Pattern keyed on absolute coordinates.
 */
export function bricks(p: Px, x: number, y: number, w: number, h: number, seed: number, tone: BrickTone = GREY_BRICK): void {
  for (let yy = y; yy < y + h; yy++) {
    const course = yy >> 2, row = yy & 3;
    const offset = course & 1 ? 4 : 0;
    for (let xx = x; xx < x + w; xx++) {
      const bi = (xx + offset) >> 3, bx = (xx + offset) & 7;
      if (row === 3 || bx === 7) { p.px(xx, yy, tone.mortar); continue; }
      const face = pick(tone.faces, hash(bi, course, seed));
      // A proud brick now and then catches the sun on its top edge.
      const proud = hash(bi, course, seed + 7) > 0.86;
      p.px(xx, yy, proud && row === 0 && bx < 6 ? tone.lit : face);
    }
  }
}

/** A string course: a projecting stone ledge, lit top, shadow cast on the wall below it. */
export function stringCourse(p: Px, x: number, y: number, w: number, seed: number): void {
  p.hline(x, y, w, "stone5").hline(x, y + 1, w, "stone4").hline(x, y + 2, w, "stone3").hline(x, y + 3, w, "steel2");
  for (let xx = x; xx < x + w; xx++) if (hash(xx >> 2, y, seed) > 0.7) p.px(xx, y, "stone4");
  // Chips knocked out of the ledge's lip.
  for (let i = 0; i < Math.floor(w / 40); i++) {
    const cx = x + 4 + Math.floor(hash(i, y, seed + 3) * (w - 8));
    p.px(cx, y + 1, "stone2").px(cx + 1, y + 1, "stone3");
  }
}

/** Grime and splash-back along the base of a wall: soot brick, then a damp line. */
export function plinth(p: Px, x: number, base: number, w: number, seed: number, rows = 6): void {
  bricks(p, x, base - rows, w, rows, seed, SOOT_BRICK);
  p.hline(x, base - rows - 1, w, "stone4");
  for (let xx = x; xx < x + w; xx++) if (hash(xx >> 1, base, seed) > 0.6) p.px(xx, base - rows, "stone2");
  p.hline(x, base, w, "steel1");
}

/** One step darker along each ramp, for stains and cast shadows. */
const DARKER: Partial<Record<Color, Color>> = {
  steel6: "steel5", steel5: "steel4", steel4: "steel3", steel3: "steel2", steel2: "steel1",
  stone5: "stone4", stone4: "stone3", stone3: "stone2", stone2: "stone1",
  rose4: "rose3", rose3: "rose2", rose2: "rose1", cream5: "cream4", cream4: "cream3", cream3: "cream2", cream2: "cream1",
  leaf5: "leaf4", leaf4: "leaf3", leaf3: "leaf2", leaf2: "leaf1", wood4: "wood3", wood3: "wood2", wood2: "wood1",
  blue5: "blue4", blue4: "blue3", blue3: "blue2", blue2: "blue1",
};

/**
 * A shadow cast down-right by something standing on a roof (the sun is upper left): a parallelogram
 * `w` wide from (x, y), `h` tall, leaning right by `lean` px per row. Darkens one step what is under it.
 */
export function castShadow(p: Px, x: number, y: number, w: number, h: number, lean = 0.5): void {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const xx = x + i + Math.round(j * lean), c = p.get(xx, y + j);
    if (c && DARKER[c]) p.px(xx, y + j, DARKER[c]!);
  }
}

/** A dark streak run down a wall from a drip (an AC unit, a broken gutter): one step darker. */
export function stain(p: Px, x: number, y: number, w: number, h: number): void {
  const darker = DARKER;
  for (let j = 0; j < h; j++) {
    const taper = Math.round((w * (h - j)) / h / 2);
    for (let i = -taper; i <= taper; i++) {
      const xx = x + Math.floor(w / 2) + i, c = p.get(xx, y + j);
      if (c && darker[c] && (Math.abs(i) < taper || (j & 1) === 0)) p.px(xx, y + j, darker[c]!);
    }
  }
}

/** A patch of cement render where brick was mended, with a hairline crack. */
export function renderPatch(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  p.rect(x, y, w, h, "stone4");
  p.hline(x, y, w, "stone5").vline(x, y, h, "stone5").hline(x + 1, y + h - 1, w - 1, "stone3").vline(x + w - 1, y + 1, h - 1, "stone3");
  let cx = x + 2 + Math.floor(hash(seed, 1, 5) * (w - 4));
  for (let yy = y + 1; yy < y + h - 1; yy++) { p.px(cx, yy, "stone2"); if (hash(yy, seed, 2) > 0.6) cx += hash(yy, seed, 3) > 0.5 ? 1 : -1; }
}

// ── roofs ────────────────────────────────────────────────────────────────────

/** Tones for one slope of grey pantiles: cap roll lit/mid/shade, channel shadow/floor/rise, course lip. */
type TileTone = { capHead: Color; capLit: Color; cap: Color; capShade: Color; chDeep: Color; ch: Color; chRise: Color; lip: Color };
const SOUTH_TILES: TileTone = { capHead: "steel5", capLit: "steel4", cap: "steel3", capShade: "steel2", chDeep: "steel2", ch: "steel2", chRise: "steel3", lip: "steel1" };
const NORTH_TILES: TileTone = { capHead: "steel6", capLit: "steel5", cap: "steel4", capShade: "steel3", chDeep: "steel3", ch: "steel3", chRise: "steel4", lip: "steel2" };
/** Newer tiles laid in a mend, warmer and paler: not yet weathered. */
const NEW_TILES: TileTone = { capHead: "stone5", capLit: "stone5", cap: "stone4", capShade: "stone3", chDeep: "stone3", ch: "stone3", chRise: "stone4", lip: "stone2" };
/** Lichen-darkened tiles in the damp patches: a warm brown-grey, a step down. */
const OLD_TILES: TileTone = { capHead: "steel4", capLit: "steel3", cap: "stone2", capShade: "steel2", chDeep: "steel1", ch: "steel2", chRise: "steel2", lip: "steel1" };

export type Slope = "south" | "north";

/** Pantile column period and course height, art px. */
export const TILE_COL = 8, TILE_COURSE = 6;

/**
 * Grey clay pantiles (小青瓦) on one slope, seen from above: columns 8px wide (a 4px convex cap roll over
 * the joint, then a 4px channel of concave pan tiles), courses 6px down the slope. Weathering comes in
 * patches (damp corners go brown with lichen), never as single dark tiles; a cap or two has slipped.
 * `mend` paints a rectangle of newer tiles.
 */
export function pantiles(p: Px, x: number, y: number, w: number, h: number, seed: number, slope: Slope = "south",
  options: { mend?: readonly [number, number, number, number]; damp?: number } = {}): void {
  const base = slope === "south" ? SOUTH_TILES : NORTH_TILES;
  const damp = options.damp ?? 0.08;
  // Damp patches: soft elliptical blobs, more of them low on the slope where the water runs off.
  const blobs = Array.from({ length: Math.round((w * h * damp) / 900) }, (_, i) => {
    const ry = 6 + hash(i, 3, seed + 5) * 10;
    return { cx: x + hash(i, 1, seed + 5) * w, cy: y + h * Math.sqrt(hash(i, 2, seed + 5)), rx: ry * (1.4 + hash(i, 4, seed + 5)), ry };
  });
  const wetness = (px0: number, py0: number) => blobs.reduce((m, b) => Math.max(m, 1 - Math.hypot((px0 - b.cx) / b.rx, (py0 - b.cy) / b.ry)), 0);
  // Old roofs sag between the gable walls: courses dip a little toward the middle of the run.
  const sag = (xx: number) => Math.round(2 * Math.sin((Math.PI * (xx - x)) / Math.max(1, w)));
  for (let xx = x; xx < x + w; xx++) {
    const col = Math.floor(xx / TILE_COL), c = ((xx % TILE_COL) + TILE_COL) % TILE_COL;
    // Each column's courses are laid by hand: a pixel of drift between neighbours.
    const drift = hash(col, 3, seed) > 0.7 ? 1 : 0;
    for (let yy = y; yy < y + h; yy++) {
      const ty = yy + drift - (slope === "south" ? sag(xx) : 0);
      const course = Math.floor(ty / TILE_COURSE), r = ((ty % TILE_COURSE) + TILE_COURSE) % TILE_COURSE;
      const m = options.mend;
      // The mend is laid course by course, so its edge is ragged by whole tiles.
      const ragTop = m ? Math.floor(hash(col, 1, seed + 13) * 2) * TILE_COURSE : 0, ragBot = m ? Math.floor(hash(col, 2, seed + 13) * 2) * TILE_COURSE : 0;
      const inMend = m && xx >= m[0] && xx < m[0] + m[2] && yy >= m[1] + ragTop && yy < m[1] + m[3] - ragBot;
      // A tile is damp if the blob field reaches it, with a ragged edge decided tile by tile.
      const tileX = col * TILE_COL + 2, tileY = course * TILE_COURSE + 3;
      const patch = wetness(tileX, tileY) > 0.15 + 0.5 * hash(col, course, seed);
      const t = inMend ? NEW_TILES : patch ? (slope === "south" ? OLD_TILES : SOUTH_TILES) : base;
      const slipped = !inMend && hash(col, course, seed + 11) > 0.992;
      let paint: Color;
      if (c < 4 && !slipped) {
        paint = c === 0 ? t.capLit : c === 3 ? t.capShade : t.cap;
        if (r === TILE_COURSE - 1) paint = c === 0 ? t.capShade : t.lip;     // the tile's lower end, in shadow
        else if (r === 0 && c < 2) paint = t.capHead;                       // its rounded head catches the sun
      } else {
        const k = slipped ? c % 4 : c - 4;
        paint = k === 0 ? t.chDeep : k === 3 ? t.chRise : t.ch;
        if (r === TILE_COURSE - 1 && k < 3) paint = t.lip;
      }
      p.px(xx, yy, paint);
    }
  }
}

/** The ridge: lime-mortared tiles stood on edge, 6 rows. Its shadow falls on the south slope. */
export function ridge(p: Px, x: number, y: number, w: number, seed: number): void {
  p.hline(x, y, w, "stone3").hline(x, y + 1, w, "stone5");
  for (let xx = x; xx < x + w; xx++) {
    const k = ((xx % 3) + 3) % 3;
    p.px(xx, y + 2, k === 0 ? "steel2" : k === 1 ? "steel4" : "steel3");
    p.px(xx, y + 3, k === 0 ? "steel1" : k === 1 ? "steel3" : "steel2");
    if (hash(xx >> 2, y, seed) > 0.75) p.px(xx, y + 1, "stone4");
  }
  p.hline(x, y + 4, w, "stone4").hline(x, y + 5, w, "steel1");
  for (let xx = x; xx < x + w; xx++) if (hash(xx >> 1, y + 4, seed) > 0.65) p.px(xx, y + 4, "stone3");
}

/** Upturned ridge end (a little plaster horn) at x, ridge row y; `flip` for the east end. */
export function ridgeEnd(p: Px, x: number, y: number, flip = false): void {
  const rows = flip
    ? ["...ab", "..abb", ".abbc", "abbcd", "bbccd", "cccdd", "ddddd"]
    : ["ba...", "bba..", "cbba.", "dcbba", "dccbb", "ddccc", "ddddd"];
  block(p, x, y - 3, rows, { a: "stone5", b: "stone4", c: "stone3", d: "steel1" }, "ridgeEnd");
}

/**
 * The eave: a row of round tile ends (瓦当) under the cap rolls and pointed drip tiles (滴水) under the
 * channels, 5 rows, then a soft shadow on the wall below (`shadowRows`).
 */
export function eave(p: Px, x: number, y: number, w: number, shadowRows = 3): void {
  for (let xx = x; xx < x + w; xx++) {
    const c = ((xx % TILE_COL) + TILE_COL) % TILE_COL;
    const cap = ["abb.", "abbc", "bbcc", "bccd", ".dd."], drip = ["bbbc", "bccc", ".ccd", ".dd.", "...."];
    const col = c < 4 ? cap : drip, k = c % 4;
    for (let r = 0; r < 5; r++) {
      const ch = col[r][k];
      const paint: Color | null = ch === "a" ? "steel5" : ch === "b" ? "steel4" : ch === "c" ? "steel3" : ch === "d" ? "steel1" : null;
      if (paint) p.px(xx, y + r, paint);
    }
  }
  for (let r = 0; r < shadowRows; r++) p.over((q) => {
    for (let xx = x; xx < x + w; xx++) {
      const yy = y + 5 + r;
      if (!q.get(xx, yy) || q.get(xx, yy - 1) === null) continue;
      if (r === 0 || (r === 1 && (xx & 1) === 0) || (r === 2 && (xx % 4) === 0)) q.px(xx, yy, r === 0 ? "steel1" : "steel2");
    }
  });
}

/** A gable wall's coping running down the roof edge: a lime-capped brick wall top, 5px wide. */
export function coping(p: Px, x: number, y: number, h: number, side: "left" | "right"): void {
  const prof: Color[] = side === "left" ? ["steel1", "stone4", "stone5", "stone4", "stone3"] : ["stone4", "stone5", "stone4", "stone3", "steel1"];
  for (let i = 0; i < 5; i++) p.vline(x + i, y, h, prof[i]);
  for (let yy = y + 3; yy < y + h; yy += 7) p.hline(x + 1, yy, 3, "stone3");
  // The coping's shadow falls on the tiles to its right (sun from the left).
  if (side === "left") p.over((q) => q.vline(x + 5, y, h, "steel1"));
}

/**
 * Moss in the channels, gathered in `count` colonies where water sits: each a cluster of tufts down a
 * few neighbouring channels, lit on top.
 */
export function moss(p: Px, x: number, y: number, w: number, h: number, seed: number, count: number): void {
  const tufts = [
    [".ab.", "abcc", "bccd"],
    ["..a..", ".abb.", "abbcc", "bcccd"],
    ["ab", "cc"],
    [".ab", "abc", "bcd", ".d."],
  ];
  for (let i = 0; i < count; i++) {
    const cx = x + Math.floor(hash(i, 1, seed) * w), cy = y + Math.floor(hash(i, 2, seed) * h);
    const n = 2 + Math.floor(hash(i, 4, seed) * 4);
    for (let k = 0; k < n; k++) {
      const tx = cx + Math.floor((hash(i, k + 10, seed) - 0.5) * 22), ty = cy + Math.floor((hash(i, k + 20, seed) - 0.5) * 14);
      const t = pick(tufts, hash(i, k + 30, seed));
      const snapped = Math.floor(tx / TILE_COL) * TILE_COL + 4;
      p.clip(x, y, w, h, () => p.rows(snapped - x, ty - y, t, { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1" }));
    }
  }
}

/**
 * A tiger window (老虎窗): a dormer pushed out of the south slope, its own little pitched roof (ridge
 * running down the slope, so its tiles run across), a rendered gable with a barge board, and a two-leaf
 * casement facing the lane. `w` wide (even, 28–44), `w - 2` tall from (x, y).
 */
export function tigerWindow(p: Px, x: number, y: number, seed: number,
  options: { w?: number; open?: boolean; plant?: boolean; frame?: Color; curtain?: Color } = {}): void {
  const W = options.w ?? 36, half = W / 2, H = W - 2;
  const roofRows = Math.round(W * 0.3);
  // Dormer roof seen from above: two slopes meeting at a ridge down the middle.
  for (let j = 0; j < roofRows; j++) for (let i = 1; i < W - 1; i++) {
    const left = i < half;
    // Tiles run across each slope: rolls in courses of 4, the lit slope west, the shaded slope east.
    const r = (i + (left ? 0 : 1)) % 4;
    const lit: Color[] = ["steel5", "steel4", "steel4", "steel3"], dark: Color[] = ["steel3", "steel2", "steel2", "steel1"];
    p.px(x + i, y + j, j % 5 === 4 ? (left ? "steel3" : "steel1") : (left ? lit : dark)[r]);
  }
  p.vline(x + half - 1, y, roofRows, "stone5").vline(x + half, y, roofRows, "stone3");
  p.vline(x + 1, y, roofRows, "steel1").vline(x + W - 2, y, roofRows, "steel1");
  // Gable: a triangle of lime render in the front of the dormer roof, a barge board along each rake.
  const gy = y + roofRows, peak = Math.round(W * 0.22);
  p.poly([[x + 1, gy + 1], [x + half, gy - peak + 1], [x + W - 1, gy + 1]], "cream3");
  p.poly([[x + 4, gy + 1], [x + half, gy - peak + 4], [x + W - 4, gy + 1]], "cream4");
  p.line(x, gy, x + half - 1, gy - peak, "wood3").line(x + 1, gy, x + half - 1, gy - peak + 1, "wood4");
  p.line(x + half, gy - peak, x + W - 1, gy, "wood1").line(x + half, gy - peak + 1, x + W - 2, gy, "wood2");
  // A little round vent in the gable.
  p.rect(x + half - 2, gy - 5, 4, 3, "ink2").px(x + half - 2, gy - 5, "cream3").px(x + half + 1, gy - 3, "cream5");
  // Cheeks and the front wall round the casement.
  const fy = gy + 1, fh = H - roofRows - 4;
  p.rect(x + 2, fy, W - 4, fh, "cream3");
  p.vline(x + 2, fy, fh, "cream4").vline(x + W - 3, fy, fh, "cream2");
  p.hline(x + 2, fy, W - 4, "steel1");
  // Casement.
  const frame = options.frame ?? "wood3";
  const cx0 = x + 6, cw = W - 12, cy0 = fy + 2, ch = fh - 5;
  p.rect(cx0 - 1, cy0 - 1, cw + 2, ch + 2, "ink2");
  p.rect(cx0, cy0, cw, ch, frame);
  const gw = Math.floor((cw - 3) / 2);
  for (const gx of [cx0 + 1, cx0 + 2 + gw]) {
    p.rect(gx, cy0 + 1, gw, ch - 2, "blue2");
    for (let j = 0; j < ch - 2; j++) for (let i = 0; i < gw; i++) {
      const t = i + j * 1.4;
      if (t < 3) p.px(gx + i, cy0 + 1 + j, "blue5"); else if (t < 7) p.px(gx + i, cy0 + 1 + j, "blue4"); else if (t < 12) p.px(gx + i, cy0 + 1 + j, "blue3");
    }
    p.hline(gx, cy0 + 1 + Math.floor((ch - 2) / 2), gw, frame);
    if (options.curtain) for (let j = 2; j < ch - 2; j++) p.px(gx + gw - 1 - (j % 3 === 0 ? 1 : 0), cy0 + j, options.curtain);
  }
  if (options.open) {
    // The right casement swung out to the lane: its edge stands proud, the room dark behind.
    const gx = cx0 + 2 + gw;
    p.rect(gx, cy0 + 1, gw, ch - 2, "ink2");
    p.vline(cx0 + cw, cy0 - 2, ch + 3, "wood4").vline(cx0 + cw + 1, cy0 - 1, ch + 2, "wood2");
    p.px(cx0 + cw + 1, cy0 + 2, "blue4").px(cx0 + cw + 1, cy0 + 3, "blue3");
  }
  // Sill and lead flashing where the dormer meets the slope.
  p.rect(x + 3, fy + fh - 3, W - 6, 2, "stone5").hline(x + 3, fy + fh - 1, W - 6, "stone3");
  p.hline(x + 1, fy + fh, W - 2, "steel4").hline(x + 1, fy + fh + 1, W - 2, "steel1");
  p.vline(x + 1, fy, fh, "steel1").vline(x + W - 2, fy, fh, "steel1");
  if (options.plant) block(p, cx0 + 1, fy + fh - 9, [".b.c..", "abccb.", "dbcdc.", ".bdcd.", ".eef..", ".eff.."], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1", e: "orange2", f: "orange1" }, "dormerPlant");
  void seed;
}

/**
 * A galvanised water tank on a brick plinth, 26 × 34 from (x, y): a drum seen from above and in
 * front, rivet seams, a rust run from the overflow, an inlet pipe.
 */
export function waterTank(p: Px, x: number, y: number, seed: number): void {
  // Plinth.
  bricks(p, x + 1, y + 26, 24, 7, seed);
  p.hline(x + 1, y + 25, 24, "stone4").hline(x, y + 33, 26, "steel1");
  p.vline(x, y + 25, 8, "steel1").vline(x + 25, y + 25, 8, "steel1");
  // Drum body.
  for (let yy = y + 7; yy < y + 26; yy++) for (let i = 0; i < 22; i++) {
    const c: Color = i < 2 ? "steel4" : i < 7 ? "steel5" : i < 13 ? "steel4" : i < 18 ? "steel3" : "steel2";
    p.px(x + 2 + i, yy, c);
  }
  for (const yy of [y + 13, y + 20]) { p.hline(x + 2, yy, 22, "steel3"); p.hline(x + 7, yy, 6, "steel4"); }
  for (let yy = y + 9; yy < y + 25; yy += 3) p.px(x + 3, yy, "steel3");
  // Lid: an ellipse seen from above, a manhole with a handle.
  p.ellipse(x + 13, y + 7, 11, 5, "steel3");
  p.ellipse(x + 13, y + 6.5, 10.5, 4.5, "steel5");
  p.ellipse(x + 14, y + 7, 9, 3.5, "steel4");
  p.ellipse(x + 13, y + 6, 4, 2, "steel3");
  p.hline(x + 11, y + 5, 4, "steel6");
  p.hline(x + 2, y + 25, 22, "steel1");
  p.vline(x + 1, y + 7, 18, "steel1").vline(x + 24, y + 7, 18, "steel1");
  // Rust from the overflow spout.
  p.px(x + 19, y + 10, "steel1").px(x + 20, y + 10, "steel1");
  for (let j = 0; j < 9; j++) p.px(x + 19 + (j > 5 ? 1 : 0), y + 11 + j, j < 3 ? "orange1" : j < 6 ? "wood3" : "gold1");
  p.px(x + 18, y + 13, "wood3");
  // Inlet pipe dropping into the roof.
  p.vline(x + 5, y + 24, 3, "steel2");
}

/** A solar water heater (太阳能热水器): a rack of glass tubes over a white tank, 40 × 26 from (x, y). */
export function solarHeater(p: Px, x: number, y: number): void {
  // Tank across the top.
  p.rect(x, y, 40, 7, "steel5");
  p.hline(x, y, 40, "steel6").hline(x, y + 6, 40, "steel3").vline(x, y, 7, "steel4").vline(x + 39, y, 7, "steel2");
  p.rect(x + 1, y + 1, 4, 5, "steel4").rect(x + 35, y + 1, 4, 5, "steel4");
  // Tubes running down toward the lane, dark glass with a lit stripe.
  for (let i = 0; i < 12; i++) {
    const tx = x + 2 + i * 3;
    p.vline(tx, y + 7, 16, "blue1").vline(tx + 1, y + 7, 16, "blue2");
    p.px(tx, y + 8, "blue4").px(tx, y + 9, "blue3");
  }
  // Frame legs and the bottom rail.
  p.hline(x, y + 23, 40, "steel3").hline(x, y + 24, 40, "steel1");
  p.vline(x + 1, y + 7, 17, "steel3").vline(x + 38, y + 7, 17, "steel2");
  p.line(x + 1, y + 24, x + 4, y + 25, "steel2").line(x + 38, y + 24, x + 35, y + 25, "steel2");
}

/**
 * A bamboo drying rack on a flat roof: two X trestles and a pole with a quilt thrown over it to air,
 * `w` wide, 22 tall from (x, y). `quilt` picks the cover's print.
 */
export function quiltRack(p: Px, x: number, y: number, w: number, quilt: "peony" | "check" | "plain"): void {
  for (const tx of [x + 1, x + w - 6]) {
    p.line(tx, y + 21, tx + 5, y + 3, "bamboo2").line(tx + 5, y + 21, tx, y + 3, "bamboo3");
  }
  p.hline(x, y + 3, w, "bamboo4").hline(x, y + 4, w, "bamboo2");
  for (let xx = x + 3; xx < x + w; xx += 9) p.px(xx, y + 3, "bamboo2");
  // The quilt, folded over the pole: its top fold lit, hanging face in front with a soft hem.
  const qx = x + 4, qw = w - 8;
  const cloth: Record<string, [Color, Color, Color]> = { peony: ["pink3", "pink2", "pink1"], check: ["blue5", "blue4", "blue3"], plain: ["cream4", "cream3", "cream2"] };
  const [lit, face, shade] = cloth[quilt];
  p.rect(qx, y + 1, qw, 3, lit);
  p.rect(qx, y + 4, qw, 12, face);
  for (let i = 0; i < qw; i++) {
    const hem = y + 15 + (Math.sin(i * 0.7) > 0.3 ? 1 : 0);
    p.px(qx + i, hem, shade);
  }
  p.vline(qx + qw - 1, y + 2, 13, shade);
  if (quilt === "peony") for (let i = 0; i < qw - 6; i += 7) block(p, qx + 2 + i, y + 6 + (i % 2) * 4, [".a.", "aba", ".c."], { a: "pink1", b: "gold4", c: "leaf2" }, "peony");
  if (quilt === "check") for (let i = 0; i < qw; i += 4) { p.vline(qx + i, y + 4, 11, "blue3"); }
  if (quilt === "check") for (let j = 6; j < 15; j += 4) p.hline(qx, y + j, qw, "blue3");
  p.hline(qx, y + 1, qw, "white");
}

/** Polystyrene boxes of scallions and a chili pot on a roof terrace: a rooftop garden, 30 × 14. */
export function roofGarden(p: Px, x: number, y: number): void {
  for (const [bx, by] of [[x, y + 4], [x + 13, y + 5]] as const) {
    p.rect(bx, by + 4, 12, 6, "steel6");
    p.hline(bx, by + 4, 12, "white").hline(bx, by + 9, 12, "steel4").vline(bx + 11, by + 4, 6, "steel4");
    p.rect(bx + 1, by + 5, 10, 2, "wood2");
    for (let i = 0; i < 5; i++) p.vline(bx + 1 + i * 2, by + (i % 2), 6 - (i % 2), i % 2 ? "leaf4" : "leaf3");
  }
  // A terracotta pot with a chili plant: a few red pods, the one red allowed on this roof.
  block(p, x + 25, y, [".ab.", "abbc", "bcbc", ".r.c", "deed", "deef", ".ff."],
    { a: "leaf4", b: "leaf3", c: "leaf2", r: "red3", d: "orange2", e: "orange1", f: "rose2" }, "chili");
}

/** A TV aerial on a pole with a guy wire, (x, y) the foot; rises 26px. */
export function aerial(p: Px, x: number, y: number): void {
  p.vline(x, y - 26, 26, "steel2").vline(x + 1, y - 24, 22, "steel4");
  for (const [dy, half] of [[-25, 6], [-21, 5], [-17, 4]] as const) p.hline(x - half, y + dy, half * 2 + 2, "steel3");
  p.px(x - 6, y - 25, "steel5");
  p.line(x, y - 18, x + 9, y - 2, "steel3");
  p.rect(x - 1, y - 1, 4, 2, "steel1");
}

/** A pigeon loft: a slatted timber box with a landing board, 30 × 26 from (x, y). */
export function pigeonLoft(p: Px, x: number, y: number): void {
  // Felt roof seen from above.
  p.rect(x, y, 30, 8, "steel2");
  p.hline(x, y, 30, "steel3").hline(x, y + 7, 30, "steel1");
  for (let xx = x + 3; xx < x + 30; xx += 7) p.vline(xx, y + 1, 6, "steel1");
  // Slatted front.
  for (let j = 0; j < 14; j++) p.hline(x + 1, y + 8 + j, 28, j % 3 === 2 ? "wood2" : j % 3 === 0 ? "wood4" : "wood3");
  // Two dark entry holes with a landing board, and a perch of pigeon droppings below.
  for (const hx of [x + 6, x + 19]) {
    p.rect(hx, y + 11, 5, 5, "ink");
    p.px(hx, y + 11, "wood2").px(hx + 4, y + 11, "wood2");
  }
  p.hline(x - 1, y + 17, 32, "wood5").hline(x - 1, y + 18, 32, "wood2");
  for (const dx of [4, 9, 22, 25]) p.px(x + dx, y + 19, "white");
  p.vline(x, y + 8, 14, "wood1").vline(x + 29, y + 8, 14, "wood1");
  p.hline(x, y + 22, 30, "wood1");
  p.rect(x + 2, y + 23, 2, 3, "wood1").rect(x + 26, y + 23, 2, 3, "wood1");
}

/** A skylight of wired glass in a timber curb, w × h on the slope. Reflects the sky. */
export function skylight(p: Px, x: number, y: number, w: number, h: number): void {
  p.rect(x, y, w, h, "wood2");
  p.hline(x, y, w, "wood4").vline(x, y, h, "wood3");
  p.rect(x + 2, y + 2, w - 4, h - 4, "blue3");
  for (let j = 0; j < h - 4; j++) for (let i = 0; i < w - 4; i++) {
    const t = i + j * 2;
    if (t < 4) p.px(x + 2 + i, y + 2 + j, "blue5");
    else if (t < 9) p.px(x + 2 + i, y + 2 + j, "blue4");
  }
  for (let xx = x + 2 + 3; xx < x + w - 2; xx += 4) p.vline(xx, y + 2, h - 4, "steel2");
  p.hline(x, y + h - 1, w, "wood1").vline(x + w - 1, y, h, "wood1");
}

/** A blue tarpaulin over a leak, held down with bricks: w × h, the patch everybody means to fix. */
export function tarp(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const fold = Math.sin((i + j * 0.3) * 0.5 + seed) > 0.55;
    p.px(x + i, y + j, fold ? "blue4" : (i + j) % 11 === 0 ? "blue2" : "blue3");
  }
  p.hline(x, y, w, "blue5").vline(x + w - 1, y, h, "blue2").hline(x, y + h - 1, w, "blue2");
  // Eyelets.
  for (const [ex, ey] of [[x + 1, y + 1], [x + w - 2, y + 1], [x + 1, y + h - 2], [x + w - 2, y + h - 2]]) p.px(ex, ey, "steel4");
  const brick = ["abbb", "bccd", "dddd"];
  for (const [bx, by] of [[x - 2, y + 2], [x + w - 3, y + 3], [x + Math.floor(w / 2) - 2, y + h - 3]]) block(p, bx, by, brick, { a: "rose4", b: "rose3", c: "rose2", d: "rose1" }, "brick");
}

// ── gates and doors ──────────────────────────────────────────────────────────

export type Pediment = "triangle" | "arch" | "scroll";
export type GateOptions = {
  /** Door opening height, from the threshold's top. */
  doorH: number;
  pediment: Pediment;
  /** Which leaf stands open (the scene adds the open leaf as its own sprite), or none. */
  open?: "left" | null;
  /** Door lacquer: black (most), or a family's oxblood. */
  lacquer?: "black" | "oxblood";
  /** Faded paper couplets on the jambs, from New Year. */
  couplets?: boolean;
  seed: number;
};

/** Height the gate rises above `baseY`, threshold to pediment tip. */
export const gateHeight = (o: Pick<GateOptions, "doorH" | "pediment">) => o.doorH + 3 + 10 + 3 + (o.pediment === "scroll" ? 14 : 18);

/**
 * A shikumen stone gate: granite jambs and lintel round a black-lacquered double door with brass
 * rings, a blank plaque on the lintel (the family's four characters are long gone; DOM may label it),
 * a cornice, and a carved pediment. The door opening is x0..x1 (exclusive); `baseY` is the bottom row.
 */
export function stoneGate(p: Px, x0: number, x1: number, baseY: number, o: GateOptions): void {
  const J = 7, dw = x1 - x0, top = baseY - 3 - o.doorH, lintelTop = top - 10;
  // Jambs.
  for (const [jx, side] of [[x0 - J, "l"], [x1, "r"]] as const) {
    p.rect(jx, lintelTop, J, baseY - lintelTop + 1, "stone4");
    p.vline(jx, lintelTop, baseY - lintelTop + 1, "stone5");
    p.vline(jx + J - 1, lintelTop, baseY - lintelTop + 1, "stone3");
    // A sunk moulding up each jamb.
    p.vline(jx + 2, top + 2, o.doorH - 2, side === "l" ? "stone3" : "stone3").vline(jx + 3, top + 2, o.doorH - 2, "stone5");
    // Base block.
    p.rect(jx - 1, baseY - 8, J + 2, 9, "stone4");
    p.hline(jx - 1, baseY - 8, J + 2, "stone5").vline(jx + J, baseY - 8, 9, "stone2").hline(jx - 1, baseY, J + 2, "steel1");
    p.vline(jx - 1, baseY - 8, 9, side === "l" ? "steel1" : "stone3");
  }
  // Wear: bicycle handlebars and shoulders have rubbed the jambs smooth and dark at hip height.
  for (const jx of [x0 - J + 1, x1 + 1]) for (let yy = baseY - 30; yy < baseY - 20; yy++) if (hash(jx, yy, o.seed) > 0.4) p.px(jx + 3, yy, "stone3");
  // Lintel with its blank plaque.
  p.rect(x0 - J - 2, lintelTop, dw + 2 * J + 4, 10, "stone4");
  p.hline(x0 - J - 2, lintelTop, dw + 2 * J + 4, "stone5").hline(x0 - J - 2, lintelTop + 9, dw + 2 * J + 4, "stone3");
  const plaqueW = Math.max(16, dw - 10);
  const px0 = x0 + Math.floor((dw - plaqueW) / 2);
  p.rect(px0, lintelTop + 2, plaqueW, 6, "stone5");
  p.hline(px0, lintelTop + 2, plaqueW, "stone3").vline(px0, lintelTop + 2, 6, "stone3");
  p.hline(px0 + 1, lintelTop + 7, plaqueW - 1, "cream4");
  // Cornice: a projecting ledge over the lintel.
  const cy = lintelTop - 3;
  p.hline(x0 - J - 4, cy, dw + 2 * J + 8, "stone5").hline(x0 - J - 4, cy + 1, dw + 2 * J + 8, "stone4").hline(x0 - J - 4, cy + 2, dw + 2 * J + 8, "steel2");
  pediment(p, x0 - J - 2, x1 + J + 2, cy, o);
  // The opening.
  p.rect(x0, top, dw, o.doorH, "ink");
  const mid = x0 + Math.floor(dw / 2);
  if (o.open === "left") courtyard(p, x0, top, mid - x0, o.doorH, o.seed);
  leaf(p, o.open === "left" ? mid : x0, top + 2, o.open === "left" ? x1 - mid - 2 : mid - x0, o.doorH - 2, "left", o);
  if (o.open !== "left") leaf(p, mid, top + 2, x1 - mid - 2, o.doorH - 2, "right", o);
  else leaf(p, mid, top + 2, x1 - mid - 2, o.doorH - 2, "right", o);
  // Reveals: underside of the lintel dark, the left reveal shaded, the right reveal lit.
  p.hline(x0, top, dw, "ink").hline(x0, top + 1, dw, "ink2");
  p.vline(x0, top + 1, o.doorH - 1, o.open === "left" ? "ink" : "stone2").vline(x1 - 2, top + 1, o.doorH - 1, "stone4").vline(x1 - 1, top + 1, o.doorH - 1, "stone5");
  // Threshold: a worn granite sill, dished in the middle by a century of feet.
  p.rect(x0 - 1, baseY - 3, dw + 2, 4, "stone4");
  p.hline(x0 - 1, baseY - 3, dw + 2, "stone5").hline(x0 - 1, baseY, dw + 2, "steel1");
  const dish = Math.floor(dw / 3);
  p.hline(x0 + dish, baseY - 3, dw - 2 * dish, "stone3").hline(x0 + dish + 3, baseY - 2, dw - 2 * dish - 6, "stone3");
  if (o.couplets) for (const cx of [x0 - J + 1, x1 + 1]) {
    p.rect(cx + 1, top + 4, 4, Math.floor(o.doorH * 0.7), "cream4");
    p.vline(cx + 1, top + 4, Math.floor(o.doorH * 0.7), "pink3").vline(cx + 4, top + 4, Math.floor(o.doorH * 0.7), "cream3");
    for (let k = 0; k < 4; k++) p.hline(cx + 2, top + 10 + k * 12, 2, "pink3");
    p.px(cx + 2, top + 10, "cream4").px(cx + 1, top + 24, "cream4").hline(cx, top + 4 + Math.floor(o.doorH * 0.7) - 1, 2, "cream4");
    // A torn corner.
    p.px(cx + 4, top + 4 + Math.floor(o.doorH * 0.7) - 1, "stone4").px(cx + 3, top + 4 + Math.floor(o.doorH * 0.7) - 1, "stone4");
  }
}

/** One lacquered door leaf at (x, y), w × h. `hinge` is the jamb side. */
function leaf(p: Px, x: number, y: number, w: number, h: number, side: "left" | "right", o: GateOptions): void {
  const tone = o.lacquer === "oxblood"
    ? { field: "rose1" as Color, deep: "ink" as Color, gloss: "rose2" as Color, shine: "rose3" as Color }
    : { field: "steel1" as Color, deep: "ink" as Color, gloss: "steel2" as Color, shine: "steel3" as Color };
  p.rect(x, y, w, h, tone.field);
  // Two raised panels: a deep recess line round each, lit top-left bevel.
  const panels = [[y + 4, Math.floor(h * 0.42)], [y + Math.floor(h * 0.42) + 8, h - Math.floor(h * 0.42) - 12]] as const;
  for (const [py, ph] of panels) {
    p.frame(x + 4, py, w - 8, ph, tone.deep);
    p.hline(x + 5, py + 1, w - 10, tone.gloss).vline(x + 5, py + 1, ph - 2, tone.gloss);
  }
  // Long soft gloss on the lacquer, broken where it has crazed.
  for (let yy = y + 3; yy < y + h - 4; yy++) if (hash(x, yy >> 2, o.seed) > 0.35) p.px(x + 2, yy, tone.gloss);
  p.vline(x + 2, y + 6, 6, tone.shine);
  // Meeting stile edge and a bead.
  if (side === "left") p.vline(x + w - 1, y, h, tone.deep);
  else p.vline(x, y, h, tone.deep);
  // Brass ring knocker on a lion-mask plate near the meeting stile.
  const ky = y + Math.floor(h * 0.44), kx = side === "left" ? x + w - 9 : x + 3;
  block(p, kx, ky, [
    ".abb..",
    "abbcd.",
    "bcddc.",
    ".dcd..",
    ".e..e.",
    "e....f",
    "e....f",
    ".e..f.",
    "..ff..",
  ], { a: "gold5", b: "gold4", c: "gold3", d: "gold2", e: "gold3", f: "gold1" }, "knocker");
  // Kick wear: lacquer scuffed to the wood at the foot.
  for (let i = 0; i < w - 4; i++) if (hash(i, y, o.seed + 9) > 0.55) p.px(x + 2 + i, y + h - 2, o.lacquer === "oxblood" ? "rose2" : "wood1");
}

/** Through the open leaf: the courtyard (天井) in sunlight, a carved hall door beyond, a potted plant. */
function courtyard(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  // The passage ceiling and far wall in shadow.
  p.rect(x, y, w, h, "wood1");
  // The hall's lattice doors (格扇) across the courtyard.
  const fy = y + 6, fh = Math.floor(h * 0.62);
  p.rect(x + 1, fy, w - 2, fh, "wood2");
  for (let xx = x + 3; xx < x + w - 2; xx += 4) p.vline(xx, fy + 2, fh - 6, "wood3");
  for (let yy = fy + 3; yy < fy + fh - 4; yy += 4) p.hline(x + 2, yy, w - 4, "wood3");
  p.rect(x + 1, fy + fh - 4, w - 2, 4, "wood2").hline(x + 1, fy + fh - 4, w - 2, "wood3");
  // Sunlit courtyard paving, then the shadow of the gate falling across its near edge.
  const floorY = fy + fh;
  p.rect(x, floorY, w, y + h - floorY, "stone5");
  for (let yy = floorY + 4, k = 0; yy < y + h; yy += 7, k++) {
    p.hline(x, yy, w, "stone4");
    for (let xx = x + (k % 2 ? 3 : 9); xx < x + w; xx += 12) p.vline(xx, yy - 3, 3, "stone4");
  }
  for (let yy = floorY; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (xx - x > w - 6 + (yy - floorY) / 2) p.px(xx, yy, "stone3");
  p.rect(x, y + h - 6, w, 6, "stone3");
  // A glazed pot of aspidistra by the hall door, catching the sun.
  block(p, x + 4, floorY - 9, [
    "..a.b..",
    ".abcbd.",
    "abccdd.",
    ".bcdcd.",
    "..ccd..",
    ".effg..",
    "effffg.",
    "effffg.",
    ".fggg..",
  ], { a: "leaf5", b: "leaf4", c: "leaf3", d: "leaf2", e: "jade5", f: "jade4", g: "jade2" }, "courtyardPot");
  void seed;
}

/** The carved pediment over a gate, its base the cornice row `cy`, spanning x0..x1. */
function pediment(p: Px, x0: number, x1: number, cy: number, o: GateOptions): void {
  const w = x1 - x0, cx = x0 + w / 2;
  if (o.pediment === "triangle") {
    const H = 18;
    p.poly([[x0, cy], [cx, cy - H], [x1, cy]], "stone4");
    p.poly([[x0 + 6, cy - 1], [cx, cy - H + 5], [x1 - 6, cy - 1]], "stone3");
    p.poly([[x0 + 8, cy - 1], [cx, cy - H + 7], [x1 - 8, cy - 1]], "stone4");
    p.line(x0, cy - 1, Math.floor(cx) - 1, cy - H, "stone5").line(Math.ceil(cx), cy - H, x1 - 1, cy - 1, "stone3");
    p.line(x0 + 1, cy - 1, Math.floor(cx), cy - H + 1, "stone5");
    // A carved roundel with a peony spray in the tympanum.
    block(p, Math.round(cx) - 5, cy - 11, [
      "..abba..",
      ".bcddcb.",
      "acdeedca",
      "bdeffedb",
      ".bdccdb.",
      "..bccb..",
    ], { a: "stone5", b: "stone4", c: "stone3", d: "stone4", e: "stone5", f: "cream4" }, "roundel");
    for (const s of [-1, 1]) {
      const sx = Math.round(cx) + s * 9;
      p.line(sx, cy - 6, sx + s * 10, cy - 4, "stone3");
      p.px(sx + s * 4, cy - 7, "stone5").px(sx + s * 8, cy - 6, "stone5");
    }
  } else if (o.pediment === "arch") {
    const H = 18;
    for (let xx = x0; xx < x1; xx++) {
      const u = (xx + 0.5 - cx) / (w / 2);
      const top = Math.round(cy - H * Math.sqrt(Math.max(0, 1 - u * u)));
      p.vline(xx, top, cy - top, "stone4");
      p.px(xx, top, u < 0.1 ? "stone5" : "stone3");
      if (cy - top > 6) p.px(xx, top + 2, "stone3");
    }
    // A sunburst fan of carved rays and a keystone.
    for (let k = 1; k < 8; k++) {
      const a = Math.PI * (k / 8);
      p.line(Math.round(cx), cy - 1, Math.round(cx - Math.cos(a) * (w / 2 - 6)), Math.round(cy - 1 - Math.sin(a) * (H - 6)), k < 4 ? "stone5" : "stone3");
    }
    p.rect(Math.round(cx) - 3, cy - H, 6, 7, "stone5");
    p.vline(Math.round(cx) + 2, cy - H, 7, "stone3").hline(Math.round(cx) - 3, cy - H + 6, 6, "stone2");
    p.ellipse(cx, cy, 5, 4, "stone4");
    p.ellipse(cx, cy, 3, 2, "stone5");
  } else {
    // Scroll: a raised Baroque panel with S-scroll ends and a medallion, the 1920s taste.
    const H = 14;
    p.rect(x0 + 6, cy - H + 2, w - 12, H - 2, "stone4");
    p.hline(x0 + 6, cy - H + 2, w - 12, "stone5").vline(x1 - 7, cy - H + 2, H - 2, "stone3");
    p.rect(x0 + 10, cy - H + 5, w - 20, H - 8, "stone5");
    p.frame(x0 + 10, cy - H + 5, w - 20, H - 8, "stone3");
    for (const s of [-1, 1] as const) {
      const sx = s < 0 ? x0 : x1 - 8;
      block(p, sx, cy - 9, s < 0
        ? ["...abb.", "..bccbb", ".bc..cb", "bc.ab.b", "bc.bc..", ".bccb..", "..bb..."]
        : [".bba...", "bbccb..", "bc..cb.", "b.ba.cb", "..cb.cb", "..bccb.", "...bb.."],
      { a: "stone5", b: "stone4", c: "stone2" }, "scroll");
    }
    block(p, Math.round(cx) - 4, cy - H - 2, [".abba...", "abccba..", "bc..cb..", ".bccb...", "..bb...."].map((r) => r.slice(0, 7) + "."),
      { a: "stone5", b: "stone4", c: "stone3" }, "medallion");
  }
}

// ── windows ──────────────────────────────────────────────────────────────────

export type ShutterTone = "jade" | "wood" | "blue" | "cream";
const SHUTTER: Record<ShutterTone, { lit: Color; face: Color; shade: Color; deep: Color }> = {
  jade: { lit: "jade4", face: "jade3", shade: "jade2", deep: "jade1" },
  wood: { lit: "wood5", face: "wood4", shade: "wood3", deep: "wood2" },
  blue: { lit: "blue4", face: "blue3", shade: "blue2", deep: "blue1" },
  cream: { lit: "cream5", face: "cream4", shade: "cream3", deep: "cream2" },
};

export type WindowOptions = {
  seed: number;
  shutters?: "open" | "closed" | "half" | null;
  shutterTone?: ShutterTone;
  /** What the glass shows: sky reflected, a dark room, or a curtain drawn. */
  glass?: "sky" | "dark" | "curtain";
  curtain?: "cream" | "plum" | "jade" | "pink";
  /** Painted casement frame colour. */
  frame?: "wood" | "cream" | "jade";
  /** A steel security cage (防盗窗) pushed out from the wall, with plants in it. */
  cage?: boolean;
  /** Iron bars set in the reveal (ground floor). */
  bars?: boolean;
  /** What stands on the sill. */
  sill?: "plants" | "plain" | "jar" | "shoes";
  /** A segmental arched head over the window. */
  arch?: boolean;
  /** One casement pushed open. */
  ajar?: boolean;
};

const FRAME_TONE = {
  wood: { lit: "wood4" as Color, face: "wood3" as Color, shade: "wood2" as Color },
  cream: { lit: "cream5" as Color, face: "cream4" as Color, shade: "cream2" as Color },
  jade: { lit: "jade4" as Color, face: "jade3" as Color, shade: "jade1" as Color },
};

/**
 * A window in a brick wall: opening (x, y, w, h), a granite lintel and sill, a recessed casement with
 * glazing bars, and optionally louvred shutters, a security cage, bars, and things on the sill.
 * Shutters open beside the window take `floor(w / 2)` on each side.
 */
export function laneWindow(p: Px, x: number, y: number, w: number, h: number, o: WindowOptions): void {
  const s = o.seed;
  const ft = FRAME_TONE[o.frame ?? "wood"];
  // Lintel (flat or a segmental brick arch) and sill.
  if (o.arch) {
    for (let xx = x - 2; xx < x + w + 2; xx++) {
      const u = (xx + 0.5 - (x + w / 2)) / (w / 2 + 2);
      const rise = Math.round(4 * Math.sqrt(Math.max(0, 1 - u * u)));
      for (let k = 0; k < 4; k++) p.px(xx, y - 1 - rise - k, k === 3 ? "stone5" : (xx & 1) ? "rose3" : "rose2");
      for (let yy = y - rise; yy < y; yy++) p.px(xx, yy, "ink2");
    }
  } else {
    p.rect(x - 2, y - 4, w + 4, 4, "stone4");
    p.hline(x - 2, y - 4, w + 4, "stone5").vline(x + w + 1, y - 4, 4, "stone3");
  }
  // Opening, recessed: dark reveal top and left, lit reveal right.
  p.rect(x, y, w, h, "ink2");
  const ix = x + 1, iy = y + 2, iw = w - 2, ih = h - 2;
  // Casement frame.
  p.rect(ix, iy, iw, ih, ft.face);
  p.hline(ix, iy, iw, ft.lit).vline(ix, iy, ih, ft.lit).vline(ix + iw - 1, iy, ih, ft.shade).hline(ix, iy + ih - 1, iw, ft.shade);
  const cols = iw >= 18 ? 2 : 1, rows = ih >= 22 ? 3 : 2;
  const gx = ix + 2, gy = iy + 2, gw = iw - 4, gh = ih - 4;
  glassFill(p, gx, gy, gw, gh, o);
  // Glazing bars.
  if (cols === 2) p.vline(gx + Math.floor(gw / 2), gy, gh, ft.face).vline(gx + Math.floor(gw / 2) + 1, gy, gh, ft.shade);
  for (let r = 1; r < rows; r++) p.hline(gx, gy + Math.floor((gh * r) / rows), gw, ft.face);
  if (o.ajar) {
    // The right casement swung in: the room shows dark behind its edge.
    const hx = gx + Math.floor(gw / 2) + 2;
    p.rect(hx, gy, gx + gw - hx, gh, "ink2");
    p.vline(hx + 1, gy, gh, ft.lit).vline(hx + 2, gy, gh, ft.shade);
    if (o.glass === "curtain") for (let yy = gy; yy < gy + gh; yy++) if (yy % 3 !== 0) p.px(gx + gw - 2, yy, CURTAIN[o.curtain ?? "cream"][1]);
  }
  p.vline(x + w - 1, y + 1, h - 1, "stone4");
  p.vline(x, y + 1, h - 1, "stone1");
  p.hline(x, y + 1, w, "ink");
  if (o.bars) for (let xx = x + 3; xx < x + w - 2; xx += 4) { p.vline(xx, y + 1, h - 1, "steel2"); p.px(xx, y + 2, "steel4"); p.px(xx - 1, y + h - 1, "orange1"); }
  // Sill.
  p.rect(x - 3, y + h, w + 6, 3, "stone4");
  p.hline(x - 3, y + h, w + 6, "stone5").hline(x - 3, y + h + 2, w + 6, "stone3").hline(x - 2, y + h + 3, w + 4, "steel2");
  if (o.shutters) shutters(p, x, y, w, h, o);
  if (o.cage) cage(p, x, y, w, h, s);
  else if (o.sill === "plants") sillPlants(p, x, y + h, w, s);
  else if (o.sill === "jar") block(p, x + w - 9, y + h - 6, [".aab.", "abbbc", "bdddc", "bbbbc", ".ccc."], { a: "jade5", b: "jade4", c: "jade2", d: "jade3" }, "jar");
  else if (o.sill === "shoes") block(p, x + 2, y + h - 3, ["abbc.abbc", "ddddcdddd"], { a: "white", b: "steel6", c: "steel4", d: "steel3" }, "shoes");
}

const CURTAIN: Record<NonNullable<WindowOptions["curtain"]>, [Color, Color, Color]> = {
  cream: ["cream5", "cream4", "cream2"], plum: ["plum3", "plum2", "plum1"], jade: ["jade5", "jade4", "jade2"], pink: ["pink3", "pink2", "pink1"],
};

function glassFill(p: Px, x: number, y: number, w: number, h: number, o: WindowOptions): void {
  const g = o.glass ?? "sky";
  if (g === "dark") {
    p.rect(x, y, w, h, "blue1");
    for (let i = 0; i < Math.min(w, h); i++) if (i % 5 < 2) p.px(x + w - 1 - i, y + Math.floor(i * 0.8), "blue2");
    p.px(x, y, "blue2");
    return;
  }
  // Sky: pale top-left, deepening down and right, a diagonal glint, the eave's shadow in the top rows.
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const t = j / h + (i / w) * 0.5;
    p.px(x + i, y + j, t < 0.35 ? "blue4" : t < 0.8 ? "blue3" : "blue2");
  }
  for (let k = 0; k < Math.min(w, h) - 2; k++) if (k % 7 < 3) p.px(x + 2 + k, y + h - 3 - k, "blue5");
  p.hline(x, y, w, "blue2");
  if (g === "curtain") {
    const [lit, face, shade] = CURTAIN[o.curtain ?? "cream"];
    const cw = Math.ceil(w * 0.55);
    for (let j = 0; j < h; j++) for (let i = 0; i < cw; i++) {
      const fold = (i + (j >> 3)) % 4;
      p.px(x + i, y + j, fold === 0 ? lit : fold === 3 ? shade : face);
    }
    // A tie-back cinches the curtain a third of the way down.
    p.hline(x, y + Math.floor(h * 0.4), cw - 1, shade);
  }
}

function shutters(p: Px, x: number, y: number, w: number, h: number, o: WindowOptions): void {
  const t = SHUTTER[o.shutterTone ?? "jade"];
  const lw = Math.floor(w / 2);
  const leafAt = (lx: number, worn: boolean) => {
    p.rect(lx, y, lw, h, t.face);
    p.vline(lx, y, h, t.lit).hline(lx, y, lw, t.lit).vline(lx + lw - 1, y, h, t.deep).hline(lx, y + h - 1, lw, t.deep);
    // Louvres: slats every 2px, each lit along its top and shaded under.
    for (let yy = y + 3; yy < y + h - 3; yy += 2) { p.hline(lx + 2, yy, lw - 4, t.shade); p.hline(lx + 2, yy + 1, lw - 4, t.lit); }
    p.hline(lx + 1, y + Math.floor(h / 2), lw - 2, t.face);
    // Paint peeled to grey wood on an old shutter.
    if (worn) for (let i = 0; i < 4; i++) {
      const px0 = lx + 2 + Math.floor(hash(i, lx, o.seed) * (lw - 4)), py0 = y + 4 + Math.floor(hash(i, y, o.seed) * (h - 8));
      p.px(px0, py0, "stone3").px(px0 + 1, py0, "stone4");
    }
  };
  const worn = hash(x, y, o.seed) > 0.5;
  if (o.shutters === "closed") { leafAt(x, worn); leafAt(x + w - lw, worn); p.vline(x + lw - 1, y, h, t.deep); }
  else if (o.shutters === "half") { leafAt(x - lw, worn); leafAt(x + w - lw, worn); }
  else { leafAt(x - lw, worn); leafAt(x + w, worn); }
  // Hinge pins and a hook.
  if (o.shutters !== "closed") { p.px(x - 1, y + 3, "steel2").px(x - 1, y + h - 4, "steel2"); }
}

/** A steel security cage out from the window: bars, a lid seen from above, plants inside. */
function cage(p: Px, x: number, y: number, w: number, h: number, seed: number): void {
  const cx = x - 3, cw = w + 6, top = y - 2, depth = 5;
  // Lid, seen from above: a sheet of rusting steel.
  p.rect(cx, top - depth, cw, depth, "steel4");
  p.hline(cx, top - depth, cw, "steel5").hline(cx, top - 1, cw, "steel2");
  for (let xx = cx + 2; xx < cx + cw; xx += 5) if (hash(xx, top, seed) > 0.6) p.px(xx, top - 3, "orange1");
  // Plants in the cage tray.
  sillPlants(p, x, y + h, w, seed + 3);
  // Bars.
  for (let xx = cx; xx < cx + cw; xx += 4) { p.vline(xx, top, h + 6, "steel2"); p.vline(xx + 1, top, h + 6, "steel4"); }
  p.vline(cx + cw - 1, top, h + 6, "steel1");
  p.hline(cx, top, cw, "steel3").hline(cx, y + Math.floor(h / 2), cw, "steel3").hline(cx, y + h + 3, cw, "steel3").hline(cx, y + h + 4, cw, "steel1");
  // Rust weeping from the tray onto the wall below.
  stain(p, cx + 3 + Math.floor(hash(seed, 2, 3) * (cw - 8)), y + h + 5, 3, 9);
}

/** Potted plants on a sill whose top is row `sy`: terracotta pots, a geranium, a cactus, scallions. */
export function sillPlants(p: Px, x: number, sy: number, w: number, seed: number): void {
  const L = { a: "leaf5", b: "leaf4", c: "leaf3", d: "leaf2", e: "leaf1", t: "orange2", u: "orange1", v: "rose2", f: "pink2", g: "pink3", y: "gold4", w: "white", s: "steel4" } as const;
  const plants = [
    // Geranium: pink heads over round leaves, terracotta pot.
    [".gf.f..", "gffbfg.", ".bccb..", "bcddcb.", ".dcd...", ".tttu..", ".tuuu..", "..vv..."],
    // Spider plant spilling over the pot rim.
    ["b.....b", ".bc.cb.", "..ccc..", ".bdcdb.", "b.tuu.b", "..tuu..", "..vv..."],
    // A cactus with a yellow flower.
    ["..y..", ".bcb.", ".bcd.", "bbcdd", ".bcd.", "ttuuu", ".tuu.", ".vv.."],
    // Scallions in a cut-down plastic bottle.
    ["b.b.c", "b.bcc", "bcbc.", ".ccd.", "wwsss", "wsssw", ".sss."],
  ];
  const n = Math.max(1, Math.floor(w / 9));
  for (let i = 0; i < n; i++) {
    const pl = pick(plants, hash(i, sy, seed));
    const px0 = x + 1 + Math.floor((i * w) / n) + Math.floor(hash(i, 1, seed) * 2);
    p.rows(px0, sy - pl.length + 1, pl, L);
  }
}

// ── things hung on walls ─────────────────────────────────────────────────────

/**
 * A split air-conditioner's outdoor unit on steel brackets, 22 × 15 from (x, y): a fan grille, louvres,
 * a drip stain down the wall below, and the refrigerant pipe taped in cream running off to `pipeTo`.
 */
export function acUnit(p: Px, x: number, y: number, seed: number, pipeTo?: readonly [number, number]): void {
  if (pipeTo) {
    const [tx, ty] = pipeTo;
    p.hline(Math.min(x + 21, tx), y + 2, Math.abs(tx - (x + 21)) + 1, "cream4");
    p.hline(Math.min(x + 21, tx), y + 3, Math.abs(tx - (x + 21)) + 1, "cream2");
    p.vline(tx, Math.min(ty, y + 2), Math.abs(ty - (y + 2)) + 1, "cream4");
  }
  stain(p, x + 15, y + 15, 3, 18 + Math.floor(hash(seed, 1, 1) * 10));
  p.rect(x, y, 22, 13, "steel5");
  p.hline(x, y, 22, "steel6").vline(x, y, 13, "steel6").vline(x + 21, y, 13, "steel3").hline(x, y + 12, 22, "steel3");
  // Louvres.
  for (let yy = y + 3; yy < y + 11; yy += 2) p.hline(x + 2, yy, 7, "steel3");
  // Fan grille.
  p.ellipse(x + 15, y + 6.5, 5, 5, "steel3");
  p.ellipse(x + 15, y + 6.5, 4, 4, "steel2");
  p.ellipse(x + 15, y + 6.5, 2.5, 2.5, "steel4");
  p.rect(x + 14, y + 5, 2, 2, "steel1");
  p.line(x + 12, y + 4, x + 18, y + 9, "steel4");
  // Yellowed plastic and a sticker gone blank in the sun.
  p.rect(x + 2, y + 1, 4, 1, "cream4");
  // Brackets.
  for (const bx of [x + 2, x + 18]) { p.vline(bx, y + 13, 3, "steel2"); p.line(bx, y + 15, bx + (bx < x + 10 ? -2 : 2), y + 18, "steel2"); }
  p.hline(x, y + 13, 22, "steel1");
}

/**
 * A bamboo laundry pole on two iron brackets just under a window, `w` long from (x, y), with what is
 * hanging today: a shirt, trousers, a towel, socks, a pillow airing.
 */
export function laundryPole(p: Px, x: number, y: number, w: number, seed: number, items: readonly ("shirt" | "trousers" | "towel" | "socks" | "pillow" | "vest")[]): void {
  for (const bx of [x + 1, x + w - 3]) { p.vline(bx, y - 4, 6, "steel2"); p.px(bx + 1, y - 4, "steel3"); }
  p.hline(x, y, w, "bamboo4").hline(x, y + 1, w, "bamboo2");
  for (let xx = x + 4; xx < x + w; xx += 11) p.px(xx, y, "bamboo2");
  const art: Record<string, { rows: string[]; legend: Legend }> = {
    shirt: { rows: ["aabbbaa", "abbbbbc", "bbbcbbc", ".bbcbc.", ".bbcbc.", ".bbbbc.", ".cccc.."], legend: { a: "blue5", b: "blue4", c: "blue3" } },
    trousers: { rows: ["aaaaa", "abbbc", "bbcbc", "bb.bc", "bb.bc", "bb.bc", "bc.cc", "cc.cc"], legend: { a: "steel3", b: "steel2", c: "steel1" } },
    towel: { rows: ["aaaa", "bbbb", "bcbb", "bbbb", "dddd", "bbbb", "c.c."], legend: { a: "pink3", b: "pink2", c: "pink1", d: "cream5" } },
    socks: { rows: ["a.a", "a.a", "b.b", "bbb"], legend: { a: "cream5", b: "cream3" } },
    pillow: { rows: ["aaaaaab", "accccab", "acddcab", "acccbbb", ".bbbbb."], legend: { a: "cream5", b: "cream3", c: "jade5", d: "jade4" } },
    vest: { rows: ["a...a", "aa.aa", "aaaab", "aaaab", "aaabb", "abbb."], legend: { a: "white", b: "cream3" } },
  };
  let cx = x + 3;
  for (const item of items) {
    const a = art[item];
    if (cx + a.rows[0].length > x + w - 2) break;
    p.rows(cx, y + 1, a.rows, a.legend);
    // A peg.
    p.px(cx + 1, y, "jade4");
    cx += a.rows[0].length + 2 + Math.floor(hash(cx, y, seed) * 3);
  }
}

/** A cast-iron rainwater pipe down a wall, with a hopper head at the top and brackets. */
export function downpipe(p: Px, x: number, top: number, base: number): void {
  p.rect(x - 1, top, 5, 4, "steel2");
  p.hline(x - 1, top, 5, "steel4").hline(x - 1, top + 3, 5, "steel1");
  p.vline(x, top + 4, base - top - 4, "steel4").vline(x + 1, top + 4, base - top - 4, "steel3").vline(x + 2, top + 4, base - top - 4, "steel1");
  for (let yy = top + 12; yy < base - 4; yy += 16) p.hline(x - 1, yy, 5, "steel2");
  p.hline(x, base - 1, 4, "steel2").px(x + 3, base - 2, "steel3");
}

/** A street-number plate: blank blue enamel with a white rim (DOM can label it), 10 × 7. */
export function numberPlate(p: Px, x: number, y: number): void {
  block(p, x, y, ["abbbbbbbbc", "bdddddddde", "bdffffffde", "bdddddddde", "bdddddddde", "beeeeeeeee", ".ggggggggg"],
    { a: "white", b: "blue6", c: "blue5", d: "blue3", e: "blue2", f: "blue4", g: "steel2" }, "numberPlate");
}

/** An electricity meter box with a tangle of wires leaving it, 12 × 16 from (x, y); wires run to `wireTo`. */
export function meterBox(p: Px, x: number, y: number, wireTo?: number): void {
  p.rect(x, y, 12, 16, "steel4");
  p.hline(x, y, 12, "steel5").vline(x, y, 16, "steel5").vline(x + 11, y, 16, "steel2").hline(x, y + 15, 12, "steel2");
  p.rect(x + 3, y + 3, 6, 5, "cream4");
  p.frame(x + 3, y + 3, 6, 5, "steel2");
  p.hline(x + 4, y + 5, 3, "ink2");
  p.px(x + 9, y + 11, "steel1");
  if (wireTo !== undefined) {
    // Wires leave the top and sag off toward the eave, one of them looped and taped.
    p.vline(x + 4, y - 14, 14, "ink2");
    p.line(x + 7, y - 1, wireTo, y - 10, "ink2");
    p.vline(wireTo, y - 40, 30, "ink2");
    p.rect(x + 3, y - 9, 3, 2, "steel1");
  }
}

/** A row-house party wall's top running down the roof between two bays: a thin stepped brick parapet. */
export function partyWall(p: Px, x: number, y: number, h: number): void {
  p.vline(x - 1, y, h, "steel2");
  p.rect(x, y, 4, h, "stone4");
  p.vline(x, y, h, "stone5").vline(x + 3, y, h, "stone3");
  for (let yy = y + 2; yy < y + h; yy += 6) p.hline(x, yy, 4, "stone3");
  p.vline(x + 4, y, h, "steel1");
}

// ── whole facades and roofs ──────────────────────────────────────────────────

export type ShellOptions = {
  seed: number;
  /** Rows from the bottom to the storey line, where the red banding runs. */
  groundH: number;
  /** Red-brick band courses at the storey line (0 for none). */
  bandCourses?: number;
  /** Red-brick quoins up the two outer corners. */
  quoins?: boolean;
};

/**
 * A lane house's brick front: grey brick from `top` to the bottom row, a red band at the storey line
 * with a string course over it, a sooty plinth, a cornice under the eave, darkened outer edges.
 */
export function facadeShell(p: Px, x: number, top: number, w: number, base: number, o: ShellOptions): void {
  bricks(p, x, top, w, base - top + 1, o.seed);
  const storey = base - o.groundH;
  const courses = o.bandCourses ?? 2;
  if (courses > 0) {
    const bandTop = (storey - courses * 4) & ~3;
    bricks(p, x, bandTop, w, courses * 4, o.seed + 1, RED_BRICK);
    stringCourse(p, x, bandTop - 4, w, o.seed);
  }
  if (o.quoins) for (const qx of [x, x + w - 8]) for (let yy = top + 6; yy < base - 6; yy += 8) {
    const long = ((yy - top) >> 3) & 1;
    const bw = long ? 8 : 5, bx = qx === x ? x : x + w - bw;
    p.rect(bx, yy, bw, 3, "rose3").hline(bx, yy, bw, "rose4").hline(bx, yy + 3, bw, "stone3");
  }
  plinth(p, x, base, w, o.seed);
  // Cornice under the eave: a brick dentil course.
  p.hline(x, top, w, "stone4").hline(x, top + 1, w, "stone3");
  for (let xx = x; xx < x + w; xx++) p.px(xx, top + 2, (xx & 3) < 2 ? "stone4" : "steel1");
  p.hline(x, top + 3, w, "steel2");
  p.vline(x, top, base - top + 1, "steel1").vline(x + w - 1, top, base - top + 1, "steel1");
}

export type RoofOptions = {
  seed: number;
  /** Row of the ridge's top, relative to `y`. Above it is the north slope. */
  ridgeY: number;
  copings?: boolean;
  mend?: readonly [number, number, number, number];
  damp?: number;
};

/**
 * A pitched pantile roof over (x, y, w, h): the north slope above the ridge (lit), the ridge, the long
 * south slope toward the lane, and the eave's tile ends in its last 5 rows. Gable copings frame it.
 */
export function laneRoof(p: Px, x: number, y: number, w: number, h: number, o: RoofOptions): void {
  const eaveY = y + h - 5;
  pantiles(p, x, y, w, o.ridgeY, o.seed, "north", { damp: (o.damp ?? 0.08) + 0.04 });
  pantiles(p, x, y + o.ridgeY + 6, w, eaveY - (y + o.ridgeY + 6), o.seed + 1, "south", { mend: o.mend, damp: o.damp });
  ridge(p, x, y + o.ridgeY, w, o.seed);
  eave(p, x, eaveY, w);
  p.hline(x, y, w, "steel1");
  if (o.copings ?? true) {
    coping(p, x, y, h - 5, "left");
    coping(p, x + w - 5, y, h - 5, "right");
    ridgeEnd(p, x, y + o.ridgeY + 1);
    ridgeEnd(p, x + w - 5, y + o.ridgeY + 1, true);
  }
}
