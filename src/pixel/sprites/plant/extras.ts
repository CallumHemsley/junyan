/**
 * Unattached plants the town scene scatters: weeds for paving cracks, moss, fallen plane leaves,
 * a potted bamboo for a doorstep, and Boston ivy (爬山虎), which covers half the walls in the
 * French Concession. Ground pieces are `floor` and anchor at their bottom-centre. Ivy is wall art:
 * `plant/ivy-curtain` hangs from its top-centre, `plant/ivy-climb` grows up from its bottom-centre,
 * both `floor` like other wall pieces; `plant/ivy-drape` is an `over` fringe that hangs over the
 * front of a wall cap, anchored at its top-centre.
 */
import { defineSprites, hash, type Color, type Px } from "../../kit/index.ts";
import { lance } from "../decor/_helpers.ts";
import { FALLEN_LEAF, art, autoOutline, blade, stamp } from "./_helpers.ts";

const GROUND_OUTLINE = { leaf: "leaf1", jade: "jade1", bamboo: "wood1", oak: "wood1", wood: "wood1", gold: "wood1", stone: "stone1", orange: "brown1", rose: "rose1", cream: "leaf1", white: "leaf1" } as const;

// ── weeds ─────────────────────────────────────────────────────────────────────

/** A dandelion rosette pushing out of a crack, one flower open and one gone to a clock. */
function dandelion(p: Px) {
  art(p, 0, 3, [
    "......H.......",
    ".Hg..HgH..gH..",
    "..HggHgggHg...",
    "gHHgggHggggHHg",
    ".gggLggLggggg.",
    "..g.g..g..g...",
  ], { H: "leaf4", g: "leaf3", L: "leaf2" });
  p.vline(4, 2, 4, "leaf3").vline(9, 1, 5, "leaf3");
  art(p, 3, 0, [".Y.", "YyY", ".y."], { Y: "gold4", y: "gold3" });
  art(p, 8, -1, [".w.", "wWw", ".w."], { w: "cream4", W: "white" });
  p.hline(0, 9, 14, "stone2").px(5, 8, "stone2").px(11, 8, "stone2");
}

/** A tuft of meadow grass in a joint, some blades seeding. */
function tuft(p: Px) {
  for (let i = 0; i < 7; i++) blade(p, 5 + (i % 3), 9, Math.round((i - 3) * 1.9), -3 - Math.floor(hash(i, 0, 3) * 6), i % 2 ? "leaf4" : "leaf5", "leaf2");
  p.line(7, 8, 11, 1, "bamboo2");
  art(p, 10, 0, ["bB", ".b"], { b: "bamboo3", B: "bamboo4" });
  p.hline(0, 9, 14, "stone2");
}

/** Plantain flat in a long crack with clover along it. */
function crackPlantain(p: Px) {
  p.line(0, 6, 7, 5, "stone2").line(8, 5, 19, 7, "stone2");
  art(p, 2, 0, [
    "..HHg.HHg...",
    ".HHHggHHgg..",
    "gHHHgLHHHgg.",
    ".gggLLgggg..",
    "...g.g.g....",
  ], { H: "leaf4", g: "leaf3", L: "leaf2" });
  for (const x of [13, 16]) art(p, x, 3, ["H.H", ".g.", "HgH"], { H: "leaf4", g: "leaf3" });
}

/** Chickweed threaded along a paving joint, a few starry flowers. */
function jointChickweed(p: Px) {
  p.hline(0, 3, 24, "stone2");
  for (let x = 0; x < 24; x += 2) if (hash(x, 0, 7) < 0.75) art(p, x, 1 + (x % 4 ? 1 : 0), ["Hg", "g."], { H: "leaf4", g: "leaf3" });
  for (const x of [5, 15]) art(p, x, 0, [".w.", "wYw", ".w."], { w: "white", Y: "gold4" });
}

// ── moss ──────────────────────────────────────────────────────────────────────

