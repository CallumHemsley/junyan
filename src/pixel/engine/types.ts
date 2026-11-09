/**
 * Plain-data types for the pixel engine. Everything an author writes by hand lives here.
 *
 * Units: positions in scenes, props, actors, marks, lights and colliders are **tile units**
 * (1 = 16 art pixels), continuous, origin at the scene's top-left corner. `[2, 5]` is the
 * top-left corner of cell (2,5); `[2.5, 6]` is the middle of that cell's bottom edge, which is
 * where you usually want a standing thing's anchor (its feet).
 */
import type { Color } from "../kit/index.ts";

export type Vec = readonly [x: number, y: number];
/** A rectangle `[x, y, w, h]`, in tile units unless stated otherwise. */
export type Rect = readonly [x: number, y: number, w: number, h: number];
export type Rgb = readonly [r: number, g: number, b: number];
/** A palette colour name or a `#rrggbb` string. */
export type ColorSpec = Color | `#${string}`;

export type DayPhase = "morning" | "midday" | "evening" | "night";
export const DAY_PHASES: readonly DayPhase[] = ["morning", "midday", "evening", "night"];
export type Facing = "down" | "up" | "left" | "right";
export type Layer = "floor" | "object" | "over";

/**
 * A grid of tiles. Each character of `rows` is one cell; `.` and space are empty.
 * The legend maps a character to a sprite id, or to several ids from which one is picked per cell
 * by `hash(x, y, seed)` (repeat an id to weight it). A tile sprite is drawn with its top-left
 * corner on its cell, whatever its anchor; sprites bigger than 16×16 (a 16×48 wall slice) spill
 * right and down over the following cells. Layers draw in order; cells draw row by row.
 */
export type TileLayer = {
  name?: string;
  rows: readonly string[];
  /** Merged over the scene's shared `legend`. */
  legend?: Readonly<Record<string, string | readonly string[] | null>>;
  /** Seed for variant choice (default 0). */
  seed?: number;
  /** Cell offset of row 0, column 0 (default `[0, 0]`). Lets a layer cover only part of the room. */
  origin?: Vec;
};

export type Prop = {
  /** Optional name, so scene code and debug overlays can find it. */
  id?: string;
  sprite: string;
  /** Tile units. The sprite's anchor lands here (rounded to the nearest art pixel). */
  at: Vec;
  flipX?: boolean;
  /** Animation phase offset, in frames. */
  phase?: number;
  /** Show this frame always instead of animating. */
  frame?: number;
  /** Overrides the sprite's own `layer`. */
  layer?: Layer;
  /**
   * Collision: `false` makes it walk-through, `true` (default) uses the sprite's `foot`, or give an
   * explicit footprint `[dx, dy, w, h]` in art pixels relative to the anchor, as `foot` is.
   */
  solid?: boolean | readonly [number, number, number, number];
  /**
   * Depth-sort key in tile units, instead of `at[1]`. Use it for things that sit on other things:
   * a bowl on a table sorts with the table, `sortY: tableY + 0.01`, so it is not hidden behind it.
   */
  sortY?: number;
  /** Skip drawing (and colliding) without deleting. */
  hidden?: boolean;
};

export type GlowLight = {
  kind: "glow";
  /** Centre, tile units. */
  at: Vec;
  /** Reach in tiles. */
  radius: number;
  color?: ColorSpec;
  /** 0..1-ish; 0.5 is a lamp, 1 is bright. Default 0.6. */
  strength?: number;
  /** Slow flicker amplitude, 0..1 (0.15 is a candle-ish lantern). Default 0. */
  flicker?: number;
  /** Vertical squash of the pool of light for the three-quarter view. Default 0.8. */
  aspect?: number;
  /** Only lit in these phases. Default: always. */
  phases?: readonly DayPhase[];
};

/**
 * Sunlight through a window: a soft-edged parallelogram falling down and to the right (the sun is
 * upper-left). `from` is the top-left corner of the beam, `width` its width and `length` its
 * vertical extent, in tiles; it shifts `slant` tiles right for every tile down.
 */
export type ShaftLight = {
  kind: "shaft";
  from: Vec;
  width: number;
  length: number;
  /** Default 0.5. */
  slant?: number;
  color?: ColorSpec;
  /** Default 0.5. */
  strength?: number;
  /** Lattice: split the beam into `[columns, rows]` panes with one-pixel muntin shadows. */
  panes?: readonly [number, number];
  /** Dust motes drifting in the beam. Default 4. */
  motes?: number;
  /** Default: `["morning"]`. */
  phases?: readonly DayPhase[];
};

export type Light = GlowLight | ShaftLight;

/** A named point: a seat, the pickup spot, the door, a DOM sign anchor. */
export type Mark = {
  at: Vec;
  /** Which way someone at this mark faces (seats). */
  facing?: Facing;
  /** An area, tile units, with `at` as its top-left corner (DOM signs). */
  size?: Vec;
};

export type Scene = {
  id: string;
  /** Width and height in tiles. */
  size: Vec;
  /** Fills everything outside the tiles. */
  background: ColorSpec;
  /** Shared by every layer; a layer's own legend wins. */
  legend?: Readonly<Record<string, string | readonly string[] | null>>;
  layers: readonly TileLayer[];
  props?: readonly Prop[];
  lights?: readonly Light[];
  /** Ambient multiplier per day phase, 1 = the art as drawn. Defaults in `light.ts`. */
  ambient?: Partial<Record<DayPhase, Rgb>>;
  /** Extra solid rectangles (walls, counters drawn as tiles). */
  blocked?: readonly Rect[];
  /** Actors are kept inside this rectangle. Default: the whole scene. */
  walkable?: Rect;
  marks?: Readonly<Record<string, Mark | Vec>>;
  /** The starting cast, for tools and the harness. The game supplies its own. */
  actors?: readonly Actor[];
};

/**
 * A character. Resolves to the sprite `${sprite}/${action}-${facing}` (`char/waiter/walk-left`),
 * with fallbacks: left → mirrored right; unknown action → idle; unknown character → `ex/waiter`.
 * A plain sprite id (`ex/waiter`) also works.
 */
export type Actor = {
  id: string;
  sprite: string;
  /** Feet, tile units. */
  at: Vec;
  facing?: Facing;
  /** Default `idle`. */
  action?: string;
  /** Tiles walked so far. When set, `walk` animations step by distance instead of time. */
  distance?: number;
  /** Animation phase offset, in frames. */
  phase?: number;
  /** Draw offset in art pixels (sitting on a stool, a hop). Does not move the sort point. */
  offset?: Vec;
  /** Depth-sort key in tile units instead of `at[1]`. */
  sortY?: number;
  hidden?: boolean;
};

/** Everything that changes from frame to frame. */
export type FrameState = {
  /** Milliseconds, injected. Drives animation, flicker and motes. */
  time: number;
  phase?: DayPhase;
  actors?: readonly Actor[];
  /** Props added at run time (food on a table), drawn exactly like scene props. */
  props?: readonly Prop[];
  /** Freezes flicker and dust motes. */
  reducedMotion?: boolean;
  /** Draws colliders, the walkable rect and marks. */
  debug?: boolean;
};
