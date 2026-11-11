import { describe, expect, it } from "vitest";
import { TILE as T, PALETTE, type Color } from "../kit/index.ts";
import { createAtlas } from "./atlas.ts";
import { createFrame, hashFrame } from "./frame.ts";
import { GRADES, LUT_BITS, VERMILION, applyGradeLut, buildGradeLut, gradeLut, lookupGrade } from "./grade.ts";
import { SHOULDER_KNEE, shoulder } from "./light.ts";
import { createSceneRenderer, renderToFrame } from "./renderer.ts";
import { defineScene } from "./scene.ts";
import { solid, testSprites } from "./test-sprites.ts";
import { DAY_PHASES, type FrameState, type Rgb, type Scene } from "./types.ts";

const greys = ["steel1", "stone1", "grey1"] as const;
/** A face's tones side by side, two pixels each: what a lantern lights on a character. */
const faceTones: Color[] = ["skin1", "skin2", "blush", "skin3", "skin4", "cream5"];
const atlas = createAtlas({
  ...testSprites,
  ...Object.fromEntries(greys.map((c) => [`t/${c}`, solid(T, T, c, { layer: "floor" })])),
  "t/face": { w: faceTones.length * 2, h: 4, anchor: [faceTones.length, 4], layer: "floor", draw: (p) => faceTones.forEach((c, i) => p.rect(i * 2, 0, 2, 4, c)) },
});
const rgb = (c: Color): Rgb => [parseInt(PALETTE[c].slice(1, 3), 16), parseInt(PALETTE[c].slice(3, 5), 16), parseInt(PALETTE[c].slice(5, 7), 16)];
const at = (frame: { w: number; data: Uint8ClampedArray }, x: number, y: number) => Array.from(frame.data.subarray((y * frame.w + x) * 4, (y * frame.w + x) * 4 + 3));
const luma = ([r, g, b]: Rgb) => (54 * r + 183 * g + 19 * b) / 256;
const colours = Object.keys(PALETTE) as Color[];

/** CIELAB ΔE76: an independent check on the grade's own (redmean) vermilion guard. */
function lab([r, g, b]: Rgb): number[] {
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047), Y = f(R * 0.2126 + G * 0.7152 + B * 0.0722), Z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
const deltaE = (a: Rgb, b: Rgb) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
const toVermilion = (c: Rgb) => Math.min(...VERMILION.map((v) => deltaE(c, v)));

const fnv = (words: Uint32Array) => { let h = 0x811c9dc5; for (const w of words) h = Math.imul(h ^ w, 0x01000193); return (h >>> 0).toString(16).padStart(8, "0"); };

describe("grade table", () => {
  it("is built identically every time and shared between renderers", () => {
    for (const phase of DAY_PHASES) {
      const lut = buildGradeLut(GRADES[phase]);
      expect(lut.length).toBe(1 << (3 * LUT_BITS));
      expect(fnv(lut)).toBe(fnv(buildGradeLut(GRADES[phase])));
      expect(gradeLut(GRADES[phase])).toBe(gradeLut(GRADES[phase]));
    }
  });

  it("is pinned (arithmetic only, so Node and browsers agree; update the pins when retuning GRADES)", () => {
    expect(Object.fromEntries(DAY_PHASES.map((p) => [p, fnv(gradeLut(GRADES[p]))]))).toMatchInlineSnapshot(`
      {
        "evening": "094ea4df",
        "midday": "43381bcc",
        "morning": "393471d3",
        "night": "558efc74",
      }
    `);
  });

  it("applies as a per-pixel offset, identical to the single-colour lookup", () => {
    const lut = gradeLut(GRADES.evening), frame = createFrame(colours.length, 1);
    colours.forEach((c, i) => frame.data.set([...rgb(c), 255], i * 4));
    applyGradeLut(frame, lut);
    colours.forEach((c, i) => expect(at(frame, i, 0)).toEqual(lookupGrade(lut, rgb(c))));
  });
});

