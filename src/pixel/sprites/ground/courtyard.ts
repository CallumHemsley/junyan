/**
 * The courtyard behind the moon gate: a shikumen yard shared by three row houses, swept every morning,
 * never quite dry in the corners. Five materials, all quieter and greyer than the town lanes:
 *
 * - `brick-paving`: grey 青砖 laid in basket weave (pairs of bricks turning by the square), the
 *   courtyard's own pattern, unlike the lanes' brown herringbone.
 * - `courtyard-stone`: big granite slabs, worn pale where the bicycles stand; one has the drain.
 * - `moss-earth`: the damp packed earth of the beds and corners, moss on it and a few stones.
 * - `threshold-stone`: the long single granite sills of the hall approach, laid end to end in two rows
 *   per tile; variants differ only in where the joints fall, so sills of random length run across tiles.
 * - `worn-stone`: cobbles polished by a century of feet, with last night's puddles.
 *
 * Every pattern sits on a fixed lattice that repeats every 32 px, and anything that crosses a tile
 * edge is drawn the same in every variant, so any mix tiles. Edges (`ground/edge-moss-…`,
 * `edge-brick-paving-…`, `edge-cobble-…`, `edge-sill-…`) are overlays; the placement rules are in
 * `src/pixel/town/ground-courtyard-legend.ts`. The scene weights a and b heavily, c and d rarely.
 */
import { defineSprites, hash, Px, type Color, type Legend, type SpriteDef } from "../../kit/index.ts";
import { CELLS, cellAt, centreOf, isJoint, isShared, layCobbles, type CobbleTone } from "./_cobble.ts";
import { T, inBlob, jitter, sided, stamp, tile, type Corner, type Side } from "./_helpers.ts";
import { bandMask } from "./_turf.ts";

const L: Legend = {
  a: "stone1", b: "stone2", c: "stone3", d: "stone4", e: "stone5",
  g: "leaf2", G: "leaf3", M: "leaf1", m: "jade2", k: "jade3",
  i: "steel1", I: "steel2", j: "steel3", J: "steel4",
  o: "oak1", O: "oak2", q: "oak3", Q: "oak4", r: "brown2", t: "bamboo1",
  u: "blue4", U: "blue5", w: "white", R: "tan2", x: "tan1",
};

// ── brick-paving: grey basket weave ─────────────────────────────────────────

type Brick = { id: number; joint: boolean };
/** 8 px squares in a checker, each two 8×4 bricks lying down or two 4×8 bricks on edge. Joints right and bottom. */
function basketAt(x: number, y: number): Brick {
  const si = Math.floor(x / 8), sj = Math.floor(y / 8), lying = (si + sj) % 2 === 0;
  const idx = lying ? Math.floor((y % 8) / 4) : Math.floor((x % 8) / 4);
  const joint = lying ? x % 8 === 7 || y % 4 === 3 : x % 4 === 3 || y % 8 === 7;
  return { id: (si * 4 + sj) * 2 + idx, joint };
}
const BRICK_FACES: readonly [Color, number][] = [["stone3", 0.55], ["steel3", 0.75], ["cream1", 0.9], ["stone2", 1]];
const faceOf = (r: number) => BRICK_FACES.find(([, upTo]) => r < upTo)![0];

function basket(p: Px, seed: number, face?: (id: number) => Color | undefined) {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const b = basketAt(x, y);
    p.px(x, y, b.joint ? "stone1" : face?.(b.id) ?? faceOf(hash(b.id, 3, seed)));
  }
}

/** Moss in joints inside a soft blob. */
function mossJoints(p: Px, cx: number, cy: number, rx: number, ry: number, seed: number, joint: Color = "stone1") {
  p.each((x, y, c) => (c === joint && inBlob(x, y, cx, cy, rx, ry) && hash(x >> 1, y >> 1, seed) < 0.6 ? (hash(x, y, seed + 1) < 0.2 ? "leaf2" : "jade2") : undefined));
}

// ── courtyard-stone: big granite slabs in windmill bond ─────────────────────

type Slab = { x: number; y: number; w: number; h: number; key: number };
/**
 * Windmill bond: four 20×12 slabs turning round a small square, repeating every 32 px. No joint runs on
 * past a slab, so courses never line up into bands. Every slab lies inside its tile, so each variant may
 * treat each slab its own way.
 */
