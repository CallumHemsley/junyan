/**
 * Private drawing helpers for the kitchen. Not a sprite set (the leading underscore keeps the
 * loader away). Candidates for the kit are marked "promote?".
 */
import { Px as PxClass, type Color, type Px } from "../../kit/index.ts";

/** A colour stop for column shading: every column whose u is below `until` takes `color`. */
export type Stop = readonly [until: number, color: Color];

/** Pick the stop for u in [-1, 1] (left edge to right edge of a round body). */
export function stopAt(u: number, stops: readonly Stop[]): Color {
  for (const [until, color] of stops) if (u < until) return color;
  return stops[stops.length - 1][1];
}

/**
 * Visit each column of a round body centred on `cx` (pixel-edge) with radius `rx`.
 * `u` runs -1..1 across it, `off` is how far the front arc of an ellipse of radius `ry` dips below
 * its centre line in that column. promote? Every round thing in three-quarter view needs this.
 */
export function eachColumn(cx: number, rx: number, ry: number, visit: (x: number, u: number, off: number) => void) {
  for (let x = Math.floor(cx - rx); x < Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx;
    if (Math.abs(u) > 1) continue;
    visit(x, u, Math.round(ry * Math.sqrt(Math.max(0, 1 - u * u)) - 0.15));
  }
}

/**
 * The front band of an upright cylinder: from the front arc of the ellipse at `top` down to the
 * front arc of the ellipse at `bottom`, each column shaded by `stops` (sun from the upper left).
 * promote?
 */
export function cylinderBand(p: Px, cx: number, rx: number, ry: number, top: number, bottom: number, stops: readonly Stop[]) {
  eachColumn(cx, rx, ry, (x, u, off) => p.vline(x, Math.floor(top) + off, Math.floor(bottom) - Math.floor(top), stopAt(u, stops)));
}

/** Polished steel: a hot highlight left of centre, a warm bounce near the right edge. */
export const STEEL: readonly Stop[] = [
  [-0.82, "steel4"], [-0.62, "steel5"], [-0.42, "steel6"], [-0.18, "steel5"], [0.3, "steel4"], [0.62, "steel3"], [0.8, "steel2"], [0.92, "cream2"], [2, "steel2"],
];
/** Brushed steel, duller: for vats and big bodies. */
export const STEEL_DULL: readonly Stop[] = [
  [-0.8, "steel4"], [-0.5, "steel5"], [-0.34, "steel6"], [-0.1, "steel5"], [0.35, "steel4"], [0.7, "steel3"], [0.9, "steel2"], [2, "stone3"],
];
/** Bent bamboo strip of a steamer tier. */
export const BAMBOO: readonly Stop[] = [
  [-0.82, "bamboo3"], [-0.25, "bamboo4"], [0.35, "bamboo3"], [0.78, "bamboo2"], [2, "bamboo1"],
];
/** Lighter bamboo, for rims and lashings catching the sun. */
export const BAMBOO_RIM: readonly Stop[] = [
  [-0.82, "bamboo4"], [-0.25, "bamboo5"], [0.35, "bamboo4"], [0.78, "bamboo3"], [2, "bamboo2"],
];

/** A blue-and-white rice bowl, 18×14: glazed inside, lit rim lip, a tapering outer wall with a
 * blue band and two little sprays, a foot ring. Row 5 is the front rim lip. */
const BOWL = [
  "....oooooooooo....",
  "..ooWWWWWWWWWWoo..",
  ".oWbbbbbbbbbbbbWo.",
  "oWbiiiiiiiiiiiibWo",
  "oWWiiiiiiiiiiiisWo",
  "oWWWWWWWWWWWWWWsso",
  "ocwwwwwwwwwwwwwsso",
  "ocbBbBbBbBbBbBbsso",
  ".ocwwwwwwwwwwwsso.",
  ".ocwwbbwwwwbbwsso.",
  "..ocwwwwwwwwwsso..",
  "...oocwwwwwwsoo...",
  ".....oBBBBBBo.....",
  ".....oooooooo.....",
];
const BOWL_INK = { o: "blue1", W: "white", w: "cream5", c: "cream4", s: "cream3", i: "cream4", b: "blue3", B: "blue2" } as const;

