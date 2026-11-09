/**
 * Steam: rising, curling, thinning wisps. Translucent white in three alpha steps, no outline.
 * Each sprite is a seamless loop: puffs are born thin at the source, swell and curl as they rise
 * along a lazy S, and are gone by the top edge, so the last frame flows into the first.
 * Anchor at the bottom centre: place it on the lid or the pot's mouth.
 */
import { defineSprites, type Px } from "../../kit/index.ts";

type Wisp = {
  w: number; h: number; frames: number;
  /** Puffs alive at once; sway amplitude at the top (px); S-turns over the rise; drift at the top. */
  puffs: number; sway: number; turns: number; drift: number;
  /** Puff radius at the source and at the top; how hard puffs curl into hooks (0..1); phase seed. */
  r0: number; r1: number; curl: number; seed: number;
  /** Height of the unbroken stream over the source, as a share of the frame. */
  stream: number;
};

const ALPHA = [0.34, 0.55, 0.78] as const;

/**
 * A thin unbroken stream leaves the source and breaks into puffs. Each puff rises along a lazy S,
 * swells, curls into a hook (an offset bite out of one side) and thins to nothing before the top.
 * Puffs are evenly spaced in phase, so frame `frames` equals frame 0.
 */
function steam(p: Px, frame: number, s: Wisp) {
  const { w, h } = s;
  const t = frame / s.frames;
  const grid = new Uint8Array(w * h);
  const put = (x: number, y: number, l: number) => {
    if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = Math.max(grid[y * w + x], l);
  };
  const path = (k: number, phase: number) => w / 2 + s.drift * k * k + s.sway * (0.15 + 0.85 * k) * Math.sin(2 * Math.PI * (k * s.turns + phase));
  // The stream: one pixel wide, wavering with the same S the puffs will follow.
  for (let y = h - 1; y >= 0; y--) {
    const k = (h - 1 - y) / (h - 1);
    if (k > s.stream) break;
    const x = Math.round(path(k, s.seed - t) - 0.5);
    put(x, y, 2);
    if (k < s.stream * 0.5) put(x + 1, y, 1);
  }
  for (let i = 0; i < s.puffs; i++) {
    const a = (t + i / s.puffs) % 1;
    const k = s.stream * 0.6 + a * (1 - s.stream * 0.6);
    const phase = s.seed - t;
    const px = path(k, phase), py = h - 1 - k * (h - 2 - s.r1 * 1.1) + 0.5;
    const r = (s.r0 + (s.r1 - s.r0) * a) * (a > 0.8 ? 1 - (a - 0.8) * 2.5 : 1) * Math.min(1, a / 0.12 + 0.35);
    if (r < 0.6) continue;
    const level = a < 0.58 ? 2 : 1;
    // Hook: bite out of the side the path is turning away from, growing as the puff ages.
    const side = Math.cos(2 * Math.PI * (k * s.turns + phase)) >= 0 ? -1 : 1;
    const bx = px + side * r * 0.75, by = py - r * 0.45, br = r * 0.62 * s.curl * Math.min(1, a * 2);
    for (let y = Math.floor(py - r * 1.3); y <= py + r * 1.3; y++) for (let x = Math.floor(px - r); x <= px + r; x++) {
      const dx = (x + 0.5 - px) / r, dy = (y + 0.5 - py) / (r * 1.15);
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const ex = x + 0.5 - bx, ey = y + 0.5 - by;
      if (br > 0.5 && ex * ex + ey * ey < br * br) continue;
      put(x, y, d < 0.42 ? level : d < 0.72 ? Math.max(1, level - 1) : 1);
    }
  }
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : grid[y * w + x]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let l = at(x, y);
    if (!l) continue;
    // No lone pixels: a step needs a neighbour at least as dense, or it drops a step.
    if (![at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].some((n) => n >= l)) l -= 1;
    if (!l) continue;
    p.faded(ALPHA[l - 1], () => p.px(x, y, l === 1 ? "blue6" : l === 2 ? "steel6" : "white"));
  }
}

export default defineSprites({
  /** Steam over the tall steamer lid: a broad, slow, curling column. 8 frames at 6 fps. */
  "fx/steam-a": {
    w: 32, h: 48, frames: 8, fps: 6, anchor: [16, 47], layer: "over",
    draw: (p, f) => steam(p, f, { w: 32, h: 48, frames: 8, puffs: 5, sway: 5, turns: 1, drift: 3, r0: 3, r1: 7.5, curl: 0.9, seed: 0.1, stream: 0.1 }),
  },
  /** A second loop leaning the other way, so neighbouring steamers never breathe in step. */
  "fx/steam-b": {
    w: 32, h: 48, frames: 8, fps: 6, anchor: [16, 47], layer: "over",
    draw: (p, f) => steam(p, f, { w: 32, h: 48, frames: 8, puffs: 5, sway: 5.5, turns: 1.2, drift: -3.5, r0: 2.8, r1: 7, curl: 0.9, seed: 0.55, stream: 0.08 }),
  },
  /** A thin wisp off a pot or a cup. 6 frames at 5 fps. */
  "fx/steam-small": {
    w: 16, h: 24, frames: 6, fps: 5, anchor: [8, 23], layer: "over",
    draw: (p, f) => steam(p, f, { w: 16, h: 24, frames: 6, puffs: 3, sway: 2.4, turns: 0.9, drift: 1.6, r0: 1.6, r1: 3.6, curl: 0.7, seed: 0.3, stream: 0.25 }),
  },
});
