/**
 * The hospital opening's ward drawn by the pixel engine. Thin: everything it draws comes from
 * `./ward.ts`. A fixed camera fits the scene's `view` rectangle into the box at the largest whole
 * zoom, so the pixels stay crisp; no text is drawn in the canvas (the opening's words are DOM).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createAtlas, createSceneRenderer, type SceneRenderer } from "../../pixel/engine/index.ts";
import { PixelView } from "../../pixel/engine/PixelView.tsx";
import { sprites } from "../../pixel/registry.ts";
import ward from "../../pixel/scenes/ward.ts";
import type { WardFrame } from "../../opening-view";
import { WARD_FOCUS, wardStage, wardZoom } from "./ward";

let shared: SceneRenderer | null = null;
/** One renderer for the session: the atlas bakes sprites lazily, the scene compiles once. */
function wardRenderer(): SceneRenderer {
  return shared ??= createSceneRenderer(ward, createAtlas(sprites), { warn: import.meta.env.DEV ? message => console.warn(message) : undefined });
}
const has = (id: string) => id in sprites;

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
/** Under reduced motion the ward holds still: no dust motes, no idle breathing. */
const frozenClock = () => 0;

export default function WardView({ frame }: { frame: WardFrame }) {
  const renderer = wardRenderer();
  const reducedMotion = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number; dpr: number } | null>(null);
  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const next = { width: Math.max(1, Math.round(rect.width)), height: Math.max(1, Math.round(rect.height)), dpr: window.devicePixelRatio || 1 };
      setSize(current => current && current.width === next.width && current.height === next.height && current.dpr === next.dpr ? current : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const stage = useMemo(() => wardStage(frame, has), [frame]);
  const zoom = size ? wardZoom(size.width, size.height, size.dpr) : undefined;
  return (
    <div className="pixel-ward" ref={box} data-testid="ward-scene" data-zoom={zoom}>
      {size && (
        <PixelView renderer={renderer} actors={stage.actors} props={stage.props} phase="morning" focus={WARD_FOCUS} zoom={zoom}
          reducedMotion={reducedMotion} clock={reducedMotion ? frozenClock : undefined} />
      )}
    </div>
  );
}
