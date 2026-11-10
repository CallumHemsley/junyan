/**
 * Hero food icons, 48×48, for the interface: the kitchen pass, the tray and the order.
 * Each is a small still life in slight three-quarter view from above, lit from the upper left.
 * Ids `food/<id>-icon`.
 */
import { defineSprites, hash, Px, type Color } from "../../kit/index.ts";
import { grid, inEllipse, part, selout, shift, tube, type Ramp } from "./_helpers.ts";
import { bowl, plate, RIMS, steamer, surface, tumbler, type BodyPattern } from "./_ware.ts";

const DOUGH: Ramp = ["cream2", "cream3", "cream4", "cream5", "white"];
const DOUGH_CUTS = [0.24, 0.48, 0.7, 0.9];

/** Translucent steam: soft hooks of white that thin as they rise. Points are [x, y, alpha]. */
function steam(p: Px, strokes: readonly (readonly [number, number, number])[][]) {
  for (const stroke of strokes) for (const [x, y, a] of stroke) p.faded(a, () => p.px(x, y, "white"));
}

/** A steam curl rising from (x, y): an S of pixels, `h` tall, fading to nothing. */
function curl(x: number, y: number, h: number, phase = 0, alpha = 0.6): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let j = 0; j < h; j++) {
    const t = j / h;
    out.push([Math.round(x + 1.6 * Math.sin(t * 5 + phase)), y - j, alpha * (1 - t) * (t < 0.15 ? t / 0.15 : 1)]);
  }
  return out;
}

/**
 * Pleats: `n` creases spiralling out from a knot at (kx, ky), each a clean one-pixel line, dark in
 * the groove with a sunlit ridge just to its left. Front creases run long down the dome's face;
 * back ones are short. `reach` limits how far out they run (0..1 of the radius).
 */
function pleats(q: Px, kx: number, ky: number, rx: number, ry: number, n: number, turn: number, reach: number, keep?: (x: number, y: number) => boolean) {
  const marks = new Set<string>();
  for (let i = 0; i < n; i++) {
    const a0 = turn + (i * 2 * Math.PI) / n;
    let last: [number, number] | null = null;
    for (let s = 0.14; s <= reach; s += 0.02) {
      const a = a0 + 1.3 * s, front = Math.sin(a);
      const x = Math.round(kx + Math.cos(a) * s * rx * 0.95 - 0.5), y = Math.round(ky + front * s * ry * (front > 0 ? 1.15 : 0.55) - 0.5);
      if (front < -0.2 && s > 0.5) break;
      if (last && last[0] === x && last[1] === y) continue;
      last = [x, y];
      if (q.solid(x, y) && (!keep || keep(x, y))) marks.add(`${x},${y}`);
    }
  }
  for (const key of marks) {
    const [x, y] = key.split(",").map(Number);
    const c = q.get(x, y);
    q.px(x, y, c === "white" || c === "cream5" || c === "cream4" ? "cream3" : "cream2");
  }
  for (const key of marks) {
    const [x, y] = key.split(",").map(Number);
    if (!marks.has(`${x - 1},${y}`)) shift(q, x - 1, y, DOUGH, 1);
  }
}

