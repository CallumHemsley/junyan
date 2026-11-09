/**
 * The service counter. Tea wood, built by the cook's father-in-law the year the shop opened and
 * oiled every Sunday since. The top is two thick boards, scored, ringed and rubbed pale where
 * twenty years of plates were slid across; the front is framed panels, pegged, over a kick-plate
 * scuffed by decades of shoes. One door was replaced in pale oak after a flood and never stained.
 *
 * Horizontal modules are 32×52: an outline row, 18 rows of top, a 4-row nosing (lit chamfer, slab
 * front, shadow under the overhang), a 23-row framed face, a 5-row kick-plate and an outline row.
 * Anchor [16, 51]. They tile left to right: `counter-left`, any mix of `counter-mid-a/-b/-c`,
 * `counter-right`.
 *
 * The leg of the L runs north–south, seen from above: `counter-v-top` (its back end, against the
 * wall), `counter-v-mid` / `counter-v-mid-b`, then `counter-v-bottom` (a free end) or
 * `counter-corner` (joining a run that leaves east). `counter-v-mid-c` is a third leg variant. Place every piece with its anchor on its own
 * tile's bottom row (y = 32r + 31); the leg's tops are drawn lifted to the counter-top height and
 * butt seamlessly into the corner. The v-top and v-mid anchors therefore sit below their art.
 */
import { defineSprites, type Px } from "../../kit/index.ts";

type End = "left" | "right" | "both" | "none";
type Streak = readonly [x: number, y: number, length: number, light: 0 | 1];

/** Long quiet grain streaks along the boards (horizontal), only over existing art. */
function grainH(p: Px, streaks: readonly Streak[]) {
  p.over(() => { for (const [x, y, n, light] of streaks) p.hline(x, y, n, light ? "wood5" : "wood3"); });
}
function grainV(p: Px, streaks: readonly Streak[]) {
  p.over(() => { for (const [x, y, n, light] of streaks) p.vline(x, y, n, light ? "wood5" : "wood3"); });
}

/** The horizontal top: two boards running east–west, rows 1..18, with a butt joint in each. */
function topBoards(p: Px, joints: readonly [number, number]) {
  p.rect(0, 1, 32, 18, "wood4");
  // Broken highlight along the back edge, catching the window light.
  for (let x = 0; x < 32; x++) if ((x * 7) % 11 > 2) p.px(x, 1, "wood5");
  p.hline(2, 2, 9, "wood5");
  // Seam between the boards, with the lip of the front board lit.
  p.hline(0, 9, 32, "wood3").hline(0, 10, 32, "wood5");
  for (const x of [5, 6, 19, 26]) p.px(x, 10, "wood4");
  for (const [joint, top, h] of [[joints[0], 2, 7], [joints[1], 11, 8]] as const) {
    if (joint < 0) continue;
    p.vline(joint, top, h, "wood3").px(joint + 1, top, "wood5");
    // Iron nail heads either side of the joint.
    p.px(joint - 2, top + 2, "wood2").px(joint + 2, top + h - 3, "wood2");
  }
}

/** Lit chamfer, slab front and the shadow under the overhang, rows 19..22. */
function nosing(p: Px) {
  p.hline(0, 19, 32, "wood6").hline(0, 20, 32, "wood4").hline(0, 21, 32, "wood3").hline(0, 22, 32, "wood2");
  for (const x of [4, 5, 13, 22, 23, 24, 29]) p.px(x, 19, "wood5");
  p.over(() => p.hline(8, 20, 6, "wood5").hline(20, 21, 5, "wood4"));
}

/** A recessed rectangle: shade on the inner top and left, light on the inner bottom and right. */
function recess(p: Px, x: number, y: number, w: number, h: number) {
  p.hline(x, y, w, "wood1").vline(x, y, h, "wood1");
  p.hline(x + 1, y + 1, w - 1, "wood2").vline(x + 1, y + 1, h - 1, "wood2");
  p.hline(x + 1, y + h - 1, w - 1, "wood4").vline(x + w - 1, y + 1, h - 1, "wood4");
  p.px(x + w - 1, y, "wood2").px(x, y + h - 1, "wood2");
}

