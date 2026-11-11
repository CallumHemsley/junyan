/**
 * The town map drawn by the pixel engine: the lanes, the player, the regulars and birds on their
 * routes, and tall things fading while the player is behind them. Thin: everything it draws comes from
 * `./town.ts` and the life rules. DOM overlays (labels, the target cue) stay in `WorldViewport`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chooseZoom, createAtlas, createSceneRenderer, type Camera, type SceneRenderer, type Vec, type ZoomTargets } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import type { PixelViewApi } from "../../pixel/engine/PixelView.tsx";
import { sprites } from "../../pixel/registry.ts";
import { actorsFor } from "../life-bridge";
import type { GameState } from "../../contracts";
import type { WorldMapDefinition, WorldState } from "../schema";
import type { WaiterMotion } from "./cafe";
import { Surface, usePrefersReducedMotion } from "./PixelSurface";
import { liveTown, occluderFade, placedById, townActors, townAtlasOptions, townPhase, townPlayer } from "./town";

let shared: SceneRenderer | null = null;
/** One renderer for the session. Art still being drawn shows as boxes; dev builds list it once. */
function townRenderer(): SceneRenderer {
  const warn = import.meta.env.DEV ? (message: string) => console.warn(message) : undefined;
  return shared ??= createSceneRenderer(liveTown, createAtlas(sprites, townAtlasOptions(warn)), { warn });
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

export type TownViewProps = {
  map: WorldMapDefinition;
  game: GameState;
  world: WorldState;
  motion: WaiterMotion;
  /** Milliseconds of world life, as `WorldViewport` keeps it. */
  lifeClock: () => number;
  /** The whole viewport, CSS px: the zoom follows it, so opening a panel never rescales the town. */
  size: { width: number; height: number };
  /** CSS px of the viewport covered by an open panel: below on phones, at the right on desktops. */
  inset: { bottom: number; right: number };
  onPointerDown: (point: [number, number]) => void;
  onApi: (api: PixelViewApi | null) => void;
};

export default function TownView({ map, game, world, motion, lifeClock, size, inset, onPointerDown, onApi }: TownViewProps) {
  const renderer = townRenderer();
  const reducedMotion = usePrefersReducedMotion();
  const [camera, setCamera] = useState<Camera | null>(null);
  const time = useLifeTime(lifeClock);
  const { x, y } = world.position, walking = motion.walking;
  const distance = walking ? motion.distance : 0;
  const player = useMemo(() => townPlayer({ x, y }, world.facing, { walking, distance }), [x, y, world.facing, walking, distance]);
  const poses = useMemo(() => actorsFor(map, game, world, time, reducedMotion), [map, game, world.life, x, y, time, reducedMotion]);
  // Perching birds and resting regulars do not move: keep the same cast so the canvas is not redrawn for nothing.
  const castKey = poses.map(p => `${p.id}:${Math.round(p.position.x * TILE)},${Math.round(p.position.y * TILE)}:${p.facing}:${p.action}:${p.activity}:${Math.floor(p.phaseMs / 1600) % 3}`).join("|");
  const cast = useMemo(() => poses, [castKey]);
  const actors = useMemo(() => townActors(cast, player), [cast, player]);
  const placed = useMemo(() => placedById(renderer.compiled), [renderer]);
  const fadeKey = useRef("");
  const fadeRef = useRef<Record<string, number>>({});
  const nextFade = occluderFade(placed, map.occluders, { x, y });
  const key = Object.keys(nextFade).join(",");
  // The same object while the faded set holds, so walking in the open never re-renders the surface for it.
  if (key !== fadeKey.current) { fadeKey.current = key; fadeRef.current = nextFade; }
  const phase = townPhase(game.served);
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
    <div className="pixel-map pixel-town" style={{ bottom: inset.bottom }} data-pixel-camera={camera ? JSON.stringify({ x: camera.x, y: camera.y, zoom: camera.zoom, dpr: camera.dpr, tile: TILE }) : undefined}
      data-faded={key || undefined}>
      <Surface renderer={renderer} actors={actors} fade={fadeRef.current} phase={phase} focus={focus} zoom={zoom} reducedMotion={reducedMotion} onPointerDown={down} onCamera={setCamera} onApi={api} />
    </div>
  );
}
