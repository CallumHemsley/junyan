/**
 * The town's grass: the scruffy verges of a Concession lane, not a lawn. Nobody mows it; the street
 * sweeper strims it twice a year and the neighbours' dogs and short cuts do the rest. Mid-green with
 * darker blade clumps and a few sunlit tips; clover where it is damp, bare earth where feet cut the
 * corner, and in November the plane trees drop leaves and seed balls on everything.
 *
 * Blade marks sit on a jittered grid and wrap at the tile edge, so each variant tiles on its own and
 * against the others. The scene weights a and b heavily, c moderately and d rarely.
 */
import { defineSprites, hash, type Legend, type Px } from "../../kit/index.ts";
import { T, jitter, stamp, tile, wrap } from "./_helpers.ts";

const L: Legend = {
  d: "leaf2", D: "leaf1", g: "leaf3", h: "leaf4", H: "leaf5",
  j: "jade4", J: "jade5", k: "jade3", w: "white", c: "cream4", p: "pink3",
  e: "oak2", E: "oak1", f: "oak3", s: "stone4", S: "stone2", t: "stone3",
  b: "bamboo3", B: "bamboo2", n: "bamboo4", o: "oak4", r: "brown2", R: "brown3", y: "gold4", Y: "gold3",
};

/** Blade clumps: shade strokes with a lit tip, a few shapes so the field never reads as a stamp. */
const CLUMPS: readonly (readonly string[])[] = [
  [".h.", "d.d"],
  ["h..", "dh.", ".d."],
  [".h.h", "d.dd"],
  ["..h", ".d.", "d.."],
  ["d.d", ".d."],
  [".d.", "d.d"],
  ["h.", "d."],
];

/** The base field: leaf3 with clumps of shade blades and sunlit tips on a jittered grid. */
function field(p: Px, seed: number, density = 1) {
  p.rect(0, 0, T, T, "leaf3");
  // Broad, quiet tone: darker damp tufts (small clusters, never single pixels) take a fair share of the green.
  for (const [x, y, r] of jitter(8, seed + 7, 1)) {
    if (r > 0.65) continue;
    stamp(p, x, y, r < 0.2 ? ["dd.", ".dd"] : r < 0.35 ? [".d", "dd", "d."] : ["d.d", "dd."], L);
  }
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r > density) continue;
    stamp(p, x, y, CLUMPS[Math.floor(hash(x, y, seed + 3) * CLUMPS.length)], L);
  }
  // Small shade marks between the clumps, so the green never sits flat; lit marks are rarer.
  for (const [x, y, r] of jitter(4, seed + 11, 0)) {
    if (r > 0.34 * density) continue;
    wrap(p, x, y, r < 0.29 * density ? "leaf2" : "leaf4");
  }
}

/** A fallen plane-tree leaf, dry and curled, five lobes reduced to what reads at 2×. */
function planeLeaf(p: Px, x: number, y: number, flip = false) {
  const rows = [
    "..b.b..",
    ".bnbnb.",
    "bnnBnnb",
    ".bnBnb.",
    "..bBb..",
    "...B...",
    "....B..",
  ];
  stamp(p, x, y, flip ? rows.map((r) => [...r].reverse().join("")) : rows, L);
}

export default defineSprites({
  /** Plain verge. */
  "ground/grass-a": tile((p) => field(p, 1)),

  /** Plain verge, a different scatter. */
  "ground/grass-b": tile((p) => field(p, 2)),

  /** A clover patch where the downpipe drains: rounder, bluer leaves and two white clover heads. */
  "ground/grass-c": tile((p) => {
    field(p, 3, 0.7);
    const leaves = [[6, 7], [11, 5], [9, 11], [15, 9], [4, 13], [13, 14], [18, 12], [8, 17]];
    for (const [x, y] of leaves) {
      const pick = hash(x, y, 33);
      stamp(p, x, y, pick < 0.5
        ? [".j.j.", "jJkJj", ".jkj.", "..k.."]
        : [".jj.", "jJJj", ".kk.", ".k.."], L);
    }
    // One white clover head on a short stalk, lit from the upper left.
    stamp(p, 12, 9, [".ww.", "wwcw", ".cp.", "..d."], L);
  }),

  /**
   * Where everyone cuts the corner: the turf thinned to straw and scuffed through to earth in places,
   * fading out at the edges rather than stopping, a plane tree's seed ball (the spiky brown bauble the
   * kids throw at each other in autumn) and one dry leaf.
   */
  "ground/grass-d": tile((p) => {
    field(p, 4, 0.8);
    const cx = 15, cy = 15;
    // Two-pixel clusters, more of them toward the middle: straw first, earth at the heart.
    for (let y = 2; y < 30; y += 2) for (let x = 2; x < 30; x += 2) {
      const d = Math.hypot((x - cx) / 12, (y - cy) / 8);
      const r = hash(x, y, 47);
      if (d > 1 || r > 1.05 - d) continue;
      const earth = d < 0.55 && r < 0.6;
      const c = earth ? "oak2" : r < 0.5 ? "bamboo3" : "bamboo4";
      p.px(x, y, c).px(x + 1, y, c);
      if (earth) { p.px(x, y + 1, "oak2").px(x + 1, y + 1, hash(x, y, 48) < 0.5 ? "oak3" : "oak2"); if (p.get(x, y - 1) !== "oak2") p.hline(x, y - 1, 2, "oak1"); }
    }
    stamp(p, 9, 13, ["h.", "d."], L);
    stamp(p, 21, 18, [".h", "dd"], L);
    stamp(p, 12, 19, ["ss", "tS"], L);
    stamp(p, 15, 13, [".R.", "RoR", "rRr", ".r."], L);
    planeLeaf(p, 21, 21, true);
  }),
});
