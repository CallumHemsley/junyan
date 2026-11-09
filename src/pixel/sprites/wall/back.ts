/**
 * The back (north) wall, face-on, in 16×48 slices that tile horizontally in any order.
 * Dining side: cream plaster over a jade painted dado with a tea-wood rail and skirting.
 * Slices anchor at their top-left corner: place them at (x, 0) along the top of the room.
 * Wall-mounted pieces (windows, the post) anchor at the wall's foot, 48px below the slice top,
 * so they sort after the wall slices they hang on.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { DADO, DADO_ROWS, PLASTER, block, diningWall, dado, skirting, SKIRTING_ROWS } from "./_helpers.ts";

const slice = (draw: (p: Px) => void) => ({ w: 16, h: 48, anchor: [0, 0] as const, layer: "floor" as const, draw });

/** Soft occlusion where the back wall meets a side wall, painted over a finished slice. */
function cornerShadow(p: Px, side: "left" | "right") {
  const at = (x: number) => (side === "left" ? x : 15 - x);
  // Plaster: wide under the cap, tapering toward the dado.
  const depth = side === "left" ? [26, 26, 16, 7] : [26, 10];
  depth.forEach((rows, i) => {
    for (let y = 5; y < 5 + rows; y++) {
      const c = i === 0 ? "cream2" : "cream3";
      // The last few pixels of each run are broken so the edge feathers instead of banding.
      if (i > 0 && y > 5 + rows - 4 && (y + i) % 2 === 1) continue;
      p.px(at(i), y, c);
    }
  });
  p.px(at(0), 31, "wood3").px(at(0), 32, "wood2");
  for (let y = 33; y < 44; y++) p.px(at(0), y, "jade2");
  p.px(at(0), 44, "wood3").px(at(0), 45, "wood2").px(at(0), 46, "wood2");
}

export default defineSprites({
  /** Clean plaster. */
  "wall/back-a": slice((p) => diningWall(p, [[2, 11, 0], [10, 17, 1], [4, 23, 2], [12, 26, 3]])),

  /** A hairline crack climbing from the dado rail. */
  "wall/back-b": slice((p) => {
    diningWall(p, [[11, 10, 0], [2, 14, 1], [12, 21, 2]], 1);
    block(p, 4, 15, 8, 16, [
      "....K...",
      "....K...",
      "...K....",
      "...K....",
      "...KC...",
      "....K...",
      "....K.K.",
      "....KK..",
      ".....K..",
      ".....KC.",
      "....K...",
      "....K...",
      ".....K..",
      ".....K..",
      ".....KC.",
      ".....K..",
    ], PLASTER, "crack");
  }),

  /** A paler rectangle and a nail: a calendar hung here for years. */
  "wall/back-c": slice((p) => {
    diningWall(p, [[1, 27, 1], [12, 9, 3]]);
    block(p, 3, 9, 10, 18, [
      "....n.....",
      "....kk....",
      "..........",
      ".kkkkkkkk.",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      "WWWWWWWWWW",
      ".WWWWWWWW.",
      "..........",
    ], PLASTER, "faded");
  }),

  /** The dado scuffed by stool backs and feet: worn rail, scraped paint, wood showing through. */
  "wall/back-d": slice((p) => {
    diningWall(p, [[3, 12, 0], [11, 20, 2], [6, 26, 1]], 1);
    dado(p, [
      "4444445544444444",
      "3333333433333333",
      "aaaaaaaaaaaaaaaa",
      "bbbbbbbbbbbbbbbb",
      "bbaaaaaaaaaaaabb",
      "bbabcccbbbbbbcbb",
      "bbacbbbbbbbbbcbb",
      "bbabbbbbbbbbbcbb",
      "bbabbbbbcbbbbcbb",
      "bbabbbbbbcbbbcbb",
      "bbabbbbbbbbbbcbb",
      "bbacccccccccccbb",
      "bbbbbbbbbbb4bbbb",
    ]);
    skirting(p, [
      "4444444444444444",
      "3332233333334333",
      "3333333332333333",
      "1111111111111111",
    ]);
  }),

  /** The leftmost slice, against the left side wall. */
  "wall/back-end-left": slice((p) => {
    diningWall(p, [[9, 13, 0], [5, 24, 1]]);
    cornerShadow(p, "left");
  }),

  /** The rightmost dining slice, against the right side wall. */
  "wall/back-end-right": slice((p) => {
    diningWall(p, [[3, 12, 1], [8, 22, 0]], 1);
    cornerShadow(p, "right");
  }),
});

void DADO; void DADO_ROWS; void SKIRTING_ROWS;
