/**
 * Small things that live on a dining table. Each anchor is the pixel where the piece stands on the
 * table top (bottom centre, on the outline row), so place it at a point inside a table's top.
 * They carry by silhouette and contrast at 1×.
 *
 * Depth: a table-top piece must be drawn after the table it stands on, whatever its anchor y.
 * The scene should sort it with its table (see the 0153 ticket notes).
 */
import { defineSprites, Px, type Legend } from "../../kit/index.ts";
import { grid } from "./_helpers.ts";

/** A steel tin of bamboo chopsticks, the tips fanned unevenly. 6×10. */
function tin(): Px {
  const p = new Px(6, 10);
  grid(p, 0, 1, 6, [
    "..B.B.",
    ".Bb.b.",
    ".bbcb.",
    ".6554.",
    ".5443.",
    ".3332.",
    ".5443.",
    ".4332.",
  ], { B: "bamboo5", b: "bamboo4", c: "bamboo3", "6": "steel6", "5": "steel5", "4": "steel4", "3": "steel3", "2": "steel2" });
  return p.outline("steel1");
}

/** Black vinegar in a glass bottle with a blank paper label and a white spout cap. 5×10. */
function bottle(): Px {
  const p = new Px(5, 10);
  grid(p, 0, 1, 5, [
    "..w..",
    ".wwc.",
    "..d..",
    ".gdk.",
    ".rdk.",
    ".LLl.",
    ".LLl.",
    ".rdk.",
  ], { w: "cream5", c: "cream3", d: "rose1", k: "ink2", g: "steel5", r: "rose2", L: "cream4", l: "cream2" });
  return p.outline("ink");
}

/** A squat glass jar of chili oil, the oil layer on top, flakes settled below, a spoon in it. 7×8. */
function jar(): Px {
  const p = new Px(7, 8);
  grid(p, 0, 1, 7, [
    "....s..",
    ".6ooS6.",
    ".W4443.",
    ".54433.",
    ".43332.",
    "..221..",
  ], { s: "steel5", S: "steel4", "6": "blue6", o: "orange2", W: "white", "5": "red5", "4": "red4", "3": "red3", "2": "red2", "1": "red1" });
  return p.outline("red1");
}

const tinPx = tin(), bottlePx = bottle(), jarPx = jar();
const BLUE: Legend = { w: "white", "6": "blue6", "5": "blue5", "4": "blue4", "3": "blue3", "2": "blue2" };

export default defineSprites({
  /** Chopstick tin. Story: the chopsticks stand at odd heights, as customers dropped them back. */
  "furn/chopstick-tin": {
    w: 6, h: 10, anchor: [3, 9], shadow: { rx: 3, ry: 1 },
    draw: (p) => { p.blit(tinPx, 0, 0); },
  },

  /** Black vinegar bottle. The label is blank. */
  "furn/vinegar-bottle": {
    w: 5, h: 10, anchor: [2, 9], shadow: { rx: 2, ry: 1 },
    draw: (p) => { p.blit(bottlePx, 0, 0); },
  },

  /** Chili oil jar with its spoon: one of the room's few reds. */
  "furn/chili-jar": {
    w: 7, h: 8, anchor: [3, 7], shadow: { rx: 3, ry: 1 },
    draw: (p) => { p.blit(jarPx, 0, 0); },
  },

  /** Tin, bottle and jar as one tidy cluster, the tin at the back. */
  "furn/condiment-set": {
    w: 14, h: 11, anchor: [7, 10], shadow: { rx: 6, ry: 2, dy: -1 },
    draw: (p) => {
      p.blit(tinPx, 0, 0);
      p.blit(bottlePx, 9, 1);
      p.blit(jarPx, 4, 3);
    },
  },

  /** Paper napkin box, a jade band round it, a tissue pulled up ready. No print. */
  "furn/napkin-box": {
    w: 10, h: 9, anchor: [5, 8], shadow: { rx: 4, ry: 1 },
    draw: (p) => {
      grid(p, 0, 1, 10, [
        "....w.....",
        "...wwf....",
        ".5wwwff54.",
        ".55555544.",
        ".33333332.",
        ".jjjjjjjk.",
        ".33333332.",
      ], { w: "white", f: "cream4", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2", j: "jade4", k: "jade3" });
      p.outline("cream1");
    },
  },

  /** Blue-and-white teapot, spout to the left. Story: a chip on the spout. */
  "furn/teapot": {
    w: 12, h: 10, anchor: [6, 9], shadow: { rx: 4, ry: 1 },
    draw: (p) => {
      grid(p, 0, 1, 12, [
        ".....32.....",
        "....ww65....",
        "6..3222223..",
        "w6.wwwww652.",
        ".w6w2w2w6.2.",
        "..www6w665.2",
        "..ww6w6652..",
        "...665552...",
      ], BLUE);
      p.outline("blue1");
    },
  },

  /** A small handleless teacup with tea in it, blue band at the rim. */
  "furn/teacup": {
    w: 6, h: 6, anchor: [3, 5], shadow: { rx: 2, ry: 1 },
    draw: (p) => {
      grid(p, 0, 1, 6, [
        ".6tt6.",
        ".2222.",
        ".ww65.",
        "..65..",
      ], { ...BLUE, t: "bamboo2" });
      p.outline("blue1");
    },
  },
});
