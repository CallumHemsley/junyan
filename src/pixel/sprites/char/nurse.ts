/**
 * The ward nurse, thirties, quick and kind and already thinking about the next bed. Dark hair
 * pulled back into a netted bun at the nape, a starched white winged cap with one blue band, a
 * white short-sleeved uniform dress piped in pale blue with a belt, two pens and a fob watch
 * pinned upside down on the left breast, white stockings and sensible white lace-up shoes.
 * A brisk walk. Habit: lifts the fob watch and reads it.
 */
import { defineSprites } from "../../kit/index.ts";
import { EAR_RIGHT, RIG, defineCharacter, mirror, part, sided, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const h = (y: number, rows: readonly string[], z: number = Z.hair) => part(y, z, rows, { group: "head" });
const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

// ── hair, pulled back smooth; the bun under a net; the winged cap ──────────

const CAP = { W: "white", w: "cream4", c: "cream3", J: "blue3", j: "blue2" } as const;
const cap = (y: number, rows: readonly string[]) => part(y, Z.hat, rows, { group: "head", legend: CAP });

const hair = sided({
  down: [
    h(8, [
      "...........hhhhhhhhhh...........",
      ".........hhhHHHHHhhhhhh.........",
      "........hHHHHhhhhhhhhhhh........",
      ".......hHHhhhhhhhhhhhhhhd.......",
      "......hHHhhhhhhhhhhhhhhhdd......",
      "......hHhhhhhhhhhhhhhhhhdd......",
      ".....hhhhhhhhhhdhhhhhhhhddd.....",
      ".....hhhhhhhhhd.dhhhhhhhddd.....",
      ".....hhhhhhhhds..sdhhhhhddd.....",
      ".....hhhhhhhds....sdhhhhddd.....",
      ".....hhhhhhds......sdhhhddd.....",
      ".....hhhhhds........sdhhddd.....",
      ".....hhhhs............shddd.....",
      ".....hhhs..............sdd......",
      ".....hhs................dd......",
      "......s..................d......",
    ]),
    cap(3, [
      "......WW................ww......",
      "......WWWWWWWWWWWWWWWWwwww......",
      ".......WWWWWWWcWWWWWWwwww.......",
      ".........WWWWWcWWWWWwww.........",
      ".........JJJJJJJJJJJJJjj........",
      "..........cccccccccccc..........",
    ]),
  ],
  up: [
    h(8, [
      "...........hhhhhhhhhh...........",
      ".........hhhHHHhhhhhhhh.........",
      "........hHHHhhhhhhhhhhhh........",
      ".......hHHhhhhhhhhhhhhhhd.......",
      "......hHHhhhhhhhhhhhhhhhdd......",
      "......hHhhhhhhhhhhhhhhhhdd......",
      ".....hhhhhhhdhhhhhdhhhhhddd.....",
      ".....hhhhhhhdhhhhhdhhhhhddd.....",
      ".....hhhhhhhhdhhhhhdhhhhddd.....",
      ".....hhhhhhhhdhhhhhdhhhhddd.....",
      ".....hhhhhhhhhdhhhhhdhhhddd.....",
      ".....dhhhhhhhhdhhhhhdhhdddd.....",
      ".....dhhhhhhhhhhhhhhhhhdddd.....",
      ".......hhhhhhhhhhhhhhhhdd.......",
      ".......dhhhhhhhhhhhhhhhdd.......",
      "........ddhhhhhhhhhhhhdd........",
    ]),
    // The bun at the nape, in a fine dark net.
    h(22, [
      "...........dddddddddd...........",
      "..........dhHdhHdhHdhd..........",
      "..........dHdhHdhHdhhd..........",
      "..........dhdHdhHdhhdd..........",
      "...........ddhdhhdhdd...........",
      ".............dddddd.............",
    ], Z.hair + 1),
    cap(3, [
      "......WW................ww......",
      "......WWWWWWWWWWWWWWWWwwww......",
      ".......wwwwwwwcwwwwwwwccc.......",
      ".........WWWWWcWWWWWwww.........",
      ".........JJJJJJJJJJJJJjj........",
      "..........cccccccccccc..........",
    ]),
  ],
  right: [
    h(8, [
      "..........hhhhhhhhhh............",
      "........hhhHHHHHHhhhhh..........",
      ".......hHHHHHhhhhhhhhhh.........",
      "......hHHhhhhhhhhhhhhhhh........",
      ".....hHHhhhhhhhhhhhhhhhhh.......",
      ".....hHhhhhhhhhhhhhhhhhhhh......",
      "....hhhhhhhhhhhhhhhhhhhhhhh.....",
      "....hhhhhhhhhhhhhhhhhhhhhs......",
      "....hhhhhhhhhhhhhhhhhhhs........",
      "....dhhhhhhhhhhhhhhhss..........",
      "....dhhhhhhhhh..................",
      "....ddhhhhhhh...................",
      "....ddhhhhhh....................",
      "...dddddhhhh....................",
      "..dhHdhHdhh.....................",
      "..dHdhHdhhd.....................",
      "..dhdHdhhdd.....................",
      "...ddhdhdd......................",
      ".....ddd........................",
    ]),
    cap(3, [
      "......WWW.......................",
      "......WWWWWWWWWWWw..............",
      ".......WWWWWWWWWWww.............",
      "........WWWWWWWWWww.............",
      "........JJJJJJJJJjj.............",
      ".........ccccccccc..............",
    ]),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

// ── face: neat brows, quick eyes, a small professional smile ───────────────

const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const watch = pose.beat === "habit" && pose.action === "idle";
    const blink = pose.beat === "breath" && pose.action === "idle";
    const eyes = blink
      ? ["................................", "................................", ".........eee........eee........."]
      : watch
        ? ["................................", ".........eee........eee.........", "..........ee........ee.........."]
        : [".........ewe........wee.........", "..........ee........ee..........", "..........ee........ee.........."];
    return [f(21, [
      "........rrrr........rrrr........",
      "................................",
      "................................",
      ...eyes,
      ".......bb..............bb.......",
      ".......bb.....m....m...bb.......",
      "...............mmmm.............",
    ])];
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    const blink = pose.beat === "breath" && pose.action === "idle";
    return [f(21, [
      "...................rrrr.........",
      "................................",
      "................................",
      ...(blink ? ["......................", "......................", "....................eee"] : [".....................ew", ".....................ee", ".....................ee"]),
      "..................bb............",
      "..................bb...m........",
      "......................mm........",
    ])];
  },
});

// ── the uniform: piping, belt, pens, fob watch; the dress below the belt ──

const KIT = { W: "white", w: "cream4", c: "cream3", J: "blue4", j: "blue3", b: "blue2", G: "gold4", g: "gold2", M: "steel5", m: "steel3" } as const;
const BODICE_DOWN = part(33, Z.clothes, [
  "..........JJ........JJ..........",
  "..........jJJ......JJj..........",
  "...........jJJ....JJj...........",
  "............jJJJJJJj............",
  "................................",
  "..................bJ............",
  "..................bjW...........",
  "...............c.wwwww..........",
  "..................GG............",
  "..................gG............",
  "...............c................",
  "................................",
  "........JJJJJJJJJJJJJJJj........",
  "........jjjjjjjcMjjjjjjj........",
], { legend: KIT });
const BODICE_UP = part(33, Z.clothes, [
  "..........jJJJJJJJJJJj..........",
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
  "........JJJJJJJJJJJJJJJj........",
  "........jjjjjjjjjjjjjjjj........",
], { legend: KIT });
const BODICE_SIDE = part(33, Z.clothes, [
  "...............JJJj.............",
  "................jJJj............",
  "..................jJ............",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "...........JJJJJJJJJj...........",
  "...........jjjjjjjjjj...........",
], { legend: KIT });
const NO_WATCH = { ...BODICE_DOWN, rows: BODICE_DOWN.rows.map((r) => r.replace(/[Gg]/g, ".")) };
const bodice: Piece = (pose) => {
  if (pose.dir === "down") return [pose.action === "idle" && pose.beat === "habit" ? NO_WATCH : BODICE_DOWN];
  if (pose.dir === "up") return [BODICE_UP];
  return [pose.dir === "left" ? mirror(BODICE_SIDE) : BODICE_SIDE];
};

/** The dress from the belt to just below the knee, a box pleat at the front. */
const dress: Piece = (pose) => {
  const stride = pose.legs === "stepA" ? 1 : pose.legs === "stepB" ? -1 : 0;
  if (pose.dir === "down" || pose.dir === "up") {
    const hem = stride === 0
      ? [".......DDDDDDDDEEDDDDDDEE.......", ".......BBBBBBBBBBBBBBBBBB......."]
      : stride > 0
        ? ["......DDDDDDDDDEEDDDDDDEE.......", "......BBBBBBBBBBBBBBBBBBB......."]
        : [".......DDDDDDDDEEDDDDDDEEE......", ".......BBBBBBBBBBBBBBBBBBB......"];
    return [part(47, Z.skirt, [
      "........DDDDDDDEEDDDDDDE........",
      "........DDDDDDDEEDDDDDDE........",
      "........DEEEEDDEEDDEEEEE........",
      ".......DDEDDEDDEEDDEDDEEE.......",
      ".......DDDDDDDDEEDDDDDDEE.......",
      ".......DDDDDDDDEEDDDDDEEE.......",
      ".......DDDDDDDDEEDDDDDEEE.......",
      ...hem,
    ], { group: "legs" })];
  }
  const hem = stride === 0
    ? ["..........DDDDDDDDDDDEE.........", "..........BBBBBBBBBBBBB........."]
    : stride > 0
      ? [".........DDDDDDDDDDDDDEE........", ".........BBBBBBBBBBBBBBB........"]
      : [".......DDDDDDDDDDDDDDEE.........", ".......BBBBBBBBBBBBBBBB........."];
  const p = part(47, Z.skirt, [
    "...........DDDDDDDDDE...........",
    "...........DDDDDDDDDE...........",
    "..........DDDDDDDDDDEE..........",
    "..........DDDDDDDDDDEE..........",
    "..........DDDDDDDDDDEE..........",
    "..........DDDDDDDDDDEE..........",
    "..........DDDDDDDDDDDEE.........",
    ...hem,
  ], { group: "legs" });
  return [pose.dir === "left" ? mirror(p) : p];
};

/** Habit: her left hand lifts the fob watch from her breast to read it. */
const WATCH_ARM = [
  part(34, Z.arms, [
    ".....................VVV........",
    "....................VVVvv.......",
    "....................VVVvv.......",
    "....................VVVvv.......",
    "...................JJjjo........",
    ".................FFFFFf.........",
    "................SSFFff..........",
  ]),
  part(39, Z.hands, [
    "................SSG.............",
    "...............SSSgk............",
    "................skk.............",
  ], { legend: { G: "gold4", g: "gold2" } }),
];
const arms: Piece = (pose) => {
  const base = RIG.arms(pose);
  if (pose.dir === "down" && pose.action === "idle" && pose.beat === "habit") return [base[0], ...WATCH_ARM];
  return base;
};

export const NURSE = {
  id: "nurse",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "hair2",
    T: "white", t: "cream4", u: "cream3", C: "white", c: "cream3",
    V: "white", v: "cream4", X: "blue4", x: "blue3", F: "skin4", f: "skin3",
    J: "blue4", j: "blue3",
    P: "cream5", p: "cream3", N: "white", n: "cream3", Y: "stone3", y: "stone3",
    D: "white", E: "cream4", B: "cream3",
    H: "hair3", h: "hair2", d: "hair1",
  },
  hair,
  face,
  extras: [bodice, dress],
  body: { arms },
  walkFps: 8,
} as const;

export default defineSprites({
  ...defineCharacter(NURSE, ["idle", "walk"]),
});
