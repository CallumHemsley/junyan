/**
 * Private drawing helpers for the street domain (ticket 0166): parameterised draw functions for
 * each street-furniture kind, so one function serves every instance on the town map and the
 * sprite files only choose a design and add the story detail. Not a sprite set (leading `_`).
 *
 * Conventions: light from the upper left, so a cylinder is brightest one pixel in from its left
 * edge and darkest on its right; a ramp is listed dark to light and index 0 is the outline tone.
 */
import { Px as PxCtor, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { autoOutline } from "../decor/_helpers.ts";

export { autoOutline };
export type Ramp = readonly Color[];

/** Painted cast iron, dark to light. */
export const PAINT = {
  green: ["jade1", "jade2", "jade3", "jade4", "jade5"],
  black: ["ink", "steel1", "steel2", "steel3", "steel4"],
  grey: ["stone1", "stone2", "stone3", "stone4", "stone5"],
  blue: ["blue1", "blue2", "blue3", "blue4", "blue5"],
} as const satisfies Record<string, Ramp>;

export const STEEL: Ramp = ["steel1", "steel2", "steel3", "steel4", "steel5", "steel6"];
export const STONE: Ramp = ["stone1", "stone2", "stone3", "stone4", "stone5"];
export const CONCRETE: Ramp = ["stone1", "stone2", "stone3", "stone4", "stone5"];
export const BAMBOO: Ramp = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];
export const OAK: Ramp = ["wood1", "oak1", "oak2", "oak3", "oak4", "oak5"];
export const TEAK: Ramp = ["wood1", "wood2", "wood3", "wood4", "wood5", "wood6"];
export const WEATHERED: Ramp = ["stone1", "stone2", "cream1", "cream2", "stone4", "stone5"];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** A ramp step, clamped to the ramp. */
export const tone = (r: Ramp, i: number): Color => r[clamp(Math.round(i), 0, r.length - 1)];

/**
 * Tones across a cylinder `w` pixels wide lit from the left: a bright band a third of the way in,
 * falling to the second-darkest step on the right. Index 0 (the outline) is never used in the body.
 */
export function across(w: number, r: Ramp, lift = 0): Color[] {
  const top = r.length - 1;
  return Array.from({ length: w }, (_, i) => {
    if (w === 1) return tone(r, top - 1 + lift);
    const t = (i + 0.5) / w;
    const b = 1 - Math.abs(t - 0.28) * 1.45;
    return tone(r, clamp(Math.round(1 + b * (top - 1) + lift), 1, top));
  });
}

/** A vertical cylinder (post, pole, pipe end-on), shaded across. */
export function column(p: Px, x: number, y: number, w: number, h: number, r: Ramp, lift = 0): Px {
  across(w, r, lift).forEach((c, i) => p.vline(x + i, y, h, c));
  return p;
}

/** A horizontal cylinder lying east–west (a pipe, a rail, a tyre seen side-on), shaded down. */
export function rod(p: Px, x: number, y: number, w: number, h: number, r: Ramp, lift = 0): Px {
  across(h, r, lift).forEach((c, j) => p.hline(x, y + j, w, c));
  return p;
}

/** `rows()` with a tone legend. */
export function art(p: Px, x: number, y: number, rows: readonly string[], legend: Legend): Px {
  return p.rows(x, y, rows, legend);
}

/** Stable per-instance numbers from an id string. */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return (h >>> 0) % 100000;
}

/** A thick line: `t` pixels, extra rows going down. Used for bicycle tubes and cables. */
export function tube(p: Px, x0: number, y0: number, x1: number, y1: number, top: Color, under?: Color): Px {
  p.line(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), top);
  if (under) p.line(Math.round(x0), Math.round(y0) + 1, Math.round(x1), Math.round(y1) + 1, under);
  return p;
}

/** A sagging cable from a to b, dropping `sag` px at the middle. */
export function cable(p: Px, a: readonly [number, number], b: readonly [number, number], sag: number, c: Color): Px {
  const n = Math.max(2, Math.ceil(Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1])));
  let last: [number, number] | undefined;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = Math.round(a[0] + (b[0] - a[0]) * t), y = Math.round(a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t));
    if (last) p.line(last[0], last[1], x, y, c);
    last = [x, y];
  }
  return p;
}

/* ───────────────────────────── lamp posts ───────────────────────────── */

export type LampStyle = "lantern" | "globe";
export type LampOptions = { style: LampStyle; paint: Ramp; w: number; h: number; scrolls?: boolean };

/**
 * A French Concession cast-iron lamp post, centred in a canvas `w` px wide (about 22): a two-step
 * plinth, a fluted bell-shaped base with a moulded ring, a tapered shaft with a collar, the
 * lamplighter's crossbar (ladder rest) with ball ends and, if `scrolls`, curled brackets under it,
 * an acanthus collar, and a head: `lantern`, a four-pane glass box widening upward under a pointed
 * cap with corner crockets and a finial, or `globe`, an opal globe held in a four-strap cage. The
 * glass is drawn unlit; the scene adds the glow. Returns the key rows for story detail.
 */