/** Two pleated steamed buns, 22×19, hand-placed: pleats swirl into a twisted knot on top. */
const BUNS = [[
  ".........ccc..........",
  "......cccWW5oooo......",
  ".....cWWWW543433o.....",
  "...ccWWW5432Wgg43oo...",
  "..cWWWggW33Wg5Wg433o..",
  "..cWWgWWgWggWg5Wg43o..",
  ".c5WgWWgWWgWgWg55g33o.",
  "c5Wg5WgWWg5Wg5Wg45g33o",
  "c5555Wg5Wg55Wg55g4422o",
  "c455Wg55Wg55Wg45g4222o",
  "c444555Wg5555g445g222o",
  "c4444445g44445g442222o",
  ".o444444444444442222o.",
  ".c334444444444222222o.",
  "..o3333444432222222o..",
  "...o33333332222222o...",
  "....o333332222222o....",
  ".....oo33222222oo.....",
  ".......oooooooo.......",
], [
  ".........ccc..........",
  "......cccWW5oooo......",
  ".....cWWWW543433o.....",
  "...ccWWg5432g5443oo...",
  "..cWWggWg335Wgg4433o..",
  "..cWgWWgWgWgg5Wg443o..",
  ".cWgWWgWWgWgWg5Wg433o.",
  "cWg5WgWWg5Wg5Wg45g433o",
  "c55Wg5Wg55Wg5Wg445g22o",
  "c45Wg5Wg55Wg555g44222o",
  "c4445Wg55Wg5445g44222o",
  "c44445g445g4444442222o",
  ".o444444444444442222o.",
  ".c334444444444222222o.",
  "..o3333444432222222o..",
  "...o33333332222222o...",
  "....o333332222222o....",
  ".....oo33222222oo.....",
  ".......oooooooo.......",
]];
const BUN_KEY = { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2", g: "cream3", G: "cream2" } as const;

function pleatedBun(variant: 0 | 1): Px {
  return part(22, 19, (q) => grid(q, 0, 0, BUNS[variant], BUN_KEY));
}

/**
 * A bun torn open at the front: ragged skin, fluffy white crumb and a glossy ball of pork and
 * scallion filling with the juice still shining.
 */
function tornBun(): Px {
  const w = 22, h = 19;
  return part(w, h, (q) => {
    grid(q, 0, 0, BUNS[1].map((r, y) => (y > 6 ? r.replace(/g/g, y > 8 ? "4" : "5") : r)), BUN_KEY);
    const cx = w / 2, cy = h / 2 + 0.4, rx = w / 2 - 1, ry = h / 2 - 1.2;
    // The tear: a ragged hole across the front of the dome.
    const ox = cx + 0.5, oy = cy + ry * 0.22, orx = rx * 0.62, ory = ry * 0.5;
    const ragged = (x: number, y: number, grow = 0) => {
      const a = Math.atan2((y + 0.5 - oy) / ory, (x + 0.5 - ox) / orx);
      const k = 1 + 0.12 * Math.sin(a * 5 + 1) + 0.07 * Math.sin(a * 11);
      return inEllipse(ox, oy, orx * k + grow, ory * k + grow * 0.7, x, y);
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!q.solid(x, y)) continue;
      if (ragged(x, y)) {
        // Crumb: its far wall in shadow under the torn lip, the near floor lit.
        const v = (y + 0.5 - oy) / ory;
        q.px(x, y, v < -0.45 ? "cream3" : v < 0.1 ? "cream4" : "cream5");
      } else if (ragged(x, y, 1) && y + 0.5 > oy) q.px(x, y, "white");
    }
    // Air pockets in the crumb: tiny soft clusters.
    q.over(() => {
      for (const [x, y] of [[ox - orx * 0.7, oy + 1], [ox + orx * 0.62, oy + 0.5], [ox - orx * 0.35, oy + ory * 0.7]] as const)
        q.px(x, y, "cream3").px(x + 1, y, "cream4");
    });
    // The filling.
    grid(q, Math.round(ox - 4), Math.round(oy - 2.5), [
      "..oooo...",
      ".oMmmmo..",
      "oMhmmgmo.",
      "omwmmmdmo",
      "omhmdmmdo",
      ".odmmddo.",
      "..oddoo..",
    ], { o: "brown1", m: "wood3", M: "wood4", h: "oak3", w: "white", d: "wood2", g: "leaf3" });
  });
}

/** The steamer's cotton liner: a corner hangs over the rim at the front left, blue stripe at the hem. */
function liner(p: Px) {
  grid(p, 4, 32, [
    "..cccccccc..",
    ".cCCwwCCCCc.",
    "cCCCwCCkCCCc",
    ".cCCCCkCCCc.",
    "..cCCkCCCc..",
    "..cbbbbbbc..",
    "...cBBBBc...",
    "...cbbbbc...",
    "....cccc....",
  ], { c: "cream2", C: "cream4", w: "cream5", k: "cream3", b: "blue4", B: "blue3" });
}