/** A dowel peg at a joint: a dark end-grain dot with a lit rim. */
function peg(p: Px, x: number, y: number) {
  p.px(x, y, "wood2").px(x - 1, y, "wood4").px(x, y - 1, "wood4");
}

/** The framed face, rows 23..45: frame, pegs, whatever `panel` draws, kick-plate below. */
function face(p: Px, panel: (p: Px) => void, seam: boolean) {
  p.rect(0, 23, 32, 23, "wood3");
  // Top rail catches a little light; bottom rail is worn by knees and mops.
  p.hline(0, 23, 32, "wood4").hline(0, 45, 32, "wood2");
  panel(p);
  for (const [x, y] of [[2, 25], [29, 25], [2, 44], [29, 44]] as const) peg(p, x, y);
  if (seam) p.vline(0, 23, 23, "wood2");
  // Kick-plate: recessed into shadow.
  p.hline(0, 46, 32, "wood1").rect(0, 47, 32, 4, "wood2");
  p.hline(0, 51, 32, "wood1");
}

/** Shoe scuffs on the kick-plate: pale scrapes in small clusters. */
function scuffs(p: Px, marks: readonly (readonly [number, number, number])[]) {
  p.over(() => { for (const [x, y, n] of marks) p.hline(x, y, n, "wood3").hline(x + 1, y + 1, Math.max(1, n - 2), "wood3"); });
}

/** Outline and round the ends. The slab overhangs the cabinet by a pixel at each end. */
function ends(p: Px, end: End, capped: boolean) {
  if (end === "left" || end === "both") {
    p.vline(0, 0, 23, "wood1").vline(1, 2, 17, "wood5").px(1, 19, "wood6").px(1, 20, "wood5");
    p.vline(0, 23, 29, null).vline(1, 23, 29, "wood1").vline(2, 23, 23, "wood4");
    p.vline(2, 46, 5, "wood3").px(2, 46, "wood2");
    if (capped) p.px(0, 0, null).px(1, 0, null).px(0, 1, null).px(1, 1, "wood1");
    p.px(1, 51, null).px(2, 51, "wood1");
  }
  if (end === "right" || end === "both") {
    p.vline(31, 0, 23, "wood1").vline(30, 2, 17, "wood3").px(30, 19, "wood4").px(30, 20, "wood3").px(30, 21, "wood2");
    p.vline(31, 23, 29, null).vline(30, 23, 29, "wood1").vline(29, 23, 23, "wood2");
    p.vline(29, 46, 5, "wood1");
    if (capped) p.px(31, 0, null).px(30, 0, null).px(31, 1, null).px(30, 1, "wood1");
    p.px(30, 51, null).px(29, 51, "wood1");
  }
}

/** Plain door: one recessed panel with soft vertical figure. */
function plainPanel(grainX: readonly number[]) {
  return (p: Px) => {
    recess(p, 4, 26, 24, 17);
    p.over(() => {
      for (const [i, x] of grainX.entries()) p.vline(x, 29 + (i % 3) * 2, 8 + (i % 2) * 3, i % 2 ? "wood4" : "wood2");
    });
  };
}

/** Raised field: the panel's centre stands proud, bevelled toward the sun. */
function raisedPanel(p: Px) {
  recess(p, 4, 26, 24, 17);
  p.rect(8, 30, 16, 9, "wood3");
  p.hline(8, 29, 16, "wood4").vline(7, 30, 9, "wood4").px(7, 29, "wood5");
  p.hline(8, 39, 17, "wood2").vline(24, 30, 9, "wood2");
  p.over(() => p.hline(10, 32, 9, "wood4").hline(13, 35, 8, "wood2").hline(9, 37, 5, "wood4"));
}

/** Two drawers. The top one keeps its brass bail; the lower lost its pull and got a wooden knob. */
function drawerPanel(p: Px) {
  recess(p, 4, 26, 24, 8);
  recess(p, 4, 35, 24, 8);
  p.over(() => p.hline(7, 29, 11, "wood4").hline(14, 31, 10, "wood2").hline(8, 39, 14, "wood4"));
  p.rows(12, 28, [".gggggg.", "g......g", "GGGGGGGG"], { g: "gold4", G: "gold2" });
  p.rows(15, 29, ["dd"], { d: "gold1" });
  p.rows(14, 37, [".ll.", "lwWd", ".dd."], { l: "wood5", w: "wood4", W: "wood3", d: "wood1" });
}

