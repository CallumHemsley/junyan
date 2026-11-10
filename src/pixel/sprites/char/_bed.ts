/**
 * The in-bed body: `lie` (on the back, head on the pillow) and `sit-bed` (propped against a raised
 * backrest). Both face down only, on the usual 32×64 frame with anchor [16, 62], and draw nothing
 * the blanket hides: `lie` stops at the chest, `sit-bed` at the waist.
 *
 * Placement (bed geometry in `docs/design/pixel-contracts.md`): the frame is the bed's 48×96 canvas
 * shifted 8 px right, so place the figure's anchor at bed-local (24, 62), which is the bed's own
 * anchor moved 32 px (one tile) up. Then the `lie` face sits on the flat pillow (24, 24), the
 * `sit-bed` head sits against the raised pillow (24, 20), and the blanket (y 34 lying, y 44 sitting)
 * covers the rest. Sort the figure just behind the blanket; it casts no contact shadow.
 *
 * Lying, the camera sees the face from above and in front, so the head is foreshortened: `LIE_DROP`
 * rows are taken out of every head part (skin, face, hair, glasses), mostly under the hair.
 */
import { darken, mirror, part, sym, Z, type Part, type Piece, type Pose } from "./_core.ts";
import { TORSO } from "./_body.ts";

/** Head rows (frame y, before any offset) removed when lying. */
export const LIE_DROP: readonly number[] = [12, 14, 16, 30];

/** Remove `drop` rows from a head part, closing the gaps upward. */
export function foreshorten(p: Part, drop: readonly number[] = LIE_DROP): Part {
  const rows: string[] = [];
  p.rows.forEach((row, j) => { if (!drop.includes(p.y + j)) rows.push(row); });
  const above = drop.filter((y) => y < p.y).length;
  return { ...p, y: p.y - above, rows };
}

/** True for the in-bed poses. */
export const inBed = (pose: Pose): boolean => pose.legs === "lie" || pose.legs === "sit-bed";

// ── lying: shoulders and chest, foreshortened, under a chin at row 28 ──────

const LIE_TORSO = part(28, Z.torso, sym([
  "..........kkkkkk",
  "........TTCkkkkk",
  "......TTTTTCCkkk",
  ".....TTTTTTTTCCk",
  ".....TTTTTTTTTCC",
  ".....tTTTTTTTTTT",
  ".....tTTTTTTTTTT",
  ".....ttTTTTTTTTT",
  "......tttTTTTTTT",
  "........tttttttt",
], 21));

/**
 * Arms lie along the body, elbows bent, both hands loosely curled at the blanket's edge (y 34),
 * as if they had pulled it up.
 */
const LIE_ARMS: Part[] = [
  part(29, Z.arms, [
    "................................",
    ".....VVVv..............vvvv.....",
    "....VVVVvv............vvvvvv....",
    "....VVVVvXX..........xxvvvvv....",
    "....VVVVXFFF........fffxvvvv....",
    "....VVVXFFFF........ffffxvvv....",
    "....VVVXFFF..........fffxvvv....",
    ".....VXXFF............ffxxv.....",
  ]),
  part(31, Z.hands, [
    "..........SSSs....SSsk..........",
    ".........SSSSsk..SSSSsk.........",
    ".........sSkSkk..sSkSkk.........",
    "..........kkkk....kkkk..........",
  ]),
];

// ── sitting up: the standing torso, hips under the blanket, hands in the lap ─

/** Screen-left arm bent forward so the hand lies in the lap; the right arm mirrors it a step darker. */
const LAP_ARM = [
  "......VVV.......",
  ".....VVVVv......",
  ".....VVVVv......",
  ".....VVVvv......",
  ".....VVVvo......",
  ".....VVvvo......",
  ".....XXXXx......",
  "......FFFFf.....",
  ".......FFFFf....",
  "........FFFFx...",
];
const lapArms = (): Part[] => {
  const left = part(34, Z.arms, LAP_ARM);
  const right = mirror(left);
  return [left, { ...right, rows: darken(right.rows, 0) }];
};
/** The hands resting together in the lap, just above the sitting blanket (y 44). */
const LAP_HANDS = part(41, Z.hands, [
  "...........SSSs..SSsk...........",
  "..........SSSSsk.SSSSsk.........",
  "..........sSkSkk.sSkSkk.........",
  "...........kkkk...kkkk..........",
]);

const SIT_HIPS = part(46, Z.legs, sym([
  "........PPPPPPPP",
  "........PPPPPPPP",
], 21), { group: "legs" });

/** The in-bed body pieces, used in place of the rig's for `lie` and `sit-bed`. */
export const BED = {
  torso: ((pose) => (pose.legs === "lie" ? [LIE_TORSO] : [TORSO.down])) as Piece,
  arms: ((pose) => (pose.legs === "lie" ? LIE_ARMS : [...lapArms(), LAP_HANDS])) as Piece,
  legs: ((pose) => (pose.legs === "lie" ? [] : [SIT_HIPS])) as Piece,
};