/**
 * 包子. A steamer from the stall's top tier, the morning's third batch: two pleated buns and one
 * torn open to show the pork, on a damp cotton liner, still breathing steam.
 */
function bunIcon(p: Px) {
  const basket = part(48, 48, (q) => {
    steamer(q, 24, 29, 22.5, 8.5, 9, "back", [9, 24, 38]);
    // The liner shows round the buns inside the well.
    q.over(() => {
      for (let y = 22; y < 36; y++) for (let x = 3; x < 46; x++)
        if (q.get(x, y) === "bamboo2" && inEllipse(24, 30, 19, 6, x, y)) q.px(x, y, "cream4");
      // Folds in the damp cloth.
      for (const [x, y, n] of [[6, 27, 3], [38, 26, 4], [10, 31, 4], [33, 32, 3], [24, 34, 4]] as const) q.hline(x, y, n, "cream3").hline(x + 1, y - 1, n - 1, "cream5");
    });
  });
  p.blit(selout(basket, "bamboo1", "bamboo2"), 0, 0);
  p.blit(pleatedBun(0), 2, 8);
  p.blit(pleatedBun(1), 23, 7);
  p.blit(tornBun(), 12, 15);
  steamer(p, 24, 29, 22.5, 8.5, 9, "front");
  liner(p);
  steam(p, [curl(14, 9, 9, 0, 0.55), curl(33, 7, 7, 2, 0.45), curl(23, 14, 8, 1, 0.5)]);
}

// ── bread 馒头 ───────────────────────────────────────────────────────────────

/** A plain steamed bread: smooth, matte, no pleats; a broad soft light and a warm shade below. 22×16. */
const MANTOU = [
  ".......cccccccc.......",
  ".....cc55WW5554oo.....",
  "....c5WWWW5555554o....",
  "...c5WWWW555555544o...",
  "..c5WWWW55555555444o..",
  ".c55WW55555555554443o.",
  ".c555555555555554443o.",
  "c45555555555555444433o",
  "c44555555555554444332o",
  "c44455555555544443322o",
  "o44445555555444433222o",
  "o34444444444433322222o",
  ".o333444444443332222o.",
  "..o3333344433322222o..",
  "...oo333332222222oo...",
  ".....oooooooooooo.....",
];
const MANTOU_KEY = { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2" } as const;

/** A mantou with a bite out of its shoulder: the crumb shows soft and full of small air pockets. */
function bittenMantou(): Px {
  return part(22, 16, (q) => {
    grid(q, 0, 0, MANTOU, MANTOU_KEY);
    const bite = (x: number, y: number, g = 0) => inEllipse(17.5, 2.5, 4.2 + g, 3.6 + g, x, y) || inEllipse(20.5, 6, 3.4 + g, 3 + g, x, y);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 22; x++) {
      if (!q.solid(x, y)) continue;
      if (bite(x, y)) q.px(x, y, null);
      else if (bite(x, y, 1.6)) q.px(x, y, bite(x - 1, y - 1, 1.6) && !bite(x + 1, y + 1, 1.6) ? "cream5" : "cream4");
    }
    // Pores in the crumb, and the thin skin round the bite.
    q.over(() => q.px(15, 6, "cream3").px(16, 7, "cream3").px(18, 9, "cream3").px(19, 9, "cream3").px(14, 5, "cream3"));
    selout(q, "wood3", "oak2");
  });
}

/**
 * 馒头. Two plain steamed breads on the dotted plate the owner's mother brought from home; someone
 * couldn't wait and took a bite out of one on the way to the table.
 */
