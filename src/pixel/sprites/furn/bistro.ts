/**
 * The bistro's dining furniture: four marble and zinc tables on iron and wood bases, the small
 * marble two-seater, and the oxblood leather banquette. Tables keep the room's anchors: the front
 * of the base on the floor, [32, 55] for the four big tables, with clear plate room on the top
 * between dy −49 and −27 of the anchor.
 */
import { defineSprites, type Legend, type Px } from "../../kit/index.ts";
import { each, grid, oval, ovalHalves, roundCorners } from "./_helpers.ts";

const IRON: Legend = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", k: "ink" };
const W: Legend = { "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5" };
const tableDef = { w: 64, h: 57, anchor: [32, 55], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 9, dy: -2 } } as const;

// ── marble and iron ──────────────────────────────────────────────────────────────────────────

/** A vein in the marble: a wandering line, darker in its middle stretch, with a lighter halo. */
function vein(p: Px, pts: readonly (readonly [number, number])[], dark = true) {
  p.over(() => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      p.line(ax, ay, bx, by, dark && i > 0 && i < pts.length - 2 ? "stone3" : "stone4");
    }
  });
}

/**
 * A white marble top seen three-quarter: lit from the upper left with a soft broad sheen, shaded
 * to the lower right, and a three-row edge showing under its front. `inside` says where the top
 * is so edge, light and veins can follow its shape.
 */
function marbleTop(p: Px, inside: (x: number, y: number, dx?: number, dy?: number) => boolean, box: readonly [number, number, number, number]) {
  const [x0, y0, w, h] = box;
  each(x0, y0, w, h, (x, y) => { if (inside(x, y)) p.px(x, y, "cream5"); });
  // Edge thickness: a lit bead, the face, its shadowed underside.
  each(x0, y0, w, h + 4, (x, y) => {
    if (inside(x, y)) return;
    if (inside(x, y, 0, 1)) p.px(x, y, "cream4");
    else if (inside(x, y, 0, 2)) p.px(x, y, "stone4");
    else if (inside(x, y, 0, 3)) p.px(x, y, "stone3");
  });
  each(x0, y0, w, h, (x, y) => {
    if (!inside(x, y)) return;
    const u = (x - x0) / w, v = (y - y0) / h;
    if (!inside(x, y, 1, 1) && u < 0.65 && v < 0.6) p.px(x, y, "white");
    else if (!inside(x, y, -1, -1) && u > 0.45) p.px(x, y, "stone5");
    else if (u + v > 1.25) p.px(x, y, "cream4");
    // A broad soft sheen from the window, upper left.
    else if (u + v * 1.3 > 0.25 && u + v * 1.3 < 0.55) p.px(x, y, "white");
  });
}

/** Soft grey clouding that drifts along a vein: short broken runs, never speckle. */
function clouds(p: Px, runs: readonly (readonly [number, number, number])[]) {
  p.over(() => { for (const [x, y, n] of runs) p.hline(x, y, n, "stone5"); });
}

/** A thick iron stroke: lit top row, body, dark lower row. */
function ironStroke(p: Px, pts: readonly (readonly [number, number])[]) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    p.line(ax, ay + 1, bx, by + 1, "steel1").line(ax, ay, bx, by, "steel2");
  }
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    p.line(ax, ay - 1, bx, by - 1, "steel3");
  }
}

/** Cast-iron column with a collar, a bulb and a spider bracket under the top. */
function ironColumn(p: Px, cx: number, top: number, bottom: number) {
  // Spider bracket arms reaching out under the top, in its shadow.
  p.rect(cx - 13, top, 26, 2, "steel1").rect(cx - 8, top + 2, 16, 1, "steel1");
  const x = cx - 3;
  p.rect(x, top + 2, 6, bottom - top - 2, "steel2").vline(x, top + 2, bottom - top - 2, "steel3").vline(x + 5, top + 2, bottom - top - 2, "steel1").vline(x + 4, top + 2, bottom - top - 2, "steel1");
  const collar = (y: number, w: number) => p.rect(cx - w / 2, y, w, 2, "steel2").hline(cx - w / 2, y, w, "steel3").px(cx - w / 2, y + 1, "steel3").px(cx + w / 2 - 1, y, "steel1").px(cx + w / 2 - 1, y + 1, "steel1");
  collar(top + 3, 10);
  collar(top + 8, 8);
  collar(top + 9, 8);
  collar(bottom - 3, 10);
  p.px(x + 1, top + 6, "steel4").px(x + 1, top + 12, "steel4");
}

