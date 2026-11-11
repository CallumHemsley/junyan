/**
 * The compositor: scene + frame state + view → RGBA at art resolution. Pure TypeScript, no DOM,
 * identical in Node and the browser. Draw order:
 *
 *   background → tile layers → floor props (scene order) → contact shadows →
 *   object props and actors, depth-sorted by anchor y (ties keep scene order, then run-time props,
 *   then actors) → over props → light (ambient × map + glow, halos) → dust motes → colour grade →
 *   debug overlay.
 *   Props named in `state.fade` draw at that opacity (the player walking behind a tree).
 *
 * The static prefix of the floor (every tile and floor prop up to the first animated one) is baked
 * once per scene into a world-size buffer; each frame copies the visible part and draws the rest.
 */
import { TILE } from "../kit/index.ts";
import { actorFrame, createActorResolver } from "./actors.ts";
import { frameAt, type Atlas } from "./atlas.ts";
import { rgbOf } from "./color.ts";
import { blit, copyRegion, createFrame, packRgb, type Frame } from "./frame.ts";
import { GRADES, applyGradeLut, gradeLut, type ContactShadow } from "./grade.ts";
import { compileLight, createLighting, type CompiledLight } from "./light.ts";
import { compileScene, placeProp, propCollider, type CompiledScene, type Placed } from "./scene.ts";
import type { Actor, DayPhase, FrameState, Light, Prop, Rect, Rgb, Scene } from "./types.ts";

/** Ungraded contact shadow: plum, two stepped opacities (core, rim), 0..255, round. */
const PLAIN_SHADOW: ContactShadow = { color: "plum1", core: 82, rim: 44, stretch: 1, shift: 0 };

export type RendererOptions = {
  /** Called once per distinct actor fallback. Pass `console.warn` in dev, nothing in production. */
  warn?: (message: string) => void;
  /**
   * Colour grading per day phase (`grade.ts`): coloured shadows, warm light, halos and a final
   * split-tone pass. Default on. `false` renders exactly the ungraded compositor.
   */
  grade?: boolean;
};

/** Where the frame sits in the world: its top-left, in art pixels. The frame's size is the view's. */
export type ViewOrigin = { x: number; y: number };

export type SceneRenderer = {
  compiled: CompiledScene;
  /** Composite one frame into `frame` (whose w×h is the view size). Allocates nothing per call. */
  render(frame: Frame, view: ViewOrigin, state: FrameState): void;
  /** Changes whenever time would change the picture (animation frame, flicker, motes). */
  timeKey(state: FrameState): number;
  /** Build the cached static floor now (it bakes the floor's sprites) rather than on the first frame. */
  warm(): void;
  /** Bytes held by the cached static floor and the per-view buffers. */
  cachedBytes(): number;
  /** Drop the cached static floor and per-view buffers; they are rebuilt on the next frame. */
  release(): void;
  /** Scene colliders plus any run-time props', tile units. */
  colliders(props?: readonly Prop[]): Rect[];
};

