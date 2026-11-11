/**
 * Which maps the pixel engine draws, and how walking works on them. Pure data, safe to import from
 * Node (rules tests, Playwright helpers) without the sprite registry.
 */
import type { Point } from "../schema";

/**
 * Outdoor maps drawn top-down by `src/pixel` from their JSON (`OutdoorView`). Must list the same ids
 * as the pixel registry `src/pixel/world/maps.ts` (a test checks), which this module does not import
 * so Node stays free of the map JSON and the sprites.
 */
export const OUTDOOR_PIXEL_MAPS: readonly string[] = ["town", "courtyard", "rooftop", "park", "riverbank"];
/** Maps drawn top-down by `src/pixel`; every other map keeps the isometric painter until redrawn. */
export const PIXEL_MAPS: ReadonlySet<string> = new Set(["restaurant", ...OUTDOOR_PIXEL_MAPS]);
export const isPixelMap = (mapId: string) => PIXEL_MAPS.has(mapId);

/** Top-down maps walk on the screen's axes: up is north, one tile per unit. */
export const cardinalDirections: Readonly<Record<string, Point>> = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};

/** Tiles per second, as in the pixel harness; the walk cycle steps every `WALK_TILES_PER_FRAME`. */
export const PIXEL_WALK_SPEED = 3.2;
