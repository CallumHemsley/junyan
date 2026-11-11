/**
 * The shared cat: one body, posed and animated the same for every cat in the game, wearing a
 * `Coat` (fur tones, markings, eyes, tail). `critter/cat-tabby`, `critter/cat-white` and
 * `critter/cat-black` are coats on it, so they share scale, anchors and timing exactly.
 *
 * Actions `idle` (sitting, tail flick, blink, ear twitch), `walk`, `sleep`, in `down`, `right` and
 * `left` (mirrored). Walk-through actors anchored where the cat touches the ground.
 *
 * Fur legend: `L` lit fur, `A` fur, `a` shaded fur, `d`/`D` tabby marks, `u`/`U` muzzle, `w`/`W`
 * chest, `S`/`s` sock, `g`/`G` the cat's right eye (screen left from the front, the near eye in
 * profile), `e`/`E` its left eye, `k` pupils, `n` nose, `p` inner ear, `m` mouth, `h` whiskers.
 */
import type { Color, Legend, Px, SpriteSet } from "../../kit/index.ts";
import { art, blob, defineCritter } from "./_helpers.ts";

export type Coat = {
  fur: Legend;
  /** Body tones, lit to shaded. */
  tones: readonly [Color, Color, Color, Color];
  outline: Color;
  /** Tail top and underside, and the same on its rings. */
  tail: readonly [Color, Color, Color, Color];
  /** The last points of the tail in other colours (top, underside), tip last. */
  tip?: readonly (readonly [Color, Color])[];
  /** Mackerel stripes over the body (a tabby). */
  stripes?: boolean;
  /** The left ear tipped flat (a neutered street cat). */
  tippedEar?: boolean;
  /** Cheek tufts. */
  fluffy?: boolean;
  /** Chest markings: sitting facing the camera, sitting in profile, walking toward the camera. */
  chest?: { sit?: readonly string[]; side?: readonly string[]; walk?: readonly string[] };
};

/** Mackerel stripes over the fur already drawn in a region (tabby coats only): each stripe one tone darker. */
function stripes(c: Coat, p: Px, x0: number, y0: number, w: number, h: number, on: (x: number, y: number) => boolean) {
  if (!c.stripes) return;
  const darker: Partial<Record<string, Color>> = { stone5: "stone3", stone4: "stone2", stone3: "stone1", stone2: "stone1" };
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    const c = p.get(x, y);
    if (c && darker[c] && on(x, y)) p.px(x, y, darker[c]!);
  }
}

/** A tail as a chain of points, two pixels thick, lit along its top, ringed on a tabby; the last points may be a different tip. */
function tail(c: Coat, p: Px, points: readonly [number, number][]) {
  const [top, under, ringTop, ringUnder] = c.tail;
  points.forEach(([x, y], i) => {
    const ring = i % 3 === 2, tip = c.tip && i >= points.length - c.tip.length;
    const [t, u] = tip ? c.tip![i - (points.length - c.tip!.length)] : ring ? [ringTop, ringUnder] : [top, under];
    p.px(x, y, t);
    p.px(x, y + 1, u);
  });
}

// ── heads ──────────────────────────────────────────────────────────────────

/** Facing the camera, 14×11. The left ear (screen right) is tipped flat. */
function headFront(c: Coat, p: Px, x: number, y: number, eyes: "open" | "half" | "shut", twitch = false) {
  const eye = { open: ["Gk", "gk"], half: ["LL", "gk"], shut: ["LL", "kk"] }[eyes];
  const eyeR = { open: ["ke", "ke"], half: ["AA", "ke"], shut: ["AA", "kk"] }[eyes];
  art(p, x, y, [
    twitch ? "............" : "..L...........",
    twitch ? ".LL.......aaa." : ".LL.......aaa.",
    ".LpL.....aApa.",
    "LLpLLAAAAAApaa",
    "LLLdLdAdAAAAaa",
    "LLLLdLLdAAAAaa",
    `L${eye[0]}LLLAAA${eyeR[0]}aa`,
    `L${eye[1]}LuuuuU${eyeR[1]}aa`,
    "LLuuuunnuuuuaa",
    ".Luuuummuuuua.",
    "..uuuuuuuuuu..",
  ], c.fur);
  if (twitch) art(p, x, y, ["..L.", ".LLL"], c.fur);
  if (!c.tippedEar) art(p, x + 11, y, ["a"], c.fur);
  // A fluffy coat stands out in tufts at the cheeks.
  if (c.fluffy) { art(p, x - 1, y + 7, ["L.", "LL", "L."], c.fur); art(p, x + 13, y + 7, [".a", "aa", ".a"], c.fur); }
}

