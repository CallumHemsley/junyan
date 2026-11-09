/**
 * Potted plants. Floor-standing ones anchor at the middle of the pot's foot; the hanging pothos
 * is wall art (layer `floor`) and anchors at the bottom-centre of its frame.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art, autoOutline, cylinder, lance, stamp } from "./_helpers.ts";

const LEAF: Color[] = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const DEEP_LEAF: Color[] = ["jade1", "leaf1", "leaf2", "leaf3", "leaf4"];

const STALK = { S: "leaf5", s: "leaf4", N: "bamboo5", n: "leaf3", T: "bamboo4", t: "bamboo3" } as const;

/** A small round leaf; with `stamp(…, { outline })` each one keeps a clean dark edge. */
const ROUND_LEAF = [".34.", "3454", ".23."];
/** Rubber-plant leaves: a big one pointing right, one drooping toward the camera, a young one. */
const RUBBER_BIG = [
  "...3444...",
  ".3455544..",
  "2444444443",
  ".2333332..",
  "...222....",
];
const RUBBER_DROOP = [
  ".3443.",
  "345g43",
  "344443",
  "234432",
  ".2442.",
  ".2332.",
  "..22..",
];
const RUBBER_YOUNG = ["..344..", ".34g443", "2344432", ".2222.."];
/** A rubber leaf angled up and right, base at the lower left. */
const RUBBER_RISE = [
  ".....344",
  "...34554",
  "..34g543",
  ".344443.",
  ".24432..",
  "2332....",
  "22......",
];
/** A pothos leaf hanging point-down. */
const POTHOS = ["3445", "3354", ".33.", "..2."];
const POTHOS_SMALL = ["345", "334", ".2."];