/** A round marble bistro top, 62×32 on the 64-wide frame. */
const roundTop = oval(ovalHalves(62, 32), 1, 1);

// ── zinc and leather ─────────────────────────────────────────────────────────────────────────

const OX: Legend = { "1": "rose1", "2": "rose2", "3": "rose3", "4": "rose4", w: "wood1", W: "wood2", V: "wood3", b: "gold3", B: "gold5" };

/**
 * One 32px module of the buttoned oxblood banquette, seen from the front: a dark wood back rail,
 * the tufted back, the seat cushion, its piped front and the plinth. `end` adds a wooden side.
 */
function banquette(p: Px, end: "left" | "right" | "none", seed: number) {
  // Back rail.
  p.rect(0, 0, 32, 4, "wood2").hline(0, 0, 32, "wood3").hline(0, 1, 32, "wood3").hline(0, 3, 32, "wood1");
  p.over(() => p.hline(3 + (seed % 5), 1, 9, "wood4"));
  // Tufted back: diamond-pleated leather with brass-headed buttons in the dimples.
  p.rect(0, 4, 32, 18, "rose3");
  each(0, 4, 32, 18, (x, y) => {
    const row = Math.floor((y - 4) / 6), u = (x + (row % 2) * 4) % 8, v = (y - 4) % 6;
    const d = Math.abs(u - 4) * 3 + Math.abs(v - 3) * 4;
    if (d >= 11) p.px(x, y, "rose2");
    else if (d < 6 && u <= 4 && v <= 3) p.px(x, y, "rose4");
    else if (d > 7 && u > 4 && v > 3) p.px(x, y, "rose2");
    if (u === 4 && v === 0) p.px(x, y, "rose1");
  });
  p.hline(0, 4, 32, "rose1").hline(0, 21, 32, "rose1");
  // The seat cushion: a lit top, a piped edge, the front.
  p.rect(0, 22, 32, 8, "rose3").hline(0, 22, 32, "rose2").hline(0, 23, 32, "rose4");
  p.over(() => { p.hline(4 + (seed % 7), 24, 10, "rose4"); p.hline(18, 27, 8, "rose2"); });
  p.hline(0, 30, 32, "rose4").rect(0, 31, 32, 4, "rose2").hline(0, 34, 32, "rose1");
  // Wooden plinth with a kick-worn edge.
  p.rect(0, 35, 32, 5, "wood2").hline(0, 35, 32, "wood3").hline(0, 39, 32, "wood1");
  p.over(() => p.hline(6 + (seed % 9), 36, 7, "wood3"));
  if (end !== "none") {
    const x = end === "left" ? 0 : 28;
    p.rect(x, 0, 4, 40, "wood2").vline(x, 0, 40, end === "left" ? "wood4" : "wood3").vline(x + 3, 0, 40, "wood1");
    grid(p, x, 18, 4, ["5432", "4321"], W);
  }
}

const CAMEL: Legend = { T: "tan1", t: "tan2", n: "tan3", N: "tan4", v: "brown1", V: "brown2", W: "brown3", p: "plum1", P: "plum2", b: "brown1", s: "brown3", S: "brown2" };

/**
 * The camel coat left on the banquette's right end: hung by its shoulders over the back rail, the
 * collar standing up, lapels open on a plum lining, one sleeve hanging down past the seat front and
 * the other ending at the seat, the skirt folded forward onto the cushion. A Chesterfield: brown
 * velvet on the collar, a suede patch sewn on the left elbow, leather gloves pushed into the right
 * pocket. 20 wide, drawn from `x`.
 */
