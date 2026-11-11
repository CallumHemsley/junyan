/**
 * An outdoor map (the town, the courtyard…) drawn by the pixel engine: the ground and props, the
 * player, the regulars, residents, cats and birds on their routes, and tall things fading while the
 * player is behind them. Thin: everything it draws comes from `./outdoor.ts` and the life rules. DOM
 * overlays (labels, the target cue) stay in `WorldViewport`. Any map registered in
 * `src/pixel/world/maps.ts` draws here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chooseZoom, createAtlas, createSceneRenderer, type Atlas, type Camera, type SceneRenderer, type Vec, type ZoomTargets } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import type { PixelViewApi } from "../../pixel/engine/PixelView.tsx";
import { sprites } from "../../pixel/registry.ts";
import { actorsFor } from "../life-bridge";
import type { GameState } from "../../contracts";
import type { WorldMapDefinition, WorldState } from "../schema";
import type { WaiterMotion } from "./cafe";
import { Surface, usePrefersReducedMotion } from "./PixelSurface";
import { liveOutdoor, occluderFade, outdoorActors, outdoorAtlasOptions, outdoorPhase, outdoorPlayer, placedById, previewState, runtimeFade, runtimeLights, runtimeProps } from "./outdoor";

const renderers = new Map<string, SceneRenderer>();
let atlas: Atlas | null = null;
/** One renderer per map for the session, over one atlas. Art still being drawn shows as boxes; dev builds list it once. */
function outdoorRenderer(mapId: string): SceneRenderer {
  const warn = import.meta.env.DEV ? (message: string) => console.warn(message) : undefined;
  let renderer = renderers.get(mapId);
  if (!renderer) renderers.set(mapId, renderer = createSceneRenderer(liveOutdoor(mapId), atlas ??= createAtlas(sprites, outdoorAtlasOptions(warn)), { warn }));
  return renderer;
}

/** Phones show about ten tiles across; landscape screens keep the engine's twenty. */
const TARGETS: ZoomTargets = { portraitTiles: 10 };
/** Life positions are sampled at this step (ms): smooth enough for a stroll, cheap enough per frame. */
const LIFE_STEP = 40;

/** The life clock, re-read every animation frame and quantised, so walkers move smoothly. */
function useLifeTime(read: () => number): number {
  const [time, setTime] = useState(() => Math.floor(read() / LIFE_STEP) * LIFE_STEP);
  const reader = useRef(read);
  reader.current = read;
  useEffect(() => {
    let handle = 0;
    const tick = () => {
      const next = Math.floor(reader.current() / LIFE_STEP) * LIFE_STEP;
      setTime((before) => (before === next ? before : next));
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, []);
  return time;
}

export type OutdoorViewProps = {
  map: WorldMapDefinition;
  game: GameState;
  world: WorldState;
  motion: WaiterMotion;
  /** Milliseconds of world life, as `WorldViewport` keeps it. */
  lifeClock: () => number;
  /** The whole viewport, CSS px: the zoom follows it, so opening a panel never rescales the map. */
  size: { width: number; height: number };
  /** CSS px of the viewport covered by an open panel: below on phones, at the right on desktops. */
  inset: { bottom: number; right: number };
  onPointerDown: (point: [number, number]) => void;
  onApi: (api: PixelViewApi | null) => void;
};

export default function OutdoorView({ map, game, world, motion, lifeClock, size, inset, onPointerDown, onApi }: OutdoorViewProps) {
  const renderer = outdoorRenderer(map.id);
  const reducedMotion = usePrefersReducedMotion();
  const [camera, setCamera] = useState<Camera | null>(null);
  const time = useLifeTime(lifeClock);
  const { x, y } = world.position, walking = motion.walking;
  const distance = walking ? motion.distance : 0;
  const player = useMemo(() => outdoorPlayer({ x, y }, world.facing, { walking, distance }), [x, y, world.facing, walking, distance]);
  const poses = useMemo(() => actorsFor(map, game, world, time, reducedMotion), [map, game, world.life, x, y, time, reducedMotion]);
  // Perching birds and resting regulars do not move: keep the same cast so the canvas is not redrawn for nothing.
  const castKey = poses.map(p => `${p.id}:${Math.round(p.position.x * TILE)},${Math.round(p.position.y * TILE)}:${p.facing}:${p.action}:${p.activity}:${Math.floor(p.phaseMs / 1600) % 3}`).join("|");
  const cast = useMemo(() => poses, [castKey]);
  const actors = useMemo(() => outdoorActors(cast, player), [cast, player]);
  // Props the game projects at run time (the rooftop garden's pots) draw beside the compiled scene's.
  const props = useMemo(() => runtimeProps(map.id, map.props), [map.id, map.props]);
  // An owned lamp glows where it stands; a furnishing being placed draws translucent.
  const lights = useMemo(() => runtimeLights(map.props), [map.props]);
  const translucent = useMemo(() => runtimeFade(map.props), [map.props]);
  const preview = previewState(map.props);
  const placed = useMemo(() => placedById(renderer.compiled), [renderer]);
  const fadeKey = useRef("");
  const fadeRef = useRef<Record<string, number>>({});
  const nextFade = occluderFade(placed, map.occluders, { x, y });
  const key = Object.keys(nextFade).join(",");
  // The same object while the faded set holds, so walking in the open never re-renders the surface for it.
  if (key !== fadeKey.current) { fadeKey.current = key; fadeRef.current = nextFade; }
  const fade = useMemo(() => (Object.keys(translucent).length ? { ...fadeRef.current, ...translucent } : fadeRef.current), [fadeRef.current, translucent]);
  const phase = outdoorPhase(game.served);
  const dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
  const zoom = chooseZoom(Math.max(1, size.width), Math.max(1, size.height), dpr, TARGETS);
  // A side panel covers part of the view, so the camera looks past the player by half its width.
  const fx = x + inset.right / 2 / ((TILE * zoom) / dpr);
  const focus = useMemo<Vec>(() => [fx, y], [fx, y]);
  const pointer = useRef(onPointerDown);
  pointer.current = onPointerDown;
  const down = useCallback((point: [number, number]) => pointer.current(point), []);
  const api = useRef(onApi);
  api.current = onApi;
  useEffect(() => () => api.current(null), []);
  return (
    // Under a bottom sheet the view shrinks to what stays visible, so the camera keeps the player in it.
    <div className={`pixel-map pixel-outdoor pixel-${map.id}`} data-pixel-scene={map.id} style={{ bottom: inset.bottom }} data-pixel-camera={camera ? JSON.stringify({ x: camera.x, y: camera.y, zoom: camera.zoom, dpr: camera.dpr, tile: TILE }) : undefined}
      data-faded={key || undefined} data-preview={preview ?? undefined}>
      <Surface renderer={renderer} actors={actors} props={props} fade={fade} lights={lights} phase={phase} focus={focus} zoom={zoom} reducedMotion={reducedMotion} onPointerDown={down} onCamera={setCamera} onApi={api} />
    </div>
  );
}
