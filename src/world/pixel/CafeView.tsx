/**
 * The restaurant map drawn by the pixel engine: the cafe scene, the waiter, the regulars at their
 * tables and the food they were served. Thin: everything it draws comes from `./cafe.ts`.
 * DOM overlays (labels, the target cue) stay in `WorldViewport`, positioned with `onApi`'s `toScreen`.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAtlas, createSceneRenderer, type Camera, type SceneRenderer, type Vec } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import { PixelView, type PixelViewApi } from "../../pixel/engine/PixelView.tsx";
import { sprites } from "../../pixel/registry.ts";
import { restoreLife } from "../life";
import { serviceDayPhase } from "../lighting";
import type { GameState } from "../../contracts";
import type { WorldState } from "../schema";
import { cafeCast, cafeDishes, cafePhase, liveCafe, waiterActor, type WaiterMotion } from "./cafe";

let shared: SceneRenderer | null = null;
/** One renderer for the session: the atlas bakes sprites lazily, the scene compiles once. */
function cafeRenderer(): SceneRenderer {
  return shared ??= createSceneRenderer(liveCafe, createAtlas(sprites), { warn: import.meta.env.DEV ? message => console.warn(message) : undefined });
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
/** Under reduced motion the room holds still (no steam, no flicker); only the player's own walking moves. */
const frozenClock = () => 0;

export type CafeViewProps = {
  game: GameState;
  world: WorldState;
  motion: WaiterMotion;
  /** CSS px of the view covered by an open panel: below on phones, at the right on desktops. */
  inset: { bottom: number; right: number };
  onPointerDown: (point: [number, number]) => void;
  onApi: (api: PixelViewApi | null) => void;
};

export default function CafeView({ game, world, motion, inset, onPointerDown, onApi }: CafeViewProps) {
  const renderer = cafeRenderer();
  const reducedMotion = usePrefersReducedMotion();
  const [camera, setCamera] = useState<Camera | null>(null);
  const { x, y } = world.position, walking = motion.walking;
  const carrying = game.tray.length > 0;
  const distance = walking ? motion.distance : 0;
  const waiter = useMemo(() => waiterActor({ x, y }, world.facing, carrying ? ["tray"] : [], { walking, distance }), [x, y, world.facing, carrying, walking, distance]);
  // Who is seated and what is on the tables changes only with service, not with the clock.
  const serviceKey = JSON.stringify([game.day, game.customers, restoreLife(game.world?.life).serviceDepartures]);
  const service = useMemo(() => ({ cast: cafeCast(game), dishes: cafeDishes(game) }), [serviceKey]);
  const actors = useMemo(() => [...service.cast, waiter], [service, waiter]);
  const phase = cafePhase(serviceDayPhase(game.served));
  // Keep the waiter clear of an open panel: the camera centres past them by half the panel.
  const scale = camera ? (TILE * camera.zoom) / camera.dpr : 0;
  const fx = scale ? x + inset.right / 2 / scale : x, fy = scale ? y + inset.bottom / 2 / scale : y;
  const focus = useMemo<Vec>(() => [fx, fy], [fx, fy]);
  const pointer = useRef(onPointerDown);
  pointer.current = onPointerDown;
  const down = useCallback((point: [number, number]) => pointer.current(point), []);
  const api = useRef(onApi);
  api.current = onApi;
  useEffect(() => () => api.current(null), []);
  return (
    <div className="pixel-cafe" data-pixel-camera={camera ? JSON.stringify({ x: camera.x, y: camera.y, zoom: camera.zoom, dpr: camera.dpr }) : undefined}>
      <Surface renderer={renderer} actors={actors} props={service.dishes} phase={phase} focus={focus} reducedMotion={reducedMotion} onPointerDown={down} onCamera={setCamera} onApi={api} />
    </div>
  );
}

type SurfaceProps = {
  renderer: SceneRenderer;
  actors: ReturnType<typeof cafeCast>;
  props: ReturnType<typeof cafeDishes>;
  phase: ReturnType<typeof cafePhase>;
  focus: Vec;
  reducedMotion: boolean;
  onPointerDown: (point: [number, number]) => void;
  onCamera: (camera: Camera) => void;
  onApi: { current: (api: PixelViewApi | null) => void };
};

/** Memoised so the world clock's re-renders never mark the canvas dirty; only real changes redraw. */
const Surface = memo(function Surface({ renderer, actors, props, phase, focus, reducedMotion, onPointerDown, onCamera, onApi }: SurfaceProps) {
  return (
    <PixelView renderer={renderer} actors={actors} props={props} phase={phase} focus={focus} reducedMotion={reducedMotion}
      clock={reducedMotion ? frozenClock : undefined} onPointerDown={onPointerDown} onCamera={onCamera}>
      {api => <ApiBridge api={api} onApi={onApi} />}
    </PixelView>
  );
});

/** Hands the camera's `toScreen` to the overlays without rendering anything. */
function ApiBridge({ api, onApi }: { api: PixelViewApi; onApi: { current: (api: PixelViewApi | null) => void } }) {
  useEffect(() => { onApi.current(api); }, [api]);
  return null;
}
