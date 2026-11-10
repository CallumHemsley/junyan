/**
 * 老爷爷, the man in the next bed, eighties. Cheerful, nosy, up since five. A bald, sun-browned crown
 * with a few white hairs that stand straight up and two white tufts over big ears; long white
 * eyebrows that droop at the ends; deep smile creases. The ward's pinstriped pyjamas, his own grey
 * cardigan thrown over his shoulders like a cape (the sleeves hang empty), black cloth slippers.
 * His thing is a leather-cased transistor radio, tuned to the Peking opera station, never off.
 * A stoop and a slow shuffle. Habit: nods along to the radio with his eyes shut.
 *
 * In bed (facing down only): `lie` asleep with the radio on his chest, `lie-awake` the same with
 * his eyes open, `sit-bed` sitting up in the cardigan with the radio in his lap.
 */
import { defineSprites } from "../../kit/index.ts";
import { PYJAMA_BED, PYJAMA_BODY, PYJAMA_SLOTS, pyjamaTop } from "./_pyjamas.ts";
import { defineCharacter, EAR_RIGHT, inBed, mirror, part, sided, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[], z: number = Z.hair) => part(y, z, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

// ── hair: a bald crown, white wisps standing up, puffs over the ears ───────

const WISPS = [
  "............h..h................",
  "...........h..h..h..............",
];
const hair = sided({
  down: [
    h(10, [
      ...WISPS,
      "........hHh.hHh..h..............",
      ".........hh..hh.................",
    ]),
    // The crown's shine, upper left.
    h(13, ["..........LL....", ".........LL....."], Z.face),
    h(17, [
      "....h......................h....",
      "...hHh....................hhd...",
      "..hHhhd..................dhhhd..",
      "..hHhhd..................dhhhd..",
      "...hhd....................dhd...",
      "....d......................d....",
    ]),
  ],
  up: [
    h(10, WISPS),
    h(13, ["..........LL....", ".........LL....."], Z.face),
    h(17, [
      "....h......................h....",
      "...hHh....................hhd...",
      "..hHhhd..................dhhhd..",
      "..hHhhhhd..............dhhhhhd..",
      "...hhhhhhhhhdhhhdhhhhhhhhhhhd...",
      "....dhhhhhhhhhhhhhhhhhhhhhhd....",
      ".....ddhhdhhhhhhhhhhdhhhhdd.....",
      ".......dd.dd.dddd.dd.ddd........",
    ]),
  ],
  right: [
    h(10, [
      "..............h..h..............",
      ".............h..h..h............",
      "...........hHh.hHh..............",
      "............hh..hh..............",
    ]),
    h(13, ["..........LL....", ".........LL....."], Z.face),
    h(17, [
      ".....h..........................",
      "....hHh.........................",
      "...hHhhh........................",
      "...hhhhhh.......................",
      "...dhhhhhh......................",
      "....dhhhhhh.....................",
      "....ddhhhhh.....................",
      ".....ddhhh......................",
      "......dd........................",
    ]),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

// ── face: long drooping white brows, kind creased eyes ─────────────────────

const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const shut = pose.action === "lie" || pose.beat === "blink" || pose.beat === "habit";
    const eyes = shut
      ? ["................................", "................................", ".........eee........eee........."]
      : ["................................", "..........we........we..........", "..........ee........ee.........."];
    return [
      f(20, [
        "........rrrr........rrrr........",
        ".......rrqq..........qqrr.......",
        "......rr................rr......",
        ...eyes,
        "........k..............k........",
        ".......bbk..k......k..kbb.......",
        "...........k..m..m..k...........",
        "...............mm...............",
      ]),
    ];
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    const shut = pose.beat === "blink" || pose.beat === "habit";
    return [f(20, [
      "...................rrrr.........",
      "..................rrqq..........",
      ".................rr.............",
      "................................",
      ...(shut ? ["......................", ".....................ee"] : [".....................we", ".....................ee"]),
      "...................k..k.........",
      "..................bbk...........",
      ".....................k.mm.......",
      "......................mm........",
    ])];
  },
});

// ── the cardigan over his shoulders, sleeves hanging empty ────────────────

const CARDIGAN_DOWN_ROWS = [
  ".....AAAA..............aaaa.....",
  "....AAAAAAQ..........Qaaaaaa....",
  "...AAAAAAAAQ........Qaaaaaaaa...",
  "..AAAAAAAAAQ........Qaaaaaaaaa..",
  "..AAAAAAAAAQ........Qaaaaaaaaa..",
  "..AAQAAAAAAQ........QaaaaaaQaa..",
  "..AAQAAAAAAQ........QaaaaaaQaa..",
  "..AAQAAAAAAQ........QaaaaaaQaa..",
  "..AAQAAAAAAQ........QaaaaaaQaa..",
  "..AAQQAQAQAQ........QaQaQaQQaa..",
  "..AAQ......................Qaa..",
  "..AAQ......................Qaa..",
  "..QQQ......................QQQ..",
];
const cardiganDown = part(33, Z.sleeves, CARDIGAN_DOWN_ROWS);
const CARDIGAN_UP = part(33, Z.sleeves, [
  ".....AAAAAAAAAAAAAAAAAAAAaa.....",
  "....AAAAAAAAAAAAAAAAAAAAAaaa....",
  "...AAAAAAAAAAAAAAAAAAAAAaaaaa...",
  "..AAAAAAAAAAAAAAAAAAAAAAaaaaaa..",
  "..AAAAAAAAAAAAAAAAAAAAAAaaaaaa..",
  "..AAQAAAAAAAAAAAAAAAAAAAaaaQaa..",
  "..AAQAAAAAAAAAAAAAAAAAAaaaaQaa..",
  "..AAQAAAAAAAAAAAAAAAAAAaaaaQaa..",
  "..AAQAAAAAAAAAAAAAAAAAaaaaaQaa..",
  "..AAQQAQAQAQAQAQAQAQAQaQaQaQaa..",
  "..AAQ.......................Qaa.",
  "..AAQ.......................Qaa.",
  "..QQQ.......................QQQ.",
]);
const CARDIGAN_RIGHT = part(33, Z.sleeves, [
  "...........AAAAA................",
  ".........AAAAAAAAa..............",
  "........AAAAAAAAAaa.............",
  "........AAAAAAAAAAa.............",
  "........AAAAAAAAAAa.............",
  "........AAAAAAAAAAa.............",
  "........AAAAAAAAAAa.............",
  "........AAAAAAAAAAa.............",
  "........AAAAAAAAAAa.............",
  "........QAQAQAQAAAa.............",
  "...............AAQa.............",
  "...............AAQa.............",
  "...............QQQQ.............",
]);
const cardigan: Piece = (pose) => {
  if (pose.legs === "lie") return [];
  if (pose.dir === "down") return [cardiganDown];
  if (pose.dir === "up") return [CARDIGAN_UP];
  return [pose.dir === "left" ? mirror(CARDIGAN_RIGHT) : CARDIGAN_RIGHT];
};

// ── the transistor radio ───────────────────────────────────────────────────

const RADIO = { W: "wood4", w: "wood3", q: "wood2", g: "steel4", G: "steel2", d: "gold3", a: "steel5" } as const;
const RADIO_ROWS = [
  ".......a",
  "......a.",
  ".wwwwwa.",
  "wWWWWWWq",
  "wgGgGdWq",
  "wGgGgdWq",
  "wgGgGWWq",
  ".qqqqqq.",
];
const radioAt = (x: number, y: number, z: number = Z.hands, group: Part["group"] = "body"): Part => part(y, z, RADIO_ROWS, { x, legend: RADIO, group });
/** Fingers over the case, so it is held rather than floating. */
const grip = (x: number, y: number, rows: readonly string[]): Part => part(y, Z.hands + 1, rows, { x });

/** Where the hand holding the radio is: the screen-right hand from the front, the near hand in profile. */
const radio: Piece = (pose) => {
  // Asleep, the radio lies on the pillow by his ear, still on.
  if (pose.legs === "lie") return [radioAt(24, 22, Z.hair + 2, "head")];
  if (pose.legs === "sit-bed") return [radioAt(12, 37), grip(11, 41, ["S......S", "Sk....kS", ".k....k."])];
  const step = pose.legs;
  if (pose.dir === "down") {
    const dy = step === "stepA" ? 1 : step === "stepB" ? -2 : 0;
    return [radioAt(21, 40 + dy), grip(22, 44 + dy, ["SSk", ".kk"])];
  }
  if (pose.dir === "up") {
    const dy = step === "stepA" ? -2 : step === "stepB" ? 1 : 0;
    return [radioAt(3, 40 + dy, Z.hands)];
  }
  const near = step === "stepA" ? [-5, -1] : step === "stepB" ? [4, -1] : [0, 0];
  const parts = [radioAt(9 + near[0], 41 + near[1]), grip(12 + near[0], 45 + near[1], ["SSk"])];
  return pose.dir === "left" ? parts.map(mirror) : parts;
};

export const ELDER = {
  id: "elder",
  slots: {
    ...PYJAMA_SLOTS,
    S: "tan4", s: "tan3", k: "tan2", b: "blush", m: "tan1", r: "white", q: "grey2", L: "skin4",
    H: "white", h: "grey3", d: "grey2",
    A: "stone3", a: "stone2", Q: "stone1",
    N: "hair2", n: "hair1", Y: "cream4", y: "cream3",
  },
  hair,
  face,
  extras: [pyjamaTop, cardigan, radio],
  body: PYJAMA_BODY,
  bedBody: PYJAMA_BED,
  build: { lean: true },
  walkFps: 4,
  /** Nods along to the radio on the habit beat; in bed the stoop is gone. */
  pose: (pose: Pose): Pose => {
    if (inBed(pose)) return { ...pose, head: pose.head - 1 };
    return pose.beat === "habit" ? { ...pose, head: pose.head + 1 } : pose;
  },
} as const;

export default defineSprites({
  ...defineCharacter(ELDER, ["idle", "walk", "lie", "lie-awake", "sit-bed"]),
});