export function lampPost(p: Px, o: LampOptions) {
  const { paint: r, h } = o;
  const cx = Math.floor(o.w / 2);
  const B = h - 1;
  const t = (i: number) => tone(r, i);
  const band = (y: number, half: number, lift = 0) => across(half * 2 + 1, r, lift).forEach((c, i) => p.px(cx - half + i, y, c));
  const legend = { 1: t(1), 2: t(2), 3: t(3), 4: t(4) };
  // Plinth: a broad bottom step and a narrower one, each top face catching the sun.
  for (let y = B - 4; y <= B; y++) band(y, 6);
  p.hline(cx - 6, B - 5, 13, t(3)).hline(cx - 6, B - 5, 4, t(4));
  p.hline(cx - 6, B, 13, t(1));
  for (let y = B - 9; y <= B - 7; y++) band(y, 5);
  p.hline(cx - 5, B - 10, 11, t(3)).hline(cx - 5, B - 10, 3, t(4));
  p.hline(cx - 5, B - 6, 11, t(1));
  // Fluted base: a bell that narrows as it rises, grooves every two pixels, a torus at the foot.
  const bell = [5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2];
  bell.forEach((half, k) => {
    const y = B - 11 - k;
    band(y, half);
    if (k > 1) for (let x = cx - half + 1; x < cx + half; x += 2) p.px(x, y, x < cx ? t(2) : t(1));
  });
  band(B - 11, 5, 1); band(B - 12, 5);
  const ringY = B - 11 - bell.length;
  band(ringY, 3, 1); band(ringY - 1, 3); band(ringY - 2, 2, 1);
  p.px(cx - 3, ringY, t(4));
  // Shaft: five wide, tapering to three in its top quarter; a collar ring part way up.
  const top = 40;
  const shaftBottom = ringY - 3;
  const taper = top + Math.round((shaftBottom - top) * 0.25);
  for (let y = top; y <= shaftBottom; y++) band(y, y < taper ? 1 : 2);
  const ring = Math.round(top + (shaftBottom - top) * 0.45);
  band(ring - 1, 3, 1); band(ring, 3); band(ring + 1, 2, -1);
  p.px(cx - 3, ring - 1, t(4));
  // The ladder rest: a crossbar with ball ends, curled brackets under it.
  const bar = top + 4;
  rod(p, cx - 8, bar, 17, 2, r);
  for (const x of [cx - 10, cx + 8]) art(p, x, bar - 1, [".3.", "342", ".21"].map((row) => row), legend);
  if (o.scrolls) {
    art(p, cx - 7, bar + 2, ["3332.", ".1.32", "..132", "...1."], legend);
    art(p, cx + 3, bar + 2, [".2333", "23.1.", "231..", ".1..."], legend);
  }
  // Acanthus collar under the head.
  art(p, cx - 4, top - 6, [
    "..12221..",
    ".1234321.",
    "123.3.321",
    ".1.343.1.",
    "...232...",
    "...121...",
  ], legend);
  const glass = { x0: cx - 5, x1: cx + 5, y0: 0, y1: 0 };
  if (o.style === "globe") {
    // Gallery ring, then an opal globe in a cage of four iron straps meeting at a crown.
    const gy = top - 7;
    p.hline(cx - 4, gy, 9, t(2)).hline(cx - 3, gy - 1, 7, t(3)).px(cx - 4, gy, t(3));
    const gc = gy - 8;
    p.ellipse(cx + 0.5, gc, 6, 6.5, "cream4");
    p.over(() => {
      p.ellipse(cx - 0.5, gc - 1, 4.4, 4.8, "cream5");
      p.ellipse(cx - 1.6, gc - 2.4, 1.8, 2, "white");
      for (let a = -0.4; a < 1.3; a += 0.05) p.px(Math.round(cx + 0.5 + Math.cos(a) * 5.6), Math.round(gc + Math.sin(a) * 6), "cream3");
      p.px(cx, gc + 1, "gold5").px(cx + 1, gc + 1, "gold4").px(cx, gc + 2, "gold4");
    });
    // Cage straps: the outer two follow the globe's curve; the inner two cross its face.
    for (let y = gc - 6; y <= gc + 5; y++) {
      const k = (y - gc) / 6.5, half = Math.sqrt(Math.max(0, 1 - k * k));
      p.px(Math.round(cx + 0.5 - half * 6.2), y, t(3)).px(Math.round(cx - 0.5 + half * 6.2), y, t(1));
      p.px(Math.round(cx + 0.5 - half * 2.4), y, t(2)).px(Math.round(cx - 0.5 + half * 2.4), y, t(2));
    }
    p.hline(cx - 5, gc, 11, t(2)); p.over(() => p.hline(cx - 5, gc, 4, t(3)));
    art(p, cx - 3, gc - 9, ["..3..", ".343.", "33421", ".222."], legend);
    p.px(cx, gc - 10, t(3)).px(cx, gc - 11, t(4)).px(cx, gc - 12, t(2));
    Object.assign(glass, { y0: gc - 6, y1: gc + 6 });
  } else {
    // Four-pane glass box, wider at the top as the Paris lanterns are: a tray, the glazing with a
    // mullion and a transom, the burner and a cool reflection of the sky.
    const gTop = top - 21, gBot = top - 8;
    p.hline(cx - 4, gBot + 1, 9, t(2)).hline(cx - 3, gBot + 2, 7, t(1)).px(cx - 4, gBot + 1, t(3));
    for (let y = gTop; y <= gBot; y++) {
      const half = y - gTop < 5 ? 5 : y - gTop < 10 ? 4 : 4;
      const hw = y === gTop ? 5 : half;
      for (let x = cx - hw; x <= cx + hw; x++) {
        const edge = x === cx - hw || x === cx + hw;
        const bar = x === cx || y === gTop + 6;
        p.px(x, y, edge ? t(x < cx ? 3 : 1) : bar ? t(2) : y - gTop < 3 ? "blue6" : x > cx ? "cream4" : "cream5");
      }
    }
    p.over(() => {
      // Sky in the top panes, a streak on the left pane, the mantle and burner below the transom.
      p.line(cx - 3, gTop + 1, cx - 2, gTop + 4, "white");
      p.px(cx - 3, gTop + 8, "white").px(cx - 3, gTop + 9, "white");
      art(p, cx - 1, gBot - 5, [".5.", "545", "545", ".4.", "s.s"], { 4: "gold4", 5: "gold5", s: "steel3" });
      p.px(cx + 2, gTop + 9, "steel5").px(cx + 3, gTop + 10, "steel5");
    });
    // Pointed cap: an eave with corner crockets, a pyramid with ribs, a ball and a spike.
    art(p, cx - 7, gTop - 10, [
      ".......3.......",
      "......343......",
      "......121......",
      ".....34321.....",
      "....3443221....",
      "...344432221...",
      "..34443322221..",
      ".3444332222221.",
      "3.33333222222.1",
      "211111111111111",
    ], legend);
    // Crockets: little iron leaves curling up from the eave corners.
    art(p, cx - 7, gTop - 3, ["3.", "13"], legend);
    art(p, cx + 6, gTop - 3, [".2", "21"], legend);
    p.px(cx, gTop - 11, t(2)).px(cx, gTop - 12, t(3));
    Object.assign(glass, { y0: gTop, y1: gBot });
  }
  return { cx, shaftTop: top, shaftBottom, ring, bar, glass, plinthTop: B - 10 };
}

