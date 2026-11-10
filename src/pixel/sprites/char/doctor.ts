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

// ── the coat: lapels over the jumper, stethoscope, breast pocket ──────────

const COAT = {
  L: "cream3", l: "cream4", K: "blue5", J: "blue2", j: "blue1", i: "ink2", M: "steel5", m: "steel3",
  b: "blue3", T: "white", c: "cream2",
} as const;
const COAT_FRONT = part(33, Z.clothes, [
  "..........LKK......KKL..........",
  "..........iLKJ....JKLi..........",
  "..........iLlJJ..JJlLi..........",
  "..........i.LlJJJjlL.i..........",
  "..........i..LlJjlL.bMi.........",
  "..........i...LllL..bM..........",
  "..........i.....L..LLLLL........",
  ".........mMm....L..lTTTl........",
  ".........MMm....c..lTTTl........",
  "..........m.....L...lll.........",
  "................L...............",
  "................c...............",
  "................L...............",
], { legend: COAT });
const COAT_SIDE = part(33, Z.clothes, [
  "...............LKKK.............",
  "...............iLKJJ............",
  "...............i.LJJi...........",
  "...............i..LJi...........",
  "..............mMm.L.............",
  "..............MMm.L.............",
  "...............m..c.............",
], { legend: COAT });
/** From behind: a half-belt with two buttons across the small of the back. */
const COAT_BACK = part(33, Z.clothes, [
  "...........iiiiiiiiii...........",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "........LLLLLLLLLLLLLLLL........",
  "........llLlllllllllLlll........",
], { legend: COAT });

/** The coat skirt over the trousers, open at the front, swinging a pixel with the stride. */
const skirt: Piece = (pose) => {
  const sway = pose.legs === "stepA" ? -1 : pose.legs === "stepB" ? 1 : 0;
  if (pose.dir === "down" || pose.dir === "up") {
    const open = pose.dir === "down";
    return [part(46, Z.skirt, [
      "........TTTTTTTTTTTTTTTt........",
      "........TTTTTTTttTTTTTTt........",
      "........TTTTTTTttTTTTTtt........",
      "........TTuuuuTttTuuuutt........",
      open ? "........TTTTTTt..tTTTTtt........" : "........TTTTTTTttTTTTTtt........",
      open ? ".......TTTtTTTt..tTTTTutt......." : ".......TTTtTTTttTTTTTutt.......",
      open ? ".......TTTtTTTt..tTTTTutt......." : ".......TTTtTTTt.tTTTTutt.......",
      open ? ".......TTtTTTt....tTTTutt......." : ".......TTtTTTTt.tTTTuttt.......",
      open ? ".......uuuuuuu....uuuuuuu......." : ".......uuuuuuuu.uuuuuuuu.......",
    ].map((r) => shiftRow(r, sway)), { group: "legs" })];
  }
  const rows = [
    "...........TTTTTTTTTTt..........",
    "...........TTTTTTTTTTt..........",
    "...........TTTTTTTTTtt..........",
    "...........TTTuuuuTTtt..........",
    "..........TTTTTTTTTTtt..........",
    "..........TTTTTTTTTTttt.........",
    "..........TTTTTTTTTTttt.........",
    ".........TTTTTTTTTTTttt.........",
    ".........uuuuuuuuuuuuuu.........",
  ].map((r) => shiftRow(r, -sway));
  const p = part(46, Z.skirt, rows, { group: "legs" });
  return [pose.dir === "left" ? mirror(p) : p];
};
const shiftRow = (row: string, dx: number) => (dx > 0 ? "." + row.slice(0, -1) : dx < 0 ? row.slice(1) + "." : row);

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
    T: "white", t: "cream4", u: "cream3", C: "white", c: "cream3",
    V: "white", v: "cream4", X: "cream3", x: "cream2", F: "white", f: "cream4",
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