/** Moss in a damp hollow: cushions lit on top, with a few pale fruiting stalks. */
function moss(p: Px, w: number, h: number, seed: number) {
  p.ellipse(w / 2, h / 2, w / 2, h / 2, "leaf2");
  for (let y = 0; y < h; y += 2) for (let x = (y / 2) % 2; x < w; x += 3) {
    if (!p.solid(x, y) || hash(x, y, seed) < 0.3) continue;
    art(p, x, y, ["Hg", "gL"], { H: hash(x, y, seed + 1) < 0.3 ? "leaf5" : "leaf4", g: "leaf3", L: "leaf2" });
  }
  p.over(() => { for (let x = 0; x < w; x++) p.px(x, h - 1, "jade2"); });
  for (let k = 0; k < 3; k++) {
    const x = 2 + Math.floor(hash(k, 1, seed) * (w - 4)), y = 1 + Math.floor(hash(k, 2, seed) * (h - 3));
    p.px(x, y, "bamboo4").px(x, y + 1, "oak2");
  }
}

// ── fallen plane leaves ──────────────────────────────────────────────────────

const LEAF_RAMPS: readonly (readonly Color[])[] = [
  ["leaf2", "leaf3", "leaf4"],
  ["bamboo2", "bamboo4", "gold4"],
  ["oak1", "oak3", "oak4"],
  ["wood2", "wood3", "wood4"],
  ["oak2", "bamboo3", "bamboo4"],
];
/** A leaf lying on its back: the paler underside with raised veins. */
const LEAF_BACK = ["....3...", "3..323.3", "33.3233.", ".3323233", "33322333", ".333333.", "...1.1..", "....1..."];
/** A dry leaf curled up on itself. */
const LEAF_CURL = [".33.", "3223", "3112", ".1.."];
/** A plane seed ball: a spiky brown sphere on its stalk. */
const SEED_BALL = ["1.1.1", ".333.", "13332", ".322.", "1.2.1", "...1.", "....1"];

function leafScatter(p: Px, placed: readonly (readonly [number, number, number, number])[]) {
  // [x, y, ramp, shape]: 0 flat, 1 flipped, 2 back, 3 curled, 4 seed ball.
  for (const [x, y, r, shape] of placed) {
    const ramp = LEAF_RAMPS[r];
    if (shape === 4) stamp(p, x, y, SEED_BALL, ["wood1", "wood2", "oak2"]);
    else stamp(p, x, y, shape === 2 ? LEAF_BACK : shape === 3 ? LEAF_CURL : FALLEN_LEAF, ramp, { flipX: shape === 1 });
  }
  autoOutline(p, { map: GROUND_OUTLINE });
}

// ── potted bamboo ────────────────────────────────────────────────────────────

/** Bamboo culms for the pot: [base x, top x, top y, width]. */
const CULMS: readonly (readonly [number, number, number, number])[] = [[14, 9, 10, 3], [18, 19, 2, 3], [22, 28, 8, 3], [16, 13, 20, 2], [25, 31, 22, 2]];

