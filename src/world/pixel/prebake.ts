/**
 * The outdoor maps' shared atlas and renderers, and baking a map's art before the player gets there
 * (ticket 0200). Sprites bake lazily on first use, and the park or riverbank have about a hundred
 * tree crowns each: seconds of baking that would freeze the first step onto the map. So while the
 * player is on a map, its neighbours (the maps its exits lead to, and those whose exits lead here)
 * are compiled in idle slices and their sprites baked in a worker, frame by frame, then handed to the
 * atlas. Nothing visual changes: a pre-baked frame is the same bytes as a lazily baked one.
 *
 * Without workers (an old browser, a failed load) the sprites bake in idle slices on the main
 * thread instead: one sprite per slice, which can still cost a long frame for a big tree, but never
 * the whole map at once.
 */
import {
  DAY_PHASES, GRADES, browserIdleSchedule, createAtlas, createIdleQueue, createSceneRenderer, gradeLut, sceneSprites, unbakedFrames,
  type Atlas, type IdleQueue, type SceneRenderer,
} from "../../pixel/engine/index.ts";
import { OUTDOOR_MAP_IDS, outdoorMap } from "../../pixel/world/maps.ts";
import { sprites } from "../../pixel/registry.ts";
import { liveOutdoor, outdoorAtlasOptions } from "./outdoor";

const warn = import.meta.env.DEV ? (message: string) => console.warn(message) : undefined;
const renderers = new Map<string, SceneRenderer>();
let atlas: Atlas | null = null;

/** One atlas for every outdoor map. Art still being drawn shows as boxes; dev builds list it once. */
export const outdoorAtlas = (): Atlas => (atlas ??= createAtlas(sprites, outdoorAtlasOptions(warn)));

/** One renderer per map for the session, over the one atlas. */
export function outdoorRenderer(mapId: string): SceneRenderer {
  let renderer = renderers.get(mapId);
  if (!renderer) renderers.set(mapId, renderer = createSceneRenderer(liveOutdoor(mapId), outdoorAtlas(), { warn }));
  return renderer;
}

/**
 * Outdoor maps one step from `mapId`: where its exits lead, and which maps have an exit to it (so
 * the restaurant, which is not an outdoor map, still knows the town is next door). Sorted, so the
 * order is deterministic.
 */
export function neighbourMaps(mapId: string): string[] {
  const out = new Set<string>();
  if (OUTDOOR_MAP_IDS.includes(mapId)) for (const exit of outdoorMap(mapId).exits) if (OUTDOOR_MAP_IDS.includes(exit.targetMapId)) out.add(exit.targetMapId);
  for (const id of OUTDOOR_MAP_IDS) if (outdoorMap(id).exits.some((e) => e.targetMapId === mapId)) out.add(id);
  out.delete(mapId);
  return [...out].sort();
}

type BakeJob = { map: string; sprites: { id: string; frames: number[] }[] };
type BakeResult = { id: string; index: number; data: Uint8ClampedArray } | { map: string; done: true };

let queue: IdleQueue | null = null;
let worker: Worker | null | undefined;
const started = new Set<string>();
/** Maps whose sprites went to the worker and have not come back finished. */
const posted = new Set<string>();
const ready = new Map<string, () => void>();
const readyPromises = new Map<string, Promise<void>>();

function idle(): IdleQueue {
  return (queue ??= createIdleQueue(browserIdleSchedule()));
}

/** The bake worker, or null where workers are unavailable (then baking falls back to idle slices). */
function bakeWorker(): Worker | null {
  if (worker !== undefined) return worker;
  if (typeof Worker === "undefined") return (worker = null);
  try {
    const w = new Worker(new URL("./bake.worker.ts", import.meta.url), { type: "module" });
    w.onmessage = (event: MessageEvent<BakeResult>) => {
      const message = event.data;
      if ("done" in message) idle().push(() => finish(message.map));
      else outdoorAtlas().find(message.id)?.adopt(message.index, message.data);
    };
    w.onerror = () => {
      // The worker could not load: bake what is left on the main thread instead.
      w.terminate();
      worker = null;
      for (const map of posted) bakeOnMainThread(map);
      posted.clear();
    };
    return (worker = w);
  } catch {
    return (worker = null);
  }
}

/** The map's floor cache, once its sprites are in: the last bit of first-frame work. */
function finish(mapId: string) {
  posted.delete(mapId);
  outdoorRenderer(mapId).warm();
  ready.get(mapId)?.();
  ready.delete(mapId);
}

function bakeOnMainThread(mapId: string) {
  for (const sprite of sceneSprites(outdoorRenderer(mapId).compiled)) idle().push(() => { for (const i of unbakedFrames(sprite)) sprite.frame(i); });
  idle().push(() => finish(mapId));
}

function prepare(mapId: string) {
  const job: BakeJob = { map: mapId, sprites: [] };
  for (const sprite of sceneSprites(outdoorRenderer(mapId).compiled)) {
    const frames = unbakedFrames(sprite);
    if (frames.length) job.sprites.push({ id: sprite.id, frames });
  }
  const w = bakeWorker();
  if (w) { posted.add(mapId); w.postMessage(job); }
  else bakeOnMainThread(mapId);
}

/**
 * Start baking the maps next to `mapId` (each map once per session). Scenes compile in idle slices;
 * sprites bake in the worker. Returns at once.
 */
export function prebakeAround(mapId: string): void {
  // The colour grade's tables (about 20 ms each, shared by every map), once, so no phase's first frame builds one.
  if (!started.size) for (const phase of DAY_PHASES) idle().push(() => gradeLut(GRADES[phase]));
  for (const neighbour of neighbourMaps(mapId)) {
    if (started.has(neighbour)) continue;
    started.add(neighbour);
    readyPromises.set(neighbour, new Promise<void>((resolve) => ready.set(neighbour, resolve)));
    idle().push(() => prepare(neighbour));
  }
}

/** Resolves once `mapId` is fully baked by `prebakeAround` (tests and timing; never awaited by the game). */
export const whenPrebaked = (mapId: string): Promise<void> | undefined => readyPromises.get(mapId);
