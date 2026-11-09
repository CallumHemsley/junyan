/**
 * Hero food icons, 32×32, for the interface: the kitchen pass, the tray and the order.
 * Slight three-quarter view from above, lit from the upper left. Ids `food/<id>-icon`.
 */
import { defineSprites, Px, type Color } from "../../kit/index.ts";
import { dome, grid, inEllipse, light, part, relief, selout, tone, tube, type Ramp } from "./_helpers.ts";


/** A pleated steamed bun, 16×14: a swirl of pleats gathered to a knot, lit from the upper left. */
const BUN = [
  "......cccc......",
  "....ccWW54oo....",
  "..cc5gWW5G54oo..",
  ".c5ggWgWG5GG44o.",
  "c5gWWgW55G54G43o",
  "cWW5WgW55G444G3o",
  "c5W55g5554G4433o",
  "o5W5g55544G4433o",
  "o555g55444G4332o",
  "o455544444G3332o",
  "o44444444333322o",
  ".o344444333322o.",
  "..oo33333222oo..",
  "....oooooooo....",
];
const BUN_LEGEND = { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2", g: "cream3", G: "cream2" } as const;
function pleatedBun(): Px {
  return part(16, 14, (q) => grid(q, 0, 0, BUN, BUN_LEGEND));
}

const BAMBOO: Ramp = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];

/**
 * A round bamboo steamer seen from above and in front, centred on (cx, cy) with rim radii rx × ry
 * and a band `depth` tall. `part` picks the back (band, rim, dark well) or the front rim, which is
 * drawn again after whatever sits inside.
 */
function steamer(q: Px, cx: number, cy: number, rx: number, ry: number, depth: number, which: "back" | "front") {
  const inRim = (x: number, y: number) => inEllipse(cx, cy, rx, ry, x, y);
  const inWell = (x: number, y: number) => inEllipse(cx, cy + 0.5, rx - 1.6, ry - 1.3, x, y);
  if (which === "back") {
    // Band: a bent bamboo strip shaded as a cylinder, darker to the right and under the rim's lip.
    for (let y = Math.floor(cy); y <= Math.ceil(cy + ry + depth); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (!inEllipse(cx, cy + depth, rx, ry, x, y) && !(y >= cy && y < cy + depth && x >= cx - rx && x < cx + rx)) continue;
        const u = (x + 0.5 - cx) / rx;
        q.px(x, y, tone(BAMBOO, light(u, 0.15, Math.sqrt(Math.max(0, 1 - u * u))), [0.12, 0.32, 0.62, 0.95]));
      }
    // Shadow under the rim's lip, and the lit bottom bead of the band.
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      let lip = -1, foot = -1;
      for (let y = 0; y < q.h; y++) if (inRim(x, y)) lip = y;
      for (let y = 0; y < q.h; y++) if (inEllipse(cx, cy + depth, rx, ry, x, y)) foot = y;
      if (lip >= 0) q.over(() => q.px(x, lip + 1, "bamboo2"));
      if (foot >= 0) q.over(() => q.px(x, foot - 1, x < cx + rx * 0.4 ? "bamboo4" : "bamboo3"));
    }
  }
  // Rim ring: lit along the back-left, shaded at the front-right.
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inRim(x, y) || inWell(x, y)) continue;
      if (which === "front" && y + 0.5 < cy) continue;
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
      q.px(x, y, v < 0 ? (u < 0.3 ? "bamboo5" : "bamboo4") : u < -0.2 ? "bamboo4" : u < 0.55 ? "bamboo4" : "bamboo3");
    }
  if (which === "back") for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (inWell(x, y)) q.px(x, y, inEllipse(cx + 1, cy + 1.2, rx - 2.5, ry - 2.2, x, y) ? "bamboo2" : "bamboo1");
}

/** Rattan lashing over the band at column x, top at y: two strands, the left one catching light. */
function lashing(q: Px, x: number, y: number, h: number) {
  for (let j = 0; j < h; j++) q.px(x, y + j, j % 3 === 2 ? "bamboo2" : "bamboo4").px(x + 1, y + j, j % 3 === 2 ? "bamboo1" : "bamboo2");
}

