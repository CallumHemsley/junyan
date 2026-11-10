/**
 * The service counter: a bistro bar left by the French tailor who had the shop before the war,
 * and kept by the cook's family ever since. A zinc top, hammered back flat more than once, its
 * rolled front edge bright from forearms; a front of dark polished wood in raised panels; a brass
 * foot rail on small brackets, rubbed gold where shoes rest and tarnished brown everywhere else.
 * One panel was replaced in a redder wood after a cart backed into it. The leg of the L, where the
 * cook sets bowls down, is a slab of white marble with grey veins, ringed by years of tea.
 *
 * Horizontal modules are 32×52: an outline row, 15 rows of zinc, a rolled bead (rows 16–21) with
 * its shadow on the wood, a panelled front with the foot rail at rows 41–43, a plinth and an
 * outline row. Anchor [16, 51]. They tile left to right: `counter-left`, any mix of
 * `counter-mid-a/-b/-c`, `counter-right`.
 *
 * The leg of the L runs north–south, seen from above: `counter-v-top` (its back end, against the
 * wall), `counter-v-mid` / `-mid-b` / `-mid-c`, then `counter-v-bottom` (a free end) or
 * `counter-corner` (joining a run that leaves east). Place every piece with its anchor on its own
 * tile's bottom row (y = 32r + 31); the leg's tops are drawn lifted to the counter-top height and
 * butt seamlessly into the corner. The v-top and v-mid anchors therefore sit below their art.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";

type End = "left" | "right" | "both" | "none";
type Cluster = readonly [x: number, y: number, length: number];

// ── zinc ─────────────────────────────────────────────────────────────────────

/**
 * The zinc top, rows 1..15: a soft mottled patina in small clouds (never speckle), lighter where
 * cloths wipe, darker where water stood. `light`/`dark` are hand-placed cloud rows per module.
 */
function zincTop(p: Px, light: readonly Cluster[], dark: readonly Cluster[]) {
  p.rect(0, 1, 32, 15, "steel4");
  for (let x = 0; x < 32; x++) if ((x * 5) % 9 > 1) p.px(x, 1, "steel5");
  p.hline(3, 2, 10, "steel5");
  p.over(() => {
    // Light clouds are wiped, so they are broad and faint: a single row, broken in the middle.
    for (const [x, y, n] of light) p.hline(x, y, Math.ceil(n / 2) - 1, "steel5").hline(x + Math.ceil(n / 2) + 1, y, Math.floor(n / 2) - 1, "steel5");
    for (const [x, y, n] of dark) p.hline(x, y, n, "steel3").hline(x + 1, y + 1, Math.max(1, n - 3), "steel3");
  });
}

/** The rolled bead along the front, rows 16..21, and its shadow on the wood at row 22. */
function zincBead(p: Px, bright: readonly Cluster[] = []) {
  p.hline(0, 16, 32, "steel3").hline(0, 17, 32, "steel5").hline(0, 18, 32, "steel6");
  p.hline(0, 19, 32, "steel4").hline(0, 20, 32, "steel3").hline(0, 21, 32, "steel2").hline(0, 22, 32, "wood1");
  // Polished brighter where forearms rest on it.
  p.over(() => { for (const [x, y, n] of bright) p.hline(x, y, n, y === 18 ? "white" : "steel6"); });
}

/** A dent: a little crescent, shaded on its upper-left wall, lit on its lower-right lip. */
function dent(p: Px, x: number, y: number) {
  p.rows(x, y, [".33.", "3225", ".55."], { 3: "steel3", 2: "steel2", 5: "steel5" });
}

/** A glass ring left on the zinc: a dull grey ellipse. */
function zincRing(p: Px, x: number, y: number) {
  p.rows(x, y, ["..3333..", ".3....3.", "3......3", ".3....2.", "..3322.."], { 3: "steel3", 2: "steel2" });
}

// ── marble ───────────────────────────────────────────────────────────────────

type Vein = readonly (readonly [number, number])[];

/**
 * White marble slab across rows y..y+h-1 of the leg: a cloudy ground, grey veins wandering along
 * `veins` (polylines, drawn with a soft halo), a lit west bevel, a shaded east edge for thickness,
 * and a hairline joint at the top of the slab.
 */
