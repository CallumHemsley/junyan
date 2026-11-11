/**
 * 王医生, the ward doctor, about fifty, at the end of a night shift. Kind, unhurried, tired round
 * the eyes. Short black hair gone grey at the temples, thin steel rectangular glasses, bags under
 * the eyes. A white coat to the knee, a little crumpled, over a navy jumper and a pale blue shirt;
 * a stethoscope slung round his neck; a blue biro and a penlight in the breast pocket; grey
 * trousers, brown lace-ups. He carries the ward clipboard (blank sheets, ruled lines) at his side.
 * Habit: glances down at the clipboard.
 */
import { defineSprites } from "../../kit/index.ts";
import { heldOffset } from "./_held.ts";
import { EAR_RIGHT, defineCharacter, mirror, part, sided, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[]) => part(y, Z.hair, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });
const g = (y: number, rows: readonly string[]) => part(y, Z.glasses, rows, { group: "head" });

// ── hair: short, side-parted, swept right, grey at the temples ────────────

const hair = sided({
  down: [h(7, [
    "...........hhhhhhhhhh...........",
    ".........hhHHHHhhhhhhhh.........",
    "........hHHHHHHhhhhhhhhh........",
    ".......hHHHhhhhhhhhhhhhhd.......",
    "......hHHhhhhhhdhhhhhhhhdd......",
    "......hHhhhhhhdhhhhhhhhhdd......",
    ".....hhhhhhhhdhhhhhhhhhhddd.....",
    ".....hhhhhhhdhhhhhhhhhhhddd.....",
    ".....hhhhhhdhhhhhhhhhhhhddd.....",
    ".....hhhhhs.sshhhhhhhhhhddd.....",
    ".....hhhs.....sssshhhhhhddd.....",
    ".....hGs..........sshhhhGdd.....",
    ".....GG.............sshhGGd.....",
    ".....Gg................sGgd.....",
    ".....g...................g......",
  ])],
  up: [h(7, [
    "...........hhhhhhhhhh...........",
    ".........hhHHHHhhhhhhhh.........",
    "........hHHHHHHhhhhhhhhh........",
    ".......hHHHhhhhhhhhhhhhhd.......",
    "......hHHhhhhhhhhhhhhhhhdd......",
    "......hHhhhhhhhhhhhhhhhhdd......",
    ".....hhhhhhhhhhhhhhhhhhhddd.....",
    ".....hhhhhhhhhhhhhhhhhhhddd.....",
    ".....hhhhhhhhhhhhhhhhhhhddd.....",
    ".....hhhhhhhhhhhhhhhhhhhddd.....",
    ".....hhhhhhhhhhhhhhhhhhhddd.....",
    ".....hhhhhhhhhhhhhhhhhhhddd.....",
    ".....Ghhhhhhhhhhhhhhhhhhhdd.....",
    ".....GGhhhhhhhhhhhhhhhhhGdd.....",
    ".......Ghhhhhhhhhhhhhhhhgd......",
    "........dhhhhhhhhhhhhhhdd.......",
    "..........dddddddddddd..........",
  ])],
  right: [
    h(7, [
      "..........hhhhhhhhhh............",
      "........hhhHHHHHHhhhhh..........",
      ".......hHHHHHHHHhhhhhhh.........",
      "......hHHHHhhhhhhhhhhhhh........",
      ".....hHHhhhhhhhhhhhhhhhhh.......",
      ".....hHhhhhhhhhhhhhhhhhhhh......",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhhs.....",
      "....hhhhhhhhhhhhhhhhhhhhs.......",
      "....dhhhhhhhhhhhhhhhhss.........",
      "....dhhhhhhhhhGGhh..............",
      "....ddhhhhhhhhGG................",
      "....ddhhhhhhhGG.................",
      "....ddhhhhhhhG..................",
      ".....ddhhhhhh...................",
      ".....ddhhhhh....................",
      "......ddhhhh....................",
      ".......ddhh.....................",
    ]),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

// ── face: tired kind eyes behind steel frames ─────────────────────────────

const RIMS_DOWN = [
  "........OOOOOO....OOOOOO........",
  "....OOOOO....OOOOOO....OOOOO....",
  "........O....O....O....O........",
  "........O....O....O....O........",
  "........OOOOOO....OOOOOO........",
];
const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const down = pose.beat === "habit", blink = pose.beat === "breath" && pose.action === "idle";
    // Heavy lids: the top of each eye is a lid line, the pupil sits low. Glancing down, lids drop.
    const eyes = blink
      ? ["................................", "................................", "..........ee........ee.........."]
      : down
        ? ["................................", "..........rr........rr..........", "..........ee........ee.........."]
        : ["..........rr........rr..........", "..........we........we..........", "..........ee........ee.........."];
    return [
      f(20, [
        "...........rr......rr...........",
        "........rrr..........rrr........",
      ]),
      f(24, eyes),
      f(27, [
        "................................",
        ".........kkk........kkk.........",
        ".......bb..............bb.......",
        "...............mmm..............",
      ]),
      g(23, RIMS_DOWN),
    ];
  },
  up: () => [g(24, ["....OO....................OO...."])],
  right: (pose: Pose): Part[] => {
    const down = pose.beat === "habit", blink = pose.beat === "breath" && pose.action === "idle";
    const eye = blink
      ? ["......................", "......................", ".....................ee"]
      : down
        ? ["......................", ".....................r", ".....................ee"]
        : [".....................r", ".....................we", ".....................ee"];
    return [
      f(20, ["....................rrr.........", "...................r............"]),
      f(24, eye),
      f(27, ["................................", "....................kk..........", "..................bb............", ".......................mm......."]),
      g(23, [
        "..................OOOOOO........",
        "..............OOOOO....O........",
        "..................O....O........",
        "..................O....O........",
        "..................OOOOOO........",
      ]),
    ];
  },
});

