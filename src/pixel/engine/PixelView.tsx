/**
 * The only DOM piece of the engine: a canvas whose backing store is the art-resolution view,
 * scaled up by an integer zoom with `image-rendering: pixelated`, plus a DOM overlay layer
 * positioned in scene space for text (all Chinese text in the game is DOM, never canvas).
 *
 * It redraws only when something changed: inputs, camera, or the renderer's time key (an
 * animation frame ticking over, flicker, motes). The loop stops while the page is hidden or the
 * view is off-screen, and follows `prefers-reduced-motion` unless told otherwise.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { createCamera, toScreen, toWorld, type Camera, type ZoomTargets } from "./camera.ts";
import { createFrame } from "./frame.ts";
import type { SceneRenderer } from "./renderer.ts";
import type { Actor, DayPhase, Light, Prop, Vec } from "./types.ts";

export type PixelViewApi = {
  camera: Camera;
  /** Tile units → CSS px inside the view. */
  toScreen(point: Vec): [number, number];
  /** CSS px inside the view → tile units. */
  toWorld(x: number, y: number): [number, number];
};

export type PixelViewProps = {
  /** From `createSceneRenderer(scene, atlas)`; memoise it per scene. */
  renderer: SceneRenderer;
  actors?: readonly Actor[];
  props?: readonly Prop[];
  /** Opacity of props by id (see `FrameState.fade`). */
  fade?: Readonly<Record<string, number>>;
  /** Run-time lights (see `FrameState.lights`); keep the same array while they hold still. */
  lights?: readonly Light[];
  phase?: DayPhase;
  /** Tile units; the camera follows it. Default: scene centre. */
  focus?: Vec;
  debug?: boolean;
  /** Default: the user's `prefers-reduced-motion`. */
  reducedMotion?: boolean;
  /** Milliseconds; inject for tests. Default `performance.now`. */
  clock?: () => number;
  /** Force a zoom (device px per art px). Default: chosen from the size. */
  zoom?: number;
  /** Centre exactly on `focus`, past the scene's edges if need be (see `CameraInput.free`). */
  free?: boolean;
  targets?: ZoomTargets;
  className?: string;
  style?: CSSProperties;
  /** Pointer down, with the world point in tile units. */
  onPointerDown?: (world: [number, number], event: PointerEvent<HTMLDivElement>) => void;
  onCamera?: (camera: Camera) => void;
  /**
   * DOM overlays. The overlay layer ignores the pointer; give interactive children
   * `pointer-events: auto`. Position them with `api.toScreen(point)`.
   */
  children?: ReactNode | ((api: PixelViewApi) => ReactNode);
};

function usePrefersReducedMotion(): boolean {
  const query = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  const [reduced, setReduced] = useState(!!query?.matches);
  useEffect(() => {
    if (!query) return;
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [query?.media]);
  return reduced;
}

const sameCamera = (a: Camera | null, b: Camera) => !!a && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h && a.zoom === b.zoom && a.dpr === b.dpr;

export function PixelView(props: PixelViewProps) {
  const { renderer, actors, phase = "morning", focus, debug = false, zoom, free = false, targets, className, style, onPointerDown, onCamera, children } = props;
  const prefersReduced = usePrefersReducedMotion();
  const reducedMotion = props.reducedMotion ?? prefersReduced;
  const clock = props.clock ?? (() => performance.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; dpr: number } | null>(null);

  // Measure the container; the canvas backing store follows its CSS size and the DPR.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const next = { w: Math.max(1, Math.round(rect.width)), h: Math.max(1, Math.round(rect.height)), dpr: window.devicePixelRatio || 1 };
      setBox((current) => (current && current.w === next.w && current.h === next.h && current.dpr === next.dpr ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const size = renderer.compiled.scene.size;
  const cameraRef = useRef<Camera | null>(null);
  const camera = useMemo(() => {
    if (!box) return null;
    const next = createCamera({ cssWidth: box.w, cssHeight: box.h, dpr: box.dpr, sceneSize: size, focus, zoom, targets, free });
    // Keep the same object when nothing moved, so overlays do not re-render needlessly.
    if (sameCamera(cameraRef.current, next)) return cameraRef.current;
    cameraRef.current = next;
    return next;
  }, [box, size[0], size[1], focus?.[0], focus?.[1], zoom, free, targets?.landscapeTiles, targets?.portraitTiles]);

  useEffect(() => { if (camera) onCamera?.(camera); }, [camera]);

  // Latest inputs for the loop, and a dirty flag whenever any of them change.
  const live = useRef({ actors, props: props.props, fade: props.fade, lights: props.lights, phase, debug, reducedMotion, camera, renderer, clock, dirty: true });
  live.current = { actors, props: props.props, fade: props.fade, lights: props.lights, phase, debug, reducedMotion, camera, renderer, clock, dirty: true };

  useEffect(() => {
    const canvas = canvasRef.current, element = containerRef.current;
    if (!canvas || !element || !camera) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const frame = createFrame(camera.w, camera.h);
    const image = new ImageData(frame.data as Uint8ClampedArray<ArrayBuffer>, camera.w, camera.h);
    let lastKey = NaN, handle = 0, onScreen = true;

    const tick = () => {
      handle = 0;
      const now = live.current;
      const state = { time: now.clock(), phase: now.phase, actors: now.actors, props: now.props, fade: now.fade, lights: now.lights, reducedMotion: now.reducedMotion, debug: now.debug };
      const key = now.renderer.timeKey(state);
      if (now.dirty || key !== lastKey) {
        const cam = now.camera ?? camera;
        now.renderer.render(frame, cam, state);
        context.putImageData(image, 0, 0);
        // Report the first drawn frame, as the isometric painter's canvas does, so callers can wait for it.
        if (!canvas.dataset.rendered) canvas.dataset.rendered = "true";
        now.dirty = false;
        lastKey = key;
      }
      schedule();
    };
    const schedule = () => {
      if (!handle && onScreen && !document.hidden) handle = requestAnimationFrame(tick);
    };
    const stop = () => { if (handle) cancelAnimationFrame(handle); handle = 0; };
    // Coming back into view redraws once: a hidden page's canvas may have been discarded.
    const resume = () => { live.current.dirty = true; schedule(); };
    const visibility = () => (document.hidden ? stop() : resume());
    const intersection = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; onScreen ? resume() : stop(); });
    intersection.observe(element);
    document.addEventListener("visibilitychange", visibility);
    schedule();
    return () => { stop(); intersection.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [camera?.w, camera?.h, renderer]);

  const api = useMemo<PixelViewApi | null>(() => camera && {
    camera,
    toScreen: (point) => toScreen(camera, point),
    toWorld: (x, y) => toWorld(camera, x, y),
  }, [camera]);

  const scale = camera ? camera.zoom / camera.dpr : 1;
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", ...style }}
      onPointerDown={onPointerDown && api ? (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onPointerDown(api.toWorld(event.clientX - rect.left, event.clientY - rect.top), event);
      } : undefined}
    >
      <canvas
        ref={canvasRef}
        width={camera?.w ?? 1}
        height={camera?.h ?? 1}
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: 0, width: (camera?.w ?? 1) * scale, height: (camera?.h ?? 1) * scale, imageRendering: "pixelated", display: "block" }}
      />
      {api && children !== undefined && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {typeof children === "function" ? children(api) : children}
        </div>
      )}
    </div>
  );
}
