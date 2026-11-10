/**
 * Bistro pieces for the French Concession shell: the palms and ferns, the gramophone, the enamel
 * sign, the calendar-girl poster, the ceiling fan's shadow, the brass bell and saucers, the little
 * chandelier and the easel board. Paris bones; the owners have lived in them for years.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art, autoOutline, cylinder } from "./_helpers.ts";

const BRASS: Color[] = ["gold1", "gold2", "gold3", "gold4", "gold5"];

/** Point on a quadratic curve. */
const quad = (a: readonly number[], c: readonly number[], b: readonly number[], t: number) =>
  [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]] as const;

/**
 * A pinnate frond: a midrib along a curve from `base` through `ctrl` to `tip`, with leaflets
 * hanging off both sides, longest near the base, drooping under their own weight. Leaflets on the
 * upper side catch the light; `shift` darkens the whole frond for the ones behind.
 */
function frond(
  p: Px, base: readonly number[], ctrl: readonly number[], tip: readonly number[],
  o: { len: number; shift?: number; ramp?: readonly Color[]; step?: number; droop?: number; start?: number },
) {
  const ramp = o.ramp ?? ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
  const tone = (t: number) => ramp[Math.max(0, Math.min(ramp.length - 1, t + (o.shift ?? 0)))];
  const steps = 40, droop = o.droop ?? 0.7;
  const pts = Array.from({ length: steps + 1 }, (_, i) => quad(base, ctrl, tip, i / steps));
  for (let i = Math.max(3, Math.round((o.start ?? 0) * steps)); i < steps; i += o.step ?? 2) {
    const [x, y] = pts[i], [x2, y2] = pts[i + 1];
    const tx = x2 - x, ty = y2 - y, n = Math.hypot(tx, ty) || 1;
    const t = i / steps, s0 = o.start ?? 0, L = o.len * (s0 ? Math.sin(Math.PI * Math.min(1, (t - s0) / (1 - s0) * 0.85 + 0.15)) : 1 - t * 0.65);
    for (const side of [1, -1]) {
      let nx = (-ty / n) * side, ny = (tx / n) * side;
      nx = nx * (1 - droop) + 0 * droop; ny = ny * (1 - droop) + 1 * droop;
      const m = Math.hypot(nx, ny) || 1;
      const ex = x + (nx / m) * L, ey = y + (ny / m) * L;
      p.line(Math.round(x), Math.round(y), Math.round(ex), Math.round(ey), tone(side > 0 ? 3 : 2));
      p.px(Math.round(ex), Math.round(ey), tone(side > 0 ? 4 : 2));
    }
  }
  for (let i = 0; i < steps; i++) p.line(Math.round(pts[i][0]), Math.round(pts[i][1]), Math.round(pts[i + 1][0]), Math.round(pts[i + 1][1]), tone(i < steps * 0.6 ? 1 : 2));
}

type V3 = readonly [number, number, number];
const v3 = {
  add: (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  scale: (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a: V3): V3 => { const m = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / m, a[1] / m, a[2] / m]; },
};

/**
 * The gramophone's morning-glory horn, modelled rather than painted so the flare reads in the
 * game's camera. A tube sweeps along a cubic spine (world east, north, up) from the tone arm's
 * elbow, its radius flaring hard near the mouth; every surface sample is projected the way the
 * room is drawn (screen y = base − up − 0.65·north), depth-tested, and shaded by the upper-left
 * sun into the brass ramp. Where the camera sees the inside of the tube, depth darkens it into the
 * throat. Returns a pixel map, built once: the horn does not animate.
 */
