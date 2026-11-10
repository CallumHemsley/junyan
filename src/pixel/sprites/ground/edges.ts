/**
 * Where the town's ground materials meet. Every edge is an overlay: transparent except along the side
 * it names, drawn by `groundLayers()` over the base tile of the cell it sits in. The side in the id is
 * where the *other* material lies: `edge-kerb-n` sits on a road cell with paving to its north.
 *
 * - `edge-kerb-*` (on road): the granite kerb. North of the road the pavement stands a kerb's height
 *   above it, so its sunlit cap and shaded front face show; south of it only the cap shows. Where a
 *   lane crosses the road on a raised table, the kerb is dropped flush (`-w`, `-e`).
 * - `edge-grass-*` (on paving, brick or stone): the verge fraying onto the hard ground, a soil line,
 *   blades poking out, a soft shadow under the overhang.
 * - `edge-header-*` (on brick): a soldier course of bricks on end, where the herringbone stops against
 *   flags or granite.
 * - `edge-coping-*` (on whatever is beside the canal): the dressed granite cap of the canal wall.
 * - `edge-water-*` (on water): the canal wall's face, and the bank's shadow on the water.
 *
 * Corner pieces (`-nw`, `-ne`, `-sw`, `-se`) close a run where two edges meet or a diagonal touches.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { T, type Corner, type Side, mod, sided, tile, stamp } from "./_helpers.ts";
import { TONES, type BrickTone } from "./_brick.ts";

// ── kerbs ────────────────────────────────────────────────────────────────────

/** Kerbstones are 16 long, joints on 15 and 31 along the run. */
const kerbJoint = (a: number) => a % 16 === 15;

/** The kerb north of the road: the pavement's lip, the sunlit cap, the shaded face, the gutter. */
function kerbNorth(p: Px, seed: number) {
  for (let x = 0; x < T; x++) {
    const j = kerbJoint(x);
    p.px(x, 0, "stone2");
    p.px(x, 1, j ? "stone2" : hash(x >> 1, 1, seed) > 0.2 ? "stone5" : "stone4");
    p.px(x, 2, j ? "stone2" : "stone4").px(x, 3, j ? "stone2" : "stone4");
    p.px(x, 4, j ? "stone2" : hash(x >> 2, 4, seed) > 0.3 ? "cream4" : "stone4");
    p.px(x, 5, j ? "stone1" : "stone3").px(x, 6, j ? "stone1" : "stone3").px(x, 7, j ? "stone1" : "stone2");
    p.px(x, 8, "steel1");
    if (hash(x >> 1, 9, seed) < 0.55) p.px(x, 9, "steel1");
  }
  // Granite flecks on the cap, two-pixel clusters.
  for (let k = 0; k < 4; k++) {
    const x = 2 + Math.floor(hash(k, 2, seed) * 27);
    if (!kerbJoint(x) && !kerbJoint(x + 1)) p.px(x, 2 + (k & 1), "stone3").px(x + 1, 2 + (k & 1), "stone3");
  }
}

/** The kerb south of the road: only its cap shows, with grime along the gutter on the road side. */
function kerbSouth(p: Px, seed: number) {
  for (let x = 0; x < T; x++) {
    const j = kerbJoint(x);
    if (hash(x >> 1, 24, seed) < 0.5) p.px(x, 25, "steel1");
    p.px(x, 26, "steel1");
    p.px(x, 27, j ? "stone2" : hash(x >> 1, 27, seed) > 0.2 ? "stone5" : "stone4");
    p.px(x, 28, j ? "stone2" : "stone4").px(x, 29, j ? "stone2" : "stone4").px(x, 30, j ? "stone2" : "stone3");
    p.px(x, 31, "stone2");
  }
  for (let k = 0; k < 4; k++) {
    const x = 2 + Math.floor(hash(k, 3, seed) * 27);
    if (!kerbJoint(x) && !kerbJoint(x + 1)) p.px(x, 28 + (k & 1), "stone3").px(x + 1, 28 + (k & 1), "stone3");
  }
}

