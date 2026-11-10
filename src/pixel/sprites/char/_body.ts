/**
 * The shared body, drawn once in slot letters on the 32×64 frame (ruler 0123456789abcdef0123456789abcdef).
 * Front views are drawn as a left half, mirrored by `sym`, with the sun-side shading applied after.
 * In profile, shading runs top-to-bottom and near-to-far rather than left-to-right, so the mirrored
 * `left` still reads.
 *
 * Rows: hair from 8, face 17–32, collar 33, torso 34–46, hips 46–51, legs 52–57, shoes 58–60.
 */
import { darken, mirror, part, sym, Z, type Part, type Piece, type Pose } from "./_core.ts";

const head = (y: number, rows: readonly string[]) => part(y, Z.head, rows, { group: "head" });
const legs = (y: number, rows: readonly string[], z: number = Z.legs) => part(y, z, rows, { group: "legs" });
const arms = (y: number, rows: readonly string[], z: number = Z.arms) => part(y, z, rows);

// ── heads (skin and ears; hair and faces are layered on) ───────────────────

export const HEAD = {
  down: head(12, sym([
    "........SSSSSSSS",
    ".......SSSSSSSSS",
    "......SSSSSSSSSS",
    "......SSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....sSSSSSSSSSS",
    ".....sSSSSSSSSSS",
    "....SssSSSSSSSSS",
    "....SkksSSSSSSSS",
    "....SkksSSSSSSSS",
    "....skssSSSSSSSS",
    ".....kssSSSSSSSS",
    "......ssSSSSSSSS",
    "......ksSSSSSSSS",
    ".......ksSSSSSSS",
    ".........ksSSSSS",
    "..........kkssss",
  ], 22)),
  up: head(12, sym([
    "........SSSSSSSS",
    ".......SSSSSSSSS",
    "......SSSSSSSSSS",
    "......SSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....SSSSSSSSSSS",
    ".....sSSSSSSSSSS",
    ".....sSSSSSSSSSS",
    "....SssSSSSSSSSS",
    "....SkksSSSSSSSS",
    "....SkksSSSSSSSS",
    "....skssSSSSSSSS",
    ".....kssSSSSSSSS",
    "........ksSSSSSS",
    "..........kssSSS",
    "...........kssss",
    "...........kkkss",
    "............kkkk",
  ], 22)),
  right: head(12, [
    "........SSSSSSSSSSSS............",
    ".......SSSSSSSSSSSSSSS..........",
    "......SSSSSSSSSSSSSSSSS.........",
    "......SSSSSSSSSSSSSSSSSS........",
    ".....SSSSSSSSSSSSSSSSSSSS.......",
    ".....SSSSSSSSSSSSSSSSSSSS.......",
    ".....SSSSSSSSSSSSSSSSSSSSS......",
    ".....SSSSSSSSSSSSSSSSSSSSS......",
    ".....SSSSSSSSSSSSSSSSSSSSS......",
    ".....SSSSSSSSSSSSSSSSSSSSS......",
    ".....SSSSSSSSSSSSSSSSSSSSS......",
    ".....SSSSSSSSSSSSSSSSSSSSS......",
    ".....SSSSSSSSSSSSSSSSSSSSSs.....",
    ".....SSSSSSSSSSSSSSSSSSSSSSs....",
    ".....SSSSSSSSSSSSSSSSSSSSSs.....",
    "......SSSSSSSSSSSSSSSSSSSS......",
    "........SSSSSSSSSSSSSSSSSS......",
    "..........sSSSSSSSSSSSSSSs......",
    "...........sSSSSSSSSSSSSs.......",
    "............ssSSSSSSSSss........",
    "..............kksssssk..........",
  ]),
};

/** A profile ear, for hairstyles that show it. Move it with `shift`. */
export const EAR_RIGHT = part(22, Z.face, [
  ".Ss.",
  "SkkS",
  "SksS",
  "Skss",
  ".ss.",
], { x: 13, group: "head" });

// ── torsos ─────────────────────────────────────────────────────────────────

