import { frameAt, type Atlas, type AtlasSprite } from "./atlas.ts";
import type { Actor, Facing } from "./types.ts";

/** The sprite every missing character falls back to. */
export const FALLBACK_CHARACTER = "ex/waiter";
/** Walk animations advance one frame per this many tiles travelled (when driven by distance). */
export const WALK_TILES_PER_FRAME = 0.375;

export type ResolvedActor = {
  sprite: AtlasSprite;
  flipX: boolean;
  /** Set when a fallback was used: what was asked for and what was drawn instead. */
  fallback?: string;
};

/**
 * Which sprite draws an actor. Tries, in order:
 * `${sprite}/${action}-${facing}`; for `left`, the mirrored `-right`; the same two with `idle`;
 * `${sprite}/idle-down`; `sprite` itself as a plain sprite id; a placeholder box for `sprite` if the
 * atlas makes one (see `AtlasOptions.placeholder`); and finally `ex/waiter`.
 */
export function resolveActorSprite(atlas: Atlas, sprite: string, action = "idle", facing: Facing = "down"): ResolvedActor {
  const tries: [string, boolean][] = [];
  const add = (act: string) => {
    tries.push([`${sprite}/${act}-${facing}`, false]);
    if (facing === "left") tries.push([`${sprite}/${act}-right`, true]);
  };
  add(action);
  if (action !== "idle") add("idle");
  tries.push([`${sprite}/idle-down`, false], [sprite, facing === "left"], [FALLBACK_CHARACTER, false]);
  const wanted = `${sprite}/${action}-${facing}`;
  for (let i = 0; i < tries.length; i++) {
    const [id, flipX] = tries[i];
    // Before the stand-in character, a placeholder box for the character itself, when the atlas has one.
    if (id === FALLBACK_CHARACTER && sprite !== FALLBACK_CHARACTER) {
      const box = atlas.find(sprite);
      if (box?.placeholder) return { sprite: box, flipX: false, fallback: `${wanted} → placeholder` };
    }
    if (!atlas.has(id)) continue;
    // A mirrored right is the documented way to draw left, not a fallback worth warning about.
    const expected = i === 0 || (i === 1 && facing === "left") || (id === sprite && !sprite.startsWith("char/"));
    return { sprite: atlas.get(id), flipX, fallback: expected ? undefined : `${wanted} → ${id}${flipX ? " (mirrored)" : ""}` };
  }
  throw new Error(`No sprite for actor "${wanted}" and no fallback "${FALLBACK_CHARACTER}"`);
}

/**
 * Animation frame for an actor: walk cycles follow distance when `distance` is set (one frame per
 * `stride` tiles, the sprite's own or `WALK_TILES_PER_FRAME`), else time.
 */
export function actorFrame(actor: Actor, sprite: AtlasSprite, time: number): number {
  const action = actor.action ?? "idle";
  if (actor.distance !== undefined && action.includes("walk") && sprite.frameCount > 1) {
    const step = Math.floor(actor.distance / (sprite.def.stride ?? WALK_TILES_PER_FRAME) + (actor.phase ?? 0));
    return ((step % sprite.frameCount) + sprite.frameCount) % sprite.frameCount;
  }
  return frameAt(sprite, time, actor.phase ?? 0);
}

/** Resolution with a per-request cache and one warning per distinct fallback. */
export function createActorResolver(atlas: Atlas, warn?: (message: string) => void) {
  const cache = new Map<string, ResolvedActor>();
  const warned = new Set<string>();
  return (actor: Actor): ResolvedActor => {
    const action = actor.action ?? "idle", facing = actor.facing ?? "down";
    const key = `${actor.sprite}|${action}|${facing}`;
    let hit = cache.get(key);
    if (!hit) {
      hit = resolveActorSprite(atlas, actor.sprite, action, facing);
      cache.set(key, hit);
      // A wholly missing character warns once, not once per action and facing.
      const topic = hit.sprite.id === FALLBACK_CHARACTER && actor.sprite !== FALLBACK_CHARACTER ? `missing:${actor.sprite}` : key;
      // A placeholder is reported by the atlas's own `onPlaceholder`, once.
      if (hit.fallback && !hit.sprite.placeholder && !warned.has(topic)) {
        warned.add(topic);
        warn?.(`[pixel] actor "${actor.id}": ${hit.fallback}${topic.startsWith("missing:") ? ` (no ${actor.sprite}/* sprites yet)` : ""}`);
      }
    }
    return hit;
  };
}