const SLABS: Slab[] = [
  { x: 0, y: 0, w: 20, h: 12, key: 0 }, { x: 20, y: 0, w: 12, h: 20, key: 1 },
  { x: 12, y: 20, w: 20, h: 12, key: 2 }, { x: 0, y: 12, w: 12, h: 20, key: 3 },
  { x: 12, y: 12, w: 8, h: 8, key: 4 },
];
type SlabTone = { face: Color; lit: Color; shade: Color };
const GRANITE: SlabTone = { face: "stone3", lit: "stone4", shade: "stone2" };
const GRANITE_PALE: SlabTone = { face: "stone4", lit: "stone5", shade: "stone3" };
const GRANITE_DARK: SlabTone = { face: "stone2", lit: "stone3", shade: "stone1" };

/**
 * Warm grey granite, darker than the sills: each slab's top and left lips catch the sun, its lower and
 * right lips have settled; worn paler toward the middle where feet and wheels pass; flecked in pairs.
 */
function slabs(p: Px, seed: number, tones: Partial<Record<number, SlabTone>> = {}) {
  p.rect(0, 0, T, T, "stone1");
  for (const sl of SLABS) {
    const t = tones[sl.key] ?? GRANITE;
    for (let j = 0; j < sl.h - 1; j++) for (let i = 0; i < sl.w - 1; i++) {
      let c: Color = t.face;
      if (j === 0 && hash(i >> 2, sl.key, seed) > 0.3) c = t.lit;
      else if (j === sl.h - 2 || (i === sl.w - 2 && hash(j >> 2, sl.key + 5, seed) > 0.35)) c = t.shade;
      p.px(sl.x + i, sl.y + j, c);
    }
    const n = Math.round((sl.w * sl.h) / 60);
    for (let k = 0; k < n; k++) {
      const fx = sl.x + 2 + Math.floor(hash(k, sl.key, seed + 3) * (sl.w - 5)), fy = sl.y + 2 + Math.floor(hash(k, sl.key, seed + 4) * (sl.h - 5));
      const c: Color = k % 3 === 0 ? t.lit : k % 3 === 1 ? "steel3" : t.shade;
      p.px(fx, fy, c).px(fx + 1, fy, c);
    }
  }
}

// ── moss-earth ──────────────────────────────────────────────────────────────

/**
 * Packed earth, damp and dark olive-brown: a few darker and greener clusters for tone, grit, and a
 * sparse pebble or two. Moss and bare trodden patches come as bands over many tiles (below), not here.
 */
function earth(p: Px, seed: number) {
  p.rect(0, 0, T, T, "bamboo1");
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r < 0.28) stamp(p, x, y, ["rr.", ".rr"], { r: "wood2" });
    else if (r < 0.46) stamp(p, x, y, [".mm", "mm."], { m: "leaf1" });
    else if (r < 0.56) stamp(p, x, y, ["t"], { t: "stone2" });
  }
  for (const [x, y, r] of jitter(16, seed + 17, 3)) if (r < 0.22) stamp(p, x, y, r < 0.1 ? [".dd", "dcc", ".bb"] : ["dc", "bb"], L);
}

/** Moss: a dark cushion (leaf1) with greener patches and a few lit tips. */
function mossTexture(p: Px, seed: number) {
  p.rect(0, 0, T, T, "leaf1");
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r < 0.5) stamp(p, x, y, [".gg", "ggg", "gg."], { g: "leaf2" });
    else if (r < 0.7) stamp(p, x, y, ["mm", ".m"], { m: "jade2" });
  }
  for (const [x, y, r] of jitter(8, seed + 5, 2)) if (r < 0.35) stamp(p, x, y, ["G", "g"], { G: "leaf3", g: "leaf2" });
}

/** Damp earth: darker and greener, where the ground holds water; a broad, quiet tone across many tiles. */
function damp(p: Px, seed: number) {
  earth(p, seed);
  for (const [x, y, r] of jitter(8, seed + 40, 0)) {
    if (r < 0.65) stamp(p, x - 2, y - 1, [".mmm.", "mmmmm", ".mmm."], { m: "leaf1" });
  }
}

/** Trodden earth: paler, smoother, packed hard by feet stepping off the paths. */
function trodden(p: Px, seed: number) {
  p.rect(0, 0, T, T, "cream1");
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r < 0.55) stamp(p, x, y, ["tt.", ".tt"], { t: "bamboo1" });
    else if (r < 0.5) stamp(p, x, y, ["c"], { c: "stone3" });
  }
}

