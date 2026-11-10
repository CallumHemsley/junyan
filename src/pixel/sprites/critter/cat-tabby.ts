/**
 * 花卷 (Huājuǎn), the lane's cat: a lean grey mackerel tabby who belongs to everyone and no one.
 * The noodle stall feeds her at seven, the tailor at noon. An "M" on her brow, buff chin and chest,
 * green eyes, one white sock on her left forepaw, the left ear tipped flat (the neighbourhood
 * committee had her neutered), and a kink at the end of her tail from an old door. Distinct from
 * the cafe's ginger Mantou (`decor/cat-*`) in colour, build and markings.
 *
 * Actions `idle` (sitting, tail flick), `walk`, `sleep`, in `down`, `right` and `left` (mirrored).
 * Walk-through actor anchored where she touches the ground.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art, blob, defineCritter } from "./_helpers.ts";

const FUR = {
  L: "stone4", A: "stone3", a: "stone2", H: "stone5", d: "stone2", D: "stone1", o: "stone1",
  w: "cream4", W: "cream3", n: "pink2", p: "pink3", g: "leaf4", G: "leaf5", k: "ink", m: "stone1",
  S: "cream5", s: "cream3", h: "cream5",
} as const;
const TONES = ["stone5", "stone4", "stone3", "stone2"] as const;
const OUTLINE: Color = "stone1";

/** Mackerel stripes over the fur already drawn in a region: each stripe one tone darker. */
function stripes(p: Px, x0: number, y0: number, w: number, h: number, on: (x: number, y: number) => boolean) {
  const darker: Partial<Record<string, Color>> = { stone5: "stone3", stone4: "stone2", stone3: "stone1", stone2: "stone1" };
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    const c = p.get(x, y);
    if (c && darker[c] && on(x, y)) p.px(x, y, darker[c]!);
  }
}

/** A tail as a chain of points, two pixels thick, lit along its top, with ringed stripes. */
function tail(p: Px, points: readonly [number, number][]) {
  points.forEach(([x, y], i) => {
    const ring = i % 3 === 2;
    p.px(x, y, ring ? "stone2" : "stone4");
    p.px(x, y + 1, ring ? "stone1" : "stone3");
  });
}

// ── heads ──────────────────────────────────────────────────────────────────

/** Facing the camera, 14×11. The left ear (screen right) is tipped flat. */
function headFront(p: Px, x: number, y: number, eyes: "open" | "half" | "shut", twitch = false) {
  const eye = { open: ["Gk", "gk"], half: ["LL", "gk"], shut: ["LL", "kk"] }[eyes];
  const eyeR = { open: ["kg", "kg"], half: ["AA", "kg"], shut: ["AA", "kk"] }[eyes];
  art(p, x, y, [
    twitch ? "............" : "..L...........",
    twitch ? ".LL.......aaa." : ".LL.......aaa.",
    ".LpL.....aApa.",
    "LLpLLAAAAAApaa",
    "LLLdLdAdAAAAaa",
    "LLLLdLLdAAAAaa",
    `L${eye[0]}LLLAAA${eyeR[0]}aa`,
    `L${eye[1]}LwwwwW${eyeR[1]}aa`,
    "LLwwwwnnwwwwaa",
    ".Lwwwwmmwwwwa.",
    "..wwwwwwwwww..",
  ], FUR);
  if (twitch) art(p, x, y, ["..L.", ".LLL"], FUR);
}

/** Profile facing right, 11×10: ear up, the M on the brow, the muzzle pointing right. */
function headSide(p: Px, x: number, y: number, eyes: "open" | "shut", earBack = false) {
  art(p, x, y, [
    earBack ? "..........." : "....LA.....",
    earBack ? "...LLA....." : "...LpA.....",
    "..LLpAA....",
    ".LLdLdAAa..",
    "LLLLdAAAAa.",
    `LLLLL${eyes === "open" ? "Gk" : "AA"}AAa.`,
    `LLLLL${eyes === "open" ? "gk" : "kk"}AAAa`,
    ".LLLwwwwwwn",
    "..aWwwwwmw.",
    "...aWWWW...",
  ], FUR);
}

// ── sitting ────────────────────────────────────────────────────────────────

const TAIL_SIT_FRONT: readonly (readonly [number, number][])[] = [
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [16, 16], [16, 15], [17, 14]],
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [17, 16], [18, 15], [18, 14]],
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [16, 16], [15, 15], [15, 14]],
  [[15, 23], [16, 22], [17, 21], [17, 20], [17, 19], [17, 18], [17, 17], [17, 16], [17, 15], [16, 14]],
];

