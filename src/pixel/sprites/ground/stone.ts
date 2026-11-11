/**
 * The canal bank: dressed granite blocks, quarried in Suzhou and laid in 1912 when the creek was
 * straightened, their tops worn smooth and slightly dished by a century of feet. Long blocks run along
 * the bank (north–south), two to a tile, staggered: the left column's joints on rows 31, the right
 * column's on row 15, the long joints on columns 15 and 31, in every variant.
 *
 * Granite is the one ground material that may be flecked, sparingly, in two-pixel clusters.
 * The scene weights a and b heavily, c moderately and d rarely.
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { T, stamp, tile } from "./_helpers.ts";

const L: Legend = {
  a: "stone1", b: "stone2", c: "stone3", d: "stone4", e: "stone5",
  i: "steel1", I: "steel2", j: "steel3", r: "orange1", R: "gold1", o: "orange2",
  y: "bamboo4", Y: "bamboo3", k: "jade5", K: "jade4", w: "cream3", W: "cream4",
};

type Block = { x: number; y: number; w: number; h: number; key: number };
/** Left column: one block, y 0..30. Right column: a block straddling the tile's top and bottom edges. */
const BLOCKS: Block[] = [
  { x: 0, y: 0, w: 15, h: 31, key: 0 },
  { x: 16, y: 16, w: 15, h: 31, key: 1 },
];

function granite(p: Px, seed: number, face: Color = "stone3") {
  p.rect(0, 0, T, T, "stone1");
  for (const b of BLOCKS) {
    const shared = b.key === 1;
    for (let j = 0; j < b.h; j++) for (let i = 0; i < b.w; i++) {
      const x = b.x + i, y = (b.y + j) % T;
      let c: Color = face;
      // Dressed margin: a chisel-drafted border two pixels wide, lit top and left, shaded bottom and right.
      if (j === 0 || i === 0) c = "stone4";
      else if (j === b.h - 1 || i === b.w - 1) c = "stone2";
      else if (j === 1 || i === 1) c = hash(i, j, 3) < 0.5 ? "stone4" : face;
      p.px(x, y, c);
    }
    // Flecks: two-pixel clusters, cool and warm, kept inside the margin. Shared blocks use a fixed seed.
    const s = shared ? 500 : seed;
    for (let k = 0; k < 9; k++) {
      const fx = b.x + 3 + Math.floor(hash(k, b.key, s) * (b.w - 6));
      const fy = b.y + 3 + Math.floor(hash(k, b.key, s + 1) * (b.h - 6));
      const c: Color = k % 3 === 0 ? "stone4" : k % 3 === 1 ? "steel3" : "stone2";
      p.px(fx, fy % T, c).px(fx + 1, fy % T, c);
    }
  }
}

export default defineSprites({
  /** Plain granite. */
  "ground/stone-a": tile((p) => granite(p, 1)),

  /** Plain granite, the left block dished pale down its middle by a century of feet. */
  "ground/stone-b": tile((p) => {
    granite(p, 2);
    for (let y = 6; y < 26; y++) for (let x = 5; x < 11; x++) if (hash(x >> 1, y >> 1, 21) < 0.45 && p.get(x, y) === "stone3") p.px(x, y, "stone4");
  }),

  /** Lichen rosettes, sulphur-yellow and sage, where the willow's shade keeps the stone damp. */
  "ground/stone-c": tile((p) => {
    granite(p, 3);
    stamp(p, 4, 6, [".yY.", "yYyY", ".Yy."], L, false);
    stamp(p, 8, 20, [".kK", "kKk", ".k."], L, false);
    stamp(p, 3, 23, ["yY", "Y."], L, false);
  }),

  /**
   * An iron mooring ring leaded into the left block, from when the night-soil boats tied up here,
   * worn bright on top and weeping a rust stain down the stone.
   */
  "ground/stone-d": tile((p) => {
    granite(p, 4);
    stamp(p, 3, 8, [
      ".iiiii.",
      "ijjIIIi",
      "ij...Ii",
      "iI...Ii",
      ".iIIIi.",
      "..rRr..",
      "..rR...",
      "...r...",
      "...R...",
    ], L, false);
    stamp(p, 5, 5, ["aIa", "aia"], L, false);
  }),
});
