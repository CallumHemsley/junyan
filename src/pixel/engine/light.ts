/**
 * Light at art resolution. Each frame: a light map starts at the ambient colour for the day phase,
 * every active light adds its colour times its (precomputed, stepped) falloff, and the frame is
 * multiplied by the map, plus a small additive share so lit pixels glow a little. Falloffs are
 * quantised into a few steps, which keeps the light pixel-art crisp instead of airbrushed.
 */
import { TILE, hash } from "../kit/index.ts";
import { rgbOf } from "./color.ts";
import type { Frame } from "./frame.ts";
import type { Grade } from "./grade.ts";
import type { DayPhase, Light, Rgb } from "./types.ts";

/** Ambient multipliers per phase. The art is drawn for a bright morning, so morning is near 1. */
export const DEFAULT_AMBIENT: Record<DayPhase, Rgb> = {
  morning: [1.0, 0.97, 0.9],
  midday: [1, 1, 1],
  evening: [0.94, 0.78, 0.64],
  night: [0.46, 0.52, 0.76],
};

/**
 * How strongly glows (lamps, lanterns) show per phase: the eye adapts, so the same lamp that is
 * barely there in the morning sun pools warmly at night. Shafts are sunlight and gated by `phases`.
 */
export const GLOW_GAIN: Record<DayPhase, number> = { morning: 0.5, midday: 0.4, evening: 1.1, night: 2.2 };

/** How much a full-strength light brightens (multiply) and adds (glow) on top of ambient. */
const MULTIPLY = 0.5;
const ADD = 18;
/** Falloff steps. Fewer is chunkier. */
const STEPS = 6;

/** Grading only: glows up to this radius (tiles) are sources (lamp glass, a window) and get a halo; wider ones are fill light. */
const HALO_MAX_RADIUS = 4;
/** Halo radius as a share of the glow's, clamped to these tile sizes; and its additive strength at full gain. */
const HALO_SHARE = 0.4, HALO_MIN = 0.5, HALO_MAX = 1.4, HALO_ADD = 0.45;

/** Grading only: how fast light washes out the ambient tint (1 / summed light at which it is gone). */
const NEUTRALISE = 0.6;

/** Shaft edge softness, in art pixels: three-sixteenths of a tile. */
const SHAFT_SOFT = Math.max(2, Math.round((TILE * 3) / 16));

/**
 * Tone curve applied after lighting: identity up to 224, then a soft shoulder that approaches 255,
 * so a sunlit board keeps its grain instead of clipping to flat yellow.
 */
const KNEE = 224;
const TONE = new Uint8ClampedArray(1024);
for (let v = 0; v < TONE.length; v++) TONE[v] = v <= KNEE ? v : 255 - ((255 - KNEE) ** 2) / (v - KNEE + 255 - KNEE);

/**
 * Grading only: the highlight shoulder (ticket 0181). Above SHOULDER_KNEE (85%) values roll off
 * toward white, `K + R·x/√(1+x²)` with `x = (v − K)/R`, instead of clipping. Slope 1 at the knee;
 * 255 maps to about 244, close to the ungraded TONE curve's 240, so unlit whites look as before.
 *
 * Up to 255 each channel rolls off on its own (the art's own range, and the ambient-only tables).
 * Past it, light is over-exposing the pixel, and a per-channel roll-off would merge every bright tone
 * into the same pale yellow: there the curve moves onto the brightest channel and scales all three
 * together, keeping the hue differences between, say, skin, blush and shirt under a lantern. The
 * per-channel share falls from 1 at 255 to BLEACH_MIN at 255 + BLEACH_SPAN.
 */
export const SHOULDER_KNEE = 216;
const SHOULDER_ROOM = 255 - SHOULDER_KNEE;
const BLEACH_MIN = 0.5, BLEACH_SPAN = 600;
/** The shoulder on one value ≥ 0. Arithmetic and one square root. */
export function shoulder(v: number): number {
  if (v <= SHOULDER_KNEE) return v;
  const x = (v - SHOULDER_KNEE) / SHOULDER_ROOM;
  return SHOULDER_KNEE + (SHOULDER_ROOM * x) / Math.sqrt(1 + x * x);
}

