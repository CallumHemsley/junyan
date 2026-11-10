/**
 * The dining-room floor: honey-oak boards laid in the seventies, four 8px boards per tile running
 * east–west. Most variants are quiet ground so furniture reads on top; the stories live in a few.
 * Tiles anchor at their top-left corner and sit on the 32px grid.
 *
 * Suggested mix for open floor: mostly a and b, c now and then, d and i rarely, g once.
 * Only e, f and h carry paler wood, never more than one step (oak5 on oak4); d differs by finish, not tone. The worn path (e, f) runs from the
 * doorway to the counter; lay e and f alternately along it. h goes where the sun from a window lands.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { OAK, block, oakBoards, type BoardSpec } from "./_helpers.ts";

const tile = (draw: (p: Px) => void) => ({ w: 32, h: 32, anchor: [0, 0] as const, layer: "floor" as const, draw });
const boards = (seed: number, spec: readonly BoardSpec[]) => (p: Px) => oakBoards(p, seed, spec);

/** Pale worn streaks `[x, y, length, colour]`, drawn only over existing art. */
function wear(p: Px, streaks: readonly (readonly [number, number, number, "oak5" | "cream4" | "oak4"])[]) {
  p.over(() => { for (const [x, y, n, c] of streaks) p.hline(x, y, n, c); });
}

export default defineSprites({
  /** Quiet boards, two staggered joints. */
  "tile/floor-wood-a": tile(boards(1, [{ joints: [9] }, { grain: 2 }, { joints: [22] }, { grain: 2 }])),

  /** Quiet boards, joints elsewhere so runs never line up. */
  "tile/floor-wood-b": tile(boards(2, [{ grain: 2 }, { joints: [5] }, { grain: 2 }, { joints: [18] }])),

  /** A knot the planer went round, the grain parting about it like water round a stone. */
  "tile/floor-wood-c": tile((p) => {
    oakBoards(p, 3, [{ joints: [26] }, { grain: 0 }, { grain: 2 }, { joints: [11] }]);
    block(p, 9, 9, [
      "...bbbbbbb....",
      ".bb..llll.bb..",
      "b...bbcccb..bb",
      "...bbccdcb....",
      ".bb.lbbbbl.bb.",
      "b..........b..",
    ], OAK, "knot");
  }),

  /** A board replaced after the radiator leak: clean new oak with a crisp edge and bright new nail heads, the same tone as its neighbours. */
  "tile/floor-wood-d": tile(boards(4, [{ grain: 2 }, { joints: [14] }, { joints: [6, 25], tone: [7, 25, "new"], grain: 2 }, { grain: 2 }])),

  /** The path worn pale between the door and the counter, centred so a run of tiles joins up. */
  "tile/floor-wood-e": tile((p) => {
    oakBoards(p, 5, [{ grain: 2 }, { joints: [27] }, { grain: 1 }, { joints: [4] }]);
    wear(p, [
      [7, 2, 9, "oak5"], [19, 2, 4, "oak5"], [10, 3, 14, "oak5"], [6, 4, 6, "oak5"], [15, 5, 8, "oak5"],
      [12, 9, 7, "oak5"], [7, 10, 11, "oak5"], [21, 10, 4, "oak5"], [11, 12, 13, "oak5"], [8, 13, 5, "oak5"],
      [14, 17, 9, "oak5"], [6, 18, 10, "oak5"], [18, 19, 8, "oak5"], [9, 21, 12, "oak5"],
      [8, 25, 6, "oak5"], [16, 25, 8, "oak5"], [11, 27, 14, "oak5"], [7, 29, 9, "oak5"], [19, 29, 4, "oak5"],
    ]);
  }),

  /** More of the worn path, scuffed by the same feet a little to one side. */
  "tile/floor-wood-f": tile((p) => {
    oakBoards(p, 6, [{ joints: [20] }, { grain: 2 }, { joints: [12] }, { grain: 1 }]);
    wear(p, [
      [11, 1, 7, "oak5"], [6, 3, 12, "oak5"], [20, 3, 5, "oak5"], [9, 5, 10, "oak5"],
      [15, 9, 9, "oak5"], [7, 11, 7, "oak5"], [16, 11, 7, "oak5"], [10, 13, 11, "oak5"],
      [8, 17, 13, "oak5"], [22, 18, 3, "oak5"], [12, 20, 10, "oak5"], [6, 21, 5, "oak5"],
      [10, 25, 9, "oak5"], [7, 27, 7, "oak5"], [15, 27, 9, "oak5"], [9, 29, 12, "oak5"],
    ]);
  }),

  /** The dark ring where the mop bucket stood every night for years, and a splash beside it. */
  "tile/floor-wood-g": tile((p) => {
    oakBoards(p, 7, [{ grain: 2 }, { joints: [3] }, { grain: 1 }, { joints: [24] }]);
    p.over(() => block(p, 13, 9, [
      "...bbbbbbb...",
      ".bb.......bb.",
      "b...........b",
      "b...........c",
      ".b.........c.",
      "..cbbbbbccc..",
      ".............",
      "..........bb.",
      "....bb....b..",
    ], OAK, "bucket-ring"));
  }),

  /** Where the morning sun lies across the boards, bleached a shade paler: a cat-sized patch. */
  "tile/floor-wood-h": tile((p) => {
    oakBoards(p, 8, [{ joints: [28] }, { grain: 2 }, { grain: 2 }, { joints: [7] }]);
    const inside = (x: number, y: number, rx: number, ry: number) => ((x + 0.5 - 16) / rx) ** 2 + ((y + 0.5 - 15) / ry) ** 2 <= 1;
    p.each((x, y, c) => {
      if (inside(x, y, 8.5, 5.5)) return c === "oak4" ? "oak5" : c === "oak3" ? "oak4" : undefined;
      if (inside(x, y, 12, 8) && (x + y) % 3 !== 0) return c === "oak3" ? "oak4" : undefined;
      return undefined;
    });
  }),

  /** Two curved scratches where somebody always drags the same stool out from the same table. */
  "tile/floor-wood-i": tile((p) => {
    oakBoards(p, 9, [{ grain: 2 }, { joints: [16] }, { grain: 2 }, { grain: 2, joints: [29] }]);
    p.over(() => block(p, 4, 17, [
      "ccc.....................",
      "lllcccc.................",
      "...llllccccc............",
      "cc.....lllllcccccc......",
      "llcccc......llllllcccc..",
      "..lllllcccccc.....llll..",
    ], OAK, "scratches"));
  }),
});