/* ───────────────────────────── bollards ───────────────────────────── */

export type BollardStyle = "cannon" | "granite" | "steel";

/**
 * A kerb bollard on a footprint about 10 px wide, about 26 px tall. `cannon`: a cast-iron post with
 * a domed cap and a raised band, the dome rubbed bright by hands; `granite`: a chamfered stone post;
 * `steel`: a newer steel tube with reflective bands, dented by a delivery van.
 */
export function bollard(p: Px, style: BollardStyle, w: number, h: number, paint: Ramp = PAINT.black) {
  const cx = Math.floor(w / 2), B = h - 1;
  if (style === "cannon") {
    // Base flange, barrel tapering up, a band, the dome.
    for (let y = B - 2; y <= B; y++) across(7, paint).forEach((c, i) => p.px(cx - 3 + i, y, c));
    p.hline(cx - 3, B - 3, 7, tone(paint, 3));
    for (let y = B - 15; y < B - 3; y++) across(5, paint).forEach((c, i) => p.px(cx - 2 + i, y, c));
    for (let y = B - 17; y <= B - 16; y++) across(7, paint).forEach((c, i) => p.px(cx - 3 + i, y, c));
    p.hline(cx - 3, B - 17, 7, tone(paint, 3)).px(cx - 3, B - 17, tone(paint, 4));
    for (let y = B - 21; y < B - 17; y++) across(5, paint).forEach((c, i) => p.px(cx - 2 + i, y, c));
    art(p, cx - 2, B - 24, [".333.", "34443", "34432"], { 2: tone(paint, 2), 3: tone(paint, 3), 4: tone(paint, 4) });
    // The dome is polished to bare iron where people lean.
    p.px(cx - 1, B - 23, "steel5").px(cx, B - 23, "steel4");
  } else if (style === "granite") {
    // A squared post with a pyramid top; the top face pale, the front face a step darker, the right flank shaded.
    p.rect(cx - 3, B - 18, 7, 19, "stone3");
    p.vline(cx - 3, B - 18, 19, "stone4").vline(cx + 3, B - 18, 19, "stone2");
    art(p, cx - 3, B - 22, ["..545..", ".55443.", "5544432", "4444332"], { 2: "stone2", 3: "stone3", 4: "stone4", 5: "stone5" });
    p.over(() => {
      // Tooled surface: short chisel strokes, not speckle.
      for (const [x, y] of [[cx - 1, B - 15], [cx + 1, B - 11], [cx - 2, B - 7], [cx, B - 4], [cx + 1, B - 16]] as const) p.hline(x, y, 2, "stone2");
      p.hline(cx - 2, B - 1, 5, "stone2");
    });
  } else {
    // Steel tube, a reflective yellow band and a black one, a round cap.
    for (let y = B - 20; y <= B; y++) across(5, STEEL).forEach((c, i) => p.px(cx - 2 + i, y, c));
    p.ellipse(cx + 0.5, B - 20.5, 2.5, 1.5, "steel5");
    p.px(cx - 1, B - 21, "steel6");
    for (const y0 of [B - 17, B - 11]) {
      across(5, ["gold1", "gold2", "gold3", "gold4", "gold5"]).forEach((c, i) => p.vline(cx - 2 + i, y0, 2, c));
      across(5, PAINT.black).forEach((c, i) => p.vline(cx - 2 + i, y0 + 2, 2, c));
    }
    p.hline(cx - 2, B, 5, "steel2");
  }
  return { cx, top: B - 24, B };
}

/* ───────────────────────────── benches ───────────────────────────── */

export type BenchOptions = {
  w: number; h: number;
  /** Slat ramp (dark to light), cast-iron paint ramp. */
  wood: Ramp; iron: Ramp;
  /** Concrete end blocks instead of cast-iron ends. */
  concrete?: boolean;
  /** Slat index (0–5, back to front) replaced with a newer, paler plank; -1 for none. */
  newSlat?: number;
  seed: number;
};

/**
 * A park bench seen from the front: a slatted backrest rising behind a slatted seat (three back,
 * three seat slats), cast-iron scroll ends (or concrete blocks), a middle support on long benches.
 * Returns the seat's top surface so story props can be set on it.
 */