function sitFront(p: Px, frame: number) {
  tail(p, TAIL_SIT_FRONT[frame]);
  blob(p, 10, 20.5, 7, 4.8, TONES);
  blob(p, 10, 14.5, 4.8, 5.5, TONES);
  stripes(p, 0, 15, 20, 10, (x, y) => Math.abs(x - 9.5) > 3 && (y + Math.floor(Math.abs(x - 9.5) / 2)) % 3 === 0);
  // Buff chest, then the forelegs: white sock on her left (screen right).
  art(p, 8, 12, [".ww.", "wwww", "wwwW", "wwwW", ".wW.", ".wW."], FUR);
  art(p, 6, 17, [
    ".LA....AA.",
    ".LA....Aa.",
    ".dA....Da.",
    ".LA....SS.",
    ".LA....SS.",
    ".dA....SS.",
    "LLAA..SSSs",
  ], FUR);
  headFront(p, 3, 2, frame === 2 ? "half" : "open", frame === 3);
  p.outline(OUTLINE);
  // Whiskers.
  art(p, 1, 10, ["h.", ".h"], FUR);
  art(p, 17, 10, [".h", "h."], FUR);
}

/** The tail lies along the ground round her front feet; the kinked tip lifts and settles. */
const TAIL_SIT_SIDE: readonly (readonly [number, number][])[] = [
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 23], [13, 22], [14, 22], [15, 21]],
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 23], [13, 23], [14, 22], [15, 22]],
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 22], [13, 21], [13, 20], [14, 19]],
  [[3, 23], [4, 23], [5, 23], [6, 23], [7, 23], [8, 23], [9, 23], [10, 23], [11, 23], [12, 23], [13, 22], [14, 21], [15, 21]],
];

function sitSide(p: Px, frame: number) {
  blob(p, 8, 19.5, 6.5, 5, TONES);
  blob(p, 12.5, 14.5, 4, 6, TONES);
  // Hoops round the haunch, and bars down the back of the neck.
  stripes(p, 0, 9, 18, 16, (x, y) => (x >= 11 ? y % 3 === 0 && y > 12 && y < 18 : x % 3 === 1 && y > 14 && y < 23 && x > 1));
  // Foreleg straight down, the white sock out of sight on the far side.
  art(p, 13, 17, ["LAa", "LAa", "dAa", "LAa", "LAa", "dAa", "LLAa"], FUR);
  // Buff chest under the chin.
  art(p, 15, 11, ["ww", "wW", "wW", ".W"], FUR);
  tail(p, TAIL_SIT_SIDE[frame]);
  headSide(p, 10, 2, frame === 2 ? "shut" : "open", frame === 3);
  p.outline(OUTLINE);
  art(p, 21, 10, ["h"], FUR);
}

// ── walking ────────────────────────────────────────────────────────────────

/** Legs in profile for one frame: [x of each leg's foot, lifted?], near legs drawn lighter. */
const STRIDE: readonly (readonly [number, number, number, number])[] = [
  [5, 9, 18, 22], // contact: back legs apart, front legs apart
  [7, 8, 20, 20], // passing
  [9, 5, 22, 18], // contact, the other pair forward
  [8, 7, 20, 20], // passing
];

function walkSide(p: Px, frame: number) {
  const bob = frame % 2 === 1 ? -1 : 0;
  const [backFar, backNear, frontFar, frontNear] = STRIDE[frame];
  // Far legs first, a step darker.
  for (const fx of [backFar, frontFar]) art(p, fx, 13 + bob, ["aa", "aa", "aD", "aa", "aa", fx === frontFar ? "Ss" : "aa"].slice(0, 6 - bob), FUR);
  // The kinked tail, held up and curving back.
  tail(p, [[4, 9 + bob], [3, 8 + bob], [2, 7 + bob], [2, 6 + bob], [2, 5 + bob], [2, 4 + bob], [3, 3 + bob], [3, 2 + bob], [4, 2 + bob]]);
  blob(p, 14, 10.5 + bob, 10, 4.2, TONES);
  stripes(p, 4, 6 + bob, 20, 9, (x) => x % 3 === 0 && x > 6 && x < 21);
  for (const fx of [backNear, frontNear]) art(p, fx, 13 + bob, ["LA", "LA", "dA", "LA", "LA", "LA"].slice(0, 6 - bob), FUR);
  headSide(p, 20, 1 + bob + (frame % 2 === 0 ? 1 : 0), "open");
  p.outline(OUTLINE);
  art(p, 31, 10 + bob, ["h"], FUR);
}

