/**
 * The service counter: tea wood, a worn top, panelled front, kick-plate.
 *
 * Horizontal modules are 16×26: one outline row, 9 rows of top, a 3-row nosing (lit edge, slab
 * front, shadow under the overhang), a 9-row panelled face, a 2-row kick-plate and an outline row.
 * They tile left to right: `counter-left`, any mix of `counter-mid-a`/`-b`, `counter-right`.
 *
 * The leg of the L runs north–south, seen from above: `counter-v-top` (back end, against the wall),
 * any number of `counter-v-mid`/`-mid-b`, and either `counter-v-bottom` (a free end) or
 * `counter-corner` (joins a horizontal run going east). Grid: for a counter on tile row r with
 * anchor y = 16r + 15, every piece of the leg is placed at its own tile's bottom row, and the
 * top surfaces butt seamlessly (each leg tile is drawn lifted 10px, level with the counter top).
 */
import { defineSprites, type Px } from "../../kit/index.ts";

type End = "left" | "right" | "both" | "none";

/** Horizontal top surface, boards running east–west, rows y..y+8. */
function topBoards(p: Px, y: number, joints: readonly [number, number]) {
  p.rect(0, y, 16, 9, "wood4");
  // Broken highlight along the back edge, a soft seam between two boards.
  p.hline(0, y, 16, "wood5").px(3, y, "wood4").px(10, y, "wood4").px(11, y, "wood4");
  p.hline(0, y + 4, 16, "wood3");
  p.px(6, y + 5, "wood5").px(7, y + 5, "wood5").px(13, y + 5, "wood5");
  if (joints[0] >= 0) p.vline(joints[0], y + 1, 3, "wood3").px(joints[0] + 1, y + 1, "wood5");
  if (joints[1] >= 0) p.vline(joints[1], y + 5, 4, "wood3").px(joints[1] + 1, y + 5, "wood5");
}

/** Short grain streaks, hand placed per variant: [x, y, length, light]. */
function grain(p: Px, streaks: readonly (readonly [number, number, number, 0 | 1])[]) {
  p.over(() => { for (const [x, y, n, light] of streaks) p.hline(x, y, n, light ? "wood5" : "wood3"); });
}

/** Nosing, cabinet face and kick-plate below the top, rows 10..25. */
function face(p: Px, end: End, seam: boolean, capped = true, panel: "door" | "drawer" = "door", grainX = 6) {
  // Nosing: lit chamfer, slab front, shadow under the overhang.
  p.hline(0, 10, 16, "wood5").hline(0, 11, 16, "wood3").hline(0, 12, 16, "wood2");
  p.px(2, 10, "wood6").px(3, 10, "wood6").px(9, 10, "wood6");
  // Frame and recessed panels: grooves dark on the top/left, lit on the bottom/right.
  p.rect(0, 13, 16, 10, "wood3");
  if (panel === "drawer") {
    recess(p, 2, 14, 12, 3);
    recess(p, 2, 18, 12, 4);
    // A worn brass pull.
    p.px(7, 15, "gold4").px(8, 15, "gold2");
    p.vline(10, 19, 2, "wood2").px(5, 20, "wood4");
  } else {
    recess(p, 2, 14, 12, 8);
    p.vline(grainX, 16, 4, "wood2").px(grainX + 1, 16, "wood4").px(grainX + 1, 19, "wood2").vline(grainX + 4, 17, 2, "wood4");
  }
  if (seam) p.vline(0, 13, 10, "wood2");
  // Kick-plate, recessed into shadow.
  p.hline(0, 23, 16, "wood1").hline(0, 24, 16, "wood2");
  p.hline(0, 25, 16, "wood1");
  if (end === "left" || end === "both") {
    p.vline(0, 0, 26, "wood1").vline(1, 1, 9, "wood5").px(1, 10, "wood6").vline(1, 13, 10, "wood4").px(1, 11, "wood4");
    if (capped) p.px(0, 0, null);
    p.px(0, 25, null).px(1, 24, "wood2");
  }
  if (end === "right" || end === "both") {
    p.vline(15, 0, 26, "wood1").vline(14, 1, 9, "wood3").px(14, 10, "wood4").vline(14, 13, 10, "wood2").px(14, 12, "wood1");
    if (capped) p.px(15, 0, null);
    p.px(15, 25, null);
  }
}

