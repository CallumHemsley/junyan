/**
 * The waiter: the player. Young, eager, slightly rumpled. A cowlick that never lies flat, a pencil
 * behind the right ear, sleeves rolled to the elbow, a jade apron with an order pad in the pocket
 * and a tea towel tucked in the waist, canvas shoes. Idle habit: glances aside.
 */
import { defineSprites } from "../../kit/index.ts";
import { defineCharacter, EAR_RIGHT, part, sided, sidedBy, Z, type Part, type Pose } from "./_rig.ts";
import { TRAY } from "./_tray.ts";

const h = (y: number, rows: readonly string[]) => part(y, Z.hair, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

const COWLICK = [
  "..................dh............",
  ".................hHd............",
  "................hHh.............",
  "................hHh..h..........",
];

const hair = sided({
  down: [h(4, [
    ...COWLICK,
    "...........hhhhhhHhhhhh.........",
    ".........hhhHHHHhhhhhhhh........",
    "........hhHHHHHHhhhhhhhhh.......",
    ".......hHHHhhhhhhhhhhhhhhd......",
    "......hHHhhhhhhhhhhhhhhhhdd.....",
    "......hHhhhhhhhdhhhhhhhhhdd.....",
    ".....hhhhhhhhhdhhhhhdhhhhddd....",
    ".....hhhhhhhhdhhhhhdhhhhhddd....",
    ".....hhhhhhhdhhhhhdhhhhhhddd....",
    ".....hhhhhhdhhhhhdhhhhhdhddd....",
    ".....hhhhhhhhshhhhhhshhhhhdd....",
    ".....hhhhhhhs.shhhhs.shhhhdd....",
    ".....hhhhhhs...shhs...shhhdd....",
    ".....hhhhds.....ss.....sdhdd....",
    ".....hhhs...............sdhd....",
    ".....hhs.................sdd....",
    "......s...................d.....",
  ])],
  up: [h(4, [
    ...COWLICK,
    "...........hhhhhhHhhhhh.........",
    ".........hhhHHHHhhhhhhhh........",
    "........hhHHHHHHhhhhhhhhh.......",
    ".......hHHHhhhhhhhhhhhhhhd......",
    "......hHHhhhhhhhhhhhhhhhhdd.....",
    "......hHhhhhhhhhhhhhhhhhhdd.....",
    ".....hhhhhhhhhhhhhhhhhhhhddd....",
    ".....hhhhhhhhhhhhhhhhhhhhddd....",
    ".....hhhhhhhhhdhhhhhhhhhhddd....",
    ".....hhhhhhhhdhhdhhhhhhhhddd....",
    ".....hhhhhhhhdhhhdhhhhhhhddd....",
    ".....hhhhhhhhhdhhhdhhhhhhddd....",
    ".....hhhhhhhhhhhhhhdhhhhhddd....",
    ".....dhhhhhhhhhhhhhhhhhhdddd....",
    ".....dhhhhhhhhhhhhhhhhhhdddd....",
    ".......hhhhhhhhhhhhhhhhhdd......",
    ".......dhhhhhhhhhhhhhhhddd......",
    ".......ddhhhhhhhhhhhhhdddd......",
    "........ddhhhhhhhhhhhdddd.......",
    ".........ddhdhhhdhhdhddd........",
    "..........d..d..d..d..d.........",
  ])],
  right: [h(4, [
    ".................dh.............",
    "................hHd.............",
    "...............hHh..............",
    "...............hHh..h...........",
    "..........hhhhhhHhhhh...........",
    "........hhhHHHHhhhhhhh..........",
    ".......hHHHHHhhhhhhhhhh.........",
    "......hHHhhhhhhhhhhhhhhh........",
    ".....hHHhhhhhhhhhhhhhhhhh.......",
    ".....hHhhhhhhhhhhhhhhhhhhh......",
    "....hhhhhhhhhhhhdhhhhhhhhhh.....",
    "....hhhhhhhhhhhdhhhhhhhhhhhh....",
    "....hhhhhhhhhhdhhhhhhdhhhhhh....",
    "....hhhhhhhhhdhhhhhhdhhhhhhhh...",
    "....hhhhhhhhhhhhhhhhhhhhshhh....",
    "....dhhhhhhhhhhhhhhhhhhs.shh....",
    "....dhhhhhhhhhhdhhhhhhs...sh....",
    "....ddhhhhhhhhhhhhhs......s.....",
    "....ddhhhhhhh....hhs............",
    "....ddhhhhhh.....hs.............",
    "....dddhhhhh.....h..............",
    ".....ddhhhhh....................",
    ".....ddhhhhh....................",
    "......ddhhhh....................",
    ".......ddhhh....................",
  ]), { ...EAR_RIGHT, z: Z.hair + 1 }],
});

/** Eager: brows up, a lopsided grin. Blinks on the breath; glances aside as a habit. */
const face = sidedBy({
  down: (pose: Pose): Part[] => {
    // Carrying: eyes on the tray, brows knitted, lips pressed in concentration.
    if (pose.arms === "carry") return [f(21, [
      "................................",
      ".........rrr........rrr.........",
      "...........r........r...........",
      "................................",
      "..........ee........ee..........",
      "..........we........we..........",
      ".......bb..............bb.......",
      ".......bb......mm......bb.......",
    ])];
    const glance = pose.beat === "habit", blink = pose.beat === "breath" && pose.action === "idle";
    const eyes = blink
      ? ["................................", "................................", "..........ee........ee.........."]
      : glance
        ? ["...........we........we.........", "...........ee........ee.........", "...........ee........ee........."]
        : ["..........we........we..........", "..........ee........ee..........", "..........ee........ee.........."];
    return [f(21, [
      ".........rr..........rr.........",
      "........r..r........r..rr.......",
      "................................",
      ...eyes,
      ".......bb..............bb.......",
      ".......bb.....m...mm...bb.......",
      "...............mmm..............",
    ])];
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    if (pose.arms === "carry") return [f(21, [
      "................................",
      "....................rrr.........",
      "......................r.........",
      "................................",
      ".....................ee.........",
      ".....................we.........",
      "..................bb............",
      "..................bb...mm.......",
    ])];
    const blink = pose.beat === "breath" && pose.action === "idle";
    const eye = blink
      ? ["......................", "......................", ".....................ee"]
      : [".....................we", ".....................ee", ".....................ee"];
    return [f(21, [
      "....................rrr.........",
      "...................r...r........",
      "................................",
      ...eye,
      "..................bb............",
      "..................bb..m.........",
      ".......................mm.......",
    ])];
  },
});

const PENCIL = { y: "gold4", g: "gold2", r: "red3", d: "wood3" } as const;
const pencil = sided({
  down: [part(19, Z.hat, ["..........................y.", "..........................y.", "...........................y", "...........................g"], { legend: PENCIL, group: "head" })],
  up: [part(19, Z.hat, ["....r.", "....y.", "....y.", ".....y"], { legend: PENCIL, group: "head" })],
  right: [],
  // Behind the left ear, so only the left profile shows it.
  left: [part(18, Z.hat, ["r..............", ".yy............", "..yy...........", "...yy..........", "....gd........."], { x: 14, legend: PENCIL, group: "head" })],
});

const POCKET = { Q: "jade2", w: "cream5", c: "cream3", y: "gold3", r: "red3", t: "cream4", T: "cream3", b: "blue4" } as const;
const apron = sided({
  down: [
    part(33, Z.clothes, [
      "................................",
      "...........a........a...........",
      "...........a........a...........",
      "...........aa......aa...........",
      ".........QAAAAAAAAAAAAa.........",
      ".........QAAAAAAAAAAAaa.........",
      ".........QAAAAAAAAAAAaa.........",
      ".........QAAAAAAAAAAAaa.........",
      ".........QAAAAAAAAAAAaa.........",
      ".........QAAAAAAAAAAAaa.........",
      ".........QAAAAAAAAAAAaa.........",
      ".........QAAAAAAAAAAAaa.........",
      "........QQQQQQQQQQQQQQQQ........",
      ".........QAAAaAAAAAAaaa.........",
      ".........QAAAaAAAAAaAaa.........",
      ".........QAAAAAAAAAaAaa.........",
      ".........QAAAAAAAAAAaaa.........",
      ".........QAaAAAAAAAAaaa.........",
      ".........QQQQQQQQQQQQQQ.........",
    ]),
    // The order pad and a pencil stub in the pocket; a tea towel tucked in the waist.
    part(40, Z.clothes + 1, [
      ".....................y..........",
      "..................www.r.........",
      "..................wcwy..........",
      ".................QQQQQQ.........",
      ".................QaaaaQ.........",
      ".................QaaaaQ.........",
      ".................QQQQQQ.........",
      ".......ttT......................",
      ".......ttT......................",
      ".......bbT......................",
      ".......ttT......................",
    ], { legend: { ...POCKET, a: "jade3" } }),
  ],
  up: [part(33, Z.clothes, [
    ".........a..........a...........",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "........QQQQQQQQQQQQQQQQ........",
    "........AA...aQQa.....aa........",
    "........AA..aa..aa....aa........",
    "........AA...a..a.....aa........",
    "........AA...a........aa........",
    "........AA............aa........",
    "........QQ............QQ........",
  ])],
  right: [
    part(33, Z.clothes, [
      "................................",
      "..................a.............",
      "..................a.............",
      "..................aa............",
      "...................AAA..........",
      "...................AAAa.........",
      "...................AAAa.........",
      "...................AAAa.........",
      "...................AAAa.........",
      "...................AAAa.........",
      "...................AAAa.........",
      "...................AAAa.........",
      "...........QQQQQQQQQQQQ.........",
      "..................AAAAa.........",
      "..................AAAAaa........",
      "..................AAAaaa........",
      "..................AAAaaa........",
      "..................AAaaaa........",
      "..................QQQQQQ........",
    ]),
    part(40, Z.clothes + 1, [
      "....................wy..........",
      "....................wc..........",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "...........ttT..................",
      "...........ttT..................",
      "...........bbT..................",
      "...........ttT..................",
    ], { legend: POCKET }),
  ],
});

export const PLAYER = {
  id: "player",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "hair1",
    T: "cream5", t: "cream4", u: "cream3", C: "white", c: "cream3",
    V: "cream5", v: "cream3", X: "cream3", x: "cream2", F: "skin4", f: "skin3",
    P: "blue2", p: "blue1", N: "stone4", n: "stone3", Y: "cream5", y: "cream3",
    H: "hair3", h: "hair2", d: "hair1",
    A: "jade4", a: "jade3", Q: "jade2",
  },
  hair,
  face,
  extras: [apron, pencil, TRAY],
} as const;

export default defineSprites({
  ...defineCharacter(PLAYER, ["idle", "walk", "carry-idle", "carry-walk"]),
});