/** The replacement door: pale oak, never stained to match, a different moulding, a filled nail hole. */
function oakPanel(p: Px) {
  p.rect(3, 25, 26, 19, "oak3");
  p.hline(3, 25, 26, "oak4").vline(3, 25, 19, "oak4").hline(3, 43, 26, "oak1").vline(28, 25, 19, "oak2");
  p.rect(6, 28, 20, 13, "oak4");
  p.hline(6, 28, 20, "oak2").vline(6, 28, 13, "oak2").hline(7, 40, 19, "oak5").vline(25, 29, 12, "oak5");
  p.over(() => {
    for (const [x, y, n] of [[9, 31, 7], [14, 33, 9], [8, 36, 5], [17, 38, 6], [11, 30, 3]] as const) p.hline(x, y, n, y % 2 ? "oak3" : "oak5");
  });
  // Brass hinge pins on the left, a dab of filler over an old nail hole.
  p.rows(3, 28, ["g", "G"], { g: "gold4", G: "gold2" }).rows(3, 38, ["g", "G"], { g: "gold4", G: "gold2" });
  p.px(22, 34, "oak2").px(23, 34, "wood4");
}

function horizontal(p: Px, end: End, joints: readonly [number, number], panel: (p: Px) => void) {
  p.hline(0, 0, 32, "wood1");
  topBoards(p, joints);
  nosing(p);
  face(p, panel, end === "none" || end === "right");
  ends(p, end, true);
}

/**
 * Leg of the L, seen from above: three boards running north–south over rows y..y+h-1. The west
 * edge is a lit bevel; the east edge falls into a two-pixel shade so the slab has thickness.
 * `joints` are [board, row] butt joints (boards are 0..2), each with a nail either side.
 */
const LEG_SEAMS = [10, 20] as const;
function legBoards(p: Px, y: number, h: number, joints: readonly (readonly [number, number])[] = [], east = true) {
  p.rect(1, y, 30, h, "wood4");
  for (const sx of LEG_SEAMS) p.vline(sx, y, h, "wood3").vline(sx + 1, y, h, "wood5");
  // The lip of each seam is broken where the board has worn.
  for (let j = 0; j < h; j++) for (const sx of LEG_SEAMS) if (((y + j) * 7 + sx) % 11 < 3) p.px(sx + 1, y + j, "wood4");
  p.vline(1, y, h, "wood6").vline(2, y, h, "wood5");
  if (east) p.vline(28, y, h, "wood3").vline(29, y, h, "wood3").vline(30, y, h, "wood2");
  const span = [[3, 9], [12, 19], [22, 27]] as const;
  for (const [board, row] of joints) {
    const [x0, x1] = span[board];
    p.hline(x0, y + row, x1 - x0 + 1, "wood3").hline(x0, y + row + 1, x1 - x0 + 1, "wood5");
    p.px(x0 + 1, y + row - 2, "wood2").px(x1 - 1, y + row + 3, "wood2");
  }
  p.vline(0, y, h, "wood1");
  if (east) p.vline(31, y, h, "wood1");
}

/** A pale track rubbed down the leg by plates slid along it to the corner: wood5 streaks, wood6 core. */
function slideTrack(p: Px, y0: number, h: number, wobble: number) {
  p.over(() => {
    // Long soft streaks along the boards, drifting a pixel side to side down the leg.
    for (const [dx, phase, light] of [[0, 0, 0], [2, 3, 1], [3, 9, 0], [5, 5, 1], [6, 13, 0], [4, 1, 2]] as const) {
      for (let j = 0; j < h; j++) {
        if (((j + phase) % 17) > 12) continue;
        const x = 12 + dx + Math.round(Math.sin((y0 + j) / 11 + wobble));
        p.px(x, y0 + j, light === 2 ? "wood6" : "wood5");
      }
    }
  });
}

