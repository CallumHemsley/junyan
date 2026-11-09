/**
 * The shared body, drawn once in slot letters. Rows are 16 wide (ruler: 0123456789abcdef).
 * Light from the upper left. In profile, shading runs top-to-bottom and near-to-far rather
 * than left-to-right, so the mirrored `left` still reads.
 */
import { part, Z, type ArmPose, type LegPose, type Part, type Piece, type Pose } from "./_core.ts";

const head = (y: number, rows: readonly string[]) => part(y, Z.head, rows, { group: "head" });
const face = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });
const legs = (y: number, rows: readonly string[]) => part(y, Z.legs, rows, { group: "legs" });

// ── heads (skin only; hair and faces are layered on) ───────────────────────

export const HEAD = {
  down: head(5, [
    "....SSSSSSSS....",
    "...SSSSSSSSSS...",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSss..",
    "..SSSSSSSSSSsk..",
    "..SSSSSSSSSSsk..",
    "...SSSSSSSSsk...",
    "...sSSSSSSSsk...",
    "....sssssskk....",
  ]),
  up: head(5, [
    "....SSSSSSSS....",
    "...SSSSSSSSSS...",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSSs..",
    "..SSSSSSSSSSss..",
    "..sSSSSSSSSSsk..",
    "..sSSSSSSSSSsk..",
    "...sSSSSSSSsk...",
    "......ssss......",
    "......kkkk......",
  ]),
  right: head(5, [
    "....SSSSSSSS....",
    "...SSSSSSSSSS...",
    "..SSSSSSSSSSSS..",
    "..SSSSSSSSSSSS..",
    "..SSSSSSSSSSSS..",
    "..SSSSSSSSSSSS..",
    "..SSSSSSSSSSSS..",
    "..SSSSSSSSSSSS..",
    "..SSSSSSSSSSSSS.",
    "...SSSSSSSSSSS..",
    "....sSSSSSSSSs..",
    ".....ssssssk....",
  ]),
};

/** The default face: two-pixel eyes, blush, a small mouth. Characters may replace it. */
export const FACE = {
  down: face(12, [
    ".....e....e.....",
    ".....e....e.....",
    "....b......b....",
    ".......mm.......",
  ]),
  right: face(12, [
    "...........e....",
    "...........e....",
    "..........b.....",
    "............m...",
  ]),
};

// ── torsos ─────────────────────────────────────────────────────────────────

export const TORSO = {
  down: part(17, Z.torso, [
    "......kkkk......",
    "....TTCkkCTt....",
    ".....TTCCTtu....",
    ".....TTTTTtu....",
    ".....TTTTttu....",
    ".....tTTTttu....",
    ".....ttttuuu....",
  ]),
  up: part(17, Z.torso, [
    "......kkkk......",
    "....TTCCCCTt....",
    ".....TTTTTtu....",
    ".....TTTTTtu....",
    ".....TTTtTtu....",
    ".....tTTtttu....",
    ".....ttttuuu....",
  ]),
  right: part(17, Z.torso, [
    ".......kkk......",
    "......TTTTCC....",
    ".....TTTuTTt....",
    ".....TTTuTTt....",
    ".....TTTuTtt....",
    ".....tTTtttt....",
    ".....tttttu.....",
  ]),
};

// ── arms ───────────────────────────────────────────────────────────────────

const arms = (y: number, rows: readonly string[], z: number = Z.arms) => part(y, z, rows);

const ARMS_FRONT: Record<"rest" | "leftFwd" | "rightFwd" | "carry" | "sit", Part[]> = {
  rest: [arms(18, [
    "....V......v....",
    "...VV......vv...",
    "...Vv......vv...",
    "...FF......ff...",
    "...FF......ff...",
    "...SS......sk...",
  ])],
  // Screen-left arm swung toward the camera (hand lower), screen-right arm back (hand higher).
  leftFwd: [arms(18, [
    "....V......v....",
    "...VV......vv...",
    "...Vv......vv...",
    "...FF......ff...",
    "...FF......sk...",
    "...FF...........",
    "...SS...........",
  ])],
  rightFwd: [arms(18, [
    "....V......v....",
    "...VV......vv...",
    "...Vv......vv...",
    "...FF......ff...",
    "...SS......ff...",
    "...........ff...",
    "...........sk...",
  ])],
  carry: [arms(18, [
    "....V......v....",
    "...VV......vv...",
    "...Vv......vv...",
    "...FF......ff...",
  ])],
  sit: [arms(18, [
    "....V......v....",
    "...VV......vv...",
    "...Vv......vv...",
    "...VFF....ffv...",
    "....FSS..skf....",
  ])],
};

const ARMS_SIDE: Record<"rest" | "nearFwd" | "nearBack" | "carry" | "sit", Part[]> = {
  rest: [arms(18, [
    "......VV........",
    "......VV........",
    "......vv........",
    "......FF........",
    "......Ff........",
    "......Sk........",
  ])],
  nearFwd: [
    arms(18, [
      "......VV........",
      "......VVv.......",
      ".......Vv.......",
      ".......FFf......",
      "........FSk.....",
    ]),
    arms(20, [
      ".....v..........",
      "....ff..........",
      "...kf...........",
    ], Z.farArm),
  ],
  nearBack: [
    arms(18, [
      "......VV........",
      ".....VVv........",
      ".....Vv.........",
      "....FF..........",
      "...Sk...........",
    ]),
    arms(20, [
      "..........v.....",
      "..........ff....",
      "...........fk...",
    ], Z.farArm),
  ],
  carry: [arms(18, [
    "......VV........",
    "......VV........",
    "......VvFFf.....",
  ])],
  sit: [arms(18, [
    "......VV........",
    "......VV........",
    "......VvFFFSk...",
  ])],
};