export function bench(p: Px, o: BenchOptions) {
  const { w, h, wood, iron, seed } = o;
  const B = h - 1;
  // Rows: backrest slats B-37..B-26, an open gap of five rows where only the iron uprights cross
  // (so the ground shows between back and seat), seat slats from B-20, the front rail at B-12.
  const backTop = B - 37, seatTop = B - 20, seatFront = B - 12;
  const ends = [2, w - 6];
  const supports = w > 76 ? [...ends, Math.floor(w / 2) - 2] : ends;
  const slat = (y: number, rows: number, face: "top" | "front", k: number) => {
    const r = k === o.newSlat ? OAK.slice(1) : wood;
    const n = r.length;
    const tones = face === "top" ? [n - 1, n - 2] : rows === 3 ? [n - 2, n - 3, n - 4] : [n - 3, n - 4];
    for (let j = 0; j < rows; j++) p.hline(1, y + j, w - 2, tone(r, tones[j]));
    // Grain: short darker streaks, staggered per slat; end grain darker where rain sits.
    for (let x = 4 + (hash(k, 1, seed) * 7 | 0); x < w - 5; x += 6 + (hash(x, k, seed) * 7 | 0))
      p.hline(x, y + (hash(x, 2, seed + k) < 0.5 ? 0 : rows - 1), 2 + (hash(x, y, seed) * 3 | 0), tone(r, tones[tones.length - 1] - 1));
    p.vline(1, y, rows, tone(r, n - 4)).vline(w - 2, y, rows, tone(r, 1));
  };
  // Back uprights, behind the slats, reaching down behind the seat.
  for (const x of supports) {
    if (o.concrete) { p.rect(x + 1, backTop - 1, 3, seatTop - backTop + 1, "stone2"); p.vline(x + 1, backTop - 1, seatTop - backTop + 1, "stone3"); continue; }
    across(3, iron).forEach((c, i) => p.vline(x + i, backTop - 1, seatTop - backTop + 1, c));
    p.hline(x, backTop - 1, 3, tone(iron, iron.length - 1));
  }
  // Backrest: three face-on slats with a dark hairline under each.
  for (let k = 0; k < 3; k++) {
    const y = backTop + k * 4;
    slat(y, 3, "front", k);
    p.hline(1, y + 3, w - 2, tone(wood, 0));
  }
  // Seat: three slats seen from above with dark gaps, then the front rail's face.
  for (let k = 0; k < 3; k++) {
    slat(seatTop + k * 3, 2, "top", k + 3);
    if (k < 2) p.hline(1, seatTop + k * 3 + 2, w - 2, tone(wood, 1));
  }
  slat(seatFront - 1, 2, "front", 6);
  p.hline(1, seatFront + 1, w - 2, tone(wood, 0));
  // Ends: cast-iron scrolls seen edge-on (an armrest knob, a curled foot) or concrete blocks.
  for (const x of supports) {
    const isEnd = x === ends[0] || x === ends[1];
    if (o.concrete) {
      p.rect(x, seatFront - 1, 5, B - seatFront + 2, "stone3");
      p.vline(x, seatFront - 1, B - seatFront + 2, "stone4").vline(x + 4, seatFront - 1, B - seatFront + 2, "stone2");
      p.hline(x, seatFront - 1, 5, "stone5");
      p.over(() => { p.px(x + 2, B - 4, "stone2").px(x + 1, B - 2, "stone2").hline(x + 1, B, 3, "stone2"); });
      continue;
    }
    across(3, iron).forEach((c, i) => p.vline(x + i, seatFront - 1, B - seatFront + 1, c));
    art(p, x - 1, B - 2, ["1.33.", "13431", ".111."], { 1: tone(iron, 1), 3: tone(iron, 3), 4: tone(iron, 4) });
    if (isEnd) {
      // The armrest's scroll knob standing proud of the seat, and a bead down the leg.
      art(p, x - 1, seatTop - 5, [".333.", "34421", "34121", ".3221", "..32.", "..21."], { 1: tone(iron, 1), 2: tone(iron, 2), 3: tone(iron, 3), 4: tone(iron, 4) });
      p.px(x + 1, seatFront + 4, tone(iron, 4)).px(x + 1, seatFront + 5, tone(iron, 3));
    }
    // Bolt heads where slats cross the frame.
    p.px(x + 1, seatTop + 3, "steel4").px(x + 1, backTop + 1, "steel4").px(x + 1, backTop + 5, "steel4");
  }
  // A stretcher bar low between the legs.
  if (!o.concrete) rod(p, ends[0] + 3, B - 5, ends[1] - ends[0] - 3, 2, iron);
  return { seatTop, seatFront, backTop, B };
}

/* ───────────────────────────── bicycles ───────────────────────────── */

export type BikeStyle = "roadster" | "stepthrough" | "share";
export type BikeOptions = {
  style: BikeStyle; w: number; h: number;
  frame: Ramp; seed: number;
  /** Front wheel on the right (default) or the left. */
  facing?: "right" | "left";
};

/**
 * A bicycle parked side-on, about 58 px long and 34 tall (a person's hip). `roadster` is the old
 * Flying Pigeon: a black diamond frame, rod brakes, an enclosed chain guard, full mudguards, a
 * rear carrier and a sprung leather saddle; `stepthrough` the ladies' model; `share` a modern
 * hire bike with mag wheels, a plastic basket and a lock box. Drawn facing right, then mirrored.
 * Returns the key points (in the facing it ends up) for story detail.
 */
