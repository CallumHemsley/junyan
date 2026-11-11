/**
 * 阿伟, the lane's courier, late twenties, always one parcel behind. A scuffed yellow scooter
 * half-helmet he never takes off between drops (a blue racing stripe he added himself, a scrape on
 * the right from the winter he skidded on the canal bridge), a padded blue delivery jacket with a
 * reflective band, dark work trousers, grey runners. A khaki messenger bag rides on his right hip
 * on a strap over his left shoulder; his phone, in an orange case, swings on a green lanyard. He
 * leans into every step. Habit: checks his phone for the next drop. Blinks on the breath.
 *
 * Actions: `idle`, `walk`, and `carry-parcel-idle` / `carry-parcel-walk` (a taped cardboard box in
 * both hands; its label is blank). The carry poses reuse the rig's carry arms.
 */
import { defineSprites, type SpriteSet } from "../../kit/index.ts";
import { RIG, EAR_RIGHT, defineCharacter, mirror, part, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

// ── a little row editor for procedural parts ──────────────────────────────

type Grid = string[][];
const grid = (h: number): Grid => Array.from({ length: h }, () => Array<string>(32).fill("."));
const put = (g: Grid, x: number, y: number, c: string) => { if (g[y] && x >= 0 && x < 32) g[y][x] = c; };
const stamp = (g: Grid, x: number, y: number, rows: readonly string[]) =>
  rows.forEach((row, j) => [...row].forEach((c, i) => { if (c !== ".") put(g, x + i, y + j, c); }));
const done = (g: Grid) => g.map((r) => r.join(""));

/** A lit dome, sun from the upper left: tones `2`–`5` on the gold ramp. */
function dome(g: Grid, y0: number, y1: number, cx: number, cy: number, rx: number, ry: number) {
  for (let y = y0; y <= y1; y++) for (let x = 0; x < 32; x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v;
    if (d > 1) continue;
    const z = Math.sqrt(1 - d), light = -0.55 * u - 0.55 * v + 0.45 * z;
    put(g, x, y, light > 0.95 ? "5" : light > 0.62 ? "4" : light > 0.2 ? "3" : "2");
  }
}

const HELMET = {
  "1": "gold1", "2": "gold2", "3": "gold3", "4": "gold4", "5": "gold5",
  B: "blue3", b: "blue2", c: "cream4", s: "steel2", W: "steel6", p: "steel3",
  g: "blue6", G: "blue5", v: "blue4", V: "blue3",
} as const;
const hat = (y: number, rows: readonly string[]) => part(y, Z.hat, rows, { legend: HELMET, group: "head" });

/** The racing stripe follows the crown of the shell. */
function stripe(g: Grid, x: number, y0: number, y1: number) {
  for (let y = y0; y <= y1; y++) if (g[y][x] !== ".") { put(g, x, y, "B"); if (g[y][x + 1] !== ".") put(g, x + 1, y, "b"); }
}

/** The shell's side flaps over the ears, seen from the front or back (grid rows 14–17). */
function flaps(g: Grid) {
  for (let x = 4; x <= 27; x++) put(g, x, 14, x < 8 ? "3" : "2");
  stamp(g, 4, 15, ["3321"]); stamp(g, 4, 16, ["3221"]); stamp(g, 5, 17, ["21"]);
  stamp(g, 24, 15, ["1221"]); stamp(g, 24, 16, ["1211"]); stamp(g, 25, 17, ["11"]);
}

const HELMET_DOWN = (() => {
  const g = grid(18); // rows 4..21
  dome(g, 1, 13, 16, 15.2, 12.1, 14.2);
  flaps(g);
  for (let x = 8; x <= 23; x++) put(g, x, 15, "1");
  stripe(g, 15, 0, 8);
  // The tinted visor, flipped up on the brow, on two little pivots.
  stamp(g, 10, 9, ["gGGvvvvvvvvV"]);
  stamp(g, 8, 10, ["gGGvvvvvvvvvvvvV"]);
  stamp(g, 8, 11, ["GvvvvvvvvvvvvvVV"]);
  stamp(g, 9, 12, ["VVVVVVVVVVVVVV"]);
  stamp(g, 7, 11, ["p"]); stamp(g, 24, 11, ["p"]);
  // Vent slots, and the old scrape on the right.
  stamp(g, 9, 6, ["11"]); stamp(g, 21, 6, ["11"]);
  stamp(g, 23, 7, ["c."]); stamp(g, 24, 8, ["c"]);
  return hat(4, done(g));
})();

const HELMET_UP = (() => {
  const g = grid(18); // rows 4..21
  dome(g, 1, 13, 16, 15.2, 12.1, 14.2);
  flaps(g);
  for (let x = 6; x <= 25; x++) put(g, x, 15, x < 8 || x > 23 ? g[15][x] : "2");
  for (let x = 8; x <= 23; x++) put(g, x, 16, "1");
  stripe(g, 15, 0, 15);
  stamp(g, 9, 6, ["11"]); stamp(g, 21, 6, ["11"]);
  // A rear reflector, and the scrape now on the left.
  stamp(g, 13, 12, ["WW..WW"]); stamp(g, 7, 7, [".c"]); stamp(g, 7, 8, ["c"]);
  return hat(4, done(g));
})();

const HELMET_RIGHT = (() => {
  const g = grid(18); // rows 4..21
  dome(g, 1, 14, 14.6, 15.4, 11.6, 14.4);
  // The rim, dropping lower at the back of the head, and the flap over the ear.
  for (let x = 3; x <= 24; x++) put(g, x, 14, x < 7 ? "3" : "2");
  stamp(g, 3, 15, ["111111"]); stamp(g, 3, 16, ["111"]);
  stamp(g, 9, 15, ["33222221"]); stamp(g, 10, 16, ["3222211"]); stamp(g, 11, 17, ["22111"]);
  // The stripe runs along the crown.
  for (let x = 6; x <= 19; x++) {
    let y = 0;
    while (y < 17 && g[y][x] === ".") y++;
    put(g, x, y, "B");
    if (x > 6) put(g, x, y + 1, "b");
  }
  // The visor, flipped up, standing proud of the brow.
  stamp(g, 19, 7, [".....gG"]);
  stamp(g, 19, 8, ["...gGGvV"]);
  stamp(g, 19, 9, [".gGGvvvV"]);
  stamp(g, 19, 10, ["GGvvvvvV"]);
  stamp(g, 19, 11, ["vvvvvvVV"]);
  stamp(g, 19, 12, [".VVVVVV"]);
  stamp(g, 18, 11, ["p"]);
  stamp(g, 9, 6, ["11"]); stamp(g, 14, 5, ["11"]);
  stamp(g, 4, 10, ["c"]); stamp(g, 5, 11, ["c"]);
  return hat(4, done(g));
})();

/** Chin strap: from the flaps down to the jaw. */
const STRAP_DOWN = part(22, Z.face, ["......s..................s......", ".......s................s.......", ".......s................s......."], { legend: HELMET, group: "head" });

const helmet = sidedBy({
  down: () => [HELMET_DOWN, STRAP_DOWN],
  up: () => [HELMET_UP],
  right: () => [HELMET_RIGHT],
});

// ── hair: short and dark brown, only what the helmet leaves showing ─────────

const h = (y: number, rows: readonly string[]) => part(y, Z.hair, rows, { group: "head" });
const hair = sidedBy({
  down: () => [h(20, [
    "........hHhh.H.......h.hhd......",
    ".........h..h...........d.......",
  ])],
  up: () => [h(20, [
    ".....dhhhhhhhhhhhhhhhhhhhhdd....",
    "......dhhhhhhhhhhhhhhhhhhdd.....",
    "......ddhhhhhhhhhhhhhhhhhdd.....",
    ".......ddhhhhhdhhhhdhhhhdd......",
    "........ddhhhdhhhhhhdhhdd.......",
    ".........ddhhhhhhhhhhhdd........",
    "...........dhhdhhdhhdd..........",
    "............d..d..d.d...........",
  ])],
  right: () => [
    h(20, [
      "....ddhhhhhhhh..................",
      "....ddhhhhhhhh..................",
      ".....ddhhhhdhh..................",
      ".....ddhhhhhhh..................",
      "......ddhhhdhh..................",
      ".......ddhhhh...................",
      "........dddd....................",
    ]),
    { ...EAR_RIGHT, z: Z.hair + 1 },
  ],
});

// ── face: busy, cheerful, brows set on the next address ────────────────────

const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });
const SWEAT = { w: "blue6", W: "blue5" } as const;

