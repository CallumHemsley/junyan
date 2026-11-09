/**
 * 林姐, the neighbour from upstairs, forties. Unhurried and warm. Hair up in a bun with the jade
 * pin her mother gave her, a soft sage cardigan (one button done up, pockets stretched by keys)
 * over a cream blouse, a long plum-brown skirt, flat shoes. A cloth market bag on her arm with
 * scallions poking out. Habit: tucks a loose strand behind her ear. Seated: both hands round a
 * warm bowl of soy milk.
 */
import { defineSprites } from "../../kit/index.ts";
import { EAR_RIGHT, RIG, defineCharacter, mirror, part, sided, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[], z: number = Z.hair) => part(y, z, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

// ── hair: parted in the middle, swept back to a high bun, one strand always escaping ──

const hair = sided({
  down: [h(1, [
    "..............hhhhh.............",
    "............hhHHHhhhd...........",
    "...........hHHHhhhhhdd...JI.....",
    "...........hHhhhhhhhdd..J.......",
    "...........hhhhhhhhhddJ.........",
    "............dhhhhhhddJ..........",
    ".............ddddddd............",
    "..........hhhhhhhhhhhh..........",
    ".........hhHHHHHdhHHhhhh........",
    "........hHHHHHhhdhhHHhhhh.......",
    ".......hHHHhhhhhdhhhhhhhhd......",
    "......hHHhhhhhhhdhhhhhhhhdd.....",
    "......hHhhhhhhhhdhhhhhhhhdd.....",
    ".....hhhhhhhhhhhdhhhhhhhhddd....",
    ".....hhhhhhhhhhdddhhhhhhhddd....",
    ".....hhhhhhhhhds.sdhhhhhhddd....",
    ".....hhhhhhhhds...sdhhhhhddd....",
    ".....hhhhhhdss.....ssdhhhddd....",
    ".....hhhhhds.........sdhhddd....",
    ".....hhhhds...........sdhddd....",
    ".....hhhds.............sdddd....",
    ".....hhds...............sddd....",
    "....hhhd.................ddd....",
    "....hhd...................dd....",
    ".....hd...................d.....",
    ".....hd.........................",
    "......h.........................",
    "......d.........................",
  ])],
  up: [
    h(8, [
      "...........hhhhhhhhhh...........",
      ".........hhhHHHHhhhhhhh.........",
      "........hhHHHHHHhhhhhhhh........",
      ".......hHHHhhhhhhhhhhhhhd.......",
      "......hHHhhhhdhhhhdhhhhhdd......",
      "......hHhhhhdhhhhhhdhhhhdd......",
      ".....hhhhhhdhhhhhhhhdhhhddd.....",
      ".....hhhhhdhhhhhhhhhhdhhddd.....",
      ".....hhhhhhdhhhhhhhhdhhhddd.....",
      ".....hhhhhhhdhhhhhhdhhhhddd.....",
      ".....hhhhhhhhdhhhhdhhhhhddd.....",
      ".....dhhhhhhhhdhhdhhhhhdddd.....",
      ".....dhhhhhhhhhddhhhhhhdddd.....",
      ".......hhhhhhhhhhhhhhhhhdd......",
      ".......dhhhhhhhhhhhhhhhddd......",
      ".......ddhhhhhhhhhhhhhdddd......",
      "........ddhhhhhhhhhhhdddd.......",
      ".........dddhhhhhhhhddd.........",
      "............d.......d...........",
    ]),
    // The bun, ringed in shadow, with the jade pin through it.
    h(9, [
      "............dddddd..............",
      "...........dhHHhhhd.............",
      "..........dhHHhhhhhd............",
      "..........dhHhhhhhhd....JI......",
      "..........dhhhhhhhhd...J........",
      "..........dhhhhhhhdd..J.........",
      "...........dhhhhhddJJ...........",
      "............ddddd...............",
    ], Z.hair + 1),
  ],
  right: [
    h(5, [
      "...hhhh.........................",
      "..hHHhhhd.......................",
      ".hHHhhhhdd.hhhhhhhhh............",
      ".hHhhhhhhdhhhHHHHHhhhh..........",
      ".hhhhhhhhdhHHHHhhhhhhhh.........",
      ".dhhhhhhdhHHhhhhhhhhhhhh........",
      "..dhhhhdhHHhhhhhhhhhhhhhh.......",
      "...dddhhHHhhhhhhhhhhhhhhhh......",
      "....hhhHhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhhhh....",
      "....hhhhhhhhhhhhhhhhhhhhhhhs....",
      "....dhhhhhhhhhhhhhhhhhhhhhs.....",
      "....dhhhhhhhhhhhhhhhhhhhs.......",
      "....dhhhhhhhhhhhhhhhhhs.........",
      "....ddhhhhhhhhh..hhh............",
      "....ddhhhhhhhh....hs............",
      "....dddhhhhhhh....h.............",
      ".....ddhhhhhh.....h.............",
      ".....ddhhhhh......h.............",
      "......ddhhhh....................",
      ".......ddhh.....................",
      "........dd......................",
    ]),
    part(5, Z.hair + 1, [".....JI", "....J..", "...J...", "..J...."], { group: "head" }),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

/** Warm: soft arched brows, a lash at each outer corner, a closed gentle smile, jade studs. */
const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath" && pose.action !== "sit";
    const eyes = blink
      ? ["................................", ".........r..........r...........", "..........ee........ee.........."]
      : [".........ewe........wee.........", "..........ee........ee..........", "..........ee........ee.........."];
    return [f(21, [
      ".........rrr........rrr.........",
      "........r..............r........",
      "................................",
      ...eyes,
      ".....J.bbb............bbb.J.....",
      ".......bb.....m..m.....bb.......",
      "..............mmmm..............",
    ])];
  },
  up: () => [part(26, Z.face, [".....J....................J....."], { group: "head" })],
  right: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath" && pose.action !== "sit";
    const eye = blink
      ? ["......................", "....................r.", ".....................ee"]
      : ["......................", ".....................we", ".....................ee"];
    return [f(21, [
      "....................rrr.........",
      "...................r............",
      ...eye,
      ".....................ee.........",
      "................J..bbb..........",
      "...................bb..m........",
      ".......................mm.......",
    ])];
  },
});

