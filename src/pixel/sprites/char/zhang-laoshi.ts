/**
 * 张老师, retired teacher, seventies. Precise and patient. A full head of silver hair with a side
 * parting he has combed the same way for fifty years, round tea-wood spectacles, an ochre shirt
 * with a cream collar under a knitted brown button vest with a ballpoint clipped to it, grey
 * trousers, polished old shoes. A folded newspaper under his left arm. A slight stoop, a slow walk.
 * Habit: pushes his glasses up his nose. Seated: reads the paper.
 */
import { defineSprites } from "../../kit/index.ts";
import { EAR_RIGHT, RIG, defineCharacter, mirror, part, sided, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[], z: number = Z.hair) => part(y, z, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });
const side = (p: Part, pose: Pose): Part => (pose.dir === "left" ? mirror(p) : p);

// ── hair: silver, side-parted, swept across ────────────────────────────────

const hair = sided({
  down: [h(8, [
    "...........hhhhhhhhhh...........",
    ".........hhHHhdhhHHhhhh.........",
    "........hHHHhdhHHHHHHhhh........",
    ".......hHHHhdhHHhhhhHHhhh.......",
    "......hHHHhdhHHhhddhhhhhhd......",
    "......hHHhdhHhhddhhhhddhhdd.....",
    ".....hhHhhdhHhddhhhhddhhhddd....",
    ".....hhhhhdhhddhhHhddhhhhddd....",
    ".....hhhhdhhddhhHhdhhhhhhddd....",
    ".....hhhhdhhdhhHhdhhhhhhhhdd....",
    ".....hhhhshhhhhhdhhhhhhhdhdd....",
    ".....hhhs.sshhhhhhhhhhhhdhdd....",
    ".....hhs.....sssshhhhhhdhddd....",
    ".....hs..........sssshhhdddd....",
    ".....h................sshhdd....",
    "....hh..................shdd....",
    "....hh....................d.....",
  ])],
  up: [h(8, [
    "...........hhhhhhhhhh...........",
    ".........hhHHhdhhhhhhhh.........",
    "........hHHHhdhHHHHhhhhh........",
    ".......hHHHhdhHHHHHHhhhhh.......",
    "......hHHHhdhHHHhhhhhhhhhd......",
    "......hHHhdhHHhhhhhhhhhhhdd.....",
    ".....hhHhhdhHhhhhhhhhhhhhddd....",
    ".....hhhhhhdhhhhhhhhdhhhhddd....",
    ".....hhhhhhdhhhhhhhhhdhhhddd....",
    ".....hhhhhdhhhhhhhhhhdhhhddd....",
    ".....hhhhhdhhhhhhhhhhhdhhddd....",
    ".....dhhhhhhhhhhhhhhhhhhdddd....",
    ".....dhhhhhhhhhhhhhhhhhhdddd....",
    ".......hhhhhhhhhhhhhhhhhdd......",
    ".......dhhhhhhhhhhhhhhhddd......",
    ".......ddhhhhhhhhhhhhhdddd......",
    "........dddhhhhhhhhhdddd........",
    "..........ddddddddddd...........",
  ])],
  right: [
    h(8, [
      "..........hhhhhhhhhh............",
      "........hhhHHHHHHhhhhh..........",
      ".......hHHHHHHHHhhhhhhh.........",
      "......hHHHHhhhhhhhhhhhhh........",
      ".....hHHhhhhhhhhhhhhhhhhh.......",
      ".....hHhhhhhhhhhhhhhhhhhhh......",
      "....hhhdhhhhhhhhhdhhhHhhhhh.....",
      "....hhdhhhhhhhhhdhhhHhhhhhh.....",
      "....hdhhhhhhhhhdhhhHhhhdhhhh....",
      "....hdhhhhhhhhdhhhhhhhdhhhs.....",
      "....dhhhhhhhhhhhhhhhhhhhs.......",
      "....dhhhhhhhhhhhhhhhhss.........",
      "....ddhhhhhhhhh..hhs............",
      "....ddhhhhhhhh....h.............",
      "....dddhhhhhhh..................",
      ".....ddhhhhhh...................",
      ".....ddhhhhh....................",
      "......ddhhh.....................",
      ".......ddd......................",
    ]),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

// ── face: kind eyes behind round spectacles ────────────────────────────────

const RIMS_DOWN = [
  ".........OOOO......OOOO.........",
  "........Ow...O....Ow...O........",
  "....OOOO.....OOOOOO.....OOOO....",
  "........O....O....O....O........",
  "........O....O....O....O........",
  ".........OOOO......OOOO.........",
];
const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath";
    const eyes = blink
      ? ["................................", "................................", "..........ee........ee.........."]
      : ["..........we........we..........", "..........ee........ee..........", "..........ee........ee.........."];
    return [
      f(20, [
        "........rrrr........rrrr........",
        ".......r...q........q...r.......",
      ]),
      f(24, eyes),
      f(27, [
        ".......bb..k..........k..bb.....",
        "...........k...m..m...k.........",
        "................mm..............",
      ]),
      part(22, Z.glasses, RIMS_DOWN, { group: "head" }),
    ];
  },
  up: () => [part(24, Z.glasses, ["....OO....................OO...."], { group: "head" })],
  right: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath";
    return [
      f(20, ["...................rrrr.........", "...................q............"]),
      f(24, blink ? ["......................", "......................", ".....................ee"] : [".....................we", ".....................ee", ".....................ee"]),
      f(27, ["..................bb.k..........", ".....................k.mm.......", "......................mm........"]),
      part(22, Z.glasses, [
        "...................OOOO.........",
        "..................Ow...O........",
        "...............OOOO....O........",
        "..................O....O........",
        "..................O....O........",
        "...................OOOO.........",
      ], { group: "head" }),
    ];
  },
});

