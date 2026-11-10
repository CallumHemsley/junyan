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

type Finish = { hi: Color; lit: Color; base: Color; dark: Color; line: Color; wear?: readonly [Color, Color] };
const WALNUT: Finish = { hi: "wood5", lit: "wood4", base: "wood3", dark: "wood2", line: "wood1" };
const LACQUER: Finish = { hi: "steel3", lit: "steel2", base: "ink2", dark: "steel1", line: "ink", wear: ["wood3", "wood4"] };

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
  wear(p, f, [[8, 2, 9], [7, 3, 3], [17, 3, 2], [5, 12, 1], [5, 13, 1]]);
  p.outline(f.line);
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
  wear(p, f, [[8, 11, 9], [7, 12, 3], [17, 12, 2]]);
  p.outline(f.line);
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
  wear(p, f, [[L.X(3, 4), 2, 4], [L.X(2, 2), 3, 2]]);
  p.outline(f.line);
}

/** The lacquer worn through to the brown wood where hands grab the hoop. */
function wear(p: Px, f: Finish, runs: readonly (readonly [number, number, number])[]) {
  if (!f.wear) return;
  p.over(() => { for (const [x, y, n] of runs) { p.hline(x, y, n, f.wear![0]); if (n > 3) p.hline(x + 1, y, n - 3, f.wear![1]); } });
}

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

  /** A black-lacquered bentwood chair bought second-hand, the lacquer worn through to brown on the hoop where hands pull it out, its cane seat split. Facing the camera. */
  "furn/chair-bentwood-b-down": { ...def, draw: (p) => chairDown(p, LACQUER, true) },
  /** Black bentwood chair from behind, the worn patch on the hoop. */
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