describe("grade per phase on the palette", () => {
  const graded = (phase: keyof typeof GRADES, c: Color) => lookupGrade(gradeLut(GRADES[phase]), rgb(c));
  const darks: Color[] = ["ink", "wood1", "jade1", "leaf1", "blue1", "steel1", "stone1", "hair2", "plum1"];
  const lights: Color[] = ["cream4", "cream5", "white", "oak5", "bamboo5", "steel6", "stone5"];
  const warmth = ([r, , b]: Rgb) => r - b;

  it("morning: honeyed highlights, cool shade", () => {
    for (const c of lights) expect(warmth(graded("morning", c)), c).toBeGreaterThan(warmth(rgb(c)));
    for (const c of darks) expect(warmth(graded("morning", c)), c).toBeLessThan(warmth(rgb(c)));
  });

  it("midday: clear, close to the art as drawn", () => {
    for (const c of colours) graded("midday", c).forEach((v, i) => expect(Math.abs(v - rgb(c)[i]), c).toBeLessThanOrEqual(20));
  });

  it("evening: amber highlights, violet shade", () => {
    for (const c of lights) expect(warmth(graded("evening", c)), c).toBeGreaterThan(warmth(rgb(c)));
    for (const c of darks) {
      const [, g, b] = graded("evening", c), [, g0, b0] = rgb(c);
      expect(b - g, c).toBeGreaterThan(b0 - g0);
    }
  });

  it("night: the shade goes blue, what light there is stays warm", () => {
    for (const c of darks) expect(warmth(graded("night", c)), c).toBeLessThan(warmth(rgb(c)));
    for (const c of lights) expect(warmth(graded("night", c)), c).toBeGreaterThanOrEqual(warmth(rgb(c)));
  });

  it("keeps luminance order of each ramp, so shading still reads", () => {
    for (const phase of DAY_PHASES) for (const name of ["wood", "oak", "cream", "jade", "blue", "steel", "stone", "skin"]) {
      const ramp = colours.filter((c) => c.replace(/\d+$/, "") === name);
      const ls = ramp.map((c) => luma(graded(phase, c)));
      for (let i = 1; i < ls.length; i++) expect(ls[i], `${phase} ${ramp[i]}`).toBeGreaterThan(ls[i - 1]);
    }
  });

  it("never carries a colour towards the vermilion reserved for words", () => {
    // Anything already near the accent may only move away; anything clear of it stays clear.
    const SAFE = 20, SLACK = 1.5;
    for (const phase of DAY_PHASES) {
      const lut = gradeLut(GRADES[phase]);
      for (const c of colours) {
        const before = toVermilion(rgb(c)), after = toVermilion(lookupGrade(lut, rgb(c)));
        expect(after, `${phase} ${c}`).toBeGreaterThanOrEqual(Math.min(before, SAFE) - SLACK);
      }
      // Lit and shaded colours are not palette colours: sweep the whole cube too.
      for (let r = 4; r < 256; r += 8) for (let g = 4; g < 256; g += 8) for (let b = 4; b < 256; b += 8) {
        const before = toVermilion([r, g, b]), after = toVermilion(lookupGrade(lut, [r, g, b]));
        if (after < Math.min(before, SAFE) - 3) expect.fail(`${phase} ${[r, g, b]} moved from ΔE ${before.toFixed(1)} to ${after.toFixed(1)} of vermilion`);
      }
    }
  });
});

describe("highlight shoulder", () => {
  it("is the identity up to the knee, then rises smoothly toward white without reaching it", () => {
    for (let v = 0; v <= SHOULDER_KNEE; v++) expect(shoulder(v)).toBe(v);
    let last = shoulder(SHOULDER_KNEE);
    for (let v = SHOULDER_KNEE + 1; v < 4000; v++) {
      const s = shoulder(v);
      expect(s).toBeGreaterThan(last);
      expect(s - last).toBeLessThanOrEqual(1 + 1e-9);
      expect(s).toBeLessThan(255);
      last = s;
    }
    expect(shoulder(255)).toBeGreaterThan(240);
  });
});