function breadIcon(p: Px) {
  plate(p, 24, 34, 22.5, 10, { rim: RIMS.dotted, well: 0.62, chip: [[43, 39], [44, 38]] });
  // Soft shade where each bread sits.
  p.over(() => {
    p.ellipse(15, 31, 10, 3.2, "blue6");
    p.ellipse(31, 37, 10, 3.2, "blue6");
    p.ellipse(15.5, 30.5, 8, 2.2, "blue5");
    p.ellipse(31.5, 36.5, 8, 2.2, "blue5");
  });
  p.blit(part(22, 16, (q) => grid(q, 0, 0, MANTOU, MANTOU_KEY)), 4, 16);
  p.blit(bittenMantou(), 20, 22);
  // A crumb fallen from the bite.
  grid(p, 38, 40, ["cC", ".c"], { c: "cream4", C: "cream5" });
}

// ── egg 鸡蛋 ─────────────────────────────────────────────────────────────────

/**
 * A peeled tea egg standing on its broad end. The shell was cracked all over and simmered in tea
 * and soy, so the pale white is netted with crisp brown lines where the liquid crept in.
 * The net is the borders between cells round jittered seeds, one pixel wide. `w` × `h`.
 */
function teaEgg(w = 15, h = 20, seed = 3): Px {
  return part(w, h, (q) => {
    const cx = w / 2, cy = h * 0.54, ry = h / 2 - 1;
    const rxAt = (y: number) => (w / 2 - 1) * (1 - 0.2 * Math.max(0, (cy - (y + 0.5)) / ry));
    const TEA: Ramp = ["oak3", "oak4", "oak5", "cream4"];
    const step = Math.max(2.6, w / 4.2);
    const seeds: [number, number][] = [];
    for (let gy = -1; gy < h / step + 1; gy++) for (let gx = -1; gx < w / step + 1; gx++)
      seeds.push([gx * step + hash(gx, gy, seed) * step, gy * step + hash(gx, gy, seed + 1) * step]);
    const cell = (x: number, y: number) => {
      let best = 0, d = Infinity;
      seeds.forEach(([sx, sy], k) => { const e = Math.hypot(x + 0.5 - sx, y + 0.5 - sy); if (e < d) { d = e; best = k; } });
      return best;
    };
    const inside = (x: number, y: number) => {
      const u = (x + 0.5 - cx) / rxAt(y), v = (y + 0.5 - cy) / ry;
      return u * u + v * v <= 1;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      const u = (x + 0.5 - cx) / rxAt(y), v = (y + 0.5 - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - u * u - v * v));
      const l = Math.max(0, -0.55 * u - 0.6 * v + 0.6 * nz);
      const i = l < 0.3 ? 0 : l < 0.55 ? 1 : l < 0.8 ? 2 : 3;
      const c = cell(x, y), edge = (inside(x + 1, y) && cell(x + 1, y) !== c) || (inside(x, y + 1) && cell(x, y + 1) !== c);
      q.px(x, y, edge ? (i >= 2 ? "wood4" : i === 1 ? "wood3" : "brown2") : TEA[i]);
    }
    // One strong glint where the sun hits the wet white.
    const gx = Math.round(cx - w * 0.2), gy = Math.round(cy - ry * 0.45);
    q.rows(gx - 1, gy - 1, [".cc.", "cWWc", "cWc.", ".c.."], { c: "cream5", W: "white" });
    selout(q, "brown1", "wood3");
  });
}

/** The other egg, halved, cut face up: a thin marbled edge, the white, a grey-green ring, the yolk. 16×12. */
const HALF_EGG = [
  "....cccccccc....",
  "..ccbbbbbbbboo..",
  ".cbtWWwwwwwwtbo.",
  "cbWWwwrrrrwwwtbo",
  "cbWwwrzyyyrwwwbo",
  "cbwwrzyyyyYrwwbo",
  "obwwryyyyYYrwwbo",
  "obtwwrYYYYrwwtbo",
  ".obtwwrrrrwwtbo.",
  "..oebbttttbbeo..",
  "...oeeveeeveo...",
  "....oooooooo....",
];