/** Paint `draw` only inside the band mask (see `_turf.ts` for how corner bits shape it). */
function inBand(p: Px, bits: string, seed: number, draw: (q: Px) => void) {
  const full = new Px(T, T);
  draw(full);
  const inside = bandMask(bits, seed);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (inside(x, y)) p.px(x, y, full.get(x, y));
}

// ── threshold-stone: long sills ─────────────────────────────────────────────

/** Two rows of sills, 15 tall. A row's sill ends at x 31 only if `joints` says so; otherwise it runs on into the next tile. */
function sills(p: Px, seed: number, joints: readonly [boolean, boolean]) {
  for (let row = 0; row < 2; row++) {
    const y0 = row * 16;
    for (let x = 0; x < T; x++) {
      const end = joints[row] && x === T - 1;
      for (let j = 0; j < 16; j++) {
        let c: Color = "stone4";
        if (j === 15 || end) c = "stone2";
        else if (j === 0) c = hash(x >> 3, row, 7) > 0.3 ? "stone5" : "stone4";
        else if (j === 14) c = "stone3";
        else if (joints[row] && x === T - 2) c = "stone3";
        else if (joints[row] && x === 0 && j < 14) c = "stone5";
        p.px(x, y0 + j, c);
      }
    }
    // Polished in a long band down the middle of each sill where feet slide, and a few flecks.
    for (let x = 1; x < T - 2; x++) if (hash(x >> 1, row, seed + 11) < 0.35) p.px(x, y0 + 6 + (hash(x, row, seed) < 0.5 ? 0 : 1), "stone5");
    for (let k = 0; k < 4; k++) {
      const fx = 2 + Math.floor(hash(k, row, seed + 13) * 26), fy = y0 + 3 + Math.floor(hash(k, row + 2, seed + 13) * 9);
      p.px(fx, fy, "steel3").px(fx + 1, fy, "steel3");
    }
  }
}

// ── worn-stone: cobbles ─────────────────────────────────────────────────────

const COBBLE: Record<"grey" | "light" | "warm" | "dark" | "worn" | "wornGrey" | "polished", CobbleTone> = {
  grey: { face: "stone3", lit: "stone4", shade: "stone2" },
  light: { face: "stone4", lit: "stone5", shade: "stone3" },
  warm: { face: "cream2", lit: "cream3", shade: "cream1" },
  dark: { face: "stone2", lit: "stone3", shade: "stone1" },
  /** On the worn path: paler and smoother. */
  worn: { face: "stone4", lit: "stone5", shade: "stone3" },
  wornGrey: { face: "stone3", lit: "stone4", shade: "stone3" },
  polished: { face: "stone4", lit: "cream4", shade: "stone4" },
};
const cobbleTone = (cell: number, seed: number): CobbleTone => {
  const r = hash(cell, 7, isShared(cell) ? 600 : seed);
  return r < 0.72 ? COBBLE.grey : r < 0.86 ? COBBLE.light : r < 0.94 ? COBBLE.warm : COBBLE.dark;
};

/** Lay the cobbles; `wet(x, y)` marks a puddle: the sky in it, the joints dark under the water, a wet rim. */
function cobbles(p: Px, seed: number, wet?: (x: number, y: number) => boolean) {
  layCobbles((x, y, c) => p.px(x, y, c), (cell) => cobbleTone(cell, seed), "stone1");
  if (!wet) return;
  p.each((x, y, c) => {
    if (!wet(x, y)) return undefined;
    if (c === "stone1") return "steel2";
    if (c === "stone5" || c === "stone4" && isJoint(x - 1, y) && isJoint(x, y - 1)) return "blue5";
    return isJoint(x, y + 1) ? "steel3" : hash(x >> 1, y, 5) < 0.3 ? "blue4" : "steel4";
  });
  p.each((x, y, c) => (!wet(x, y) && (wet(x + 1, y) || wet(x - 1, y) || wet(x, y + 1) || wet(x, y - 1)) && c !== "stone1" ? "stone2" : undefined));
}