export const ARMS: Piece = (pose) => {
  const { dir, arms: a, legs: l } = pose;
  if (dir === "down" || dir === "up") {
    if (a === "carry") return ARMS_FRONT.carry;
    if (a === "sit") return dir === "up" ? ARMS_FRONT.carry : ARMS_FRONT.sit;
    if (a === "rest") return ARMS_FRONT.rest;
    // Walking toward the camera, the arm opposite the forward leg swings toward us; walking away it is reversed.
    const leftLegFwd = l === "stepA";
    const leftArmFwd = dir === "down" ? !leftLegFwd : leftLegFwd;
    return leftArmFwd ? ARMS_FRONT.leftFwd : ARMS_FRONT.rightFwd;
  }
  const flip = (parts: Part[]) => parts; // the right-facing art; `left` is mirrored by the caller
  if (a === "carry") return flip(ARMS_SIDE.carry);
  if (a === "sit") return flip(ARMS_SIDE.sit);
  if (a === "rest") return flip(ARMS_SIDE.rest);
  // stepA: near leg forward, so the near arm swings back.
  return flip(l === "stepA" ? ARMS_SIDE.nearBack : ARMS_SIDE.nearFwd);
};

// ── legs ───────────────────────────────────────────────────────────────────

const LEGS_FRONT: Record<"stand" | "leftFwd" | "rightLift" | "rightFwd" | "leftLift" | "sit" | "sitBack", Part> = {
  stand: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....PPPpPp.....",
    ".....PP..Pp.....",
    ".....PP..Pp.....",
    ".....Pp..Pp.....",
    "....NNn..NNn....",
  ]),
  leftFwd: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....PPPpPp.....",
    ".....PP..Pp.....",
    ".....PP..Pp.....",
    ".....PP..NNn....",
    ".....Pp.........",
    "....NNn.........",
  ]),
  rightLift: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....PPPpPp.....",
    ".....PP..Pp.....",
    ".....PP..Pp.....",
    ".....Pp..NNn....",
    "....NNn.........",
  ]),
  rightFwd: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....PPPpPp.....",
    ".....PP..Pp.....",
    ".....PP..Pp.....",
    "....NNn..Pp.....",
    ".........Pp.....",
    ".........NNn....",
  ]),
  leftLift: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....PPPpPp.....",
    ".....PP..Pp.....",
    ".....PP..Pp.....",
    "....NNn..Pp.....",
    ".........NNn....",
  ]),
  sit: legs(20, [
    ".....PPPPPP.....",
    "....PPPPPPpp....",
    "....PPPppPPp....",
    "....pPp..Ppp....",
    ".....Pp..Pp.....",
    ".....Pp..Pp.....",
    ".....Pp..Pp.....",
    ".....Pp..Pp.....",
    ".....Pp..Pp.....",
    "....NNn..NNn....",
  ]),
  sitBack: legs(20, [
    ".....PPPPPP.....",
    "....PPPPPPPp....",
    "....pPPPPPpp....",
  ]),
};

const LEGS_SIDE: Record<LegPose, Part> = {
  stand: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    "......PPPp......",
    "......PPPp......",
    "......PPPp......",
    "......PPPp......",
    "......NNNNn.....",
  ]),
  stepA: legs(23, [
    ".....PPPPPP.....",
    ".....pPPPPP.....",
    ".....pPPPPP.....",
    "....pp..PPP.....",
    "....pp...PP.....",
    "...pp....PPP....",
    "...nn....PNNN...",
  ]),
  passA: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....pPPPp......",
    ".....ppPPp......",
    "....pp.PPp......",
    "....n..PPp......",
    ".......NNNNn....",
  ]),
  stepB: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    ".....PPPPpp.....",
    "....PPP..pp.....",
    "....PP...pp.....",
    "...PP....ppp....",
    "...NN....pnnn...",
  ]),
  passB: legs(23, [
    ".....PPPPPP.....",
    ".....PPPPPp.....",
    "......pPPPP.....",
    "......pPPPP.....",
    "......pPPP......",
    "......pPNNN.....",
    "......nnn.......",
  ]),
  sit: legs(20, [
    ".....PPPPPP.....",
    ".....PPPPPPPPP..",
    ".....ppppPPPPp..",
    "..........pPPp..",
    "..........pPPp..",
    "..........pPPp..",
    "..........pPPp..",
    "..........pPPp..",
    "..........pPPp..",
    "..........nNNNN.",
  ]),
};

export const LEGS: Piece = (pose) => {
  const { dir, legs: l } = pose;
  if (dir === "down" || dir === "up") {
    if (l === "sit") return [dir === "up" ? LEGS_FRONT.sitBack : LEGS_FRONT.sit];
    if (l === "stand") return [LEGS_FRONT.stand];
    // Toward the camera the forward foot is lower; walking away it is higher. Same art, swapped.
    const away = dir === "up";
    const map: Record<string, Part> = away
      ? { stepA: LEGS_FRONT.rightFwd, passA: LEGS_FRONT.leftLift, stepB: LEGS_FRONT.leftFwd, passB: LEGS_FRONT.rightLift }
      : { stepA: LEGS_FRONT.leftFwd, passA: LEGS_FRONT.rightLift, stepB: LEGS_FRONT.rightFwd, passB: LEGS_FRONT.leftLift };
    return [map[l]];
  }
  return [LEGS_SIDE[l]];
};

export const SIT_BODY = -3;

/** Helpers for pieces that only care about the coarse pose. */
export const isStep = (pose: Pose) => pose.legs === "stepA" || pose.legs === "stepB";
export const armsIn = (pose: Pose, ...poses: ArmPose[]) => poses.includes(pose.arms);
