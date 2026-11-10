/**
 * 小姨, the patient's aunt, about forty-five. Runs the breakfast shop; warm, loud, practical, up at
 * four. A tight dark-auburn perm done for the new year, gold studs, a big laugh. A mustard cardigan
 * buttoned over a cream blouse sprinkled with small pink flowers (the collar out over the knit),
 * dark slacks, black comfortable flats. A brown handbag on her shoulder and, in her other hand, an
 * orange string bag (网兜) sagging with a steel soup flask and too many oranges: she brought too much
 * food. A quick walk. Habit: laughs, eyes screwed shut.
 */
import { defineSprites, hash } from "../../kit/index.ts";
import { heldOffset } from "./_held.ts";
import { EAR_RIGHT, defineCharacter, mirror, part, sidedBy, Z, type Part, type Piece, type Pose } from "./_rig.ts";

const f = (y: number, rows: readonly string[]) => part(y, Z.face, rows, { group: "head" });

// ── the perm: a lumpy silhouette, dark auburn underneath, a jittered scatter of curls ──

/** Two curl shapes, a 3×3 and a 4×4: lit arc upper left, the body, a shadowed lower right. */
const CURLS = [
  ["HH.", "Hhh", ".hd"],
  [".HH.", "HHhh", "Hhhd", ".hd."],
];
/**
 * Fill the `#` cells of `mask` with dark auburn, then lay curls over it from top to bottom, one per
 * cell of a staggered 4-px lattice, each nudged by up to a pixel and sized by a hash. From column
 * `shadeFrom` the curls lose their highlight (the shadow side).
 */
function perm(y0: number, mask: readonly string[], shadeFrom: number, seed: number): Part {
  const grid = mask.map((row) => [...row].map((c) => (c === "#" ? "d" : c)));
  const inside = (x: number, j: number) => mask[j]?.[x] === "#";
  for (let j = -1; j < mask.length; j += 4) {
    const band = Math.floor((j + 1) / 4);
    for (let x = -2 + (band % 2) * 2; x < 32; x += 4) {
      const r = hash(x, j + y0, seed), jx = Math.floor(r * 3) - 1, jy = Math.floor(hash(j, x, seed + 1) * 3) - 1;
      const shape = CURLS[r < 0.4 ? 0 : 1];
      const cx = x + jx, cy = j + jy;
      shape.forEach((line, dy) => [...line].forEach((k, dx) => {
        const px = cx + dx, py = cy + dy;
        if (k === "." || !inside(px, py)) return;
        grid[py][px] = px >= shadeFrom && k === "H" ? "h" : k;
      }));
    }
  }
  return part(y0, Z.hair, grid.map((row) => row.join("")), { group: "head" });
}

const PERM_DOWN = perm(5, [
  "...........##..###...##.........",
  ".........#######.#######........",
  "......###################.......",
  ".....#####################......",
  "....######################......",
  "...########################.....",
  "....########################....",
  "...#########################....",
  "..##########################....",
  "...##########################...",
  "..###########################...",
  "..########.####..####.#######...",
  "...######...##.....#...######...",
  "..#####.................######..",
  "..######................#####...",
  ".######..................####...",
  "..#####..................#####..",
  "..#####..................####...",
  ".######.................#####...",
  "..####...................####...",
  "..#####..................###....",
  "...##.....................##....",
], 22, 3);
const PERM_UP = perm(5, [
  "...........##..###...##.........",
  ".........#######.#######........",
  "......###################.......",
  ".....#####################......",
  "....######################......",
  "...########################.....",
  "....########################....",
  "...#########################....",
  "..##########################....",
  "...##########################...",
  "..###########################...",
  "..###########################...",
  "...##########################...",
  "..############################..",
  "..###########################...",
  ".############################...",
  "..############################..",
  "..###########################...",
  ".###########################....",
  "..##########################....",
  "...###.#####.######.####.##.....",
  "....#....##....##.....#.........",
], 22, 5);
const PERM_RIGHT = perm(5, [
  "..........##..###..##...........",
  "........##########.##...........",
  "......################..........",
  ".....##################.........",
  "....####################........",
  "...######################.......",
  "....######################......",
  "...########################.....",
  "..#########################.....",
  "...#########################....",
  "..##########################....",
  "..###########.#####.###.##......",
  "...###########...#..#...........",
  "..############..................",
  ".#############..................",
  "..###########...................",
  "..############..................",
  ".############...................",
  "..##########....................",
  "...#########....................",
  "...#######......................",
  ".....###........................",
], 18, 7);