// ── clothes ────────────────────────────────────────────────────────────────

/** The cardigan: open over the blouse, one button done up, pockets, a hem that flares past the hips. */
const cardigan = sided({
  down: [part(34, Z.clothes, [
    "......AAAA............aaaa......",
    ".....AAAAAA..........aaaaaa.....",
    ".....AAAAAAA........Aaaaaaa.....",
    ".....AAAAAAAA......AAaaaaaa.....",
    "........AAAAA......AAaaa........",
    "........AAAAAG....GAaaaa........",
    "........AAAAAAQ..QAAaaaa........",
    "........AAAAAAAQQAAAaaaa........",
    "........AAAAAAAGgAAAaaaa........",
    "........AAAAAAAQQAAaaaaa........",
    "........AAAAAAQ..QAaaaaa........",
    "........QQQQQAQ..QaQQQQa........",
    ".......AAQaaQAQ..QaQaaQaa.......",
    ".......AAQQQQAQ..QaQQQQaa.......",
    ".......AAAAAAAQ..QaaaaaaQ.......",
    ".......QQQQQQQQ..QQQQQQQQ.......",
  ])],
  up: [part(34, Z.clothes, [
    "......AAAA............aaaa......",
    ".....AAAAAAAAAAAAAAAAAaaaaa.....",
    ".....AAAAAAAAAAAAAAAAAaaaaa.....",
    ".....AAAAAAAAAAAAAAAAaaaaaa.....",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAQAAAAAAaaaa........",
    "........AAAAAQAAAAAAaaaa........",
    "........AAAAAAAAAAAaaaaa........",
    "........AAAAAAAAAAAaaaaa........",
    "........AAAAAAAAAQAaaaaa........",
    "........AAAAAAAAAQAaaaaa........",
    ".......AAAAAAAAAAAAaaaaaa.......",
    ".......AAAAAAAAAAAAaaaaaa.......",
    ".......AAAAAAAAAAAAaaaaaa.......",
    ".......QQQQQQQQQQQQQQQQQQ.......",
  ])],
  right: [part(34, Z.clothes, [
    "...........AAAAA................",
    "..........AAAAAAAA..............",
    "..........AAAAAAAAAa............",
    "..........AAAAAAAAAaG...........",
    "..........AAAAAAAAAaQ...........",
    "..........AAAAAAAAAaQ...........",
    "..........AAAAAAAAAaG...........",
    "..........AAAAAAAAAaQ...........",
    "..........AAAAAAAAAaQ...........",
    "..........AAAAAAAAAaQ...........",
    "..........AAAAAAAAAaQ...........",
    "..........QQQQQQQQQaQ...........",
    ".........AAAAAQaaQAaQ...........",
    ".........AAAAAQQQQAaQ...........",
    ".........AAAAAAAAAAaaQ..........",
    ".........QQQQQQQQQQQQQ..........",
  ])],
});