let hornCache: Map<number, Color> | undefined;
function hornPixels(): Map<number, Color> {
  if (hornCache) return hornCache;
  const P: V3[] = [[29.5, 0, 1.5], [29.5, 0, 11], [19, 4, 15.5], [14, -3, 18.5]];
  const at = (t: number): V3 => {
    const s = 1 - t;
    return [0, 1, 2].map((k) => s * s * s * P[0][k] + 3 * s * s * t * P[1][k] + 3 * s * t * t * P[2][k] + t * t * t * P[3][k]) as unknown as V3;
  };
  const tangent = (t: number): V3 => {
    const s = 1 - t;
    return [0, 1, 2].map((k) => 3 * s * s * (P[1][k] - P[0][k]) + 6 * s * t * (P[2][k] - P[1][k]) + 3 * t * t * (P[3][k] - P[2][k])) as unknown as V3;
  };
  const radius = (t: number) => 1.3 + 9.9 * Math.pow(t, 3.4);
  const view: V3 = v3.norm([0, 1, -0.65]);
  const sun: V3 = v3.norm([-0.55, 0.35, 0.75]);
  const W = 40, depth = new Float64Array(W * 40).fill(Infinity), neck = new Uint8Array(W * 40), soft = new Uint8Array(W * 40);
  const out = new Map<number, Color>();
  const T_STEPS = 360, A_STEPS = 260;
  for (let i = 0; i <= T_STEPS; i++) {
    const t = i / T_STEPS, c = at(t), d = tangent(t), T = v3.norm(d), len = Math.hypot(d[0], d[1], d[2]);
    const B1 = v3.norm(v3.cross(T, [0, 1, 0])), B2 = v3.cross(B1, T);
    const r = radius(t), dr = (radius(Math.min(1, t + 0.001)) - radius(Math.max(0, t - 0.001))) / 0.002 / len;
    for (let j = 0; j < A_STEPS; j++) {
      const a = (j / A_STEPS) * Math.PI * 2, radial = v3.add(v3.scale(B1, Math.cos(a)), v3.scale(B2, Math.sin(a)));
      const q = v3.add(c, v3.scale(radial, r));
      const x = Math.floor(q[0]), y = Math.floor(31 - q[2] - 0.65 * q[1]);
      if (x < 0 || y < 0 || x >= W || y >= 40) continue;
      const z = v3.dot(q, view);
      if (z >= depth[y * W + x]) continue;
      depth[y * W + x] = z;
      const n = v3.norm(v3.add(radial, v3.scale(T, -dr)));
      const outside = v3.dot(n, view) < 0;
      let tone: Color;
      if (outside) {
        // The narrow neck is polished tube and catches more light than the broad bell.
        const l = v3.dot(n, sun) + 0.25 * Math.max(0, Math.min(1, (0.75 - t) / 0.3));
        tone = l > 0.55 ? "gold5" : l > 0.2 ? "gold4" : l > -0.15 ? "gold3" : l > -0.5 ? "gold2" : "gold1";
      } else {
        // Inside the bell: lit wall near the lip, falling off into the throat.
        const l = -v3.dot(n, sun) + (t - 0.85) * 4;
        tone = t < 0.66 ? "ink2" : t < 0.78 ? "wood1" : l > 0.55 ? "gold3" : l > 0 ? "gold2" : "gold1";
      }
      // Soldered seams between the seven petals, only where the bell is wide enough to show them.
      const seam = r > 4.5 && t < 0.97 && Math.abs(((a / (Math.PI * 2 / 7)) % 1 + 1.5) % 1 - 0.5) * (Math.PI * 2 / 7) * r < 0.45;
      if (seam) tone = ({ gold5: "gold4", gold4: "gold3", gold3: "gold2", gold2: "gold1", gold1: "wood1" } as Partial<Record<Color, Color>>)[tone] ?? tone;
      out.set(y * W + x, tone);
      neck[y * W + x] = t < 0.62 ? 1 : 0;
      soft[y * W + x] = !outside && !seam ? 1 : 0;
    }
  }
  // Where the inside wall is seen edge-on, neighbouring pixels land on very different depths and
  // flicker between two tones; settle any lone pixel that disagrees with both horizontal neighbours.
  for (let k = 1; k < W * 40 - 1; k++) {
    const l = out.get(k - 1), m = out.get(k), r = out.get(k + 1);
    if (l && l === r && m && m !== l && soft[k]) out.set(k, l);
  }
  // The neck's sunlit left edge, a single bright line down the tube.
  for (let k = 0; k < W * 40; k++) if (neck[k] && k % W > 0 && !out.has(k - 1)) out.set(k, "gold4");
  // The rolled lip, two rings deep and drawn over everything: the mouth faces the room, so all of it
  // shows, and a solid lip keeps the inside and outside from blurring where they meet.
  {
    const c = at(1), T = v3.norm(tangent(1)), B1 = v3.norm(v3.cross(T, [0, 1, 0])), B2 = v3.cross(B1, T);
    for (let j = 0; j < 1440; j++) {
      const a = (j / 720) * Math.PI * 2, radial = v3.add(v3.scale(B1, Math.cos(a)), v3.scale(B2, Math.sin(a)));
      const q = v3.add(c, v3.scale(radial, radius(1) - (j < 720 ? 0.05 : 0.75)));
      const x = Math.floor(q[0]), y = Math.floor(31 - q[2] - 0.65 * q[1]);
      if (x < 0 || y < 0 || x >= W || y >= 40) continue;
      const l = v3.dot(radial, sun);
      out.set(y * W + x, l > 0.35 ? "gold5" : l > -0.15 ? "gold4" : l > -0.6 ? "gold3" : "gold2");
    }
  }
  hornCache = out;
  return out;
}

