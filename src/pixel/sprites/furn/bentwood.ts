/**
 * Bentwood: the curved-back café chair in two finishes and four facings, and the bentwood hat
 * stand by the door.
 *
 * Chairs are 28×45 with the anchor at the front legs, [14, 43], like the room's other chairs.
 * Seated person (their own anchor, the foot pixel `[16, 62]` of a 32×64 frame) relative to the
 * chair's anchor: down (0, -4), left (-2, -4), right (+2, -4), drawn after the chair; up (0, -6),
 * drawn before the chair so its hoop covers them. Hips (0, -19).
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { each, grid, mirrorable, oval, ovalHalves } from "./_helpers.ts";

type Facing = "down" | "up" | "left" | "right";
type Finish = { hi: Color; lit: Color; base: Color; dark: Color; line: Color; lacquer?: boolean };
const WALNUT: Finish = { hi: "wood5", lit: "wood4", base: "wood3", dark: "wood2", line: "wood1" };
const LACQUER: Finish = { hi: "steel3", lit: "steel2", base: "ink2", dark: "steel1", line: "ink", lacquer: true };

/** A steam-bent member: lit top edge, body, dark underside, along a polyline. */
function bent(p: Px, pts: readonly (readonly [number, number])[], f: Finish, thick = 2) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    if (thick > 1) p.line(ax, ay + 1, bx, by + 1, f.dark);
    p.line(ax, ay, bx, by, f.base);
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    if (thick > 2) p.line(ax, ay - 1, bx, by - 1, f.lit);
  }
}

/** A ring of bent wood: the band between an oval and the same oval shrunk by `t`. Lit at the top left. */
function hoop(p: Px, w: number, h: number, left: number, top: number, t: number, f: Finish, rows: readonly [number, number]) {
  const outer = oval(ovalHalves(w, h), left, top), inner = oval(ovalHalves(w - t * 2, h - t * 2), left + t, top + t);
  each(left, top + rows[0], w, rows[1] - rows[0], (x, y) => {
    if (!outer.inside(x, y) || inner.inside(x, y)) return;
    const c = !outer.inside(x - 1, y - 1) && x < left + w / 2 ? f.lit : !outer.inside(x + 1, y + 1) || x > left + w * 0.7 ? f.dark : f.base;
    p.px(x, y, c);
  });
}

/** A vertical bentwood post lit on its screen-left side. */
function post(L: ReturnType<typeof mirrorable>, x: number, y: number, h: number, f: Finish) {
  L.rect(x, y, 2, h, f.base);
  L.px(x, y, f.lit);
  for (let j = 0; j < h; j++) L.px(x, y + j, j % 9 === 4 ? f.hi : f.lit);
  L.rect(x + 1, y, 1, h, f.dark);
}

/** The round seat: a bent rim and a cane panel; `split` tears the cane open. */
function seat(p: Px, f: Finish, split: boolean) {
  const s = oval(ovalHalves(24, 10), 2, 18);
  s.fill(p, f.base);
  p.under(() => { s.fill(p, f.lit, 0, 1); s.fill(p, f.base, 0, 2); s.fill(p, f.dark, 0, 3); });
  each(2, 18, 24, 10, (x, y) => {
    if (!s.inside(x, y)) return;
    if (!s.inside(x - 1, y - 1) && x < 14) p.px(x, y, f.lit);
  });
  // Cane: an octagon-hole weave inside the rim.
  const cane = oval(ovalHalves(18, 6), 5, 20);
  each(5, 20, 18, 6, (x, y) => {
    if (!cane.inside(x, y)) return;
    const hole = x % 3 === 1 && y % 2 === 1;
    p.px(x, y, hole ? "bamboo2" : (x + y) % 3 === 0 ? "bamboo5" : "bamboo4");
  });
  if (split) grid(p, 13, 21, 7, [".5..5..", "51115.5", ".1111..", "..5.1.5"], { "1": "wood1", "5": "bamboo5" });
}

/** The ring stretcher: a thin bent hoop joining the four legs, its back arc in shade. */
function stretcher(p: Px, f: Finish) {
  const outer = oval(ovalHalves(20, 6), 4, 35), inner = oval(ovalHalves(18, 4), 5, 36);
  each(4, 35, 20, 6, (x, y) => {
    if (!outer.inside(x, y) || inner.inside(x, y)) return;
    p.px(x, y, y < 38 ? f.dark : y === 38 ? f.lit : f.base);
  });
}