/** The worn path down a lane: setts whose seed lies in the band are relaid paler and smoother, joints full of grit. */
function wornPath(p: Px, bits: string, seed: number) {
  const inside = bandMask(bits, seed);
  const on = new Set<number>();
  for (const c of CELLS) { const ct = centreOf(c); if (inside(ct.x, ct.y)) on.add(c); }
  layCobbles((x, y, c) => {
    const cell = cellAt(x, y);
    if (isJoint(x, y) ? on.has(cell) && on.has(cellAt(x + 1, y + 1)) : on.has(cell)) p.px(x, y, c);
  }, (cell) => {
    const r = hash(cell, 9, isShared(cell) ? 610 : seed);
    return r < 0.12 ? COBBLE.polished : r < 0.6 ? COBBLE.worn : COBBLE.wornGrey;
  }, "stone2", true);
}

/** Moss in the joints along a lane's edge, thinning away from it. */
function cobbleMoss(p: Px, side: Side, seed: number) {
  sided(p, side, (plot) => {
    for (let d = 0; d < 10; d++) for (let a = 0; a < T; a++) {
      const [x, y] = side === "n" ? [a, d] : side === "s" ? [a, T - 1 - d] : side === "w" ? [d, a] : [T - 1 - d, a];
      if (isJoint(x, y) && hash(a >> 1, d >> 1, seed) < 0.75 - d * 0.08) plot(a, d, hash(a, d, seed + 1) < 0.25 ? "leaf2" : "jade2");
    }
  });
}

// ── edges ───────────────────────────────────────────────────────────────────

/** How far an edge reaches at each point along it: `base` at both ends so runs join. */
function reach(a: number, seed: number, base: number, swing: number): number {
  const ends = Math.min(a, T - 1 - a);
  const wave = Math.sin((a + seed * 7) * 0.5) * swing + Math.sin((a + seed * 3) * 1.4) * swing * 0.5;
  const raw = base + Math.max(0, wave + swing * 0.6);
  return Math.round(ends < 4 ? base + (raw - base) * (ends / 4) : raw);
}

/** Moss and earth creeping onto the paving from a bed on that side: a soil lip, moss clumps riding on it. */
function mossFray(p: Px, side: Side, seed: number) {
  p.faded(0.3, () => sided(p, side, (plot) => { for (let a = 0; a < T; a++) plot(a, reach(a, seed, 3, 1.6), "ink2"); }));
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const r = reach(a, seed, 3, 1.6);
      for (let d = 0; d < r; d++) plot(a, d, d === r - 1 ? "wood2" : hash(a >> 1, d, seed) < 0.3 ? "wood2" : "bamboo1");
    }
    for (let k = 0; k < 5; k++) {
      const a = 2 + Math.floor(hash(k, 1, seed) * 27), r = reach(a, seed, 3, 1.6);
      plot(a, r - 2, "leaf1"); plot(a + 1, r - 2, "leaf2"); plot(a, r - 1, "leaf2"); plot(a + 1, r - 1, "leaf3"); plot(a + 2, r - 1, "leaf1");
      if (k % 2) { plot(a + 1, r, "jade2"); plot(a + 2, r, "leaf1"); }
    }
  });
}

function mossCorner(p: Px, corner: Corner) {
  const fx = (x: number) => (corner.endsWith("w") ? x : T - 1 - x);
  const fy = (y: number) => (corner.startsWith("n") ? y : T - 1 - y);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (x + y <= 4) p.px(fx(x), fy(y), x + y === 4 ? "wood2" : "bamboo1");
  p.px(fx(1), fy(1), "leaf2").px(fx(2), fy(1), "leaf3").px(fx(1), fy(2), "leaf1");
}

/** A soldier course of grey brick along the side, bricks on end, joints on their right and bottom. */
function brickHeader(p: Px, side: Side) {
  for (let k = 0; k < 8; k++) {
    const face = faceOf(hash(k, side.charCodeAt(0), 41));
    const [x, y, w, h] = side === "n" ? [k * 4, 0, 4, 8] : side === "s" ? [k * 4, 24, 4, 8] : side === "w" ? [0, k * 4, 8, 4] : [24, k * 4, 8, 4];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.px(x + i, y + j, i === w - 1 || j === h - 1 ? "stone1" : face);
  }
}
function brickCorner(p: Px, corner: Corner) {
  const x = corner.endsWith("w") ? 0 : 24, y = corner.startsWith("n") ? 0 : 24;
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) p.px(x + i, y + j, i === 7 || j === 7 ? "stone1" : "stone3");
}

