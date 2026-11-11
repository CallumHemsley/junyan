/**
 * The rooftop garden's ground: a flat roof above the lanes that the neighbours share, laid piece by piece
 * over forty years. Five materials:
 *
 * - `roof-tile`: the main deck, 16 px square terracotta roof tiles, sun-faded unevenly, grey grout,
 *   moss creeping into the joints where the parapet keeps them damp.
 * - `roof-concrete`: the poured deck round the water tank and stairhead, pale screed cast in bays
 *   a tile square, every bay joint sealed with a wandering dark bead; water stains and a drain.
 * - `roof-brick`: the walkways, small red-grey quarry tiles (8 px) in light grout.
 * - `roof-wood`: decking boards under the pergola, weathered silver, nail heads in lines over the joists.
 * - `roof-below`: past the parapets, the neighbours' grey pantile roofs a storey down: cooler, darker
 *   and lower in contrast than anything on the deck, so they read as below and far.
 *
 * Every pattern repeats every 32 px and anything crossing a tile edge is the same in every variant, so
 * any mix tiles. Edges (`ground/edge-roof-…`) and bands (`ground/roof-tile-faded-<nw ne sw se>`,
 * `roof-tile-moss-…`, `roof-concrete-stain-…`) are placed by `src/pixel/town/ground-rooftop-legend.ts`.
 */
import { defineSprites, hash, Px, type Color, type SpriteDef } from "../../kit/index.ts";
import { T, inBlob, jitter, sided, stamp, tile, type Corner, type Side } from "./_helpers.ts";
import { bandMask } from "./_turf.ts";

/** A well-mixed hash for picking tones by small grid coordinates (the kit's streaks diagonally there). */
function mix(x: number, y: number, seed: number): number {
  let v = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul((y | 0) + 0x3c6ef372, 0x165667b1) ^ Math.imul(seed | 0, 0x85ebca6b);
  v ^= v >>> 15; v = Math.imul(v, 0x2c1b3c6d); v ^= v >>> 12; v = Math.imul(v, 0x297a2d39); v ^= v >>> 15;
  return (v >>> 0) / 4294967296;
}

// ── roof-tile: square terracotta ────────────────────────────────────────────

type TileTone = { face: Color; lit: Color; shade: Color };
/**
 * Terracotta after decades of sun: most tiles faded to a dusty buff, some still warm, a few bleached
 * pale or fired darker. The quarry-tile walkways are the red-grey ones; the deck is the faded one.
 */
const TERRACOTTA: Record<"faded" | "warm" | "pale" | "dark", TileTone> = {
  faded: { face: "cream2", lit: "cream3", shade: "cream1" },
  warm: { face: "tan3", lit: "tan4", shade: "tan2" },
  pale: { face: "stone4", lit: "stone5", shade: "stone3" },
  dark: { face: "tan2", lit: "tan3", shade: "tan1" },
};
const squareTone = (key: number, seed: number): TileTone => {
  const r = mix(key, 3, seed);
  return r < 0.74 ? TERRACOTTA.faded : r < 0.84 ? TERRACOTTA.warm : r < 0.94 ? TERRACOTTA.pale : TERRACOTTA.dark;
};

/** Four 16 px tiles, grout on their right and bottom. `tone(key)` may override a tile (key 0..3). */
function roofTiles(p: Px, seed: number, tone?: (key: number) => TileTone | undefined, grout: Color = "cream1") {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const u = x % 16, v = y % 16, key = (x >> 4) + (y >> 4) * 2;
    if (u === 15 || v === 15) { p.px(x, y, grout); continue; }
    const t = tone?.(key) ?? squareTone(key, seed);
    let c = t.face;
    if (v === 0 && hash(u >> 2, key, seed + 1) > 0.35) c = t.lit;
    else if (v === 14 || (u === 14 && hash(v >> 2, key, seed + 2) > 0.5)) c = t.shade;
    p.px(x, y, c);
  }
  // A few two-pixel firing marks per tile, the dark specks old terracotta has.
  for (let k = 0; k < 8; k++) {
    const x = 2 + Math.floor(hash(k, 1, seed + 5) * 28), y = 2 + Math.floor(hash(k, 2, seed + 5) * 28);
    if (x % 16 < 13 && y % 16 < 13) p.px(x, y, squareTone((x >> 4) + (y >> 4) * 2, seed).shade).px(x + 1, y, squareTone((x >> 4) + (y >> 4) * 2, seed).shade);
  }
}

