/**
 * 小周, university student, about twenty. Bright, curious, sociable. Messy hair with a short side
 * ponytail tied in an ochre band, mint headphones round the neck, a lilac-plum hoodie with
 * drawstrings and a kangaroo pocket, light jeans, white trainers, an ochre backpack with a little
 * charm dangling from the zip. An open grin. Habit: waves hello. Seated: swings a leg.
 */
import { defineSprites } from "../../kit/index.ts";
import { RIG, defineCharacter, mirror, part, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[], z: number = Z.hair) => part(y, z, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

// ── hair: messy, flyaways, a short side ponytail on the left side ──────────

const HAIR_DOWN = h(7, [
  "..............h....h............",
  "...........hhhhh..hh............",
  ".........hhHHHHhhhhhhhh.........",
  "........hHHHHHHhhhhhhhhh........",
  ".......hHHHhhhhhhhhhhhhhh.......",
  "......hHHhhhhhhhhhhhhhhhhd......",
  "......hHhhhhhhhhhhhhhhhhhdd.....",
  ".....hhhhhhhhdhhhhhhdhhhhddd....",
  ".....hhhhhhhdhhhhhhdhhhhhddd....",
  ".....hhhhhhdhhhhhdhhhhhhhddd....",
  ".....hhhhhdhhhhhhhhhhhhdhdddJj..",
  ".....hhhhhhhhhhhhhhhhhhhhdddjJ..",
  ".....hhhhshhhhhshhhhshhhhddhhd..",
  ".....hhhs.shhhs.shhs.shhhddhhhd.",
  ".....hhs...shs...ss...shhd.hhhd.",
  ".....hs.....s.........sshd.hhd..",
  "....hh.................sdd.hhd..",
  "....hh..................dd.hd...",
  ".....h...................d.d....",
]);
const HAIR_UP = h(7, [
  "..............h....h............",
  "...........hhhhh..hh............",
  ".........hhHHHHhhhhhhhh.........",
  "........hHHHHHHhhhhhhhhh........",
  ".......hHHHhhhhhhhhhhhhhh.......",
  "......hHHhhhhhhhhhhhhhhhhd......",
  "......hHhhhhhhhhhhhhhhhhhdd.....",
  ".....hhhhhhhhhhhhhhhhhhhhddd....",
  ".....hhhhhhhdhhhhhdhhhhhhddd....",
  ".....hhhhhhdhhhhhhhdhhhhhddd....",
  "..jJhhhhhhdhhhhhhhhhdhhhhddd....",
  "..Jjhhhhhhhhhhhhhhhhhhhhhddd....",
  ".dhhdhhhhhhhhhhhhhhhhhhhdddd....",
  "dhhhdhhhhhhhhhhhhhhhhhhhdddd....",
  "dhhh.hhhhhhhhhhhhhhhhhhhdddd....",
  ".dhh...hhhhhhhhhhhhhhhhddd......",
  "..dhh..dhhhhhhhhhhhhhhhdd.......",
  "...dh...dhhhhhhhhhhhhhdd........",
  "....d....ddhhhdhhhhdhdd.........",
  "..........dhdhhdhhdhd...........",
  "...........d..d..d..d...........",
]);
const HAIR_RIGHT = h(7, [
  "...............h...h............",
  "...........hhhhhh.hh............",
  ".........hhhHHHHhhhhh...........",
  ".......hHHHHHhhhhhhhhh..........",
  "......hHHhhhhhhhhhhhhhh.........",
  ".....hHHhhhhhhhhhhhhhhhh........",
  ".....hHhhhhhhhhhhhhhhhhhh.......",
  "....hhhhhhhhhhhhdhhhhhhhhh......",
  "....hhhhhhhhhhhdhhhhhdhhhhh.....",
  "....hhhhhhhhhhdhhhhhdhhhhhhh....",
  "....hhhhhhhhhdhhhhhdhhhhshhh....",
  "....dhhhhhhhhhhhhhhhhhhs.shhh...",
  "....dhhhhhhhhhhdhhhhhhs...sh....",
  "....ddhhhhhhhdd.hhhhs.....s.....",
  "....ddhhhhhhh....hhs............",
  "....ddhhhhhh.....hs.............",
  "....dddhhhhh.....h..............",
  ".....ddhhhhh....................",
  ".....dd.hhh.....................",
  "......d..dh.....................",
]);
/** In the left profile the ponytail shows at the back of the head. */
const PONYTAIL_LEFT = h(17, [
  "..........................jJ....",
  "..........................Jjhh..",
  "...........................hhhd.",
  "...........................hhhd.",
  "...........................hhd..",
  "............................hd..",
  "............................d...",
]);

const hair = sidedBy({
  down: () => [HAIR_DOWN],
  up: () => [HAIR_UP],
  right: () => [HAIR_RIGHT],
  left: () => [mirror(HAIR_RIGHT), { ...PONYTAIL_LEFT, z: Z.hair + 1 }],
});

/** Open grin with teeth, big catch-lights, brows up. */
const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath" && pose.action === "idle";
    return [f(20, [
      ".........rrr........rrr.........",
      "........r..............r........",
      "................................",
      ".........e..........e...........",
      ...(blink
        ? ["................................", "..........r.........r...........", "..........ee........ee.........."]
        : ["..........we........we..........", "..........ee........ee..........", "..........ew........ew.........."]),
      ".......bbb............bbb.......",
      ".......bbb...mwwwwm...bbb.......",
      "..............MMMM..............",
    ])];
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath" && pose.action === "idle";
    return [f(20, [
      "....................rrr.........",
      "...................r............",
      "................................",
      "................................",
      ...(blink ? ["................................", "....................r...........", ".....................ee........."]
        : [".....................we.........", ".....................ee.........", ".....................ee........."]),
      "..................bbb...........",
      "..................bbb.mwwm......",
      "......................MM........",
    ])];
  },
});