/** Profile facing right, 11×10: ear up, the M on the brow, the muzzle pointing right. */
function headSide(c: Coat, p: Px, x: number, y: number, eyes: "open" | "shut", earBack = false) {
  art(p, x, y, [
    earBack ? "..........." : "....LA.....",
    earBack ? "...LLA....." : "...LpA.....",
    "..LLpAA....",
    ".LLdLdAAa..",
    "LLLLdAAAAa.",
    `LLLLL${eyes === "open" ? "Gk" : "AA"}AAa.`,
    `LLLLL${eyes === "open" ? "gk" : "kk"}AAAa`,
    ".LLLuuuuuun",
    "..aUuuuumu.",
    "...aUUUU...",
  ], c.fur);
}

// ── sitting ────────────────────────────────────────────────────────────────

const TAIL_SIT_FRONT: readonly (readonly [number, number][])[] = [
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [16, 16], [16, 15], [17, 14]],
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [17, 16], [18, 15], [18, 14]],
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [16, 16], [15, 15], [15, 14]],
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [17, 16], [17, 15], [16, 14]],
];

function sitFront(c: Coat, p: Px, frame: number) {
  tail(c, p, TAIL_SIT_FRONT[frame]);
  blob(p, 10, 20.5, 7, 4.8, c.tones);
  blob(p, 10, 14.5, 4.8, 5.5, c.tones);
  stripes(c, p, 0, 15, 20, 10, (x, y) => Math.abs(x - 9.5) > 3 && (y + Math.floor(Math.abs(x - 9.5) / 2)) % 3 === 0);
  // Chest, then the forelegs (a tabby has a white sock on her left, screen right).
  art(p, 8, 12, c.chest?.sit ?? [".ww.", "wwww", "wwwW", "wwwW", ".wW.", ".wW."], c.fur);
  art(p, 6, 17, [
    ".LA....AA.",
    ".LA....Aa.",
    ".dA....Da.",
    ".LA....SS.",
    ".LA....SS.",
    ".dA....SS.",
    "LLAA..SSSs",
  ], c.fur);
  headFront(c, p, 3, 2, frame === 2 ? "half" : "open", frame === 3);
  p.outline(c.outline);
  // Whiskers.
  art(p, 1, 10, ["h.", ".h"], c.fur);
  art(p, 17, 10, [".h", "h."], c.fur);
}

/** The tail lies along the ground round her front feet; the kinked tip lifts and settles. */
const TAIL_SIT_SIDE: readonly (readonly [number, number][])[] = [
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 23], [13, 22], [14, 22], [15, 21]],
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 23], [13, 23], [14, 22], [15, 22]],
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 22], [13, 21], [13, 20], [14, 19]],
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 23], [13, 22], [14, 21], [15, 21]],
];

