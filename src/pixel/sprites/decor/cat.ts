/**
 * The shop cat: a ginger tabby with a white bib and socks. Object layer, anchored at the
 * middle of where it touches the floor.
 */
import { defineSprites } from "../../kit/index.ts";
import { art } from "./_helpers.ts";

const FUR = {
  o: "brown1", G: "gold4", A: "orange3", a: "orange2", b: "orange1",
  w: "cream5", W: "cream3", e: "brown1", n: "pink2", p: "pink3", k: "ink", g: "jade4",
} as const;

/** Curled asleep, head on its paws, tail wrapped round the front. */
const SLEEP = [
  "............o.....o.",
  "....ooooooooAo...oao",
  "..oGGGGAAAAoAaoooaao",
  ".oGGGAAAAAaoAAbAbAao",
  "oGGAbAAAAaaoAAAAAaao",
  "oGAAAbAAAaboAeeAeeao",
  "oAAAAAbAAaboawwnwwbo",
  "oAAAAAAbaabaowwwwwo.",
  "obaaaaaaaabboWwwWo..",
  ".oTTtTTTtTTTtTTo....",
  "..obbbbbbbbbbbbo....",
  "...oooooooooooo.....",
];
/** The breath in: the back rises a pixel. */
const SLEEP_IN = [
  "......ooooo.o.....o.",
  "....ooGGGGGoAo...oao",
];

export default defineSprites({
  /**
   * Asleep in the sun patch: a slow two-frame breath (the back rises one pixel), 1 fps.
   */
  "decor/cat-sleep": {
    w: 20, h: 12, anchor: [10, 11], foot: [-8, -4, 16, 4], shadow: { rx: 9, ry: 2, dy: -1 },
    frames: 2, fps: 1,
    draw: (p, frame) => {
      art(p, 0, 0, SLEEP, { ...FUR, T: "orange3", t: "orange1" });
      if (frame === 1) art(p, 0, 0, SLEEP_IN, { ...FUR });
    },
  },

  /**
   * Sitting up, watching. Four frames at 4 fps: the tail tip flicks across and back, and the
   * left ear twitches on the third frame.
   */
  "decor/cat-sit": {
    w: 14, h: 18, anchor: [6, 17], foot: [-5, -3, 10, 3], shadow: { rx: 6, ry: 2, dy: -1 },
    frames: 4, fps: 4,
    draw: (p, frame) => {
      art(p, 0, 0, [
        "..o......o....",
        ".oAo....oao...",
        ".oApooooopao..",
        ".oAAbAbAbaao..",
        ".oAAAAAAAaao..",
        ".oAgkAAgkaao..",
        ".oAkkAAkkaao..",
        ".oAwwnnwwaao..",
        "..owwwwwwoo...",
        "..oAwwwwao....",
        ".oAAwwwwaao...",
        ".oAAwwwwaabo..",
        "oAAAwwwwaabo..",
        "oAAAwwwwaabo..",
        "oAAowwowaabo..",
        "oAAwwowwaao...",
        ".ooooooooo....",
        "..............",
      ], FUR);
      // Tail: round the right side and forward; the tip flicks.
      const tips = [
        ["...o", "..oA", "..oa", "..ob"],
        ["....", "..oo", ".oAA", "..ob"],
        ["..o.", "..oA", "..oa", "..ob"],
        ["....", "...o", "..oA", "..ob"],
      ];
      art(p, 10, 9, tips[frame], FUR);
      art(p, 9, 13, [".ob.", "obbo", "abo.", "oo.."], FUR);
      if (frame === 2) art(p, 1, 0, ["...", "oo.", "oAo"], FUR);
    },
  },
});