/** A dropped kerb, flush with the road, along the west or east side of a road cell. */
function kerbSide(p: Px, side: "w" | "e", seed: number) {
  for (let y = 0; y < T; y++) {
    const j = kerbJoint(y);
    const col = (d: number) => (side === "w" ? d : T - 1 - d);
    p.px(col(0), y, "stone2");
    p.px(col(1), y, j ? "stone2" : side === "e" ? "stone4" : hash(y >> 1, 1, seed) > 0.25 ? "stone5" : "stone4");
    p.px(col(2), y, j ? "stone2" : "stone4").px(col(3), y, j ? "stone2" : "stone4");
    p.px(col(4), y, j ? "stone2" : side === "e" ? (hash(y >> 1, 4, seed) > 0.25 ? "stone5" : "stone4") : "stone3");
    p.px(col(5), y, side === "w" ? "steel1" : hash(y >> 1, 5, seed) < 0.5 ? "steel1" : null);
  }
}

// ── grass fraying onto hard ground ──────────────────────────────────────────

/** How far the fray reaches at each point along an edge: 3 at both ends so runs join. */
function frayDepth(a: number, seed: number): number {
  const ends = Math.min(a, T - 1 - a);
  const wave = Math.sin((a + seed * 7) * 0.45) * 1.4 + Math.sin((a + seed * 3) * 1.3) * 0.8;
  const raw = 3 + Math.max(0, wave + 1);
  return Math.round(ends < 4 ? 3 + (raw - 3) * (ends / 4) : raw);
}

function grassFray(p: Px, side: Side, seed: number) {
  // The ground's edge face, or the shadow under the overhanging grass: a soft translucent line.
  p.faded(0.3, () => sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) { const d = frayDepth(a, seed); plot(a, d, "ink2"); if (hash(a >> 1, 7, seed) < 0.4) plot(a, d + 1, "ink2"); }
  }));
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const depth = frayDepth(a, seed);
      for (let d = 0; d < depth; d++) plot(a, d, d === depth - 1 ? "leaf2" : "leaf3");
      // Soil showing between the roots on the fray's edge, here and there.
      if (hash(a >> 1, 3, seed) < 0.3) plot(a, depth - 1, "oak1");
    }
    // Blades poking out past the fray: shade stroke with a sunlit tip.
    for (let k = 0; k < 6; k++) {
      const a = 3 + Math.floor(hash(k, 1, seed) * 26), depth = frayDepth(a, seed);
      const len = 1 + Math.floor(hash(k, 2, seed) * 3);
      for (let i = 0; i < len; i++) plot(a + (i === len - 1 && k % 2 ? 1 : 0), depth + i, i === len - 1 ? "leaf4" : "leaf2");
    }
    // A sunlit clump inside the fray, so it reads as grass, not paint.
    for (let k = 0; k < 4; k++) {
      const a = 2 + Math.floor(hash(k, 4, seed) * 28);
      plot(a, 1, "leaf4"); plot(a + 1, 0, "leaf4"); plot(a, 2, "leaf2");
    }
  });
}

function grassCorner(p: Px, corner: Corner, seed: number) {
  const fx = (x: number) => (corner.endsWith("w") ? x : T - 1 - x);
  const fy = (y: number) => (corner.startsWith("n") ? y : T - 1 - y);
  p.faded(0.3, () => { for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if (x + y === 5 || x + y === 6 && hash(x, y, seed) < 0.5) p.px(fx(x), fy(y), "ink2"); });
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    if (x + y > 4) continue;
    p.px(fx(x), fy(y), x + y === 4 ? "leaf2" : "leaf3");
  }
  p.px(fx(1), fy(1), "leaf4").px(fx(5), fy(1), "leaf2").px(fx(6), fy(1), "leaf4");
}

// ── header course ───────────────────────────────────────────────────────────

/** A brick rectangle with its joint on the bottom row and right column, lit top-left, a darker heel. */
function brickRect(p: Px, x: number, y: number, w: number, h: number, tone: BrickTone) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let c: Color = tone.face;
    if (i === w - 1 || j === h - 1) c = "stone2";
    else if ((j === 0 && i < 2) || (i === 0 && j < 2)) c = tone.lit;
    else if (i === w - 2 && j === h - 2) c = tone.dark;
    p.px(x + i, y + j, c);
  }
}
const headerTone = (k: number, salt: number): BrickTone => {
  const r = hash(k, salt, 61);
  return r < 0.18 ? TONES.dusty : r < 0.4 ? TONES.dark : TONES.warm;
};

function header(p: Px, side: Side) {
  for (let k = 0; k < 8; k++) {
    const tone = headerTone(k, side.charCodeAt(0));
    if (side === "n") brickRect(p, k * 4, 0, 4, 8, tone);
    else if (side === "s") brickRect(p, k * 4, 24, 4, 8, tone);
    else if (side === "w") brickRect(p, 0, k * 4, 8, 4, tone);
    else brickRect(p, 24, k * 4, 8, 4, tone);
  }
}

