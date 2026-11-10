import { Px } from "./px.ts";

/** World tiles are 32 art pixels square. */
export const TILE = 32;

export type SpriteDef = {
  /** Frame size in art pixels. */
  w: number;
  h: number;
  /** Animation frames (default 1) and playback speed (default 6 fps). */
  frames?: number;
  fps?: number;
  /**
   * The pixel that sits on the object's world position: where it touches the ground.
   * Defaults to bottom-centre, `[w / 2, h]`. Objects are depth-sorted by this point.
   */
  anchor?: readonly [number, number];
  /** Solid footprint in pixels relative to the anchor, `[dx, dy, w, h]`. Omit for walk-through art. */
  foot?: readonly [number, number, number, number];
  /** Soft contact shadow the renderer draws under the sprite, centred on the anchor plus (dx, dy). */
  shadow?: { rx: number; ry: number; dx?: number; dy?: number };
  /** `floor` draws under everything, `object` is depth-sorted (default), `over` draws above actors. */
  layer?: "floor" | "object" | "over";
  /** Draw frame `frame` (0-based) into a fresh transparent canvas. Must be deterministic. */
  draw: (p: Px, frame: number) => void;
};

export type SpriteSet = Record<string, SpriteDef>;

/** Identity helper that gives sprite files type-checking. Keys are global sprite ids, `domain/name`. */
export function defineSprites<T extends SpriteSet>(sprites: T): T {
  return sprites;
}

export type BakedSprite = {
  id: string;
  def: SpriteDef;
  frames: Px[];
  anchor: readonly [number, number];
};

export function bakeSprite(id: string, def: SpriteDef): BakedSprite {
  const count = def.frames ?? 1;
  const frames: Px[] = [];
  for (let frame = 0; frame < count; frame++) {
    const p = new Px(def.w, def.h);
    def.draw(p, frame);
    frames.push(p);
  }
  return { id, def, frames, anchor: def.anchor ?? [Math.floor(def.w / 2), def.h] };
}

/** Merge sprite modules into one set, failing loudly on a duplicated id. */
export function mergeSpriteSets(sets: readonly SpriteSet[]): SpriteSet {
  const merged: SpriteSet = {};
  for (const set of sets) for (const [id, def] of Object.entries(set)) {
    if (id in merged) throw new Error(`Sprite id "${id}" is defined twice`);
    merged[id] = def;
  }
  return merged;
}