function groutMoss(p: Px, seed: number, inside: (x: number, y: number) => boolean, grout: Color = "cream1") {
  p.each((x, y, c) => (c === grout && inside(x, y) && hash(x >> 1, y >> 1, seed) < 0.7 ? (hash(x, y, seed + 1) < 0.25 ? "leaf2" : "jade2") : undefined));
}

// ── roof-concrete: poured bays ──────────────────────────────────────────────

/**
 * Pale screed, a bay per tile: the sealed joint runs along the bay's top and left edge, a bead that
 * wanders a pixel and has spilt in places. Float marks and grit in the face.
 */
function concrete(p: Px, seed: number) {
  p.rect(0, 0, T, T, "stone4");
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r < 0.3) stamp(p, x, y, ["cc"], { c: "stone3" });
    else if (r < 0.45) stamp(p, x, y, ["e", "e"], { e: "stone5" });
  }
  // Float marks: a couple of faint straight streaks where the screed was smoothed.
  for (let k = 0; k < 2; k++) {
    const x0 = 4 + Math.floor(hash(k, 4, seed) * 16), y = 6 + Math.floor(hash(k, 5, seed) * 20);
    p.hline(x0, y, 7 + Math.floor(hash(k, 6, seed) * 6), "stone5");
  }
  // The bay joint, shared by every variant: tar along the top and left, a lit lip just inside it.
  for (let i = 0; i < T; i++) {
    const wob = Math.round(Math.sin(i * 0.45) * 0.6);
    p.px(i, 0, "stone1").px(0, i, "stone1");
    if (wob > 0) { p.px(i, 1, "stone2"); p.px(1, i, "stone2"); }
    else { p.px(i, 1, "stone5"); p.px(1, i, "stone5"); }
  }
  // Where the sealant spilt over the joint.
  for (const [x, y] of [[9, 1], [24, 1], [1, 17]] as const) stamp(p, x, y, x < 3 ? ["i", "i", "i"] : ["iii"], { i: "stone1" });
}

// ── roof-brick: quarry tiles ────────────────────────────────────────────────

const QUARRY: readonly [Color, number][] = [["tan2", 0.5], ["cream1", 0.78], ["tan1", 0.9], ["stone2", 1]];
/** 8 px quarry tiles, light grout on their right and bottom, one flat face each. */
function quarry(p: Px, seed: number, face?: (i: number, j: number) => Color | undefined) {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const i = x >> 3, j = y >> 3;
    if (x % 8 === 7 || y % 8 === 7) { p.px(x, y, "stone3"); continue; }
    const f = face?.(i, j) ?? QUARRY.find(([, upTo]) => mix(i, j, seed) < upTo)![0];
    p.px(x, y, f);
  }
}

// ── roof-wood: silvered decking ─────────────────────────────────────────────

/**
 * Four boards of 8 px running east–west, the gap on the bottom row. Silvered grey with grain streaks;
 * nail heads in pairs over the joists at x 5 and 21 in every variant, so the nail lines run on unbroken.
 * `joints[b]` lists butt-joint columns in board b.
 */
function decking(p: Px, seed: number, joints: readonly (readonly number[])[] = [[], [], [], []], fresh?: { board: number; from: number; to: number }) {
  for (let b = 0; b < 4; b++) {
    const top = b * 8;
    for (let x = 0; x < T; x++) {
      const isFresh = fresh && fresh.board === b && x >= fresh.from && x < fresh.to;
      const face: Color = isFresh ? "oak2" : "grey2";
      for (let j = 0; j < 7; j++) p.px(x, top + j, j === 0 ? (isFresh ? "oak3" : "grey3") : j === 6 ? (isFresh ? "oak1" : "grey1") : face);
      p.px(x, top + 7, "ink2");
    }
    for (const jx of joints[b]) for (let j = 0; j < 7; j++) p.px(jx, top + j, "ink2");
    // Grain: two long streaks per board, kept clear of joints.
    for (let s = 0; s < 2; s++) {
      const x0 = 1 + Math.floor(hash(s, b, seed) * 18), len = 6 + Math.floor(hash(s, b, seed + 1) * 9), y = top + 2 + Math.floor(hash(s, b, seed + 2) * 3);
      for (let i = 0; i < len; i++) if (!joints[b].some((jx) => Math.abs(jx - (x0 + i)) < 2) && !(fresh && fresh.board === b)) p.px(x0 + i, y + (i > len / 2 ? 1 : 0), i % 5 === 4 ? "grey3" : "grey1");
    }
    for (const nx of [5, 21]) { p.px(nx, top + 2, "steel2").px(nx, top + 4, "steel2"); p.px(nx + 1, top + 2, "grey3"); }
  }
}

// ── roof-below: the neighbours' pantiles ────────────────────────────────────

