/**
 * Private helpers for the critter domain (not a sprite set: the leading `_` keeps the loader away).
 *
 * Critters are walk-through actors: no `foot`, an anchor at the feet, ids
 * `critter/<who>/<action>-<dir>` so `resolveActorSprite` finds them. `left` is always the mirror of
 * `right` (the anchor mirrors with it, exactly as the engine mirrors a missing `-left`).
 */
import { Px, type Color, type Legend, type SpriteDef, type SpriteSet } from "../../kit/index.ts";

export type CritterFrame = (p: Px, frame: number) => void;
export type CritterAction = {
  w: number;
  h: number;
  anchor: readonly [number, number];
  shadow: { rx: number; ry: number; dx?: number; dy?: number };
  frames: number;
  fps: number;
  down: CritterFrame;
  right: CritterFrame;
  /** A different canvas for the `down` view (a cat walking at you is tall, not long). */
  downBox?: { w: number; h: number; anchor: readonly [number, number]; shadow: CritterAction["shadow"] };
};

/** Sprites `critter/<id>/<action>-<down|right|left>` for one critter. */
export function defineCritter(id: string, actions: Record<string, CritterAction>): SpriteSet {
  const out: SpriteSet = {};
  for (const [name, a] of Object.entries(actions)) {
    const base = { w: a.w, h: a.h, frames: a.frames, fps: a.fps, shadow: a.shadow } as const;
    out[`critter/${id}/${name}-down`] = { ...base, anchor: a.anchor, ...a.downBox, draw: a.down } satisfies SpriteDef;
    out[`critter/${id}/${name}-right`] = { ...base, anchor: a.anchor, draw: a.right } satisfies SpriteDef;
    out[`critter/${id}/${name}-left`] = {
      ...base,
      anchor: [a.w - a.anchor[0], a.anchor[1]],
      shadow: { ...a.shadow, dx: -(a.shadow.dx ?? 0) },
      draw: (p, frame) => {
        const right = new Px(a.w, a.h);
        a.right(right, frame);
        p.blit(right, 0, 0, { flipX: true });
      },
    } satisfies SpriteDef;
  }
  return out;
}

/**
 * A lit ellipse (sun from the upper left) in up to four tones, light to dark. Only fills empty
 * pixels when `under` is set, so a body can be tucked behind a head already drawn.
 */
export function blob(p: Px, cx: number, cy: number, rx: number, ry: number, tones: readonly [Color, Color, Color, Color], cuts = [0.85, 0.45, 0.05]) {
  for (let y = Math.floor(cy - ry); y < Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x < Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v;
    if (d > 1) continue;
    const z = Math.sqrt(1 - d), light = -0.45 * u - 0.65 * v + 0.5 * z;
    p.px(x, y, light > cuts[0] ? tones[0] : light > cuts[1] ? tones[1] : light > cuts[2] ? tones[2] : tones[3]);
  }
}

/** Hand-placed rows, skipping `.`. */
export function art(p: Px, x: number, y: number, rows: readonly string[], legend: Legend) {
  p.rows(x, y, rows, legend);
}