const STUDS = { G: "gold4" } as const;
const hair = sidedBy({
  down: () => [PERM_DOWN, part(27, Z.hair + 1, ["....G....................G......"], { legend: STUDS, group: "head" })],
  up: () => [PERM_UP],
  right: () => [PERM_RIGHT, { ...EAR_RIGHT, z: Z.hair + 1 }, part(27, Z.hair + 2, [".............G"], { legend: STUDS, group: "head" })],
});

// ── face: arched brows, bright eyes, a wide open smile ─────────────────────

const face = sidedBy({
  down: (pose: Pose): Part[] => {
    const laugh = pose.beat === "habit" && pose.action === "idle";
    const blink = pose.beat === "breath" && pose.action === "idle";
    const eyes = laugh
      ? ["................................", "..........ee........ee..........", ".........e..e......e..e........."]
      : blink
        ? ["................................", "................................", "..........ee........ee.........."]
        : ["..........we........we..........", "..........ee........ee..........", "..........ee........ee.........."];
    return [f(21, [
      ".........rrr........rrr.........",
      "........r..............r........",
      "................................",
      ...eyes,
      ".......bbb............bbb.......",
      ".......bbb...mwwwwm...bbb.......",
      laugh ? "..............mmmm.............." : "...............mm...............",
    ])];
  },
  up: () => [],
  right: (pose: Pose): Part[] => {
    const laugh = pose.beat === "habit" && pose.action === "idle";
    return [f(21, [
      "....................rrr.........",
      "...................r............",
      "................................",
      ...(laugh ? ["......................", ".....................ee", "....................e.."] : [".....................we", ".....................ee", ".....................ee"]),
      "..................bbb...........",
      "..................bbb.mwwm......",
      "......................mm........",
    ])];
  },
});

// ── the cardigan over the flowered blouse ──────────────────────────────────

const FLOWERS = part(34, Z.torso + 1, [
  "................................",
  "............K......K............",
  "..............L.K...............",
  "...........K.......L.K..........",
  "...............K................",
], { legend: { K: "pink2", L: "leaf3" } });

const CARDIGAN_DOWN = part(34, Z.clothes, [
  "........AACC........CCaa........",
  "........AAACC......CCaaa........",
  "........AAAAC......Caaaa........",
  "........AAAAAQ....Qaaaaa........",
  "........AAAAAAQ..Qaaaaaa........",
  "........AAAAAAAQGaaaaaaa........",
  "........AAAAAAAAQaaaaaaa........",
  "........AAAAAAAAGaaaaaaa........",
  "........AAAAAAAAQaaaaaaa........",
  "........AQQQQAAAGaaQQQQa........",
  "........AQAAQAAAQaaQaaQa........",
  "........AQQQQAAAGaaQQQQa........",
  "........AAAAAAAAQaaaaaaa........",
  ".......AQAQAQAQAQaQaQaQaa.......",
  ".......QAQAQAQAQAQaQaQaQa.......",
]);
const CARDIGAN_UP = part(34, Z.clothes, [
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAAaaaa........",
  "........AAAAAAAAAAAaaaaa........",
  "........AAAAAAAAAAAaaaaa........",
  "........AAAAAAAAAAAaaaaa........",
  "........AAAAAAAAAAAaaaaa........",
  "........AAAAAAAAAAAaaaaa........",
  "........AAAAAAAAAAAaaaaa........",
  ".......AQAQAQAQAQAQaQaQaa.......",
  ".......QAQAQAQAQAQAQaQaQa.......",
]);
const CARDIGAN_RIGHT = part(34, Z.clothes, [
  "...........AAAAA................",
  "..........AAAAAAACC.............",
  "..........AAAAAAAAAa............",
  "..........AAAAAAAAAG............",
  "..........AAAAAAAAAQ............",
  "..........AAAAAAAAAG............",
  "..........AAAAAAAAAQ............",
  "..........AAAAAAAAAG............",
  "..........AAAAAAAAAQ............",
  "..........AQQQQQAAAG............",
  "..........AQAAAQAAaQ............",
  "..........AQQQQQAAaG............",
  "..........AAAAAAAAaQ............",
  ".........AQAQAQAQAQa............",
  ".........QAQAQAQAQAQ............",
]);
const cardigan: Piece = (pose) => {
  if (pose.dir === "down") return [CARDIGAN_DOWN, FLOWERS];
  if (pose.dir === "up") return [CARDIGAN_UP];
  return [pose.dir === "left" ? mirror(CARDIGAN_RIGHT) : CARDIGAN_RIGHT];
};

