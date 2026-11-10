/**
 * The dining-room floor. The ids keep their old name, but since the shop became a 1930s Concession
 * bistro the floor is a small cream octagon-and-dot mosaic, laid when the building was new: cream
 * cells a little yellowed, a dark cabochon dot at every corner, thin grout. Quiet, so furniture reads on it.
 * Tiles anchor at their top-left corner. The scene weights a and b heavily, c moderately, d and i rarely.
 * The worn path (e, f) runs from the door to the counter; g is a stain; h the sun-faded patch.
 */
import { defineSprites, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";
import { border, mosaic } from "./_mosaic.ts";
import { hash } from "../../kit/index.ts";

const tile = (draw: (p: Px) => void) => ({ w: 32, h: 32, anchor: [0, 0] as const, layer: "floor" as const, draw });
const M: Legend = { G: "stone3", g: "stone4", k: "cream3", K: "cream2", y: "bamboo4", Y: "bamboo3", z: "bamboo2", w: "white", c: "cream5", L: "gold4", l: "gold3", m: "gold2", d: "gold1" };

/** A soft blob mask centred on (cx, cy). */
const blob = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;

/** The worn lane: glaze worn matt and grey, the ink rosettes rubbed toward grey, strongest down the middle. */
function worn(p: Px, seed: number, cx: number) {
  mosaic(p, seed, (c, x) => {
    const d = Math.abs(x - cx - Math.sin((c.key + seed) * 1.7) * 2);
    if (d < 6) return { cream: "stone5", aged: "stone5", lit: "stone5", ink: "stone3", inkLit: "stone3", grout: "cream3" };
    if (d < 10 && hash(c.key, 5, seed) > 0.45) return { cream: "stone5", aged: "stone5", lit: "cream4", ink: "stone3" };
    return undefined;
  });
}

export default defineSprites({
  /** Quiet mosaic. */
  "tile/floor-wood-a": tile((p) => mosaic(p, 1)),

  /** Quiet mosaic, a different scatter of yellowed cells. */
  "tile/floor-wood-b": tile((p) => mosaic(p, 2)),

  /** A cracked cell, the crack running on through its neighbour where a chair leg came down hard. */
  "tile/floor-wood-c": tile((p) => {
    mosaic(p, 3);
    p.over(() => block(p, 18, 9, [
      "G.......",
      ".G......",
      ".GG.....",
      "...G....",
      "...G.G..",
      "....G.GG",
      "....G...",
    ], M, "crack"));
  }),

  /** A patch relaid after the plumber: whiter cells, the ink rosette matched in a blacker glaze, fresh grout. */
  "tile/floor-wood-d": tile((p) => mosaic(p, 4, (c) => ((c.kind === "dot" ? [6, 10] : [5, 6, 10]).includes(c.key)
    ? { cream: "cream5", aged: "cream5", lit: "cream5", ink: "stone1", inkLit: "stone2", grout: "cream4" } : undefined))),

  /** The path worn grey between the door and the counter. */
  "tile/floor-wood-e": tile((p) => worn(p, 5, 16)),

  /** More of the worn path, drifting a little to one side. */
  "tile/floor-wood-f": tile((p) => worn(p, 6, 14)),

  /** Where the soy-milk churn was set down every morning: a brown ring soaked into the grout. */
  "tile/floor-wood-g": tile((p) => mosaic(p, 7, (c, x, y) => {
    if (blob(x, y, 16, 16, 9, 6) && !blob(x, y, 16, 16, 6.5, 4)) return { cream: "bamboo4", aged: "bamboo4", lit: "bamboo5", grout: "bamboo3" };
    if (blob(x, y, 16, 16, 6.5, 4)) return { cream: "cream3", grout: "bamboo4" };
    return undefined;
  })),

  /** Under the window: the morning sun has faded the ink rosettes and bleached the cream. */
  "tile/floor-wood-h": tile((p) => mosaic(p, 8, (_c, x, y) => (blob(x, y, 16, 16, 13, 10) ? { cream: "cream5", aged: "cream4", ink: "stone3", inkLit: "stone4", grout: "cream3" } : undefined))),

  /** A brass access plate over the old gas cock, screwed down, its edge polished by passing feet. */
  "tile/floor-wood-i": tile((p) => {
    mosaic(p, 9);
    block(p, 9, 11, [
      ".ddddddddddddd.",
      "dlLLLLLLLLLLlmd",
      "dLdlllllllllmmd",
      "dLlmmmmmmmmmlmd",
      "dLlmmmmmmmmmlmd",
      "dLlmmmmmmmmmlmd",
      "dLlllllllllldmd",
      "dlmmmmmmmmmmmmd",
      ".ddddddddddddd.",
    ], M, "plate");
  }),

  // ── border band along the walls ────────────────────────────────────────────
  /** Border along a wall to the north (the back wall). */
  "tile/floor-border-h": tile((p) => border(p, ["n"], 11)),
  /** Border along a wall to the south (the front wall). */
  "tile/floor-border-h-s": tile((p) => border(p, ["s"], 12)),
  /** Border along a wall to the west. */
  "tile/floor-border-v": tile((p) => border(p, ["w"], 13)),
  /** Border along a wall to the east. */
  "tile/floor-border-v-e": tile((p) => border(p, ["e"], 14)),
  "tile/floor-border-corner-tl": tile((p) => border(p, ["n", "w"], 15)),
  "tile/floor-border-corner-tr": tile((p) => border(p, ["n", "e"], 16)),
  "tile/floor-border-corner-bl": tile((p) => border(p, ["s", "w"], 17)),
  "tile/floor-border-corner-br": tile((p) => border(p, ["s", "e"], 18)),
});
