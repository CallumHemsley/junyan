/**
 * The owners' plants. Every one is a particular plant with a particular history. Floor-standing
 * plants anchor at the middle of the pot's foot; the hanging pothos is wall art (layer `floor`)
 * anchored at the bottom-centre of its frame.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art, autoOutline, cylinder, stamp } from "./_helpers.ts";

const LEAF: Color[] = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const DEEP: Color[] = ["jade1", "leaf1", "leaf2", "leaf3", "leaf4"];
const DRY = { b: "oak2", B: "oak3" } as const;

// ── leaf drawings: digits are tones (1 dark … 5 lit), `m` a midrib, `b`/`B` a dried tip ──

/** Lucky bamboo leaf, rising to the upper right from its base at the lower left. */
const LANCE_UP = [
  "..........45",
  ".......44553",
  "....3455543.",
  "..3444443...",
  ".233332.....",
  "222.........",
];
/** The same leaf with a brown, dried tip. */
const LANCE_UP_DRY = [
  "..........BB",
  ".......445bB",
  "....3455543.",
  "..3444443...",
  ".233332.....",
  "222.........",
];
/** A lucky bamboo leaf arching out and over to the right. */
const LANCE_ARCH = [
  "....45554....",
  "..344444443..",
  ".2333222233.3",
  "22........2..",
];
/** A new leaf still furled: a pale spike. */
const SHOOT = ["5.", "5.", "45", "44", "34"];

/** Rubber plant leaves: a big one pointing right, one rising, one drooping toward us. */
const RUBBER_SIDE = [
  "....3344444.....",
  "..33455555443...",
  ".3445555544444..",
  "2mmmmmmmmmmmmm43",
  ".23333333333332.",
  "..222333333222..",
  "....22222222....",
];
const RUBBER_RISE = [
  ".........34.",
  ".......34554",
  "......34555m",
  ".....3455m43",
  "....3455m432",
  "...3455m4332",
  "..345m43332.",
  ".345m4332...",
  ".3m43322....",
  "3m4332......",
  "m322........",
  "22..........",
];
const RUBBER_DROOP = [
  "...344...",
  ".3454443.",
  "3455m4433",
  "3455m4432",
  "3445m4332",
  "2344m3332",
  ".234m332.",
  ".233m322.",
  "..23m32..",
  "..2232...",
  "...22....",
];
/** A rubber leaf with a brown, papery dead edge and a hole an insect made. */
const RUBBER_OLD = [
  "....3344BB......",
  "..334555b4BB....",
  ".3445.554444b...",
  "2mmmmmmmmmmmmmbB",
  ".23333333333332.",
  "..222333333222..",
  "....22222222....",
];
/** The new leaf, still wrapped in its bronze sheath. */
const RUBBER_SHEATH = [".r.", "rR.", "rRr", "rRr", "rRr", ".Rr", ".g."];

/** Money tree leaflets: round, five to a stalk. */
const ROUND = [".344.", "34554", "34443", ".233."];
const ROUND_HOLE = [".344.", "34.54", "34443", ".233."];

/** Pothos: a heart that hangs point-down, a variegated one, and a small one. */
const HEART = [
  "33.44.",
  "345554",
  "344554",
  ".3444.",
  "..33..",
  "...2..",
];
const HEART_STREAK = [
  "33.44.",
  "34Y554",
  "344Y54",
  ".344Y.",
  "..33..",
  "...2..",
];
const HEART_SMALL = ["3.4.", "3454", ".33.", "..2."];

// ── helpers ──────────────────────────────────────────────────────────────────