function bunIcon(p: Px) {
  const basket = part(32, 32, (q) => {
    steamer(q, 16, 18, 15, 6, 6, "back");
    lashing(q, 6, 22, 6);
    lashing(q, 24, 22, 6);
  });
  p.blit(selout(basket, "bamboo1", "bamboo2"), 0, 0);
  p.blit(pleatedBun(), 1, 4);
  p.blit(pleatedBun(), 15, 4);
  p.blit(pleatedBun(), 8, 9);
  steamer(p, 16, 18, 15, 6, 6, "front");
  // Warmth rising from between the buns.
  p.faded(0.55, () => p.rows(12, 0, ["..w.", ".w..", ".w..", "..w."], { w: "white" }));
  p.faded(0.35, () => p.rows(18, 1, [".w", "w.", "w."], { w: "white" }));
}

// ── porcelain ───────────────────────────────────────────────────────────────

/** Paint the ring between two ellipses. */
function ring(q: Px, cx: number, cy: number, rx: number, ry: number, inset: number, c: Color, keep?: (x: number, y: number) => boolean) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (inEllipse(cx, cy, rx, ry, x, y) && !inEllipse(cx, cy, rx - inset, ry - inset * (ry / rx) - 0.2, x, y) && (!keep || keep(x, y))) q.px(x, y, c);
}

/** A flat white plate with a blue line inside the rim, seen from above and in front. */
function plate(q: Px, cx: number, cy: number, rx: number, ry: number) {
  // Thickness of the near edge, shaded to the right.
  for (let y = Math.floor(cy); y <= Math.ceil(cy + ry + 1.5); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (inEllipse(cx, cy + 1.5, rx, ry, x, y)) q.px(x, y, x + 0.5 < cx + rx * 0.35 ? "blue5" : "steel4");
  q.ellipse(cx, cy, rx, ry, "white");
  // The rim's lit far edge and shaded near edge.
  ring(q, cx, cy, rx, ry, 1, "blue6", (x, y) => y + 0.5 > cy && x + 0.5 > cx - rx * 0.3);
  // Recessed well: its far-left slope turns from the sun.
  q.ellipse(cx, cy + 0.3, rx * 0.72, ry * 0.7, "blue6");
  q.ellipse(cx + 0.6, cy + 0.6, rx * 0.7, ry * 0.66, "white");
  ring(q, cx, cy, rx - 1.6, ry - 1, 1, "blue4", (x, y) => !(y + 0.5 < cy && x + 0.5 < cx - rx * 0.4));
}

/** Bowl geometry: the half-width of the body at depth fraction t, as a sphere section. */
const bowlWidth = (rx: number, t: number) => rx * Math.sqrt(1 - (0.78 * t) ** 2);

/**
 * A round porcelain bowl: rim radii rx × ry at (cx, cy), body `depth` tall narrowing to a foot.
 * `decorate(x, y, u, t, lit)` may return a colour for a body pixel (u across −1..1, t down 0..1).
 * The mouth is left showing the shaded far inner wall; the caller fills the contents.
 */
function bowl(q: Px, cx: number, cy: number, rx: number, ry: number, depth: number, decorate?: (x: number, y: number, u: number, t: number, lit: boolean) => Color | undefined) {
  const steps = depth * 3;
  const BODY: Ramp = ["blue4", "blue5", "blue6", "white"];
  for (let y = Math.floor(cy); y <= Math.ceil(cy + depth + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      let hit = -1, u = 0;
      for (let k = steps; k >= 0; k--) {
        const t = k / steps, w = bowlWidth(rx, t), yc = cy + t * depth;
        if (y + 0.5 >= yc && inEllipse(cx, yc, w, ry * (w / rx), x, y)) { hit = t; u = (x + 0.5 - cx) / w; break; }
      }
      if (hit < 0) continue;
      // Shade by plane: lit at the left, cooler round the right, one step darker where it curves under.
      let i = u < -0.42 ? 3 : u < 0.2 ? 2 : u < 0.68 ? 1 : 0;
      if (hit > 0.72) i = Math.max(0, i - 1);
      q.px(x, y, decorate?.(x, y, u, hit, i >= 2) ?? BODY[i]);
    }
  // Foot ring: a short band under the body.
  const fw = bowlWidth(rx, 1) * 0.7, fy = Math.round(cy + depth + ry * (bowlWidth(rx, 1) / rx) - 0.5);
  for (let x = Math.floor(cx - fw); x < Math.ceil(cx + fw); x++)
    q.px(x, fy + 1, x + 0.5 < cx - fw * 0.2 ? "blue6" : x + 0.5 < cx + fw * 0.5 ? "blue5" : "blue4");
  // Rim lip, then the far inner wall: it faces away from the sun, darkest on the left.
  q.ellipse(cx, cy, rx, ry, "white");
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (inEllipse(cx, cy + 0.35, rx - 1, ry - 0.75, x, y)) {
        const u = (x + 0.5 - cx) / rx;
        q.px(x, y, u < -0.25 ? "blue5" : u < 0.45 ? "blue6" : "white");
      }
}

/**
 * A liquid or soft surface in a bowl: the rim's shadow along its far-left edge, a sheen just inside it
 * and a glint. Ramp is [shade, base, sheen, glint].
 */
function surface(q: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp) {
  const [shade, base, sheen, glint] = ramp;
  q.ellipse(cx, cy, rx, ry, base);
  q.over(() => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (!inEllipse(cx, cy, rx, ry, x, y)) continue;
        if (!inEllipse(cx + 1.4, cy + 0.9, rx, ry, x, y)) q.px(x, y, shade);
        else if (!inEllipse(cx + 2.6, cy + 1.5, rx, ry, x, y) && x + 0.5 < cx + rx * 0.2) q.px(x, y, sheen);
      }
  });
  void glint;
}