function bambooPot(p: Px, frame: number) {
  const sway = [0, 1, 0, -1][frame];
  // Culms, each with nodes and a lit left edge, leaning a touch more toward the top.
  for (const [bx, tx, ty, w] of CULMS) {
    for (let y = ty; y < 62; y++) {
      const t = (62 - y) / (62 - ty);
      const x = Math.round(bx + (tx - bx) * t * t + (t > 0.6 ? sway * (t - 0.6) * 2.5 : 0));
      for (let i = 0; i < w; i++) p.px(x + i, y, i === 0 ? "leaf4" : i === w - 1 ? "jade2" : "jade3");
      if ((y - ty) % 9 === 4) { p.px(x - 1, y, "jade2"); for (let i = 0; i < w; i++) p.px(x + i, y, "bamboo4"); }
    }
  }
  // Leaf sprays: slender lances fanning from the upper nodes, darker behind.
  const sprays: readonly (readonly [number, number, number])[] = [
    [9, 12, -1], [19, 4, 1], [28, 10, 1], [13, 22, -1], [31, 24, 1], [5, 20, -1], [24, 2, 1], [12, 6, -1], [33, 14, 1], [20, 16, -1],
  ];
  sprays.forEach(([x, y, dir], i) => {
    const s = y < 14 ? sway : 0;
    const len = 9 + (i % 3) * 2;
    lance(p, [[x + s, y], [x + s + dir * Math.round(len * 0.6), y + 3], [x + s + dir * len, y + 7]], { width: 2, shift: i % 2 ? -1 : 0 });
    lance(p, [[x + s, y + 1], [x + s + dir * 4, y - 3], [x + s + dir * 7, y - 4]], { width: 2, shift: i % 3 ? 0 : 1 });
  });
  // A dry leaf caught in the culms.
  lance(p, [[20, 36], [24, 40], [26, 45]], { width: 2, ramp: ["wood1", "oak1", "oak2", "oak3", "bamboo4"] });
  // The pot: a big brown-glazed water jar (缸) with a lip, a glaze run and a chip, on a brick.
  art(p, 5, 60, [
    "..kkkkkkkkkkkkkkkkkkkkkkkk..",
    ".kGGGGGGGGGGGGGGGGGGGGGGgqk.",
    "kGgddddddddddddddddddddddgqk",
    "kqqqqqqqqqqqqqqqqqqqqqqqqqqk",
  ], { k: "wood1", G: "wood5", g: "wood4", d: "brown1", q: "wood2" });
  for (let j = 0; j < 16; j++) {
    const inset = j < 2 ? 0 : j > 12 ? j - 12 : 0;
    for (let i = inset; i < 28 - inset; i++) {
      const u = (i + 0.5) / 28;
      p.px(5 + i, 64 + j, u < 0.1 ? "wood3" : u < 0.22 ? "wood4" : u < 0.55 ? "wood3" : u < 0.82 ? "wood2" : "wood1");
    }
  }
  p.vline(9, 65, 8, "wood5").vline(10, 66, 3, "gold4");
  // Glaze runs and the unglazed foot showing pale.
  art(p, 18, 64, ["g", "g", "g", "G"], { g: "wood4", G: "wood5" });
  p.hline(8, 78, 22, "oak3").hline(9, 79, 20, "oak2");
  art(p, 26, 62, ["cC", ".c"], { c: "oak3", C: "oak4" });
  // The brick it stands on to keep its foot dry.
  art(p, 6, 80, ["rRRRRRRRRRRRRRRRRRRRRRRRRr", "qqqqqqqqqqqqqqqqqqqqqqqqqq", "pppppppppppppppppppppppppp"], { r: "rose3", R: "rose4", q: "rose2", p: "rose1" });
  autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", wood: "wood1", oak: "wood1", rose: "rose1", brown: "wood1", gold: "wood1", bamboo: "jade1" } });
}

// ── ivy ──────────────────────────────────────────────────────────────────────

/** Boston ivy leaves: three-lobed, lying flat on the wall like shingles. */
const IVY_LEAVES = [["3.3.3", "33332", ".3222", "..21."], ["3..3.", "33332", "33222", ".221."], [".33..", "3332.", "3222.", ".21.."]];
const IVY: Color[] = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const IVY_TURNING: Color[] = ["rose2", "rose3", "orange1", "orange2", "orange3"];

/**
 * Stamp ivy leaves on a grid wherever `cover(x, y)` (0..1) beats a hash: thick where the plant is
 * old, thinning to single leaves at its growing edge. Stems are drawn first by the caller.
 */