export type CompiledLight = {
  kind: "glow" | "shaft";
  /** Bounding box of the falloff mask, world art px. */
  x: number; y: number; w: number; h: number;
  /** Falloff, 0..255, row-major over the box. */
  mask: Uint8Array;
  /** Colour, 0..1. */
  color: Rgb;
  strength: number;
  flicker: number;
  phases: readonly DayPhase[] | undefined;
  /** Glow geometry (world px): centre, radius, vertical squash. */
  glow?: { cx: number; cy: number; r: number; aspect: number };
  /** Shaft geometry for dust motes (world px). */
  shaft?: { x0: number; y0: number; width: number; length: number; slant: number; motes: number };
  seed: number;
};

/**
 * Snap a 0..1 falloff to STEPS flat bands. Only a narrow seam where two bands meet is
 * checkerboarded (by world pixel, so it never swims with the camera); elsewhere bands are flat.
 */
function quantise(v: number, x: number, y: number): number {
  if (v <= 0) return 0;
  const f = Math.min(1, v) * STEPS, base = Math.floor(f), frac = f - base;
  const level = frac > 0.62 ? base + 1 : frac > 0.38 ? base + ((x + y) & 1) : base;
  return Math.min(STEPS, level) / STEPS;
}

export function compileLight(light: Light, index: number): CompiledLight {
  if (light.kind === "glow") {
    const r = light.radius * TILE, aspect = light.aspect ?? 0.8;
    const cx = light.at[0] * TILE, cy = light.at[1] * TILE;
    const x = Math.floor(cx - r), y = Math.floor(cy - r * aspect);
    const w = Math.ceil(cx + r) - x, h = Math.ceil(cy + r * aspect) - y;
    const mask = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const dx = (x + i + 0.5 - cx) / r, dy = (y + j + 0.5 - cy) / (r * aspect);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) mask[j * w + i] = Math.round(quantise((1 - d) ** 1.5, x + i, y + j) * 255);
    }
    return {
      kind: "glow", x, y, w, h, mask, color: unit(rgbOf(light.color ?? "gold4")), strength: light.strength ?? 0.6, flicker: light.flicker ?? 0,
      phases: light.phases, glow: { cx, cy, r, aspect }, seed: index,
    };
  }
  const slant = light.slant ?? 0.5;
  const x0 = Math.round(light.from[0] * TILE), y0 = Math.round(light.from[1] * TILE);
  const width = Math.round(light.width * TILE), length = Math.round(light.length * TILE);
  const x = x0, y = y0, w = width + Math.ceil(length * slant) + 1, h = length;
  const mask = new Uint8Array(w * h);
  const [cols, rows] = light.panes ?? [1, 1];
  const colBars = new Set(Array.from({ length: cols - 1 }, (_, k) => Math.round(((k + 1) * width) / cols)));
  const rowBars = new Set(Array.from({ length: rows - 1 }, (_, k) => Math.round(((k + 1) * length) / rows)));
  for (let j = 0; j < h; j++) {
    const t = (j + 0.5) / length;
    // Bright at the window, fading out towards the far end with no hard edge.
    const fade = t < 0.55 ? 1 : 1 - smoothstep(0.55, 1, t);
    const rowBar = rowBars.has(j);
    const left = j * slant;
    for (let i = 0; i < w; i++) {
      const u = i + 0.5 - left;
      if (u <= 0 || u >= width) continue;
      const edge = Math.min(1, Math.min(u, width - u) / SHAFT_SOFT);
      let v = quantise(edge * fade, x + i, y + j);
      if (rowBar || colBars.has(Math.floor(u))) v = Math.max(0, v - 2 / STEPS);
      mask[j * w + i] = Math.round(v * 255);
    }
  }
  return {
    kind: "shaft", x, y, w, h, mask, color: unit(rgbOf(light.color ?? "gold5")), strength: light.strength ?? 0.5, flicker: 0,
    phases: light.phases ?? ["morning"], shaft: { x0, y0, width, length, slant, motes: light.motes ?? 4 }, seed: index,
  };
}