function recess(p: Px, x: number, y: number, w: number, h: number) {
  p.hline(x, y, w, "wood2").vline(x, y, h, "wood2");
  p.hline(x + 1, y + h - 1, w - 1, "wood4").vline(x + w - 1, y + 1, h - 1, "wood4");
  p.px(x + w - 1, y, "wood3").px(x, y + h - 1, "wood3");
}

/** Light scuffs where shoes meet the kick-plate. */
function scuffs(p: Px, xs: readonly number[]) {
  for (const x of xs) p.hline(x, 24, 2, "wood3").px(x + 1, 23, "wood2");
}

function horizontal(p: Px, end: End, joints: readonly [number, number], panel: "door" | "drawer" = "door", grainX = 6) {
  p.hline(0, 0, 16, "wood1");
  topBoards(p, 1, joints);
  face(p, end, end !== "left" && end !== "both", true, panel, grainX);
}

/** Leg of the L, seen from above: boards running north–south. Rows y..y+h-1, outlined left and right. */
function legBoards(p: Px, y: number, h: number, seamX: number) {
  p.rect(1, y, 14, h, "wood4");
  p.vline(seamX, y, h, "wood3");
  p.vline(1, y, h, "wood5").vline(14, y, h, "wood3").vline(13, y, h, "wood4");
  p.vline(0, y, h, "wood1").vline(15, y, h, "wood1");
}
function vgrain(p: Px, streaks: readonly (readonly [number, number, number, 0 | 1])[]) {
  p.over(() => { for (const [x, y, n, light] of streaks) p.vline(x, y, n, light ? "wood5" : "wood3"); });
}

const SHADOW = { rx: 8, ry: 2 } as const;
const FOOT = [-8, -15, 16, 16] as const;