/** The long skirt, A-line, with a fold that swings with the stride. */
const skirt: Piece = (pose) => {
  if (pose.legs === "sit") {
    return pose.dir === "up" ? [] : pose.dir === "down"
      ? [part(40, Z.skirt, [
        ".......DDDDDDDDDDDDDDDDEE.......",
        ".......DDDDDDDDDDDDDDDEEE.......",
        "......DDDDDDDDDDDDDDDDEEEE......",
        "......DDDDDDDEEDDDDDDDEEEE......",
        "......DDDDDDEEEEDDDDDDEEEE......",
        "......DDDDDDEEEEDDDDDEEEEE......",
        "......DDDDDEEEEEEDDDDEEEEB......",
        "......DDDDDEEBBEEDDDDEEEBB......",
        "......BBBBBBBBBBBBBBBBBBBB......",
      ], { group: "legs" })]
      : side(part(40, Z.skirt, [
        "..........DDDDDDDDDDD...........",
        "..........DDDDDDDDDDDDDDD.......",
        "..........DDDDDDDDDDDDDDDD......",
        "..........DDDDDDDDDDDDDDDDE.....",
        "..........EEEEEEEEEEDDDDDDE.....",
        "...................DDDDDEEB.....",
        "...................DDDDDEEB.....",
        "..................DDDDDEEEB.....",
        "..................BBBBBBBBB.....",
      ], { group: "legs" }), pose);
  }
  const stride = pose.legs === "stepA" ? 1 : pose.legs === "stepB" ? -1 : 0;
  if (pose.dir === "down" || pose.dir === "up") {
    const hem = stride === 0
      ? ["......DDDDDDDDDDEDDDDDDEEE......", "......BBBBBBBBBBBBBBBBBBBB......"]
      : stride > 0
        ? [".....DDDDDDDDDDDEDDDDDDEEE......", ".....BBBBBBBBBBBBBBBBBBBBB......"]
        : ["......DDDDDDDDDDEDDDDDDEEEE.....", "......BBBBBBBBBBBBBBBBBBBBB....."];
    return [part(46, Z.skirt, [
      "........DDDDDDDDDDDDDDEE........",
      "........DDDDDDDDDDDDDDEE........",
      ".......DDDDDDDDEDDDDDDEEE.......",
      ".......DDDDDDDEEDDDDDDEEE.......",
      ".......DDDDDDDEDDDDDDDEEE.......",
      "......DDDDDDDEEDDDDDDDEEEE......",
      "......DDDDDDDEDDDDDDDEEEEE......",
      "......DDDDDDEEDDDDDDDEEEEE......",
      ...hem,
    ], { group: "legs" })];
  }
  const hem = stride === 0
    ? ["........DDDDDDDDDDDDDDEE........", "........BBBBBBBBBBBBBBBB........"]
    : stride > 0
      ? [".......DDDDDDDDDDDDDDDDDEE......", ".......BBBBBBBBBBBBBBBBBBB......"]
      : [".....DDDDDDDDDDDDDDDDDEE........", ".....BBBBBBBBBBBBBBBBBBB........"];
  return side(part(46, Z.skirt, [
    "...........DDDDDDDDDDE..........",
    "...........DDDDDDDDDDE..........",
    "..........DDDDDDDDDDDEE.........",
    "..........DDDDDEDDDDDEE.........",
    "..........DDDDDEDDDDDEE.........",
    ".........DDDDDEEDDDDDDEE........",
    ".........DDDDDEDDDDDDDEE........",
    "........DDDDDEEDDDDDDDEEE.......",
    ...hem,
  ], { group: "legs" }), pose);
};
const side = (p: Part, pose: Pose): Part[] => [pose.dir === "left" ? mirror(p) : p];