export function createSceneRenderer(scene: Scene, atlas: Atlas, options: RendererOptions = {}): SceneRenderer {
  const compiled = compileScene(scene, atlas);
  const resolveActor = createActorResolver(atlas, options.warn);
  const graded = options.grade !== false;
  const ambient: Record<DayPhase, Rgb> = graded
    ? { morning: GRADES.morning.ambient, midday: GRADES.midday.ambient, evening: GRADES.evening.ambient, night: GRADES.night.ambient, ...scene.ambient }
    : compiled.ambient;
  const lighting = createLighting(compiled.lights, ambient, graded ? GRADES : undefined);
  // Run-time lights (FrameState.lights), compiled once per array.
  let extraSource: readonly Light[] | undefined, extraLights: CompiledLight[] = [];
  const runtimeLights = (lights: readonly Light[] | undefined) => {
    if (lights !== extraSource) { extraSource = lights; extraLights = (lights ?? []).map((l, i) => compileLight(l, 1000 + i)); }
    return extraLights;
  };
  const shadowFor = (phase: DayPhase) => (graded ? GRADES[phase].shadow : PLAIN_SHADOW);
  const shadowRgbs = new Map<string, Rgb>();
  let shadowStyle = PLAIN_SHADOW, shadowRgb = rgbOf(PLAIN_SHADOW.color);
  const placedProps = new WeakMap<Prop, Placed>();
  const backgroundWord = packRgb(compiled.background);
  const shadowStamps = new Map<string, { w: number; h: number; ox: number; oy: number; alpha: Uint8Array }>();

  let staticCache: Frame | null = null;
  let shadowMask = new Uint8Array(0);
  // Bounding box of this frame's shadow stamps, frame px; only it is cleared and blended.
  let sx0 = 0, sy0 = 0, sx1 = 0, sy1 = 0;
  const sorted: Placed[] = [];
  const actorPool: Placed[] = [];
  const actorFrames: number[] = [];

  const placedOf = (prop: Prop) => {
    let placed = placedProps.get(prop);
    if (!placed) { placed = placeProp(prop, atlas); placedProps.set(prop, placed); }
    return placed;
  };

  const frameOf = (placed: Placed, time: number) => placed.frame >= 0 ? placed.frame : frameAt(placed.sprite, time, placed.phase);

  function buildStaticCache(): Frame {
    const cache = createFrame(compiled.widthPx, compiled.heightPx);
    cache.words.fill(backgroundWord);
    for (let i = 0; i < compiled.staticFloor; i++) {
      const p = compiled.floor[i];
      blit(cache, p.sprite.frame(p.frame >= 0 ? p.frame : 0, p.flipX), p.left, p.top);
    }
    return cache;
  }

  let fade: Readonly<Record<string, number>> | undefined;
  function draw(frame: Frame, view: ViewOrigin, placed: Placed, frameIndex: number, dx = 0, dy = 0) {
    const id = placed.prop?.id;
    const opacity = fade && id !== undefined ? fade[id] ?? 1 : 1;
    blit(frame, placed.sprite.frame(frameIndex, placed.flipX), placed.left + dx - view.x, placed.top + dy - view.y, opacity);
  }

  function stampShadow(frame: Frame, view: ViewOrigin, placed: Placed) {
    const shadow = placed.sprite.def.shadow, style = shadowStyle;
    if (!shadow) return;
    const key = `${shadow.rx},${shadow.ry},${style.core},${style.rim},${style.stretch},${style.shift}`;
    let stamp = shadowStamps.get(key);
    if (!stamp) {
      const rx = shadow.rx * style.stretch, ry = shadow.ry, { core, rim } = style;
      const ox = Math.ceil(rx), oy = Math.ceil(ry), w = ox * 2 + 1, h = oy * 2 + 1;
      const alpha = new Uint8Array(w * h);
      // Same sampling as Px.ellipse: pixel centres against an ellipse centred on a pixel edge.
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const u = (i - ox + 0.5) / rx, v = (j - oy + 0.5) / ry, d = u * u + v * v;
        alpha[j * w + i] = d <= 0.42 ? core : d <= 1 ? rim : 0;
      }
      // A stretched (low-sun) shadow slides east by `shift` radii so it still starts at the feet.
      stamp = { w, h, ox: ox - Math.round(shadow.rx * style.shift), oy, alpha };
      shadowStamps.set(key, stamp);
    }
    const left = placed.ax + Math.round(shadow.dx ?? 0) - stamp.ox - view.x;
    const top = placed.ay + Math.round(shadow.dy ?? 0) - stamp.oy - view.y;
    if (left >= frame.w || top >= frame.h || left + stamp.w <= 0 || top + stamp.h <= 0) return;
    sx0 = Math.min(sx0, Math.max(0, left)); sy0 = Math.min(sy0, Math.max(0, top));
    sx1 = Math.max(sx1, Math.min(frame.w, left + stamp.w)); sy1 = Math.max(sy1, Math.min(frame.h, top + stamp.h));
    for (let j = Math.max(0, -top); j < stamp.h && top + j < frame.h; j++)
      for (let i = Math.max(0, -left); i < stamp.w && left + i < frame.w; i++) {
        const a = stamp.alpha[j * stamp.w + i], at = (top + j) * frame.w + left + i;
        // Overlapping shadows take the darker, never stack into a black blot.
        if (a > shadowMask[at]) shadowMask[at] = a;
      }
  }

  function applyShadows(frame: Frame) {
    const data = frame.data, [sr, sg, sb] = shadowRgb;
    for (let y = sy0; y < sy1; y++) for (let i = y * frame.w + sx0, end = y * frame.w + sx1; i < end; i++) {
      const m = shadowMask[i];
      if (!m) continue;
      shadowMask[i] = 0; // leave the mask clean for the next frame
      const a = m / 255, p = i * 4;
      data[p] += (sr - data[p]) * a;
      data[p + 1] += (sg - data[p + 1]) * a;
      data[p + 2] += (sb - data[p + 2]) * a;
    }
  }

  function placeActor(actor: Actor, index: number, time: number): Placed {
    const resolved = resolveActor(actor);
    const sprite = resolved.sprite;
    const ax = Math.round(actor.at[0] * TILE), ay = Math.round(actor.at[1] * TILE);
    const anchorX = resolved.flipX ? sprite.w - sprite.anchor[0] : sprite.anchor[0];
    const placed = (actorPool[index] ??= { sprite, left: 0, top: 0, ax: 0, ay: 0, sortY: 0, flipX: false, phase: 0, frame: -1, layer: "object", tile: false });
    placed.sprite = sprite;
    placed.flipX = resolved.flipX;
    placed.ax = ax;
    placed.ay = ay;
    placed.left = ax - anchorX + Math.round(actor.offset?.[0] ?? 0);
    placed.top = ay - sprite.anchor[1] + Math.round(actor.offset?.[1] ?? 0);
    placed.sortY = actor.sortY !== undefined ? actor.sortY * TILE : ay;
    actorFrames[index] = actorFrame(actor, sprite, time);
    placed.frame = actorFrames[index];
    return placed;
  }

  function drawDebug(frame: Frame, view: ViewOrigin, state: FrameState) {
    const put = (x: number, y: number, word: number) => {
      x -= view.x; y -= view.y;
      if (x >= 0 && y >= 0 && x < frame.w && y < frame.h) frame.words[y * frame.w + x] = word;
    };
    const box = (r: Rect, word: number) => {
      const x0 = Math.round(r[0] * TILE), y0 = Math.round(r[1] * TILE);
      const x1 = Math.round((r[0] + r[2]) * TILE) - 1, y1 = Math.round((r[1] + r[3]) * TILE) - 1;
      for (let x = x0; x <= x1; x++) { put(x, y0, word); put(x, y1, word); }
      for (let y = y0; y <= y1; y++) { put(x0, y, word); put(x1, y, word); }
    };
    const red = packRgb(rgbOf("red4")), blue = packRgb(rgbOf("blue4")), gold = packRgb(rgbOf("gold4")), white = packRgb(rgbOf("white"));
    box(compiled.walkable, blue);
    for (const c of renderer.colliders(state.props)) box(c, red);
    for (const mark of Object.values(compiled.marks)) {
      const x = Math.round(mark.at[0] * TILE), y = Math.round(mark.at[1] * TILE);
      if (mark.size) box([mark.at[0], mark.at[1], mark.size[0], mark.size[1]], gold);
      for (let d = -(TILE >> 3); d <= TILE >> 3; d++) { put(x + d, y, gold); put(x, y + d, gold); }
    }
    for (const actor of state.actors ?? []) put(Math.round(actor.at[0] * TILE), Math.round(actor.at[1] * TILE), white);
  }

  const renderer: SceneRenderer = {
    compiled,

    render(frame, view, state) {
      const time = state.time, phase = state.phase ?? "morning";
      shadowStyle = shadowFor(phase);
      shadowRgb = shadowRgbs.get(shadowStyle.color) ?? shadowRgbs.set(shadowStyle.color, rgbOf(shadowStyle.color)).get(shadowStyle.color)!;
      const props = state.props ?? [], actors = state.actors ?? [];
      fade = state.fade;

      // Background and the cached static floor.
      staticCache ??= buildStaticCache();
      // The void colour is only needed where the view reaches past the scene.
      if (view.x < 0 || view.y < 0 || view.x + frame.w > compiled.widthPx || view.y + frame.h > compiled.heightPx) frame.words.fill(backgroundWord);
      copyRegion(frame, staticCache, view.x, view.y, 0, 0, frame.w, frame.h);

      // Animated floor content, then run-time floor props.
      for (let i = compiled.staticFloor; i < compiled.floor.length; i++) draw(frame, view, compiled.floor[i], frameOf(compiled.floor[i], time));
      for (const prop of props) {
        if (prop.hidden) continue;
        const placed = placedOf(prop);
        if (placed.layer === "floor") draw(frame, view, placed, frameOf(placed, time));
      }

      // Depth list: scene objects, run-time objects, actors. Array.sort is stable, so ties keep this order.
      sorted.length = 0;
      for (const placed of compiled.objects) sorted.push(placed);
      for (const prop of props) if (!prop.hidden && placedOf(prop).layer === "object") sorted.push(placedOf(prop));
      let actorCount = 0;
      for (const actor of actors) if (!actor.hidden) sorted.push(placeActor(actor, actorCount++, time));

      // Contact shadows for everything standing in the room, merged into one mask.
      if (shadowMask.length !== frame.w * frame.h) shadowMask = new Uint8Array(frame.w * frame.h);
      sx0 = frame.w; sy0 = frame.h; sx1 = 0; sy1 = 0;
      for (const placed of sorted) stampShadow(frame, view, placed);
      for (const placed of compiled.over) stampShadow(frame, view, placed);
      applyShadows(frame);

      sorted.sort(bySortY);
      for (const placed of sorted) draw(frame, view, placed, frameOf(placed, time));

      for (const placed of compiled.over) draw(frame, view, placed, frameOf(placed, time));
      for (const prop of props) {
        if (prop.hidden) continue;
        const placed = placedOf(prop);
        if (placed.layer === "over") draw(frame, view, placed, frameOf(placed, time));
      }

      lighting.apply(frame, view.x, view.y, phase, time, !!state.reducedMotion, runtimeLights(state.lights));
      if (graded) applyGradeLut(frame, gradeLut(GRADES[phase]));
      if (state.debug) drawDebug(frame, view, state);
    },

    warm() { staticCache ??= buildStaticCache(); },

    cachedBytes() { return (staticCache?.data.byteLength ?? 0) + shadowMask.byteLength + lighting.bytes(); },

    release() {
      staticCache = null;
      shadowMask = new Uint8Array(0);
      lighting.release();
    },

    timeKey(state) {
      const time = state.time;
      let h = 0x811c9dc5;
      const mix = (v: number) => { h = Math.imul(h ^ v, 16777619); };
      for (let i = compiled.staticFloor; i < compiled.floor.length; i++) mix(frameOf(compiled.floor[i], time));
      for (const p of compiled.objects) if (p.sprite.frameCount > 1) mix(frameOf(p, time));
      for (const p of compiled.over) if (p.sprite.frameCount > 1) mix(frameOf(p, time));
      for (const prop of state.props ?? []) if (!prop.hidden) mix(frameOf(placedOf(prop), time));
      for (const actor of state.actors ?? []) if (!actor.hidden) mix(actorFrame(actor, resolveActor(actor).sprite, time));
      mix(lighting.key(state.phase ?? "morning", time, !!state.reducedMotion));
      return h >>> 0;
    },

    colliders(props = []) {
      if (!props.length) return compiled.colliders;
      const out = compiled.colliders.slice();
      for (const prop of props) {
        if (prop.hidden) continue;
        const c = propCollider(placedOf(prop));
        if (c) out.push(c);
      }
      return out;
    },
  };
  return renderer;
}

const bySortY = (a: Placed, b: Placed) => a.sortY - b.sortY;

/** One-shot helper for tools and tests: render a whole view to a new frame. */
export function renderToFrame(renderer: SceneRenderer, view: { x: number; y: number; w: number; h: number }, state: FrameState): Frame {
  const frame = createFrame(view.w, view.h);
  renderer.render(frame, view, state);
  return frame;
}