function marbleSlab(p: Px, y: number, h: number, veins: readonly Vein[], east = true, joint = true) {
  p.rect(1, y, 30, h, "cream5");
  // Clouds in the stone.
  p.over(() => {
    for (let j = 0; j < h; j += 5) {
      const x = 4 + (((y + j) * 7) % 17);
      p.hline(x, y + j + 1, 7, "white").hline(x + 1, y + j + 2, 5, "white");
    }
  });
  p.clip(1, y, 30, h, () => {
    for (const vein of veins) {
      for (let i = 0; i + 1 < vein.length; i++) {
        const [x0, y0] = vein[i], [x1, y1] = vein[i + 1];
        p.line(x0, y0, x1, y1, "stone5");
      }
      for (let i = 0; i + 1 < vein.length; i++) {
        const [x0, y0] = vein[i], [x1, y1] = vein[i + 1];
        p.line(x0 - 1, y0, x1 - 1, y1, i === 1 ? "stone3" : "stone4");
      }
    }
  });
  p.vline(1, y, h, "white").vline(2, y, h, "white");
  if (east) p.vline(28, y, h, "stone5").vline(29, y, h, "stone4").vline(30, y, h, "stone3");
  if (joint) p.hline(1, y, east ? 28 : 31, "stone4").hline(1, y + 1, east ? 28 : 31, "white");
  p.vline(0, y, h, "stone1");
  if (east) p.vline(31, y, h, "stone1");
}

/** Marble bullnose along a free front edge, rows 16..21, then the shadow on the wood. */
function marbleBead(p: Px) {
  p.hline(0, 16, 32, "stone5").hline(0, 17, 32, "cream5").hline(0, 18, 32, "white");
  p.hline(0, 19, 32, "cream4").hline(0, 20, 32, "stone5").hline(0, 21, 32, "stone4").hline(0, 22, 32, "wood1");
}

/** A tea ring sunk into marble: brown, never quite scrubbed out. */
function teaRing(p: Px, x: number, y: number, small = false) {
  p.rows(x, y, small ? [".tt.", "t..t", ".tT."] : ["..tttt..", ".t....t.", "t......t", ".t....T.", "..ttTT.."], { t: "oak5", T: "oak4" });
}

// ── the wooden front ─────────────────────────────────────────────────────────

/**
 * The polished front, rows 23..51: rails and stiles in deep tea-wood, `panel` between them, the
 * bottom rail and the plinth. `seam` darkens the joint at x 0.
 */
function front(p: Px, panel: (p: Px) => void, seam: boolean) {
  p.rect(0, 23, 32, 23, "wood2");
  p.hline(0, 23, 32, "wood3");
  panel(p);
  if (seam) p.vline(0, 23, 18, "wood1");
  // Bottom rail with a moulded edge.
  p.hline(0, 38, 32, "wood3").hline(0, 39, 32, "wood2").hline(0, 40, 32, "wood1");
  // Plinth: dark, recessed, scuffed.
  p.rect(0, 44, 32, 7, "wood2").hline(0, 44, 32, "wood1").hline(0, 45, 32, "wood1");
  p.hline(0, 51, 32, "wood1");
}

/**
 * A raised panel at x..x+w-1, rows 25..37: a groove, a two-pixel bevel mitred at the corners (lit on
 * top and left, falling away bottom and right), and a polished field with a soft window gleam.
 */
function raised(p: Px, x: number, w: number, wood: "wood" | "rose" = "wood", gleam = 4) {
  const t = (n: number): Color => (wood === "rose" ? (["rose1", "rose1", "rose2", "rose3", "rose4"] as const)[n - 1] : (`wood${n}` as Color));
  const y = 25, h = 13;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const l = i, r = w - 1 - i, tp = j, bt = h - 1 - j, d = Math.min(l, r, tp, bt);
    let c: Color;
    if (d === 0) c = l === 0 || tp === 0 ? t(1) : t(3);
    else if (d <= 2) {
      // The nearest edge decides the bevel's face; ties go to the mitre's lit side.
      const lit = tp === d ? tp <= l || l > d : l === d && !(bt === d && bt < l);
      c = lit && (tp === d || l === d) && !(bt === d && bt <= l) && !(r === d && r <= tp) ? t(4) : d === 1 ? t(1) : t(2);
    } else c = t(3);
    p.px(x + i, y + j, c);
  }
  // The field: deep polish, a diagonal window gleam, a little figure.
  p.line(x + gleam, y + 4, x + gleam + 2, y + 3, t(4)).line(x + gleam, y + 5, x + gleam + 4, y + 3, t(5)).line(x + gleam + 1, y + 6, x + gleam + 5, y + 4, t(4));
  p.over(() => p.hline(x + Math.floor(w / 2), y + 7, Math.max(1, Math.floor(w / 3)), t(2)).hline(x + Math.floor(w / 2) - 2, y + 9, Math.max(1, Math.floor(w / 4)), t(2)));
}