const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const phone = pose.beat === "habit" && pose.action === "idle";
    const blink = pose.beat === "breath" && pose.action === "idle";
    const eyes = blink
      ? ["................................", "................................", "..........ee........ee.........."]
      : phone
        ? ["................................", "..........ee........ee..........", "..........we........we.........."]
        : ["..........we........we..........", "..........ee........ee..........", "..........ee........ee.........."];
    const out = [f(21, [
      ".........rrr........rrr.........",
      "...........r........r...........",
      "................................",
      ...eyes,
      ".......bb..............bb.......",
      ".......bb...m.....m....bb.......",
      ".............mmmmm..............",
    ])];
    // A bead of sweat on the brisk walk.
    if (pose.action.endsWith("walk") && (pose.legs === "passA" || pose.legs === "passB")) out.push(part(21, Z.glasses, ["........................w", "........................W"], { legend: SWEAT, group: "head" }));
    return out;
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    const phone = pose.beat === "habit" && pose.action === "idle";
    const blink = pose.beat === "breath" && pose.action === "idle";
    const eye = blink
      ? ["......................", "......................", ".....................ee"]
      : phone
        ? ["......................", ".....................ee", ".....................ew"]
        : [".....................we", ".....................ee", ".....................ee"];
    const out = [f(21, [
      "....................rrr.........",
      "......................r.........",
      "................................",
      ...eye,
      "..................bb............",
      "..................bb...m........",
      ".....................mmm........",
    ])];
    if (pose.action.endsWith("walk") && (pose.legs === "passA" || pose.legs === "passB")) out.push(part(21, Z.glasses, ["..............w", "..............W"], { legend: SWEAT, group: "head" }));
    return out;
  },
});

