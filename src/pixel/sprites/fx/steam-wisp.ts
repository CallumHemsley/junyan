/**
 * A soft wisp of steam for hot dishes: one stem, thick and bright where it leaves the food, that
 * sways, curls over at the top and thins to nothing. 16×24, 8 frames, a seamless loop (the sway
 * travels one full period per cycle). Anchor at the bottom centre, where it leaves the dish.
 */
import { defineSprites, type Px } from "../../kit/index.ts";

function wisp(p: Px, frame: number) {
  for (let y = 23; y >= 0; y--) {
    const t = (23 - y) / 23;
    const phase = 2 * Math.PI * (t * 1.1 - frame / 8);
    // The sway grows as it rises, so the top hooks over like a curl.
    const x = 8 + (0.4 + 3.2 * t * t) * Math.sin(phase);
    const width = 3.2 * (1 - t) + 0.6;
    const strength = 0.82 * Math.pow(1 - t, 0.9) * Math.min(1, t * 9 + 0.35);
    if (strength < 0.05) continue;
    for (let i = Math.floor(x - width / 2); i <= Math.floor(x + width / 2); i++) {
      const edge = Math.abs(i + 0.5 - x) / (width / 2 + 0.5);
      const a = strength * (edge < 0.5 ? 1 : 0.55);
      p.faded(a, () => p.px(i, y, "white"));
    }
  }
}

export default defineSprites({
  "fx/steam-wisp": { w: 16, h: 24, frames: 8, fps: 5, anchor: [8, 23], layer: "over", draw: wisp },
});