export default defineSprites({
  /**
   * A kentia palm in a hammered brass planter, a fixture since the French owners had the place.
   * The rim is rubbed bright where it gets dragged into the sun; lower down the brass has dulled
   * and grown verdigris, and one old frond has browned and dropped.
   */
  "decor/palm-brass": {
    w: 44, h: 74, anchor: [22, 73], foot: [-12, -6, 24, 6], shadow: { rx: 14, ry: 4, dy: -2 },
    draw: (p) => {
      // Planter: rolled rim, a body that tapers to a foot, ring handles.
      art(p, 9, 52, [
        ".bbbbbbbbbbbbbbbbbbbbbbbb.",
        "bBBBBBBBBBBBBBBBBBBBBBBbbb",
        "bddddddddddddddddddddddddb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbb",
      ], { b: "gold3", B: "gold5", d: "wood1" });
      p.hline(12, 54, 6, "oak1");
      cylinder(p, 9, 56, 26, 15, BRASS, (r) => (r >= 11 ? r - 10 : 0));
      p.over(() => {
        // Hammered dimples: a bright facet with a dark lip below-right, in staggered rows.
        for (let y = 57; y < 69; y += 3) for (let x = 10 + ((y / 3) % 2) * 2; x < 34; x += 4) {
          const here = p.get(x, y);
          if (!here) continue;
          const lit = here === "gold4" || here === "gold5";
          p.px(x, y, lit ? "gold5" : "gold4").px(x + 1, y + 1, lit ? "gold3" : "gold1");
        }
        // Verdigris creeping up from the foot.
        art(p, 22, 66, ["..j..j.", ".jJj.jj", "jjjJjjj", "jJjjjJj"], { j: "jade3", J: "jade4" });
        art(p, 11, 68, ["j..", "jj.", "jJj"], { j: "jade3", J: "jade4" });
        // A band of brighter brass at the shoulder where hands polish it.
        p.hline(10, 57, 20, "gold5");
      });
      p.rect(11, 71, 22, 1, "gold2").hline(12, 72, 20, "gold1");
      // Ring handles on lion-mask bosses.
      for (const x of [6, 35]) art(p, x, 58, [".gg.", "gGGg", "g..g", "g..g", ".gg."], { g: "gold2", G: "gold4" });
      autoOutline(p, { map: { gold: "wood1", oak: "wood1" } });
      // The palm grows behind the rim: fronds only land on empty pixels, and are left without an
      // outline so the leaflets stay a fine, airy fringe.
      p.under(() => {
      // Fronds, back to front: long arching ribs, leaflets hanging in a soft fringe.
        const o = { step: 3, droop: 0.6, start: 0.42 };
        frond(p, [22, 50], [12, 4], [0, 16], { len: 9, shift: -1, ...o });
        frond(p, [22, 50], [32, 4], [44, 16], { len: 9, shift: -1, ...o });
        frond(p, [22, 50], [20, 0], [32, 4], { len: 7, shift: -1, ...o });
        frond(p, [22, 50], [6, 24], [0, 42], { len: 7, ...o });
        frond(p, [22, 50], [38, 24], [44, 42], { len: 7, ...o });
        frond(p, [22, 50], [14, 16], [3, 28], { len: 8, shift: 1, ...o });
        frond(p, [22, 50], [30, 16], [41, 28], { len: 8, ...o });
      // The dead frond, hanging down over the rim.
        frond(p, [22, 52], [6, 44], [4, 58], { len: 4, ramp: ["wood1", "oak1", "oak2", "oak3", "oak4"], droop: 0.85 });
        // Stems rising from the soil.
        for (const x of [19, 21, 23, 25]) p.line(22, 54, x, 44, x < 22 ? "leaf2" : "leaf1");
      });
    },
  },

  /**
   * A Boston fern on a tall turned plant stand, the stand older than the fern. The fern sheds: dry
   * brown leaflets have collected on the stand's lower shelf, and one frond inside has died back.
   */
  "decor/fern-stand": {
    w: 40, h: 76, anchor: [20, 75], foot: [-9, -6, 18, 6], shadow: { rx: 11, ry: 3, dy: -1 },
    draw: (p) => {
      // Stand: a round top, three turned legs (two in front, one behind), a lower shelf.
      p.rect(19, 46, 2, 28, "wood1");
      for (const [x, dir] of [[11, -1], [27, 1]] as const) {
        for (let y = 44; y < 75; y++) {
          const xx = x + Math.round(((y - 44) / 30) * 2 * dir);
          p.px(xx, y, "wood3").px(xx + 1, y, "wood2");
          if (y === 52 || y === 53 || y === 70) p.px(xx, y, "wood4").px(xx + 1, y, "wood3").px(xx - 1, y, "wood2");
        }
      }
      art(p, 10, 61, [".ssssssssssssssssss.", "sSSSSSSSSSSSSSSSSSss", ".dddddddddddddddddd."], { s: "wood3", S: "wood4", d: "wood1" });
      // Shed leaflets on the lower shelf.
      art(p, 13, 61, ["b..bB...b.b.", ".b.....B...."], { b: "oak2", B: "oak3" });
      art(p, 8, 41, [
        "..wwwwwwwwwwwwwwwwwwww..",
        ".wWWWWWWWWWWWWWWWWWWWWw.",
        "wWWWWWWWWWWWWWWWWWWWWWww",
        "wwwwwwwwwwwwwwwwwwwwwwww",
        ".dddddddddddddddddddddd.",
      ], { w: "wood3", W: "wood5", d: "wood1" });
      // The pot: majolica green, a raised leaf band.
      cylinder(p, 12, 32, 16, 9, ["jade1", "jade2", "jade3", "jade4", "jade5"], (r) => (r >= 7 ? 1 : 0));
      p.hline(12, 32, 16, "jade4").hline(12, 33, 16, "jade2");
      p.over(() => { for (let x = 13; x < 27; x += 3) art(p, x, 36, [".l", "lL"], { l: "jade4", L: "jade5" }); });
      // Fronds: arching up and spilling down, back ones darker; one dead frond inside.
      const fronds: [number[], number[], number[], number][] = [
        [[20, 33], [10, 8], [3, 18], -1], [[20, 33], [30, 8], [37, 18], -1], [[20, 33], [18, 2], [22, 4], -1],
        [[20, 33], [4, 16], [1, 44], 0], [[20, 33], [36, 16], [39, 46], 0], [[20, 33], [12, 18], [6, 38], 1],
        [[20, 33], [28, 18], [34, 38], 0], [[20, 33], [16, 12], [12, 8], 1], [[20, 33], [24, 12], [29, 9], 1],
        [[20, 33], [8, 28], [6, 56], 0], [[20, 33], [33, 28], [35, 54], 0],
      ];
      for (const [b, c, t, shift] of fronds) frond(p, b, c, t, { len: 3, shift, step: 1, droop: 0.55, ramp: ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"] });
      frond(p, [20, 33], [22, 20], [26, 22], { len: 2, step: 1, ramp: ["wood1", "oak1", "oak2", "oak3", "oak4"] });
      autoOutline(p, { map: { leaf: "leaf1", oak: "wood1", jade: "jade1" } });
    },
  },

  /**
   * The gramophone in the corner, brought from a flea market on Fuxing Road. Its seven-petal brass
   * horn rises from the tone arm's elbow and turns its bell to the room; the bell has a dent in its
   * shaded flank, and verdigris has crept up under it where the polishing cloth never reaches. A
   * short stack of records in paper sleeves leans against the cabinet. Four
   * frames at 6 fps: the record turns (the label's mark goes round; the shine on the vinyl stays).
   */
  "decor/gramophone": {
    w: 40, h: 62, anchor: [22, 61], foot: [-14, -10, 28, 10], shadow: { rx: 15, ry: 4, dy: -2 },
    frames: 4, fps: 6,
    draw: (p, frame) => {
      // Cabinet: a lid top, then a panelled front with a brass keyhole.
      art(p, 8, 34, [
        ".tttttttttttttttttttttttttt.",
        "tTTTTTTTTTTTTTTTTTTTTTTTTttt",
        "tTTTTTTTTTTTTTTTTTTTTTTTTttt",
        "tTTTTTTTTTTTTTTTTTTTTTTTTttt",
        "tttttttttttttttttttttttttttt",
      ], { t: "rose3", T: "rose4" });
      p.rect(8, 39, 28, 20, "rose2").vline(8, 39, 20, "rose3").vline(35, 39, 20, "rose1").hline(8, 39, 28, "rose3");
      p.frame(11, 42, 22, 14, "rose1").hline(12, 43, 20, "rose3").vline(12, 43, 12, "rose3");
      p.over(() => { for (const [x, y, n] of [[14, 46, 9], [18, 50, 11], [13, 53, 7]] as const) p.hline(x, y, n, "rose3"); });
      art(p, 21, 47, ["g", "G", "g"], { g: "gold2", G: "gold4" });
      p.rect(10, 59, 3, 2, "rose1").rect(31, 59, 3, 2, "rose1");
      // The crank on the right side.
      art(p, 36, 42, ["g..", "gGG", "..G", "..k"], { g: "gold2", G: "gold4", k: "ink2" });
      // Turntable and record.
      p.ellipse(22, 37, 11, 4, "steel3");
      p.ellipse(22, 36.5, 10, 3.5, "ink2");
      p.over(() => {
        p.hline(15, 36, 14, "ink").hline(17, 35, 10, "ink");
        p.hline(13, 37, 3, "steel2").hline(14, 35, 3, "steel3");
      });
      // Label, with a mark that goes round.
      p.ellipse(22, 36.5, 3, 1.5, "jade4");
      const mark: [number, number][] = [[21, 35], [24, 36], [23, 37], [20, 36]];
      p.px(mark[frame][0], mark[frame][1], "cream5").px(22, 36, "ink");
      // Tone arm, brass, from the back right onto the record.
      art(p, 26, 31, ["...gg", "..gG.", ".gg..", "gg...", "s...."], { g: "gold3", G: "gold5", s: "steel4" });
      autoOutline(p, { map: { rose: "rose1", gold: "wood1", steel: "steel1", ink: "ink" } });
      // The horn: a brass morning glory rising from the back, its bell open toward the room.
      for (const [k, c] of hornPixels()) p.px(k % 40, Math.floor(k / 40), c);
      // The sleeve where the neck is fitted onto the tone arm's elbow.
      art(p, 27, 28, ["34442", "23321"], { 1: "gold1", 2: "gold2", 3: "gold3", 4: "gold4" });
      // The flea-market dent in the bell's shaded flank: a dark upper-left wall, a lit lower lip.
      art(p, 22, 14, ["11.", "1.4", ".44"], { 1: "gold1", 4: "gold4" });
      // Verdigris under the bell where the neck joins, the place a polishing cloth never reaches.
      art(p, 27, 23, [".j.", "jJj", ".jj"], { j: "jade3", J: "jade4" });
      autoOutline(p, { map: { gold: "wood1", rose: "rose1", jade: "jade1", cream: "ink2", steel: "steel1" } });
      // Records in sleeves leaning on the cabinet's left side.
      art(p, 2, 44, [
        "..cc...",
        ".cCcb..",
        ".cCcbb.",
        "cCccbb.",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cCccbbk",
        "cccccbk",
        ".kkkkk.",
      ], { c: "oak4", C: "oak5", b: "cream3", k: "wood1" });
    },
  },

  /**
   * A vintage enamel advertising sign, screwed to the wall long before this shop: a cobalt field
   * inside a cream rule, rounded corners, chipped back to black iron and rust at the edges and
   * round two of its four screws. Blank for the DOM: overlay rectangle x 6–33, y 6–21 (28×16).
   * Wall art, anchored at its top centre.
   */
  "decor/enamel-sign": {
    w: 40, h: 28, anchor: [20, 0], layer: "floor",
    draw: (p) => {
      // The plate, its corners rounded, the enamel bulging a little to catch the light.
      p.rect(2, 0, 36, 28, "blue2").rect(0, 2, 40, 24, "blue2").rect(1, 1, 38, 26, "blue2");
      p.over(() => {
        p.rect(1, 1, 37, 2, "blue3").rect(1, 1, 2, 25, "blue3");
        p.hline(3, 1, 20, "blue4");
        p.rect(38, 2, 1, 24, "blue1").hline(2, 26, 36, "blue1");
      });
      // Cream rule, inset.
      p.frame(4, 4, 32, 20, "cream4");
      p.hline(4, 4, 32, "cream5").vline(4, 4, 20, "cream5");
      // Screws, slotted brass, two of them rusted in their holes.
      for (const [x, y] of [[2, 2], [36, 2], [2, 24], [36, 24]] as const) art(p, x, y, ["sS", "Ss"], { s: "steel3", S: "steel5" });
      art(p, 35, 22, ["o.oo", "oKko", ".kKo", "oooo"].map((r) => r), { o: "orange1", k: "ink2", K: "rose1" });
      art(p, 1, 23, ["oo..", "kKo.", "kko.", "oo.."], { o: "orange1", k: "ink2", K: "rose1" });
      // Chips along the edges, iron black with a rust ring.
      for (const [x, y, rows] of [
        [12, 0, ["okko", ".oo."]], [27, 26, [".oo.", "okko"]], [0, 12, ["o.", "ko", "ko", "o."]], [38, 9, [".o", "ok", ".o"]], [20, 0, ["oko"]],
      ] as const) art(p, x, y, rows, { o: "orange1", k: "ink2" });
      // A rust run streaked down from the lower right screw.
      p.vline(37, 26, 2, "orange1");
      p.outline("ink2", { sides: ["bottom", "right"] });
    },
  },

  /**
   * A framed calendar-girl poster from a 1930s cigarette company, all shapes and colour (the
   * company's name and the months were text, so they are left as abstract blocks): a woman in a
   * jade qipao with a folding fan, finger-waved hair, a pastel garden behind. The bottom corner
   * has rippled where damp got under the glass. Wall art, anchored at the nail.
   */
  "decor/poster-frame": {
    w: 32, h: 50, anchor: [16, 0], layer: "floor",
    draw: (p) => {
      art(p, 15, 0, ["nN"], { n: "steel2", N: "steel4" });
      p.line(15, 1, 4, 3, "gold2").line(16, 1, 27, 3, "gold2");
      // Thin gilt frame.
      p.rect(1, 3, 30, 46, "gold3").hline(1, 3, 30, "gold5").vline(1, 3, 46, "gold4").hline(1, 48, 30, "gold1").vline(30, 3, 46, "gold2");
      p.rect(3, 5, 26, 42, "cream4");
      // Pastel sky fading to a garden: a willow edge, a pink blossom bough.
      p.rect(3, 5, 26, 12, "blue5").rect(3, 17, 26, 10, "blue6").rect(3, 27, 26, 12, "jade6");
      art(p, 3, 5, ["pP.p", ".pPp", "p.pP", "..p."], { p: "pink3", P: "pink2" });
      art(p, 23, 22, ["...l..", "..ll.l", ".l.ll.", "l..l..", "...l.."], { l: "jade4" });
      // The woman: hair, face, qipao, fan.
      art(p, 9, 8, [
        "....hhhh....",
        "...hHhhhh...",
        "..hHhhhhhh..",
        "..hhsssshh..",
        "..hsSSSSsh..",
        "..hSkSSkSh..",
        "...SSSSSS...",
        "...sSrrSs...",
        "....ssss....",
        ".....ss.....",
        "...jjJJjj...",
        "..jJJjJJjj..",
        ".jJJjfJJjjj.",
        ".jJjfFfJjjjs",
        ".jJjjfJjjjSs",
        "..jJjjJjjjs.",
        "..jJjjJjjj..",
        "..jJjjJjjj..",
        "..jJjjJjjj..",
        "..jJjJJjjj..",
        "..jJjJJjjj..",
        "..jJsJJjjj..",
        "..jJsJJjjj..",
        "..jJjJJjjj..",
        "..jjjjjjjj..",
        "...ss..ss...",
      ], { h: "hair1", H: "hair3", s: "skin3", S: "skin4", k: "ink", r: "red3", j: "jade3", J: "jade4", f: "pink3", F: "pink2" });
      // The folding fan held up beside her, open.
      art(p, 18, 15, [".cCcC", "cCcCc", ".cCc.", "..g.."], { c: "cream5", C: "pink3", g: "wood2" });
      // Where the name and the twelve months were: abstract blocks only.
      p.rect(3, 39, 26, 8, "cream3");
      for (let x = 5; x < 27; x += 4) p.rect(x, 41, 3, 2, "rose3").rect(x, 44, 3, 1, "cream2");
      // Damp ripple in the bottom corner.
      p.over(() => art(p, 22, 39, ["..d...", ".d.d..", "d...dd", ".d...d", "..ddd."], { d: "oak3" }));
      // Glass glare.
      p.faded(0.4, () => p.line(5, 30, 13, 6, "white"));
      p.outline("cream1", { sides: ["bottom", "right"] });
    },
  },

  /**
   * The soft shadow the ceiling fan throws on the floor in the morning light: four blades and a hub,
   * foreshortened, translucent. Four frames at 8 fps turn it a quarter of a blade, seamless.
   * Floor art, anchored at the centre of the hub's shadow.
   */
  "decor/ceiling-fan-shadow": {
    w: 64, h: 32, anchor: [32, 16], layer: "floor", frames: 4, fps: 8,
    draw: (p, frame) => {
      const cx = 32, cy = 16;
      for (let y = 0; y < 32; y++) for (let x = 0; x < 64; x++) {
        const dx = (x + 0.5 - cx) / 30, dy = (y + 0.5 - cy) / 14, r = Math.hypot(dx, dy);
        if (r > 1) continue;
        const a = Math.atan2(dy, dx) / (Math.PI * 2) + 1 - frame / 16;
        const k = ((a * 4) % 1 + 1) % 1;
        // A blade is a wedge, widening toward its tip, with soft edges.
        const half = 0.06 + r * 0.06, edge = Math.abs(k - 0.5);
        const core = r < 0.12;
        if (core) p.faded(0.26, () => p.px(x, y, "ink"));
        else if (r > 0.18 && edge < half) p.faded(edge < half * 0.6 ? 0.22 : 0.11, () => p.px(x, y, "ink"));
      }
    },
  },

  /**
   * The brass service bell on the counter. Nobody is allowed to ring it twice; the dome is rubbed
   * bright on top, and the black base has chipped at one corner to show the wood.
   */
  "decor/bell-counter": {
    w: 16, h: 14, anchor: [8, 13], foot: [-6, -3, 12, 3], shadow: { rx: 6, ry: 2, dy: -1 },
    draw: (p) => {
      // Base: a black disc, foreshortened, with its front edge.
      p.ellipse(8, 10, 7, 2.5, "ink2");
      p.rect(1, 10, 14, 2, "ink");
      p.hline(2, 9, 6, "steel1");
      art(p, 12, 10, ["ww", "w."], { w: "wood3" });
      // Dome.
      for (let y = 2; y < 11; y++) for (let x = 2; x < 14; x++) {
        const u = (x + 0.5 - 8) / 5.5, v = (y + 0.5 - 10) / 7;
        const d = u * u + v * v;
        if (d > 1 || y > 9) continue;
        const l = -0.6 * u - 0.7 * v + 0.3 * Math.sqrt(1 - d);
        p.px(x, y, l > 0.85 ? "gold5" : l > 0.55 ? "gold4" : l > 0.2 ? "gold3" : "gold2");
      }
      // The room's window, tiny, in the dome; the plunger knob on top.
      art(p, 5, 5, ["ww", "w."], { w: "white" });
      art(p, 7, 0, ["kk", "ss"], { k: "ink2", s: "steel4" });
      autoOutline(p, { map: { gold: "wood1", ink: "ink", steel: "steel1", wood: "wood1", white: "wood1" } });
    },
  },

  /**
   * Saucers for the coffee the regulars order after their soy milk: white with a gold rim, stacked a
   * little crooked. One in the middle is a blue-and-white stray from the Chinese set, and the top
   * one has a chip in its rim.
   */
  "decor/saucer-stack": {
    w: 22, h: 15, anchor: [11, 14], foot: [-8, -3, 16, 3], shadow: { rx: 8, ry: 2, dy: -1 },
    draw: (p) => {
      // Six saucers, each a pixel off the last: a white edge, a gold line, a shadow under it.
      const offsets = [0, 1, 0, -1, 0, 1];
      offsets.forEach((dx, i) => {
        const y = 11 - i * 2, stray = i === 2;
        p.ellipse(10 + dx, y + 0.5, 8, 2, stray ? "blue2" : "cream3");
        p.hline(3 + dx, y, 14, stray ? "blue4" : "white").hline(4 + dx, y + 1, 12, stray ? "blue2" : "cream3");
        if (!stray) p.hline(6 + dx, y + 1, 8, "gold4");
      });
      // The top saucer: its rim, gold line and well.
      p.ellipse(10 + 1, 1.8, 8, 2, "white");
      p.ellipse(11, 1.8, 4, 1, "cream4");
      p.over(() => { p.hline(5, 0, 12, "gold4"); p.hline(5, 3, 12, "gold3"); p.px(3, 2, "gold4").px(18, 2, "gold2"); });
      // The chip.
      p.px(16, 0, null).px(15, 0, "cream2");
      autoOutline(p, { map: { cream: "cream1", white: "cream1", gold: "cream1", blue: "blue1" } });
    },
  },

  /**
   * The small brass pendant over the counter: three curled arms with frosted tulip shades, one shade
   * a slightly different replacement, a tangle of fly-paper string still tied to the chain.
   * It hangs over everyone (layer `over`); anchor at the ceiling rose.
   */
  "decor/chandelier-small": {
    w: 40, h: 38, anchor: [20, 0], layer: "over",
    draw: (p) => {
      // Ceiling rose and chain.
      art(p, 16, 0, ["gGGGGGgg", ".gggggg."], { g: "gold2", G: "gold4" });
      for (let y = 2; y < 14; y++) p.px(20, y, y % 2 ? "gold3" : "gold2").px(19, y, y % 2 ? "gold4" : null);
      // Body: a turned brass urn.
      art(p, 16, 13, [
        "..gGGg..",
        ".gGGGgg.",
        "gGGgggg2",
        "gGggggg2",
        ".gGggg2.",
        "..gg22..",
        "...g2...",
      ], { g: "gold3", G: "gold5", 2: "gold2" });
      // Arms: S-curves out to the cups.
      const arm = (pts: readonly (readonly [number, number])[]) => { for (let i = 0; i + 1 < pts.length; i++) p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], "gold3"); };
      arm([[16, 16], [11, 15], [7, 17], [6, 21]]);
      arm([[23, 16], [28, 15], [32, 17], [33, 21]]);
      arm([[20, 19], [20, 22], [19, 24]]);
      p.over(() => { p.line(11, 15, 7, 16, "gold5"); p.line(23, 15, 28, 14, "gold4"); });
      // Cups and frosted tulip shades, lit a little warm from inside.
      const shade = (x: number, y: number, replacement: boolean) => {
        art(p, x, y, ["..gGg..", ".ggggg."], { g: "gold2", G: "gold4" });
        art(p, x, y + 2, [
          ".wWWWw.",
          "wWWWWWw",
          "wWWyWWc",
          "wWyyyWc",
          "wWWyWcc",
          ".wWWcc.",
          "..ccc..",
        ], { w: replacement ? "cream4" : "cream5", W: "white", y: "gold5", c: replacement ? "cream2" : "cream3" });
      };
      shade(3, 21, false);
      shade(30, 21, true);
      shade(16, 24, false);
      autoOutline(p, { map: { gold: "wood1", cream: "cream1", white: "cream1" } });
      // Fly-paper string still tied to the chain.
      art(p, 21, 6, ["s.", ".s", ".s", "s.", ".s"], { s: "cream3" });
      // Warm glow round the shades.
      p.under(() => p.faded(0.25, () => { for (const [x, y] of [[6, 27], [33, 27], [19, 30]] as const) p.ellipse(x + 0.5, y, 6, 5, "gold5"); }));
    },
  },

  /**
   * The specials easel by the door: a black-framed board on a folding wooden A-frame, chalk dust on
   * the ledge and a rag hooked over one corner. Blank for the DOM menu: overlay rectangle
   * x 6–25, y 7–34 (20×28). The old wall chalkboard stays for the kitchen side.
   */
  "decor/easel-board": {
    w: 32, h: 58, anchor: [16, 57], foot: [-10, -5, 20, 5], shadow: { rx: 11, ry: 3, dy: -2 },
    draw: (p) => {
      // Rear leg behind, then the two front legs splayed.
      p.line(16, 2, 17, 50, "wood2");
      p.line(9, 30, 4, 56, "wood3").line(10, 30, 5, 56, "wood2");
      p.line(23, 30, 27, 56, "wood3").line(22, 30, 26, 56, "wood4");
      // A chain between the legs to stop them spreading.
      for (let x = 8; x < 25; x += 2) p.px(x, 48, "steel3");
      // Board: black frame, slate face, ghosts of old menus.
      p.rect(3, 4, 26, 34, "ink").frame(3, 4, 26, 34, "ink2").hline(3, 4, 26, "steel2").vline(3, 4, 34, "steel1");
      p.rect(6, 7, 20, 28, "jade1");
      p.over(() => {
        for (const [x, y, n] of [[8, 10, 13], [9, 15, 11], [8, 20, 15], [10, 25, 10], [8, 30, 12]] as const) p.hline(x, y, n, "jade2");
        // A chalk flourish in the corners, decoration only.
        art(p, 6, 7, ["ccc", "c..", "c.."], { c: "steel4" });
        art(p, 23, 32, ["..c", "..c", "ccc"], { c: "steel4" });
      });
      // Ledge with chalk dust and a stub.
      p.rect(2, 38, 28, 2, "wood4").hline(2, 38, 28, "wood5").hline(2, 40, 28, "wood2");
      p.over(() => p.hline(8, 38, 9, "cream4"));
      art(p, 20, 37, ["wwC"], { w: "white", C: "cream3" });
      // The rag over the top right corner.
      art(p, 23, 2, [".rRr.", "rRRrr", "rRr.r", ".r..r", "....r"], { r: "cream3", R: "cream5" });
      autoOutline(p, { map: { wood: "wood1", ink: "ink", jade: "ink", cream: "ink2", white: "ink2", steel: "ink" } });
    },
  },
});