// ── jacket details, bag, lanyard and phone ─────────────────────────────────

const KIT = {
  "1": "oak1", "2": "oak2", "3": "oak3", "4": "oak4", "5": "oak5", g: "gold4", G: "gold2",
  l: "jade4", L: "jade3", c: "orange3", C: "orange2", k: "ink", q: "blue4",
  z: "steel5", Z: "steel3", X: "steel6", x: "steel4", u: "blue1", U: "blue2",
} as const;
const kit = (y: number, z: number, rows: readonly string[]) => part(y, z, rows, { legend: KIT });

/** Two-pixel strap on a 45° run from (x, y) toward the lower left, `n` steps. */
function strapRows(x: number, y: number, n: number, h: number): string[] {
  const g = grid(h);
  for (let i = 0; i < n; i++) { put(g, x - i, y + i, "3"); put(g, x + 1 - i, y + i, "2"); }
  return done(g);
}

const BAG_FRONT = [
  ".1222222221.",
  "124444444421",
  "234444444432",
  "233333333332",
  "2333gGg33332",
  "122223222221",
  "233333333321",
  "233333333321",
  "233333333321",
  ".1111111111.",
];
const BAG_BACK = [
  ".1222222221.",
  "123333333321",
  "233333333321",
  "233333333321",
  "233333333321",
  "233322333321",
  "233333333321",
  "233333333321",
  ".1111111111.",
];