function ivyLeaves(p: Px, w: number, h: number, cover: (x: number, y: number) => number, seed: number) {
  for (let j = 0, y = -1; y < h; j++, y += 3) for (let x = -2 + ((j & 1) ? 2 : 0); x < w; x += 4) {
    if (hash(x, y, seed) > cover(x + 2, y + 2)) continue;
    const leaf = IVY_LEAVES[Math.floor(hash(y, x, seed + 1) * IVY_LEAVES.length)];
    const turning = hash(x, y, seed + 2) < 0.02;
    const shift = (x < w * 0.35 ? 1 : 0) - (y > h * 0.7 ? 1 : 0) + (hash(x, y, seed + 3) < 0.2 ? -1 : 0);
    stamp(p, x + Math.round(hash(x, y, seed + 4)), y, leaf, turning ? IVY_TURNING : IVY, { shift, flipX: hash(x, y, seed + 5) < 0.5 });
  }
}

export default defineSprites({
  /** A dandelion in a paving crack: one flower open, one gone to seed. */
  "plant/weeds-a": { w: 14, h: 10, anchor: [7, 9], layer: "floor", draw: (p) => { p.clip(0, 1, 14, 9, () => dandelion(p)); autoOutline(p, { map: GROUND_OUTLINE }); } },
  /** A tuft of grass in a joint, a seed head nodding. */
  "plant/weeds-b": { w: 14, h: 10, anchor: [7, 9], layer: "floor", draw: (p) => { tuft(p); autoOutline(p, { map: GROUND_OUTLINE }); } },
  /** Plantain flattened by feet in a long crack, with clover along it. */
  "plant/weeds-c": { w: 20, h: 8, anchor: [10, 7], layer: "floor", draw: (p) => { crackPlantain(p); autoOutline(p, { map: GROUND_OUTLINE }); } },
  /** Chickweed threaded along a paving joint: a strip to lay along tile seams. */
  "plant/weeds-d": { w: 24, h: 5, anchor: [12, 4], layer: "floor", draw: (p) => { jointChickweed(p); autoOutline(p, { map: GROUND_OUTLINE }); } },

  /** Moss in a damp hollow under a drainpipe or in a shady corner. */
  "plant/moss-a": { w: 22, h: 10, anchor: [11, 9], layer: "floor", draw: (p) => { moss(p, 22, 10, 3); autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", bamboo: "leaf1", oak: "leaf1" }, sides: ["bottom", "right"] }); } },
  "plant/moss-b": { w: 14, h: 8, anchor: [7, 7], layer: "floor", draw: (p) => { moss(p, 14, 8, 9); autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", bamboo: "leaf1", oak: "leaf1" }, sides: ["bottom", "right"] }); } },
  /** A long thread of moss for a joint between flagstones. */
  "plant/moss-c": {
    w: 32, h: 5, anchor: [16, 4], layer: "floor",
    draw: (p) => {
      for (let x = 0; x < 32; x++) if (hash(x, 0, 21) < 0.85) { p.px(x, 2, "leaf2"); if (hash(x, 1, 21) < 0.6) p.px(x, 1, hash(x, 2, 21) < 0.4 ? "leaf4" : "leaf3"); }
      autoOutline(p, { map: { leaf: "leaf1" }, sides: ["bottom", "right"] });
    },
  },

  /** Plane leaves blown into a drift: green ones still, yellow, ochre, one on its back. */
  "plant/leaves-a": { w: 28, h: 20, anchor: [14, 19], layer: "floor", draw: (p) => leafScatter(p, [[2, 3, 1, 0], [10, 1, 2, 1], [18, 5, 0, 0], [6, 10, 3, 2], [15, 12, 1, 1], [21, 11, 4, 3]]) },
  /** Three leaves, one curled dry. */
  "plant/leaves-b": { w: 22, h: 14, anchor: [11, 13], layer: "floor", draw: (p) => leafScatter(p, [[1, 2, 2, 0], [9, 5, 4, 1], [16, 1, 3, 3]]) },
  /** Two leaves and a fallen seed ball, the plane's spiky fruit. */
  "plant/leaves-c": { w: 20, h: 14, anchor: [10, 13], layer: "floor", draw: (p) => leafScatter(p, [[1, 4, 0, 1], [10, 1, 1, 0], [12, 7, 0, 4]]) },
  /** A single leaf. */
  "plant/leaf": { w: 9, h: 8, anchor: [4, 7], layer: "floor", draw: (p) => leafScatter(p, [[1, 1, 1, 0]]) },

  /**
   * A doorstep bamboo in a brown-glazed water jar that used to hold rice wine, stood on a brick to
   * keep its foot dry. A dry leaf is caught in the culms; the tops stir (four frames at 2 fps).
   */
  "plant/bamboo-pot": {
    w: 40, h: 84, anchor: [19, 82], frames: 4, fps: 2, foot: [-14, -6, 28, 6], shadow: { rx: 15, ry: 4, dy: -2 },
    draw: (p, frame) => bambooPot(p, frame),
  },

  /** Boston ivy hanging from a wall top in a curtain, ragged at the bottom with trailing shoots. */
  "plant/ivy-curtain": {
    w: 32, h: 64, anchor: [16, 0], layer: "floor",
    draw: (p) => {
      const bottom = (x: number) => 30 + Math.round(Math.sin(x * 0.45) * 6 + hash(x >> 2, 0, 5) * 18);
      for (const x of [4, 11, 19, 27]) p.vline(x, 0, bottom(x) - 4, "wood2");
      ivyLeaves(p, 32, 64, (x, y) => (y < bottom(x) - 8 ? 0.95 : y < bottom(x) ? 0.55 : y < bottom(x) + 6 && x % 8 < 3 ? 0.35 : 0), 11);
      autoOutline(p, { map: { leaf: "leaf1", rose: "rose1", orange: "rose1", wood: "wood1" } });
    },
  },
  /** Boston ivy climbing from the foot of a wall, old and thick at the base, single leaves at its tips. */
  "plant/ivy-climb": {
    w: 64, h: 48, anchor: [32, 47], layer: "floor",
    draw: (p) => {
      const stems: readonly (readonly [number, number, number, number])[] = [[10, 47, 4, 6], [10, 47, 30, 4], [14, 47, 52, 14], [30, 30, 46, 2], [20, 47, 60, 34]];
      for (const [x0, y0, x1, y1] of stems) p.line(x0, y0, x1, y1, "wood2");
      const near = (x: number, y: number) => Math.min(...stems.map(([x0, y0, x1, y1]) => {
        const dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - x0 - t * dx, y - y0 - t * dy);
      }));
      ivyLeaves(p, 64, 48, (x, y) => {
        const age = 1 - Math.hypot(x - 10, y - 47) / 70;
        return near(x, y) < 3 ? 0.9 : near(x, y) < 7 ? age : age * 0.5 - 0.1;
      }, 23);
      autoOutline(p, { map: { leaf: "leaf1", rose: "rose1", orange: "rose1", wood: "wood1" } });
    },
  },
  /** Ivy spilling over the front of a wall cap: a dense lip with trailing shoots, drawn over actors. */
  "plant/ivy-drape": {
    w: 64, h: 22, anchor: [32, 0], layer: "over",
    draw: (p) => {
      const tail = (x: number) => 7 + Math.round(hash(x >> 3, 1, 31) * 12);
      for (let x = 3; x < 64; x += 8) p.vline(x, 0, tail(x) - 1, "leaf2");
      ivyLeaves(p, 64, 22, (x, y) => (y < 6 ? 1 : y < tail(x) ? 0.6 : 0), 31);
      autoOutline(p, { map: { leaf: "leaf1", rose: "rose1", orange: "rose1", wood: "wood1" }, sides: ["bottom", "left", "right"] });
    },
  },
});