// ── the coat: lapels over the jumper, stethoscope, breast pocket, folds ──

/**
 * The coat is white in the light and cools to steel in its folds and on the shadow side (lower
 * right), so it stays clearly white without going flat.
 */
const COAT = {
  L: "steel4", l: "steel5", T: "white", t: "steel6", u: "steel5",
  K: "blue5", J: "blue2", j: "blue1", i: "ink2", M: "steel5", m: "steel3", b: "blue3", c: "steel4",
} as const;
const COAT_FRONT = part(33, Z.clothes, [
  "..........LKK......KKL..........",
  "..........iLKJ....JKLi..........",
  "..........iLlJJ..JJlLi..........",
  "..........i.LlJJJjlL.it.........",
  "..........i..LlJjlL.bMi.........",
  "..........i...LllL..bMt.........",
  "..........it....Lt.LLLLL........",
  ".........mMm....Lt.lTTTu........",
  ".........MMm....ct.luuuu........",
  "..........mt....Lt..............",
  "...........t....Lt...t..........",
  "...........t....ct...t..........",
  "...........u....Lt...u..........",
], { legend: COAT });
const COAT_SIDE = part(33, Z.clothes, [
  "...............LKKK.............",
  "...............iLKJJ............",
  "...............i.LJJi...........",
  "...............i..LJit..........",
  "..............mMm.L..t..........",
  "..............MMm.L..t..........",
  "...............m..c..t..........",
  "...........t.........t..........",
  "...........t.........u..........",
  "...........t.........u..........",
  "...........u.........u..........",
  "................................",
  "...........LLLLLLL..............",
], { legend: COAT });
/** From behind: two folds down from the shoulder blades and a half-belt across the small of the back. */
const COAT_BACK = part(33, Z.clothes, [
  "...........iiiiiiiiii...........",
  "................................",
  "................................",
  "...........t........t...........",
  "...........t........t...........",
  "...........t........u...........",
  "...........t........u...........",
  "............t......u............",
  "............u......u............",
  "................................",
  "........LLLLLLLLLLLLLLLL........",
  "........ttMtttttttttMtuu........",
], { legend: COAT });

/**
 * The coat skirt over the trousers, open at the front, two folds running on from the chest, pocket
 * flaps that cast a line of shadow. Walking, the lower skirt swings a pixel and the hem two.
 */
