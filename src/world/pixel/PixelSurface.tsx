/**
 * What the cafe and the town views share: the memoised `PixelView`, the reduced-motion preference and
 * the bridge that hands the camera's `toScreen` to `WorldViewport`'s DOM overlays.
 */
import { memo, useEffect, useState } from "react";
import type { Actor, Camera, DayPhase, Prop, SceneRenderer, Vec } from "../../pixel/engine/index.ts";
import { PixelView, type PixelViewApi } from "../../pixel/engine/PixelView.tsx";

export function usePrefersReducedMotion(): boolean {
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

/** Under reduced motion the scene holds still (no steam, no flicker); only walking moves. */
const frozenClock = () => 0;

export type SurfaceProps = {
  renderer: SceneRenderer;
  actors: readonly Actor[];
  props?: readonly Prop[];
  fade?: Readonly<Record<string, number>>;
  phase: DayPhase;
  focus: Vec;
  zoom: number;
  reducedMotion: boolean;
  onPointerDown: (point: [number, number]) => void;
  onCamera: (camera: Camera) => void;
  onApi: { current: (api: PixelViewApi | null) => void };
};

/** Memoised so the world clock's re-renders never mark the canvas dirty; only real changes redraw. */
export const Surface = memo(function Surface({ renderer, actors, props, fade, phase, focus, zoom, reducedMotion, onPointerDown, onCamera, onApi }: SurfaceProps) {
  return (
    <PixelView renderer={renderer} actors={actors} props={props} fade={fade} phase={phase} focus={focus} zoom={zoom} reducedMotion={reducedMotion}
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