function sitSide(c: Coat, p: Px, frame: number) {
  blob(p, 8, 19.5, 6.5, 5, c.tones);
  blob(p, 12.5, 14.5, 4, 6, c.tones);
  // Hoops round the haunch, and bars down the back of the neck.
  stripes(c, p, 0, 9, 18, 16, (x, y) => (x >= 11 ? y % 3 === 0 && y > 12 && y < 18 : x % 3 === 1 && y > 14 && y < 23 && x > 1));
  // Foreleg straight down, the white sock out of sight on the far side.
  art(p, 13, 17, ["LAa", "LAa", "dAa", "LAa", "LAa", "dAa", "LLAa"], c.fur);
  // Buff chest under the chin.
  art(p, 15, 11, c.chest?.side ?? ["ww", "wW", "wW", ".W"], c.fur);
  tail(c, p, TAIL_SIT_SIDE[frame]);
  headSide(c, p, 10, 2, frame === 2 ? "shut" : "open", frame === 3);
  p.outline(c.outline);
  art(p, 21, 10, ["h"], c.fur);
}

// ── walking ────────────────────────────────────────────────────────────────

/** Legs in profile for one frame: [x of each leg's foot, lifted?], near legs drawn lighter. */
const STRIDE: readonly (readonly [number, number, number, number])[] = [
  [5, 9, 18, 22], // contact: back legs apart, front legs apart
  [7, 8, 20, 20], // passing
  [9, 5, 22, 18], // contact, the other pair forward
  [8, 7, 20, 20], // passing
];

function walkSide(c: Coat, p: Px, frame: number) {
  const bob = frame % 2 === 1 ? -1 : 0;
  const [backFar, backNear, frontFar, frontNear] = STRIDE[frame];
  // Far legs first, a step darker.
  for (const fx of [backFar, frontFar]) art(p, fx, 13 + bob, ["aa", "aa", "aD", "aa", "aa", fx === frontFar ? "Ss" : "aa"].slice(0, 6 - bob), c.fur);
  // The kinked tail, held up and curving back.
  tail(c, p, [[4, 9 + bob], [3, 8 + bob], [2, 7 + bob], [2, 6 + bob], [2, 5 + bob], [2, 4 + bob], [3, 3 + bob], [3, 2 + bob], [4, 2 + bob]]);
  blob(p, 14, 10.5 + bob, 10, 4.2, c.tones);
  stripes(c, p, 4, 6 + bob, 20, 9, (x) => x % 3 === 0 && x > 6 && x < 21);
  for (const fx of [backNear, frontNear]) art(p, fx, 13 + bob, ["LA", "LA", "dA", "LA", "LA", "LA"].slice(0, 6 - bob), c.fur);
  headSide(c, p, 20, 1 + bob + (frame % 2 === 0 ? 1 : 0), "open");
  p.outline(c.outline);
  art(p, 31, 10 + bob, ["h"], c.fur);
}

/** Coming toward the camera: head high, shoulders rolling, the tail held up behind. */
function walkFront(c: Coat, p: Px, frame: number) {
  const bob = frame % 2 === 1 ? -1 : 0;
  // The tail flag behind, swaying with the stride.
  const sway = [0, 1, 0, -1][frame];
  tail(c, p, [[8 + sway, 10], [8 + sway, 9], [8 + sway, 8], [9 + sway, 7], [9 + sway, 6], [10 + sway, 5]]);
  blob(p, 8, 15 + bob, 5.5, 4.5, c.tones);
  stripes(c, p, 0, 10, 16, 12, (x, y) => Math.abs(x - 7.5) > 2.5 && (y + Math.floor(Math.abs(x - 7.5) / 2)) % 3 === 0);
  art(p, 6, 13 + bob, c.chest?.walk ?? [".ww.", "wwwW", ".wW."], c.fur);
  // Forelegs: the leading paw lower and larger.
  const lead = frame === 0 ? "left" : frame === 2 ? "right" : null;
  art(p, 4, 17 + bob, ["LA", "LA", "dA", "LA", "LA", "LL"].slice(0, lead === "left" ? 6 : 5 - bob), c.fur);
  art(p, 10, 17 + bob, ["Aa", "Aa", "Da", "SS", "SS", "SS"].slice(0, lead === "right" ? 6 : 5 - bob), c.fur);
  headFront(c, p, 1, 3 + bob, "open");
  p.outline(c.outline);
}