const jacket: Piece = (pose) => {
  const sway = pose.legs === "stepA" || pose.legs === "passA" ? 1 : pose.legs === "stepB" || pose.legs === "passB" ? -1 : 0;
  const carrying = pose.arms === "carry";
  const checking = pose.beat === "habit" && pose.action === "idle";
  if (pose.dir === "down") {
    const out: Part[] = [
      // Zip, a chest pocket, the reflective band and the elastic hem.
      kit(34, Z.clothes, [
        "................................",
        "...............z................",
        "...............Z................",
        "..........UUU..Z................",
        "..........UuU..Z................",
        "...............Z................",
        "........XXXXXXXXXXXXxxxx........",
        "........xxxxxxxxxxxxZZZZ........",
        "...............Z................",
        "...............Z................",
        "...............Z................",
        "........uuuuuuuuuuuuuuuu........",
        "........UUUUUUUUUUUUUUUU........",
      ]),
      kit(33, Z.clothes + 2, strapRows(21, 0, 11, 12)),
      kit(42, Z.arms + 3, BAG_FRONT.map((r) => "..." + r)),
    ];
    if (!carrying && !checking) out.push(
      kit(34, Z.clothes + 1, ["..............l", "..............l", "...............l"]),
      kit(34, Z.clothes + 3, [
        "..................l",
        "..................l",
        "..................l",
        "..................l",
        "..................l",
        ".................ccC",
        ".................ckC",
        ".................ccC",
        ".................CCC",
      ]),
    );
    return out;
  }
  if (pose.dir === "up") return [
    kit(34, Z.clothes, [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "........XXXXXXXXXXXXxxxx........",
      "........xxxxxxxxxxxxZZZZ........",
      "................................",
      "................................",
      "................................",
      "........uuuuuuuuuuuuuuuu........",
      "........UUUUUUUUUUUUUUUU........",
    ]),
    kit(33, Z.clothes + 1, ["...........llllllllll..........."]),
    kit(33, Z.clothes + 2, strapRows(9, 0, 11, 12).map((r) => [...r].reverse().join(""))),
    kit(42, Z.arms + 3, BAG_BACK.map((r) => "................." + r)),
  ];
  // Profile, facing right: the bag on the near hip, the phone swinging in front of the chest.
  const side: Part[] = [
    kit(34, Z.clothes, [
      "................................",
      "...................z............",
      "...................Z............",
      "...................Z............",
      "................................",
      "................................",
      "...........XXXXXXXXXx...........",
      "...........xxxxxxxxxZ...........",
      "................................",
      "................................",
      "................................",
      "...........uuuuuuuuuu...........",
      "...........UUUUUUUUUU...........",
    ]),
    kit(32, Z.clothes + 2, ["..............3322", "..............2..."]),
  ];
  // The bag rides on his right hip: on the near side facing right, peeking out behind him facing left.
  const bag: Part[] = pose.dir === "right"
    ? [kit(40, Z.clothes + 2, ["........32", ".......32."]), kit(42, Z.clothes + 3, BAG_FRONT.map((r) => "......" + r.slice(2, 12)))]
    : [
      kit(34, Z.clothes + 2, ["...................23", "....................23", ".....................2"]),
      kit(37, Z.behind, ["....................23", ".....................23", ".....................23", ".....................23", "......................2"]),
      kit(42, Z.behind, [".....................12", "....................2321", "....................2331", "....................2331", "....................2331", "....................2331", "....................2331", "....................2331", ".....................111"]),
    ];
  if (!carrying && !checking) {
    const dx = sway > 0 ? 1 : sway < 0 ? -1 : 0;
    side.push(kit(34, Z.arms + 2, [
      "....................l",
      "....................l",
      ".....................l",
      ".....................l",
      ".....................l",
      "....................ccC",
      "....................ckC",
      "....................ccC",
      "....................CCC",
    ].map((r, j) => (j < 2 ? r : dx > 0 ? "." + r : dx < 0 ? r.slice(1) : r))));
  }
  return [...(pose.dir === "left" ? side.map(mirror) : side), ...bag];
};

// ── habit: the phone comes up for the next address ─────────────────────────