/**
 * A slightly crooked pile of `n` rice bowls, 18 wide plus the lean. Each bowl sits in the one below
 * and shows `step` rows of its outer wall above that bowl's rim (5 shows the blue band); only the
 * top bowl shows its glazed inside. `chip` (0 = top) has a chipped rim showing the pale biscuit.
 * Returns the pile's height. promote?
 */
export function bowlStack(p: Px, x: number, y: number, n: number, chip = -1, step = 5): number {
  const lean = [0, 1, -1, 1, 0];
  // Top bowl first; each bowl below is drawn over the lower half of the one above it, which sits
  // inside it, so only rim lip, outer wall and band of every bowl stay visible.
  for (let i = 0; i < n; i++) {
    const bx = x + 1 + lean[i % lean.length], by = y + i * step;
    if (i === 0) p.rows(bx, by, BOWL, BOWL_INK);
    else p.rows(bx, by + 5, BOWL.slice(5), BOWL_INK);
  }
  if (chip >= 0) {
    const cx = x + 1 + lean[chip % lean.length] + 11, cy = y + chip * step + 5;
    p.px(cx, cy, "cream2").px(cx + 1, cy, "cream3").px(cx + 1, cy + 1, "cream3").px(cx, cy - 1, chip === 0 ? "cream3" : "blue1");
  }
  return (n - 1) * step + 14;
}

/**
 * Light level 0..3 of a round body's column under the upper-left sun: the left flank turns a
 * little away, the left-of-centre is the peak, the right falls into shade.
 */
export function roundLevel(u: number): number {
  return u < -0.84 ? 2 : u < -0.22 ? 3 : u < 0.38 ? 2 : u < 0.8 ? 1 : 0;
}
/** Step `shift` along a ramp from a column's light level, clamped. */
export function toneOf(ramp: readonly Color[], u: number, shift = 0, base = 1): Color {
  return ramp[Math.max(0, Math.min(ramp.length - 1, roundLevel(u) + base + shift - 1))];
}

const BAMBOO_RAMP: readonly Color[] = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];

/** How used a piece of bamboo is: 0 new and pale, 1 seasoned, 2 dark with years of steam. */
export type Age = 0 | 1 | 2;
const bambooTone = (level: number, shift: number, age: Age): Color =>
  BAMBOO_RAMP[Math.max(0, Math.min(4, level + shift + (age === 0 ? 1 : age === 2 ? -1 : 0)))];

/**
 * One bamboo steamer tier, front band only, `h` rows (8 or more) from the ellipse line `yt`:
 * a proud lip, the doubled rim strip and its shadow, the bent-strip body with grain, a lower
 * strip and a dark seam where it sits into the tier below. Rattan binds the strip's overlap at u =
 * `lash`. Old tiers carry tide-marks of condensed steam. promote?
 */
export function steamerTier(p: Px, cx: number, rx: number, ry: number, yt: number, h: number, age: Age, lash: number, seed = 0) {
  eachColumn(cx, rx, ry, (x, u, off) => {
    const lv = roundLevel(u), top = yt + off;
    p.px(x, top, bambooTone(lv, 1, age));
    p.px(x, top + 1, bambooTone(lv, lv === 3 ? 0 : 1, age));
    p.px(x, top + 2, bambooTone(lv, -1, age));
    for (let j = 3; j < h - 1; j++) p.px(x, top + j, bambooTone(lv, 0, age));
    // A dark gap where the tier sits into the one below.
    p.px(x, top + h - 1, lv === 3 ? "bamboo2" : "bamboo1");
    // Grain of the bent strip: short streaks a step darker, staggered.
    const k = Math.floor((x - cx + rx + seed * 3) / 4);
    if (Math.abs(u) < 0.85 && (k * 7 + seed) % 5 < 2) p.px(x, top + 4 + ((k + seed) % 3), bambooTone(lv, -1, age));
    if (age === 2 && Math.abs(u) < 0.8 && (k * 3 + seed) % 7 === 0) p.px(x, top + 3, bambooTone(lv, -2, age)).px(x, top + 4, bambooTone(lv, -1, age));
  });
  // The lip stands a pixel proud at each side.
  p.px(Math.floor(cx - rx) - 1, yt, bambooTone(2, 1, age)).px(Math.floor(cx - rx) - 1, yt + 1, bambooTone(2, 0, age));
  p.px(Math.ceil(cx + rx), yt, bambooTone(0, 1, age)).px(Math.ceil(cx + rx), yt + 1, bambooTone(0, 0, age)).px(Math.ceil(cx + rx), yt + 2, bambooTone(0, -1, age));
  // Rattan binding over the strip's overlap: wraps alternating dark and lit, a pixel wider than the strip.
  const lx = Math.floor(cx + lash * rx), lu = (lx + 0.5 - cx) / rx;
  const loff = Math.round(ry * Math.sqrt(Math.max(0, 1 - lu * lu)) - 0.15);
  for (let j = 0; j < h - 1; j++) {
    p.px(lx, yt + loff + j, j % 2 ? "bamboo1" : "wood4");
    p.px(lx + 1, yt + loff + j, j % 2 ? "bamboo2" : "wood5");
  }
}

