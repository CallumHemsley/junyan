/**
 * An outdoor map (the town, the courtyard: every map in `src/pixel/world/maps.ts`), drawn by the pixel
 * engine: pure functions from game state to what the pixel engine draws (scene, cast, light, which
 * props fade). No DOM; `OutdoorView.tsx` renders the result. Outdoor map units are the scene's tiles,
 * so a world position is an actor position as it is.
 */
import { outdoorScene } from "../../pixel/world/scene.ts";
import { outdoorMap, propSpriteId } from "../../pixel/world/maps.ts";
import { townPlaceholderOptions } from "../../pixel/town/placeholders.ts";
import type { Actor, AtlasOptions, CompiledScene, DayPhase, Facing, Placed, Prop, Scene } from "../../pixel/engine/index.ts";
import { TILE, hash } from "../../pixel/kit/index.ts";
import type { ActorPose } from "../life";
import { serviceDayPhase } from "../lighting";
import type { Facing as WorldFacing, Point } from "../schema";
import { cafePhase, pixelFacing, waiterActor, type WaiterMotion } from "./cafe";

const live = new Map<string, Scene>();
/** The scene the game walks on an outdoor map: the compiled map, with no cast of its own (the game supplies it). */
export function liveOutdoor(mapId: string): Scene {
  let scene = live.get(mapId);
  if (!scene) live.set(mapId, scene = { ...outdoorScene(mapId), actors: undefined });
  return scene;
}

/** A map prop as game state hands it over: the static map's props plus any projected at run time. */
export type LiveProp = { id: string; kind: string; position: Point; width: number; height: number; variant: number | string; layer?: string };

/**
 * Props the game projects onto a map at run time (the rooftop garden's pots, its shade and crates),
 * which the compiled scene does not know: each draws as `<map>/<id without "<map>.">` on its
 * footprint's bottom-centre like any map prop, showing frame `variant` (mod its frame count), so one
 * sprite carries every state of a growing plant. Static props are the scene's and are skipped.
 */
export function runtimeProps(mapId: string, props: readonly LiveProp[]): Prop[] {
  const known = new Set(outdoorMap(mapId).props.map((p) => p.id));
  return props.filter((p) => !known.has(p.id)).map((p): Prop => ({
    id: p.id, sprite: propSpriteId(mapId, p.id), at: [p.position.x + p.width / 2, p.position.y + p.height], frame: typeof p.variant === "number" ? p.variant : 0, solid: false,
    ...(p.layer === "ground" ? { layer: "floor" as const } : {}),
  }));
}

/**
 * Atlas options for outdoor maps in the game: art still being drawn shows as placeholder boxes in
 * every build (so a map never throws), and dev builds list the missing ids once.
 */
export function outdoorAtlasOptions(report?: (message: string) => void): AtlasOptions {
  const options = townPlaceholderOptions(report ?? (() => {}));
  return report ? options : { placeholder: options.placeholder };
}

/** The light follows the day's service, as in the cafe. */
export const outdoorPhase = (served: number): DayPhase => cafePhase(serviceDayPhase(served));

/** The player walking outdoors: the same character as the waiter, with empty hands. */
export const outdoorPlayer = (position: Point, facing: WorldFacing, motion: WaiterMotion): Actor => waiterActor(position, facing, [], motion);

/** Life characters → pixel characters. Unknown residents use `char/<id>` (a placeholder until drawn). */
export const LIFE_CHARACTERS: Readonly<Record<string, string>> = {
  "lin-jie": "char/lin-jie",
  "zhang-laoshi": "char/zhang-laoshi",
  "xiao-zhou": "char/xiao-zhou",
  "resident-courier": "char/courier",
};

/** Birds by flock: pigeons by the canal, sparrows everywhere else. */
export const birdSprite = (hookId: string) => hookId.includes("canal") ? "critter/pigeon" : "critter/sparrow";

/** The courtyard story's two cats, told apart by colour in a clue; every other cat is the street tabby. */
export const STORY_CATS: Readonly<Record<string, string>> = {
  "white-cat": "critter/cat-white",
  "cats.white": "critter/cat-white",
  "black-cat": "critter/cat-black",
  "cats.black": "critter/cat-black",
};
export const catSprite = (characterId: string) => STORY_CATS[characterId] ?? "critter/cat-tabby";

/** Critters face down, left or right; one heading north turns to the side it is drifting. */
function critterFacing(pose: ActorPose): Facing {
  const facing = pixelFacing(pose.facing);
  if (facing !== "up") return facing;
  return pose.yaw !== undefined && Math.cos(pose.yaw) < 0 ? "left" : "right";
}