/** Where the cobbles stop against the slabs: a band of long granite edging setts laid flush, 5 deep. */
function cobbleEdge(p: Px, side: Side) {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const joint = a % 16 === 15;
      plot(a, 0, "stone2");
      for (let d = 1; d < 5; d++) plot(a, d, joint ? "stone2" : d === 1 ? "stone5" : "stone4");
      plot(a, 5, "stone1");
    }
  });
}
function cobbleCorner(p: Px, corner: Corner) {
  const x0 = corner.endsWith("w") ? 0 : T - 6, y0 = corner.startsWith("n") ? 0 : T - 6;
  for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
    const outer = corner.endsWith("w") ? i === 0 : i === 5;
    const top = corner.startsWith("n") ? j === 0 : j === 5;
    const inner = corner.endsWith("w") ? i === 5 : i === 0;
    const innerY = corner.startsWith("n") ? j === 5 : j === 0;
    p.px(x0 + i, y0 + j, outer || top ? "stone2" : inner || innerY ? "stone1" : j === (corner.startsWith("n") ? 1 : 1) ? "stone5" : "stone4");
  }
}

/**
 * The sills' own edge: the hall approach is a low platform of sills, so to the south its front face
 * shows (shaded, a shadow at its foot); to the north and sides a dark joint and a lit or shaded arris.
 */
function sillEdge(p: Px, side: Side, dips: readonly [number, number][] = []) {
  if (side === "s") {
    // Worn dips in the top of the step where feet land, dished pale and smooth, nibbling the arris.
    for (const [cx, w] of dips) for (let y = 20; y < 25; y++) for (let x = cx - w; x <= cx + w; x++) {
      if (inBlob(x, y, cx + 0.5, 24.5, w + 0.5, 3)) p.px(x, y, y >= 23 && Math.abs(x - cx) < w ? "stone5" : hash(x, y, 3) < 0.5 ? "stone5" : "stone4");
    }
    for (let x = 0; x < T; x++) {
      const dipped = dips.some(([cx, w]) => Math.abs(x - cx) <= w - 1);
      p.px(x, 24, dipped ? "stone4" : "stone5");
      // The riser, in shade: darker toward its foot, a line of shadow where it meets the ground.
      p.px(x, 25, dipped ? "stone3" : "stone2").px(x, 26, "stone2").px(x, 27, "stone2").px(x, 28, "stone1").px(x, 29, "stone1");
      p.faded(0.35, () => p.px(x, 30, "ink2").px(x, 31, "ink2"));
    }
    for (let y = 25; y < 30; y++) p.px(T - 1, y, "ink2");
    p.px(30, 26, "stone1").px(29, 27, "stone3");
  } else if (side === "n") {
    for (let x = 0; x < T; x++) p.px(x, 0, "stone2").px(x, 1, "stone5");
  } else {
    const at = side === "w" ? 0 : T - 1, next = side === "w" ? 1 : T - 2;
    for (let y = 0; y < T; y++) { p.px(at, y, "stone2"); p.px(next, y, side === "w" ? "stone5" : "stone3"); }
  }
}
function sillCorner(p: Px, corner: Corner) {
  // Only the south corners need closing: the front face turns the corner and the arris meets it.
  if (corner.startsWith("n")) { const x = corner === "nw" ? 0 : T - 1; p.px(x, 0, "stone2").px(x, 1, "stone2"); return; }
  const x0 = corner === "sw" ? 0 : T - 2;
  for (let y = 24; y < 30; y++) for (let x = x0; x < x0 + 2; x++) p.px(x, y, y === 24 ? "stone4" : y >= 28 ? "stone1" : "stone2");
}

// ── sprites ─────────────────────────────────────────────────────────────────