export function bicycle(p: Px, o: BikeOptions) {
  const { w, h, frame: f, seed } = o;
  const G = h - 2; // tyre contact row
  const R = 11;
  const rear: [number, number] = [12, G - R], front: [number, number] = [w - 12, G - R];
  const bb: [number, number] = [27, G - 8];
  const seatTop: [number, number] = [23, G - 22];
  const headTop: [number, number] = [w - 17, G - 25], headBot: [number, number] = [w - 16, G - 19];
  const share = o.style === "share";
  const hi = tone(f, f.length - 2), mid = tone(f, 2), lo = tone(f, 1);
  // Wheels: tyre, rim, spokes (sparse, so the wheel reads as wire), hub.
  const wheel = (c: [number, number]) => {
    const [x, y] = c;
    if (share) {
      p.ellipse(x + 0.5, y + 0.5, R + 0.5, R + 0.5, "steel1");
      p.ellipse(x + 0.5, y + 0.5, R - 1.5, R - 1.5, null);
      p.ellipse(x + 0.5, y + 0.5, R - 2.2, R - 2.2, "steel4");
      p.ellipse(x + 0.5, y + 0.5, R - 3.2, R - 3.2, null);
      // Three mag spokes.
      for (const a of [0.3, 2.4, 4.5]) {
        const ex = x + Math.cos(a) * (R - 3), ey = y + Math.sin(a) * (R - 3);
        tube(p, x, y, ex, ey, "blue3", "blue2");
      }
      p.ellipse(x + 0.5, y + 0.5, 2, 2, "steel3");
      p.px(x, y, "steel5");
      return;
    }
    p.ellipse(x + 0.5, y + 0.5, R + 0.5, R + 0.5, "ink");
    p.ellipse(x + 0.5, y + 0.5, R - 0.6, R - 0.6, null);
    p.ellipse(x + 0.5, y + 0.5, R - 0.6, R - 0.6, "steel4");
    p.ellipse(x + 0.5, y + 0.5, R - 1.6, R - 1.6, null);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.2 + hash(c[0], 3, seed) * 0.4;
      p.line(x, y, Math.round(x + Math.cos(a) * (R - 2)), Math.round(y + Math.sin(a) * (R - 2)), k % 2 ? "steel4" : "steel3");
    }
    p.ellipse(x + 0.5, y + 0.5, 1.6, 1.6, "steel4");
    p.px(x, y, "steel6");
    // Tyre catches the sun on its upper-left shoulder.
    p.over(() => {
      for (let a = 3.5; a < 4.6; a += 0.08) p.px(Math.round(x + 0.5 + Math.cos(a) * R), Math.round(y + 0.5 + Math.sin(a) * R), "steel2");
    });
  };
  wheel(rear); wheel(front);
  // Mudguards: arcs over the top of each wheel.
  const guard = (c: [number, number], from: number, to: number, col: Color, edge: Color) => {
    for (let a = from; a <= to; a += 0.03) {
      const x = Math.round(c[0] + 0.5 + Math.cos(a) * (R + 1.2)), y = Math.round(c[1] + 0.5 + Math.sin(a) * (R + 1.2));
      p.px(x, y, col).px(x, y + 1, edge);
    }
  };
  guard(rear, Math.PI * 0.95, Math.PI * 1.95, share ? "steel4" : hi, share ? "steel2" : lo);
  guard(front, Math.PI * 1.05, Math.PI * 2.05, share ? "steel4" : hi, share ? "steel2" : lo);
  // Chainring and cranks.
  p.ellipse(bb[0] + 0.5, bb[1] + 0.5, 3.5, 3.5, "steel3");
  p.ellipse(bb[0] + 0.5, bb[1] + 0.5, 2, 2, "steel1");
  p.px(bb[0], bb[1], "steel5");
  tube(p, bb[0], bb[1], bb[0] + 3, bb[1] + 5, "steel4", "steel2");
  p.hline(bb[0] + 2, bb[1] + 6, 4, "ink2").hline(bb[0] + 2, bb[1] + 5, 4, "steel1");
  tube(p, bb[0], bb[1], bb[0] - 3, bb[1] - 5, "steel3");
  p.hline(bb[0] - 5, bb[1] - 6, 4, "steel1");
  // Frame tubes, two pixels: the enamel's lit top, then the shaded underside.
  if (o.style === "roadster") {
    tube(p, rear[0], rear[1], bb[0], bb[1], mid, lo); // chain stay
    tube(p, rear[0], rear[1], seatTop[0], seatTop[1] + 1, mid, lo); // seat stay
    tube(p, bb[0], bb[1], seatTop[0], seatTop[1], hi, lo); // seat tube
    tube(p, seatTop[0], seatTop[1] + 1, headTop[0], headTop[1] + 1, hi, lo); // top tube
    tube(p, bb[0], bb[1] - 1, headBot[0], headBot[1], hi, lo); // down tube
  } else if (o.style === "stepthrough") {
    tube(p, rear[0], rear[1], bb[0], bb[1], mid, lo);
    tube(p, rear[0], rear[1], seatTop[0], seatTop[1] + 1, mid, lo);
    tube(p, bb[0], bb[1], seatTop[0], seatTop[1], hi, lo);
    // Twin swooping tubes from the head down to the bottom bracket.
    const mx = (bb[0] + headBot[0]) / 2 - 2;
    for (const d of [0, 4]) {
      tube(p, headTop[0], headTop[1] + 2 + d, mx, bb[1] - 2 + d * 0.3, hi, lo);
      tube(p, mx, bb[1] - 2 + d * 0.3, bb[0] + 1, bb[1] - 1, hi, lo);
    }
  } else {
    // Share bike: one fat low tube in two-tone and a thick seat tube.
    for (let d = 0; d < 3; d++) {
      tube(p, headBot[0], headBot[1] - 2 + d, bb[0] + 4, bb[1] + d - 1, d === 0 ? "steel6" : d === 1 ? "steel5" : "steel3");
      tube(p, bb[0] + 4, bb[1] + d - 1, bb[0] - 1, bb[1] + d - 1, d === 0 ? "steel6" : d === 1 ? "steel5" : "steel3");
    }
    for (let d = 0; d < 3; d++) tube(p, bb[0] - 1 + d, bb[1], seatTop[0] + d, seatTop[1] + 2, d === 0 ? "steel6" : d === 1 ? "steel5" : "steel3");
    tube(p, rear[0], rear[1], bb[0], bb[1], "steel4", "steel2");
    tube(p, rear[0], rear[1], seatTop[0], seatTop[1] + 3, "steel4", "steel2");
    // The operator's colour stripe and a blank code plate under the saddle.
    tube(p, headBot[0] - 3, headBot[1] + 1, bb[0] + 6, bb[1], "blue3");
    p.rect(seatTop[0] + 1, seatTop[1] + 4, 3, 4, "cream5").px(seatTop[0] + 3, seatTop[1] + 7, "stone4");
  }
  // Chain guard: the roadster's full enclosure in black with a gold pinstripe; the share bike's grey shell.
  if (!share) {
    p.poly([[rear[0] - 2, rear[1] - 1], [bb[0] + 1, bb[1] - 4], [bb[0] + 4, bb[1]], [bb[0] + 1, bb[1] + 3], [rear[0], rear[1] + 3]], tone(f, 1));
    p.line(rear[0] + 1, rear[1], bb[0], bb[1] - 3, mid);
    if (o.style === "roadster") p.line(rear[0] + 2, rear[1] + 1, bb[0] - 1, bb[1] - 2, "gold3");
  } else {
    p.poly([[rear[0] - 1, rear[1] - 1], [bb[0] + 2, bb[1] - 3], [bb[0] + 4, bb[1] + 1], [rear[0], rear[1] + 3]], "steel3");
    p.line(rear[0], rear[1] - 1, bb[0] + 1, bb[1] - 3, "steel5");
  }
  // Fork, head tube, stem, bars, grips.
  tube(p, headBot[0], headBot[1], front[0] - 1, front[1] - 3, hi, lo);
  p.line(front[0] - 1, front[1] - 3, front[0], front[1], lo);
  for (let y = headTop[1]; y <= headBot[1]; y++) p.px(headTop[0] + Math.round((y - headTop[1]) / 6), y, mid).px(headTop[0] + 1 + Math.round((y - headTop[1]) / 6), y, lo);
  p.vline(headTop[0], headTop[1] - 4, 4, "steel4");
  if (share) {
    tube(p, headTop[0] - 6, headTop[1] - 5, headTop[0] + 1, headTop[1] - 4, "steel2", "steel1");
    p.hline(headTop[0] - 8, headTop[1] - 5, 3, "ink2");
  } else {
    // Swept-back roadster bars with rod-brake levers under them, chrome.
    p.line(headTop[0], headTop[1] - 4, headTop[0] - 6, headTop[1] - 5, "steel5");
    p.line(headTop[0], headTop[1] - 3, headTop[0] - 6, headTop[1] - 4, "steel3");
    p.hline(headTop[0] - 9, headTop[1] - 5, 3, "ink2").hline(headTop[0] - 9, headTop[1] - 4, 3, "ink");
    p.line(headTop[0] - 6, headTop[1] - 2, headTop[0] - 1, headTop[1] - 2, "steel4");
    // Rod brake running down past the head tube to the front rim.
    p.line(headTop[0] + 2, headTop[1] - 2, front[0] - 2, front[1] - R + 1, "steel4");
  }
  // The bell, chrome, on the bar by the stem.
  art(p, headTop[0] - 3, headTop[1] - 8, [".56.", "5664", "3443"], { 3: "steel3", 4: "steel4", 5: "steel5", 6: "steel6" });
  // Saddle on its post: sprung leather on the old bikes, black foam on the share bike.
  p.vline(seatTop[0] - 1, seatTop[1] - 4, 4, "steel4");
  if (share) {
    art(p, seatTop[0] - 6, seatTop[1] - 7, ["..2222222.", ".233333332", "1222222221", "...1111..."], { 1: "ink", 2: "steel1", 3: "steel2" });
  } else {
    art(p, seatTop[0] - 6, seatTop[1] - 8, ["...44443..", ".4433333221", "12222222221", "..s.s.s.s..", "..s.s.s.s.."], { 1: "brown1", 2: "brown2", 3: "brown3", 4: "oak3", s: "steel3" });
  }
  // The rear carrier: a flat chrome rack over the back wheel, struts down to the hub.
  const rack = rear[1] - 14;
  if (!share) {
    p.hline(rear[0] - 10, rack, seatTop[0] - rear[0] + 7, "steel4").hline(rear[0] - 10, rack + 1, seatTop[0] - rear[0] + 7, "steel2");
    p.line(rear[0] - 8, rack + 2, rear[0], rear[1], "steel3");
    p.line(rear[0] - 3, rack + 2, rear[0], rear[1], "steel2");
  }
  // Kickstand.
  p.line(rear[0] + 3, rear[1] + 2, rear[0] + 7, G + 1, "steel2");
  return { rear, front, bb, seatTop, headTop, G, R, rack };
}

