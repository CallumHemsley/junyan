/**
 * 小李, office worker, twenties. Brisk, practical, polite. Neat hair swept back off his forehead,
 * sharp brows, an office-blue shirt with the top button undone and a tea-coloured tie pulled loose,
 * a lanyard with his building pass, a laptop messenger bag across his chest, charcoal trousers,
 * black shoes, a phone always in his hand. Habit: checks the phone. Seated: checks it again and
 * taps a foot.
 */
import { defineSprites } from "../../kit/index.ts";
import { EAR_RIGHT, RIG, defineCharacter, mirror, part, sided, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[]) => part(y, Z.hair, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

// ── hair: short back and sides, swept back with a neat side part ──────────

const hair = sided({
  down: [h(8, [
    "............hhhhhhhh............",
    "..........hhHHHHHHhhhh..........",
    "........hhHHHHHHHHhhhhhh........",
    ".......hHHHhhhhhhhhhhhhhh.......",
    "......hHHhdhhhhHHhhhhhhhhd......",
    "......hHhdhhhhHHhhhhhhhhhdd.....",
    ".....hhhdhhhhHhhhhhhhhhhhhdd....",
    ".....hhdhhhhhhhhhhhdhhhhhhdd....",
    ".....hhdhhhhhhhhhhdhhhhhhhdd....",
    ".....hhhhddhhhhhhdhhhhhhhhdd....",
    ".....hhhsssddddhhhhhhhhhhddd....",
    ".....hhs.......sssddhhhhhdd.....",
    "......s.............sshhdd......",
    "......h..................dd.....",
    "......h..................d......",
  ])],
  up: [h(8, [
    "............hhhhhhhh............",
    "..........hhHHHHHHhhhh..........",
    "........hhHHHHHHHHhhhhhh........",
    ".......hHHHhhhhhhhhhhhhhh.......",
    "......hHHhhhhhhhhhhhhhhhhd......",
    "......hHhhhhhhhhhhhhhhhhhdd.....",
    ".....hhhhhhhhhhhhhhhhhhhhhdd....",
    ".....hhhhhhhhhhhhhhhhhhhhhdd....",
    ".....hhhhhhhhhhhhhhhhhhhhhdd....",
    ".....hhhhhhhhhhhhhhhhhhhhhdd....",
    ".....dhhhhhhhhhhhhhhhhhhhddd....",
    "......dhhhhhhhhhhhhhhhhhhdd.....",
    ".......dhhhhhhhhhhhhhhhhdd......",
    ".......ddhhhhhhhhhhhhhhddd......",
    "........ddhhhhhhhhhhhhdd........",
    ".........ddddhhhhhhdddd.........",
    "............dddddddd............",
  ])],
  right: [
    h(8, [
      "...........hhhhhhhhh............",
      ".........hhHHHHHHHHhhh..........",
      ".......hhHHHHHHHHHhhhhh.........",
      "......hHHHhhhhhhhhhhhhhh........",
      ".....hHHhhhhhhhhhhhhhhhhh.......",
      ".....hHhhhhhhhhhhhhhhhhhhh......",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....dhhhhhhhhhhhhhhhhhhhhs......",
      "....dhhhhhhhhhhhhhhhhhss........",
      "....ddhhhhhhhh..hhs.............",
      "....ddhhhhhhh...h...............",
      ".....ddhhhhh....................",
      ".....ddhhhh.....................",
      "......ddhhh.....................",
      ".......ddd......................",
    ]),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

/** Focused: straight brows angled in, a polite closed smile; eyes drop to the phone on the habit. */
const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const look = pose.beat === "habit", blink = pose.beat === "breath" && pose.action === "idle";
    const eyes = blink
      ? ["................................", "................................", "..........ee........ee.........."]
      : look
        ? ["................................", "..........ee........ee..........", "..........we........we.........."]
        : ["..........we........we..........", "..........ee........ee..........", "..........ee........ee.........."];
    return [f(21, [
      "........rrrr........rrrr........",
      "...........r........r...........",
      "................................",
      ...eyes,
      "........b..............b........",
      "..............mmmm..............",
      "...............................",
    ])];
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    const look = pose.beat === "habit", blink = pose.beat === "breath" && pose.action === "idle";
    return [f(21, [
      "...................rrrr.........",
      "......................r.........",
      "................................",
      ...(blink ? ["................................", "................................", ".....................ee........."]
        : look ? ["................................", ".....................ee.........", ".....................we........."]
          : [".....................we.........", ".....................ee.........", ".....................ee........."]),
      "...................b............",
      ".......................mm.......",
    ])];
  },
});

// ── tie, lanyard, bag ──────────────────────────────────────────────────────

const LANYARD = { U: "blue1", w: "cream5", c: "cream3", b: "blue3" } as const;
const BAG = { g: "stone2", G: "stone3", d: "stone1", s: "steel4", S: "steel5" } as const;

const tie = sided({
  down: [
    part(33, Z.clothes, [
      "..............kSSk..............",
      "...............GG...............",
      "..............GGgg..............",
      "...............Gg...............",
      "...............Gg...............",
      "...............GG...............",
      "...............gG...............",
      "..............GGgg..............",
      "..............GgGg..............",
      "..............GGgg..............",
      "..............gGgg..............",
      "...............gg...............",
    ]),
    part(38, Z.clothes, [
      "..................uuuu..........",
      "..................uTTu..........",
      "..................uTTu..........",
      "..................uuuu..........",
      "................................",
      "................................",
      "................................",
      "................................",
      "...............C................",
    ]),
    part(34, Z.clothes + 1, [
      "...........U....................",
      "...........U....................",
      "...........U....................",
      "...........U....................",
      "..........www...................",
      "..........bbb...................",
      "..........wcw...................",
      "..........wcc...................",
    ], { legend: LANYARD }),
    // Messenger strap from the left shoulder to the bag on his right hip.
    part(34, Z.clothes + 2, [
      ".......gG.......................",
      "........gG......................",
      ".........gG.....................",
      "..........gG....................",
      "...........gG...................",
      "............gG..................",
      ".............gG.................",
      "..............gG................",
      "...............gG...............",
      "................gG..............",
      ".................gG.............",
      "..................gG............",
      "...................gGggggggg....",
      "...................GGGGGGGGGg...",
      "...................GGGGsGGGGg...",
      "...................gggggggggg...",
      "...................gGGGGGGGGd...",
      "...................gGGGGGGGGd...",
      "...................ddddddddd....",
    ], { legend: BAG }),
  ],
  up: [
    part(34, Z.clothes + 2, [
      ".......................Gg.......",
      "......................Gg........",
      ".....................Gg.........",
      "....................Gg..........",
      "...................Gg...........",
      "..................Gg............",
      ".................Gg.............",
      "................Gg..............",
      "...............Gg...............",
      "..............Gg................",
      ".............Gg.................",
      "............Gg..................",
      "...ggggggggGg...................",
      "..GGGGGGGGGg....................",
      "..GGGGGGGGGg....................",
      "..GGGGGGGGGd....................",
      "..GGGGGGGGGd....................",
      "..gGGGGGGGGd....................",
      "...ddddddddd....................",
    ], { legend: BAG }),
  ],
  right: [
    part(33, Z.clothes, [
      "..................kS............",
      "...................GG...........",
      "...................GGg..........",
      "...................Gg...........",
      "...................GGg..........",
      "...................Ggg..........",
      "...................GGg..........",
      "...................Ggg..........",
      "...................ggg..........",
    ]),
    part(34, Z.clothes + 1, [
      "...................gG...........",
      "..................gG............",
      ".................gG.............",
      "................gG..............",
      "...............gG...............",
      "..............gG................",
      ".............gG.................",
      "............gG..................",
      "...........gG...................",
      "..........gG....................",
      ".........gGgggggg...............",
      "........GGGGGGGGGg..............",
      "........GGGGsGGGGg..............",
      "........ggggggggggg.............",
      "........gGGGGGGGGd..............",
      "........gGGGGGGGGd..............",
      "........gGGGGGGGGd..............",
      ".........ddddddddd..............",
    ], { legend: BAG }),
  ],
  left: [
    mirror(part(33, Z.clothes, [
      "..................kS............",
      "...................GG...........",
      "...................GGg..........",
      "...................Gg...........",
      "...................GGg..........",
      "...................Ggg..........",
      "...................GGg..........",
      "...................Ggg..........",
      "...................ggg..........",
    ])),
    mirror(part(34, Z.clothes + 1, [
      "...........gG...................",
      "............gG..................",
      ".............gG.................",
      "..............gG................",
      "...............gG...............",
      "................gG..............",
      ".................gG.............",
      "..................gG............",
      "...................gG...........",
    ], { legend: BAG })),
    mirror(part(44, Z.farArm, ["..........gggggg", ".........GGGGGGg", ".........GGGGGGg", ".........dddddd."], { legend: BAG })),
  ],
});

// ── phone and habits ───────────────────────────────────────────────────────

const PHONE = { i: "ink2", B: "blue5", b: "blue4", S: "skin4", s: "skin3", k: "skin2", V: "blue4", v: "blue3", X: "blue5", x: "blue4", F: "blue4", f: "blue3" } as const;
/** At rest the phone hangs in his left hand. */
const PHONE_DOWN = part(44, Z.hands, ["....iii", "....ibi", "....ibi", "....iii"], { legend: PHONE });
/** Habit: the phone comes up in front of his chest. */
const PHONE_UP = part(34, Z.hands, [
  "......VVV.......",
  ".....VVVVv......",
  ".....VVVVv......",
  ".....VVVvv......",
  ".....VVVvv......",
  ".....VVVvXX.....",
  ".....VVvFFFf....",
  "......vvFFFFSk..",
  "..........iiiii.",
  "..........iBBbi.",
  "..........iBbbi.",
  "..........SiiiS.",
], { legend: PHONE });

const arms: Piece = (pose) => {
  const base = RIG.arms(pose);
  if (pose.dir !== "down") return base;
  if (pose.beat === "habit" && (pose.action === "idle" || pose.action === "sit")) return [base[1], PHONE_UP];
  if (pose.action === "idle") return [...base, PHONE_DOWN];
  return base;
};

/** Seated, the foot taps: on the breath frames his right toe comes up a pixel. */
const legs: Piece = (pose) => {
  const base = RIG.legs(pose);
  if (pose.action !== "sit" || pose.beat !== "breath" || pose.dir === "up") return base;
  return base.map((p) => (pose.dir === "down"
    ? { ...p, rows: p.rows.map((r, j) => (j >= 15 ? r.slice(0, 16) + "................" : r)).concat() }
    : p))
    .concat(pose.dir === "down" ? [part(54, Z.legs + 1, ["................ppppppp.........", "................nNNNNNN.........", "................nNNNNNNn........", "................YYYYYYYY........"], { group: "legs" })] : []);
};

export const XIAO_LI = {
  id: "xiao-li",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "hair1",
    T: "blue4", t: "blue3", u: "blue2", C: "blue5", c: "blue4",
    V: "blue4", v: "blue3", X: "blue5", x: "blue4", F: "blue4", f: "blue3",
    G: "wood3", g: "wood2",
    P: "steel2", p: "steel1", N: "steel2", n: "steel1", Y: "ink2", y: "ink2",
    H: "hair3", h: "hair2", d: "hair1",
  },
  hair,
  face,
  extras: [tie],
  body: { arms, legs },
  walkFps: 8,
} as const;

export default defineSprites({
  ...defineCharacter(XIAO_LI, ["idle", "walk", "sit"]),
});