function smoothstep(a: number, b: number, v: number): number {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
const unit = ([r, g, b]: Rgb): Rgb => [r / 255, g / 255, b / 255];

export const isLit = (light: CompiledLight, phase: DayPhase) => !light.phases || light.phases.includes(phase);

/** Deterministic slow flicker multiplier, quantised to twentieths. 1 when frozen. */
export function flickerAt(light: CompiledLight, time: number, frozen: boolean): number {
  if (!light.flicker || frozen) return 1;
  const t = time / 1000, s = light.seed * 1.37;
  const wave = 0.6 * Math.sin(t * 1.7 + s) + 0.4 * Math.sin(t * 2.9 + s * 2.1);
  return Math.round((1 + light.flicker * 0.5 * wave) * 20) / 20;
}

const MOTE_SIZE = Math.max(1, TILE >> 4);
const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

/** Ambient-only pixels `start…end` (pixel indices) through per-channel lookup tables, a word at a time. */
function ambientRun(frame: Frame, start: number, end: number, tr: Uint8Array, tg: Uint8Array, tb: Uint8Array): void {
  if (LITTLE_ENDIAN) {
    const words = frame.words;
    for (let i = start; i < end; i++) {
      const w = words[i];
      words[i] = (tr[w & 255] | (tg[(w >>> 8) & 255] << 8) | (tb[(w >>> 16) & 255] << 16) | 0xff000000) >>> 0;
    }
    return;
  }
  const data = frame.data;
  for (let p = start * 4; p < end * 4; p += 4) { data[p] = tr[data[p]]; data[p + 1] = tg[data[p + 1]]; data[p + 2] = tb[data[p + 2]]; }
}

export type Mote = { x: number; y: number; alpha: number };

/** Dust motes in a shaft at `time`, world px. Slow and deterministic; frozen at t=0 when asked. */
export function motesAt(light: CompiledLight, time: number, frozen: boolean, out: Mote[] = []): Mote[] {
  out.length = 0;
  const shaft = light.shaft;
  if (!shaft) return out;
  const t = frozen ? 0 : time / 1000, inset = TILE / 8;
  for (let i = 0; i < shaft.motes; i++) {
    const h = (k: number) => hash(i, k, 101 + light.seed);
    const v = (h(1) + t * (0.015 + 0.012 * h(2))) % 1;
    const sway = (TILE / 10) * Math.sin(t * 0.5 + 6.283 * h(3));
    const yy = shaft.y0 + Math.floor(v * shaft.length * 0.9);
    const xx = shaft.x0 + Math.floor((yy - shaft.y0) * shaft.slant + inset + h(0) * (shaft.width - 2 * inset) + sway);
    const twinkle = 0.5 + 0.5 * Math.sin(t * 0.9 + 6.283 * h(4));
    const ends = Math.min(1, v * 6, (1 - v) * 4);
    const alpha = Math.round(twinkle * ends * 3) / 3; // 0, 1/3, 2/3, 1
    if (alpha > 0) out.push({ x: xx, y: yy, alpha });
  }
  return out;
}

/** A halo mask round a glow source: a small, stepped, additive bloom. */
type Halo = { light: CompiledLight; x: number; y: number; w: number; h: number; mask: Uint8Array };

function compileHalo(light: CompiledLight): Halo | null {
  const glow = light.glow;
  if (!glow || glow.r > HALO_MAX_RADIUS * TILE) return null;
  const r = Math.min(HALO_MAX * TILE, Math.max(HALO_MIN * TILE, glow.r * HALO_SHARE)), ry = r * glow.aspect;
  const x = Math.floor(glow.cx - r), y = Math.floor(glow.cy - ry);
  const w = Math.ceil(glow.cx + r) - x, h = Math.ceil(glow.cy + ry) - y;
  const mask = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (x + i + 0.5 - glow.cx) / r, dy = (y + j + 0.5 - glow.cy) / ry;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 1) mask[j * w + i] = Math.round(quantise((1 - d) * (1 - d), x + i, y + j) * 255);
  }
  return { light, x, y, w, h, mask };
}