const SKIRT_FRONT = [
  "........TTTtTTTTtTTTTTtt........",
  "........TTTtTTTTtTTTTutt........",
  "........TLLLLTTTtTLLLLtt........",
  "........TlllTTTt.tTlllut........",
  "........TTTtTTTt..tTTutt........",
  ".......TTTTtTTTt..tTTTuut.......",
  ".......TTTTuTTt....tTTtut.......",
  ".......TTTtTTTt....tTTTuut......",
  ".......uuuuuuuu....uuuuuuu......",
];
const SKIRT_BACK = [
  "........TTTtTTTTTTTTTTtt........",
  "........TTTtTTTTTTTTTutt........",
  "........TTTtTTTTTTTTTutt........",
  "........TTTtTTTtLTTTTtut........",
  "........TTTtTTTtLTTTTutt........",
  ".......TTTTtTTTtLTTTTuut........",
  ".......TTTTuTTTtLtTTTtut........",
  ".......TTTtTTTtl.ltTTTuut.......",
  ".......uuuuuuuu...uuuuuuu.......",
];
const SKIRT_SIDE = [
  "...........TTTTTTTTTTt..........",
  "...........TTTtTTTTTtt..........",
  "...........TLLLLTTTTut..........",
  "...........TlllTTTTTut..........",
  "..........TTTTtTTTTTtt..........",
  "..........TTTTtTTTTTtuu.........",
  "..........TTTTuTTTTTtut.........",
  ".........TTTTTuTTTTTtuu.........",
  ".........uuuuuuuuuuuuuu.........",
];
const swing = (rows: readonly string[], sway: number) => rows.map((r, i) => shiftRow(r, i < 3 ? 0 : i < 7 ? sway : 2 * sway));
const skirt: Piece = (pose) => {
  const sway = pose.legs === "stepA" ? -1 : pose.legs === "stepB" ? 1 : 0;
  if (pose.dir === "down") return [part(46, Z.skirt, swing(SKIRT_FRONT, sway), { group: "legs", legend: COAT })];
  if (pose.dir === "up") return [part(46, Z.skirt, swing(SKIRT_BACK, -sway), { group: "legs", legend: COAT })];
  const p = part(46, Z.skirt, swing(SKIRT_SIDE, -sway), { group: "legs", legend: COAT });
  return [pose.dir === "left" ? mirror(p) : p];
};
const shiftRow = (row: string, dx: number): string => (dx > 0 ? shiftRow("." + row.slice(0, -1), dx - 1) : dx < 0 ? shiftRow(row.slice(1) + ".", dx + 1) : row);

const coat: Piece = (pose) => {
  if (pose.dir === "down") return [COAT_FRONT];
  if (pose.dir === "up") return [COAT_BACK];
  return [pose.dir === "left" ? mirror(COAT_SIDE) : COAT_SIDE];
};

// ── the clipboard ──────────────────────────────────────────────────────────

const BOARD = { B: "wood4", b: "wood2", W: "cream5", w: "cream4", l: "stone3", M: "steel5", m: "steel3", S: "skin4", k: "skin2" } as const;
const BOARD_FACE = [
  "..mMm..",
  "BBmMmBb",
  "BWWWWWb",
  "BWllWWb",
  "BWWWWWb",
  "BWlllwb",
  "BWWWWWb",
  "BWllWwb",
  "BWwwwwb",
  "BBBBBBb",
  ".bbbbb.",
];
const BOARD_BACK = BOARD_FACE.map((r) => r.replace(/[Wwl]/g, "B"));
const clipboard: Piece = (pose) => {
  const [dx, dy] = heldOffset(pose);
  if (pose.dir === "down") return [
    part(41 + dy, Z.hands, BOARD_FACE, { x: 22 + dx, legend: BOARD }),
    part(44 + dy, Z.hands + 1, ["SS", "Sk"], { x: 22 + dx, legend: BOARD }),
  ];
  if (pose.dir === "up") return [part(41 + dy, Z.hands, BOARD_BACK, { x: 3 + dx, legend: BOARD })];
  const parts = [
    part(41 + dy, Z.hands, BOARD_FACE, { x: 10 + dx, legend: BOARD }),
    part(44 + dy, Z.hands + 1, ["SSk"], { x: 11 + dx, legend: BOARD }),
  ];
  return pose.dir === "left" ? parts.map(mirror) : parts;
};

export const DOCTOR = {
  id: "doctor",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "hair1",
    T: "white", t: "steel6", u: "steel5", C: "white", c: "steel5",
    V: "white", v: "steel6", X: "steel5", x: "steel4", F: "white", f: "steel6",
    P: "stone2", p: "stone1", N: "wood3", n: "wood2", Y: "wood1", y: "wood1",
    H: "hair3", h: "hair2", d: "hair1", G: "grey2", g: "grey1", O: "steel2",
  },
  hair,
  face,
  extras: [coat, skirt, clipboard],
  walkFps: 6,
} as const;


export default defineSprites({
  ...defineCharacter(DOCTOR, ["idle", "walk"]),
});