/** Mirror a canvas in place (draw facing right, flip for left). */
export function flipInPlace(p: Px): Px {
  const copy = p.flippedX();
  p.rect(0, 0, p.w, p.h, null);
  p.blit(copy, 0, 0);
  return p;
}

/* ───────────────────────────── ground pieces ───────────────────────────── */

/**
 * Draw a horizontal strip `len` × `depth` with `draw`, then lay it into `p` either as is or
 * transposed (for north–south runs). Transposing keeps the top-left light on the top-left.
 */
export function strip(p: Px, len: number, depth: number, vertical: boolean, draw: (q: Px) => void): Px {
  const q = new PxCtor(len, depth);
  draw(q);
  for (let y = 0; y < depth; y++) for (let x = 0; x < len; x++) {
    const c = q.get(x, y);
    if (c) vertical ? p.px(y, x, c) : p.px(x, y, c);
  }
  return p;
}

/**
 * A cast-iron channel grate set in a granite frame, `len` long and `depth` deep (about 8): dark
 * slots between lit bars, rust bleeding from the bars into the stone, and whatever the street
 * dropped in it this morning.
 */
export function grate(q: Px, len: number, depth: number, seed: number) {
  q.rect(0, 0, len, depth, "stone3");
  q.hline(0, 0, len, "stone4").hline(0, depth - 1, len, "stone2");
  for (let x = 14 + (hash(seed, 1) * 10 | 0); x < len - 4; x += 18 + (hash(x, seed) * 10 | 0)) q.vline(x, 0, depth, "stone2");
  // The iron, inset one pixel; slots run across the channel.
  q.rect(1, 1, len - 2, depth - 2, "ink");
  for (let x = 2; x < len - 2; x += 3) {
    q.vline(x, 2, depth - 4, "steel2");
    q.px(x, 2, "steel3");
    q.vline(x + 1, 2, depth - 4, "ink2");
  }
  q.hline(1, 1, len - 2, "steel2").hline(1, depth - 2, len - 2, "steel1");
  // Rust: on the bars and stained into the stone at the ends.
  for (let x = 5; x < len - 3; x += 9 + (hash(x, 4, seed) * 9 | 0)) q.px(x, 3, "orange1").px(x, 4, "rose2");
  q.px(0, depth - 2, "orange1").px(len - 1, 1, "orange1");
}

