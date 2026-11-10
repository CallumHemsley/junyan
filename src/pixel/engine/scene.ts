import { TILE, hash } from "../kit/index.ts";
import type { Atlas, AtlasSprite } from "./atlas.ts";
import { rgbOf } from "./color.ts";
import { DEFAULT_AMBIENT, compileLight, type CompiledLight } from "./light.ts";
import type { DayPhase, Layer, Mark, Prop, Rect, Rgb, Scene } from "./types.ts";

/** Identity helper that type-checks a hand-written scene. */
export function defineScene<T extends Scene>(scene: T): T {
  return scene;
}

/** Something positioned in the world, ready to draw. All coordinates are world art pixels. */
export type Placed = {
  sprite: AtlasSprite;
  /** Top-left of the sprite. */
  left: number;
  top: number;
  /** The anchor point (feet), for shadows. */
  ax: number;
  ay: number;
  /** Depth-sort key. */
  sortY: number;
  flipX: boolean;
  phase: number;
  /** Fixed frame, or -1 to animate. */
  frame: number;
  layer: Layer;
  /** Tiles get no shadow and no collider. */
  tile: boolean;
  prop?: Prop;
};

export type CompiledScene = {
  scene: Scene;
  widthPx: number;
  heightPx: number;
  background: Rgb;
  /** Tile cells (layer by layer, row by row) then floor-layer props, in draw order. */
  floor: Placed[];
  /** `floor[0 … staticFloor)` never changes and is cached; the rest redraws each frame. */
  staticFloor: number;
  objects: Placed[];
  over: Placed[];
  colliders: Rect[];
  walkable: Rect;
  marks: Record<string, Mark>;
  lights: CompiledLight[];
  ambient: Record<DayPhase, Rgb>;
};

const px = (t: number) => Math.round(t * TILE);

/** Place a prop: its anchor lands on `prop.at`, rounded to whole art pixels. */
export function placeProp(prop: Prop, atlas: Atlas): Placed {
  if (!atlas.has(prop.sprite)) throw new Error(`Prop${prop.id ? ` "${prop.id}"` : ""} uses unknown sprite "${prop.sprite}"`);
  const sprite = atlas.get(prop.sprite);
  const ax = px(prop.at[0]), ay = px(prop.at[1]);
  // A flipped sprite's anchor mirrors too, so the feet stay put.
  const anchorX = prop.flipX ? sprite.w - sprite.anchor[0] : sprite.anchor[0];
  return {
    sprite, left: ax - anchorX, top: ay - sprite.anchor[1], ax, ay,
    sortY: prop.sortY !== undefined ? prop.sortY * TILE : ay,
    flipX: !!prop.flipX, phase: prop.phase ?? 0, frame: prop.frame ?? -1,
    layer: prop.layer ?? sprite.layer, tile: false, prop,
  };
}

/** Solid rectangle of a placed prop, tile units, or null if it is walk-through. */
export function propCollider(placed: Placed): Rect | null {
  const prop = placed.prop;
  if (!prop || prop.hidden || prop.solid === false || placed.layer !== "object") return null;
  const foot = Array.isArray(prop.solid) ? prop.solid : placed.sprite.def.foot;
  if (!foot) return null;
  // Mirror the footprint with the sprite.
  const dx = placed.flipX ? -foot[0] - foot[2] : foot[0];
  return [(placed.ax + dx) / TILE, (placed.ay + foot[1]) / TILE, foot[2] / TILE, foot[3] / TILE];
}

/** Resolve tiles, place props, derive colliders and compile lights. Throws on authoring mistakes. */
export function compileScene(scene: Scene, atlas: Atlas): CompiledScene {
  const [cols, rows] = scene.size;
  const floor: Placed[] = [], objects: Placed[] = [], over: Placed[] = [];

  scene.layers.forEach((layer, li) => {
    const legend = { ...scene.legend, ...layer.legend };
    const [ox, oy] = layer.origin ?? [0, 0];
    const name = layer.name ?? `#${li}`;
    if (oy + layer.rows.length > rows) throw new Error(`Scene "${scene.id}" layer ${name} has ${layer.rows.length} rows from row ${oy}; the scene is ${rows} tall`);
    layer.rows.forEach((row, j) => {
      if (ox + row.length > cols) throw new Error(`Scene "${scene.id}" layer ${name} row ${j} "${row}" is wider than the scene (${cols})`);
      for (let i = 0; i < row.length; i++) {
        const key = row[i];
        if (key === "." || key === " ") continue;
        if (!(key in legend)) throw new Error(`Scene "${scene.id}" layer ${name} row ${j}: "${key}" is not in the legend`);
        const entry = legend[key];
        if (entry === null || entry === undefined) continue;
        const tx = ox + i, ty = oy + j;
        const id = typeof entry === "string" ? entry : entry[Math.floor(hash(tx, ty, layer.seed ?? 0) * entry.length)];
        if (!atlas.has(id)) throw new Error(`Scene "${scene.id}" layer ${name}: "${key}" maps to unknown sprite "${id}"`);
        const sprite = atlas.get(id);
        floor.push({ sprite, left: tx * TILE, top: ty * TILE, ax: tx * TILE, ay: ty * TILE, sortY: ty * TILE, flipX: false, phase: 0, frame: -1, layer: "floor", tile: true });
      }
    });
  });

  for (const prop of scene.props ?? []) {
    if (prop.hidden) continue;
    const placed = placeProp(prop, atlas);
    (placed.layer === "floor" ? floor : placed.layer === "over" ? over : objects).push(placed);
  }

  let staticFloor = floor.findIndex((p) => p.sprite.frameCount > 1 && p.frame < 0);
  if (staticFloor < 0) staticFloor = floor.length;

  const colliders: Rect[] = [];
  for (const placed of objects) { const c = propCollider(placed); if (c) colliders.push(c); }
  colliders.push(...(scene.blocked ?? []));

  const marks: Record<string, Mark> = {};
  for (const [name, mark] of Object.entries(scene.marks ?? {})) marks[name] = isVec(mark) ? { at: mark } : mark;

  return {
    scene, widthPx: cols * TILE, heightPx: rows * TILE, background: rgbOf(scene.background),
    floor, staticFloor, objects, over, colliders,
    walkable: scene.walkable ?? [0, 0, cols, rows],
    marks,
    lights: (scene.lights ?? []).map(compileLight),
    ambient: { ...DEFAULT_AMBIENT, ...scene.ambient },
  };
}

function isVec(mark: Mark | readonly [number, number]): mark is readonly [number, number] {
  return Array.isArray(mark);
}
