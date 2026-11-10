/**
 * The town's grass: the scruffy verges of a Concession lane under its plane trees, not a lawn. Nobody
 * mows it; the street sweeper strims it twice a year and the neighbours' dogs and short cuts do the rest.
 * A dark, muted green with sage and straw in it; clover where it is damp; in November the plane trees
 * drop leaves and seed balls on everything.
 *
 * `grass-a..d` are the ordinary verge. Over them the scene lays tone bands that span many tiles:
 * `grass-shade-<nw ne sw se bits>` where the canopy keeps the ground dark and damp, and `grass-worn-…`
 * along every pavement and short cut, trampled to straw and earth (see `_turf.ts`). The full-band tiles
 * have two variants (`-1111`, `-1111b`). The scene weights a and b heavily, c moderately and d rarely.
 */
import { defineSprites, hash, type Legend, type Px, type SpriteDef } from "../../kit/index.ts";
import { stamp, tile } from "./_helpers.ts";
import { bandMask, turf, turfWhere } from "./_turf.ts";

const L: Legend = {
  d: "leaf2", D: "leaf1", g: "leaf3", k: "jade3", j: "jade4", w: "cream5", c: "cream3", p: "pink2",
  e: "oak2", E: "oak1", f: "oak3", s: "stone4", S: "stone2", t: "stone3",
  b: "bamboo3", B: "bamboo2", n: "bamboo4", o: "oak4", r: "brown2", R: "brown3",
};

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

const sprites: Record<string, SpriteDef> = {
  /** Plain verge. */
  "ground/grass-a": tile((p) => turf(p, "mid", 1)),

  /** Plain verge, a different scatter. */
  "ground/grass-b": tile((p) => turf(p, "mid", 2)),

  /** A clover patch where the downpipe drains: rounder, bluer leaves and one white clover head. */
  "ground/grass-c": tile((p) => {
    turf(p, "mid", 3, 0.7);
    const leaves = [[6, 7], [11, 5], [9, 11], [15, 9], [4, 13], [13, 14], [18, 12], [8, 17]];
    for (const [x, y] of leaves) {
      stamp(p, x, y, hash(x, y, 33) < 0.5 ? [".k.k.", "kjDjk", ".kDk.", "..D.."] : [".kk.", "kjjk", ".DD.", ".D.."], L);
    }
    stamp(p, 12, 9, [".ww.", "wwcw", ".cp.", "..D."], L);
  }),

  /**
   * A scuffed spot where the kids play: straw and a little earth, two pebbles, a plane tree's seed ball
   * (the spiky brown bauble they throw at each other in autumn) and one dry leaf.
   */
  "ground/grass-d": tile((p) => {
    turf(p, "mid", 4, 0.8);
    turfWhere(p, "worn", 4, (x, y) => Math.hypot((x - 15) / 10, (y - 16) / 7) + (hash(x >> 1, y >> 1, 49) - 0.5) * 0.5 < 0.9);
    stamp(p, 12, 19, ["ss", "tS"], L);
    stamp(p, 15, 13, [".R.", "RoR", "rRr", ".r."], L);
    planeLeaf(p, 21, 20, true);
  }),
};

// Tone bands: every corner combination but "none", each tone with its own seeds.
for (let m = 1; m < 16; m++) {
  const bits = m.toString(2).padStart(4, "0");
  sprites[`ground/grass-shade-${bits}`] = tile((p) => turfWhere(p, "shade", 20 + m, bandMask(bits, 20 + m)));
  sprites[`ground/grass-worn-${bits}`] = tile((p) => turfWhere(p, "worn", 40 + m, bandMask(bits, 40 + m)));
}
sprites["ground/grass-shade-1111b"] = tile((p) => turf(p, "shade", 61));
sprites["ground/grass-worn-1111b"] = tile((p) => turf(p, "worn", 62));

export default defineSprites(sprites);