export default defineSprites({
  /** West end of a horizontal run. A chipped front corner, a palm-worn patch. */
  "kitchen/counter-left": {
    w: 16, h: 26, anchor: [8, 25], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "left", [-1, 9]);
      grain(p, [[4, 2, 4, 0], [9, 3, 3, 1], [3, 7, 3, 1], [11, 8, 3, 0]]);
      // Worn patch where hands rest at the end.
      p.hline(3, 8, 4, "wood5").hline(4, 9, 3, "wood5").px(5, 7, "wood5");
      // Chipped corner of the nosing.
      p.px(1, 10, "wood3").px(2, 10, "wood4").px(1, 11, "wood2");
      p.rows(0, 9, ["o", "o", "o"], { o: "wood1" });
      scuffs(p, [5]);
    },
  },
  /** Middle module with a tea ring on the top. */
  "kitchen/counter-mid-a": {
    w: 16, h: 26, anchor: [8, 25], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", [6, -1], "door", 4);
      grain(p, [[1, 2, 3, 1], [9, 3, 4, 0], [2, 7, 4, 0], [10, 6, 3, 1], [7, 8, 3, 1]]);
      // A tea ring: a cup stood here every morning for years.
      p.rows(9, 6, [".ddd.", "d...d", ".dDd."], { d: "wood3", D: "wood2" });
    },
  },
  /** Middle module with knife marks and a scuffed kick-plate. */
  "kitchen/counter-mid-b": {
    w: 16, h: 26, anchor: [8, 25], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", [-1, 4], "drawer");
      grain(p, [[8, 2, 4, 1], [1, 3, 3, 0], [9, 7, 4, 0], [12, 8, 3, 1]]);
      // Knife marks: short parallel nicks, the cut catching light on its lower lip.
      p.rows(9, 1, ["...d.", "..dl.", ".dl..", "dl.d.", "l.dl.", "..l.."], { d: "wood3", l: "wood5" });
      p.hline(6, 8, 3, "wood5").px(7, 9, "wood5");
      scuffs(p, [3, 10]);
    },
  },
  /** East end of a horizontal run. */
  "kitchen/counter-right": {
    w: 16, h: 26, anchor: [8, 25], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "right", [8, -1], "door", 8);
      grain(p, [[2, 2, 4, 1], [10, 3, 3, 0], [2, 7, 3, 0], [8, 8, 4, 1]]);
      // A small dark nail head in the top board and a ring half hidden by the edge.
      p.px(4, 3, "wood2").px(4, 2, "wood5");
      p.rows(9, 6, [".dd.", "d..d", ".dd."], { d: "wood3" });
      scuffs(p, [8]);
    },
  },

  /** North end of the leg, against the back wall. 16×17; anchor 10px below the art (see file note). */
  "kitchen/counter-v-top": {
    w: 16, h: 17, anchor: [8, 26], foot: [-8, -15, 16, 16],
    draw: (p) => {
      legBoards(p, 1, 16, 7);
      p.hline(1, 0, 14, "wood1").hline(2, 1, 12, "wood5").px(1, 1, "wood5");
      vgrain(p, [[4, 4, 4, 0], [11, 6, 4, 1], [3, 11, 3, 1], [10, 12, 3, 0]]);
      // Knife marks near the back where the board gets used for chopping.
      p.rows(9, 3, ["d.d", "ldl", ".l."], { d: "wood3", l: "wood5" });
    },
  },
  /** Leg of the L, plain. 16×16; anchor 10px below the art. */
  "kitchen/counter-v-mid": {
    w: 16, h: 16, anchor: [8, 25], foot: [-8, -15, 16, 16],
    draw: (p) => {
      legBoards(p, 0, 16, 7);
      vgrain(p, [[4, 1, 4, 1], [11, 2, 3, 0], [3, 9, 4, 0], [11, 10, 4, 1], [5, 13, 2, 1]]);
    },
  },
  /** Leg of the L with a tea ring. */
  "kitchen/counter-v-mid-b": {
    w: 16, h: 16, anchor: [8, 25], foot: [-8, -15, 16, 16],
    draw: (p) => {
      legBoards(p, 0, 16, 8);
      p.hline(2, 9, 6, "wood3").vline(1, 9, 1, "wood4");
      vgrain(p, [[3, 2, 4, 0], [12, 1, 4, 1], [11, 11, 3, 0], [4, 12, 3, 1]]);
      p.rows(9, 3, [".dd.", "d..d", ".Dd."], { d: "wood3", D: "wood2" });
    },
  },
  /** Free south end of the leg: top plus front face. */
  "kitchen/counter-v-bottom": {
    w: 16, h: 26, anchor: [8, 25], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      legBoards(p, 0, 10, 7);
      vgrain(p, [[4, 1, 4, 0], [11, 3, 3, 1], [3, 6, 2, 1]]);
      face(p, "both", false, false);
      p.hline(5, 8, 3, "wood5");
      scuffs(p, [6]);
    },
  },
  /** Corner of the L: the leg comes in from the north, the run leaves to the east. */
  "kitchen/counter-corner": {
    w: 16, h: 26, anchor: [8, 25], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      legBoards(p, 0, 10, 7);
      // The run's boards butt against the leg's boards here.
      p.vline(15, 0, 10, "wood3");
      vgrain(p, [[4, 1, 4, 1], [11, 2, 3, 0], [3, 6, 3, 0]]);
      face(p, "left", false, false);
      p.hline(10, 8, 3, "wood5").px(11, 7, "wood5");
      scuffs(p, [9]);
    },
  },
});