/** One star anise, eight pointed boats round a centre, each split along its top; two show a glossy seed. 19×15. */
function starAnise(): Px {
  return part(19, 15, (q) => {
    const cx = 9.5, cy = 7.5;
    for (let y = 0; y < 15; y++) for (let x = 0; x < 19; x++) {
      const dx = x + 0.5 - cx, dy = (y + 0.5 - cy) / 0.82, r = Math.hypot(dx, dy);
      if (r > 8.4) continue;
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4 + 0.2, ax = Math.cos(a), ay = Math.sin(a);
        const along = dx * ax + dy * ay, across = Math.abs(-dx * ay + dy * ax);
        if (along < 0.8 || along > 8.2) continue;
        const half = 1.55 * Math.sin((Math.PI * (along - 0.4)) / 8.2);
        if (across > half) continue;
        const lit = ax + ay < 0.3;
        // The seam along each boat's back, where it has split open.
        const seam = across < 0.45 && along > 2 && along < 6.5;
        q.px(x, y, seam ? "rose1" : across > half - 0.8 ? (lit ? "rose3" : "rose2") : lit ? "rose4" : "rose3");
      }
    }
    q.rows(8, 6, ["rr.", "rRr", ".r."], { r: "rose2", R: "rose1" });
    for (const [x, y] of [[13, 4], [5, 10]] as const) q.px(x, y, "gold4").px(x + 1, y, "gold2");
    selout(q, "rose1");
  });
}

/**
 * 鸡蛋. Tea eggs from the pot that has simmered on the counter since five: one whole, one halved,
 * in a shallow wave-rim dish with a spoonful of the tea, a star anise and a stray tea leaf.
 */
function eggIcon(p: Px) {
  plate(p, 24, 34, 22, 9.5, { rim: RIMS.plain, well: 0.7 });
  p.over(() => { p.ellipse(17, 38.5, 7, 2.2, "blue5"); p.ellipse(30, 39, 8, 2, "blue5"); });
  p.blit(teaEgg(15, 20), 10, 20);
  grid(p, 23, 31, HALF_EGG, { c: "oak2", o: "wood3", b: "oak3", t: "cream4", W: "white", w: "cream5", r: "jade4", y: "gold4", Y: "gold3", z: "gold5", e: "oak4", v: "wood4" });
  p.blit(starAnise(), 27, 17);
  // A tea leaf, unfurled from the brew.
  grid(p, 6, 36, ["..ll...", ".lLLll.", "lLvvvLl", ".llLll.", "...l..."], { l: "leaf1", L: "leaf2", v: "leaf3" });
}

// ── soy milk 豆浆 ────────────────────────────────────────────────────────────

const FRIED: Ramp = ["orange1", "gold2", "gold3", "gold4", "gold5"];

/** A porcelain spoon lying on the saucer: deep bowl, short flat handle, blue rim line. 17×7. */
const FLAT_SPOON = [
  "...ooooo.........",
  "..obWWWbo........",
  ".obWwwwwbooooooo.",
  "obWwwwwwbbbbbbWbo",
  "obwwwwwwbooooooo.",
  ".obwwwwbo........",
  "..ooooo..........",
];

/** Blue ink for a body pixel: lighter on the lit side, deeper round the shaded side. */
const ink = (lit: boolean): Color => (lit ? "blue3" : "blue2");

/**
 * Stamp a motif on a bowl's body: `o` is ink, `O` a pale wash, `d` the darkest accent, `e` white.
 * Lands only on existing body pixels, picking the ink by which side of the bowl it falls.
 */
function motif(p: Px, x: number, y: number, rows: readonly string[], litBelow: number) {
  p.over(() => rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const k = row[i];
      if (k === ".") continue;
      const lit = x + i < litBelow;
      p.px(x + i, y + j, k === "o" ? (lit ? "blue2" : "blue1") : k === "O" ? (lit ? "blue4" : "blue3") : k === "d" ? "blue1" : "white");
    }
  }));
}