/** A lucky bamboo stalk four pixels wide: lit left, nodes every few pixels, a waxed cut top. */
function stalk(p: Px, x: number, top: number, bottom: number, nodes: readonly number[]) {
  const cols: Color[] = ["leaf5", "leaf4", "leaf4", "leaf3"];
  cols.forEach((c, i) => p.vline(x + i, top, bottom - top, c));
  art(p, x, top, ["TTTt", "SSss"], { T: "bamboo5", t: "bamboo4", S: "bamboo4", s: "bamboo3" });
  for (const y of nodes) art(p, x, y, ["nnNN", "HHhn"], { n: "leaf3", N: "leaf2", H: "leaf5", h: "leaf4" });
}

export default defineSprites({
  /**
   * Lucky bamboo, a New Year gift from the owner's sister, still in its gold ribbon. The glazed
   * pot cracked in a cold snap and was bound with garden wire rather than thrown out.
   */
  "decor/plant-bamboo": {
    w: 32, h: 60, anchor: [16, 59], foot: [-10, -6, 20, 6], shadow: { rx: 12, ry: 4, dy: -2 },
    draw: (p) => {
      const o = { outline: "leaf1" } as const;
      // Back leaves, then stalks, then the leaves in front of them.
      stamp(p, 18, 8, LANCE_UP, LEAF, { shift: -1, ...o });
      stamp(p, 21, 20, LANCE_ARCH, LEAF, { shift: -1, ...o });
      stalk(p, 13, 6, 46, [14, 25, 36]);
      stalk(p, 19, 17, 46, [26, 37]);
      stalk(p, 7, 23, 46, [31, 40]);
      stamp(p, 3, 6, LANCE_UP, LEAF, { flipX: true, ...o });
      stamp(p, 17, 2, LANCE_UP_DRY, LEAF, { legend: DRY, ...o });
      stamp(p, 22, 15, LANCE_UP, LEAF, { ...o });
      stamp(p, 1, 19, LANCE_UP, LEAF, { flipX: true, shift: -1, ...o });
      stamp(p, 0, 26, LANCE_ARCH, LEAF, { flipX: true, ...o });
      stamp(p, 24, 24, LANCE_ARCH, LEAF, { ...o });
      stamp(p, 20, 11, SHOOT, ["leaf3", "leaf4", "leaf4", "leaf5", "bamboo5"]);
      // The ribbon, wound twice and tied in a bow at the front.
      p.rect(7, 38, 16, 2, "gold3").hline(7, 38, 16, "gold4").hline(7, 39, 4, "gold4").px(22, 39, "gold2");
      art(p, 11, 35, [
        ".aa..aa.",
        "aGgaagga",
        "aggKKgga",
        ".a.KK.a.",
        "...aa...",
        "..a..a..",
        "..a...a.",
      ], { a: "gold2", G: "gold5", g: "gold4", K: "gold3" });
      // Pot: the back of the lip, pebbles, the front lip, glazed body, bare clay foot.
      art(p, 6, 44, [
        "..kkjjjjjjjjjjjjkk..",
        ".jPPpqPPpqPpPPqpPqk.",
        "jPpqPPpqpPPqpPpqPpqk",
        "WWJJJJJJJJJJJJJJjjjk",
      ], { k: "jade3", j: "jade4", J: "jade5", W: "jade6", P: "stone5", p: "stone4", q: "stone3" });
      cylinder(p, 6, 48, 20, 10, ["jade1", "jade1", "jade2", "jade3", "jade4"], (r) => (r >= 8 ? r - 7 : 0));
      p.hline(6, 48, 20, "jade2");
      // Glaze highlight, a long soft streak on the lit shoulder.
      p.vline(9, 49, 7, "jade5").vline(10, 50, 3, "jade6");
      // The crack, running down from the lip, and the wire that holds it.
      art(p, 16, 47, [".c.", ".c.", "lc.", "l.c", ".lc", ".c.", "lc.", "lc.", ".lc", "..c"], { c: "jade1", l: "jade4" });
      for (const y of [51, 55]) p.hline(6, y, 20, "steel4").px(6, y, "steel5").px(25, y, "steel2");
      art(p, 18, 50, [".s.", "sSs", ".x.", "..x"], { s: "steel3", S: "steel5", x: "steel2" });
      p.rect(8, 58, 16, 1, "cream3").hline(19, 58, 5, "cream2");
      // A rim chip showing the clay.
      art(p, 22, 47, ["cC", ".c"], { c: "cream3", C: "cream4" });
      autoOutline(p);
    },
  },

  /**
   * The money tree, bought for the opening and braided by the nursery. It lives by the window and
   * leans toward it; it grows in a big round biscuit tin whose pattern has faded and rusted at
   * the seam.
   */
  "decor/plant-money-tree": {
    w: 36, h: 62, anchor: [19, 61], foot: [-12, -6, 24, 6], shadow: { rx: 13, ry: 4, dy: -2 },
    draw: (p) => {
      // Three trunks braided, leaning left as they rise toward the window.
      const braid = ["LLlddL", "dLLlld", "ldLLll", "lldLLd"];
      for (let y = 26; y < 47; y++) {
        const lean = Math.round((47 - y) * 0.3);
        art(p, 16 - lean, y, [braid[(y >> 1) % 4].slice(0, 5)], { L: "bamboo3", l: "bamboo2", d: "bamboo1" });
      }
      // Stalks fanning out from the top of the braid to each palm.
      const top: [number, number] = [12, 26];
      const palms: [number, number, number][] = [
        [9, 10, -1], [18, 6, -1], [27, 9, -1], [13, 3, -1],
        [5, 17, 0], [16, 13, 0], [28, 16, 0], [22, 10, 0],
        [10, 22, 1], [21, 20, 0], [30, 23, 0],
      ];
      for (const [cx, cy] of palms) p.line(top[0], top[1], cx, cy + 2, "bamboo1");
      // Palms of five round leaflets fanned around each stalk end; one has a hole, one is dying.
      const fan: [number, number][] = [[-7, 0], [-6, -3], [-2, -5], [2, -3], [3, 0]];
      palms.forEach(([cx, cy, shift], i) => fan.forEach(([dx, dy], j) => {
        const leaf = i === 4 && j === 1 ? ROUND_HOLE : ROUND;
        const ramp: Color[] = i === 10 && j === 4 ? ["wood1", "oak1", "oak2", "oak3", "oak4"] : LEAF;
        stamp(p, cx + dx, cy + dy, leaf, ramp, { shift: shift + (j === 2 ? 1 : 0), flipX: dx > 0, outline: "leaf1" });
      }));
      // The biscuit tin: lid rim, a band of faded scrollwork, rust at the seam.
      art(p, 7, 46, [
        ".kkkkkkkkkkkkkkkkkkkkk.",
        "kSSSSSSSSSSSSSSSSSSssqk",
      ], { k: "blue2", S: "steel5", s: "steel4", q: "steel3" });
      cylinder(p, 7, 48, 23, 12, ["blue1", "blue2", "blue3", "blue4", "blue5"]);
      p.hline(7, 48, 23, "blue2");
      p.over(() => {
        for (let x = 8; x < 29; x += 5) art(p, x, 51, [".gg.", "g..g", "g.g.", ".g.."], { g: "gold2" });
        p.hline(7, 57, 23, "blue2");
        // Rust blooming along the side seam.
        art(p, 26, 49, ["o.", "oO", ".o", "oO", "o.", ".o", "oo", "Oo"], { o: "orange1", O: "rose3" });
        // A dent catching the light.
        art(p, 11, 54, ["dd.", "dLd", ".d."], { d: "blue2", L: "blue5" });
      });
      p.hline(8, 59, 21, "steel3");
      autoOutline(p);
    },
  },

  /**
   * A snake plant that has outgrown its terracotta pot. It sits in a saucer that has left a dark
   * water mark on the clay; one leaf has snapped and folded over, one has a dry tip, and a pale
   * new spear is coming up at the front.
   */
  "decor/plant-snake": {
    w: 32, h: 56, anchor: [16, 55], foot: [-11, -6, 22, 6], shadow: { rx: 13, ry: 4, dy: -2 },
    draw: (p) => {
      const base = 40;
      // [tipX, tipY, baseX, width, tone shift, yellow margin, dry tip]
      const swords: [number, number, number, number, number, boolean, boolean][] = [
        [15, 1, 15, 6, -1, false, false],
        [6, 8, 10, 5, -1, true, true],
        [26, 5, 21, 5, -1, false, false],
        [10, 15, 12, 5, 0, true, false],
        [22, 18, 19, 5, 0, false, false],
        [4, 22, 8, 4, 0, false, false],
      ];
      const darker: Partial<Record<Color, Color>> = { leaf4: "leaf3", leaf3: "leaf2", jade4: "jade3", jade5: "jade4", bamboo4: "bamboo3", leaf2: "leaf1" };
      const lighter: Partial<Record<Color, Color>> = { leaf2: "leaf3", leaf3: "leaf4", jade3: "jade4" };
      for (const [tx, ty, bx, w, shift, yellow, dry] of swords) {
        const spans: [number, number, number][] = [];
        for (let y = ty; y < base; y++) {
          const t = (y - ty) / (base - ty);
          const cx = tx + (bx - tx) * Math.sqrt(t);
          const width = t > 0.88 ? w - 1 : Math.max(1, Math.min(w, Math.round(1 + (y - ty) * 0.55)));
          spans.push([y, Math.round(cx - width / 2), width]);
        }
        for (const [y, left, width] of spans) p.hline(left - 1, y, width + 2, "leaf1");
        p.px(spans[0][1], ty - 1, "leaf1");
        for (const [y, left, width] of spans) for (let i = 0; i < width; i++) {
          // Pale zigzag bands across a dark leaf, broken so they never line up.
          const wave = (i + (y >> 2)) % 2;
          const band = (y + wave + tx) % 6 === 0 || ((y + wave + tx) % 6 === 1 && i % 3 === 1);
          let c: Color;
          if (i === 0 && width > 2) c = yellow ? "bamboo4" : "leaf4";
          else if (i === width - 1 && width > 3) c = yellow ? "bamboo2" : "leaf1";
          else if (band) c = i < width / 2 ? "jade5" : "jade4";
          else c = i < width / 2 ? "leaf3" : "leaf2";
          if (shift < 0) c = darker[c] ?? c;
          if (shift > 0) c = lighter[c] ?? c;
          p.px(left + i, y, c);
        }
        if (dry) art(p, spans[0][1] - 1, ty, [".b", "bB", "bB", "Bb"], DRY);
      }
      // The snapped leaf, folded over to the right.
      art(p, 19, 18, [
        "..oooooooo....",
        ".o4444333oo...",
        "o44jj4433332oo",
        "o3333jj33222o.",
        ".oo3332221oo..",
        "...oooooo.....",
      ], { o: "leaf1", 4: "leaf4", 3: "leaf3", 2: "leaf2", 1: "leaf1", j: "jade4" });
      // A new spear, pale and tight.
      art(p, 14, 29, [".o.", "o5o", "o5o", "o54", "o44", "o44"], { o: "leaf1", 5: "bamboo5", 4: "leaf5" });
      // Terracotta pot: a thick rolled rim and a tapering body; the damp shows above the saucer.
      art(p, 5, 39, [
        ".dddddddddddddddddddd.",
        "SRRRRRRRRRRRRRRRRRRrrq",
        "RRrrrrrrrrrrrrrrrrrqqq",
        "qqqqqqqqqqqqqqqqqqqqqp",
      ], { d: "wood2", R: "red5", S: "tan4", r: "rose4", q: "rose3", p: "rose2" });
      cylinder(p, 6, 43, 20, 9, ["rose1", "rose2", "rose3", "rose4", "red5"], (r) => (r >= 5 ? 1 : 0));
      p.over(() => {
        // Water mark: the bottom of the pot stays darker, with a soft tide line.
        p.swap({ red5: "rose4", rose4: "rose3", rose3: "rose2" }, [6, 49, 20, 3]);
        p.hline(7, 48, 18, "rose3");
        // White mineral bloom on the clay.
        art(p, 9, 45, ["cCc.", ".cc."], { c: "cream3", C: "cream4" });
        art(p, 21, 46, ["c.", "cc"], { c: "cream2" });
      });
      // The saucer.
      art(p, 4, 51, [
        "aSSSSSSSSSSSSSSSSSSSSssa",
        ".rrrrrrrrrrrrrrrrrrrrrq.",
        "..qqqqqqqqqqqqqqqqqqqq..",
      ], { a: "rose4", S: "red5", s: "rose4", r: "rose3", q: "rose2" });
      autoOutline(p);
    },
  },

  /**
   * The rubber plant, grown from a cutting and now taller than the owner. It is staked with a
   * spare chopstick tied on with red string, has a new leaf unfurling in its bronze sheath, one
   * old leaf going brown, and lives in a chipped enamel pail that used to hold mop water.
   */
  "decor/plant-rubber": {
    w: 40, h: 68, anchor: [20, 67], foot: [-12, -6, 24, 6], shadow: { rx: 14, ry: 4, dy: -2 },
    draw: (p) => {
      const g = { m: "jade4" } as const;
      const o = "jade1" as const;
      // Stem, gently S-curved, and the chopstick stake beside it.
      for (let y = 6; y < 50; y++) {
        const x = 20 + Math.round(Math.sin(y / 9) * 1.5);
        p.px(x, y, "wood3").px(x + 1, y, "wood2");
      }
      p.vline(23, 22, 28, "bamboo4").vline(24, 22, 28, "bamboo2");
      // Leaves, back to front.
      stamp(p, 4, 6, RUBBER_RISE, DEEP, { flipX: true, shift: -1, legend: g, outline: o });
      stamp(p, 23, 3, RUBBER_RISE, DEEP, { shift: -1, legend: g, outline: o });
      stamp(p, 3, 18, RUBBER_SIDE, DEEP, { flipX: true, shift: -1, legend: g, outline: o });
      stamp(p, 22, 14, RUBBER_SIDE, DEEP, { legend: g, outline: o });
      stamp(p, 23, 26, RUBBER_SIDE, DEEP, { shift: -1, legend: g, outline: o });
      stamp(p, 2, 29, RUBBER_SIDE, DEEP, { flipX: true, legend: g, outline: o });
      stamp(p, 21, 36, RUBBER_OLD, DEEP, { legend: { ...g, ...DRY }, outline: o });
      stamp(p, 15, 21, RUBBER_DROOP, DEEP, { shift: 1, legend: g, outline: o });
      stamp(p, 9, 38, RUBBER_DROOP, DEEP, { legend: g, outline: o });
      art(p, 19, 0, RUBBER_SHEATH, { r: "rose3", R: "rose4", g: "leaf3" });
      // Red string ties on the stake.
      for (const y of [30, 44]) art(p, 20, y, ["rrrrr", ".r..r"], { r: "red3" });
      // Enamel pail: a blue rim, white enamel, black iron where it has chipped.
      art(p, 7, 50, [
        "..bbbbbbbbbbbbbbbbbbbbbbb..",
        ".bBBBBBBBBBBBBBBBBBBBBBBbb.",
        "bBdddddddddddddddddddddddbb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ], { b: "blue2", B: "blue3", d: "wood1" });
      cylinder(p, 8, 54, 25, 12, ["cream1", "cream2", "cream3", "cream4", "white"], (r) => (r >= 10 ? r - 9 : 0));
      p.over(() => {
        p.hline(8, 54, 25, "cream2");
        p.hline(8, 63, 25, "blue3").hline(8, 64, 25, "blue2");
        // Chips: dark iron with a rust edge.
        art(p, 12, 57, [".kk", "kkr", ".r."], { k: "ink2", r: "orange1" });
        art(p, 27, 60, ["kr", "k."], { k: "ink2", r: "orange1" });
        // Rivets for the handle.
        p.px(9, 56, "steel2").px(31, 56, "steel1");
      });
      // Wire handle, lying down against the front.
      p.line(9, 56, 14, 60, "steel3").line(14, 60, 26, 60, "steel3").line(26, 60, 31, 56, "steel2");
      autoOutline(p);
    },
  },

  /** Scallions regrowing in a chipped enamel mug on the sill: someone saves the roots. */
  "decor/plant-small-a": {
    w: 18, h: 22, anchor: [8, 21], foot: [-6, -3, 12, 3], shadow: { rx: 7, ry: 2, dy: -1 },
    draw: (p) => {
      art(p, 2, 0, [
        "...b......5..",
        "...4.....54..",
        "..44....54...",
        "..4.....4....",
        "..4..5..4....",
        ".44..4.44.5..",
        ".4...4.4..4..",
        ".3..44.4.44..",
        ".3..4..3.4...",
        ".34.4.33.4...",
        "..3.3.3..3...",
        "..wWwWw.Ww...",
      ], { 3: "leaf3", 4: "leaf4", 5: "leaf5", b: "oak3", w: "white", W: "cream4" });
      art(p, 1, 12, [
        "BBBBBBBBBBB",
        "bkkkkkkkkkb",
      ], { B: "blue3", b: "blue2", k: "steel1" });
      cylinder(p, 1, 14, 11, 7, ["cream1", "cream2", "cream3", "cream4", "white"]);
      p.hline(1, 20, 11, "blue2");
      // Handle.
      art(p, 12, 14, ["ccc.", "..cC", "..cC", "..cC", "ccc."], { c: "cream3", C: "cream2" });
      // A chip on the front, black iron showing.
      art(p, 7, 16, ["kk", ".k"], { k: "ink2" });
      autoOutline(p);
    },
  },

  /**
   * A jade plant rooted in a cracked blue-and-white teacup, sitting in its own saucer. The cup
   * broke on the first day of business and nobody could bear to throw it out.
   */
  "decor/plant-small-b": {
    w: 18, h: 22, anchor: [9, 21], foot: [-6, -3, 12, 3], shadow: { rx: 7, ry: 2, dy: -1 },
    draw: (p) => {
      art(p, 0, 0, [
        "....oo....oo......",
        "...o45o..o44o.....",
        "...o44o.o4554o....",
        "..oo33oo.o33o.oo..",
        ".o445oto..t..o45o.",
        ".o3443o.t.t.o4443o",
        "..o33o..tt.toR33o.",
        "..oo.ooo.tt..ooo..",
        ".o44o.o45ot.......",
        ".o3R4oo443o.......",
        "..o3o..o33o.......",
        "...o....oo........",
      ], { o: "leaf1", 3: "leaf3", 4: "leaf4", 5: "leaf5", t: "wood3", R: "rose4" });
      art(p, 2, 12, [
        "cWWWWWWWWWWWc.",
        "cddddddddddddc",
      ], { c: "cream3", W: "white", d: "wood2" });
      cylinder(p, 3, 14, 12, 5, ["cream1", "cream2", "cream4", "cream5", "white"], (r) => (r >= 3 ? r - 2 : 0));
      p.over(() => {
        art(p, 4, 15, ["b.bb.bb.b.", ".B..B..B.B"], { b: "blue3", B: "blue2" });
        art(p, 11, 14, ["k.", "k.", ".k", "k."], { k: "cream1" });
      });
      art(p, 1, 19, ["aSSSSSSSSSSSSSsa", ".qqqqqqqqqqqqqq."], { a: "cream3", S: "cream5", s: "cream3", q: "cream2" });
      autoOutline(p);
    },
  },

  /**
   * A golden pothos in a bamboo basket on a nail, started from a cutting off a customer's plant.
   * It trails toward the floor; one leaf is going yellow, two have holes, and the low vines sway
   * (four frames at 2 fps).
   */
  "decor/plant-hanging": {
    w: 32, h: 48, layer: "floor", frames: 4, fps: 2,
    draw: (p, frame) => {
      const sway = (y: number) => (y < 24 ? 0 : [0, 1, 0, -1][frame]);
      const o = { outline: "leaf1" } as const;
      const Y = { Y: "bamboo5" } as const;
      // Nail and the wire loop the basket hangs from.
      art(p, 13, 0, ["...SS..", "..s..s.", ".s....s", ".s....s"], { s: "steel3", S: "steel5" });
      // Leaves behind the rim.
      stamp(p, 6, 3, HEART, LEAF, { shift: -1, flipX: true, ...o });
      stamp(p, 19, 2, HEART, LEAF, { shift: -1, ...o });
      // Basket: a woven bamboo bowl, flat side to the wall.
      art(p, 5, 8, [
        "aAAAAAAAAAAAAAAAAAAaa.",
        "aaaaaaaaaaaaaaaaaaaaab",
      ], { A: "bamboo5", a: "bamboo3", b: "bamboo2" });
      cylinder(p, 5, 10, 22, 8, ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"], (r) => [0, 0, 0, 1, 1, 2, 3, 5][r]);
      p.over(() => {
        for (let y = 11; y < 18; y++) for (let x = 5; x < 27; x++) if ((x + (y % 2) * 2) % 4 === 0) p.px(x, y, x < 16 ? "bamboo2" : "bamboo1");
      });
      autoOutline(p);
      // Trailing vines: [x, y] from the rim down.
      const vines: [number, number][][] = [
        [[8, 16], [7, 19], [6, 23], [5, 27], [5, 31], [6, 35], [6, 39], [7, 44]],
        [[16, 17], [16, 21], [17, 25], [17, 28]],
        [[23, 16], [24, 20], [26, 24], [26, 28], [25, 32], [25, 36]],
      ];
      for (const vine of vines) for (let i = 0; i + 1 < vine.length; i++) {
        const [x0, y0] = vine[i], [x1, y1] = vine[i + 1];
        for (let y = y0; y <= y1; y++) {
          const x = Math.round(x0 + ((x1 - x0) * (y - y0)) / Math.max(1, y1 - y0));
          if (!p.solid(x + sway(y), y)) p.px(x + sway(y), y, "leaf2");
        }
      }
      const hang: [number, number, readonly string[], number, boolean][] = [
        [0, 21, HEART, 0, true], [6, 26, HEART_STREAK, 0, false], [0, 33, HEART, -1, true], [6, 38, HEART_SMALL, 0, false], [3, 42, HEART_SMALL, 0, true],
        [11, 20, HEART_STREAK, -1, true], [15, 26, HEART, 0, false],
        [26, 19, HEART, 0, false], [20, 23, HEART_SMALL, -1, true], [26, 29, HEART_STREAK, 0, false], [21, 34, HEART_SMALL, 0, true],
      ];
      for (const [x, y, leaf, shift, flipX] of hang) stamp(p, x + sway(y + 2), y, leaf, LEAF, { shift, flipX, legend: Y, ...o });
      // The yellowing leaf and the holes.
      stamp(p, 22 + sway(40), 38, HEART_SMALL, ["oak1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"], { outline: "bamboo1" });
      p.px(2 + sway(24), 23, null).px(17 + sway(29), 28, null);
      // Leaves spilling over the front of the rim.
      stamp(p, 3, 7, HEART, LEAF, { flipX: true, ...o });
      stamp(p, 12, 5, HEART_STREAK, LEAF, { shift: 1, legend: Y, ...o });
      stamp(p, 22, 6, HEART, LEAF, { ...o });
    },
  },
});
