import { bakeSprite, type SpriteDef, type SpriteSet } from "../kit/index.ts";

/** One baked frame: straight RGBA, row-major, plus a 32-bit view of the same bytes. */
export type Image = { w: number; h: number; data: Uint8ClampedArray; words: Uint32Array };

export type AtlasSprite = {
  id: string;
  def: SpriteDef;
  w: number;
  h: number;
  anchor: readonly [number, number];
  frameCount: number;
  fps: number;
  layer: "floor" | "object" | "over";
  /** Frame `i`, optionally mirrored. Baked on first use and cached. */
  frame(index: number, flipX?: boolean): Image;
};

export type Atlas = {
  has(id: string): boolean;
  /** Throws a helpful error for an unknown id. */
  get(id: string): AtlasSprite;
  ids(): string[];
};

function image(w: number, h: number, data: Uint8ClampedArray): Image {
  return { w, h, data, words: new Uint32Array(data.buffer, data.byteOffset, w * h) };
}

function mirror(source: Image): Image {
  const out = new Uint32Array(source.w * source.h);
  for (let y = 0; y < source.h; y++) for (let x = 0; x < source.w; x++) out[y * source.w + x] = source.words[y * source.w + source.w - 1 - x];
  return image(source.w, source.h, new Uint8ClampedArray(out.buffer));
}

/** Frame index for a sprite at `time` ms, `phase` frames in. */
export function frameAt(sprite: Pick<AtlasSprite, "frameCount" | "fps">, time: number, phase = 0): number {
  if (sprite.frameCount <= 1) return 0;
  const index = Math.floor((time / 1000) * sprite.fps + phase);
  return ((index % sprite.frameCount) + sprite.frameCount) % sprite.frameCount;
}

/**
 * Lazily bakes sprites from an injected set. In the browser the set comes from `../registry.ts`,
 * in Node from `../tools/load.ts`, in tests from a literal.
 */
export function createAtlas(set: SpriteSet): Atlas {
  const cache = new Map<string, AtlasSprite>();
  const get = (id: string): AtlasSprite => {
    const hit = cache.get(id);
    if (hit) return hit;
    const def = set[id];
    if (!def) throw new Error(`No sprite "${id}". Known: ${Object.keys(set).sort().join(", ")}`);
    let baked: ReturnType<typeof bakeSprite> | undefined;
    const count = def.frames ?? 1;
    const plain: Image[] = [], flipped: Image[] = [];
    const sprite: AtlasSprite = {
      id, def, w: def.w, h: def.h,
      anchor: def.anchor ?? [Math.floor(def.w / 2), def.h],
      frameCount: count,
      fps: def.fps ?? 6,
      layer: def.layer ?? "object",
      frame(index, flipX = false) {
        const i = ((index % count) + count) % count;
        if (!plain[i]) {
          baked ??= bakeSprite(id, def);
          plain[i] = image(def.w, def.h, baked.frames[i].toRGBA());
        }
        if (!flipX) return plain[i];
        return (flipped[i] ??= mirror(plain[i]));
      },
    };
    cache.set(id, sprite);
    return sprite;
  };
  return { has: (id) => id in set, get, ids: () => Object.keys(set).sort() };
}