// ── the market bag: cloth, blue-striped, scallions poking out ──────────────

const BAG = { w: "cream4", W: "cream5", c: "cream2", b: "blue3", B: "blue2", g: "leaf3", G: "leaf4", l: "leaf5", n: "cream5", s: "skin3" } as const;
const BAG_ROWS = [
  "..l.G.......",
  "..G.gG......",
  "..Gg.g......",
  ".nnGgg......",
  "WWwnnwwc....",
  "WWwwwwwc....",
  "bbBbbbbB....",
  "WWwwwwwc....",
  "WWwwwwwc....",
  "bbBbbbbB....",
  "WWwwwwwc....",
  ".Wwwwwc.....",
];
const bagAt = (x: number, y: number, z: number): Part => part(y, z, BAG_ROWS, { x, legend: BAG });
const bag: Piece = (pose) => {
  if (pose.legs === "sit") return [];
  if (pose.dir === "down") return [bagAt(0, 40, Z.hands), part(37, Z.hands, ["...ww", "..w..", ".w...", "w...."], { x: 3, legend: BAG })];
  if (pose.dir === "up") return [bagAt(20, 40, Z.behind + 1)];
  if (pose.dir === "right") return [bagAt(7, 41, Z.hands)];
  return [{ ...mirror(bagAt(7, 41, Z.farArm - 1)) }];
};

// ── habits ─────────────────────────────────────────────────────────────────

/** Standing habit: the free hand goes up to tuck the strand behind her ear. */
const TUCK = [
  part(29, Z.arms, [
    "........................vv......",
    "........................vvv.....",
    "........................vvvv....",
    ".........................vvv....",
    ".........................vvv....",
    "........................vvvv....",
    "......................vvvvv.....",
    "......................vvvv......",
  ]),
  part(24, Z.hands, ["........................ss......", ".......................ssk......", "........................sk......"], { group: "head" }),
];

/** Seated: both hands round a warm bowl held at the chest. */
const BOWL = { w: "white", q: "steel5", u: "blue3", U: "blue2", m: "cream4", M: "cream5", S: "skin4", s: "skin3", k: "skin2" } as const;
const BOWL_DOWN = part(39, Z.hands, [
  "...........wwwwwwwww............",
  "..........wMMMMmmmmqw...........",
  ".........SSmmmmmmmmSSk..........",
  ".........SSwwuuwuuqSSk..........",
  "..........sSwUwwUwqSk...........",
  "............qqqqqq..............",
], { legend: BOWL });
const BOWL_SIDE = part(39, Z.hands, [
  "....................wwwww.......",
  "...................wMMmmqw......",
  "...................SSuuwSSk.....",
  "...................sSwUwqk......",
  ".....................qqq........",
], { legend: BOWL });

const arms: Piece = (pose) => {
  const base = RIG.arms(pose);
  if (pose.action === "idle" && pose.beat === "habit" && pose.dir === "down") return [base[0], ...TUCK];
  return base;
};
const extrasSit: Piece = (pose) => {
  if (pose.action !== "sit" || pose.dir === "up") return [];
  return pose.dir === "down" ? [BOWL_DOWN] : side(BOWL_SIDE, pose);
};

export const LIN_JIE = {
  id: "lin-jie",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "brown1",
    T: "cream5", t: "cream4", u: "cream3", C: "white", c: "cream3",
    V: "jade5", v: "jade4", X: "jade3", x: "jade2", F: "jade5", f: "jade4",
    A: "jade5", a: "jade4", Q: "jade3", G: "wood5", g: "wood3",
    P: "stone2", p: "stone1", N: "wood3", n: "wood2", Y: "wood1", y: "wood1",
    D: "rose3", E: "rose2", B: "rose1",
    H: "brown3", h: "brown2", d: "brown1", J: "jade3", I: "jade6",
  },
  hair,
  face,
  extras: [cardigan, skirt, bag, extrasSit],
  body: { arms },
  walkFps: 6,
} as const;

export default defineSprites({
  ...defineCharacter(LIN_JIE, ["idle", "walk", "sit"]),
});
