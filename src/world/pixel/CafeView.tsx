/**
 * The restaurant map drawn by the pixel engine: the cafe scene, the waiter and what is on the tray, the regulars at their
 * tables and the food they were served. Thin: everything it draws comes from `./cafe.ts`.
 * DOM overlays (labels, the target cue) stay in `WorldViewport`, positioned with `onApi`'s `toScreen`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chooseZoom, createAtlas, createSceneRenderer, type Camera, type SceneRenderer, type Vec, type ZoomTargets } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import type { PixelViewApi } from "../../pixel/engine/PixelView.tsx";
import { Surface, usePrefersReducedMotion } from "./PixelSurface";
import { sprites } from "../../pixel/registry.ts";
import { restoreLife } from "../life";
import { serviceDayPhase } from "../lighting";
import type { GameState } from "../../contracts";
import type { WorldState } from "../schema";
import { cafeCast, cafeDishes, cafePhase, liveCafe, serviceFacing, waiterActors, type WaiterMotion } from "./cafe";

let shared: SceneRenderer | null = null;
/** One renderer for the session: the atlas bakes sprites lazily, the scene compiles once. */
function cafeRenderer(): SceneRenderer {
  return shared ??= createSceneRenderer(liveCafe, createAtlas(sprites), { warn: import.meta.env.DEV ? message => console.warn(message) : undefined });
}

/** Phones show about nine tiles across, so faces read; landscape screens keep the engine's twenty. */
const TARGETS: ZoomTargets = { portraitTiles: 9 };

export type CafeViewProps = {
  game: GameState;
  world: WorldState;
  motion: WaiterMotion;
  /** The whole viewport, CSS px: the zoom follows it, so opening a panel never rescales the room. */
  size: { width: number; height: number };
  /** CSS px of the viewport covered by an open panel: below on phones, at the right on desktops. */
  inset: { bottom: number; right: number };
  onPointerDown: (point: [number, number]) => void;
  onApi: (api: PixelViewApi | null) => void;
};

export default function CafeView({ game, world, motion, size, inset, onPointerDown, onApi }: CafeViewProps) {
  const renderer = cafeRenderer();
  const reducedMotion = usePrefersReducedMotion();
  const [camera, setCamera] = useState<Camera | null>(null);
  const { x, y } = world.position, walking = motion.walking;
  const tray = game.tray, trayKey = tray.join(",");
  const distance = walking ? motion.distance : 0;
  const facing = serviceFacing({ x, y }, world.activeAnchorId) ?? world.facing;
  const waiter = useMemo(() => waiterActors({ x, y }, facing, tray, { walking, distance }), [x, y, facing, trayKey, walking, distance]);
  // Who is seated and what is on the tables changes only with service, not with the clock.
  const serviceKey = JSON.stringify([game.day, game.customers, restoreLife(game.world?.life).serviceDepartures]);
  const service = useMemo(() => ({ cast: cafeCast(game), dishes: cafeDishes(game) }), [serviceKey]);
  const actors = useMemo(() => [...service.cast, ...waiter], [service, waiter]);
  const phase = cafePhase(serviceDayPhase(game.served));
  const dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
  const zoom = chooseZoom(Math.max(1, size.width), Math.max(1, size.height), dpr, TARGETS);
  // A side panel covers only part of the view's height, so the camera looks past the waiter by half
  // its width instead of losing the whole column (the camera still stops at the room's edge).
  const fx = x + inset.right / 2 / ((TILE * zoom) / dpr);
  const focus = useMemo<Vec>(() => [fx, y], [fx, y]);
  const pointer = useRef(onPointerDown);
  pointer.current = onPointerDown;
  const down = useCallback((point: [number, number]) => pointer.current(point), []);
  const api = useRef(onApi);
  api.current = onApi;
  useEffect(() => () => api.current(null), []);
  return (
    // Under a bottom sheet the view shrinks to what stays visible, so the camera keeps the waiter in it.
    <div className="pixel-map pixel-cafe" style={{ bottom: inset.bottom }} data-pixel-camera={camera ? JSON.stringify({ x: camera.x, y: camera.y, zoom: camera.zoom, dpr: camera.dpr, tile: TILE }) : undefined}>
      <Surface renderer={renderer} actors={actors} props={service.dishes} phase={phase} focus={focus} zoom={zoom} reducedMotion={reducedMotion} onPointerDown={down} onCamera={setCamera} onApi={api} />
    </div>
  );
}
