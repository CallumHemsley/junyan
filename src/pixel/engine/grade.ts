/**
 * Colour grading: the Eastward pass (ticket 0180). Warm, saturated light against cool, coloured
 * shadows, and a mood per day phase. Everything here is additive to the compositor and switched
 * by `RendererOptions.grade` (default on); off, the renderer is byte-identical to the ungraded one.
 *
 * Two halves:
 *  - Light parameters per phase (`GRADES`): an ambient that darkens towards a coloured floor
 *    instead of black, contact shadows in phase colours (long and violet at evening), stronger
 *    glows and a small additive halo round lamp glass and windows after dark.
 *  - A final-pass lookup table: split-toning by luminance (shadows towards teal or plum,
 *    highlights towards gold), a saturation lift in the mid-tones, a gentle S-curve and a glow
 *    lift in the highlights.
 *
 * The table holds a signed per-channel *offset* for each 5-bit-per-channel cell (32³ cells,
 * 128 KiB a phase, built once per phase on first use). Applying it adds the cell's offset to the
 * pixel's own full-precision value, so the grade never posterises the art. The table is built
 * with plain arithmetic only (no `pow`, `exp` or trigonometry) and applied with integers, so
 * Node and every browser produce the same bytes.
 *
 * Vermilion is reserved for words. The build measures each cell against both accent tones in
 * CIELAB and scales back any offset that would carry a colour towards them (see `guardVermilion`).
 */
import type { Color } from "../kit/index.ts";
import type { Frame } from "./frame.ts";
import type { DayPhase, Rgb } from "./types.ts";

export type ContactShadow = {
  color: Color;
  /** Opacities, 0..255, of the ellipse's core and rim. */
  core: number;
  rim: number;
  /** Horizontal stretch of the ellipse, and its shift east in radii: a low sun throws long shadows. */
  stretch: number;
  shift: number;
};

export type Grade = {
  /** Ambient multiplier, 1 = the art as drawn. A scene's own `ambient` for the phase still wins. */
  ambient: Rgb;
  /** Coloured floor, 0..255: the ambient darkens towards this instead of black (`c·k + floor·(1 − c/255)`). */
  floor: Rgb;
  shadow: ContactShadow;
  /** Glow-light gain (replaces `GLOW_GAIN` when grading). */
  glowGain: number;
  /** Additive halo round small glows (lamp glass, windows), 0 = none. */
  halo: number;
  /** Chroma pushed into the shadows and the highlights at full weight, 0..255 units. Luma is removed first. */
  shadowTint: Rgb;
  highlightTint: Rgb;
  /** Luminance, 0..1, where shadows end and highlights begin. */
  pivot: number;
  /** Saturation lift at mid-grey, falling to 0 at black and white. */
  saturation: number;
  /** S-curve strength round the pivot. */
  contrast: number;
  /** Luma added at full highlight weight: highlights glow. */
  glow: number;
};

/** The one table. Tune here. */
export const GRADES: Record<DayPhase, Grade> = {
  // Morning gold: honeyed highlights, cool teal-blue in the shade.
  morning: {
    ambient: [1.0, 0.95, 0.84], floor: [8, 8, 18],
    shadow: { color: "plum1", core: 86, rim: 46, stretch: 1.15, shift: 0.12 },
    glowGain: 0.5, halo: 0,
    shadowTint: [-12, 4, 20], highlightTint: [22, 12, -24], pivot: 0.5, saturation: 0.22, contrast: 0.08, glow: 4,
  },
  // Midday clear: the art as drawn, a touch crisper and cleaner in the shade.
  midday: {
    ambient: [1, 1, 1], floor: [4, 6, 12],
    shadow: { color: "plum1", core: 82, rim: 44, stretch: 1, shift: 0 },
    glowGain: 0.4, halo: 0,
    shadowTint: [-10, 4, 16], highlightTint: [6, 4, -8], pivot: 0.5, saturation: 0.14, contrast: 0.1, glow: 2,
  },
  // Evening amber: warm light, long violet shadows.
  evening: {
    ambient: [0.98, 0.84, 0.7], floor: [10, 4, 18],
    shadow: { color: "plum2", core: 96, rim: 52, stretch: 1.6, shift: 0.4 },
    glowGain: 1.3, halo: 0.6,
    shadowTint: [8, -8, 20], highlightTint: [20, 8, -20], pivot: 0.5, saturation: 0.16, contrast: 0.08, glow: 6,
  },
  // Night deep blue: a cool world, warm windows and lamps that glow.
  night: {
    ambient: [0.3, 0.38, 0.66], floor: [5, 8, 20],
    shadow: { color: "blue1", core: 76, rim: 40, stretch: 1, shift: 0 },
    glowGain: 2.4, halo: 0.85,
    shadowTint: [-8, 2, 12], highlightTint: [14, 6, -14], pivot: 0.45, saturation: 0.04, contrast: 0.06, glow: 12,
  },
};