function coat(p: Px, x: number) {
  grid(p, x, 0, 20, [
    "......TWWWWWWT......",
    "...TTTVWppppWVTTT...",
    "..TNNNTVWppWVTNNnT..",
    ".TNnnnNTVVVVTNnnntT.",
    "TNntTnnNTPPTNnnTNntT",
    "TNntTnnnNTpTNnnTNntT",
    "TNntTnnnnNTTnnnTNntT",
    "TNntTnnnnnbtnnnTNntT",
    "TNntTnNnnnntnnnTNntT",
    "TNntTnNtnnntnnnTNntT",
    "TNntTnNtnnntnnnTNntT",
    "TNntTnNtnnbtnnnTNntT",
    "TtttTnnNtnntnnnTNntT",
    ".TNntTnNtnntnnnTtttT",
    ".TsstTnNnnntnnTNntT.",
    ".TSstTnnnnbtnnTNntT.",
    ".TNntTNNNnntNNTNntT.",
    ".TNntTtttnntttTNntT.",
    ".TNntTnnnnntNtTNNnT.",
    ".TNntTnNnnntNtTtttT.",
    ".TNntTnNtnntnNTvvvT.",
    ".TNntTtTTtTTTtTTTT..",
    ".TNntTNNnNNNNnNNNNT.",
    ".TNtNTnnTnnnnnTnnntT",
    ".TNtTnnnnTnnnnntnntT",
    ".TNtTnnnnntnnnnntnPT",
    ".TNtTnnnnnnTnnnnPPpT",
    ".TNtTttttTTTttttTTT.",
    ".TNtT...............",
    ".TNtT...............",
    ".TNNT...............",
    ".TNtT...............",
    ".TtttT..............",
    ".TNNtT..............",
    ".TvvvT..............",
  ], CAMEL);
  // The owner's brown leather gloves, stuffed into the right pocket.
  p.rows(x + 12, 14, ["WV", "Vv"], CAMEL);
  // Its shadow on the rail and leather to the right, under the skirt, and beside the hanging cuff.
  const shade = { rose4: "rose3", rose3: "rose2", rose2: "rose1", wood4: "wood3", wood3: "wood2", wood2: "wood1" } as const;
  p.swap(shade, [x + 20, 0, 1, 22]);
  p.swap(shade, [x + 6, 28, 14, 1]);
  p.swap(shade, [x + 5, 28, 1, 3]);
  p.swap(shade, [x + 6, 31, 1, 4]);
}