const sprites: Record<string, SpriteDef> = {
  // brick-paving
  /** Grey basket weave. */
  "ground/brick-paving-a": tile((p) => basket(p, 1)),
  /** Grey basket weave, two bricks worn smooth and pale by the bicycle stand. */
  "ground/brick-paving-b": tile((p) => basket(p, 2, (id) => (id === 13 || id === 14 ? "stone4" : undefined))),
  /** The shady side: moss along the joints and a tuft where four squares meet. */
  "ground/brick-paving-c": tile((p) => {
    basket(p, 3);
    mossJoints(p, 14, 18, 13, 10, 33);
    stamp(p, 14, 14, [".G.", "gMg"], L, false);
  }),
  /**
   * One cracked brick replaced with a red one from somewhere else, the only red in the yard, and a
   * sunk brick holding a thumbprint of last night's rain.
   */
  "ground/brick-paving-d": tile((p) => {
    basket(p, 4, (id) => (id === 10 ? "tan2" : id === 21 ? "stone2" : undefined));
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const b = basketAt(x, y);
      if (b.id === 21 && !b.joint && inBlob(x, y, x - (x % 8) + 4, y - (y % 4) + 1.5, 3, 1.5)) p.px(x, y, hash(x, y, 4) < 0.2 ? "blue5" : "blue4");
    }
  }),

  // courtyard-stone
  /** Granite slabs in windmill bond. */
  "ground/courtyard-stone-a": tile((p) => slabs(p, 1)),
  /** Windmill bond, the little square replaced with a darker stone. */
  "ground/courtyard-stone-b": tile((p) => slabs(p, 2, { 4: GRANITE_DARK })),
  /**
   * The yard's drain: a shallow channel cut along a slab, its upper wall in shadow and its floor damp,
   * running into a cast-iron grate set in the little square, a rust stain weeping from it.
   */
  "ground/courtyard-stone-c": tile((p) => {
    slabs(p, 3);
    for (let x = 2; x < 12; x++) { p.px(x, 14, "stone1").px(x, 15, "stone2").px(x, 16, x % 4 === 0 ? "jade2" : "stone2").px(x, 17, "stone4"); }
    stamp(p, 12, 12, [
      "aaaaaaa",
      "aIjIjIa",
      "aiaiaia",
      "aIjIjIa",
      "aiaiaia",
      "aIjIjIa",
      "aaaaaaa",
    ], L, false);
    stamp(p, 15, 19, ["xx", ".x"], L, false);
  }),
  /** Where the big glazed water jar stood for forty years before it cracked: a pale ring, moss in the joints. */
  "ground/courtyard-stone-d": tile((p) => {
    slabs(p, 4, { 2: GRANITE_PALE });
    p.each((x, y, c) => (c && x > 12 && y > 20 && inBlob(x, y, 22, 26, 6, 4) && !inBlob(x, y, 22, 26, 4.6, 2.8) ? "stone4" : undefined));
    p.each((x, y, c) => (c === "stone1" && hash((x + y) >> 1, 0, 44) < 0.4 ? "jade2" : undefined));
  }),

  // moss-earth
  /** Packed earth. */
  "ground/moss-earth-a": tile((p) => earth(p, 1)),
  /** Packed earth, a different scatter. */
  "ground/moss-earth-b": tile((p) => earth(p, 2)),
  /** Packed earth with a sprig of moss starting in a hollow. */
  "ground/moss-earth-c": tile((p) => {
    earth(p, 3);
    stamp(p, 12, 14, [".gg..", "MgGg.", ".MgmM", "..MM."], L, false);
  }),
  /** Packed earth and a wooden clothes peg dropped from the laundry poles overhead. */
  "ground/moss-earth-d": tile((p) => {
    earth(p, 4);
    stamp(p, 12, 13, [
      "QQQq.....",
      "qqqqjjo..",
      "..ooQQQq.",
      "....oqqqo",
    ], L, false);
  }),

  // threshold-stone
  /** Long sills: the top row's sill ends here, the bottom row's runs on. */
  "ground/threshold-stone-a": tile((p) => sills(p, 1, [true, false])),
  /** Long sills: the bottom row's sill ends here, the top row's runs on. */
  "ground/threshold-stone-b": tile((p) => sills(p, 2, [false, true])),
  /** Both sills end here; the top one cracked clean through long ago and is held with two iron cramps. */
  "ground/threshold-stone-c": tile((p) => {
    sills(p, 3, [true, true]);
    for (let y = 1; y < 14; y++) p.px(17 + (y % 4 === 0 ? 1 : 0), y, "stone2");
    stamp(p, 14, 3, ["iiiiiiii", "jIIIIIIi"], L, false);
    stamp(p, 14, 10, ["iiiiiiii", "jIIIIIIi"], L, false);
  }),
  /** Both sills run on through the tile, the top one dished pale where everyone steps. */
  "ground/threshold-stone-d": tile((p) => {
    sills(p, 4, [false, false]);
    p.each((x, y, c) => (c === "stone4" && inBlob(x, y, 15, 7, 12, 4) && hash(x >> 1, y >> 1, 35) < 0.35 ? "stone5" : undefined));
  }),

  // worn-stone
  /** Cobbles: setts of mixed size in courses that wander. */
  "ground/worn-stone-a": tile((p) => cobbles(p, 1)),
  /** Cobbles, a different lie of tones. */
  "ground/worn-stone-b": tile((p) => cobbles(p, 2)),
  /** Last night's rain in a dip in the cobbles: the sky in it, the joints dark. */
  "ground/worn-stone-c": tile((p) => cobbles(p, 3, (x, y) => inBlob(x, y, 15, 15, 10 + Math.sin(y * 0.8) * 1.2, 6.5))),
  /** A smaller puddle, two lobes, where the drainpipe empties. */
  "ground/worn-stone-d": tile((p) => cobbles(p, 4, (x, y) => inBlob(x, y, 11, 18, 6, 4) || inBlob(x, y, 19, 21, 5, 3.2))),
};