describe("graded renderer", () => {
  const room = (extra: Partial<Scene> = {}): Scene => defineScene({
    id: "test", size: [4, 4], background: "ink",
    layers: [{ rows: ["aaaa", "aaaa", "aaaa", "aaaa"], legend: { a: "t/floor-a" } }],
    ...extra,
  });
  const draw = (scene: Scene, state: Partial<FrameState> = {}, grade = true) =>
    renderToFrame(createSceneRenderer(scene, atlas, { grade }), { x: 0, y: 0, w: scene.size[0] * T, h: scene.size[1] * T }, { time: 0, phase: "midday", ...state });
  const lit = room({
    props: [{ sprite: "t/shadowed", at: [1, 3] }, { sprite: "t/red", at: [3, 1] }],
    lights: [
      { kind: "glow", at: [2, 2], radius: 1.5, strength: 0.8, flicker: 0.5 },
      { kind: "shaft", from: [0, 0], width: 1.5, length: 3, panes: [2, 2], motes: 6 },
    ],
  });

  it("is deterministic, and differs from the ungraded picture in every phase", () => {
    for (const phase of DAY_PHASES) {
      const once = hashFrame(draw(lit, { phase, time: 1234 }));
      expect(hashFrame(draw(lit, { phase, time: 1234 }))).toBe(once);
      expect(hashFrame(draw(lit, { phase, time: 1234 }, false))).not.toBe(once);
    }
  });

  it("animates nothing new: frozen frames stay identical under reduced motion", () => {
    for (const phase of DAY_PHASES) {
      expect(hashFrame(draw(lit, { phase, time: 0, reducedMotion: true }))).toBe(hashFrame(draw(lit, { phase, time: 9000, reducedMotion: true })));
    }
  });

  it("pools a lamp warm against a cool blue night, and never crushes the dark to black", () => {
    const frame = draw(room({ lights: [{ kind: "glow", at: [2, 2], radius: 1.5, strength: 0.6 }] }), { phase: "night" });
    const [r, , b] = at(frame, 2 * T, 2 * T), corner = at(frame, 4 * T - 2, 4 * T - 2);
    expect(r).toBeGreaterThan(b);
    expect(corner[2]).toBeGreaterThan(corner[0]);
    const unlit = at(draw(room({ size: [5, 4] }), { phase: "night" }), 4 * T + 2, 2);
    expect(unlit[2]).toBeGreaterThan(unlit[0]);
    expect(Math.min(...unlit)).toBeGreaterThan(0);
  });

  it("throws long shadows east at evening, round ones at midday", () => {
    // t/shadowed has rx 4: ungraded its shadow spans x c−4 … c+3.
    const one = room({ props: [{ sprite: "t/shadowed", at: [2, 2] }] }), c = 2 * T;
    const evening = draw(one, { phase: "evening" }), bare = draw(room(), { phase: "evening" });
    expect(at(evening, c + 6, c)).not.toEqual(at(bare, c + 6, c));
    expect(at(evening, c - 6, c)).toEqual(at(bare, c - 6, c));
    const midday = draw(one), bareMidday = draw(room());
    expect(at(midday, c + 6, c)).toEqual(at(bareMidday, c + 6, c));
    expect(at(midday, c, c)).not.toEqual(at(bareMidday, c, c));
  });

  it("never leaves a dark neutral grey neutral: the shade is coloured in every phase", () => {
    const chroma = ([r, g, b]: number[]) => Math.max(r, g, b) - Math.min(r, g, b);
    const greyRoom = room({ layers: [{ rows: ["abc."], legend: { a: "t/steel1", b: "t/stone1", c: "t/grey1" } }] });
    for (const phase of DAY_PHASES) greys.forEach((c, i) => {
      const graded = at(draw(greyRoom, { phase }), i * T + 4, 4), plain = at(draw(greyRoom, { phase }, false), i * T + 4, 4);
      expect(chroma(graded), `${phase} ${c} is coloured`).toBeGreaterThanOrEqual(10);
      expect(graded[2], `${phase} ${c} leans cool`).toBeGreaterThan(graded[1]);
      expect(graded[2] - graded[0], `${phase} ${c} cooler than ungraded`).toBeGreaterThan(plain[2] - plain[0]);
    });
  });

  it("keeps a face's tones distinct under a strong lantern, where the ungraded light merges them", () => {
    const distinct = (strength: number, phase: "evening" | "night", grade: boolean) => {
      const scene = room({ props: [{ sprite: "t/face", at: [2, 2] }], lights: [{ kind: "glow", at: [2, 2 - 2 / T], radius: 3, strength }] });
      const frame = draw(scene, { phase }, grade), y = 2 * T - 2;
      const tones = faceTones.map((_, i) => at(frame, 2 * T - faceTones.length + i * 2, y));
      let min = Infinity;
      for (let i = 0; i < tones.length; i++) for (let j = i + 1; j < tones.length; j++) min = Math.min(min, Math.hypot(...tones[i].map((v, k) => v - tones[j][k])));
      return { min, tones };
    };
    for (const phase of ["evening", "night"] as const) for (const strength of [0.6, 1.2, 1.8]) {
      const { min, tones } = distinct(strength, phase, true);
      expect(min, `${phase} at ${strength}: ${tones.map((t) => t.join(",")).join(" ")}`).toBeGreaterThanOrEqual(10);
      for (const t of tones) expect(Math.min(...t), `${phase} at ${strength}: no tone burns to white`).toBeLessThan(240);
    }
    // A night-market stall light: the ungraded tone curve has merged the face; the shoulder has not.
    expect(distinct(1.8, "night", true).min).toBeGreaterThan(3 * distinct(1.8, "night", false).min);
  });

  it("adds a halo round small glows after dark only", () => {
    const glow = room({ lights: [{ kind: "glow", at: [2, 2], radius: 1.5, strength: 0.6 }] });
    const centre = (phase: "morning" | "night", scene: Scene) => at(draw(scene, { phase }), 2 * T, 2 * T).reduce((a, v) => a + v, 0);
    // Morning: no halo, so the glow alone. Night: the halo lifts the centre above the pool's own light.
    const pool = (phase: "morning" | "night") => centre(phase, glow) - centre(phase, room());
    expect(pool("night")).toBeGreaterThan(pool("morning"));
  });
});