function legsDown(p: Px, L: ReturnType<typeof mirrorable>, f: Finish, back: boolean) {
  // Back legs, short and in shade, the ring stretcher, then the splayed front legs.
  if (back) { L.rect(8, 31, 2, 7, f.dark); L.rect(18, 31, 2, 7, f.dark); }
  stretcher(p, f);
  bent(p, [[5, 31], [4, 37], [3, 42]], f, 1); bent(p, [[6, 31], [5, 37], [4, 42]], f, 1);
  L.px(5, 31, f.lit);
  bent(p, [[21, 31], [22, 37], [23, 42]], f, 1); bent(p, [[22, 31], [23, 37], [24, 42]], f, 1);
  p.px(3, 42, f.dark).px(4, 42, f.dark).px(23, 42, f.dark).px(24, 42, f.dark);
  for (const [x, y] of [[3, 39], [22, 38]] as const) p.px(x, y, f.lit);
}

function chairDown(p: Px, f: Finish, split: boolean) {
  const L = mirrorable(p, 28, false);
  // The back hoop and the inner loop, behind the seat.
  hoop(p, 18, 14, 5, 2, 2, f, [0, 7]);
  post(L, 5, 9, 12, f); post(L, 21, 9, 12, f);
  hoop(p, 10, 8, 9, 6, 1, f, [0, 4]);
  L.rect(9, 10, 1, 9, f.base); L.rect(18, 10, 1, 9, f.dark);
  legsDown(p, L, f, true);
  seat(p, f, split);
  finish(p, f, "down");
}

function chairUp(p: Px, f: Finish, split: boolean) {
  const L = mirrorable(p, 28, false);
  legsDown(p, L, f, false);
  L.rect(8, 30, 2, 8, f.dark); L.rect(18, 30, 2, 8, f.dark);
  seat(p, f, split);
  // The hoop rises from the front of the seat; its posts run on down to the floor.
  hoop(p, 18, 14, 5, 11, 2, f, [0, 7]);
  hoop(p, 10, 8, 9, 15, 1, f, [0, 4]);
  L.rect(9, 19, 1, 9, f.base); L.rect(18, 19, 1, 9, f.dark);
  post(L, 5, 18, 13, f); post(L, 21, 18, 13, f);
  bent(p, [[5, 31], [4, 37], [3, 42]], f, 1); bent(p, [[6, 31], [5, 37], [4, 42]], f, 1);
  bent(p, [[22, 31], [23, 37], [24, 42]], f, 1); bent(p, [[21, 31], [22, 37], [23, 42]], f, 1);
  finish(p, f, "up");
}

function chairSide(p: Px, f: Finish, split: boolean, flip: boolean) {
  const L = mirrorable(p, 28, flip);
  // Far legs and the ring, then the seat, then the hoop turned a little toward us.
  L.rect(18, 31, 2, 7, f.dark);
  stretcher(p, f);
  const near = (pts: [number, number][]) => pts.map(([x, y]) => [L.X(x), y] as const);
  bent(p, near([[21, 31], [22, 37], [23, 42]]), f, 1); bent(p, near([[22, 31], [23, 37], [24, 42]]), f, 1);
  seat(p, f, split);
  // The hoop: a narrow leaning loop, its near edge running down to the floor as the back leg.
  L.grid(1, 2, 8, [
    "..aaab..",
    ".ab..bd.",
    "ab....d.",
    "ab....bd",
    ".ab...bd",
    ".ab...bd",
    ".ab..cbd",
    ".ab..cbd",
    ".ab..cbd",
    ".ab..cbd",
    ".ab..cbd",
    "..ab.cbd",
    "..ab.cbd",
    "..ab.cbd",
    "..ab.cbd",
    "..ab.cbd",
    "..ab.cbd",
    "..ab..bd",
  ], { a: f.lit, b: f.base, c: flip ? f.lit : f.dark, d: f.dark });
  bent(p, near([[3, 20], [3, 31], [2, 37], [1, 42]]), f, 1); bent(p, near([[4, 20], [4, 31], [3, 37], [2, 42]]), f, 1);
  finish(p, f, flip ? "left" : "right");
}

/**
 * Outline the chair. Walnut is outlined everywhere; black lacquer only around its silhouette, so
 * the floor shows through the openwork instead of a second ring of ink around every member, and it
 * gets its gloss and wear first.
 */