export const TORSO = {
  down: part(33, Z.torso, sym([
    "..........cCkkss",
    "......TTTTTCCkks",
    ".....TTTTTTTCCkk",
    ".....TTTTTTTTCCk",
    ".....TTTTTTTTTCC",
    "........TTTTTTTT",
    "........TTTTTTTT",
    "........TTTTTTTT",
    "........tTTTTTTT",
    "........tTTTTTTT",
    "........tTTTTTTT",
    "........tTTTTTTT",
    "........ttTTTTTT",
    "........tttttttt",
  ], 21)),
  up: part(33, Z.torso, sym([
    "..........ccCCCC",
    "......TTTTTTcccc",
    ".....TTTTTTTTTTT",
    ".....TTTTTTTTTTT",
    ".....TTtttTTTTTT",
    "........TTTttttt",
    "........TTTTTTTT",
    "........TTTTTTTt",
    "........tTTTTTTt",
    "........tTTTTTTT",
    "........tTTTTTTT",
    "........tTTuTTTT",
    "........ttTTTTTT",
    "........tttttttt",
  ], 21)),
  right: part(33, Z.torso, [
    "..............kkkk..............",
    ".............TTTCCCC............",
    "...........TTTTTTCCCt...........",
    "...........TTTTTTTTTtt..........",
    "...........TTTTTTTTTTt..........",
    "...........TTTTTTTTTTt..........",
    "...........TTTTTTTTTTt..........",
    "...........TTTTTTTTTTt..........",
    "...........tTTTTTTTTtt..........",
    "...........tTTTTTTTTt...........",
    "...........tTTTTTTTTt...........",
    "...........tTTTTTTTTt...........",
    "...........ttTTTTTTtt...........",
    "...........tttttttttt...........",
  ]),
};

// ── arms ───────────────────────────────────────────────────────────────────

/** The screen-left arm, front view, from row 34. The right arm is its mirror, a step darker. */
const ARM_L = {
  rest: [
    "......VVV.......",
    ".....VVVVv......",
    ".....VVVVv......",
    ".....VVVvv......",
    ".....VVVvo......",
    ".....VVvvo......",
    ".....XXXxo......",
    ".....FFFfo......",
    ".....FFFfo......",
    ".....SSSko......",
    ".....SSSko......",
    ".....sSsk.......",
    "......ss........",
  ],
  fwd: [
    "......VVV.......",
    ".....VVVVv......",
    ".....VVVVv......",
    ".....VVVvv......",
    ".....VVVvo......",
    ".....VVvvo......",
    ".....XXXxo......",
    ".....FFFfo......",
    ".....FFFfo......",
    "......FFfo......",
    "......SSSk......",
    "......SSSk......",
    "......SSSk......",
    "......sSk.......",
  ],
  back: [
    "......VVV.......",
    ".....VVVVv......",
    ".....VVVVv......",
    ".....VVVvv......",
    ".....VVVvo......",
    ".....VVvvo......",
    ".....XXXxo......",
    ".....FFFfo......",
    ".....SSSko......",
    ".....sSsk.......",
    "......ss........",
  ],
  carry: [
    "......VVV.......",
    ".....VVVVv......",
    ".....VVVVv......",
    ".....VVVvv......",
    ".....VVVvo......",
    ".....VVvvo......",
    ".....XXXx.......",
    "....FFFf........",
  ],
  sit: [
    "......VVV.......",
    ".....VVVVv......",
    ".....VVVVv......",
    ".....VVVvv......",
    ".....VVVvo......",
    ".....VVvvo......",
    ".....XXXXx......",
    "......FFFFf.....",
    ".......FFSSSk...",
    "........sSSSk...",
  ],
};

export type ArmShape = keyof typeof ARM_L;
const armLeft = (shape: ArmShape): Part => arms(34, ARM_L[shape]);
const armRight = (shape: ArmShape): Part => {
  const m = mirror(arms(34, ARM_L[shape]));
  return { ...m, rows: darken(m.rows, 0) };
};
/** Both front arms; an arm swung toward the camera hangs lower. */
export const frontArms = (left: ArmShape, right: ArmShape): Part[] => [armLeft(left), armRight(right)];