/**
 * Grey pantiles seen from above and a storey away: S-curved tiles in columns 8 px wide (a lit roll and
 * a shaded pan), courses every 8 px with the lower course's lip a dark line. Cool and low in contrast.
 */
function pantiles(p: Px, seed: number) {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const u = x % 8, v = y % 8;
    let c: Color = u < 3 ? "steel3" : u < 6 ? "steel2" : "stone1";
    if (u === 1 && v < 6) c = "grey2";
    if (v === 7) c = "steel1";
    else if (v === 6 && u < 6) c = u < 3 ? "steel2" : "stone1";
    p.px(x, y, c);
  }
  // A few slipped or darker tiles, so the roofs below aren't a print.
  for (const [x, y, r] of jitter(8, seed, 0)) if (r < 0.18) {
    const cx = x - (x % 8), cy = y - (y % 8);
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) if (p.get(cx + i, cy + j) !== "steel1") p.px(cx + i, cy + j, i < 3 ? "steel2" : "stone1");
  }
}

// ── bands and edges ─────────────────────────────────────────────────────────

/** Sun-faded tiles: squares whose middle lies in the band a step paler and greyer; grout untouched. */
function fadedTiles(p: Px, bits: string, seed: number) {
  const inside = bandMask(bits, seed);
  const full = new Px(T, T);
  roofTiles(full, seed, (key) => (mix(key, 9, seed) < 0.75 ? TERRACOTTA.pale : TERRACOTTA.faded));
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const cx = (x >> 4) * 16 + 7, cy = (y >> 4) * 16 + 7;
    if (x % 16 !== 15 && y % 16 !== 15 && inside(cx, cy)) p.px(x, y, full.get(x, y));
  }
}

/** Damp by the parapet: moss along the joints and the tiles darkened a step. */
function mossTiles(p: Px, bits: string, seed: number) {
  const inside = bandMask(bits, seed);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    if (!inside(x, y)) continue;
    if (x % 16 === 15 || y % 16 === 15) { if (hash(x >> 1, y >> 1, seed) < 0.7) p.px(x, y, hash(x, y, seed + 1) < 0.3 ? "leaf2" : "jade2"); }
    else if (hash(x >> 2, y >> 2, seed + 2) < 0.3) p.faded(0.35, () => p.px(x, y, "jade1"));
  }
}

/** Water stains on the screed: soft darker blooms with a tide-mark rim. */
function stain(p: Px, bits: string, seed: number) {
  const inside = bandMask(bits, seed);
  const rim = (x: number, y: number) => inside(x, y) && (!inside(x + 1, y) || !inside(x, y + 1) || !inside(x - 1, y) || !inside(x, y - 1));
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    if (rim(x, y)) p.px(x, y, "stone2");
    else if (inside(x, y)) p.faded(0.4, () => p.px(x, y, "stone2"));
  }
}

/** On concrete: a tar-sealed movement joint where the screed meets other paving. */
function concreteEdge(p: Px, side: Side) {
  sided(p, side, (plot) => { for (let a = 0; a < T; a++) { plot(a, 0, "steel1"); plot(a, 1, Math.sin(a * 0.5) > 0.3 ? "steel1" : "stone5"); } });
}

/** On quarry-tile walkways: an edging course of long dark tiles laid lengthwise, 5 px. */
function quarryEdge(p: Px, side: Side) {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const joint = a % 16 === 15;
      for (let d = 0; d < 5; d++) plot(a, d, joint || d === 4 ? "stone3" : d === 0 ? "tan2" : "tan1");
    }
  });
}
function quarryCorner(p: Px, corner: Corner) {
  const x0 = corner.endsWith("w") ? 0 : T - 5, y0 = corner.startsWith("n") ? 0 : T - 5;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) p.px(x0 + i, y0 + j, (corner.endsWith("w") ? i === 4 : i === 0) || (corner.startsWith("n") ? j === 4 : j === 0) ? "stone3" : "tan1");
}

/**
 * On decking: the deck stands a few centimetres proud on its joists. To the south its front board
 * shows (silver, shaded) with a shadow at its foot; on the other sides a dark edge and the board ends.
 */