// ── sleeping ───────────────────────────────────────────────────────────────

/** Curled nose to tail in a sun patch; the flank rises and falls, an ear flicks on the last frame. */
function sleepCurl(c: Coat, p: Px, frame: number) {
  const lift = [0, 0.5, 1, 1, 0.5, 0][frame];
  blob(p, 13, 10 + (lift ? -lift / 2 : 0), 12, 7.5 + lift / 2, c.tones);
  stripes(c, p, 0, 0, 28, 18, (x, y) => {
    const t = Math.atan2(y + 0.5 - 10, x + 0.5 - 13);
    return Math.round(t * 5) % 2 === 0 && y < 11 && x < 20;
  });
  // The tail round the front with its kinked tip by her nose.
  tail(c, p, [[3, 13], [4, 14], [5, 15], [6, 15], [7, 15], [8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14, 14], [15, 14], [16, 13]]);
  // The head tucked down on the right, eyes shut.
  art(p, 15, 4, [
    frame === 5 ? "........." : "..L...a..",
    frame === 5 ? ".LL...aa." : ".LpL.apa.",
    "LLLdLdAAa",
    "LLLLdAAaa",
    "LkkLLAkka",
    "LLuunuuAa",
    ".LuuuuuA.",
    "..uuuu...",
  ], c.fur);
  p.outline(c.outline);
}

/** Stretched out on her side, belly to the sun, paws reaching; a slow breath. */
function sleepSide(c: Coat, p: Px, frame: number) {
  const lift = [0, 0, 1, 1][frame];
  // Legs out toward the camera, the white sock on top.
  art(p, 18, 10, ["SSa...", "SSSa..", ".SSa.."], c.fur);
  art(p, 21, 9, ["LLA..", "LLAa.", ".LLA."], c.fur);
  art(p, 6, 10, ["LAa..", "LLAa.", ".LLAa"], c.fur);
  art(p, 9, 11, ["LAa", "LLAa", ".LAa"], c.fur);
  blob(p, 14, 7.5 - lift / 2, 10, 4 + lift / 2, c.tones);
  stripes(c, p, 4, 2, 21, 9, (x, y) => x % 3 === 1 && y < 8);
  // Pale belly along the bottom.
  art(p, 9, 10, ["uuuuuuuuuu"], c.fur);
  tail(c, p, [[4, 8], [3, 9], [2, 10], [1, 10], [0, 9]]);
  headSide(c, p, 22, 1, "shut");
  p.outline(c.outline);
}

/** Sprites `critter/<id>/<idle|walk|sleep>-<down|right|left>` for a cat in this coat. */
export function catSprites(id: string, c: Coat): SpriteSet {
  return defineCritter(id, {
    /** Sitting up, watching: the tail tip flicks, a slow blink, an ear twitch. */
    idle: {
      w: 22, h: 26, anchor: [10, 25], shadow: { rx: 8, ry: 3, dy: -1 }, frames: 4, fps: 3,
      down: (p, f) => sitFront(c, p, f),
      right: (p, f) => sitSide(c, p, f),
    },
    /** An unhurried trot, tail up. */
    walk: {
      w: 34, h: 20, anchor: [15, 19], shadow: { rx: 12, ry: 3, dy: -1 }, frames: 4, fps: 6,
      down: (p, f) => walkFront(c, p, f),
      right: (p, f) => walkSide(c, p, f),
      downBox: { w: 16, h: 26, anchor: [8, 25], shadow: { rx: 6, ry: 2, dy: -1 } },
    },
    /** Asleep: curled facing the camera, stretched on the side in profile. */
    sleep: {
      w: 34, h: 18, anchor: [14, 17], shadow: { rx: 13, ry: 3, dy: -1 }, frames: 6, fps: 2,
      down: (p, f) => sleepCurl(c, p, f),
      right: (p, f) => sleepSide(c, p, f % 4),
    },
  });
}