const SHADOW = { rx: 16, ry: 4 } as const;
const FOOT = [-16, -31, 32, 32] as const;

export default defineSprites({
  /** West end of a run. The nosing corner was chipped by a delivery crate; the end board is palm-worn. */
  "kitchen/counter-left": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "left", [-1, 21], plainPanel([9, 15, 21]));
      grainH(p, [[6, 3, 12, 1], [18, 5, 10, 0], [4, 7, 6, 0], [9, 12, 14, 0], [24, 14, 5, 1], [5, 16, 9, 1]]);
      // A knot near the back.
      p.rows(22, 3, [".kkk.", "kKdKk", ".kkk."], { k: "wood3", K: "wood2", d: "wood1" });
      // Palm-worn patch where people lean at the end.
      p.over(() => p.hline(4, 13, 10, "wood5").hline(3, 14, 13, "wood5").hline(5, 15, 9, "wood5").hline(7, 16, 4, "wood6"));
      // Chipped nosing corner: bare, paler wood showing.
      p.rows(0, 18, [".o", "oL", "ol", ".o"], { o: "wood1", L: "wood5", l: "oak4" });
      p.px(0, 18, null);
      scuffs(p, [[8, 48, 3], [20, 49, 2]]);
    },
  },
  /** Where the food goes out: a pale track rubbed by twenty years of slid plates, a tea ring, heavy scuffs. */
  "kitchen/counter-mid-a": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", [12, -1], raisedPanel);
      grainH(p, [[2, 3, 8, 1], [17, 4, 12, 0], [3, 6, 7, 0], [20, 7, 9, 1], [2, 13, 6, 0], [25, 16, 6, 0]]);
      p.over(() => {
        for (const [x, y, n] of [[8, 11, 16], [6, 12, 20], [7, 13, 19], [9, 14, 15], [6, 15, 18], [10, 16, 12], [8, 17, 14]] as const) p.hline(x, y, n, "wood5");
        p.hline(12, 13, 7, "wood6").hline(14, 15, 5, "wood6");
      });
      // A tea ring where the cook's own cup always stands.
      p.rows(22, 2, ["..rrrr..", ".r....r.", "r......r", ".r....R.", "..rrRR.."], { r: "wood3", R: "wood2" });
      scuffs(p, [[4, 48, 4], [11, 47, 3], [14, 49, 5], [22, 48, 3], [26, 49, 2]]);
    },
  },
  /** Knife marks from cutting 油条 to order, a scorch where a hot pot was set down, two drawers. */
  "kitchen/counter-mid-b": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", [-1, 7], drawerPanel);
      grainH(p, [[14, 3, 12, 1], [3, 4, 8, 0], [18, 7, 7, 0], [12, 12, 11, 1], [22, 15, 8, 0], [10, 17, 6, 1]]);
      // Knife marks: short parallel nicks, the cut lip catching light.
      p.rows(4, 11, ["d...d..", "ld...d.", ".ld..ld", "..ld..l", "d..ld..", "ld..l..", ".l....."], { d: "wood2", l: "wood5" });
      // A scorch: a dark ring from a pot base, charred where it sat longest.
      p.rows(18, 2, ["...cccc...", ".cCddddCc.", "cCd....dCc", "cd......dc", "cCd....dCc", ".cCddDdCc.", "...cccc..."], {
        c: "wood3", C: "wood2", d: "wood1", D: "ink2",
      });
      scuffs(p, [[6, 48, 3], [24, 49, 3]]);
    },
  },
  /** The flood door: pale oak, never matched. A long gouge on the top from a dropped cleaver. */
  "kitchen/counter-mid-c": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", [24, -1], oakPanel);
      grainH(p, [[3, 3, 14, 0], [5, 6, 9, 1], [12, 12, 13, 1], [2, 15, 8, 0], [18, 16, 10, 0]]);
      p.line(6, 14, 15, 11, "wood2").line(7, 14, 16, 11, "wood5");
      scuffs(p, [[10, 48, 3], [17, 49, 2]]);
    },
  },
  /** East end. A brass hook on the end stile holds the counter cloth; a ring half off the edge. */
  "kitchen/counter-right": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "right", [16, -1], plainPanel([8, 13, 20]));
      grainH(p, [[3, 3, 10, 1], [19, 6, 8, 0], [4, 12, 13, 0], [20, 14, 7, 1], [6, 16, 8, 1]]);
      p.rows(25, 11, ["..rrr", ".r...", "r....", ".r...", "..rrr"], { r: "wood3" });
      // Hook and a checked counter cloth hanging from it.
      p.rows(22, 24, ["gG", "g."], { g: "gold4", G: "gold2" });
      p.rows(19, 26, [
        "..cwwc..",
        ".cwbwbc.",
        "cwbwbwbc",
        "cbwbwbwc",
        "cwbwbwbc",
        "cbwbwbwc",
        "cwbwbwbs",
        "cbwbwbws",
        ".cwbwbs.",
        ".cbw.bs.",
        "..c...s.",
      ], { c: "cream3", w: "cream5", b: "blue4", s: "cream2" });
      scuffs(p, [[7, 48, 3]]);
    },
  },

  /**
   * North end of the leg, against the wall: the board ends show their end grain, and the kettle that
   * always stands here has left a burnt ring.
   */
  "kitchen/counter-v-top": {
    w: 32, h: 33, anchor: [16, 52], foot: FOOT,
    draw: (p) => {
      legBoards(p, 1, 32, [[1, 19]]);
      grainV(p, [[5, 8, 12, 0], [7, 20, 9, 1], [14, 6, 10, 1], [17, 23, 8, 0], [24, 9, 14, 0], [25, 26, 5, 1]]);
      // End grain: the boards' cut ends, rings in arcs, the top arris catching the sun.
      p.rect(1, 1, 30, 4, "wood3");
      for (const [x0, x1] of [[2, 9], [12, 19], [22, 29]] as const) {
        p.hline(x0, 1, x1 - x0 + 1, "wood5");
        p.rows(x0 + 1, 2, [".dddd.", "d....d"], { d: "wood2" });
        p.rows(x0 + 2, 3, ["dd"], { d: "wood2" });
      }
      for (const sx of LEG_SEAMS) p.vline(sx, 1, 4, "wood1");
      p.hline(1, 5, 30, "wood5").vline(29, 1, 4, "wood2").vline(30, 1, 4, "wood2");
      p.hline(2, 0, 28, "wood1").vline(0, 1, 32, "wood1").vline(31, 1, 32, "wood1").px(1, 0, null).px(30, 0, null).px(0, 0, null).px(31, 0, null);
      p.px(1, 1, "wood1").px(30, 1, "wood1");
      // The kettle ring, scorched dark on its back arc.
      p.rows(13, 10, ["...cccccc...", ".cCddddddCc.", "cCd......dCc", "cd........dc", "cCd......dCc", ".ccCCddCCc..", "...cccccc..."], { c: "wood3", C: "wood2", d: "wood1" });
    },
  },
  /** Leg of the L: the slide track where plates travel to the corner, and a knot the boards bend round. */
  "kitchen/counter-v-mid": {
    w: 32, h: 32, anchor: [16, 51], foot: FOOT,
    draw: (p) => {
      legBoards(p, 0, 32, [[0, 20], [2, 6]]);
      grainV(p, [[5, 2, 14, 1], [7, 23, 8, 0], [16, 3, 9, 0], [24, 14, 15, 1], [26, 1, 9, 0]]);
      slideTrack(p, 0, 32, 0);
      p.rows(23, 21, [".kk.", "kKdk", "kddk", ".kk."], { k: "wood3", K: "wood2", d: "wood1" });
      p.over(() => p.vline(23, 17, 3, "wood3").vline(26, 26, 4, "wood3"));
    },
  },
  /** Leg of the L where the waiter leans: two cup rings overlapping, and a few nicks. */
  "kitchen/counter-v-mid-b": {
    w: 32, h: 32, anchor: [16, 51], foot: FOOT,
    draw: (p) => {
      legBoards(p, 0, 32, [[1, 12]]);
      grainV(p, [[4, 3, 10, 0], [7, 18, 11, 1], [15, 20, 9, 1], [23, 2, 12, 1], [26, 17, 10, 0]]);
      slideTrack(p, 0, 32, 2.2);
      p.rows(18, 4, ["..rrrr..", ".r....r.", "r......r", "r......r", ".r....R.", "..rrRR.."], { r: "wood3", R: "wood2" });
      p.rows(21, 7, ["..rrrr..", ".r....r.", "......Rr", "r......r", ".r...R..", "..rrR..."], { r: "wood3", R: "wood2" });
      p.rows(4, 22, ["d..d.", "ld..d", ".ld.l", "..l.."], { d: "wood2", l: "wood5" });
    },
  },
  /**
   * Leg of the L by the stove: a block of crosshatched knife marks where 油条 are cut, and a long
   * scorch from a hot spatula laid down without thinking.
   */
  "kitchen/counter-v-mid-c": {
    w: 32, h: 32, anchor: [16, 51], foot: FOOT,
    draw: (p) => {
      legBoards(p, 0, 32, [[0, 5], [2, 25]]);
      grainV(p, [[6, 9, 12, 1], [13, 2, 8, 0], [17, 15, 12, 1], [24, 4, 9, 1], [26, 12, 6, 0]]);
      slideTrack(p, 0, 32, 4.1);
      p.rows(3, 11, [
        "d..d..d.",
        "ld.ld.ld",
        ".ldd.ld.",
        "d.dld.ld",
        "ld.dl.d.",
        ".ld.ldl.",
        "..l..l..",
      ], { d: "wood2", l: "wood5" });
      p.rows(20, 18, ["..cc....", ".cddc...", "cdDDdc..", ".cdDDdc.", "..cddDdc", "...cdddc", "....ccc."], { c: "wood3", d: "wood2", D: "wood1" });
    },
  },
  /** A free south end of the leg: top plus a plain framed face. */
  "kitchen/counter-v-bottom": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      legBoards(p, 0, 19);
      grainV(p, [[6, 2, 10, 1], [24, 4, 11, 0], [14, 9, 8, 0]]);
      slideTrack(p, 0, 17, 1.3);
      nosing(p);
      face(p, plainPanel([10, 17, 22]), false);
      ends(p, "both", false);
      scuffs(p, [[12, 48, 3]]);
    },
  },
  /**
   * The corner of the L: the leg's boards and the run's boards meet on a mitre, a diagonal joint from
   * the outer front corner to the inner back corner, the groove dark and its lower lip lit. The slide
   * track comes down the leg and swings round the corner onto the run.
   */
  "kitchen/counter-corner": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      // Mitre line: y = 18 - (x - 1) * 18 / 30.
      const side = (x: number, y: number) => y - (18 - ((x - 1) * 18) / 30);
      legBoards(p, 0, 19, [], false);
      grainV(p, [[5, 1, 8, 0], [14, 2, 6, 1]]);
      p.each((x, y) => {
        const t = side(x, y);
        if (x < 1 || y > 18 || t < -0.6) return undefined;
        if (t <= 0.6) return "wood2";
        // The run's boards: east–west, the same seam rows as the run modules.
        if (y === 9) return "wood3";
        if (y === 10 || side(x, y - 1) <= 0.6) return "wood5";
        return "wood4";
      }, [0, 0, 32, 19]);
      grainH(p, [[22, 4, 8, 1], [16, 13, 10, 0], [24, 15, 7, 1]]);
      // The slide track swinging round the corner.
      p.over(() => {
        for (const [x, y, n] of [[12, 0, 7], [12, 2, 6], [13, 4, 6], [13, 6, 7], [14, 8, 8], [15, 10, 9], [16, 12, 10], [18, 14, 13], [21, 16, 11]] as const) p.hline(x, y, n, "wood5");
        p.hline(14, 6, 3, "wood6").hline(17, 12, 4, "wood6").hline(22, 14, 6, "wood6");
      });
      nosing(p);
      face(p, plainPanel([11, 16, 23]), false);
      ends(p, "left", false);
      scuffs(p, [[16, 48, 4], [23, 49, 2]]);
    },
  },
});