/**
 * A long granite gutter `len` × `depth` (about 6): the kerb's lit lip, a shallow channel with a
 * shadow under the lip, block joints at irregular spacing with moss in some, puddles of the
 * morning's wash water, a few leaves.
 */
export function gutter(q: Px, len: number, depth: number, seed: number) {
  q.hline(0, 0, len, "stone5");
  q.rect(0, 1, len, depth - 1, "stone3");
  q.hline(0, 1, len, "stone2");
  q.hline(0, depth - 1, len, "stone4");
  let x = (hash(seed, 2) * 20) | 0;
  while (x < len) {
    q.vline(x, 0, depth, "stone2");
    q.px(x + 1, 0, "stone4");
    if (hash(x, 5, seed) < 0.35) q.px(x - 1, depth - 2, "leaf2").px(x + 1, depth - 2, "leaf3").px(x, depth - 1, "leaf2");
    x += 26 + ((hash(x, 7, seed) * 22) | 0);
  }
  // Puddles in the channel, catching the sky.
  for (let px = 30 + ((hash(seed, 9) * 40) | 0); px < len - 20; px += 90 + ((hash(px, 9, seed) * 120) | 0)) {
    const l = 8 + ((hash(px, 3, seed) * 14) | 0);
    q.hline(px, 2, l, "blue3").hline(px + 1, 3, l - 2, "blue4");
    q.hline(px + 2, 3, 2, "blue6");
  }
  // Fallen leaves, plane-tree brown.
  for (let px = 12 + ((hash(seed, 11) * 30) | 0); px < len - 4; px += 50 + ((hash(px, 11, seed) * 70) | 0)) q.px(px, 2, "oak2").px(px + 1, 2, "oak3").px(px + 1, 3, "oak1");
}

/* ───────────────────────────── railings ───────────────────────────── */

export type RailOptions = { paint: Ramp; seed: number; height?: number };

/**
 * A painted iron railing on a low granite kerb, running east–west across `w`: spear-topped
 * balusters every four pixels between a bottom and a top rail, square posts with urn finials every
 * forty-odd pixels. `B` is the kerb's bottom row. Returns the rail rows for story detail.
 */
export function railingH(p: Px, w: number, B: number, o: RailOptions) {
  const r = o.paint, H = o.height ?? 24;
  // The kerb: lit top, front face, joints.
  p.hline(0, B - 4, w, "stone5");
  p.rect(0, B - 3, w, 4, "stone3");
  p.hline(0, B, w, "stone2");
  for (let x = 20 + (hash(o.seed, 3) * 16 | 0); x < w - 2; x += 30 + (hash(x, o.seed) * 20 | 0)) p.vline(x, B - 3, 4, "stone2");
  const bottom = B - 7, top = B - H;
  const posts: number[] = [];
  for (let x = 1; x < w - 3; x += 44) posts.push(x);
  posts.push(w - 4);
  // Balusters with spear tips.
  for (let x = 3; x < w - 2; x += 4) {
    if (posts.some((q) => x >= q - 1 && x <= q + 3)) continue;
    p.vline(x, top - 1, bottom - top + 3, tone(r, 2));
    p.px(x, top - 3, tone(r, 3)).px(x - 1, top - 2, tone(r, 2)).px(x, top - 2, tone(r, 4)).px(x + 1, top - 2, tone(r, 1));
    p.px(x, bottom + 2, tone(r, 1));
  }
  // Rails: lit top edge, shaded bottom.
  rod(p, 0, top, w, 2, r);
  rod(p, 0, bottom, w, 2, r);
  // Posts with urn finials.
  for (const x of posts) {
    across(3, r).forEach((c, i) => p.vline(x + i, top - 2, B - 4 - top + 2, c));
    art(p, x - 1, top - 7, [".343.", "..3..", ".343.", "34421", ".221."], { 1: tone(r, 1), 2: tone(r, 2), 3: tone(r, 3), 4: tone(r, 4) });
  }
  return { top, bottom, posts };
}

/**
 * The same railing seen end-on, running north–south down `h` pixels of a strip centred at `cx`:
 * a lit kerb top, the railing a narrow band whose posts show as finial caps every 32 px, and the
 * south end post seen whole.
 */
