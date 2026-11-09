/**
 * Silent dev harness for the pixel engine, served by Vite at /src/pixel/harness.html.
 * Gallery: every sprite by domain, animated, with optional anchor/foot overlay.
 * Scene: walk the waiter (arrows / WASD) with collision, switch day phase, show debug.
 * Query: ?tab=scene&scene=demo&phase=night&debug=1
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { PALETTE, type Color } from "./kit/index.ts";
import {
  DAY_PHASES, PERSON_RADIUS, createAtlas, createSceneRenderer, frameAt, move,
  type Actor, type AtlasSprite, type DayPhase, type Facing,
} from "./engine/index.ts";
import { PixelView } from "./engine/PixelView.tsx";
import { sprites } from "./registry.ts";
import { scenes } from "./scenes/index.ts";

if (!import.meta.env.DEV) throw new Error("Development harness only");

const atlas = createAtlas(sprites);
const params = new URLSearchParams(location.search);
const warn = (message: string) => console.warn(message);

const css = `
  html, body { margin: 0; height: 100%; background: #1d1620; color: #f0e2c0; font: 13px/1.4 ui-sans-serif, system-ui, sans-serif; }
  #pixel-harness { height: 100%; display: flex; flex-direction: column; }
  .px-bar { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; padding: 8px 12px; background: #2b1d2e; border-bottom: 1px solid #45283c; }
  .px-bar button, .px-bar select { font: inherit; color: inherit; background: #45283c; border: 1px solid #5d3a6a; border-radius: 6px; padding: 6px 10px; min-height: 32px; }
  .px-bar button[aria-pressed="true"] { background: #8a5b96; }
  .px-bar label { display: inline-flex; gap: 6px; align-items: center; }
  .px-gallery { overflow: auto; padding: 12px; flex: 1; }
  .px-domain h2 { font-size: 14px; margin: 16px 0 8px; color: #e3b877; text-transform: uppercase; letter-spacing: .08em; }
  .px-cells { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
  .px-cell { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .px-cell small { opacity: .75; font-size: 11px; }
  .px-art { position: relative; }
  .px-art canvas { display: block; image-rendering: pixelated; }
  .px-scene { flex: 1; min-height: 0; position: relative; }
  .px-mark { position: absolute; transform: translate(-50%, -130%); font-size: 10px; padding: 1px 4px; border-radius: 3px; background: rgba(43,29,46,.8); white-space: nowrap; }
  .px-sign { position: absolute; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #2b1d2e; outline: 1px dashed #e0a93a; }
  .px-help { opacity: .7; }
`;

// ── Gallery ──────────────────────────────────────────────────────────────────

const BACKGROUNDS: (Color | "checker")[] = ["stone4", "oak4", "cream4", "jade3", "ink", "checker"];

/** One animation clock for every gallery cell; cells redraw only when their frame changes. */
const ticks = new Set<(time: number) => void>();
function useGalleryClock(running: boolean) {
  useEffect(() => {
    if (!running) return;
    let handle = requestAnimationFrame(function loop(time) { for (const tick of ticks) tick(time); handle = requestAnimationFrame(loop); });
    return () => cancelAnimationFrame(handle);
  }, [running]);
}