export default defineSprites({
  /** Lucky bamboo in a glazed jade pot on a bed of pebbles, tied with a gold ribbon. */
  "decor/plant-bamboo": {
    w: 16, h: 30, anchor: [8, 29], foot: [-5, -3, 10, 3], shadow: { rx: 6, ry: 2, dy: -1 },
    draw: (p) => {
      art(p, 0, 0, [
        "................",
        ".............G..",
        "..G.........Gg..",
        "..Gg.......Gg...",
        "...Gg..Tt.Gg....",
        "....Hg.SsHg.....",
        ".....GgSsG......",
        "......gSs.......",
        ".......Nn......G",
        ".......Ss.Tt..Gg",
        "G......Ss.Ss.Gg.",
        "Gg.....Ss.SsGg..",
        ".Hg.Tt.Ss.Ss....",
        "..GgSs.Ss.SsHHG.",
        "...gSs.Nn.Ss..Gg",
        "....SsrSsrNn...g",
        "....RRrrrrrq....",
        "....NnqSsqSs....",
        "....Ss.Ss.Ss....",
        "....Ss.Ss.Ss....",
      ], { ...STALK, G: "leaf3", g: "leaf2", H: "leaf4", R: "gold4", r: "gold3", q: "gold2" });
      // Pot: back lip, pebbles, front lip, glazed body, bare clay foot.
      art(p, 3, 20, [
        ".kjjjjjjk.",
        "jPpqPpPpqk",
        "WJJJJJJjjk",
      ], { k: "jade3", j: "jade4", J: "jade5", W: "jade6", P: "stone5", p: "stone4", q: "stone3" });
      cylinder(p, 3, 23, 10, 5, ["jade1", "jade2", "jade3", "jade4", "jade5"], (r) => (r === 4 ? 1 : 0));
      p.hline(3, 23, 10, "jade2").px(3, 23, "jade3");
      p.px(5, 24, "white").px(5, 25, "jade6");
      p.rect(4, 28, 8, 1, "cream3").px(10, 28, "cream2").px(11, 28, "cream2");
      // A chip in the front lip shows the clay.
      p.px(10, 22, "cream3");
      autoOutline(p);
    },
  },

  /** Money tree: a braided trunk and a dome of round leaves in a blue-and-white pot. */
  "decor/plant-money-tree": {
    w: 18, h: 30, anchor: [9, 29], foot: [-6, -3, 12, 3], shadow: { rx: 7, ry: 2, dy: -1 },
    draw: (p) => {
      art(p, 7, 12, [
        "LLld",
        "dlLL",
        "LLdl",
        "ldLL",
        "LLld",
        "dlLL",
        "LLdl",
        "ldLL",
        "LLld",
      ], { L: "bamboo3", l: "bamboo2", d: "bamboo1" });
      // Palms of five round leaflets fanned around a stalk end: [cx, cy, tone shift].
      const fan: [number, number][] = [[-5, 0], [-4, -2], [-1, -3], [2, -2], [3, 0]];
      const leaves: [number, number, number, boolean][] = [];
      for (const [cx, cy, shift] of [[5, 6, -1], [13, 5, -1], [9, 3, -1], [3, 10, 0], [15, 10, 0], [9, 8, 1]] as const)
        fan.forEach(([dx, dy], i) => leaves.push([cx + dx, cy + dy, shift + (i === 2 ? 1 : 0), dx > 0]));
      for (const [x, y, shift, flipX] of leaves) stamp(p, x, y, ROUND_LEAF, LEAF, { shift, flipX, outline: "leaf1" });
      // Pot: blue-and-white porcelain with a band of cloud scrolls.
      art(p, 3, 21, [
        ".cCCCCCCCCc.",
        "cddeddeddddc",
        "WWWWWWWWWccc",
      ], { c: "cream3", C: "cream4", d: "wood2", e: "wood3", W: "white" });
      cylinder(p, 3, 24, 12, 5, ["cream1", "cream2", "cream3", "cream4", "white"], (r) => (r === 4 ? 1 : 0));
      art(p, 4, 25, [
        "b.bb..b.bb",
        "BbB.bBbB.b",
      ], { b: "blue3", B: "blue2" });
      autoOutline(p);
    },
  },

  /** Snake plant: banded sword leaves, two with yellow margins, in a terracotta pot. */
  "decor/plant-snake": {
    w: 16, h: 28, anchor: [8, 27], foot: [-5, -3, 10, 3], shadow: { rx: 6, ry: 2, dy: -1 },
    draw: (p) => {
      art(p, 0, 0, [
        "........o.......",
        ".......oLo......",
        ".......oLlo..o..",
        "......oLldo.oYo.",
        "..o...oLlbdoYdo.",
        ".oLo..oLlddoYdyo",
        ".oLdo.oLbbdoYbyo",
        ".oLddooLlddoYdyo",
        ".oLbdooLlddoYdyo",
        ".oLdoLoLlbdoYdyo",
        ".oLdoYdolddoYbyo",
        ".oLdoYdyodoLodyo",
        ".oLboYbyodoLdoyo",
        ".oLdoYdyooLddoyo",
        ".oLdoYdyooLbdoyo",
        ".oLdoYbyooLddoyo",
        ".oLboYdyooLddoyo",
        "..oLoYdyooLbdoyo",
        "..oLoYdyooLddoo.",
        "..oLoYdyooLdddo.",
      ], { o: "leaf1", L: "leaf4", l: "leaf3", d: "leaf2", b: "jade4", Y: "bamboo4", y: "bamboo2" });
      // Terracotta pot: a thick rolled rim and a tapering body, with a crust of white bloom.
      art(p, 2, 20, [
        "SRRRRRRRRRRr",
        "Rrrrrrrrrrqq",
      ], { R: "red5", S: "red5", r: "rose4", q: "rose3" });
      cylinder(p, 2, 22, 12, 5, ["rose1", "rose2", "rose3", "rose4", "red5"], (r) => (r >= 3 ? 1 : 0));
      p.hline(2, 22, 12, "rose2");
      p.px(4, 24, "cream3").px(5, 24, "cream3").px(4, 25, "cream2").px(11, 23, "cream2");
      autoOutline(p);
    },
  },

  /** Rubber plant: big glossy leaves on one stem, a bronze new leaf, an old leaf yellowing, a woven basket. */
  "decor/plant-rubber": {
    w: 20, h: 34, anchor: [10, 33], foot: [-6, -3, 12, 3], shadow: { rx: 7, ry: 2, dy: -1 },
    draw: (p) => {
      p.vline(10, 3, 23, "wood3").vline(11, 3, 23, "wood2");
      const g = { g: "jade5" } as const;
      const o = "jade1" as const;
      stamp(p, 11, 1, RUBBER_YOUNG, DEEP_LEAF, { shift: -1, legend: g, outline: o });
      stamp(p, 1, 4, RUBBER_BIG, DEEP_LEAF, { flipX: true, shift: -1, legend: g, outline: o });
      stamp(p, 10, 8, RUBBER_BIG, DEEP_LEAF, { legend: g, outline: o });
      stamp(p, 0, 12, RUBBER_BIG, DEEP_LEAF, { flipX: true, legend: g, outline: o });
      stamp(p, 10, 16, RUBBER_BIG, DEEP_LEAF, { legend: g, outline: o });
      stamp(p, 2, 20, RUBBER_YOUNG, ["wood2", "bamboo1", "bamboo2", "bamboo3", "bamboo4"], { flipX: true, legend: { g: "bamboo4" }, outline: "wood1" });
      stamp(p, 7, 14, RUBBER_DROOP, DEEP_LEAF, { shift: 1, legend: g, outline: o });
      art(p, 10, 0, [".r", "rR", "rR", "Rr"], { r: "rose3", R: "rose4" });
      // Woven basket: weavers over stakes, each row offset so the strands go over and under.
      cylinder(p, 3, 26, 14, 7, ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"], (r) => (r === 6 ? 1 : 0));
      p.over(() => {
        for (let y = 27; y < 32; y++) for (let x = 3; x < 17; x++) {
          const k = (x + (y % 2) * 2) % 4;
          if (k === 0) p.px(x, y, (x < 10 ? "bamboo2" : "bamboo1"));
          if (k === 1 && x < 8) p.px(x, y, "bamboo5");
        }
      });
      p.hline(3, 26, 14, "bamboo4").px(3, 26, "bamboo5").hline(4, 27, 12, "bamboo2");
      autoOutline(p);
    },
  },

  /** Scallions regrowing in a chipped enamel mug: a sill or counter piece. */
  "decor/plant-small-a": {
    w: 10, h: 13, anchor: [5, 12], foot: [-3, -2, 6, 2], shadow: { rx: 4, ry: 1 },
    draw: (p) => {
      art(p, 1, 0, [
        "..5...5.",
        "..4..54.",
        ".44..4..",
        ".4.44...",
        ".3.43.4.",
        ".33434..",
      ], { 3: "leaf3", 4: "leaf4", 5: "leaf5" });
      art(p, 1, 6, [
        "BccwcwB..",
        "bWwwwwcHH",
        "bWwwwwc.H",
      ], { B: "blue3", b: "blue2", c: "cream3", w: "cream5", W: "white", H: "cream3" });
      cylinder(p, 1, 9, 7, 3, ["cream1", "cream2", "cream3", "cream4", "white"]);
      p.hline(1, 8, 7, "blue2");
      p.px(5, 10, "steel1");
      autoOutline(p);
    },
  },

  /** A jade plant (crassula) with fleshy pads in a small cream-glazed pot. */
  "decor/plant-small-b": {
    w: 10, h: 12, anchor: [5, 11], foot: [-3, -2, 6, 2], shadow: { rx: 4, ry: 1 },
    draw: (p) => {
      art(p, 0, 0, [
        "..45..44..",
        ".4334.r43.",
        ".r33.t.3r.",
        "..44.t44..",
        ".4334t33..",
        "..3.tt.r..",
      ], { 3: "leaf3", 4: "leaf4", 5: "leaf5", r: "rose4", t: "wood3" });
      cylinder(p, 2, 6, 6, 5, ["wood2", "cream2", "cream3", "cream4", "white"], (r) => (r === 4 ? 1 : 0));
      p.hline(2, 6, 6, "wood3");
      autoOutline(p);
    },
  },

  /** A golden pothos trailing from a wall-hung pot in a brass hoop; the vine tips sway. */
  "decor/plant-hanging": {
    w: 16, h: 24, layer: "floor", frames: 4, fps: 2,
    draw: (p, frame) => {
      const sway = [0, 1, 0, -1][frame];
      const o = { outline: "leaf1" } as const;
      // Brass hook into the wall.
      art(p, 7, 0, ["gg", ".G", ".G"], { g: "gold2", G: "gold3" });
      // The pot, a cream glazed bowl in a brass hoop, with leaves spilling over the rim.
      art(p, 3, 4, [
        "cWCCCCCCCc",
        "CWCCCCCCcc",
        "ggGggggggq",
        "CWCCCCCccc",
        ".cCCCCCcc.",
        "..ccccc...",
      ], { g: "gold3", G: "gold4", q: "gold2", C: "cream4", W: "white", c: "cream2" });
      stamp(p, 1, 2, POTHOS, LEAF, { flipX: true, ...o });
      stamp(p, 9, 2, POTHOS, LEAF, { shift: -1, ...o });
      stamp(p, 5, 1, POTHOS, LEAF, { shift: 1, ...o });
      autoOutline(p);
      // Trailing vines: [x, y] from the rim down; only the low parts move.
      const vines: [number, number][][] = [
        [[4, 10], [4, 11], [3, 12], [3, 13], [3, 14], [2, 15], [2, 16], [2, 17], [2, 18], [3, 19], [3, 20], [3, 21], [4, 22]],
        [[8, 10], [8, 11], [8, 12], [9, 13], [9, 14]],
        [[11, 10], [12, 11], [12, 12], [13, 13], [13, 14], [13, 15], [13, 16], [12, 17], [12, 18], [12, 19]],
      ];
      const hang: [number, number, number, boolean][] = [
        [0, 12, 0, true], [3, 15, -1, false], [0, 18, 0, true], [4, 21, 0, false],
        [8, 14, -1, false], [13, 11, 0, false], [9, 15, -1, true], [13, 17, 0, false], [11, 19, 1, false],
      ];
      for (const [x, y, shift, flipX] of hang) stamp(p, x + (y > 12 ? sway : 0), y, POTHOS_SMALL, LEAF, { shift, flipX, ...o });
      p.under(() => { for (const vine of vines) for (const [x, y] of vine) p.px(x + (y > 13 ? sway : 0), y, "leaf2"); });
    },
  },
});
