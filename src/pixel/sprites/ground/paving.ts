/**
 * Lane paving: old concrete flags, about half a metre square, laid in the 1950s over the original
 * granite and patched ever since. Running bond: in each tile the top row of flags has joints at x 15
 * and 31, the bottom row at x 7 and 23, and the bed joints run along rows 15 and 31, in every variant,
 * so any mix of variants tiles. Each flag's top and left lips catch the morning sun; its lower right
 * lip sits a shade down where it has settled.
 *
 * The scene weights a and b heavily, c moderately, and puts d (the manhole) rarely and never by an edge.
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { T, inBlob, stamp, tile } from "./_helpers.ts";

const L: Legend = {
  a: "stone1", b: "stone2", c: "stone3", d: "stone4", e: "stone5", w: "cream5",
  g: "leaf2", G: "leaf3", h: "leaf4", m: "jade2",
  i: "steel1", I: "steel2", j: "steel3", J: "steel4", k: "steel5",
  r: "orange1", R: "gold1", u: "brown2",
};

type Flag = { x: number; y: number; w: number; h: number; key: number };
type Tone = { face: Color; lit: Color; shade: Color; pit: Color };
const TONES: Record<"old" | "pale" | "dark" | "new" | "granite", Tone> = {
  old: { face: "stone4", lit: "stone5", shade: "stone3", pit: "stone3" },
  /** Sun-bleached, the cement skin long gone. */
  pale: { face: "stone5", lit: "stone5", shade: "stone4", pit: "stone4" },
  /** Soaked darker by a dripping AC unit or the drain's overflow. */
  dark: { face: "stone3", lit: "stone4", shade: "stone2", pit: "stone2" },
  /** A replacement flag: crisp edges, smooth, a touch whiter. */
  new: { face: "stone5", lit: "cream5", shade: "stone4", pit: "stone4" },
  /** One of the original granite setts left in when the concrete went down: cooler, flecked. */
  granite: { face: "stone4", lit: "stone5", shade: "stone3", pit: "steel3" },
};

/** The four flags of a tile (two straddle the side edges and wrap). */
const FLAGS: Flag[] = [
  { x: 0, y: 0, w: 15, h: 15, key: 0 }, { x: 16, y: 0, w: 15, h: 15, key: 1 },
  { x: -8, y: 16, w: 15, h: 15, key: 2 }, { x: 8, y: 16, w: 15, h: 15, key: 3 },
];

/** Joint colour: gritty, one step below the flags so the paving stays calm. */
const JOINT: Color = "stone3";

/**
 * Lay the flags. `tones` picks each flag's tone by key; flags that straddle the tile's side edges (key 2)
 * stay "old", so they match the neighbouring variant's half. Pits are 2px clusters, never single specks.
 */
function flags(p: Px, seed: number, tones: Partial<Record<number, keyof typeof TONES>> = {}) {
  p.rect(0, 0, T, T, JOINT);
  for (const f of FLAGS) {
    const tone = TONES[f.key === 2 ? "old" : tones[f.key] ?? "old"];
    for (let j = 0; j < f.h; j++) for (let i = 0; i < f.w; i++) {
      const x = ((f.x + i) % T + T) % T, y = f.y + j;
      let c = tone.face;
      // Top lip catches the sun in broken runs; the bottom lip has settled into shade, the right a little.
      if (j === 0 && hash(i >> 2, f.key, seed + (f.key === 2 ? 0 : 5)) > 0.45) c = tone.lit;
      else if (j === f.h - 1) c = tone.shade;
      else if (i === f.w - 1 && hash(j >> 2, f.key + 4, seed + (f.key === 2 ? 0 : 5)) > 0.5) c = tone.shade;
      p.px(x, y, c);
    }
    // Aggregate pits: a few tiny clusters per flag, kept off the lips.
    const n = f.key === 2 ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const seedK = f.key === 2 ? 900 : seed;
      const px = f.x + 2 + Math.floor(hash(k, f.key, seedK + 1) * (f.w - 5));
      const py = f.y + 2 + Math.floor(hash(k, f.key, seedK + 2) * (f.h - 5));
      const horizontal = hash(k, f.key, seedK + 3) > 0.5;
      p.px(((px % T) + T) % T, py, tone.pit);
      p.px((((px + (horizontal ? 1 : 0)) % T) + T) % T, py + (horizontal ? 0 : 1), tone.pit);
    }
  }
}