function finish(p: Px, f: Finish, facing: Facing) {
  if (!f.lacquer) { p.outline(f.line); return; }
  relight(p);
  p.over(() => { for (const [x, y, row] of LACQUER_DETAIL[facing]) p.rows(x, y, [row], LACQUER_LEGEND); });
  outlineOutside(p, f.line);
}

const FRAME = new Set<Color>(["ink2", "steel1", "steel2", "steel3"]);

/**
 * Re-light every lacquered member from the upper left: the warm plum black where an edge faces up
 * or left, the cool black where it faces down or right. The shine itself is hand-placed after.
 */
function relight(p: Px) {
  const empty = (x: number, y: number) => !p.solid(x, y);
  const hits: [number, number, Color][] = [];
  each(0, 0, p.w, p.h, (x, y) => {
    const c = p.get(x, y);
    if (!c || !FRAME.has(c)) return;
    if (empty(x - 1, y) || empty(x, y - 1)) hits.push([x, y, "ink2"]);
    else if (empty(x + 1, y) || empty(x, y + 1)) hits.push([x, y, "steel1"]);
  });
  for (const [x, y, c] of hits) p.px(x, y, c);
}

/** One-pixel outline on the transparent pixels that the outside of the silhouette reaches, leaving enclosed holes clear. */
function outlineOutside(p: Px, c: Color) {
  const outside = new Uint8Array(p.w * p.h), stack: [number, number][] = [];
  const visit = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h || outside[y * p.w + x] || p.solid(x, y)) return;
    outside[y * p.w + x] = 1;
    stack.push([x, y]);
  };
  for (let x = 0; x < p.w; x++) { visit(x, 0); visit(x, p.h - 1); }
  for (let y = 0; y < p.h; y++) { visit(0, y); visit(p.w - 1, y); }
  while (stack.length) { const [x, y] = stack.pop()!; visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1); }
  const hits: [number, number][] = [];
  each(0, 0, p.w, p.h, (x, y) => {
    if (outside[y * p.w + x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => p.solid(x + dx, y + dy))) hits.push([x, y]);
  });
  for (const [x, y] of hits) p.px(x, y, c);
}

