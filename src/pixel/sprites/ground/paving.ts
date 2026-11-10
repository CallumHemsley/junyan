/**
 * Lane paving: old concrete flags, about half a metre square, laid in the 1950s over the original
 * granite and patched ever since, so no two stretches match. Running bond on a fixed lattice: the top
 * row's joints at x 15 and 31, the bottom row's at x 7 and 23, bed joints on rows 15 and 31. Variants
 * break the lattice inside the tile (a long flag where two were cast as one, half flags, a split flag)
 * but never at its edges, so any mix tiles. The flag straddling the side edges always looks the same.
 *
 * The plain variants are all cement grey; the others carry a warmer, paler or darker flag here and there,
 * so the tone varies flag by flag along a street without repeating. Each flag has its
 * top lip catching the sun in broken runs, its bottom lip settled into shade, and the joints gritty,
 * darker where dirt has packed in.
 *
 * The scene weights a heavily, b and e moderately, c, f and g rarely, puts h (weeds) by the verges
 * where nobody walks, and d (the manhole) rarely and never by an edge.
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { T, inBlob, mod, stamp, tile } from "./_helpers.ts";

const L: Legend = {
  a: "stone1", b: "stone2", c: "stone3", d: "stone4", e: "stone5",
  g: "leaf2", G: "leaf3", h: "jade3", m: "jade2", M: "leaf1",
  i: "steel1", I: "steel2", j: "steel3",
  r: "orange1", R: "gold1", p: "plum1", t: "bamboo2", T: "bamboo3",
};

type Tone = { face: Color; lit: Color; shade: Color };
const TONES: Record<"grey" | "warm" | "pale" | "dark" | "granite", Tone> = {
  grey: { face: "stone4", lit: "stone5", shade: "stone3" },
  /** Cast from a sandier mix. */
  warm: { face: "cream2", lit: "cream3", shade: "cream1" },
  /** Sun-bleached, the cement skin long gone. */
  pale: { face: "stone5", lit: "cream5", shade: "stone4" },
  /** Soaked darker by a dripping AC unit or the drain's overflow. */
  dark: { face: "stone3", lit: "stone4", shade: "stone2" },
  /** One of the original granite setts left in when the concrete went down. */
  granite: { face: "stone4", lit: "stone5", shade: "stone3" },
};

const toneFor = (key: string, seed: number): Tone => {
  const r = hash(key.charCodeAt(0) * 7 + key.length, key.charCodeAt(key.length - 1), seed);
  return r < 0.84 ? TONES.grey : r < 0.94 ? TONES.warm : r < 0.97 ? TONES.pale : TONES.dark;
};

type Flag = { x: number; y: number; w: number; h: number; key: string; tone?: Tone };

/** The usual four flags. Key "s" straddles the tile's side edges and wraps. */
const STANDARD: Flag[] = [
  { x: 0, y: 0, w: 15, h: 15, key: "nw" }, { x: 16, y: 0, w: 15, h: 15, key: "ne" },
  { x: -8, y: 16, w: 15, h: 15, key: "s" }, { x: 8, y: 16, w: 15, h: 15, key: "sm" },
];

/** Draw one flag, wrapping in x. The shared flag always uses a fixed seed and the grey tone. */
function flag(p: Px, f: Flag, seed: number) {
  const shared = f.key === "s";
  const s = shared ? 900 : seed;
  const tone = shared ? TONES.grey : f.tone ?? toneFor(f.key, seed);
  for (let j = 0; j < f.h; j++) for (let i = 0; i < f.w; i++) {
    let c = tone.face;
    if (j === 0 && hash(i >> 2, f.key.length, s + 5) > 0.45) c = tone.lit;
    else if (j === f.h - 1) c = tone.shade;
    else if (i === f.w - 1 && hash(j >> 2, f.key.length + 4, s + 5) > 0.5) c = tone.shade;
    p.px(mod(f.x + i), f.y + j, c);
  }
  // Aggregate pits: two-pixel clusters kept off the lips.
  const n = Math.max(1, Math.round((f.w * f.h) / 75));
  for (let k = 0; k < n; k++) {
    const px = f.x + 2 + Math.floor(hash(k, f.key.length, s + 1) * Math.max(1, f.w - 5));
    const py = f.y + 2 + Math.floor(hash(k, f.key.length, s + 2) * Math.max(1, f.h - 5));
    const across = hash(k, f.key.length, s + 3) > 0.5;
    p.px(mod(px), py, tone.shade).px(mod(px + (across ? 1 : 0)), py + (across ? 0 : 1), tone.shade);
  }
}

/**
 * Lay the joints (gritty, with packed dirt in runs) and then the flags over them. `plain` keeps every
 * flag the usual grey: the dominant variants must not carry a tone pattern that repeats across a street.
 */
function flags(p: Px, seed: number, layout: Flag[] = STANDARD, plain = false) {
  p.rect(0, 0, T, T, "stone3");
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++)
    if (hash(x >> 2, y >> 2, seed + 70) < 0.12) p.px(x, y, "stone2");
  for (const f of layout) flag(p, plain && !f.tone ? { ...f, tone: TONES.grey } : f, seed);
}