const SIDES: readonly Side[] = ["n", "s", "w", "e"];
const CORNERS: readonly Corner[] = ["nw", "ne", "sw", "se"];
for (const side of SIDES) {
  /** On paving, stone or sills: moss and earth creeping in from a bed on this side. */
  sprites[`ground/edge-moss-${side}-a`] = tile((p) => mossFray(p, side, 1));
  sprites[`ground/edge-moss-${side}-b`] = tile((p) => mossFray(p, side, 2));
  /** On brick paving: a soldier course where it stops against stone on this side. */
  sprites[`ground/edge-brick-paving-${side}`] = tile((p) => brickHeader(p, side));
  /** On cobbles: granite edging setts where they stop against slabs on this side. */
  sprites[`ground/edge-cobble-${side}`] = tile((p) => cobbleEdge(p, side));
  /** On cobbles: moss in the joints along the lane's edge on this side. */
  sprites[`ground/edge-cobble-moss-${side}`] = tile((p) => cobbleMoss(p, side, 51));
  /** On threshold stone: the platform's edge on this side (its front face, to the south). */
  sprites[`ground/edge-sill-${side}`] = tile((p) => sillEdge(p, side));
}
/** The step's riser with one deep dip worn where feet land on the way up to the hall door. */
sprites["ground/edge-sill-s-b"] = tile((p) => sillEdge(p, "s", [[11, 4]]));
/** The step's riser with two shallow dips side by side, where people stand to knock. */
sprites["ground/edge-sill-s-c"] = tile((p) => sillEdge(p, "s", [[7, 3], [22, 3]]));
for (const corner of CORNERS) {
  sprites[`ground/edge-moss-${corner}`] = tile((p) => mossCorner(p, corner));
  sprites[`ground/edge-brick-paving-${corner}`] = tile((p) => brickCorner(p, corner));
  sprites[`ground/edge-cobble-${corner}`] = tile((p) => cobbleCorner(p, corner));
  sprites[`ground/edge-sill-${corner}`] = tile((p) => sillCorner(p, corner));
}

// Bands laid over many tiles by corner (bits: nw ne sw se), placed by `ground-courtyard-legend.ts`.
for (let m = 1; m < 16; m++) {
  const bits = m.toString(2).padStart(4, "0");
  /** On moss-earth: darker damp ground in broad soft patches. */
  sprites[`ground/moss-earth-damp-${bits}`] = tile((p) => inBand(p, bits, 150 + m, (q) => damp(q, 150 + m)));
  /** On moss-earth: moss gathering in the shade, by walls and the sill platform. */
  sprites[`ground/moss-earth-moss-${bits}`] = tile((p) => inBand(p, bits, 70 + m, (q) => mossTexture(q, 70 + m)));
  /** On moss-earth: bare earth trodden pale where feet step off the paths. */
  sprites[`ground/moss-earth-bare-${bits}`] = tile((p) => inBand(p, bits, 90 + m, (q) => trodden(q, 90 + m)));
  /** On worn-stone: the worn path down the middle of a lane, paler and smoother setts. */
  sprites[`ground/worn-stone-path-${bits}`] = tile((p) => wornPath(p, bits, 110 + m));
}
sprites["ground/moss-earth-damp-1111b"] = tile((p) => damp(p, 166));
sprites["ground/moss-earth-moss-1111b"] = tile((p) => mossTexture(p, 131));
sprites["ground/moss-earth-bare-1111b"] = tile((p) => trodden(p, 132));
sprites["ground/worn-stone-path-1111b"] = tile((p) => wornPath(p, "1111", 133));

export default defineSprites(sprites);
