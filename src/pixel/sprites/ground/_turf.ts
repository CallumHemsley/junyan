/**
 * Private helper: the town's turf in three tones, shared by the grass tiles, the tone-band overlays and
 * the grass fray. Not a sprite set.
 *
 * - `mid`: the ordinary verge under the plane trees, a dark, muted green with sage and straw in it.
 * - `shade`: where the canopy is thickest and the ground stays damp, darker and bluer, moss in it.
 * - `worn`: the trampled strip along every pavement and the short cuts, yellowed to straw and scuffed
 *   through to earth.
 *
 * The palette has no true olive, so muted greens are mixed from leaf, jade and bamboo in small clusters.
 * Every mark wraps at the tile edge.
 */
import { hash, Px, type Color, type Legend } from "../../kit/index.ts";
import { T, jitter, stamp, wrap } from "./_helpers.ts";

export type Tone = "mid" | "shade" | "worn";

type Recipe = {
  base: Color;
  /** Broad two-to-three-pixel clusters that break the base. */
  patches: readonly [Color, number][];
  /** Blade clump colours: shade stroke and tip. */
  blade: Color; tip: Color;
  /** Small single marks between clumps. */
  marks: readonly [Color, number][];
};

const RECIPES: Record<Tone, Recipe> = {
  mid: {
    base: "leaf2",
    patches: [["jade3", 0.22], ["leaf1", 0.42], ["bamboo2", 0.5]],
    blade: "leaf1", tip: "leaf3",
    marks: [["leaf1", 0.16], ["jade3", 0.24], ["leaf3", 0.28]],
  },
  shade: {
    base: "leaf1",
    patches: [["jade2", 0.35], ["leaf2", 0.5], ["jade1", 0.6]],
    blade: "jade1", tip: "leaf2",
    marks: [["jade2", 0.18], ["leaf2", 0.26]],
  },
  worn: {
    base: "leaf2",
    patches: [["bamboo1", 0.4], ["leaf1", 0.6], ["jade3", 0.7]],
    blade: "bamboo1", tip: "bamboo2",
    marks: [["bamboo1", 0.14], ["jade3", 0.2]],
  },
};

const PATCH_SHAPES: readonly (readonly string[])[] = [["xx.", ".xx"], [".x", "xx", "x."], ["x.x", "xx."], ["xx", "x."]];
const CLUMPS: readonly (readonly string[])[] = [
  [".t.", "b.b"], ["t..", "bt.", ".b."], [".t.t", "b.bb"], ["..t", ".b.", "b.."], ["b.b", ".b."], ["t.", "b."],
];

/** Paint a whole tile of one turf tone. */
export function turf(p: Px, tone: Tone, seed: number, density = 1): void {
  const r = RECIPES[tone];
  p.rect(0, 0, T, T, r.base);
  for (const [x, y, v] of jitter(8, seed + 7, 1)) {
    const hit = r.patches.find(([, upTo]) => v < upTo);
    if (!hit) continue;
    stamp(p, x, y, PATCH_SHAPES[Math.floor(hash(x, y, seed + 5) * PATCH_SHAPES.length)], { x: hit[0] });
  }
  const legend: Legend = { b: r.blade, t: r.tip };
  for (const [x, y, v] of jitter(8, seed, 1)) {
    if (v > 0.8 * density) continue;
    stamp(p, x, y, CLUMPS[Math.floor(hash(x, y, seed + 3) * CLUMPS.length)], legend);
  }
  for (const [x, y, v] of jitter(4, seed + 11, 0)) {
    const hit = r.marks.find(([, upTo]) => v < upTo * density);
    if (hit) wrap(p, x, y, hit[0]);
  }
  if (tone === "worn") {
    // Bare earth scuffed through in a few small patches, shaded on their upper lip like a dip.
    for (const [x, y, v] of jitter(16, seed + 13, 3)) {
      if (v > 0.35) continue;
      stamp(p, x, y, ["kkk.", "eeef", ".eef"], { k: "oak1", e: "oak2", f: "oak3" });
    }
  }
}

/**
 * Corner masks for tone bands. `bits` is nw, ne, sw, se ("1" = that corner is in the band). The band's
 * edge runs through the tile where the bilinear blend of the corners crosses one half, wobbled in the
 * middle of the tile (never at its edges, so neighbouring tiles meet) and fringed with tufts.
 */
export function bandMask(bits: string, seed: number): (x: number, y: number) => boolean {
  const [nw, ne, sw, se] = [...bits].map(Number);
  return (x, y) => {
    const u = (x + 0.5) / T, v = (y + 0.5) / T;
    const f = nw * (1 - u) * (1 - v) + ne * u * (1 - v) + sw * (1 - u) * v + se * u * v;
    const fade = Math.min(u, 1 - u, v, 1 - v) * 4;
    const wobble = (Math.sin(x * 0.55 + seed) * 0.6 + Math.sin(y * 0.7 + seed * 2) * 0.4 + Math.sin((x + y) * 0.31 + seed * 3) * 0.5) * 0.14 * Math.min(1, fade);
    const tuft = (hash(x >> 1, y >> 1, seed + 17) - 0.5) * 0.16;
    return f + wobble + tuft > 0.5;
  };
}

/** Paint one tone only where `inside` holds. */
export function turfWhere(p: Px, tone: Tone, seed: number, inside: (x: number, y: number) => boolean): void {
  const full = new Px(T, T);
  turf(full, tone, seed);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (inside(x, y)) p.px(x, y, full.get(x, y));
}

/** The worn tone's colours, for the grass fraying onto hard ground. */
export const FRAY = { base: "leaf2", edge: "leaf1", soil: "oak1", straw: "bamboo1", tip: "bamboo2" } as const satisfies Record<string, Color>;