export default defineSprites({
  /** Four plain grey flags. */
  "ground/paving-a": tile((p) => flags(p, 1, STANDARD, true)),

  /** The top two flags cast as one long slab, a hairline shrinkage crack across its middle. */
  "ground/paving-b": tile((p) => {
    flags(p, 2, [{ x: 0, y: 0, w: 31, h: 15, key: "long" }, STANDARD[2], { ...STANDARD[3], tone: TONES.warm }], true);
    p.line(15, 2, 16, 12, "stone3");
  }),

  /**
   * A cracked flag, grass rooted in the crack, beside one of the old granite setts left in when the
   * concrete went down; a little moss where the joints stay damp.
   */
  "ground/paving-c": tile((p) => {
    flags(p, 3, [STANDARD[0], STANDARD[1], STANDARD[2], { ...STANDARD[3], tone: TONES.granite }]);
    for (let k = 0; k < 6; k++) {
      const x = 10 + Math.floor(hash(k, 1, 31) * 10), y = 18 + Math.floor(hash(k, 2, 31) * 10);
      p.px(x, y, "steel3").px(x + 1, y, "steel3");
    }
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
    stamp(p, 23, 6, [".G.", "gGg"], L, false);
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
    for (let y = 6; y < 27; y++) for (let x = 6; x < 27; x++) {
      if (!inBlob(x, y, 16, 16, 8.6, 8.6)) continue;
      if ((x - 7) % 4 === 0 || (y - 7) % 4 === 0) p.px(x, y, (x - 7) % 4 === 0 && (y - 7) % 4 !== 0 ? "steel3" : "steel4");
    }
    p.each((x, y, c) => {
      if (!inBlob(x, y, 16, 16, 10, 10) || inBlob(x, y, 16, 16, 9, 9)) return undefined;
      return x + y < 30 ? "steel4" : x + y > 34 ? "steel1" : c ?? undefined;
    });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const x = Math.round(16 + Math.cos(a) * 9.5 - 0.5), y = Math.round(16 + Math.sin(a) * 9.5 - 0.5);
      p.px(x, y, x + y < 30 ? "steel5" : "steel3");
    }
    stamp(p, 10, 15, ["ii", "rr", "r."], L, false);
    stamp(p, 21, 15, ["ii", ".r", ".R"], L, false);
  }),

  /** Half flags: the bottom flag replaced by two narrow offcuts, the top right one split along its length. */
  "ground/paving-e": tile((p) => flags(p, 5, [
    STANDARD[0],
    { x: 16, y: 0, w: 15, h: 7, key: "ne-top" }, { x: 16, y: 8, w: 15, h: 7, key: "ne-low" },
    STANDARD[2],
    { x: 8, y: 16, w: 7, h: 15, key: "half-l" }, { x: 16, y: 16, w: 7, h: 15, key: "half-r" },
  ])),

  /**
   * A sunk flag and a lifted one: the left flag has dropped where the drain under it washed out, its
   * neighbours' edges shading its top and left; the bottom one has been heaved up by a plane-tree root,
   * its top lip bright and a dark gap opening beneath it.
   */
  "ground/paving-f": tile((p) => {
    flags(p, 6, [{ ...STANDARD[0], tone: TONES.dark }, STANDARD[1], STANDARD[2], STANDARD[3]]);
    p.hline(0, 0, 15, "stone2").vline(0, 0, 15, "stone2").hline(1, 1, 13, "stone3").vline(1, 1, 13, "stone3");
    p.hline(0, 14, 15, "stone4");
    p.hline(8, 16, 15, "stone5").vline(8, 16, 14, "stone5").hline(8, 30, 15, "stone2").hline(8, 31, 15, "stone1");
  }),

  /**
   * Outside a stall: a dark oil stain where the fryer's drum stood, a faint brown tea ring where the
   * thermos is set down every morning.
   */
  "ground/paving-g": tile((p) => {
    flags(p, 7);
    p.each((x, y, c) => (c && inBlob(x, y, 9, 8, 6, 4) && !inBlob(x, y, 9, 8, 2, 1.5) && hash(x >> 1, y, 71) < 0.8
      ? (c === "stone4" || c === "cream2" || c === "cream3" ? "stone3" : "stone2") : undefined));
    stamp(p, 5, 6, ["..pp", ".p.."], L, false);
    p.each((x, y, c) => (c && inBlob(x, y, 15, 23, 4.5, 3.2) && !inBlob(x, y, 15, 23, 3.3, 2.1) && (x < 17 || y > 23) ? "cream1" : undefined));
  }),

  /** By the verge, where nobody walks: moss creeping along the joints and weeds where they cross. */
  "ground/paving-h": tile((p) => {
    flags(p, 8);
    const joint = (x: number, y: number) => x === 15 || x === 31 || y === 15 || y === 31 || (y > 15 && (x === 7 || x === 23));
    p.each((x, y, c) => ((c === "stone3" || c === "stone2") && joint(x, y) && hash(x >> 1, y >> 1, 81) < 0.5 ? "jade2" : undefined));
    for (const [x, y] of [[15, 15], [7, 30], [30, 8]] as const) stamp(p, x - 1, y - 1, [".G.", "gMg"], L, false);
  }),
});
