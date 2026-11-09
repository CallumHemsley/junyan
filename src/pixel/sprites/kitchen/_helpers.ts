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

/** A tiny blue-and-white rice bowl seen from the front, 7×4, drawn at (x, y). promote? */
export function bowlFront(p: Px, x: number, y: number) {
  p.rows(x, y, [
    "ownnwwo",
    "owbwbso",
    ".obbbo.",
    "..ooo..",
  ], { o: "blue1", w: "white", n: "cream4", b: "blue3", s: "cream3" });
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

/**
 * One bamboo steamer tier, front band only, `h` rows from the ellipse line `yt`: a lit lip one pixel
 * proud of the body, the bent-strip body, a dark seam where it sits into the tier below. The strip's
 * overlap is bound with rattan at `lash` (u, -1..1). promote?
 */
export function steamerTier(p: Px, cx: number, rx: number, ry: number, yt: number, h: number, lash: number) {
  const LIP = ["bamboo3", "bamboo4", "bamboo4", "bamboo5"] as const;
  const BODY = ["bamboo2", "bamboo2", "bamboo3", "bamboo4"] as const;
  const SEAM = ["bamboo1", "bamboo1", "bamboo1", "bamboo2"] as const;
  eachColumn(cx, rx, ry, (x, u, off) => {
    p.px(x, yt + off, LIP[roundLevel(u)]);
    for (let j = 1; j < h - 1; j++) p.px(x, yt + off + j, BODY[roundLevel(u)]);
    p.px(x, yt + off + h - 1, SEAM[roundLevel(u)]);
    // The lip throws a hairline of shade on the strip just under it, on the sunny half only.
    if (roundLevel(u) === 3 && h > 4) p.px(x, yt + off + 1, "bamboo3");
  });
  // The lip stands one pixel proud at each side.
  p.px(Math.floor(cx - rx) - 1, yt, LIP[2]).px(Math.ceil(cx + rx), yt, LIP[0]);
  // The overlap of the bent strip, bound with rattan: dark wraps with a lit edge.
  const lx = Math.floor(cx + lash * rx);
  const lu = (lx + 0.5 - cx) / rx;
  const loff = Math.round(ry * Math.sqrt(Math.max(0, 1 - lu * lu)) - 0.15);
  for (let j = 1; j < h - 1; j++) p.px(lx, yt + loff + j, j % 2 ? "bamboo1" : "bamboo2");
  p.px(lx + 1, yt + loff + 1, LIP[roundLevel(lu)]);
  if (h > 4) p.px(lx + 1, yt + loff + 3, LIP[roundLevel(lu)]);
}

/**
 * Domed woven bamboo lid: a two-row side band under the rim ellipse at `y` (radius rx, ry) and a
 * dome rising `dome` rows above the rim, woven, lit from the upper left. promote?
 */
export function steamerLid(p: Px, cx: number, rx: number, ry: number, y: number, dome: number) {
  const LIP = ["bamboo3", "bamboo4", "bamboo4", "bamboo5"] as const;
  const BODY = ["bamboo2", "bamboo2", "bamboo3", "bamboo4"] as const;
  const m = (a: number, b: number) => ((a % b) + b) % b;
  const inside = (x: number, yy: number, ex: number, ey: number, cy = y) => {
    const u = (x + 0.5 - cx) / ex, v = (yy + 0.5 - cy) / ey;
    return u * u + v * v <= 1;
  };
  for (let yy = Math.floor(y - ry - dome); yy < y + ry; yy++) for (let x = Math.floor(cx - rx); x < cx + rx; x++) {
    const onTop = inside(x, yy, rx, ry) || inside(x, yy, rx - 1, ry, y - dome);
    if (!onTop) continue;
    const u = (x + 0.5 - cx) / rx, v = (yy + 0.5 - y) / ry;
    const light = -0.7 * u - 0.45 * v;
    const field = inside(x, yy, rx - 2, ry - 1.2, y - dome / 2);
    if (!field) {
      // The bamboo hoop round the top, lit on its far-left and near-left arcs.
      p.px(x, yy, light > 0.35 ? "bamboo5" : light > -0.3 ? "bamboo4" : "bamboo3");
      continue;
    }
    // Woven field: staggered over-under dashes, one step darker where a strand dips under.
    const tone = light > 0.3 ? 3 : light > -0.25 ? 2 : 1;
    const under = m(yy, 2) === 0 ? m(x, 4) === 0 : m(x, 4) === 2;
    p.px(x, yy, BAMBOO_RAMP[tone - (under ? 1 : 0)]);
  }
  // The hoop's inner edge, a hairline of shade on the far (north) side where it rises over the weave.
  for (let x = Math.floor(cx - rx); x < cx + rx; x++) for (let yy = Math.floor(y - ry - dome); yy < y; yy++)
    if (inside(x, yy, rx - 2, ry - 1.2, y - dome / 2) && !inside(x, yy - 1, rx - 2, ry - 1.2, y - dome / 2)) p.px(x, yy, "bamboo2");
  // Side band of the lid under the hoop.
  eachColumn(cx, rx, ry, (x, u, off) => {
    p.px(x, Math.floor(y) + off, BODY[roundLevel(u)]);
    p.px(x, Math.floor(y) + off + 1, "bamboo1");
  });
  void LIP;
}

/** Draw into a fresh canvas the size of `p`, for parts that need their own outline. promote? */
export function layer(p: Px, draw: (q: Px) => void): Px {
  const q = new PxClass(p.w, p.h);
  draw(q);
  return q;
}
