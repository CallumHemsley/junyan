import { bakeSprite, type Color, type SpriteDef, type SpriteSet } from "../kit/index.ts";

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
  /** True when this is a stand-in box for a sprite that is not drawn yet (see `AtlasOptions.placeholder`). */
  placeholder?: boolean;
  /** Frame `i`, optionally mirrored. Baked on first use and cached. */
  frame(index: number, flipX?: boolean): Image;
};

export type Atlas = {
  /** Whether the set really has this sprite (placeholders do not count). */
  has(id: string): boolean;
  /** The sprite, or its placeholder when the atlas was given one for this id, or undefined. */
  find(id: string): AtlasSprite | undefined;
  /** Like `find`, but throws a helpful error for an unknown id. */
  get(id: string): AtlasSprite;
  ids(): string[];
};

/** A stand-in for a missing sprite: a flat box, `w`×`h` art px, standing on its anchor. */
export type Placeholder = {
  w: number;
  h: number;
  /** Default bottom-centre, `[floor(w / 2), h]`, so the box's base sits on the anchor. */
  anchor?: readonly [number, number];
  /** Default `stone4`. */
  color?: Color;
  /** Opacity of the fill, 0..1 (default 0.35); the one-pixel edge is a little stronger. 1 draws an opaque fill with no edge (ground). */
  alpha?: number;
  layer?: AtlasSprite["layer"];
};

export type AtlasOptions = {
  /**
   * Dev and tool fallback for art that is still being drawn: the box to show for an id the set lacks,
   * or null to keep treating it as unknown. Leave it out in production, where a missing id is a bug.
   */
  placeholder?: (id: string) => Placeholder | null;
  /** Told once per id the first time it is drawn as a placeholder. */
  onPlaceholder?: (id: string) => void;
};

/** The sprite definition of a placeholder box. */
export function placeholderSprite(spec: Placeholder): SpriteDef {
  const { w, h, color = "stone4", alpha = 0.35 } = spec;
  return {
    w, h, anchor: spec.anchor ?? [Math.floor(w / 2), h], layer: spec.layer,
    draw: (p) => {
      if (alpha >= 1) { p.rect(0, 0, w, h, color); return; }
      p.faded(alpha, () => p.rect(0, 0, w, h, color));
      p.faded(Math.min(1, alpha * 1.8), () => p.frame(0, 0, w, h, color));
    },
  };
}

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
export function createAtlas(set: SpriteSet, options: AtlasOptions = {}): Atlas {
  const cache = new Map<string, AtlasSprite>();
  const missing = new Set<string>();
  const find = (id: string): AtlasSprite | undefined => {
    const hit = cache.get(id);
    if (hit) return hit;
    const real: SpriteDef | undefined = set[id];
    let spec: Placeholder | null | undefined;
    if (!real) {
      if (missing.has(id)) return undefined;
      spec = options.placeholder?.(id);
      if (!spec) { missing.add(id); return undefined; }
      options.onPlaceholder?.(id);
    }
    const stand = !real;
    const def: SpriteDef = real ?? placeholderSprite(spec!);
    let baked: ReturnType<typeof bakeSprite> | undefined;
    const count = def.frames ?? 1;
    const plain: Image[] = [], flipped: Image[] = [];
    const sprite: AtlasSprite = {
      id, def, w: def.w, h: def.h,
      anchor: def.anchor ?? [Math.floor(def.w / 2), def.h],
      frameCount: count,
      fps: def.fps ?? 6,
      layer: def.layer ?? "object",
      ...(stand ? { placeholder: true } : {}),
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
  const get = (id: string): AtlasSprite => {
    const sprite = find(id);
    if (!sprite) throw new Error(`No sprite "${id}". Known: ${Object.keys(set).sort().join(", ")}`);
    return sprite;
  };
  return { has: (id) => id in set, find, get, ids: () => Object.keys(set).sort() };
}