/** Where the final pass starts rolling a highlight lift off toward 255 instead of clipping it. */
const LIFT_SOFT = 240;

/** Bits per channel of the table's index. */
export const LUT_BITS = 5;
const CELLS = 1 << LUT_BITS;
const SHIFT = 8 - LUT_BITS;

/** The UI accent in the light and dark themes (`docs/design/tokens.css`). */
export const VERMILION: readonly Rgb[] = [[0xb5, 0x46, 0x2b], [0xdd, 0x6f, 0x4f]];
/** CIELAB ΔE76 inside which a colour counts as near vermilion. */
const VERMILION_SAFE = 20;
/** Bound on the ΔE between a table cell's centre and its corners (3.5 levels a channel), with room to spare. */
const GUARD_MARGIN = 12;

/** Rec. 709 luma, 0..255. */
const luma = (r: number, g: number, b: number) => (54 * r + 183 * g + 19 * b) / 256;
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/** `v^(1/n)` by Newton's method from above: arithmetic only, so every JS engine agrees bit for bit. */
function nthRoot(v: number, n: number): number {
  if (v <= 0) return 0;
  let y = Math.max(1, v);
  for (let i = 0; i < 200; i++) {
    let p = 1;
    for (let k = 1; k < n; k++) p *= y;
    const next = y - (p * y - v) / (n * p);
    if (!(next < y)) break;
    y = next;
  }
  return y;
}

/** Tables for CIELAB (sRGB → linear, and the cube root), sampled finely and read with linear interpolation. */
const LIN_STEPS = 4, CBRT_SIZE = 4096, CBRT_MAX = 1.25;
const LIN = Float64Array.from({ length: 255 * LIN_STEPS + 2 }, (_, i) => {
  const c = Math.min(1, i / (255 * LIN_STEPS));
  if (c <= 0.04045) return c / 12.92;
  const x = (c + 0.055) / 1.055, x2 = x * x, x4 = x2 * x2;
  return nthRoot(x4 * x4 * x4, 5); // x^2.4
});
const CBRT = Float64Array.from({ length: CBRT_SIZE + 2 }, (_, i) => nthRoot((i / CBRT_SIZE) * CBRT_MAX, 3));
const sample = (table: Float64Array, at: number) => { const i = Math.floor(at), f = at - i; return table[i] + (table[i + 1] - table[i]) * f; };

function lab(r: number, g: number, b: number): [number, number, number] {
  const R = sample(LIN, r * LIN_STEPS), G = sample(LIN, g * LIN_STEPS), B = sample(LIN, b * LIN_STEPS);
  const f = (t: number) => (t > 0.008856 ? sample(CBRT, (Math.min(t, CBRT_MAX) / CBRT_MAX) * CBRT_SIZE) : 7.787 * t + 16 / 116);
  const X = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047), Y = f(R * 0.2126 + G * 0.7152 + B * 0.0722), Z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
const VERMILION_LAB = VERMILION.map(([r, g, b]) => lab(r, g, b));