/**
 * The brass foot rail across x0..x1 at rows 41..43, with its shadow on the plinth below.
 * `polished` spans are rubbed bright by shoes; the rest is tarnished. `brackets` are x positions.
 */
function footRail(p: Px, x0: number, x1: number, polished: readonly (readonly [number, number])[], brackets: readonly number[]) {
  for (let x = x0; x <= x1; x++) {
    const shine = polished.some(([a, b]) => x >= a && x <= b);
    const spot = !shine && (x * 7) % 13 === 3;
    p.px(x, 41, shine ? "gold5" : spot ? "gold2" : "gold3");
    if (!shine && (x * 5) % 11 === 7) p.px(x, 41, "gold4");
    p.px(x, 42, shine ? "gold4" : spot ? "gold1" : "gold2");
    p.px(x, 43, "gold1");
    p.px(x, 44, "ink2");
  }
  for (const bx of brackets) {
    // A cast bracket: a rosette on the bottom rail, a stem down to the rail, a foot under it.
    p.rows(bx - 1, 38, [".g.", "gGd", ".G.", "gGd", "gGd", "gGd", ".d."], { g: "gold4", G: "gold3", d: "gold1" });
  }
}

/** A ball end cap on the foot rail. */
function railEnd(p: Px, x: number) {
  p.rows(x, 40, [".gg.", "gGGd", "gGGd", "gGdd", ".dd."], { g: "gold4", G: "gold3", d: "gold1" });
}

/** Shoe scuffs: pale scrapes on the plinth under the rail, in small clusters. */
function scuffs(p: Px, marks: readonly Cluster[]) {
  p.over(() => { for (const [x, y, n] of marks) p.hline(x, y, n, "wood3").hline(x + 1, y + 1, Math.max(1, n - 2), "wood3"); });
}

/** Outline and round the ends. The top overhangs the front by a pixel at each end. */
function ends(p: Px, end: End, capped: boolean, topInk: Color = "steel1") {
  if (end === "left" || end === "both") {
    p.vline(0, 0, 23, topInk).px(1, 18, "white");
    p.vline(0, 23, 29, null).vline(1, 23, 29, "wood1").vline(2, 23, 15, "wood3");
    if (capped) p.px(0, 0, null).px(1, 0, null).px(0, 1, null).px(1, 1, topInk);
    p.px(1, 51, null).px(2, 51, "wood1");
  }
  if (end === "right" || end === "both") {
    p.vline(31, 0, 23, topInk).vline(30, 2, 14, topInk === "steel1" ? "steel3" : "stone4");
    p.vline(31, 23, 29, null).vline(30, 23, 29, "wood1").vline(29, 23, 15, "wood1");
    if (capped) p.px(31, 0, null).px(30, 0, null).px(31, 1, null).px(30, 1, topInk);
    p.px(30, 51, null).px(29, 51, "wood1");
  }
}

function horizontal(p: Px, end: End, panel: (p: Px) => void) {
  p.hline(0, 0, 32, "steel1");
  front(p, panel, end === "none" || end === "right");
}

const SHADOW = { rx: 16, ry: 4 } as const;
const FOOT = [-16, -31, 32, 32] as const;