function SpriteCell({ sprite, zoom, background, overlay }: { sprite: AtlasSprite; zoom: number; background: Color | "checker"; overlay: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = ref.current?.getContext("2d");
    if (!context) return;
    let shown = -1;
    const draw = (time: number) => {
      const index = frameAt(sprite, time);
      if (index === shown) return;
      shown = index;
      const frame = sprite.frame(index);
      context.putImageData(new ImageData(new Uint8ClampedArray(frame.data), frame.w, frame.h), 0, 0);
    };
    draw(0);
    if (sprite.frameCount > 1) { ticks.add(draw); return () => { ticks.delete(draw); }; }
  }, [sprite]);
  const [ax, ay] = sprite.anchor, foot = sprite.def.foot, shadow = sprite.def.shadow;
  const bg: CSSProperties = background === "checker"
    ? { backgroundImage: "repeating-conic-gradient(#9c8f8a 0 25%, #c2b5a8 0 50%)", backgroundSize: `${zoom * 4}px ${zoom * 4}px` }
    : { background: PALETTE[background] };
  return (
    <div className="px-cell">
      <div className="px-art" style={{ ...bg, width: sprite.w * zoom, height: sprite.h * zoom }}>
        <canvas ref={ref} width={sprite.w} height={sprite.h} style={{ width: sprite.w * zoom, height: sprite.h * zoom }} />
        {overlay && <>
          {shadow && <div style={{ position: "absolute", left: (ax + (shadow.dx ?? 0) - shadow.rx) * zoom, top: (ay + (shadow.dy ?? 0) - shadow.ry) * zoom, width: shadow.rx * 2 * zoom, height: shadow.ry * 2 * zoom, border: "1px dashed #8a5b96", borderRadius: "50%", boxSizing: "border-box" }} />}
          {foot && <div style={{ position: "absolute", left: (ax + foot[0]) * zoom, top: (ay + foot[1]) * zoom, width: foot[2] * zoom, height: foot[3] * zoom, outline: "1px solid #d95a44", background: "rgba(217,90,68,.15)" }} />}
          <div style={{ position: "absolute", left: ax * zoom - 3, top: ay * zoom - 3, width: 6, height: 6, borderRadius: 3, background: "#f5cf5b", boxShadow: "0 0 0 1px #2b1d2e" }} />
        </>}
      </div>
      <small>{sprite.id} · {sprite.w}×{sprite.h}{sprite.frameCount > 1 ? ` · ${sprite.frameCount}f@${sprite.fps}` : ""}{sprite.layer !== "object" ? ` · ${sprite.layer}` : ""}</small>
    </div>
  );
}

function Gallery() {
  const [zoom, setZoom] = useState(Number(params.get("zoom") ?? 4));
  const [background, setBackground] = useState<Color | "checker">((params.get("bg") as Color) ?? "stone4");
  const [overlay, setOverlay] = useState(params.get("overlay") === "1");
  const [animate, setAnimate] = useState(true);
  const [filter, setFilter] = useState(params.get("filter") ?? "");
  useGalleryClock(animate);
  const groups = useMemo(() => {
    const out = new Map<string, AtlasSprite[]>();
    for (const id of atlas.ids()) {
      if (filter && !id.includes(filter)) continue;
      const domain = id.split("/")[0];
      if (!out.has(domain)) out.set(domain, []);
      out.get(domain)!.push(atlas.get(id));
    }
    return out;
  }, [filter]);
  return <>
    <div className="px-bar">
      <label>Zoom <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>{[1, 2, 3, 4, 6, 8].map((z) => <option key={z} value={z}>{z}×</option>)}</select></label>
      <label>Ground <select value={background} onChange={(e) => setBackground(e.target.value as Color | "checker")}>{BACKGROUNDS.map((b) => <option key={b}>{b}</option>)}</select></label>
      <label><input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} /> Anchor, foot, shadow</label>
      <label><input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} /> Animate</label>
      <label>Filter <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="furn/" style={{ font: "inherit", width: 120 }} /></label>
      <span className="px-help">{atlas.ids().length} sprites</span>
    </div>
    <div className="px-gallery">
      {[...groups].map(([domain, list]) => (
        <section className="px-domain" key={domain}>
          <h2>{domain}</h2>
          <div className="px-cells">{list.map((sprite) => <SpriteCell key={sprite.id} sprite={sprite} zoom={zoom} background={background} overlay={overlay} />)}</div>
        </section>
      ))}
    </div>
  </>;
}

// ── Scene ────────────────────────────────────────────────────────────────────

const KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0],
};
const SPEED = 3.2; // tiles per second