/** Coming toward the camera: head high, shoulders rolling, the tail held up behind. */
function walkFront(p: Px, frame: number) {
  const bob = frame % 2 === 1 ? -1 : 0;
  // The tail flag behind, swaying with the stride.
  const sway = [0, 1, 0, -1][frame];
  tail(p, [[8 + sway, 10], [8 + sway, 9], [8 + sway, 8], [9 + sway, 7], [9 + sway, 6], [10 + sway, 5]]);
  blob(p, 8, 15 + bob, 5.5, 4.5, TONES);
  stripes(p, 0, 10, 16, 12, (x, y) => Math.abs(x - 7.5) > 2.5 && (y + Math.floor(Math.abs(x - 7.5) / 2)) % 3 === 0);
  art(p, 6, 13 + bob, [".ww.", "wwwW", ".wW."], FUR);
  // Forelegs: the leading paw lower and larger.
  const lead = frame === 0 ? "left" : frame === 2 ? "right" : null;
  art(p, 4, 17 + bob, ["LA", "LA", "dA", "LA", "LA", "LL"].slice(0, lead === "left" ? 6 : 5 - bob), FUR);
  art(p, 10, 17 + bob, ["Aa", "Aa", "Da", "SS", "SS", "SS"].slice(0, lead === "right" ? 6 : 5 - bob), FUR);
  headFront(p, 1, 3 + bob, "open");
  p.outline(OUTLINE);
}

// ── sleeping ───────────────────────────────────────────────────────────────

/** Curled nose to tail in a sun patch; the flank rises and falls, an ear flicks on the last frame. */
function sleepCurl(p: Px, frame: number) {
  const lift = [0, 0.5, 1, 1, 0.5, 0][frame];
  blob(p, 13, 10 + (lift ? -lift / 2 : 0), 12, 7.5 + lift / 2, TONES);
  stripes(p, 0, 0, 28, 18, (x, y) => {
    const t = Math.atan2(y + 0.5 - 10, x + 0.5 - 13);
    return Math.round(t * 5) % 2 === 0 && y < 11 && x < 20;
  });
  // The tail round the front with its kinked tip by her nose.
  tail(p, [[3, 13], [4, 14], [5, 15], [6, 15], [7, 15], [8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14, 14], [15, 14], [16, 13]]);
  // Her head tucked down on the right, eyes shut, the tipped ear.
  art(p, 15, 4, [
    frame === 5 ? "........." : "..L...a..",
    frame === 5 ? ".LL...aa." : ".LpL.apa.",
    "LLLdLdAAa",
    "LLLLdAAaa",
    "LkkLLAkka",
    "LLwwnwwAa",
    ".LwwwwwA.",
    "..wwww...",
  ], FUR);
  p.outline(OUTLINE);
}

/** Stretched out on her side, belly to the sun, paws reaching; a slow breath. */
function sleepSide(p: Px, frame: number) {
  const lift = [0, 0, 1, 1][frame];
  // Legs out toward the camera, the white sock on top.
  art(p, 18, 10, ["SSa...", "SSSa..", ".SSa.."], FUR);
  art(p, 21, 9, ["LLA..", "LLAa.", ".LLA."], FUR);
  art(p, 6, 10, ["LAa..", "LLAa.", ".LLAa"], FUR);
  art(p, 9, 11, ["LAa", "LLAa", ".LAa"], FUR);
  blob(p, 14, 7.5 - lift / 2, 10, 4 + lift / 2, TONES);
  stripes(p, 4, 2, 21, 9, (x, y) => x % 3 === 1 && y < 8);
  // Pale belly along the bottom.
  art(p, 9, 10, ["wwwwwwwwww"], FUR);
  tail(p, [[4, 8], [3, 9], [2, 10], [1, 10], [0, 9]]);
  headSide(p, 22, 1, "shut");
  p.outline(OUTLINE);
}

export default defineSprites({
  ...defineCritter("cat-tabby", {
    /** Sitting up, watching the lane: the kinked tip flicks, a slow blink, an ear twitch. */
    idle: {
      w: 22, h: 26, anchor: [10, 25], shadow: { rx: 8, ry: 3, dy: -1 }, frames: 4, fps: 3,
      down: sitFront,
      right: sitSide,
    },
    /** An unhurried trot, tail up. */
    walk: {
      w: 34, h: 20, anchor: [15, 19], shadow: { rx: 12, ry: 3, dy: -1 }, frames: 4, fps: 6,
      down: walkFront,
      right: walkSide,
      downBox: { w: 16, h: 26, anchor: [8, 25], shadow: { rx: 6, ry: 2, dy: -1 } },
    },
    /** Asleep: curled facing the camera, stretched on her side in profile. */
    sleep: {
      w: 34, h: 18, anchor: [14, 17], shadow: { rx: 13, ry: 3, dy: -1 }, frames: 6, fps: 2,
      down: sleepCurl,
      right: (p, f) => sleepSide(p, f % 4),
    },
  }),
});