export default defineSprites({
  /** West end of the run. The zinc is dented where a crate was dropped; the rail ends in a ball. */
  "kitchen/counter-left": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "left", (q) => raised(q, 4, 24));
      zincTop(p, [[6, 4, 9], [18, 9, 8], [4, 12, 6]], [[20, 3, 6], [10, 8, 5], [24, 13, 4]]);
      dent(p, 22, 6);
      dent(p, 7, 10);
      zincBead(p, [[3, 18, 9], [4, 17, 6]]);
      footRail(p, 5, 31, [[10, 16]], [16]);
      railEnd(p, 3);
      scuffs(p, [[9, 47, 4], [21, 48, 3]]);
      ends(p, "left", true);
    },
  },
  /**
   * Where the food goes out: a dull track rubbed into the zinc by twenty years of slid plates, a
   * glass ring, and the foot rail polished gold by the regulars' shoes.
   */
  "kitchen/counter-mid-a": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", (q) => raised(q, 4, 24, "wood", 6));
      zincTop(p, [[3, 3, 7], [22, 5, 6]], [[16, 3, 5], [26, 12, 4]]);
      // The slide track: the patina rubbed away to a dull, even grey in long strokes.
      p.over(() => {
        for (const [x, y, n] of [[5, 9, 22], [3, 10, 26], [4, 11, 25], [6, 12, 22], [3, 13, 26], [5, 14, 23]] as const) p.hline(x, y, n, "steel4");
        for (const [x, y, n] of [[8, 10, 12], [11, 12, 14], [7, 14, 9]] as const) p.hline(x, y, n, "steel3");
      });
      zincRing(p, 21, 2);
      zincBead(p, [[6, 18, 18], [8, 17, 12]]);
      footRail(p, 0, 31, [[2, 13], [19, 29]], [16]);
      scuffs(p, [[3, 47, 5], [11, 46, 4], [15, 48, 6], [23, 47, 4], [27, 49, 3]]);
    },
  },
  /** Two narrow panels; a long scratch across the zinc from a dragged crate and three dents in a row. */
  "kitchen/counter-mid-b": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", (q) => { raised(q, 3, 13, "wood", 3); raised(q, 17, 12, "wood", 3); });
      zincTop(p, [[4, 5, 8], [19, 3, 9], [10, 12, 7]], [[13, 7, 6], [2, 11, 5], [23, 10, 6]]);
      p.line(4, 13, 27, 6, "steel5").line(5, 13, 28, 6, "steel3");
      dent(p, 8, 3);
      dent(p, 13, 4);
      dent(p, 18, 3);
      zincBead(p, [[18, 18, 7]]);
      footRail(p, 0, 31, [[20, 25]], [16]);
      scuffs(p, [[6, 47, 3], [24, 48, 3]]);
    },
  },
  /**
   * The mended bay: the panel a cart backed into, replaced in a redder wood that never matched;
   * the zinc above it patched with a soldered square.
   */
  "kitchen/counter-mid-c": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "none", (q) => raised(q, 4, 24, "rose", 8));
      // New brass screws where the panel was refitted.
      p.px(16, 25, "gold4").px(16, 36, "gold3");
      zincTop(p, [[3, 3, 10], [20, 12, 8]], [[14, 4, 5], [5, 12, 6]]);
      // The soldered patch, its seam a bright bead of solder.
      p.rows(11, 6, [
        "ssssssssss",
        "s44444443s",
        "s45444443s",
        "s44444443s",
        "s44444433s",
        "s33333333s",
        "ssssssssss",
      ], { s: "steel6", 4: "steel4", 5: "steel5", 3: "steel3" });
      zincBead(p, [[2, 18, 6]]);
      footRail(p, 0, 31, [[5, 9]], [16]);
      scuffs(p, [[10, 47, 3], [18, 48, 3]]);
    },
  },
  /** East end. The checked counter cloth on its brass hook; the rail ends in a ball. */
  "kitchen/counter-right": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      horizontal(p, "right", (q) => raised(q, 4, 24, "wood", 5));
      zincTop(p, [[3, 4, 8], [16, 10, 9]], [[20, 4, 5], [6, 12, 5]]);
      zincRing(p, 4, 7);
      zincBead(p);
      footRail(p, 0, 26, [[8, 12]], [16]);
      railEnd(p, 25);
      // Hook and the checked cloth hanging from it.
      p.rows(22, 24, ["gG", "g."], { g: "gold4", G: "gold2" });
      p.rows(19, 26, [
        "..cwwc..",
        ".cwbwbc.",
        "cwbwbwbc",
        "cbwbwbwc",
        "cwbwbwbc",
        "cbwbwbwc",
        "cwbwbwbs",
        "cbwbwbws",
        ".cwbwbs.",
        ".cbw.bs.",
        "..c...s.",
      ], { c: "cream3", w: "cream5", b: "blue4", s: "cream2" });
      scuffs(p, [[7, 48, 3]]);
      ends(p, "right", true);
    },
  },

  /** North end of the leg, against the wall: the slab's lit back arris, and a scorched kettle ring. */
  "kitchen/counter-v-top": {
    w: 32, h: 33, anchor: [16, 52], foot: FOOT,
    draw: (p) => {
      marbleSlab(p, 1, 32, [[[4, 6], [9, 11], [12, 19], [11, 27], [15, 33]], [[20, 2], [23, 9], [27, 14]], [[8, 22], [3, 30]]], true, false);
      p.hline(2, 0, 28, "stone1").hline(2, 1, 27, "white").px(1, 0, null).px(30, 0, null).px(0, 0, null).px(31, 0, null);
      p.px(1, 1, "stone1").px(30, 1, "stone1").vline(0, 1, 32, "stone1").vline(31, 1, 32, "stone1");
      p.rows(15, 13, ["...tttttt...", ".tTddddddTt.", "tTd......dTt", "td........dt", "tTd......dTt", ".ttTTddTTt..", "...tttttt..."], { t: "oak5", T: "oak4", d: "oak3" });
    },
  },
  /** Leg of the L: two tea rings where the cook's cup and the waiter's cup always stand. */
  "kitchen/counter-v-mid": {
    w: 32, h: 32, anchor: [16, 51], foot: FOOT,
    draw: (p) => {
      marbleSlab(p, 0, 32, [[[15, 0], [13, 8], [17, 15], [16, 23], [20, 32]], [[5, 4], [8, 12], [6, 20]], [[24, 18], [22, 26], [26, 32]]]);
      teaRing(p, 18, 5);
      teaRing(p, 7, 22, true);
    },
  },
  /** Leg of the L where the bowls go down: a dull patch worn into the polish, and a chipped edge. */
  "kitchen/counter-v-mid-b": {
    w: 32, h: 32, anchor: [16, 51], foot: FOOT,
    draw: (p) => {
      marbleSlab(p, 0, 32, [[[20, 0], [23, 7], [19, 14], [22, 22], [18, 32]], [[4, 9], [10, 15], [8, 24]]]);
      // Polish worn dull by bowls set down ten thousand times.
      p.over(() => { for (const [x, y, n] of [[7, 12, 12], [5, 13, 16], [6, 14, 15], [8, 15, 11], [6, 16, 13]] as const) p.hline(x, y, n, "cream5"); });
      p.over(() => p.hline(9, 14, 8, "cream4").hline(11, 15, 5, "cream4"));
      // A chip off the east edge, showing the rougher stone.
      p.rows(28, 19, [".s", "s3", "s3", ".s"], { s: "stone4", 3: "stone2" });
      p.px(31, 20, null).px(31, 21, null).px(30, 20, "stone1").px(30, 21, "stone1");
    },
  },
  /**
   * Leg of the L by the stove: a hairline crack across the slab, filled long ago and darkened, and
   * a soy-sauce blot nobody could lift.
   */
  "kitchen/counter-v-mid-c": {
    w: 32, h: 32, anchor: [16, 51], foot: FOOT,
    draw: (p) => {
      marbleSlab(p, 0, 32, [[[9, 0], [12, 6], [10, 13], [13, 20]], [[22, 10], [25, 18], [23, 26], [26, 32]]]);
      p.rows(2, 17, [
        "cc..........................",
        "..cc........................",
        "....ccc.....................",
        ".......cc..............c....",
        ".........ccc......cccc.c....",
        "............cccccc.....cc...",
        "..........................cc",
      ], { c: "stone2" });
      p.rows(17, 4, ["..bb..", ".bBBb.", "bBBBbb", ".bbBb.", "..b..."], { b: "oak4", B: "oak3" });
    },
  },
  /** A free south end of the leg: marble top and bullnose over a panelled front with its rail. */
  "kitchen/counter-v-bottom": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      marbleSlab(p, 0, 16, [[[16, 0], [14, 7], [18, 16]], [[5, 3], [9, 10]]]);
      teaRing(p, 20, 6, true);
      marbleBead(p);
      front(p, (q) => raised(q, 4, 24), false);
      footRail(p, 5, 26, [[12, 18]], []);
      railEnd(p, 3);
      railEnd(p, 25);
      scuffs(p, [[12, 48, 3]]);
      ends(p, "both", false, "stone1");
    },
  },
  /**
   * The corner of the L: the marble slab of the leg runs through to the front edge; the zinc of the
   * run butts against it under a brass cover strip. The foot rail starts here with a ball end.
   */
  "kitchen/counter-corner": {
    w: 32, h: 52, anchor: [16, 51], foot: FOOT, shadow: SHADOW,
    draw: (p) => {
      marbleSlab(p, 0, 16, [[[12, 0], [15, 6], [13, 12], [17, 16]], [[24, 2], [21, 9]]], false);
      marbleBead(p);
      // Brass cover strip where marble meets zinc.
      p.vline(29, 0, 22, "gold4").vline(30, 0, 22, "gold2").vline(31, 0, 16, "steel4").vline(31, 16, 6, "steel3");
      p.px(31, 18, "steel6").px(31, 17, "steel5");
      teaRing(p, 6, 8, true);
      front(p, (q) => raised(q, 4, 24), false);
      footRail(p, 5, 31, [[14, 22]], [16]);
      railEnd(p, 3);
      scuffs(p, [[16, 47, 4], [23, 48, 2]]);
      ends(p, "left", false, "stone1");
    },
  },
});
