/** Tiny synthetic sprites for engine tests. Not a sprite module: it lives outside `sprites/`. */
import { TILE, defineSprites, type Color, type SpriteDef } from "../kit/index.ts";

export const solid = (w: number, h: number, c: Color, extra: Partial<SpriteDef> = {}): SpriteDef => ({ w, h, draw: (p) => p.rect(0, 0, w, h, c), ...extra });

export const testSprites = defineSprites({
  "t/floor-a": solid(TILE, TILE, "oak4", { layer: "floor" }),
  "t/floor-b": solid(TILE, TILE, "oak2", { layer: "floor" }),
  "t/floor-c": solid(TILE, TILE, "oak5", { layer: "floor" }),
  "t/wall": solid(TILE, TILE * 3, "cream4", { layer: "floor" }),
  "t/rug": solid(TILE, TILE, "red3", { layer: "floor" }),
  /** Two-frame animated floor tile: frame 0 jade3, frame 1 jade5. */
  "t/water": { w: TILE, h: TILE, layer: "floor", frames: 2, fps: 2, draw: (p, f) => p.rect(0, 0, TILE, TILE, f ? "jade5" : "jade3") },
  "t/red": solid(8, 8, "red3", { anchor: [4, 8], foot: [-4, -2, 8, 2] }),
  "t/blue": solid(8, 8, "blue3", { anchor: [4, 8] }),
  "t/shadowed": { w: 4, h: 4, anchor: [2, 4], shadow: { rx: 4, ry: 2 }, draw: () => {} },
  "t/lamp": solid(4, 4, "gold4", { layer: "over", anchor: [2, 4] }),
  /** Half-transparent glass pane. */
  "t/glass": { w: 2, h: 1, anchor: [0, 1], draw: (p) => p.faded(0.5, () => p.rect(0, 0, 2, 1, "white")) },
  /** Left half solid, right half empty: shows mirroring. */
  "t/half": { w: 4, h: 2, anchor: [1, 2], draw: (p) => p.rect(0, 0, 2, 2, "ink") },
  "ex/waiter": solid(16, 32, "jade4", { anchor: [8, 31], shadow: { rx: 6, ry: 2 } }),
  "char/cook/idle-down": solid(16, 32, "steel3", { anchor: [8, 31], frames: 2, fps: 2 }),
  "char/cook/idle-right": solid(16, 32, "steel4", { anchor: [8, 31] }),
  "char/cook/walk-down": solid(16, 32, "steel5", { anchor: [8, 31], frames: 4, fps: 8 }),
  "char/cook/walk-right": { w: 16, h: 32, anchor: [8, 31], frames: 4, fps: 8, draw: (p) => p.rect(0, 0, 8, 32, "steel6") },
});