/**
 * 豆浆. Soy milk the way the stall pours it for people who sit down: a tall ribbed glass on a
 * saucer, a skin just forming, a bead running down from where it was filled too full, and the
 * porcelain spoon laid beside it.
 */
function milkIcon(p: Px) {
  plate(p, 24, 40, 21, 5.5, { rim: RIMS.banded, well: 0.6 });
  p.over(() => p.ellipse(22, 41.5, 10, 2.2, "blue5"));
  p.blit(tumbler(48, 48, 21, 7, 40, 10.5, 8.5, 3.2, { headroom: 3, base: 3, ribs: 3, fill: ["cream3", "cream4", "cream5", "white"] }), 0, 0);
  // A skin wrinkling on the far right of the surface, and the sheen on the left.
  grid(p, 21, 8, [
    "..kkkk...",
    ".kSSkSkk.",
    "kSkSSkSSk",
    ".kkSkkSk.",
    "...kkk...",
  ], { k: "cream3", S: "cream5" });
  p.hline(14, 9, 4, "white").hline(13, 10, 2, "white");
  // The meniscus catching light along the near edge of the surface.
  p.over(() => { for (let x = 13; x < 30; x++) { const y = Math.round(10.2 + 2.4 * Math.sqrt(Math.max(0, 1 - ((x + 0.5 - 21) / 9.3) ** 2))); p.px(x, y, x < 22 ? "white" : "cream5"); } });
  // A bead of milk run over the lip and down the outside of the glass, swelling into a drop.
  grid(p, 30, 7, ["ww.", ".W.", ".w.", ".W.", ".w.", ".W.", ".w.", "wWw", "WwW", ".k."], { w: "cream5", W: "cream4", k: "cream3" });
  p.px(31, 14, "white");
  grid(p, 29, 37, FLAT_SPOON, { o: "blue2", b: "blue3", W: "white", w: "blue6" });
}

// ── congee 粥 ────────────────────────────────────────────────────────────────

/** A little carp swimming left: an eye, a fin, a forked tail. */
const CARP = [
  "...ooo.......",
  "..ooooo...oo.",
  ".oooooooooo..",
  "oeodooddoo...",
  ".oooooooooo..",
  "..oo.oo...oo.",
];

/** The congee bowl: a broad blue collar with a white wave running through it, a hairline below. */
function carpBowl(depth: number): BodyPattern {
  return (u, t, lit) => {
    const py = t * depth;
    if (py < 2.4) return ink(lit);
    if (py > 3 && py < 3.6) return lit ? "blue4" : "blue3";
    if (py > depth - 1.4) return ink(lit);
    return undefined;
  };
}

/**
 * 粥. White rice congee in the carp bowl, done the way the owner likes it: a split century egg,
 * a pinch of preserved-mustard pickle, scallion, a few peanuts and a thread of sesame oil.
 */