/**
 * Domed bamboo lid: a basket-woven field inside a lit hoop, a two-row side band under the rim
 * ellipse at `y`, the dome rising `dome` rows. `knot` re-ties the knob with string. promote?
 */
export function steamerLid(p: Px, cx: number, rx: number, ry: number, y: number, dome: number, age: Age, knot = false) {
  const m = (a: number, b: number) => ((a % b) + b) % b;
  const inside = (x: number, yy: number, ex: number, ey: number, cy: number) => {
    const u = (x + 0.5 - cx) / ex, v = (yy + 0.5 - cy) / ey;
    return u * u + v * v <= 1;
  };
  const fy = y - dome * 0.6;
  for (let yy = Math.floor(y - ry - dome); yy < y + ry; yy++) for (let x = Math.floor(cx - rx); x < cx + rx; x++) {
    if (!inside(x, yy, rx, ry, y) && !inside(x, yy, rx - 1, ry, y - dome)) continue;
    const u = (x + 0.5 - cx) / rx, v = (yy + 0.5 - fy) / ry;
    const light = -0.7 * u - 0.5 * v;
    const lv = light > 0.4 ? 3 : light > -0.15 ? 2 : light > -0.6 ? 1 : 0;
    if (!inside(x, yy, rx - 2.5, ry - 1.6, fy)) {
      // The bamboo hoop round the top, a step brighter than the weave.
      p.px(x, yy, bambooTone(Math.min(3, lv + 1), 1, age));
      continue;
    }
    // Weave, only suggested: the field's own tone, with a sparse stagger of strands one step down.
    const strand = m(yy, 2) === 0 ? m(x + (yy >> 1) * 2, 4) === 0 : false;
    p.px(x, yy, bambooTone(lv, strand ? -1 : 0, age));
  }
  // Hairline of shade where the far hoop rises over the weave.
  for (let x = Math.floor(cx - rx); x < cx + rx; x++) for (let yy = Math.floor(y - ry - dome); yy < fy; yy++)
    if (inside(x, yy, rx - 2.5, ry - 1.6, fy) && !inside(x, yy - 1, rx - 2.5, ry - 1.6, fy)) p.px(x, yy, bambooTone(1, -1, age));
  eachColumn(cx, rx, ry, (x, u, off) => {
    p.px(x, Math.floor(y) + off, bambooTone(roundLevel(u), 0, age));
    p.px(x, Math.floor(y) + off + 1, bambooTone(roundLevel(u), -1, age));
    p.px(x, Math.floor(y) + off + 2, bambooTone(roundLevel(u), -2, age));
  });
  if (knot) {
    // The knob: a bent bamboo bridge; one foot snapped and was re-tied with kitchen string.
    const kx = Math.round(cx) - 6, ky = Math.round(fy) - 6;
    p.rows(kx, ky, [
      "...oooooo...",
      "..oLLlllbo..",
      ".oLoooooobo.",
      ".oLo....obo.",
      "oSSo....oSSo",
      "oSsso..osSso",
      ".oso....os.s",
      "..o......s.s",
      "..........s.",
    ], { o: "bamboo1", L: "bamboo5", l: "bamboo4", b: "bamboo3", S: "cream5", s: "cream3" });
  }
}

/** Draw into a fresh canvas the size of `p`, for parts that need their own outline. promote? */
export function layer(p: Px, draw: (q: Px) => void): Px {
  const q = new PxClass(p.w, p.h);
  draw(q);
  return q;
}