/** Gloss and wear, hand-placed per facing: 3 and 4 are the cool reflection of the window along the bent wood; b–e are the brown wood where the lacquer has worn through. */
const LACQUER_LEGEND = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", K: "ink2", b: "wood2", c: "wood3", d: "wood4", e: "wood5" } as const;
type Detail = readonly (readonly [x: number, y: number, row: string])[];
/** Wear that a seat front, both knees and the stretcher share in every facing, mirrored for the left. */
const LEGS: Detail = [
  [21, 31, "2"], [21, 32, "3"], [21, 33, "2"],
  [22, 36, "c"], [22, 37, "dc"], [22, 38, "b"],
  [12, 40, "bcddcb"],
];
const LACQUER_DETAIL: Record<Facing, Detail> = {
  down: [
    // The shine along the hoop's upper-left arc and down the left post, broken where the lacquer is crazed.
    [11, 2, "22"], [8, 3, "332"], [7, 4, "43"], [6, 5, "3"], [6, 6, "3"], [5, 7, "2"], [5, 8, "2"],
    [5, 9, "2"], [5, 10, "3"], [5, 11, "3"], [5, 12, "2"], [5, 13, "2"], [5, 14, "2"], [5, 17, "2"], [5, 18, "2"],
    [12, 6, "23"], [10, 7, "22"], [9, 8, "2"], [9, 9, "2"], [9, 10, "2"], [9, 11, "2"], [9, 13, "2"],
    [21, 9, "2"], [21, 10, "2"], [21, 11, "2"], [21, 14, "2"], [21, 15, "2"],
    // Worn through where hands pull the chair out by the top of the hoop.
    [13, 2, "cded"], [13, 3, "bcdcb"], [19, 4, "c"],
    // The seat rim: shine at the back, the front edge rubbed bare by thighs.
    [6, 19, "2332"], [4, 20, "22"], [3, 21, "2"], [2, 22, "2"], [2, 23, "2"],
    [11, 27, "bccb"], [10, 28, "bcdedcb"], [12, 29, "bccb"], [18, 28, "c"],
    // Legs: shine high on the front legs, the knees and the stretcher worn by shoes.
    [5, 31, "2"], [5, 32, "3"], [5, 33, "2"], [4, 34, "2"],
    [4, 36, "c"], [4, 37, "dc"], [4, 38, "cb"],
    ...LEGS,
  ],
  up: [
    // From behind: the same shine, and the heaviest wear, where the chair is pulled from the table.
    [11, 11, "2"], [8, 12, "332"], [7, 13, "43"], [6, 14, "3"], [6, 15, "3"], [5, 16, "2"], [5, 17, "2"],
    [5, 18, "2"], [5, 19, "3"], [5, 20, "3"], [5, 21, "2"], [5, 22, "2"], [5, 23, "2"], [5, 26, "2"], [5, 27, "2"],
    [12, 15, "23"], [10, 16, "22"], [9, 17, "2"], [9, 18, "2"], [9, 19, "2"], [9, 20, "2"], [9, 22, "2"],
    [12, 11, "bcded"], [12, 12, "bcdcbb"], [19, 13, "c"],
    [12, 28, "bcdcb"], [13, 29, "bc"],
    [5, 31, "2"], [5, 32, "3"], [5, 33, "2"], [4, 34, "2"],
    [4, 36, "c"], [4, 37, "dc"], [4, 38, "cb"],
    ...LEGS,
  ],
  right: [
    // The hoop's top, worn at the back where it is gripped; shine down its outer edge and the back leg.
    [3, 2, "3cdd"], [6, 3, "dc"], [7, 4, "b"],
    [2, 3, "3"], [1, 4, "3"], [1, 5, "4"], [2, 6, "3"], [2, 7, "2"], [2, 8, "2"], [2, 9, "3"], [2, 10, "2"], [2, 11, "2"],
    [3, 13, "2"], [3, 14, "2"], [3, 16, "2"], [3, 17, "2"], [3, 21, "2"], [3, 22, "2"], [3, 23, "3"], [3, 24, "2"], [3, 27, "2"], [3, 28, "2"],
    [6, 9, "2"], [6, 10, "3"], [6, 11, "2"], [6, 13, "2"], [6, 14, "2"],
    [10, 18, "2332"], [5, 19, "2"],
    // The front of the seat rim, rubbed bare.
    [24, 23, "c"], [23, 24, "dc"], [23, 25, "cb"], [23, 26, "b"],
    [2, 36, "c"], [2, 37, "cb"],
    ...LEGS,
  ],
  left: [
    [21, 2, "ddc2"], [20, 3, "cd"], [20, 4, "b"],
    [19, 5, "4"], [19, 6, "3"], [19, 7, "2"], [19, 8, "2"], [19, 9, "3"], [19, 10, "2"], [19, 11, "2"],
    [19, 13, "2"], [19, 14, "2"], [19, 16, "2"], [19, 17, "2"],
    [21, 8, "1"], [21, 9, "1"], [21, 10, "1"], [21, 11, "1"], [21, 12, "1"], [21, 13, "1"], [21, 14, "1"], [21, 15, "1"], [21, 16, "1"], [21, 17, "1"],
    [24, 6, "2"], [24, 8, "2"], [24, 9, "2"], [24, 10, "3"], [23, 13, "2"], [23, 14, "2"], [23, 16, "2"],
    [23, 21, "2"], [23, 22, "2"], [23, 23, "3"], [23, 24, "2"], [23, 30, "2"], [23, 31, "2"],
    [5, 19, "2332"], [4, 20, "2"], [3, 21, "2"], [2, 22, "2"],
    [3, 23, "c"], [3, 24, "dc"], [3, 25, "cb"], [3, 26, "b"],
    [5, 31, "2"], [5, 32, "3"], [5, 33, "2"], [4, 34, "2"],
    [4, 36, "c"], [4, 37, "dc"], [4, 38, "cb"],
    [24, 36, "c"], [24, 37, "cb"],
    [10, 40, "bcddcb"],
  ],
};

const def = { w: 28, h: 45, anchor: [14, 43], foot: [-12, -12, 24, 11], shadow: { rx: 13, ry: 5, dy: -1 } } as const;