// ── legs ───────────────────────────────────────────────────────────────────

/** Hips and seat of the trousers, front view, rows 46–51. */
const HIPS_FRONT = legs(46, sym([
  "........PPPPPPPP",
  "........PPPPPPPP",
  "........PPPPPPPP",
  "........PPPPPPPP",
  "........PPPPPPPp",
  "........PPPPPPp.",
], 21));

/** One trouser leg and shoe, screen-left: `len` rows of leg from row 52, then the shoe. */
function legFront(len: number): string[] {
  const shin = ["........pPPPPPp.", "........pPPPPPp.", "........pPPpPPp.", "........pPPpPPp.", "........pPPPPPp.", "........pPPPPPp.", "........pPPPPPp."];
  return [...shin.slice(0, len - 1), "........ppppppp.", "........NNNNNN..", ".......NNNNNNNn.", ".......YYYYYYYY."];
}
const legLeft = (len: number): Part => legs(52, legFront(len));
const legRight = (len: number): Part => {
  const m = mirror(legs(52, legFront(len)));
  return { ...m, rows: darken(m.rows, 5) };
};

/** Front legs by length: 6 is planted, 7 steps toward the camera, 4–5 is lifted. */
export const frontLegs = (left: number, right: number): Part[] => [HIPS_FRONT, legLeft(left), legRight(right)];

// ── seated legs (front and back) ───────────────────────────────────────────

/** Facing the camera on a stool: thighs come toward us, shins drop to the floor. */
const SIT_FRONT: Part[] = [legs(40, sym([
  "........PPPPPPPP",
  "........PPPPPPPP",
  ".......PPPPPPPPP",
  ".......PPPPPPPPP",
  ".......PPPPPPPPp",
  ".......PPPPPPPp.",
  ".......pPPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pPPPPp..",
  "........pppppp..",
  ".......NNNNNNn..",
  ".......NNNNNNNn.",
  ".......YYYYYYYY.",
], 20))];

/** Back to the camera: only the seat of the trousers shows; the legs are hidden in front. */
const SIT_BACK: Part[] = [legs(40, sym([
  "........PPPPPPPP",
  "........PPPPPPPP",
  ".......PPPPPPPPP",
  ".......PPPPPPPPP",
  ".......pPPPPPPPP",
  "........ppppPPPP",
], 21))];

// ── pieces ─────────────────────────────────────────────────────────────────

/** Seated, the torso and head sit this far above standing. */
export const SIT_BODY = -6;

/** Front and back walking: leg lengths and which arm swings toward the camera. */
function frontStep(pose: Pose): { legs: [number, number]; arms: [ArmShape, ArmShape] } {
  const away = pose.dir === "up";
  // stepA: the screen-left leg leads. Toward the camera a leading foot is lower; walking away, higher.
  const lead = away ? 4 : 7, trail = away ? 7 : 4;
  switch (pose.legs) {
    case "stepA": return { legs: [lead, trail], arms: away ? ["fwd", "back"] : ["back", "fwd"] };
    case "passA": return { legs: [6, 5], arms: ["rest", "rest"] };
    case "stepB": return { legs: [trail, lead], arms: away ? ["back", "fwd"] : ["fwd", "back"] };
    case "passB": return { legs: [5, 6], arms: ["rest", "rest"] };
    default: return { legs: [6, 6], arms: ["rest", "rest"] };
  }
}

export const FRONT_ARMS: Piece = (pose) => {
  if (pose.arms === "carry") return frontArms("carry", "carry");
  if (pose.arms === "sit") return pose.dir === "up" ? frontArms("carry", "carry") : frontArms("sit", "sit");
  return frontArms(...frontStep(pose).arms);
};

export const FRONT_LEGS: Piece = (pose) => {
  if (pose.legs === "sit") return pose.dir === "up" ? SIT_BACK : SIT_FRONT;
  return frontLegs(...frontStep(pose).legs);
};
