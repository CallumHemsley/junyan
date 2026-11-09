/**
 * Profile body (facing right; `left` is mirrored). Ruler 0123456789abcdef0123456789abcdef.
 * The near arm hangs over the torso, the far arm peeks out when it swings. The near leg is the
 * lighter one; legs alternate tone so the stride reads.
 */
import { part, Z, type Part, type Piece } from "./_core.ts";

const arms = (y: number, rows: readonly string[], z: number = Z.arms) => part(y, z, rows);
const legs = (y: number, rows: readonly string[]) => part(y, Z.legs, rows, { group: "legs" });

const NEAR = {
  rest: arms(34, [
    "............VVVV................",
    "...........VVVVVv...............",
    "...........VVVVVv...............",
    "...........VVVVvvu..............",
    "...........VVVVvvu..............",
    "...........VVVVvvu..............",
    "...........XXXXxxu..............",
    "...........FFFFf................",
    "...........FFFFf................",
    "...........SSSSk................",
    "...........SSSSk................",
    "...........sSSkk................",
    "............sss.................",
  ]),
  fwd: arms(34, [
    "............VVVV................",
    "...........VVVVVv...............",
    "............VVVVVv..............",
    "............VVVVvvu.............",
    ".............VVVVvv.............",
    ".............VVVvvv.............",
    "..............XXXxxx............",
    "...............FFFFf............",
    "...............FFFFf............",
    "................SSSSk...........",
    "................SSSSk...........",
    ".................sSkk...........",
  ]),
  back: arms(34, [
    "............VVVV................",
    "...........VVVVVv...............",
    "..........VVVVVv................",
    "..........VVVVvvu...............",
    ".........VVVVvv.................",
    ".........VVVvvv.................",
    "........XXXXxx..................",
    ".......FFFFf....................",
    ".......FFFf.....................",
    "......SSSSk.....................",
    "......sSSkk.....................",
    ".......sk.......................",
  ]),
  carry: arms(34, [
    "............VVVV................",
    "...........VVVVVv...............",
    "...........VVVVVv...............",
    "...........VVVVvvu..............",
    "...........VVVVvvu..............",
    "...........VVVVvvu..............",
    "...........XXXXxxFFFFFf.........",
    "............FFFFFFFFFFf.........",
  ]),
  sit: arms(34, [
    "............VVVV................",
    "...........VVVVVv...............",
    "...........VVVVVv...............",
    "...........VVVVvvu..............",
    "...........VVVVvvu..............",
    "...........VVVVvvu..............",
    "...........XXXXxxFFFFFSS........",
    "............FFFFFFFFFSSSk.......",
    "......................ssk.......",
  ]),
};

/** The far arm, behind the torso: its hand shows in front of the chest or behind the back. */
const FAR = {
  fwd: arms(39, [
    ".....................vv.........",
    ".....................xx.........",
    "......................ff........",
    "......................fkk.......",
    ".......................kk.......",
  ], Z.farArm),
  back: arms(39, [
    "..........vv....................",
    ".........xx.....................",
    "........ff......................",
    ".......kfk......................",
    ".......kk.......................",
  ], Z.farArm),
};

export const SIDE_ARMS: Piece = (pose): Part[] => {
  if (pose.arms === "carry") return [NEAR.carry];
  if (pose.arms === "sit") return [NEAR.sit];
  if (pose.arms === "rest") return [NEAR.rest];
  // stepA leads with the near leg, so the near arm swings back and the far arm forward.
  return pose.legs === "stepA" ? [NEAR.back, FAR.fwd] : [NEAR.fwd, FAR.back];
};

const LEGS = {
  stand: legs(46, [
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPp...........",
    "............PPPPPPPPp...........",
    "............pPPPPPPp............",
    ".............pPPPPPp............",
    ".............pPPPPPp............",
    ".............pPPPpPp............",
    ".............pPPPpPp............",
    ".............pPPPPPp............",
    ".............ppppppp............",
    "............NNNNNNNNN...........",
    "............NNNNNNNNNNn.........",
    "............YYYYYYYYYYY.........",
  ]),
  stepA: legs(46, [
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPP..........",
    "...........pPPPPPPPPPP..........",
    "..........ppPPPPPPPPPPP.........",
    "..........ppp.PPPPPPPPP.........",
    ".........ppp...PPPPPPP..........",
    ".........ppp...PPPPPPPP.........",
    "........ppp.....PPPpPPP.........",
    "........ppp.....PPPpPPP.........",
    ".......ppp.......PPPPPP.........",
    ".......ppp.......pppppp.........",
    "......nnnn......NNNNNNNNN.......",
    ".....nnnnn......NNNNNNNNNNN.....",
    ".....yyyy.......YYYYYYYYYYY.....",
  ]),
  passA: legs(46, [
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........pPPPPPPPPp...........",
    "...........ppPPPPPPPp...........",
    "...........pppPPPPPPp...........",
    "..........ppp.PPPPPPp...........",
    "..........pp..PPPPPPp...........",
    ".........ppp..PPPpPPp...........",
    ".........pp...PPPpPPp...........",
    "........nnn...PPPPPPp...........",
    "........nnn...ppppppp...........",
    ".............NNNNNNNNN..........",
    ".............NNNNNNNNNNn........",
    ".............YYYYYYYYYYY........",
  ]),
  stepB: legs(46, [
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "..........PPPPPPPPPPpp..........",
    "..........PPPPPPPPPppp..........",
    "..........PPPPPP.ppppp..........",
    ".........PPPPPP...pppp..........",
    ".........PPpPP....ppppp.........",
    "........PPPpPP.....pppp.........",
    "........PPPPP......pppp.........",
    ".......PPPPPP......ppppp........",
    ".......pppppp......ppppp........",
    "......NNNNNNN.....nnnnnnnn......",
    ".....NNNNNNN......nnnnnnnnnn....",
    ".....YYYYYY.......yyyyyyyyyy....",
  ]),
  passB: legs(46, [
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........PPPPPPPPPPp..........",
    "...........pPPPPPPPPPP..........",
    "...........ppPPPPPPPPP..........",
    "...........ppPPPPPPPP...........",
    "...........ppPPPpPPP............",
    "...........pppPPpPPP............",
    "...........pppNNNNNNN...........",
    "...........ppNNNNNNNNN..........",
    "...........nnYYYYYYYY...........",
    "...........nnnnnnnnnn...........",
    "...........yyyyyyyyyy...........",
  ]),
  sit: legs(40, [
    "...........PPPPPPPPPP...........",
    "...........PPPPPPPPPPPPPP.......",
    "...........PPPPPPPPPPPPPPP......",
    "...........PPPPPPPPPPPPPPP......",
    "...........pPPPPPPPPPPPPPP......",
    "............ppppppppPPPPPp......",
    "...................pPPPPp.......",
    "...................pPPPPp.......",
    "..................pPPPPp........",
    "..................pPpPPp........",
    "..................pPpPPp........",
    "..................pPPPPp........",
    ".................pPPPPp.........",
    ".................pPPPPp.........",
    ".................ppppp..........",
    "................NNNNNNNN........",
    "................NNNNNNNNNn......",
    "................YYYYYYYYYY......",
  ]),
};

export const SIDE_LEGS: Piece = (pose) => [LEGS[pose.legs]];
