/**
 * The waiter's tray: an old tea-wood tray worn pale in the middle, with a tea ring near one
 * corner, held in both hands at the bottom of the chest so the food never covers the face.
 * The rig draws only the board and the hands; what is on it comes from game state and is drawn as
 * separate actors (`food/tray-*`, placed by `trayActors` in `src/world/pixel/cafe.ts`).
 */
import { part, Z, type Piece } from "./_core.ts";
import { frontSide } from "./_rig.ts";

const L = {
  "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5", "6": "wood6",
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

/** Thumbs over the rim at both ends. */
const HANDS_DOWN = part(41, Z.hands, [
  "..SSs......................ss...",
  ".SSSSk....................sssk..",
  ".sSSsk....................kssk..",
  "..sk........................kk..",
]);

// ── facing away: the tray is hidden by the body, its ends show ──

const BOARD_UP = tray(40, Z.behind, [
  "..2333333333333333333333333332..",
  "..3444444444444444444444444443..",
  "..3444444444444444444444444443..",
  "..3444444444444444444444444443..",
  "..3444444444444444444444444443..",
  "..5555555555555555555555555555..",
  "..3333333333333333333333333333..",
]);

// ── profile: the tray reaches forward ──────────────────────────────────────

const BOARD_SIDE = tray(41, Z.front, [
  "............23333333333333333...",
  "............34455554444444443...",
  "............55555555555555555...",
  "............22222222222222222...",
]);
const HANDS_SIDE = part(42, Z.hands, [
  ".......................SSs......",
  "......................SSSsk.....",
  ".......................skk.....",
]);

export const TRAY: Piece = (pose) => {
  if (pose.arms !== "carry") return [];
  return frontSide(
    (p) => (p.dir === "up" ? [BOARD_UP] : [BOARD_DOWN, HANDS_DOWN]),
    () => [BOARD_SIDE, HANDS_SIDE],
  )(pose);
};