/**
 * Holds the per-viewport light buffers so a frame allocates nothing. Lights only touch the float
 * buffers inside their boxes; each row remembers its lit span, and everything outside the spans
 * takes an integer lookup table for the ambient alone. The buffers are zeroed span by span after
 * use, so they never need a full clear.
 *
 * With `grades` (the colour-graded renderer) the ambient darkens towards each phase's coloured
 * floor instead of black, glows take the grade's gain, and small glows get an additive halo.
 * Without it the output is exactly the ungraded light.
 */
export function createLighting(lights: readonly CompiledLight[], ambientByPhase: Record<DayPhase, Rgb>, grades?: Record<DayPhase, Grade>) {
  let lr = new Float32Array(0), lg = new Float32Array(0), lb = new Float32Array(0);
  // Graded only: additive halo light, summed before the shoulder so it rolls off with everything else.
  let hr = new Float32Array(0), hg = new Float32Array(0), hb = new Float32Array(0);
  let spanFrom = new Int32Array(0), spanTo = new Int32Array(0);
  const motes: Mote[] = [];
  const moteColor = rgbOf("cream5");
  const halos = grades ? lights.map(compileHalo).filter((h): h is Halo => !!h) : [];
  const noFloor: Rgb = [0, 0, 0];
  const floorOf = (phase: DayPhase) => grades?.[phase].floor ?? noFloor;
  const ambientLut = new Map<DayPhase, [Uint8Array, Uint8Array, Uint8Array]>();
  const lutFor = (phase: DayPhase) => {
    let lut = ambientLut.get(phase);
    if (!lut) {
      const [ar, ag, ab] = ambientByPhase[phase], [fr, fg, fb] = floorOf(phase);
      // Graded: the shoulder instead of TONE (ambient-only values stay within 0..255, where it is per channel).
      const make = (k: number, f: number) => Uint8Array.from({ length: 256 }, (_, c) => {
        const v = (c * k + (f * (255 - c)) / 255) | 0;
        return grades ? Math.round(shoulder(Math.min(255, v))) : TONE[Math.min(1023, v)];
      });
      lut = [make(ar, fr), make(ag, fg), make(ab, fb)];
      ambientLut.set(phase, lut);
    }
    return lut;
  };

  return {
    /** Light `frame`, whose top-left is world px (vx, vy). */
    apply(frame: Frame, vx: number, vy: number, phase: DayPhase, time: number, frozen: boolean): void {
      const n = frame.w * frame.h, W = frame.w, H = frame.h;
      if (lr.length !== n) { lr = new Float32Array(n); lg = new Float32Array(n); lb = new Float32Array(n); }
      if (grades && hr.length !== n) { hr = new Float32Array(n); hg = new Float32Array(n); hb = new Float32Array(n); }
      if (spanFrom.length !== H) { spanFrom = new Int32Array(H); spanTo = new Int32Array(H); }
      spanFrom.fill(W); spanTo.fill(0);
      const [ar, ag, ab] = ambientByPhase[phase], [fr, fg, fb] = floorOf(phase);
      const am = (ar + ag + ab) / 3;
      const ambientOnly = ar !== 1 || ag !== 1 || ab !== 1 || fr !== 0 || fg !== 0 || fb !== 0;
      const glowGain = grades ? grades[phase].glowGain : GLOW_GAIN[phase];
      let anyLight = false;
      for (const light of lights) {
        if (!isLit(light, phase)) continue;
        const gain = light.kind === "glow" ? glowGain : 1;
        const s = light.strength * gain * flickerAt(light, time, frozen) / 255;
        const x0 = Math.max(light.x, vx), y0 = Math.max(light.y, vy);
        const x1 = Math.min(light.x + light.w, vx + W), y1 = Math.min(light.y + light.h, vy + H);
        if (x0 >= x1 || y0 >= y1) continue;
        anyLight = true;
        const [cr, cg, cb] = light.color;
        for (let y = y0; y < y1; y++) {
          const row = y - vy;
          if (x0 - vx < spanFrom[row]) spanFrom[row] = x0 - vx;
          if (x1 - vx > spanTo[row]) spanTo[row] = x1 - vx;
          let m = (y - light.y) * light.w + (x0 - light.x), d = row * W + (x0 - vx);
          for (let x = x0; x < x1; x++, m++, d++) {
            const v = light.mask[m];
            if (!v) continue;
            const k = v * s;
            lr[d] += k * cr; lg[d] += k * cg; lb[d] += k * cb;
          }
        }
      }
      // Halos: a small additive bloom round lamp glass and windows, after dark. Inside lit spans
      // (a halo sits inside its own glow's box).
      const halo = grades ? grades[phase].halo : 0, haloOn = halo > 0 && halos.length > 0;
      if (haloOn) for (const h of halos) {
        if (!isLit(h.light, phase)) continue;
        const s = h.light.strength * halo * HALO_ADD * flickerAt(h.light, time, frozen);
        const [cr, cg, cb] = h.light.color, kr = cr * s, kg = cg * s, kb = cb * s;
        const x0 = Math.max(h.x, vx), y0 = Math.max(h.y, vy);
        const x1 = Math.min(h.x + h.w, vx + W), y1 = Math.min(h.y + h.h, vy + H);
        if (x0 >= x1 || y0 >= y1) continue;
        anyLight = true;
        for (let y = y0; y < y1; y++) {
          const row = y - vy;
          if (x0 - vx < spanFrom[row]) spanFrom[row] = x0 - vx;
          if (x1 - vx > spanTo[row]) spanTo[row] = x1 - vx;
          let m = (y - h.y) * h.w + (x0 - h.x), d = row * W + (x0 - vx);
          for (let x = x0; x < x1; x++, m++, d++) {
            const v = h.mask[m];
            if (!v) continue;
            hr[d] += v * kr; hg[d] += v * kg; hb[d] += v * kb;
          }
        }
      }
      if (ambientOnly || anyLight) {
        const data = frame.data, [tr, tg, tb] = lutFor(phase);
        for (let y = 0; y < H; y++) {
          const from = spanFrom[y], to = spanTo[y], row = y * W;
          if (ambientOnly) {
            // Unlit parts of the row: identical to the full formula with no light, but table-driven.
            if (from < to) { ambientRun(frame, row, row + from, tr, tg, tb); ambientRun(frame, row + to, row + W, tr, tg, tb); }
            else ambientRun(frame, row, row + W, tr, tg, tb);
          }
          if (!grades) for (let i = row + from, p = i * 4; i < row + to; i++, p += 4) {
            const r = lr[i], g = lg[i], b = lb[i];
            data[p] = TONE[Math.min(1023, (data[p] * (ar + r * MULTIPLY) + r * ADD) | 0)];
            data[p + 1] = TONE[Math.min(1023, (data[p + 1] * (ag + g * MULTIPLY) + g * ADD) | 0)];
            data[p + 2] = TONE[Math.min(1023, (data[p + 2] * (ab + b * MULTIPLY) + b * ADD) | 0)];
            lr[i] = 0; lg[i] = 0; lb[i] = 0;
          }
          else for (let i = row + from, p = i * 4; i < row + to; i++, p += 4) {
            const r = lr[i], g = lg[i], b = lb[i];
            const h0 = haloOn ? hr[i] : 0, h1 = haloOn ? hg[i] : 0, h2 = haloOn ? hb[i] : 0;
            if (r === 0 && g === 0 && b === 0 && h0 === 0 && h1 === 0 && h2 === 0) {
              // Unlit pixel inside a lit span: exactly the ambient-only path.
              data[p] = tr[data[p]]; data[p + 1] = tg[data[p + 1]]; data[p + 2] = tb[data[p + 2]];
              continue;
            }
            // Light owns the pixels it reaches: it washes out the ambient's tint before adding its
            // own colour, so a lamp at night pools warm instead of turning the blue world white.
            const w = Math.min(1, (r + g + b) * NEUTRALISE);
            const mr = ar + (am - ar) * w + r * MULTIPLY, mg = ag + (am - ag) * w + g * MULTIPLY, mb = ab + (am - ab) * w + b * MULTIPLY;
            const cr = data[p], cg = data[p + 1], cb = data[p + 2];
            let vr = cr * mr + r * ADD + (fr * (255 - cr)) / 255 + h0;
            let vg = cg * mg + g * ADD + (fg * (255 - cg)) / 255 + h1;
            let vb = cb * mb + b * ADD + (fb * (255 - cb)) / 255 + h2;
            const m = vr > vg ? (vr > vb ? vr : vb) : vg > vb ? vg : vb;
            if (m > 255) {
              const k = shoulder(m) / m, bleach = Math.max(BLEACH_MIN, 1 - (m - 255) / BLEACH_SPAN);
              vr = vr * k + bleach * (shoulder(vr) - vr * k);
              vg = vg * k + bleach * (shoulder(vg) - vg * k);
              vb = vb * k + bleach * (shoulder(vb) - vb * k);
            } else if (m > SHOULDER_KNEE) { vr = shoulder(vr); vg = shoulder(vg); vb = shoulder(vb); }
            // Round to nearest; the shoulder keeps every channel within 0..255.
            data[p] = (vr + 0.5) | 0; data[p + 1] = (vg + 0.5) | 0; data[p + 2] = (vb + 0.5) | 0;
            lr[i] = 0; lg[i] = 0; lb[i] = 0;
            if (haloOn) { hr[i] = 0; hg[i] = 0; hb[i] = 0; }
          }
        }
      }
      // Dust motes catch the light: a single brightened art pixel each.
      for (const light of lights) {
        if (!light.shaft || !isLit(light, phase)) continue;
        for (const mote of motesAt(light, time, frozen, motes)) {
          const mx = mote.x - light.x, my = mote.y - light.y;
          if (mx < 0 || my < 0 || mx >= light.w || my >= light.h || !light.mask[my * light.w + mx]) continue;
          const a = mote.alpha * 0.55;
          // A mote is one sixteenth of a tile square: one art pixel at 16px tiles, 2×2 at 32px.
          for (let j = 0; j < MOTE_SIZE; j++) for (let i = 0; i < MOTE_SIZE; i++) {
            const x = mote.x - vx + i, y = mote.y - vy + j;
            if (x < 0 || y < 0 || x >= frame.w || y >= frame.h) continue;
            const p = (y * frame.w + x) * 4;
            frame.data[p] += (moteColor[0] - frame.data[p]) * a;
            frame.data[p + 1] += (moteColor[1] - frame.data[p + 1]) * a;
            frame.data[p + 2] += (moteColor[2] - frame.data[p + 2]) * a;
          }
        }
      }
    },
    /** A number that changes whenever flicker or motes would draw differently. */
    key(phase: DayPhase, time: number, frozen: boolean): number {
      let h = 0;
      for (const light of lights) {
        if (!isLit(light, phase)) continue;
        h = Math.imul(h ^ Math.round(flickerAt(light, time, frozen) * 20), 16777619);
        for (const m of motesAt(light, time, frozen, motes)) h = Math.imul(h ^ (m.x * 7919 + m.y * 31 + m.alpha * 3), 16777619);
      }
      return h;
    },
  };
}