// ── clothes: knitted button vest, pen, newspaper ───────────────────────────

const PEN = { b: "blue2", B: "blue3", c: "steel4" } as const;
const vest = sided({
  down: [
    part(35, Z.clothes, [
      "........AAAAA......aaaa.........",
      "........AAAAAA....Aaaaa.........",
      "........AAAAAAA..AAaaaa.........",
      "........AAAAAAAG.AAaaaa.........",
      "........AAAAAAAAQAAaaaa.........",
      "........AAAAAAAAGAAaaaa.........",
      "........AAAAAAAAQAAaaaa.........",
      "........AAAAQAAAGAAaQaa.........",
      "........AAAAQAAAQAAaQaa.........",
      "........AAAAAAAAGAAaaaa.........",
      "........AQAQAQAQAQaQaQa.........",
      "........QAQAQAQAQAQaQaQ.........",
    ]),
    part(35, Z.clothes + 1, ["..........c.....", "..........B.....", "..........b.....", "..........b....."], { legend: PEN }),
  ],
  up: [part(35, Z.clothes, [
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAAaaaa........",
    "........AAAAAAAAAAAaaaaa........",
    "........AAAAAAAAAAAaaaaa........",
    "........AQAQAQAQAQAQaQaQ........",
    "........QAQAQAQAQAQAQaQa........",
  ])],
  right: [
    part(35, Z.clothes, [
      "............AAAAAA..............",
      "...........AAAAAAAAa............",
      "...........AAAAAAAAa............",
      "...........AAAAAAAAaG...........",
      "...........AAAAAAAAaa...........",
      "...........AAAAAAAAaG...........",
      "...........AAAAAAAAaa...........",
      "...........AAAAAAAAaG...........",
      "...........AAAAAAAAaa...........",
      "...........AAAAAAAAaG...........",
      "...........AQAQAQAQaQ...........",
      "...........QAQAQAQAQa...........",
    ]),
  ],
});

const PAPER = { w: "cream5", c: "cream4", C: "cream3", l: "stone3", L: "stone2" } as const;
/** The folded paper under his left arm: screen-right from the front, visible only in the left profile. */
const paperTucked: Piece = (pose) => {
  if (pose.action === "sit") return [];
  if (pose.dir === "down") return [part(39, Z.clothes + 2, ["wwwwwwwwww", "wllllllllC", "wwwwwwwwwC", "wlllllLllC", "ccccccccCC"], { x: 21, legend: PAPER })];
  if (pose.dir === "up") return [part(39, Z.clothes + 2, ["wwwwwwwwww", "wllllllllC", "wwwwwwwwwC", "wlllllLllC", "ccccccccCC"], { x: 1, legend: PAPER })];
  if (pose.dir === "left") return [part(38, Z.arms + 1, ["wwwwwwwww", "wlllllllC", "wwwwwwwwC", "wllllLllC", "cccccccCC"], { x: 13, legend: PAPER })];
  return [part(38, Z.farArm, ["wwwww", "wlllC", "ccccC"], { x: 20, legend: PAPER })];
};