/** A bird's action: flying off when startled, hopping along its route, else idling with the odd peck. */
function birdAction(pose: ActorPose): string {
  if (pose.activity === "startle") return "fly";
  if (pose.action === "walk") return "hop";
  return Math.floor(pose.phaseMs / 1600) % 3 === 1 ? "peck" : "idle";
}

/** One life actor (a regular on their route, the courier, a bird) as a pixel actor. */
export function lifeActor(pose: ActorPose): Actor {
  const id = `life/${pose.id}`, at = [pose.position.x, pose.position.y] as const;
  // A per-actor animation offset, so a flock does not bob in step.
  const phase = Math.floor(hash(pose.id.length, pose.id.charCodeAt(pose.id.length - 1), 7) * 4);
  if (pose.kind === "bird") return { id, sprite: birdSprite(pose.id), at, facing: critterFacing(pose), action: birdAction(pose), phase };
  // A cat's `idle` is already sitting up; it has no separate `sit`.
  if (pose.kind === "cat") return { id, sprite: catSprite(pose.characterId), at, facing: critterFacing(pose), action: pose.action === "walk" ? "walk" : "idle", phase };
  const action = pose.action === "walk" ? "walk" : pose.activity === "sit" ? "sit" : "idle";
  return { id, sprite: LIFE_CHARACTERS[pose.characterId] ?? `char/${pose.characterId}`, at, facing: pixelFacing(pose.facing), action, phase };
}

/** An outdoor map's cast: everyone life places on it, then the player. */
export function outdoorActors(poses: readonly ActorPose[], player: Actor): Actor[] {
  return [...poses.map(lifeActor), player];
}

/** The player's body in art px from the feet `[dx, dy, w, h]`: a person in a 32×64 frame is about 18×54. */
export const PLAYER_BODY = [-9, -54, 18, 54] as const;
/** How opaque a prop is while the player is behind it. */
export const FADED = 0.35;
/** Fade only when the prop's art really covers this many of the player's pixels (a leaf tip is not enough). */
export const MIN_COVER = 40;

export type Occluder = { id: string; fadeWhenPlayerBehind?: boolean };

/** Scene props by id, objects and over-layer alike, for occlusion. */
export function placedById(compiled: CompiledScene): Map<string, Placed> {
  const out = new Map<string, Placed>();
  for (const placed of [...compiled.objects, ...compiled.over]) if (placed.prop?.id) out.set(placed.prop.id, placed);
  return out;
}

/** Opaque pixels of `placed` (as drawn now) inside the world-px rectangle. */
function coverage(placed: Placed, x0: number, y0: number, x1: number, y1: number): number {
  const image = placed.sprite.frame(placed.frame >= 0 ? placed.frame : 0, placed.flipX);
  let count = 0;
  for (let y = Math.max(y0, placed.top); y < Math.min(y1, placed.top + image.h); y++)
    for (let x = Math.max(x0, placed.left); x < Math.min(x1, placed.left + image.w); x++)
      if (image.data[((y - placed.top) * image.w + x - placed.left) * 4 + 3] > 0) count++;
  return count;
}

/**
 * Which props to fade so the player stays visible: the map's occluders marked
 * `fadeWhenPlayerBehind` whose art is drawn over the player (they sort in front, or hang above
 * everyone) and covers at least `MIN_COVER` of the player's body pixels. Keyed by prop id, for `FrameState.fade`.
 */
export function occluderFade(placed: ReadonlyMap<string, Placed>, occluders: readonly Occluder[], player: Point): Record<string, number> {
  const feetX = Math.round(player.x * TILE), feetY = Math.round(player.y * TILE);
  const x0 = feetX + PLAYER_BODY[0], y0 = feetY + PLAYER_BODY[1], x1 = x0 + PLAYER_BODY[2], y1 = y0 + PLAYER_BODY[3];
  const fade: Record<string, number> = {};
  for (const occluder of occluders) {
    if (!occluder.fadeWhenPlayerBehind) continue;
    const prop = placed.get(occluder.id);
    if (!prop || (prop.layer === "object" && prop.sortY <= feetY)) continue;
    if (prop.left >= x1 || prop.top >= y1 || prop.left + prop.sprite.w <= x0 || prop.top + prop.sprite.h <= y0) continue;
    if (coverage(prop, x0, y0, x1, y1) >= MIN_COVER) fade[occluder.id] = FADED;
  }
  return fade;
}