function porridgeIcon(p: Px) {
  bowl(p, 24, 20, 22, 8, 17, { belly: 0.86, body: carpBowl(17) });
  motif(p, 8, 32, CARP, 24);
  motif(p, 27, 32, CARP.map((r) => [...r].reverse().join("")), 24);
  surface(p, 24.6, 21.3, 19.6, 6.2, ["cream3", "cream5", "white"]);
  // Grains: short soft streaks.
  p.over(() => {
    for (const [x, y] of [[10, 21], [15, 24], [21, 19], [29, 25], [33, 21], [13, 26], [24, 26], [37, 24], [18, 22], [27, 17], [35, 18], [9, 24]] as const)
      p.hline(x, y, 2, "cream4");
  });
  // Century egg cut in wedges and fanned: amber-black jelly, a green-grey yolk at each fat end.
  grid(p, 21, 15, [
    "....oo.........",
    "..ooaao..oo....",
    ".oabbBjoaaao...",
    "oabbBjjobbBao..",
    ".ooobjJoBbBjjo.",
    "....oooobBjjJo.",
    "........ooooo..",
  ], { o: "brown1", a: "wood4", b: "brown2", B: "brown3", j: "jade2", J: "steel3" });
  // Preserved mustard pickle: a small heap of crinkled shreds.
  grid(p, 33, 22, [
    "..gG..",
    ".gGog.",
    "goGGgo",
    ".oggo.",
  ], { g: "gold2", G: "oak3", o: "gold1" });
  // Peanuts.
  for (const [x, y] of [[11, 21], [15, 22], [13, 24]] as const) grid(p, x, y, [".ww.", "cWwc", ".cd."], { c: "wood4", w: "wood5", W: "wood6", d: "wood3" });
  // Scallion rings.
  for (const [x, y] of [[19, 24], [27, 24], [31, 19], [24, 23], [37, 20], [17, 19]] as const) grid(p, x, y, [".LL.", "lc.l", ".dd."], { l: "leaf4", L: "leaf5", d: "leaf2", c: "leaf3" });
  // A thread of sesame oil catching the light.
  for (const [x, y, c] of [[8, 25, "gold3"], [9, 26, "gold4"], [10, 26, "gold5"], [11, 27, "gold3"], [12, 27, "gold3"], [13, 27, "gold4"], [14, 26, "gold3"]] as const) p.px(x, y, c);
  selout(p, "blue2", "blue3");
}

// ── fried dough 油条 ─────────────────────────────────────────────────────────

/**
 * 油条. A pair of fried dough sticks straight from the wok, still twinned where they were pressed
 * together, blistered and crisp. One end torn off to show the airy inside. On greaseproof paper
 * already spotted with oil.
 */
function youtiaoIcon(p: Px) {
  // Paper: a square sheet set at an angle, one corner folded back.
  p.poly([[1, 28], [27, 10], [47, 26], [21, 45]], "cream5");
  p.over(() => {
    p.poly([[21, 45], [47, 26], [47, 27], [21, 46]], "cream3");
    p.line(4, 29, 23, 43, "cream4");
    // Oil spots soaked through: rounded translucent blots.
    for (const [x, y, rx, ry] of [[12, 34, 3, 1.6], [36, 30, 2.5, 1.3], [30, 37, 2, 1.1], [18, 22, 1.6, 1]] as const) {
      p.ellipse(x, y, rx, ry, "cream3");
      p.ellipse(x - 0.4, y - 0.3, rx - 0.8, ry - 0.5, "oak5");
    }
  });
  grid(p, 40, 22, ["..cc", ".cCc", "cCCc"], { c: "cream3", C: "cream4" });
  const strand = (q: Px, a: readonly [number, number], b: readonly [number, number], seed: number) => {
    const radius = (t: number) => 3.6 + 0.6 * Math.sin(t * 31 + seed) + 0.35 * Math.sin(t * 77 + seed * 3) - (t < 0.04 || t > 0.96 ? 1 : 0);
    tube(q, [a, b], radius, FRIED, [0.1, 0.34, 0.62, 0.88]);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
    q.over(() => {
      // Blisters: a lit crown with a dark pocket tucked under it.
      for (let d = 3 + (seed % 3); d < len - 3; d += 3.3 + hash(Math.round(d), seed, 2) * 1.6) {
        const off = 1.2 + hash(Math.round(d), seed, 5) * 1.4;
        const x = a[0] + ux * d + uy * off, y = a[1] + uy * d - ux * off;
        q.px(x - 0.5, y - 0.5, "gold5").px(x + 0.5, y - 0.5, "gold4").px(x - 0.5, y + 0.5, "gold4").px(x + 0.5, y + 0.8, "gold2");
      }
    });
  };
  const sticks = part(48, 48, (q) => {
    strand(q, [5, 36], [42, 16.5], 4);
    strand(q, [4, 29.5], [41, 10], 1);
    // The seam where they were pressed together.
    q.over(() => {
      for (let d = 2; d < 40; d++) {
        const x = 4.5 + d * 0.88, y = 32.8 - d * 0.47;
        q.px(x, y, d % 5 === 0 ? "gold1" : "orange1");
      }
    });
    // A torn end: airy crumb and a ragged lip.
    grid(q, 38, 6, [
      ".ooo.",
      "oGgGo",
      "ogWgo",
      "oGgGo",
      ".oo..",
    ], { o: "gold2", g: "gold4", G: "gold5", W: "cream4" });
    selout(q, "wood2", "gold1");
  });
  p.blit(sticks, 0, 0);
}