// ── headphones, hoodie details, backpack ───────────────────────────────────

const KIT = {
  j: "jade5", J: "jade4", q: "jade3", s: "steel3", S: "steel4",
  g: "gold3", G: "gold2", o: "gold1", l: "gold4", c: "cream5", z: "steel4",
  p: "pink2", P: "pink1", w: "white",
} as const;

const hoodie: Piece = (pose) => {
  const sway = pose.legs === "stepA" ? 1 : pose.legs === "stepB" ? -1 : 0;
  if (pose.dir === "down") return [
    // Hood bunched round the neck, drawstrings, kangaroo pocket.
    part(33, Z.clothes, [
      "........CCCC..........CCCC......",
      ".......CCccC..........CcccC.....",
      "...........................c....",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "..........uuuuuuuuuuuu..........",
      ".........uTTTTTTTTTTTtu.........",
      ".........uTTTTTTTTTttu..........",
      ".........uTtttttttttttu.........",
      "................................",
      "........uuuuuuuuuuuuuuuu........",
    ]),
    part(34, Z.clothes + 1, ["..............c..c..............", "..............c..c..............", "..............c..c..............", "..............c...c.............", ".............l.....l............"], { legend: KIT }),
    // Backpack straps and the pack's top edge over the shoulders.
    part(31, Z.behind, ["......GGGG..........GGGG........", ".....GGGGGG........GoooGG.......", ".....GGGGGG........GoooGG......."], { legend: KIT }),
    part(34, Z.clothes + 2, [
      ".......GG..............GG.......",
      ".......GG..............Go.......",
      "........GG............Go........",
      "........GG............Go........",
      "........Gl............lo........",
      "........zz............zz........",
      "........GG............Go........",
      "........GG............Go........",
    ], { legend: KIT }),
    // Headphones resting round the neck.
    part(31, Z.clothes + 3, ["........ss............ss........", ".......sJJj..........jJJs.......", ".......JJJq..........qJJJ.......", "........qq............qq........"], { legend: KIT }),
  ];
  if (pose.dir === "up") return [
    part(33, Z.clothes, ["......CCCCCCCCCCCCCCCCCCCC......", "......cCCCCCCCCCCCCCCCCCCc......", ".......ccCCCCCCCCCCCCCCcc......."]),
    part(32, Z.clothes + 1, ["........ssssssssssssssss........"], { legend: KIT }),
    // The backpack fills the back: flap, front pocket, zip, and the charm swinging on its pull.
    part(35, Z.clothes + 2, [
      "........GGGGGGGGGGGGGGGo........",
      ".......GllllllllllllllGoo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......GoooooooooooooooGo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......GGGlllllllllllGGoo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......GGGGGzzGGGGGGGGGoo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......GGGGGGGGGGGGGGGGoo.......",
      ".......oooooooooooooooooo.......",
      "........oooooooooooooooo........",
    ], { legend: KIT }),
    part(44, Z.clothes + 3, [
      "............z...................",
      "............z...................",
      "............z...................",
    ].map((r) => (sway ? r.replace("z", ".") : r)), { legend: KIT }),
    part(46, Z.clothes + 3, sway > 0 ? ["............z.", ".............p", "............pP", ".............P"] : sway < 0 ? ["............z.", "...........p..", "..........pP..", "...........P.."] : ["............z.", "............p.", "...........pP.", "............P."], { legend: KIT }),
  ];
  const sideParts = [
    part(31, Z.behind, [
      "........ooo.....................",
      ".....GGGGGGo....................",
      "....GGGGGGGGo...................",
      "....GlllllGGo...................",
      "....GGGGGGGGo...................",
      "....GGGGGGGGo...................",
      "....GooooooGo...................",
      "....GGGGGGGGo...................",
      "....GGGGGGGGo...................",
      "....GGlllGGGo...................",
      "....GGGGGGGGo...................",
      "....GGGGGGGGo...................",
      "....GGGGGGGGo...................",
      "....GGGGGGGGo...................",
      "....GGGGGGGGo...................",
      ".....oooooooo...................",
    ], { legend: KIT }),
    part(46, Z.behind + 1, sway === 0 ? ["....z...", "....p...", "...pP...", "....P..."] : ["....z...", "...p....", "..pP....", "...P...."], { legend: KIT }),
    part(34, Z.clothes + 2, ["............GG....", "............Go....", ".............Go...", ".............Go...", ".............lo...", ".............zz..."], { legend: KIT }),
    part(31, Z.clothes + 3, ["...................ss.....", "..................sJJj....", "..................JJJq....", "...................qq....."], { legend: KIT }),
    part(33, Z.clothes, [
      ".............CCCC...",
      "............CCccC...",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................uuuuuu..........",
      "................TTTTTu..........",
      "................tttttu..........",
      "................................",
      "................................",
      "...........uuuuuuuuuu...........",
    ]),
  ];
  return pose.dir === "left" ? sideParts.map(mirror) : sideParts;
};