export function railingV(p: Px, cx: number, y0: number, len: number, o: RailOptions) {
  const r = o.paint, H = o.height ?? 24;
  const B = y0 + len - 1;
  // The kerb's top, seven wide, lit on the left, joints across it.
  p.rect(cx - 3, y0, 7, len, "stone4");
  p.vline(cx - 3, y0, len, "stone5").vline(cx + 3, y0, len, "stone3");
  for (let y = y0 + 12; y < B - 4; y += 28 + (hash(y, o.seed) * 10 | 0)) p.hline(cx - 3, y, 7, "stone3").hline(cx - 3, y + 1, 7, "stone5");
  p.rect(cx - 3, B - 3, 7, 4, "stone3");
  p.hline(cx - 3, B - 3, 7, "stone5").hline(cx - 3, B, 7, "stone2");
  // The railing end-on: a dark band (rails and balusters stacked), the top rail's lit edge on
  // the left, each baluster's spear tip a bright tick every four pixels.
  for (let y = y0 - H; y < B - 6; y++) {
    p.px(cx - 2, y, tone(r, 4)).px(cx - 1, y, tone(r, 2)).px(cx, y, tone(r, 1)).px(cx + 1, y, tone(r, 1));
    // Each baluster's spear tip and collar catch the light as a tick every four pixels.
    if ((y & 3) === 0) p.px(cx - 1, y, tone(r, 4)).px(cx, y, tone(r, 3));
  }
  // Where the band crosses the kerb, a hairline of shadow on the kerb's lit top to its right.
  for (let y = y0; y < B - 6; y++) p.px(cx + 2, y, "stone3");
  // Posts every 32 px: a full post standing on the kerb, an urn finial above the band.
  for (let y = y0 + 20; y < B - 12; y += 32) {
    across(3, r).forEach((c, i) => p.vline(cx - 1 + i, y - H + 2, H - 2, c));
    art(p, cx - 2, y - H - 3, [".343.", "..3..", ".343.", "34421", ".221."], { 1: tone(r, 1), 2: tone(r, 2), 3: tone(r, 3), 4: tone(r, 4) });
    p.hline(cx - 2, y, 5, "stone2");
  }
  // The south end post, whole.
  across(3, r).forEach((c, i) => p.vline(cx - 1 + i, B - H - 2, H - 2, c));
  art(p, cx - 2, B - H - 7, [".343.", "..3..", ".343.", "34421", ".221."], { 1: tone(r, 1), 2: tone(r, 2), 3: tone(r, 3), 4: tone(r, 4) });
  p.outline(tone(r, 0), { sides: ["left", "right"] });
}

/**
 * A garden fence of split bamboo, east–west across `w`: a diamond lattice of lathes between thick
 * cane posts (nodes ringed, tops cut on the slant), two horizontal canes along the top, coir knots
 * where they cross, the lower lathes greyed by rain splash.
 */
export function bambooH(p: Px, w: number, B: number, seed: number, height = 28) {
  const top = B - height;
  const posts: number[] = [];
  for (let x = 1; x < w - 3; x += 36 + (hash(x, 1, seed) * 8 | 0)) posts.push(x);
  posts.push(w - 4);
  // Lattice: diagonals both ways, every 6 px, between top+3 and B-2.
  for (let y = top + 3; y <= B - 2; y++) for (let x = 0; x < w; x++) {
    const ma = (x + y) % 9, mb = (((x - y) % 9) + 9) % 9;
    const a = ma < 2, b = mb < 2;
    if (!a && !b) continue;
    const low = y > B - 7 && hash(x >> 3, 0, seed) < 0.7;
    // Lathes going up-right are lit on their upper edge; the ones going up-left lie behind, shaded.
    const c = a ? (ma === 0 ? "bamboo4" : "bamboo3") : mb === 0 ? "bamboo3" : "bamboo2";
    p.px(x, y, low ? (a ? "stone4" : "stone3") : c);
  }
  // Two top canes and a bottom rail.
  rod(p, 0, top + 2, w, 2, BAMBOO);
  rod(p, 0, top + 6, w, 2, BAMBOO);
  rod(p, 0, B - 3, w, 2, ["stone1", "stone2", "bamboo2", "bamboo3"]);
  for (let x = 6 + (hash(seed, 4) * 10 | 0); x < w - 4; x += 18 + (hash(x, 4, seed) * 14 | 0)) p.px(x, top + 2, "bamboo5").px(x, top + 3, "bamboo1");
  // Posts: thick canes, a node every 9 px, coir lashings.
  for (const x of posts) {
    across(3, BAMBOO).forEach((c, i) => p.vline(x + i, top - 2, B - top + 2, c));
    for (let y = top + 4; y < B - 1; y += 9) p.hline(x, y, 3, "bamboo2").px(x, y + 1, "bamboo5");
    p.px(x, top - 3, "bamboo4").px(x + 1, top - 3, "bamboo3").hline(x, top - 2, 3, "bamboo5");
    for (const y of [top + 2, top + 6]) p.rect(x - 1, y, 5, 2, "oak2").px(x - 1, y, "oak3").px(x + 3, y + 1, "wood1");
  }
  return { top, posts };
}

/** The bamboo fence end-on, down a strip: lathes seen as a hatched band, canes at posts. */
export function bambooV(p: Px, cx: number, y0: number, len: number, seed: number, height = 28) {
  const B = y0 + len - 1;
  for (let y = y0 - height + 2; y < B - 1; y++) {
    p.px(cx - 1, y, (y % 3) === 0 ? "bamboo4" : "bamboo3").px(cx, y, (y % 3) === 1 ? "bamboo2" : "bamboo3").px(cx + 1, y, "bamboo2");
  }
  for (let y = y0 - height + 6; y < B - 4; y += 34 + (hash(y, seed) * 8 | 0)) {
    p.rect(cx - 2, y, 5, 2, "oak2").px(cx - 2, y, "oak3");
    p.hline(cx - 1, y - 3, 3, "bamboo5");
  }
  across(3, BAMBOO).forEach((c, i) => p.vline(cx - 1 + i, B - height - 2, height + 3, c));
  for (let y = B - height + 4; y < B - 1; y += 9) p.hline(cx - 1, y, 3, "bamboo2");
  p.hline(cx - 1, B - height - 2, 3, "bamboo5");
}