// ── dumplings 饺子 ───────────────────────────────────────────────────────────

/**
 * A boiled pork-and-chive crescent seen from above: crimped edge along the arc, a plump belly where
 * the green of the chives shows faintly through the skin, horns curling down. 16×9.
 */
const DUMPLING = [
  ".....cccccc.....",
  "...ccWpWpWpoo...",
  "..cWpW5WW555pPo.",
  ".cWp55WW5554pPo.",
  "cWp55555554444Po",
  "c4j5555544443j3o",
  "o3jj44444433jj2o",
  "o32oooooooooo22o",
  ".oo..........oo.",
];
const DUMPLING_KEY = { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2", p: "cream3", P: "cream2", j: "jade6" } as const;

function dumpling(bitten = false): Px {
  return part(16, 9, (q) => {
    grid(q, 0, 0, DUMPLING, DUMPLING_KEY);
    if (!bitten) return;
    // A bite from the right horn: the skin's cut edge, then pork and chive.
    q.each((x, y, c) => (c && inEllipse(16, 3.5, 4.5, 3.6, x, y) ? null : undefined));
    grid(q, 9, 1, [
      "...cc",
      "..cmM",
      ".cmgm",
      ".cMmg",
      "cmgmm",
      "cmmG.",
    ], { c: "cream4", m: "wood4", M: "oak3", g: "leaf3", G: "leaf2" });
    q.each((x, y, c) => (c === "wood3" && x > 12 && y < 6 ? null : undefined));
    selout(q, "wood3", "oak2");
  });
}

/**
 * 饺子. Six pork-and-chive dumplings on the banded plate, one already bitten, steam still rising;
 * a dish of black vinegar with a ring of chili oil floating on it.
 */
function dumplingIcon(p: Px) {
  // Vinegar dish behind, top right.
  plate(p, 38, 12, 8, 3.6, { rim: RIMS.plain, well: 0.72 });
  p.ellipse(38.3, 12.3, 5.4, 2.3, "brown1");
  p.over(() => {
    p.ellipse(39.5, 12.6, 2.6, 1.2, "red3");
    p.ellipse(39.5, 12.6, 1.5, 0.6, "brown1");
  });
  p.px(41, 12, "orange3").px(35, 11, "white").px(36, 11, "wood3");
  plate(p, 23, 32, 22, 10, { rim: RIMS.banded, well: 0.68 });
  // Three at the back, two in the middle, the bitten one in front.
  const spots = [[3, 20], [16, 19], [29, 20], [9, 26], [23, 26], [16, 32]] as const;
  spots.forEach(([x, y], i) => {
    p.over(() => p.ellipse(x + 8, y + 7.5, 7, 1.6, "blue5"));
    p.blit(dumpling(i === 5), x, y);
  });
  steam(p, [curl(14, 20, 9, 0.5, 0.5), curl(27, 19, 8, 2.2, 0.45)]);
}

export default defineSprites({
  "food/bun-icon": { w: 48, h: 48, draw: bunIcon },
  "food/bread-icon": { w: 48, h: 48, draw: breadIcon },
  "food/egg-icon": { w: 48, h: 48, draw: eggIcon },
  "food/milk-icon": { w: 48, h: 48, draw: milkIcon },
  "food/porridge-icon": { w: 48, h: 48, draw: porridgeIcon },
  "food/youtiao-icon": { w: 48, h: 48, draw: youtiaoIcon },
  "food/dumpling-icon": { w: 48, h: 48, draw: dumplingIcon },
});

void (null as unknown as Color);