export default defineSprites({
  /** The walnut bentwood chairs that came with the marble tables from the old café on Avenue Joffre; the cane is original. Facing the camera. */
  "furn/chair-bentwood-down": { ...def, draw: (p) => chairDown(p, WALNUT, false) },
  /** Walnut bentwood chair from behind: the hoop and its inner loop. */
  "furn/chair-bentwood-up": { ...def, draw: (p) => chairUp(p, WALNUT, false) },
  /** Walnut bentwood chair, sitter facing left. */
  "furn/chair-bentwood-left": { ...def, draw: (p) => chairSide(p, WALNUT, false, true) },
  /** Walnut bentwood chair, sitter facing right. */
  "furn/chair-bentwood-right": { ...def, draw: (p) => chairSide(p, WALNUT, false, false) },

  /**
   * A black-lacquered bentwood chair bought second-hand, its cane seat split. The lacquer still
   * catches the window along the hoop, but it has worn through to brown wood on the hoop top where
   * hands pull it out, on the seat's front edge, on the knees of the legs and on the stretcher where
   * shoes rest. Facing the camera.
   */
  "furn/chair-bentwood-b-down": { ...def, draw: (p) => chairDown(p, LACQUER, true) },
  /** Black bentwood chair from behind, the hoop worn most here, where it is pulled from the table. */
  "furn/chair-bentwood-b-up": { ...def, draw: (p) => chairUp(p, LACQUER, true) },
  /** Black bentwood chair, sitter facing left. */
  "furn/chair-bentwood-b-left": { ...def, draw: (p) => chairSide(p, LACQUER, true, true) },
  /** Black bentwood chair, sitter facing right. */
  "furn/chair-bentwood-b-right": { ...def, draw: (p) => chairSide(p, LACQUER, true, false) },

  /**
   * The bentwood hat stand inside the door, its curled hooks worn pale. Mr Liu's grey fedora on
   * the top hook and a bottle-green knitted scarf somebody's mother made, the fringe unravelling.
   */
  "furn/hat-stand-bentwood": {
    w: 32, h: 88, anchor: [16, 86], foot: [-6, -4, 12, 4], shadow: { rx: 10, ry: 3, dy: -1 },
    draw: (p) => {
      // Splayed S-curved legs and the umbrella ring.
      bent(p, [[14, 70], [11, 76], [7, 81], [3, 84], [2, 85]], WALNUT, 3);
      bent(p, [[17, 70], [20, 76], [24, 81], [28, 84], [29, 85]], WALNUT, 3);
      hoop(p, 22, 6, 5, 58, 2, WALNUT, [0, 3]);
      p.rect(14, 4, 4, 81, "wood3").vline(14, 4, 81, "wood4").vline(17, 4, 81, "wood2");
      p.rect(13, 82, 6, 3, "wood2").hline(13, 82, 6, "wood3");
      hoop(p, 22, 6, 5, 58, 2, WALNUT, [3, 6]);
      grid(p, 13, 0, 6, ["..55..", ".5443.", ".4332.", "..32..", ".4332."], { "5": "wood5", "4": "wood4", "3": "wood3", "2": "wood2" });
      // Curled hooks in two tiers.
      bent(p, [[14, 12], [10, 9], [6, 9], [4, 11], [5, 13], [7, 13]], WALNUT, 3);
      bent(p, [[17, 12], [21, 9], [25, 9], [27, 11], [26, 13], [24, 13]], WALNUT, 3);
      bent(p, [[14, 24], [9, 21], [6, 22], [5, 24], [7, 25]], WALNUT, 3);
      bent(p, [[17, 24], [22, 21], [25, 22], [26, 24], [24, 25]], WALNUT, 3);
      p.outline("wood1");
      // The fedora on the top left hook: a pinched crown, a dark band with a bow, the brim curled up at the sides.
      grid(p, 1, 2, 12, [
        "....gGGg....",
        "...gGgDgg...",
        "..gGgDDggg..",
        "..gGggggggk.",
        "..kkkkkkKkk.",
        "Gg.......gGk",
        ".gggggggggk.",
        "..kkkkkkkk..",
      ].map((r) => r.replace(/\./g, (m, i: number, str: string) => m)), { g: "grey2", G: "grey3", D: "grey1", k: "ink2", K: "grey3" });
      p.rect(3, 7, 8, 1, "grey2");
      // The scarf over the right hook: two knitted ends hanging side by side, stripes, a fringe.
      grid(p, 21, 9, 9, [
        "..jjjjj..",
        ".jJJJJjj.",
        ".jJjJJjJ.",
        ".jJjJJjJ.",
        ".ccc.ccc.",
        ".jJj.jJJ.",
        ".jJj.jJJ.",
        ".jJj.jJJ.",
        ".ccc.jJJ.",
        ".jJj.ccc.",
        ".jJj.jJJ.",
        ".jJj.jJJ.",
        ".ccc.jJJ.",
        ".jJj.jJJ.",
        ".f.f.ccc.",
        ".f.f.jJJ.",
        "......f.f",
        "......f.f",
      ], { j: "jade3", J: "jade2", c: "cream4", f: "jade4" });
    },
  },
});