function deckEdge(p: Px, side: Side) {
  if (side === "s") {
    for (let x = 0; x < T; x++) {
      p.px(x, 27, "grey3").px(x, 28, "grey1").px(x, 29, "grey1").px(x, 30, "steel2");
      p.faded(0.4, () => p.px(x, 31, "ink2"));
    }
    for (const nx of [5, 21]) p.px(nx, 28, "steel1");
  } else if (side === "n") {
    for (let x = 0; x < T; x++) p.px(x, 0, "ink2").px(x, 1, "grey3");
  } else {
    const at = side === "w" ? 0 : T - 1, next = side === "w" ? 1 : T - 2;
    for (let y = 0; y < T; y++) { p.px(at, y, "ink2"); if (y % 8 !== 7) p.px(next, y, side === "w" ? "grey3" : "grey1"); }
  }
}
function deckCorner(p: Px, corner: Corner) {
  if (!corner.startsWith("s")) return;
  const x0 = corner === "sw" ? 0 : T - 1;
  for (let y = 27; y < 31; y++) p.px(x0, y, "ink2");
}

/** On the roofs below: the shadow the parapet and the deck cast down onto them. */
function dropShadow(p: Px, side: Side) {
  p.faded(0.45, () => sided(p, side, (plot) => { for (let a = 0; a < T; a++) for (let d = 0; d < 7 + (Math.sin(a * 0.4) > 0 ? 1 : 0); d++) plot(a, d, "ink"); }));
  p.faded(0.25, () => sided(p, side, (plot) => { for (let a = 0; a < T; a++) for (let d = 8; d < 12; d++) plot(a, d, "ink"); }));
}
function dropCorner(p: Px, corner: Corner) {
  const fx = (x: number) => (corner.endsWith("w") ? x : T - 1 - x);
  const fy = (y: number) => (corner.startsWith("n") ? y : T - 1 - y);
  p.faded(0.45, () => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) p.px(fx(x), fy(y), "ink"); });
}

// ── sprites ─────────────────────────────────────────────────────────────────

const sprites: Record<string, SpriteDef> = {
  /** Faded terracotta roof tiles. */
  "ground/roof-tile-a": tile((p) => roofTiles(p, 1)),
  /** Roof tiles, another lie of tones. */
  "ground/roof-tile-b": tile((p) => roofTiles(p, 2)),
  /** A tile cracked across where the water tank's crate was dropped, moss in its crack and the joint beside it. */
  "ground/roof-tile-c": tile((p) => {
    roofTiles(p, 3);
    for (let x = 17; x < 30; x++) p.px(x, 4 + Math.round((x - 17) * 0.6 + Math.sin(x)), "cream1");
    groutMoss(p, 31, (x, y) => inBlob(x, y, 16, 15, 9, 6));
  }),
  /** One tile gone, the hole filled with a square of grey cement by someone in a hurry. */
  "ground/roof-tile-d": tile((p) => {
    roofTiles(p, 4);
    for (let y = 16; y < 31; y++) for (let x = 0; x < 15; x++) p.px(x, y, y === 16 || x === 0 ? "stone4" : hash(x >> 1, y >> 1, 41) < 0.2 ? "stone2" : "stone3");
  }),

  /** A poured bay. */
  "ground/roof-concrete-a": tile((p) => concrete(p, 1)),
  /** A poured bay, another scatter of grit. */
  "ground/roof-concrete-b": tile((p) => concrete(p, 2)),
  /** A bay with a tide-marked water stain where a puddle sits after every rain. */
  "ground/roof-concrete-c": tile((p) => {
    concrete(p, 3);
    p.each((x, y, c) => (c && x > 2 && y > 2 && inBlob(x, y, 17, 18, 10, 7) ? (inBlob(x, y, 17, 18, 8.8, 5.8) ? (c === "stone4" ? "stone3" : undefined) : "stone2") : undefined));
  }),
  /** A bay with a little cast-iron outlet, the screed dished toward it and rust weeping out. */
  "ground/roof-concrete-d": tile((p) => {
    concrete(p, 4);
    p.each((x, y, c) => (c === "stone4" && inBlob(x, y, 16, 16, 9, 7) && !inBlob(x, y, 16, 16, 6, 4.5) ? "stone3" : undefined));
    stamp(p, 13, 13, ["iiiiii", "ijIjIi", "iIiIii", "ijIjIi", "iiiiii", ".rr...", "..r..."], { i: "steel1", I: "steel2", j: "steel3", r: "orange1" }, false);
  }),

  /** Quarry-tile walkway. */
  "ground/roof-brick-a": tile((p) => quarry(p, 1)),
  /** Quarry tiles, another mix. */
  "ground/roof-brick-b": tile((p) => quarry(p, 2)),
  /** A tile cracked in four and moss in the grout round it. */
  "ground/roof-brick-c": tile((p) => {
    quarry(p, 3, (i, j) => (i === 2 && j === 1 ? "tan2" : undefined));
    p.line(17, 9, 22, 13, "tan1").line(22, 9, 17, 13, "tan1");
    p.each((x, y, c) => (c === "stone3" && inBlob(x, y, 20, 12, 8, 6) && hash(x, y, 33) < 0.6 ? "jade2" : undefined));
  }),
  /** Two tiles replaced with grey ones from another job. */
  "ground/roof-brick-d": tile((p) => quarry(p, 4, (i, j) => ((i === 1 && j === 2) || (i === 2 && j === 2) ? "stone4" : undefined))),

  /** Silvered decking. */
  "ground/roof-wood-a": tile((p) => decking(p, 1, [[], [19], [], [9]])),
  /** Decking, butt joints elsewhere. */
  "ground/roof-wood-b": tile((p) => decking(p, 2, [[13], [], [27], []])),
  /** One board replaced last spring, still honey-coloured, its nails bright. */
  "ground/roof-wood-c": tile((p) => decking(p, 3, [[], [9], [9, 25], []], { board: 2, from: 10, to: 25 })),
  /** Decking with a dark knot and the pale ring where the teapot is always set down. */
  "ground/roof-wood-d": tile((p) => {
    decking(p, 4, [[], [], [15], []]);
    stamp(p, 24, 10, [".kk.", "kKKk", ".kk."], { k: "grey1", K: "stone1" }, false);
    p.each((x, y, c) => (c && inBlob(x, y, 11, 21, 5, 3.4) && !inBlob(x, y, 11, 21, 3.6, 2.2) && c !== "ink2" ? "grey3" : undefined));
  }),

  /** The neighbours' grey pantiles, a storey down. */
  "ground/roof-below-a": tile((p) => pantiles(p, 1)),
  /** Pantiles, other slipped tiles. */
  "ground/roof-below-b": tile((p) => pantiles(p, 2)),
  /** Pantiles with a patch of moss on the shaded pans. */
  "ground/roof-below-c": tile((p) => {
    pantiles(p, 3);
    p.each((x, y, c) => (c === "stone1" && inBlob(x, y, 14, 18, 10, 7) && hash(x, y >> 1, 35) < 0.6 ? "jade1" : undefined));
  }),
  /** Pantiles with a small glass skylight catching the sky. */
  "ground/roof-below-d": tile((p) => {
    pantiles(p, 4);
    p.rect(9, 9, 13, 10, "steel1").rect(10, 10, 11, 8, "blue2");
    p.rect(10, 10, 4, 2, "blue3").px(11, 12, "blue3");
    p.hline(10, 17, 11, "blue1");
  }),
};