function SceneTab() {
  const ids = Object.keys(scenes);
  const [sceneId, setSceneId] = useState(params.get("scene") && scenes[params.get("scene")!] ? params.get("scene")! : ids[0]);
  const [phase, setPhase] = useState<DayPhase>((params.get("phase") as DayPhase) ?? "morning");
  const [debug, setDebug] = useState(params.get("debug") === "1");
  const [reduced, setReduced] = useState<boolean | undefined>(params.get("reduced") === "1" ? true : undefined);
  const scene = scenes[sceneId];
  const renderer = useMemo(() => createSceneRenderer(scene, atlas, { warn }), [scene]);
  const start = scene.actors?.[0] ?? { id: "waiter", sprite: "char/waiter", at: [scene.size[0] / 2, scene.size[1] / 2] as const };
  const [player, setPlayer] = useState<Actor>({ ...start, id: "player", facing: start.facing ?? "down", action: "idle", distance: 0 });
  useEffect(() => setPlayer({ ...start, id: "player", facing: start.facing ?? "down", action: "idle", distance: 0 }), [scene]);

  // Keyboard walking with collision, on its own animation loop.
  useEffect(() => {
    const held = new Set<string>();
    const down = (e: KeyboardEvent) => { if (KEYS[e.code]) { held.add(e.code); e.preventDefault(); } };
    const up = (e: KeyboardEvent) => held.delete(e.code);
    const blur = () => held.clear();
    let last = performance.now(), handle = 0;
    const colliders = renderer.colliders(), walkable = renderer.compiled.walkable;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let dx = 0, dy = 0;
      for (const code of held) { dx += KEYS[code][0]; dy += KEYS[code][1]; }
      setPlayer((p) => {
        if (!dx && !dy) return p.action === "idle" ? p : { ...p, action: "idle" };
        const length = Math.hypot(dx, dy), step = (SPEED * dt) / length;
        const at = move(p.at, [dx * step, dy * step], PERSON_RADIUS, colliders, walkable);
        const facing: Facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
        const moved = Math.hypot(at[0] - p.at[0], at[1] - p.at[1]);
        return { ...p, at, facing, action: moved > 0 ? "walk" : "idle", distance: (p.distance ?? 0) + moved };
      });
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    addEventListener("blur", blur);
    return () => { cancelAnimationFrame(handle); removeEventListener("keydown", down); removeEventListener("keyup", up); removeEventListener("blur", blur); };
  }, [renderer]);

  const marks = renderer.compiled.marks;
  return <>
    <div className="px-bar">
      <label>Scene <select value={sceneId} onChange={(e) => setSceneId(e.target.value)}>{ids.map((id) => <option key={id}>{id}</option>)}</select></label>
      <span>{DAY_PHASES.map((p) => <button key={p} aria-pressed={p === phase} onClick={() => setPhase(p)}>{p}</button>)}</span>
      <label><input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} /> Debug</label>
      <label><input type="checkbox" checked={!!reduced} onChange={(e) => setReduced(e.target.checked || undefined)} /> Reduced motion</label>
      <span className="px-help">Arrows / WASD to walk · {player.at[0].toFixed(2)}, {player.at[1].toFixed(2)} · {player.action}-{player.facing}</span>
    </div>
    <div className="px-scene">
      <PixelView renderer={renderer} actors={[player]} phase={phase} focus={player.at} debug={debug} reducedMotion={reduced}>
        {(api) => <>
          {Object.entries(marks).filter(([, m]) => m.size).map(([name, m]) => {
            const [x, y] = api.toScreen(m.at), [x2, y2] = api.toScreen([m.at[0] + m.size![0], m.at[1] + m.size![1]]);
            return <div key={name} className="px-sign" style={{ left: x, top: y, width: x2 - x, height: y2 - y }} lang="zh-Hans">{debug ? "菜单" : ""}</div>;
          })}
          {debug && Object.entries(marks).map(([name, m]) => {
            const [x, y] = api.toScreen(m.at);
            return <div key={name} className="px-mark" style={{ left: x, top: y }}>{name}{m.facing ? ` ${m.facing}` : ""}</div>;
          })}
        </>}
      </PixelView>
    </div>
  </>;
}

// ── Shell ────────────────────────────────────────────────────────────────────

function Harness() {
  const [tab, setTab] = useState(params.get("tab") === "scene" ? "scene" : "gallery");
  return <>
    <style>{css}</style>
    <div className="px-bar">
      <strong>Pixel harness</strong>
      <button aria-pressed={tab === "gallery"} onClick={() => setTab("gallery")}>Gallery</button>
      <button aria-pressed={tab === "scene"} onClick={() => setTab("scene")}>Scene</button>
    </div>
    {tab === "gallery" ? <Gallery /> : <SceneTab />}
  </>;
}

createRoot(document.getElementById("pixel-harness")!).render(<Harness />);
