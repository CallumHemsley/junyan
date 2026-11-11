import { TILE } from "../kit/index.ts";
import type { Vec } from "./types.ts";

/**
 * The view onto a scene. `x, y, w, h` is the visible rectangle in **art pixels** of world space
 * (whole numbers, so pixels never shimmer). `zoom` is device pixels per art pixel (an integer);
 * `dpr` is the device pixel ratio, so one art pixel is `zoom / dpr` CSS pixels.
 */
export type Camera = { x: number; y: number; w: number; h: number; zoom: number; dpr: number };

export type ZoomTargets = {
  /** Tiles visible across on a landscape screen. Default 20 (18–22). */
  landscapeTiles?: number;
  /** Tiles visible across on a portrait screen. Default 11 (10–12). */
  portraitTiles?: number;
};

/** The integer zoom that shows closest to the target number of tiles across. */
export function chooseZoom(cssWidth: number, cssHeight: number, dpr: number, targets: ZoomTargets = {}): number {
  const target = cssHeight > cssWidth ? (targets.portraitTiles ?? 11) : (targets.landscapeTiles ?? 20);
  const device = cssWidth * dpr;
  const ideal = device / (target * TILE);
  const lo = Math.max(1, Math.floor(ideal)), hi = Math.max(1, Math.ceil(ideal));
  const across = (zoom: number) => device / zoom / TILE;
  return Math.abs(across(lo) - target) <= Math.abs(across(hi) - target) ? lo : hi;
}

/** Art-pixel size of the view that covers a CSS box at this zoom (rounded up, so no gap). */
export function viewSize(cssWidth: number, cssHeight: number, dpr: number, zoom: number): [number, number] {
  return [Math.max(1, Math.ceil((cssWidth * dpr) / zoom)), Math.max(1, Math.ceil((cssHeight * dpr) / zoom))];
}

/**
 * Top-left of a `viewW`×`viewH` view centred on `focus` (art px), clamped so it never shows past
 * the scene edge, and centred on the scene along any axis where the scene is smaller than the view.
 */
export function followPoint(viewW: number, viewH: number, sceneW: number, sceneH: number, focus: Vec): [number, number] {
  const axis = (view: number, scene: number, at: number) =>
    scene <= view ? Math.round((scene - view) / 2) : Math.min(scene - view, Math.max(0, Math.round(at - view / 2)));
  return [axis(viewW, sceneW, focus[0]), axis(viewH, sceneH, focus[1])];
}

export type CameraInput = {
  cssWidth: number;
  cssHeight: number;
  dpr?: number;
  /** Scene size in tiles. */
  sceneSize: Vec;
  /** Point to keep in view, tile units. Default: the scene's centre. */
  focus?: Vec;
  /** Force a zoom instead of choosing one. */
  zoom?: number;
  targets?: ZoomTargets;
  /** Centre exactly on `focus`, even past the scene's edges (framing an activity's area). */
  free?: boolean;
};

export function createCamera(input: CameraInput): Camera {
  const dpr = input.dpr ?? 1;
  const zoom = input.zoom ?? chooseZoom(input.cssWidth, input.cssHeight, dpr, input.targets);
  const [w, h] = viewSize(input.cssWidth, input.cssHeight, dpr, zoom);
  const sceneW = input.sceneSize[0] * TILE, sceneH = input.sceneSize[1] * TILE;
  const focus: Vec = input.focus ? [input.focus[0] * TILE, input.focus[1] * TILE] : [sceneW / 2, sceneH / 2];
  const [x, y] = input.free ? [Math.round(focus[0] - w / 2), Math.round(focus[1] - h / 2)] : followPoint(w, h, sceneW, sceneH, focus);
  return { x, y, w, h, zoom, dpr };
}

/** A point in tile units → CSS pixels from the view's top-left corner (for DOM overlays). */
export function toScreen(camera: Camera, point: Vec): [number, number] {
  const scale = camera.zoom / camera.dpr;
  return [(point[0] * TILE - camera.x) * scale, (point[1] * TILE - camera.y) * scale];
}

/** CSS pixels from the view's top-left corner → tile units (for pointer input). */
export function toWorld(camera: Camera, cssX: number, cssY: number): [number, number] {
  const scale = camera.zoom / camera.dpr;
  return [(cssX / scale + camera.x) / TILE, (cssY / scale + camera.y) / TILE];
}