function headerCorner(p: Px, corner: Corner) {
  const x = corner.endsWith("w") ? 0 : 24, y = corner.startsWith("n") ? 0 : 24;
  // A cut square brick where two soldier courses meet.
  brickRect(p, x, y, 8, 8, TONES.warm);
}

// ── canal coping and wall ───────────────────────────────────────────────────

/**
 * Coping stones: `deep` px from the water (16 on the stone bank, so they replace its outer column of
 * blocks; 12 elsewhere), 16 long, joints on 7 and 23 along the run.
 */
const copingJoint = (a: number) => a % 16 === 7;
const COPING_DEEP = { e: 16, w: 12, s: 12 } as const;

function coping(p: Px, side: "e" | "w" | "s", seed: number) {
  const deep = COPING_DEEP[side];
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const j = copingJoint(a);
      // depth 0 is the arris over the water, depth deep-1 the joint with the ground behind.
      plot(a, deep - 1, "stone2");
      for (let d = 1; d < deep - 1; d++) plot(a, d, j ? "stone2" : "stone4");
      // The sun lights the coping's far (north or west) margin and its west or south arris.
      const lit: Color = j ? "stone2" : hash(a >> 1, 1, seed) > 0.2 ? "stone5" : "stone4";
      if (side === "w") { plot(a, 0, lit); plot(a, deep - 2, j ? "stone2" : "stone3"); }
      else if (side === "s") { plot(a, 0, j ? "stone2" : "cream4"); plot(a, deep - 2, lit); }
      else { plot(a, 0, j ? "stone2" : "stone3"); plot(a, deep - 2, lit); }
    }
    // Wear: the top dished where people sit to fish, two-pixel flecks of the granite.
    for (let k = 0; k < 4; k++) {
      const a = 2 + Math.floor(hash(k, 5, seed) * 26), d = 3 + Math.floor(hash(k, 6, seed) * (deep - 6));
      if (!copingJoint(a) && !copingJoint(a + 1)) { plot(a, d, k % 2 ? "steel3" : "stone3"); plot(a + 1, d, k % 2 ? "steel3" : "stone3"); }
    }
  });
}

/** The corner where a lane's coping (south) meets a bank's coping: one squared block. */
function copingCorner(p: Px, corner: "se" | "sw") {
  const x0 = corner === "se" ? 16 : 0, x1 = corner === "se" ? T : 12, y0 = T - COPING_DEEP.s;
  for (let y = y0; y < T; y++) for (let x = x0; x < x1; x++) {
    const edge = y === y0 || (corner === "se" ? x === x0 : x === x1 - 1);
    p.px(x, y, edge ? "stone2" : y === y0 + 1 ? "stone5" : y === T - 1 ? "cream4" : "stone4");
  }
}

/** The canal wall's face under the coping, seen from the south: two courses, wet below, then the waterline. */
function wallFace(p: Px, seed: number) {
  for (let x = 0; x < T; x++) {
    const j1 = mod(x - 5, 16) === 15, j2 = mod(x - 13, 16) === 15;
    for (let y = 0; y < 5; y++) p.px(x, y, j1 ? "stone1" : y === 0 ? "stone4" : "stone3");
    p.px(x, 5, "stone1");
    for (let y = 6; y < 9; y++) p.px(x, y, j2 ? "stone1" : y === 6 ? "stone3" : "stone2");
    // Waterline: a band of slick green algae, ragged at its lower edge.
    p.px(x, 9, "leaf1");
    if (hash(x >> 1, 10, seed) < 0.6) p.px(x, 10, "jade1");
    if (hash(x, 8, seed) < 0.25) p.px(x, 8, "jade2");
  }
  // The wall's reflection, broken by the ripples.
  p.faded(0.35, () => { for (let x = 0; x < T; x++) for (let y = 11; y < 15; y++) if (hash(x >> 1, y, seed) < 0.75 - (y - 11) * 0.18) p.px(x, y, "steel1"); });
  // A weep hole draining the lane, with a dark streak below it.
  stamp(p, 20, 2, ["ii", "ii", ".j"], { i: "ink2", j: "stone1" }, false);
}