const SIDES: readonly Side[] = ["n", "s", "w", "e"];
const CORNERS: readonly Corner[] = ["nw", "ne", "sw", "se"];
for (const side of SIDES) {
  /** On concrete: a tar-sealed joint where it meets other paving. */
  sprites[`ground/edge-roof-concrete-${side}`] = tile((p) => concreteEdge(p, side));
  /** On quarry tiles: the edging course. */
  sprites[`ground/edge-roof-brick-${side}`] = tile((p) => quarryEdge(p, side));
  /** On decking: the deck's edge (its front board, to the south). */
  sprites[`ground/edge-roof-wood-${side}`] = tile((p) => deckEdge(p, side));
  /** On the roofs below: the deck's shadow falling on them from this side. */
  sprites[`ground/edge-roof-below-${side}`] = tile((p) => dropShadow(p, side));
}
for (const corner of CORNERS) {
  sprites[`ground/edge-roof-brick-${corner}`] = tile((p) => quarryCorner(p, corner));
  sprites[`ground/edge-roof-wood-${corner}`] = tile((p) => deckCorner(p, corner));
  sprites[`ground/edge-roof-below-${corner}`] = tile((p) => dropCorner(p, corner));
}
for (let m = 1; m < 16; m++) {
  const bits = m.toString(2).padStart(4, "0");
  /** On roof tiles: sun-faded patches. */
  sprites[`ground/roof-tile-faded-${bits}`] = tile((p) => fadedTiles(p, bits, 200 + m));
  /** On roof tiles: damp and moss by the parapet. */
  sprites[`ground/roof-tile-moss-${bits}`] = tile((p) => mossTiles(p, bits, 220 + m));
  /** On concrete: water stains. */
  sprites[`ground/roof-concrete-stain-${bits}`] = tile((p) => stain(p, bits, 240 + m));
}
sprites["ground/roof-tile-faded-1111b"] = tile((p) => fadedTiles(p, "1111", 261));
sprites["ground/roof-tile-moss-1111b"] = tile((p) => mossTiles(p, "1111", 262));
sprites["ground/roof-concrete-stain-1111b"] = tile((p) => stain(p, "1111", 263));

export default defineSprites(sprites);
