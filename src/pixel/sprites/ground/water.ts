/**
 * The canal: a narrow old creek, slow and green, the colour of tea left too long. Short ripple crests
 * (a lit dash over a darker trough) rock gently on the spot; a few sky glints wink in and out. Four
 * frames at 3 fps, a seamless loop. Ripples wrap at the tile edge, and nothing travels, so every
 * variant meets every other without a seam, in every frame.
 *
 * The scene weights a and b heavily, c moderately and d rarely.
 */
import { defineSprites, hash, type Legend, type Px } from "../../kit/index.ts";
import { T, animated, jitter, stamp, wrap } from "./_helpers.ts";

export const WATER_FRAMES = 4;
export const WATER_FPS = 3;

const L: Legend = { b: "bamboo3", n: "bamboo4", B: "bamboo2", q: "jade3", Q: "jade4", k: "jade1" };

/** How far each ripple rocks sideways and how long it is in each frame of its own cycle. */
const SWAY = [0, 1, 1, 0];
const GROW = [0, 1, 0, -1];

function water(p: Px, frame: number, seed: number, glints = 3) {
  p.rect(0, 0, T, T, "jade2");
  // Deep, slow swells: broad darker bands that never move, so the canal has body.
  for (const [x, y, r] of jitter(16, seed + 5, 3)) {
    if (r > 0.7) continue;
    for (let i = -4; i <= 4; i++) wrap(p, x + i, y, "jade1");
    for (let i = -2; i <= 2; i++) wrap(p, x + i + 1, y + 1, "jade1");
  }
  // Ripple crests: a lit dash with its trough a pixel below, rocking on its own phase.
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r > 0.72) continue;
    const phase = Math.floor(hash(x, y, seed + 1) * 4);
    const f = (frame + phase) % 4;
    const len = 3 + Math.floor(hash(x, y, seed + 2) * 3) + GROW[f];
    const x0 = x + SWAY[f];
    for (let i = 0; i < len; i++) wrap(p, x0 + i, y, i === 0 || i === len - 1 ? "jade3" : "jade4");
    for (let i = 1; i < len + 1; i++) wrap(p, x0 + i, y + 1, "jade1");
  }
  // Sky glints: a pixel or two of pale blue, each lit in one frame of four.
  for (const [x, y, r] of jitter(16, seed + 9, 2)) {
    const on = Math.floor(r * 4);
    if (on !== frame || hash(x, y, seed + 3) > glints / 4) continue;
    wrap(p, x, y, "blue5");
    wrap(p, x + 1, y, "jade5");
  }
}

export default defineSprites({
  /** Plain canal. */
  "ground/water-a": animated(WATER_FRAMES, WATER_FPS, (p, f) => water(p, f, 1)),

  /** Plain canal, a different scatter. */
  "ground/water-b": animated(WATER_FRAMES, WATER_FPS, (p, f) => water(p, f, 2)),

  /** A plane leaf afloat, bobbing in its own small ring of ripples. */
  "ground/water-c": animated(WATER_FRAMES, WATER_FPS, (p, f) => {
    water(p, f, 3);
    const bob = [0, 0, 1, 1][f];
    const ring = f % 2 === 0;
    if (ring) { p.hline(9, 20 + bob, 2, "jade4").hline(19, 20 + bob, 2, "jade4"); }
    else { p.hline(8, 19 + bob, 2, "jade3").hline(20, 19 + bob, 2, "jade3"); }
    stamp(p, 11, 15 + bob, [
      "..b.b..",
      ".bnbnb.",
      "bnnBnnb",
      ".bnBnb.",
      "..kBk..",
    ], L, false);
  }),

  /** Sun on the water: a run of brighter crests and more glints where the light falls between buildings. */
  "ground/water-d": animated(WATER_FRAMES, WATER_FPS, (p, f) => {
    water(p, f, 4, 4);
    for (let k = 0; k < 5; k++) {
      const x = 6 + Math.floor(hash(k, 0, 44) * 18), y = 6 + k * 5;
      const on = (k + f) % 4;
      if (on < 2) p.hline(x + on, y, 3 - on, on === 0 ? "jade5" : "jade4");
      if (on === 0) p.px(x + 1, y - 1, "blue5");
    }
  }),
});