/** The west bank's shadow on the water: the sun is upper left, so the bank shades the water just east of it. */
function bankShadow(p: Px, seed: number) {
  p.faded(0.45, () => { for (let y = 0; y < T; y++) { const w = 5 + (hash(y >> 2, 0, seed) < 0.5 ? 1 : 0); for (let x = 1; x < w; x++) p.px(x, y, "blue1"); } });
  for (let y = 0; y < T; y++) p.px(0, y, hash(y >> 1, 1, seed) < 0.7 ? "leaf1" : "jade1");
}

/** The east bank: a waterline and the coping's pale reflection, wobbling. */
function bankLit(p: Px, seed: number) {
  for (let y = 0; y < T; y++) p.px(T - 1, y, hash(y >> 1, 1, seed) < 0.7 ? "leaf1" : "jade1");
  p.faded(0.35, () => { for (let y = 0; y < T; y++) { const w = 2 + (hash(y >> 1, 2, seed) < 0.5 ? 1 : 0); for (let x = T - 1 - w; x < T - 1; x++) if (hash(x, y >> 1, seed) < 0.7) p.px(x, y, "stone5"); } });
}

// ── registry ────────────────────────────────────────────────────────────────

const SIDES: readonly Side[] = ["n", "s", "w", "e"];
const CORNERS: readonly Corner[] = ["nw", "ne", "sw", "se"];
const sprites: Record<string, SpriteDef> = {
  /** Kerb north of the road. */
  "ground/edge-kerb-n-a": tile((p) => kerbNorth(p, 1)),
  /** Kerb north of the road, its arris chipped by a cart wheel and a weed in the gutter. */
  "ground/edge-kerb-n-b": tile((p) => {
    kerbNorth(p, 2);
    stamp(p, 21, 4, ["bbb", ".ab", "..a"], { a: "stone1", b: "stone2" }, false);
    stamp(p, 6, 7, [".h.h", "gdgd", ".gg."], { h: "leaf4", g: "leaf3", d: "leaf2" }, false);
  }),
  /** Kerb south of the road. */
  "ground/edge-kerb-s-a": tile((p) => kerbSouth(p, 3)),
  /** Kerb south of the road, two dry plane leaves caught against it in the gutter. */
  "ground/edge-kerb-s-b": tile((p) => {
    kerbSouth(p, 4);
    const leaf = { b: "bamboo3", n: "bamboo4", B: "bamboo2", o: "oak3" } as const;
    stamp(p, 8, 21, ["..b.b.", ".bnbnb", "bnnBnb", ".bBbb.", "...B.."], leaf, false);
    stamp(p, 22, 23, [".oo.", "obBo", ".oB."], leaf, false);
  }),
  /** Dropped kerb on the west side of the road, where a lane crosses on a raised table. */
  "ground/edge-kerb-w": tile((p) => kerbSide(p, "w", 5)),
  /** Dropped kerb on the east side of the road. */
  "ground/edge-kerb-e": tile((p) => kerbSide(p, "e", 6)),

  /** The canal coping on a stone bank cell, water to the east. */
  "ground/edge-coping-e": tile((p) => coping(p, "e", 7)),
  /** The canal coping on the far bank, water to the west. */
  "ground/edge-coping-w": tile((p) => coping(p, "w", 8)),
  /** The canal coping where a lane ends at the water, water to the south. */
  "ground/edge-coping-s": tile((p) => coping(p, "s", 9)),
  "ground/edge-coping-se": tile((p) => copingCorner(p, "se")),
  "ground/edge-coping-sw": tile((p) => copingCorner(p, "sw")),

  /** On water: the canal wall's face below a lane that ends at the water (north). */
  "ground/edge-water-n": tile((p) => wallFace(p, 10)),
  /** On water: the west bank's shadow and waterline. */
  "ground/edge-water-w": tile((p) => bankShadow(p, 11)),
  /** On water: the east bank's waterline and reflection. */
  "ground/edge-water-e": tile((p) => bankLit(p, 12)),
};
for (const side of SIDES) {
  sprites[`ground/edge-grass-${side}-a`] = tile((p) => grassFray(p, side, 1));
  sprites[`ground/edge-grass-${side}-b`] = tile((p) => grassFray(p, side, 2));
  sprites[`ground/edge-header-${side}`] = tile((p) => header(p, side));
}
for (const corner of CORNERS) {
  sprites[`ground/edge-grass-${corner}`] = tile((p) => grassCorner(p, corner, 3));
  sprites[`ground/edge-header-${corner}`] = tile((p) => headerCorner(p, corner));
}

export default defineSprites(sprites);