export default defineSprites({
  /**
   * Table 1. A round white-marble bistro table on a tripod of cast-iron scroll feet, from the old
   * café on Avenue Joffre when it closed. A long grey vein runs across it; a chip knocked out of
   * the front edge was filled with filler that never quite matched.
   */
  "furn/table-1": {
    ...tableDef,
    draw: (p) => {
      ironColumn(p, 32, 35, 48);
      ironStroke(p, [[30, 47], [23, 49], [15, 51], [9, 52], [6, 51], [6, 49], [8, 48]]);
      ironStroke(p, [[33, 47], [40, 49], [48, 51], [54, 52], [57, 51], [57, 49], [55, 48]]);
      grid(p, 28, 47, 8, ["32222211", ".322221.", ".322221.", ".322221.", "33222211", "32222211", "11111111"], IRON);
      marbleTop(p, roundTop.inside, [0, 0, 64, 34]);
      clouds(p, [[8, 19, 6], [10, 20, 5], [26, 14, 7], [28, 16, 5], [42, 9, 6], [44, 11, 4]]);
      vein(p, [[4, 20], [11, 18], [17, 19], [24, 15], [33, 14], [40, 10], [47, 9], [55, 6]]);
      vein(p, [[24, 15], [27, 19], [26, 23]], false);
      vein(p, [[40, 10], [44, 13], [51, 14]], false);
      // The chip, filled with yellowish filler, its outline still showing.
      grid(p, 20, 31, 7, [".22222.", "2ggggg2", ".2ggg2.", "..222.."], { "2": "stone4", g: "gold5" });
      p.outline("ink");
    },
  },

  /**
   * Table 2. A round white-marble table on four splayed iron legs with ball feet. A pale brown
   * ring where the regulars' teapot always stands, and a folded card under the right foot for
   * the wobble.
   */
  "furn/table-2": {
    ...tableDef,
    draw: (p) => {
      ironColumn(p, 32, 35, 46);
      ironStroke(p, [[30, 45], [22, 48], [13, 52]]);
      ironStroke(p, [[33, 45], [41, 48], [50, 52]]);
      grid(p, 29, 45, 6, ["322221", ".3221.", ".3221.", ".3221.", ".3221.", ".3221.", "322221", "322221"], IRON);
      for (const x of [10, 49, 29]) grid(p, x, 51, 5, [".333.", "32221", "32221", ".111."].slice(0, x === 29 ? 3 : 4), IRON);
      marbleTop(p, roundTop.inside, [0, 0, 64, 34]);
      clouds(p, [[12, 10, 6], [14, 12, 5], [48, 24, 7], [22, 24, 9], [24, 25, 6]]);
      vein(p, [[9, 9], [15, 12], [20, 11], [27, 14]], false);
      vein(p, [[46, 22], [50, 25], [57, 25]], false);
      // The teapot's ring.
      p.over(() => grid(p, 40, 12, 12, ["...tttttt...", ".tt......tt.", "t..........t", ".tt......tt.", "...tttttt..."], { t: "tan4" }));
      p.outline("ink");
      // The folded card under the right foot.
      p.rect(48, 55, 8, 1, "cream4").px(55, 55, "cream2").hline(48, 54, 2, "cream5");
    },
  },

  /**
   * Table 3. A square marble top on an iron base with four arched feet. A corner snapped off once
   * and was glued back; the glue line has yellowed. A pale circle where an ashtray sat for
   * decades before the owner banned smoking.
   */
  "furn/table-3": {
    ...tableDef,
    draw: (p) => {
      ironColumn(p, 32, 35, 48);
      ironStroke(p, [[30, 47], [25, 46], [18, 47], [13, 50], [11, 53]]);
      ironStroke(p, [[33, 47], [38, 46], [45, 47], [50, 50], [52, 53]]);
      grid(p, 9, 52, 6, ["322221", "111111"], IRON);
      grid(p, 49, 52, 6, ["322221", "111111"], IRON);
      grid(p, 29, 47, 6, ["322221", ".3221.", ".3221.", ".3221.", ".3221.", "332211", "322221", "111111"], IRON);
      const sq = (x: number, y: number, dx = 0, dy = 0) => {
        const lx = x - dx, ly = y - dy;
        if (lx < 1 || lx > 62 || ly < 1 || ly > 30) return false;
        const cx = Math.min(lx - 1, 62 - lx), cy = Math.min(ly - 1, 30 - ly);
        return !(cx + cy < 2);
      };
      marbleTop(p, sq, [0, 0, 64, 32]);
      clouds(p, [[6, 24, 7], [16, 21, 8], [18, 22, 6], [46, 6, 7], [52, 9, 6], [30, 9, 8]]);
      vein(p, [[3, 26], [10, 22], [14, 23], [22, 18], [26, 19], [31, 16]]);
      vein(p, [[44, 3], [47, 7], [53, 8], [60, 12]], false);
      // The glued corner, its yellowed line.
      grid(p, 50, 21, 13, [".........g...", "........g....", ".......g.....", "......g......", "....gg.......", "..gg.........", "gg..........."], { g: "gold4" });
      // The ashtray's pale circle.
      p.over(() => grid(p, 12, 6, 9, ["..wwwww..", ".w.....w.", "w.......w", ".w.....w.", "..wwwww.."], { w: "white" }));
      p.outline("ink");
    },
  },

  /**
   * Table 4. The big zinc-topped table from a wine bar on Rue Lafayette, on a dark wood frame with
   * turned legs. The zinc has gone soft grey and mottled, with a rolled front edge dented by
   * decades of glasses, scratches, and a ring where a hot pot was set down.
   */
  "furn/table-4": {
    ...tableDef,
    draw: (p) => {
      // Dark wood apron and turned legs with a low stretcher.
      p.rect(4, 35, 56, 6, "wood2").hline(4, 35, 56, "wood1").hline(4, 40, 56, "wood1");
      p.over(() => p.hline(14, 37, 12, "wood3").hline(36, 38, 9, "wood3"));
      p.rect(9, 48, 46, 2, "wood2").hline(9, 48, 46, "wood3");
      for (const x of [3, 54]) grid(p, x, 35, 7, [
        "3333322", "4433322", "4433322", "5443322", "4433322", ".44332.", ".43322.", "..432..", "..432..", ".44332.", "5443322", ".44332.", "..432..", "..432..", "..432..", ".44332.", "4433322", "3222221", ".22222.", ".22222.",
      ], W);
      // Zinc top with soft mottling, a window band, scratches and a ring.
      p.rect(1, 1, 62, 30, "steel4");
      roundCorners(p, 1, 1, 62, 30, 3, "tl tr");
      p.over(() => {
        for (const [x, y, n] of [[6, 5, 9], [5, 6, 12], [30, 18, 14], [28, 19, 10], [48, 8, 8], [47, 9, 10], [12, 23, 7], [40, 26, 11]] as const) p.hline(x, y, n, "steel3");
        for (const [x, y, n] of [[20, 4, 7], [44, 15, 9], [8, 14, 6], [52, 22, 6]] as const) p.hline(x, y, n, "steel5");
        each(1, 1, 62, 30, (x, y) => { const u = x - (y - 1) * 0.7; if (u > 10 && u < 15) p.px(x, y, "steel5"); if (u > 11 && u < 13 && y < 14) p.px(x, y, "steel6"); });
        p.hline(3, 1, 30, "steel6").vline(1, 4, 22, "steel5").vline(62, 4, 26, "steel3");
        p.line(36, 10, 44, 13, "steel5").line(37, 12, 41, 13, "steel5").line(14, 27, 20, 25, "steel3");
        grid(p, 18, 9, 10, ["...3333...", ".33....33.", "3........3", ".33....33.", "...3333..."], { "3": "steel3" });
      });
      // The rolled front edge: a round bead, dented where glasses hit it.
      p.hline(1, 31, 62, "steel6").hline(1, 32, 62, "steel5").hline(1, 33, 62, "steel4").hline(1, 34, 62, "steel2");
      for (const x of [11, 27, 46, 53]) p.rows(x, 31, ["3.", "26", ".5"], { "3": "steel3", "2": "steel2", "6": "steel6", "5": "steel5" });
      p.outline("ink");
    },
  },

  /**
   * The little round marble two-seater that stands in front of the banquette, its iron foot
   * scuffed silver by shoes. Plates: x 6–34, y 4–17.
   */
  "furn/table-bistro-small": {
    w: 40, h: 45, anchor: [20, 43], foot: [-18, -20, 36, 18], shadow: { rx: 19, ry: 7, dy: -2 },
    draw: (p) => {
      ironColumn(p, 20, 23, 37);
      ironStroke(p, [[18, 36], [12, 39], [6, 41], [4, 40]]);
      ironStroke(p, [[21, 36], [27, 39], [33, 41], [35, 40]]);
      grid(p, 17, 36, 6, ["322221", ".3221.", ".3221.", "332211", "322221", "111111"], IRON);
      p.px(19, 41, "steel4").px(20, 41, "steel5");
      const top = oval(ovalHalves(38, 20), 1, 1);
      marbleTop(p, top.inside, [0, 0, 40, 22]);
      clouds(p, [[8, 12, 5], [20, 9, 6], [22, 10, 4]]);
      vein(p, [[5, 13], [11, 11], [16, 12], [24, 8], [33, 7]]);
      p.outline("ink");
    },
  },

  /**
   * The banquette's left end: oxblood leather buttoned into diamonds on a dark wood frame, the
   * leather crazed and paler where twenty years of backs have rested. Modules are 32 wide.
   * Seated person: their anchor at this module's anchor (0, −4); draw them after the banquette.
   */
  "furn/banquette-left": {
    w: 32, h: 41, anchor: [16, 40], foot: [-16, -12, 32, 12], shadow: { rx: 16, ry: 4, dy: -1 },
    draw: (p) => { banquette(p, "left", 1); p.outline("wood1", { sides: ["top", "left", "bottom"] }); },
  },

  /**
   * A middle module of the banquette, the one everybody sits on: a seam at the front of the seat
   * has split and the horsehair stuffing is coming out. Sitter (0, −4).
   */
  "furn/banquette-mid": {
    w: 32, h: 41, anchor: [16, 40], foot: [-16, -12, 32, 12], shadow: { rx: 16, ry: 4, dy: -1 },
    draw: (p) => {
      banquette(p, "none", 2);
      grid(p, 17, 28, 9, ["....1111.", "..11cCc1.", ".1cCccC1.", "1cc1.1c1.", ".1....1.."], { "1": "rose1", c: "cream4", C: "tan3" });
      p.outline("wood1", { sides: ["top", "bottom"] });
    },
  },

  /** A plainer middle module, so a long run is not all the same: a crack in the leather and a brass button missing. Sitter (0, −4). */
  "furn/banquette-mid-b": {
    w: 32, h: 41, anchor: [16, 40], foot: [-16, -12, 32, 12], shadow: { rx: 16, ry: 4, dy: -1 },
    draw: (p) => {
      banquette(p, "none", 3);
      p.rows(9, 25, ["44.", ".144", "...1"], { "4": "rose4", "1": "rose1" });
      p.rows(20, 10, ["4"], { "4": "rose4" });
      p.outline("wood1", { sides: ["top", "bottom"] });
    },
  },

  /**
   * The banquette's right end, with a camel coat somebody left hanging over the back yesterday, its
   * skirt folded onto the seat and a sleeve hanging down the front; the owner keeps it there until
   * they come back. Sitter (−2, −4).
   */
  "furn/banquette-right": {
    w: 32, h: 41, anchor: [16, 40], foot: [-16, -12, 32, 12], shadow: { rx: 16, ry: 4, dy: -1 },
    draw: (p) => {
      banquette(p, "right", 4);
      coat(p, 6);
      p.outline("wood1", { sides: ["top", "right", "bottom"] });
    },
  },
});