/** Squared ΔE76 to the nearer accent tone. */
function vermilionDistance(r: number, g: number, b: number): number {
  const [l, a, bb] = lab(r, g, b);
  let best = Infinity;
  for (const [vl, va, vb] of VERMILION_LAB) {
    const d = (l - vl) * (l - vl) + (a - va) * (a - va) + (bb - vb) * (bb - vb);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Scale an offset back until it no longer carries any colour of its cell towards vermilion. A
 * colour may move freely while it stays clear of the accent; near it, it may only move away (or
 * stay put). The table applies one offset to a whole cell, so the cell's corners are checked too.
 */
function guardVermilion(r: number, g: number, b: number, dr: number, dg: number, db: number, half: number): number {
  // Fast path: centre clear of the accent before and after by more than a cell's own ΔE spread.
  const clear = (VERMILION_SAFE + GUARD_MARGIN) * (VERMILION_SAFE + GUARD_MARGIN);
  if (vermilionDistance(r, g, b) > clear && vermilionDistance(r + dr, g + dg, b + db) > clear) return 1;
  const points: number[][] = [[r, g, b]];
  for (const sr of [-half, half]) for (const sg of [-half, half]) for (const sb of [-half, half]) points.push([r + sr, g + sg, b + sb]);
  const floors = points.map(([pr, pg, pb]) => Math.min(vermilionDistance(pr, pg, pb), VERMILION_SAFE * VERMILION_SAFE));
  const ok = (k: number) => points.every(([pr, pg, pb], i) => vermilionDistance(clamp(pr + dr * k, 0, 255), clamp(pg + dg * k, 0, 255), clamp(pb + db * k, 0, 255)) >= floors[i]);
  if (ok(1)) return 1;
  let lo = 0, hi = 1;
  for (let i = 0; i < 8; i++) { const mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid; }
  return lo;
}

function rollLift(c: number, c1: number): number {
  if (c1 <= c || c1 <= LIFT_SOFT) return c1;
  const e = c1 - c, room = 255 - c, w = Math.min(1, (c1 - LIFT_SOFT) / (255 - LIFT_SOFT));
  return room > 0 ? c + e * (1 - w + (w * room) / (e + room)) : c;
}

/**
 * The graded colour for one input colour, unrounded. `half` is the half-width of the table cell
 * whose offset this becomes (0 for a single colour). Exported for tests and tools.
 */
export function gradeColor(grade: Grade, r: number, g: number, b: number, half = 0): Rgb {
  const L = luma(r, g, b), t = L / 255, p = grade.pivot;
  const mid = 4 * t * (1 - t);
  // Saturation lift in the mids.
  const k = 1 + grade.saturation * mid;
  let r1 = L + (r - L) * k, g1 = L + (g - L) * k, b1 = L + (b - L) * k;
  // S-curve round the pivot, strongest in the mids; then highlights glow.
  const a = t < p ? (p - t) / p : 0, c = t > p ? (t - p) / (1 - p) : 0;
  // Shade tint reaches up through the low mids (linear); the warm push stays in the highlights (squared).
  const ws = a, wh = c * c;
  const dL = grade.contrast * (L - p * 255) * mid + grade.glow * wh;
  // Split tone: luma-free chroma, so it colours the shade without lifting or crushing it.
  const [sr, sg, sb] = grade.shadowTint, [hr, hg, hb] = grade.highlightTint;
  const sl = luma(sr, sg, sb), hl = luma(hr, hg, hb);
  r1 += dL + ws * (sr - sl) + wh * (hr - hl);
  g1 += dL + ws * (sg - sl) + wh * (hg - hl);
  b1 += dL + ws * (sb - sl) + wh * (hb - hl);
  // Never clip (ticket 0181): a channel lifted past LIFT_SOFT has the lift rolled into the room left
  // below 255, so two bright tones stay two tones. Lifts ending below LIFT_SOFT, and every
  // downward move, are untouched; the roll-off fades in between LIFT_SOFT and 255, so it is smooth.
  r1 = rollLift(r, r1); g1 = rollLift(g, g1); b1 = rollLift(b, b1);
  r1 = clamp(r1, 0, 255); g1 = clamp(g1, 0, 255); b1 = clamp(b1, 0, 255);
  const s = guardVermilion(r, g, b, r1 - r, g1 - g, b1 - b, half);
  return [r + (r1 - r) * s, g + (g1 - g) * s, b + (b1 - b) * s];
}

/** Build the offset table for one grade: `CELLS³` words, each three biased bytes (offset + 128). */
export function buildGradeLut(grade: Grade): Uint32Array {
  const lut = new Uint32Array(CELLS * CELLS * CELLS);
  const centre = (i: number) => (i << SHIFT) + ((1 << SHIFT) - 1) / 2;
  for (let ri = 0; ri < CELLS; ri++) for (let gi = 0; gi < CELLS; gi++) for (let bi = 0; bi < CELLS; bi++) {
    const r = centre(ri), g = centre(gi), b = centre(bi);
    const [r1, g1, b1] = gradeColor(grade, r, g, b, ((1 << SHIFT) - 1) / 2);
    const o = (v: number, from: number) => clamp(Math.round(v - from), -127, 127) + 128;
    lut[(ri << (2 * LUT_BITS)) | (gi << LUT_BITS) | bi] = (o(r1, r) | (o(g1, g) << 8) | (o(b1, b) << 16)) >>> 0;
  }
  return lut;
}

/** `CLAMP[v + offset + 128]` → clamped channel. */
const CLAMP = Uint8Array.from({ length: 512 }, (_, i) => clamp(i - 128, 0, 255));
const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
const CACHE_MASK = 4095, CACHE_KEYS = new Uint32Array(CACHE_MASK + 1), CACHE_VALS = new Uint32Array(CACHE_MASK + 1);

/** Apply an offset table to every pixel of `frame`. Integer only; allocates nothing. */
export function applyGradeLut(frame: Frame, lut: Uint32Array): void {
  const n = frame.w * frame.h;
  if (LITTLE_ENDIAN) {
    const words = frame.words;
    // A frame holds a few thousand distinct colours: remember recent results in a small
    // direct-mapped cache keyed by the pixel word.
    const keys = CACHE_KEYS, vals = CACHE_VALS;
    keys.fill(0);
    for (let i = 0; i < n; i++) {
      const w = words[i], k = (w ^ (w >>> 9) ^ (w >>> 17)) & CACHE_MASK;
      if (keys[k] === w) { words[i] = vals[k]; continue; }
      const r = w & 255, g = (w >>> 8) & 255, b = (w >>> 16) & 255;
      const d = lut[((r >>> SHIFT) << (2 * LUT_BITS)) | ((g >>> SHIFT) << LUT_BITS) | (b >>> SHIFT)];
      const out = (CLAMP[r + (d & 255)] | (CLAMP[g + ((d >>> 8) & 255)] << 8) | (CLAMP[b + ((d >>> 16) & 255)] << 16) | 0xff000000) >>> 0;
      keys[k] = w; vals[k] = out; words[i] = out;
    }
    return;
  }
  const data = frame.data;
  for (let p = 0; p < n * 4; p += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const d = lut[((r >>> SHIFT) << (2 * LUT_BITS)) | ((g >>> SHIFT) << LUT_BITS) | (b >>> SHIFT)];
    data[p] = CLAMP[r + (d & 255)]; data[p + 1] = CLAMP[g + ((d >>> 8) & 255)]; data[p + 2] = CLAMP[b + ((d >>> 16) & 255)];
  }
}

/** Grade one colour exactly as the table does (for tests and tools). */
export function lookupGrade(lut: Uint32Array, [r, g, b]: Rgb): Rgb {
  const d = lut[((r >>> SHIFT) << (2 * LUT_BITS)) | ((g >>> SHIFT) << LUT_BITS) | (b >>> SHIFT)];
  return [CLAMP[r + (d & 255)], CLAMP[g + ((d >>> 8) & 255)], CLAMP[b + ((d >>> 16) & 255)]];
}

const luts = new Map<Grade, Uint32Array>();
/** The table for a grade, built on first use and shared by every renderer. */
export function gradeLut(grade: Grade): Uint32Array {
  let lut = luts.get(grade);
  if (!lut) { lut = buildGradeLut(grade); luts.set(grade, lut); }
  return lut;
}