/** Seated with the paper open. Front: the broadsheet hides his chest; profile: held up before him. */
const SEATED_PAPER_DOWN = part(34, Z.front, [
  "....wwwwwwwwwwwCwwwwwwwwwwwc....",
  "....wllllllllwwCwllllllllwwc....",
  "....wwwwwwwwwwwCwwwwwwwwwwwc....",
  "....wlllllwlllwCwllllwllllwc....",
  "....wwwwwwwwwwwCwwwwwwwwwwwc....",
  "....wLLLLLLLLwwCwlllllllllwc....",
  "....wLLLLLLLLwwCwwwwwwwwwwwc....",
  "....wLLLLLLLLwwCwllllwllllwc....",
  "....wwwwwwwwwwwCwwwwwwwwwwwc....",
  "....cccccccccccCccccccccccCC....",
], { legend: PAPER });
const SEATED_HANDS_DOWN = part(37, Z.front + 1, ["...SS.......................ss..", "...SSk......................ssk.", "...sk.......................kk.."]);
const SEATED_PAPER_SIDE = part(37, Z.front, [
  ".......................wC.......",
  ".......................wwC......",
  ".......................wlwC.....",
  ".......................wwlC.....",
  ".......................wlwC.....",
  ".......................wwlC.....",
  ".......................wlwC.....",
  ".......................wwlC.....",
  ".......................wlwC.....",
  ".......................wwwC.....",
  ".......................cccC.....",
  "........................cC......",
], { legend: PAPER });
const SEATED_PAPER_UP = part(33, Z.behind, [
  "...wwwwwwwwwwwwwwwwwwwwwwwwwc...",
  "...wwwwwwwwwwwwwwwwwwwwwwwwwc...",
  "...wwwwwwwwwwwwwwwwwwwwwwwwwc...",
  "...wwwwwwwwwwwwwwwwwwwwwwwwwc...",
  "...wwwwwwwwwwwwwwwwwwwwwwwwwc...",
  "...wwwwwwwwwwwwwwwwwwwwwwwwwc...",
  "...ccccccccccccccccccccccccCC...",
], { legend: PAPER });

/** Habit: two fingers to the bridge of his spectacles, forearm folded up in front of the shoulder. */
const PUSH_GLASSES = [
  part(23, Z.glasses + 1, ["..............SS..", ".............SSSk.", "............sSSk..", "...........sSk...."], { group: "head" }),
  part(27, Z.hands, [
    "...........XXx..",
    "..........FFFf..",
    ".........FFFf...",
    "........FFFf....",
    "........FFFf....",
    ".......FFFf.....",
    ".......FFFf.....",
    "......FFFf......",
    "......FFFf......",
    ".....VVVvv......",
    ".....VVVv.......",
    ".....VVvv.......",
    "......vv........",
  ]),
];

const arms: Piece = (pose) => {
  const base = RIG.arms(pose);
  if (pose.dir === "down" && pose.beat === "habit" && (pose.action === "idle" || pose.action === "sit")) return [base[1], ...PUSH_GLASSES];
  return base;
};
const seated: Piece = (pose) => {
  if (pose.action !== "sit") return [];
  if (pose.dir === "up") return [SEATED_PAPER_UP];
  if (pose.dir === "down") {
    // Lowering one side of the paper to push his glasses up.
    if (pose.beat === "habit") return [{ ...SEATED_PAPER_DOWN, rows: SEATED_PAPER_DOWN.rows.map((r) => "................" + r.slice(16)) }, { ...SEATED_HANDS_DOWN, rows: SEATED_HANDS_DOWN.rows.map((r) => "................" + r.slice(16)) }];
    return [SEATED_PAPER_DOWN, SEATED_HANDS_DOWN];
  }
  return [side(SEATED_PAPER_SIDE, pose)];
};

export const ZHANG_LAOSHI = {
  id: "zhang-laoshi",
  slots: {
    S: "tan4", s: "tan3", k: "tan2", b: "blush", m: "tan1", r: "grey2", q: "grey1",
    T: "bamboo4", t: "bamboo3", u: "bamboo2", C: "cream5", c: "cream3",
    V: "bamboo4", v: "bamboo3", X: "cream4", x: "cream3", F: "bamboo4", f: "bamboo3",
    A: "brown3", a: "brown2", Q: "brown1", G: "wood5", g: "wood3",
    P: "stone3", p: "stone2", N: "wood2", n: "wood1", Y: "ink2", y: "ink2",
    H: "grey3", h: "grey2", d: "grey1", O: "wood2",
  },
  hair,
  face,
  extras: [vest, paperTucked, seated],
  body: { arms },
  build: { lean: true },
  walkFps: 5,
} as const;

export default defineSprites({
  ...defineCharacter(ZHANG_LAOSHI, ["idle", "walk", "sit"]),
});
