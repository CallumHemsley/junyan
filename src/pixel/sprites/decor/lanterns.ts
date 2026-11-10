/**
 * Red paper lanterns. They hang above everyone (layer `over`); the anchor is the hook at the top
 * of the cord, so place them at the ceiling or lintel point they hang from.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art } from "./_helpers.ts";

const PAPER: Color[] = ["red1", "red2", "red3", "red4", "red5", "gold4", "gold5"];

/**
 * A pleated paper body lit from the upper left. Each pleat between two bamboo ribs bulges, so it
 * catches its own light on its left and falls into shade against the next rib; the whole body
 * runs from deep red in the lower right up through orange into gold on the lit shoulder.
 */
function paper(p: Px, cx: number, cy: number, rx: number, ry: number, ribs: number) {
  const ribX = (k: number, v: number) => cx + rx * Math.sqrt(Math.max(0, 1 - v * v)) * Math.sin(-Math.PI / 2 + (k * Math.PI) / ribs);
  for (let y = Math.floor(cy - ry); y < Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x < Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v;
    if (d > 1) continue;
    const z = Math.sqrt(1 - d);
    // Where across its pleat this pixel sits, 0 at the left rib, 1 at the right.
    const across = Math.asin(Math.max(-1, Math.min(1, u / Math.sqrt(Math.max(0.0001, 1 - v * v)))));
    const pleat = ((across / Math.PI + 0.5) * ribs) % 1;
    const light = -0.5 * u - 0.55 * v + 0.55 * z + (0.5 - pleat) * 0.16;
    const level = light > 1.0 ? 6 : light > 0.88 ? 5 : light > 0.72 ? 4 : light > 0.42 ? 3 : light > 0.08 ? 2 : 1;
    p.px(x, y, PAPER[level]);
  }
  // Ribs: thin dark meridians, a step or two darker than the paper they cross.
  const darker: Partial<Record<Color, Color>> = { gold5: "gold4", gold4: "red5", red5: "red4", red4: "red3", red3: "red2", red2: "red1" };
  for (let k = 1; k < ribs; k++) for (let y = Math.floor(cy - ry) + 1; y < Math.ceil(cy + ry) - 1; y++) {
    const v = (y + 0.5 - cy) / ry, x = Math.floor(ribX(k, v));
    const here = p.get(x, y);
    if (here && darker[here]) p.px(x, y, darker[darker[here]!] ?? darker[here]!);
  }
  p.outline("red1");
}

/** A brass cap, `w` wide: a lit lip over a ridged band. */
function cap(p: Px, x: number, y: number, w: number, rows: number) {
  const tones: Color[][] = [["gold5", "gold4", "gold3"], ["gold4", "gold3", "gold2"], ["gold3", "gold2", "gold1"], ["gold2", "gold1", "wood1"]];
  for (let j = 0; j < rows; j++) {
    const [l, m, d] = tones[Math.min(j, 3)];
    p.hline(x, y + j, w, m).px(x, y + j, l).px(x + 1, y + j, l).px(x + w - 1, y + j, d).px(x + w - 2, y + j, d);
  }
  // Ridges stamped into the band.
  for (let i = 3; i < w - 3; i += 3) p.px(x + i, y + rows - 2, "gold2");
}

const FRINGE_LEGEND = { G: "gold4", g: "gold3", q: "gold2" } as const;

export default defineSprites({
  /**
   * The big lantern by the door. It went up for the opening and never came down: the sun has
   * faded its right side, and a tear low on the front is mended with a square of new paper.
   * Four frames at 3 fps: the body swings a pixel each way, the tassel follows a frame behind.
   */
  "decor/lantern-red": {
    w: 32, h: 58, anchor: [16, 0], layer: "over", frames: 4, fps: 3,
    draw: (p, frame) => {
      const body = [0, 1, 0, -1][frame], tassel = [-1, 0, 1, 0][frame];
      const cx = 16 + body;
      paper(p, cx, 22, 14, 13, 8);
      // Sun-faded right shoulder: the deep reds there have bleached a step.
      p.over(() => p.swap({ red1: "red2", red2: "red3" }, [cx + 6, 10, 8, 12]));
      // The mended tear: a square of brighter new paper with a pasted edge.
      art(p, cx + 4, 27, [".eee.", "e443e", "e433e", ".eee."], { e: "red2", 3: "red3", 4: "red4" });
      // Caps.
      cap(p, cx - 6, 7, 12, 4);
      p.hline(cx - 5, 11, 10, "red1");
      cap(p, cx - 5, 34, 10, 3);
      // The cord and its hook.
      art(p, 15, 0, [".ss.", "s..s", ".s.."], { s: "steel3" });
      for (let y = 3; y < 7; y++) p.px(16 + (y > 4 ? body : 0), y, y % 2 ? "red2" : "red3");
      // Tassel: a knot, a bead, then the fringe, trailing the body.
      const tx = 16 + Math.round((body + tassel) / 2) - 4, fx = 16 + tassel - 5;
      art(p, tx, 37, [
        "...kk...",
        "..kKKk..",
        ".kK..Kk.",
        "kK.rr.Kk",
        ".kKrrKk.",
        "..kKKk..",
        "...kk...",
      ], { k: "gold2", K: "gold4", r: "red3" });
      art(p, fx + 3, 44, ["rR..", "Rrr."], { r: "red3", R: "red4" });
      art(p, fx, 46, [
        "..gGGgGq..",
        ".gGgGGgGq.",
        ".GgGgGgGq.",
        ".GgGgGgGq.",
        ".GgGgGgqq.",
        ".GgGgGgGq.",
        "GgGgGgGgGq",
        "GgGg.gGgGq",
        "Gg.g.gG.Gq",
        "G..g.g..q.",
        "...g..G...",
      ], FRINGE_LEGEND);
    },
  },

  /**
   * A small lantern bought as a pair; its twin was crushed in a typhoon and only this one is left.
   * Its tassel is shorter, as if a strand or two got pulled off. Four frames at 3 fps: only the
   * tassel stirs.
   */
  "decor/lantern-small": {
    w: 20, h: 34, anchor: [10, 0], layer: "over", frames: 4, fps: 3,
    draw: (p, frame) => {
      const tassel = [0, 1, 0, -1][frame];
      paper(p, 10, 15, 9, 8, 6);
      cap(p, 6, 5, 8, 3);
      cap(p, 7, 22, 6, 2);
      art(p, 9, 0, [".s", "s.", ".s"], { s: "steel3" });
      p.px(10, 3, "red2").px(10, 4, "red3");
      art(p, 8 + (tassel > 0 ? 1 : 0), 24, [".kk.", "kKrk", ".kk."], { k: "gold2", K: "gold4", r: "red3" });
      art(p, 7 + tassel, 27, [".gGq..", "GgGgq.", "GgGgq.", "GgGgq.", "G.g.q.", "..g..."], FRINGE_LEGEND);
    },
  },
});