/** Blue-and-white decoration helpers for bowl bodies. */
const bandAt = (t: number, t0: number, t1: number) => t >= t0 && t < t1;

// ── bread 馒头 ───────────────────────────────────────────────────────────────

/** A plain steamed bread: a smooth satin dome with a flat foot, no pleats. 16×13. */
const MANTOU = [
  ".....cccccc.....",
  "...cc5WWW55oo...",
  "..c5WWWWW5554o..",
  ".c5WWWWWW55544o.",
  ".c5WWWWW555544o.",
  "c5WWWW555555443o",
  "c55WW5555554443o",
  "o45555555444433o",
  "o44555554444333o",
  "o44444444443332o",
  "o34444444333322o",
  ".o333333332222o.",
  "..oooooooooooo..",
];

function mantou(): Px {
  return part(16, 13, (q) => {
    grid(q, 0, 0, MANTOU, { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2" });
  });
}

function breadIcon(p: Px) {
  plate(p, 16, 22, 15, 7);
  p.ellipse(10.5, 21.5, 7.5, 2.5, "blue5");
  p.ellipse(21.5, 25.5, 8, 2.5, "blue5");
  p.blit(mantou(), 2, 9);
  p.blit(mantou(), 13, 13);
  selout(p, "blue2", "blue3");
}

// ── egg 鸡蛋 ─────────────────────────────────────────────────────────────────

/** A peeled tea egg standing up: tan white marbled by a web of soy-dark cracks. 11×14. */
const TEA_EGG = [
  "....cccc...",
  "..cc5hh5oo.",
  ".c5hWhv54o.",
  ".c5hh5v54o.",
  "c5hh5v5v44o",
  "c5h55v54v3o",
  "c5vv5v44v3o",
  "o454v444V3o",
  "o444v44V33o",
  "o4vv443V32o",
  "o344VVV332o",
  "o33V333222o",
  ".o3322222o.",
  "..ooooooo..",
];

/** The other half, cut face up: brown edge, white ring, a soft yolk. 14×10. */
const HALF_EGG = [
  "....ccccc....",
  "..ccbbbbboo..",
  ".cbWWwwwwwbo.",
  "cbWwwzyyywwbo",
  "cbwwzyyyYwwbo",
  "obwwwYYYwwwbo",
  ".obtwwwwwtbo.",
  "..oeeeeeeeo..",
  "...ooooooo...",
];

function eggIcon(p: Px) {
  plate(p, 16, 21, 14, 7);
  p.ellipse(10.5, 20.5, 5.5, 1.8, "blue5");
  p.ellipse(22.5, 25, 6.5, 1.8, "blue5");
  grid(p, 5, 7, TEA_EGG, { c: "wood3", o: "brown1", W: "white", h: "cream5", "5": "cream4", "4": "oak5", "3": "oak4", "2": "oak3", v: "wood4", V: "wood3" });
  grid(p, 16, 17, HALF_EGG, { c: "oak2", o: "wood3", b: "oak3", t: "cream4", W: "white", w: "cream5", y: "gold4", Y: "gold3", z: "gold5", e: "oak4" });
}

// ── soy milk 豆浆 ────────────────────────────────────────────────────────────

const SOY: Ramp = ["cream3", "cream4", "cream5", "white"];

/** A Chinese porcelain spoon, bowl to the lower left, handle rising to the upper right. 13×10. */
const SPOON = [
  "..........oo.",
  ".........owWo",
  "........owWbo",
  ".......owWbo.",
  "......owwbo..",
  "..oooowwbo...",
  ".owWWwwwo....",
  "owWwwwbbo....",
  ".owwbbbo.....",
  "..oooo.......",
];

function milkIcon(p: Px) {
  bowl(p, 16, 11, 14, 5, 13, (x, _y, u, t, lit) => {
    const ink: Color = lit ? "blue3" : "blue2";
    if (bandAt(t, 0.05, 0.13) || bandAt(t, 0.88, 1.01)) return ink;
    // Three sprigs round the belly: a bloom of four petals and a leaf.
    for (const c of [-0.62, 0, 0.62]) {
      const dx = u - c, k = Math.round(dx * 9);
      if (bandAt(t, 0.36, 0.44) && Math.abs(k) <= 1 && k !== 0) return ink;
      if (bandAt(t, 0.44, 0.56) && (k === 0 || Math.abs(k) === 2)) return ink;
      if (bandAt(t, 0.56, 0.64) && Math.abs(k) <= 1 && k !== 0) return ink;
    }
    void x;
    return undefined;
  });
  surface(p, 16.8, 12.2, 11, 3.2, ["cream3", "cream4", "cream5", "white"]);
  p.hline(9, 11, 3, "white").px(8, 12, "cream5");
  grid(p, 18, 3, SPOON, { o: "blue2", w: "white", W: "white", b: "blue6" });
  selout(p, "blue2", "blue3");
}

// ── porridge 粥 ──────────────────────────────────────────────────────────────

const CONGEE: Ramp = ["cream3", "cream4", "cream5", "white"];

function porridgeIcon(p: Px) {
  bowl(p, 16, 13, 15, 6, 10, (_x, _y, _u, t, lit) => (bandAt(t, 0.07, 0.16) ? (lit ? "blue3" : "blue2") : undefined));
  surface(p, 16.8, 14.4, 12.2, 4.2, ["cream3", "cream5", "white", "white"]);
  // Rice grains: short soft streaks, not noise.
  p.over(() => {
    for (const [x, y] of [[9, 14], [14, 16], [20, 14], [24, 16], [12, 18], [18, 18], [22, 18], [16, 13]] as const) p.hline(x, y, 2, "cream4");
  });
  // Century egg wedges: amber-black jelly round a dark green-grey yolk.
  grid(p, 16, 12, [
    ".oooo...",
    "obbBo...",
    "obgjbo..",
    ".obbbo..",
    "..ooo...",
  ], { o: "brown1", b: "brown2", B: "brown3", g: "jade1", j: "jade2" });
  // Peanuts.
  for (const [x, y] of [[8, 15], [11, 17]] as const) grid(p, x, y, ["cw.", "ccd"], { c: "wood5", w: "wood6", d: "wood4" });
  // Scallion rings.
  for (const [x, y] of [[13, 14], [21, 16], [25, 14], [15, 19], [19, 13]] as const) grid(p, x, y, ["lL", "dl"], { l: "leaf4", L: "leaf5", d: "leaf2" });
  // Pickle shreds.
  grid(p, 22, 17, ["gG.", ".gg"], { g: "gold2", G: "gold3" });
  selout(p, "blue2", "blue3");
}

// ── youtiao 油条 ─────────────────────────────────────────────────────────────

const FRIED: Ramp = ["orange1", "gold2", "gold3", "gold4", "gold5"];

function youtiaoIcon(p: Px) {
  // Greaseproof paper set at an angle, with a soaked grease bloom where the sticks lay.
  p.poly([[1, 19], [20, 9], [31, 18], [12, 29]], "cream5");
  p.over(() => {
    p.poly([[12, 29], [31, 18], [31, 19], [12, 30]], "cream3");
    p.ellipse(22, 22, 4, 2, "cream4");
  });
  const strand = (q: Px, a: readonly [number, number], b: readonly [number, number], seed: number) => {
    const radius = (t: number) => 2.9 + 0.5 * Math.sin(t * 29 + seed) + 0.3 * Math.sin(t * 71 + seed * 3) - (t < 0.05 || t > 0.95 ? 0.8 : 0);
    tube(q, [a, b], radius, FRIED, [0.1, 0.36, 0.64, 0.9]);
    // Blisters: a lit crown with a dark pocket under it, every few pixels along the top of the strand.
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
    q.over(() => {
      for (let d = 3 + seed % 2; d < len - 3; d += 3.4) {
        const x = a[0] + ux * d + uy * 1.4, y = a[1] + uy * d - ux * 1.4;
        q.px(x - 0.5, y - 0.5, "gold5").px(x + 0.5, y - 0.5, "gold4").px(x, y + 0.7, "gold2");
      }
    });
  };
  const sticks = part(32, 32, (q) => {
    strand(q, [5, 24.5], [28.5, 15.5], 4);
    strand(q, [4.5, 19.5], [28, 10.5], 1);
    selout(q, "wood2", "gold1");
  });
  p.blit(sticks, 0, 0);
}

// ── dumplings 饺子 ───────────────────────────────────────────────────────────

/** A boiled crescent dumpling from above: pleated arc behind, plump belly, horns curling down. 12×7. */
const DUMPLING = [
  "...cccc...",
  ".ccWp5poo.",
  "c5pW555pPo",
  "c4p55554Po",
  "c34555443o",
  "o2oooooo2o",
  ".o......o.",
];

function dumpling(): Px {
  return part(10, 7, (q) => grid(q, 0, 0, DUMPLING, { c: "oak2", o: "wood3", W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2", p: "cream3", P: "cream2" }));
}

function dumplingIcon(p: Px) {
  // A dish of black vinegar behind, one bright glint.
  plate(p, 26.5, 9, 4.5, 2.2);
  p.ellipse(26.7, 9.2, 2.8, 1.2, "wood1");
  p.px(25, 8, "white").px(26, 8, "wood2");
  plate(p, 15.5, 21, 14.5, 7);
  // Piled three, two, one.
  for (const [x, y] of [[1, 13], [11, 13], [21, 13], [2, 19], [12, 19], [22, 19]] as const) {
    p.ellipse(x + 5, y + 5.5, 4.5, 1.5, "blue5");
    p.blit(dumpling(), x, y);
  }
  selout(p, "blue2", "blue3");
}

export default defineSprites({
  "food/bun-icon": { w: 32, h: 32, draw: bunIcon },
  "food/bread-icon": { w: 32, h: 32, draw: breadIcon },
  "food/egg-icon": { w: 32, h: 32, draw: eggIcon },
  "food/milk-icon": { w: 32, h: 32, draw: milkIcon },
  "food/porridge-icon": { w: 32, h: 32, draw: porridgeIcon },
  "food/youtiao-icon": { w: 32, h: 32, draw: youtiaoIcon },
  "food/dumpling-icon": { w: 32, h: 32, draw: dumplingIcon },
});
