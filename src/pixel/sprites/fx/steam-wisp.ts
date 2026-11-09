/**
 * A soft wisp of steam for hot dishes: two translucent ribbons that wave as they rise and thin
 * to nothing. 16×24, 8 frames, a seamless loop (the wave travels one full period per cycle).
 * Anchor at the bottom centre, where it leaves the dish.
 */
import { defineSprites, type Px } from "../../kit/index.ts";

function ribbon(p: Px, frame: number, x0: number, phase: number, strength: number, sway: number) {
  for (let y = 23; y >= 1; y--) {
    const t = (23 - y) / 22;
    // The wave rises: its phase moves with the frame, so the loop closes after 8 frames.
    const x = x0 + (0.6 + sway * t) * Math.sin(2 * Math.PI * (t * 1.25 - frame / 8) + phase);
    const fade = Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.35);
    const a = strength * Math.max(0, fade);
    if (a < 0.06) continue;
    const xi = Math.round(x - 0.5);
    p.faded(a, () => p.px(xi, y, "white"));
    // Thicker and softer low down, a single thread near the top.
    if (t < 0.55) p.faded(a * 0.55, () => p.px(xi + (x - xi - 0.5 > 0 ? 1 : -1), y, "white"));
  }
}

export default defineSprites({
  "fx/steam-wisp": {
    w: 16, h: 24, frames: 8, fps: 5, anchor: [8, 23], layer: "over",
    draw: (p, frame) => {
      ribbon(p, frame, 7.5, 0, 0.62, 2.6);
      ribbon(p, frame, 9.5, 2.4, 0.34, 2);
    },
  },
});