// ── the handbag on her shoulder ────────────────────────────────────────────

const BAG = { W: "wood4", w: "wood3", b: "wood2", B: "wood1", g: "gold3", s: "wood5" } as const;
const HANDBAG = [
  "..bbbbb..",
  ".b.....b.",
  "bsWWWWWwb",
  "bWWWgWWwb",
  "bWWWWWWwb",
  "bwwwwwwwb",
  "bWWWWWWwb",
  "bWWWWWWwb",
  ".bBBBBBb.",
];
const handbag: Piece = (pose) => {
  if (pose.dir === "down") return [
    part(33, Z.sleeves, ["..b.", "..b.", "..b.", "..b.", "...b", "...b", "...b", "...b"], { x: 5, legend: BAG }),
    part(40, Z.sleeves + 1, HANDBAG, { x: 1, legend: BAG }),
  ];
  if (pose.dir === "up") return [
    part(33, Z.sleeves, ["b...", "b...", "b...", "b...", "b...", "b...", "b...", "b..."], { x: 24, legend: BAG }),
    part(40, Z.sleeves + 1, HANDBAG, { x: 22, legend: BAG }),
  ];
  // In profile the bag rides at her back hip.
  const p = part(41, Z.farArm, HANDBAG, { x: 4, legend: BAG });
  const strap = part(34, Z.sleeves, [".....bb", "....b..", "...b...", "..b....", ".b.....", "b......"], { x: 7, legend: BAG });
  return pose.dir === "left" ? [mirror(p), mirror(strap)] : [p, strap];
};

// ── the string bag: a steel soup flask and too many oranges ────────────────

const NET = { o: "orange1", O: "orange3", q: "orange2", Q: "gold4", l: "leaf3", M: "steel5", m: "steel4", n: "steel3", J: "jade4", j: "jade3", S: "skin4", k: "skin2" } as const;
const STRING_BAG = [
  "....oo.....",
  "...o..o....",
  "..o....o...",
  ".MMMMM..o..",
  ".JJJJJj..o.",
  ".jjjjjjlOO.",
  ".MmoMmnOQOq",
  ".MmMonnOOqq",
  ".MomMmnoqq.",
  ".MmMomnOOq.",
  ".MomMmOQOqq",
  ".MmMonOOoqq",
  "..nnnn.qqq.",
];
/** Drawn hanging from the screen-right hand from the front, the near hand in profile. */
const stringBag: Piece = (pose) => {
  const [dx, dy] = heldOffset(pose);
  if (pose.dir === "down") return [
    part(44 + dy, Z.hands, STRING_BAG, { x: 20 + dx, legend: NET }),
    part(43 + dy, Z.hands + 1, ["SSk", ".kk"], { x: 23 + dx, legend: NET }),
  ];
  if (pose.dir === "up") return [part(44 + dy, Z.hands, STRING_BAG, { x: 1 + dx, legend: NET })];
  const parts = [part(44 + dy, Z.hands, STRING_BAG, { x: 8 + dx, legend: NET }), part(44 + dy, Z.hands + 1, ["SSk"], { x: 11 + dx, legend: NET })];
  return pose.dir === "left" ? parts.map(mirror) : parts;
};

export const AUNT = {
  id: "aunt",
  slots: {
    S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin1", r: "brown1",
    T: "cream5", t: "cream4", u: "cream3", C: "white", c: "cream3",
    V: "gold3", v: "gold2", X: "gold2", x: "gold1", F: "gold3", f: "gold2",
    A: "gold3", a: "gold2", Q: "gold1", G: "cream4",
    P: "stone2", p: "stone1", N: "hair2", n: "hair1", Y: "ink2", y: "ink2",
    H: "brown3", h: "brown2", d: "brown1",
  },
  hair,
  face,
  extras: [cardigan, handbag, stringBag],
  walkFps: 6,
} as const;

export default defineSprites({
  ...defineCharacter(AUNT, ["idle", "walk"]),
});