export default defineSprites({
  /** Plain flags, one bleached pale. */
  "ground/paving-a": tile((p) => flags(p, 1)),

  /** Plain flags; one has been lifted by a root and sits proud, its far lip catching the light. */
  "ground/paving-b": tile((p) => {
    flags(p, 2);
    // The lifted flag (key 0): a lit top lip, and a dark gap opening along its bottom edge.
    p.hline(0, 0, 15, "stone5").hline(0, 14, 15, "stone3").hline(1, 15, 13, "stone2");
  }),

  /**
   * A cracked flag, grass rooted in the crack, beside one of the old granite setts left in when the
   * concrete went down; a little moss where the joints stay damp.
   */
  "ground/paving-c": tile((p) => {
    flags(p, 3, { 3: "granite" });
    // Granite sett: cool flecks in pairs.
    for (let k = 0; k < 6; k++) {
      const x = 10 + Math.floor(hash(k, 1, 31) * 10), y = 18 + Math.floor(hash(k, 2, 31) * 10);
      p.px(x, y, "steel3").px(x + 1, y, "steel3");
    }
    // The hairline crack wanders across flag 1, a tuft of grass in its widest part.
    stamp(p, 18, 3, [
      "c.........",
      ".cc.......",
      "...c......",
      "...bcc....",
      "......c...",
      "......bc..",
      "........c.",
      ".........c",
    ], L, false);
    stamp(p, 23, 6, [".h.", "gGg"], L, false);
    stamp(p, 15, 13, ["m", "g", "m"], L, false);
  }),

  /**
   * The manhole: a cast-iron cover with a raised grid and a ring of studs, no lettering, set in its own
   * square of newer concrete. Rust bleeds from the lifting slots; the top-left studs are rubbed bright.
   */
  "ground/paving-d": tile((p) => {
    flags(p, 4);
    p.rect(3, 3, 26, 26, "stone2").rect(4, 4, 24, 24, "stone4").hline(4, 4, 24, "stone5").vline(4, 4, 24, "stone5");
    p.hline(5, 27, 23, "stone3").vline(27, 5, 22, "stone3");
    p.ellipse(16, 16, 11, 11, "steel1").ellipse(16, 16, 10, 10, "steel2");
    // Raised grid: bars in steel3 with their lit sides toward the sun.
    for (let y = 6; y < 27; y++) for (let x = 6; x < 27; x++) {
      if (!inBlob(x, y, 16, 16, 8.6, 8.6)) continue;
      if ((x - 7) % 4 === 0 || (y - 7) % 4 === 0) p.px(x, y, (x - 7) % 4 === 0 && (y - 7) % 4 !== 0 ? "steel3" : "steel4");
    }
    // The rim: lit upper left, dark lower right.
    p.each((x, y, c) => {
      if (!inBlob(x, y, 16, 16, 10, 10) || inBlob(x, y, 16, 16, 9, 9)) return undefined;
      return x + y < 30 ? "steel4" : x + y > 34 ? "steel1" : c ?? undefined;
    });
    // Studs round the rim.
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const x = Math.round(16 + Math.cos(a) * 9.5 - 0.5), y = Math.round(16 + Math.sin(a) * 9.5 - 0.5);
      p.px(x, y, x + y < 30 ? "steel5" : "steel3");
    }
    // Lifting slots with rust weeping out of them.
    stamp(p, 10, 15, ["ii", "rr", "r."], L, false);
    stamp(p, 21, 15, ["ii", ".r", ".R"], L, false);
  }),
});
