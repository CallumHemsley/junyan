import type { Position } from '../../../contracts';

export type RestaurantMap = {
  id: string;
  bounds: { width: number; height: number };
  props: readonly { id: string; kind: string; position: Position; width: number; height: number }[];
};
export type RestaurantView = {
  project(point: Position, z?: number): Position;
  shadeColor?(base: string | readonly [number, number, number], exposure?: number): string;
  elapsedMs: number;
  reducedMotion: boolean;
  playerPosition: Position;
  width: number;
  height: number;
  pass: 'ground' | 'objects' | 'foreground';
};
export type RestaurantObject = {
  id: string;
  position: Position;
  depth?: number;
  occlusion?: { rect: Position & { width: number; height: number }; height: number; fadeWhenPlayerBehind: boolean };
  draw(ctx: CanvasRenderingContext2D, view: RestaurantView): void;
};