const CHECK_DOWN: Part[] = [
  part(36, Z.sleeves, [
    "......................VVv",
    ".....................VVVv",
    "....................VVVv.",
    "...................FFFf..",
    "..................SSFf...",
    "..................SSk....",
  ]),
  kit(35, Z.hands, [
    "................l....",
    ".................l...",
    "..................ccC",
    "..................ckC",
    "..................ccC",
    "..................CCC",
  ]),
  part(39, Z.hands + 1, ["..................SS", "..................Ss"]),
];
const CHECK_RIGHT: Part[] = [
  part(34, Z.sleeves, [
    "............VVVV................",
    "...........VVVVVv...............",
    "...........VVVVVv...............",
    "...........VVVVvvFFF............",
    "...........XXXXxFFFFf...........",
    "............VVvvFFFf............",
    "..................SSS...........",
    "..................SSk...........",
  ]),
  kit(36, Z.hands, ["....................cC", "....................CC", "....................cC", "....................CC"]),
  part(38, Z.hands + 1, ["...................SS", "...................Sk"]),
];

const arms: Piece = (pose) => {
  const base = RIG.arms(pose);
  if (pose.action !== "idle" || pose.beat !== "habit") return base;
  if (pose.dir === "down") return [base[0], ...CHECK_DOWN];
  if (pose.dir === "right") return CHECK_RIGHT;
  if (pose.dir === "left") return CHECK_RIGHT.map(mirror);
  return base;
};

// ── the parcel ─────────────────────────────────────────────────────────────

const BOX = {
  "1": "bamboo1", "2": "bamboo2", "3": "bamboo3", "4": "bamboo4", "5": "bamboo5",
  t: "oak3", T: "oak2", w: "white", c: "cream3", k: "bamboo1",
} as const;
const box = (y: number, z: number, rows: readonly string[]) => part(y, z, rows, { legend: BOX });

const BOX_DOWN = box(37, Z.front, [
  ".........2222222Tt2222.........",
  ".........4555544tT4443.........",
  ".........4444444tT4443.........",
  ".........5444444tT4433.........",
  ".........3333333tT3332.........",
  ".........3333333tT3332.........",
  ".........333333.tT3332.........",
  ".........3333333tTwww2.........",
  ".........3333333tTwcc2.........",
  ".........2222222TT2222.........",
  ".........1111111111111.........",
]);
const HANDS_DOWN = part(41, Z.hands, [
  "........SSs.........ss..",
  ".......SSSSk.......sssk.",
  ".......sSSsk.......kssk.",
  "........sk..........kk..",
]);
const BOX_SIDE = box(36, Z.front, [
  ".................2222Tt222.....",
  ".................555tT4443.....",
  ".................444tT4433.....",
  ".................333tT3332.....",
  ".................333tT3332.....",
  ".................333tTww32.....",
  ".................333tTwc32.....",
  ".................333tT3332.....",
  ".................222TT2222.....",
  ".................111111111.....",
]);
const HANDS_SIDE = part(41, Z.hands, [
  "......................SSs.",
  ".....................SSSsk",
  "......................skk.",
]);

const parcel: Piece = (pose) => {
  if (pose.arms !== "carry") return [];
  if (pose.dir === "up") return [];
  if (pose.dir === "down") return [BOX_DOWN, HANDS_DOWN];
  const side = [BOX_SIDE, HANDS_SIDE];
  return pose.dir === "left" ? side.map(mirror) : side;
};

export const COURIER = {
  id: "courier",
  slots: {
    S: "tan4", s: "tan3", k: "tan2", b: "blush", m: "tan1", r: "hair1",
    T: "blue3", t: "blue2", u: "blue1", C: "blue4", c: "blue2",
    V: "blue3", v: "blue2", X: "steel5", x: "steel4", F: "blue3", f: "blue2",
    P: "jade2", p: "jade1", N: "steel5", n: "steel3", Y: "cream5", y: "cream3",
    H: "brown3", h: "brown2", d: "brown1",
  },
  hair,
  face,
  extras: [jacket, helmet, parcel],
  body: { arms },
  build: { lean: true },
  walkFps: 9,
} as const;

/** The carry poses, renamed so they never collide with the waiter's tray actions. */
function renameCarry(set: SpriteSet): SpriteSet {
  const out: SpriteSet = {};
  for (const [id, def] of Object.entries(set)) out[id.replace("/carry-", "/carry-parcel-")] = def;
  return out;
}

export default defineSprites({
  ...defineCharacter(COURIER, ["idle", "walk"]),
  ...renameCarry(defineCharacter(COURIER, ["carry-idle", "carry-walk"])),
});