// ── habits ─────────────────────────────────────────────────────────────────

/** Waving hello with the right hand, from the front. */
const WAVE = [
  part(26, Z.arms, [
    ".........................vv.....",
    ".........................vvv....",
    "........................vvvv....",
    "........................vvvv....",
    "........................xxx.....",
    "........................vvv.....",
    "........................vvv.....",
    ".......................vvvv.....",
    "......................vvvv......",
    "......................vvv.......",
  ]),
  part(20, Z.hands, ["........................s.s.s...", "........................sssss...", "........................ssssk...", ".........................ssk....", ".........................sk....."], { group: "head" }),
];

const arms: Piece = (pose) => {
  const base = RIG.arms(pose);
  if (pose.dir === "down" && pose.action === "idle" && pose.beat === "habit") return [base[0], ...WAVE];
  return base;
};

/** Seated, a leg swings: forward on the breath, tucked on the habit. */
const legs: Piece = (pose) => {
  const base = RIG.legs(pose);
  if (pose.action !== "sit" || pose.dir === "up") return base;
  if (pose.dir === "down") {
    if (pose.beat !== "breath") return base;
    // The right shin swings toward the camera: it reads shorter and the shoe sits lower and larger.
    return [{ ...base[0], rows: base[0].rows.map((r, j) => (j >= 6 ? r.slice(0, 16) + "................" : r)) },
      part(46, Z.legs + 1, [
        "................pPPPPp..........",
        "................pPPPPp..........",
        "................pPPPPp..........",
        "................pPPPPp..........",
        "................pppppp..........",
        "...............NNNNNNNn.........",
        "...............NNNNNNNNn........",
        "...............YYYYYYYYY........",
      ], { group: "legs" })];
  }
  if (pose.beat !== "breath") return base;
  const swing = part(46, Z.legs + 1, [
    "...................pPPPP........",
    "....................pPPPP.......",
    ".....................pPPPP......",
    "......................pPPPP.....",
    ".......................pPPPP....",
    "........................ppppp...",
    ".......................NNNNNNN..",
    ".......................NNNNNNNNn",
    "........................YYYYYYYY",
  ], { group: "legs" });
  const trimmed = { ...base[0], rows: base[0].rows.map((r, j) => (j >= 6 ? "................................" : r)) };
  return pose.dir === "left" ? [trimmed, mirror(swing)] : [trimmed, swing];
};

export const XIAO_ZHOU = {
  id: "xiao-zhou",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", M: "pink1", r: "hair1",
    T: "plum4", t: "plum3", u: "plum2", C: "plum4", c: "plum2",
    V: "plum4", v: "plum3", X: "plum3", x: "plum2", F: "plum4", f: "plum3",
    P: "blue3", p: "blue2", N: "steel6", n: "steel5", Y: "steel4", y: "steel3",
    H: "hair3", h: "hair2", d: "hair1", J: "gold3", j: "gold4",
  },
  hair,
  face,
  extras: [hoodie],
  body: { arms, legs },
} as const;

export default defineSprites({
  ...defineCharacter(XIAO_ZHOU, ["idle", "walk", "sit"]),
});
