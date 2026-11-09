/**
 * The waiter's tray: an old tea-wood tray worn pale in the middle, with a tea ring near one
 * corner, carrying a small bamboo steamer (lid on) and a blue-and-white bowl of soy milk with a
 * porcelain spoon. Held in both hands at the bottom of the chest so the food never covers the face.
 */
import { part, Z, type Part, type Piece } from "./_core.ts";
import { frontSide } from "./_rig.ts";

const L = {
  "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5", "6": "wood6",
  a: "bamboo1", b: "bamboo2", c: "bamboo3", d: "bamboo4", e: "bamboo5",
  w: "white", q: "steel5", Q: "steel4", u: "blue3", U: "blue2", m: "cream4", M: "cream5",
} as const;

const tray = (y: number, z: number, rows: readonly string[]) => part(y, z, rows, { legend: L });

// ── facing the camera ──────────────────────────────────────────────────────

const BOARD_DOWN = tray(40, Z.front, [
  "...23333333333333333333333332...",
  "...34566555544444445554444443...",
  "...34444444455555544444443343...",
  "...34455444555555554444433443...",
  "...34444444444444444455544443...",
  "...55555555555555555555555555...",
  "...33333333333333333333333333...",
  "...22222222222222222222222222...",
]);

const FOOD_DOWN = tray(33, Z.front + 1, [
  "........................w.......",
  ".........ede...........wq.......",
  ".......eddddcc.........wq.......",
  "......eddddddcb.......wq........",
  ".....bbbbbbbbbbba..wwwwwqw......",
  ".....dcdddcdddcdb.wMMMMMmmw.....",
  ".....dcdcdcdcdcdbwmMmmmmmmqw....",
  ".....dcdcdcdcdcdb.wmmmmmmmq.....",
  ".....dcdcdcdcdcdb.wwuuwuuqq.....",
  ".....bbbbbbbbbbbb..wUwwUwq......",
  ".....2222222222222..qqqqq2......",
]);

/** Thumbs over the rim at both ends. */
const HANDS_DOWN = part(41, Z.hands, [
  "..SSs......................ss...",
  ".SSSSk....................sssk..",
  ".sSSsk....................kssk..",
  "..sk........................kk..",
]);

// ── facing away: the tray is hidden by the body, its ends and the steamer lid show ──

const BOARD_UP = tray(40, Z.behind, [
  "..2333333333333333333333333332..",
  "..3444444444444444444444444443..",
  "..3444444444444444444444444443..",
  "..3444444444444444444444444443..",
  "..3444444444444444444444444443..",
  "..5555555555555555555555555555..",
  "..3333333333333333333333333333..",
]);
const FOOD_UP = tray(32, Z.behind, [
  "...................ede..........",
  ".................eddddcc........",
  "................eddddddcb.......",
  "...............bbbbbbbbbbba.....",
]);

// ── profile: the tray reaches forward ──────────────────────────────────────

const BOARD_SIDE = tray(41, Z.front, [
  "............23333333333333333...",
  "............34455554444444443...",
  "............55555555555555555...",
  "............22222222222222222...",
]);
const FOOD_SIDE = tray(33, Z.front + 1, [
  "...........................w....",
  ".................ede.......wq...",
  "...............eddddcc....wq....",
  "..............eddddddcb..wq.....",
  ".............bbbbbbbbbbawwwwqw..",
  ".............dcdcdcdcdcbwMMmmqw.",
  ".............dcdcdcdcdcb.wuuwq..",
  ".............bbbbbbbbbbb.wwUqq..",
  ".............222222222222.qqq2..",
]);
const HANDS_SIDE = part(42, Z.hands, [
  ".......................SSs......",
  "......................SSSsk.....",
  ".......................skk.....",
]);

export const TRAY: Piece = (pose): Part[] => {
  if (pose.arms !== "carry") return [];
  return frontSide(
    (p) => (p.dir === "up" ? [BOARD_UP, FOOD_UP] : [BOARD_DOWN, FOOD_DOWN, HANDS_DOWN]),
    () => [BOARD_SIDE, FOOD_SIDE, HANDS_SIDE],
  )(pose);
};
