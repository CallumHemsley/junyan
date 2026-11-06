import type { Point, Rect, WorldMapDefinition } from '../schema';
import { canStand, contains } from '../geometry';

export function segmentIntersects(from: Point, to: Point, rect: Rect, radius: number): boolean {
  let low = 0, high = 1;
  for (const axis of ['x', 'y'] as const) {
    const min = rect[axis] - radius;
    const max = min + (axis === 'x' ? rect.width : rect.height) + radius * 2;
    const delta = to[axis] - from[axis];
    if (Math.abs(delta) < 1e-10) {
      if (from[axis] < min || from[axis] > max) return false;
    } else {
      const a = (min - from[axis]) / delta, b = (max - from[axis]) / delta;
      low = Math.max(low, Math.min(a, b));
      high = Math.min(high, Math.max(a, b));
      if (low > high) return false;
    }
  }
  return true;
}


export function canInspect(map: WorldMapDefinition, from: Point, target: Point): boolean {
  if (!canStand(map, from, 0) || !Number.isFinite(target.x) || !Number.isFinite(target.y)) return false;
  if (target.x < 0 || target.y < 0 || target.x > map.bounds.width || target.y > map.bounds.height) return false;
  const occupied = map.colliders.filter(({ rect }) => contains(rect, target));
  const targetId = occupied.length === 1 ? occupied[0].id : undefined;
  const nearTarget = { x: from.x + (target.x - from.x) * (1 - 1e-7), y: from.y + (target.y - from.y) * (1 - 1e-7) };
  return map.colliders.every(({ id, rect }) => id === targetId || !segmentIntersects(from, nearTarget, rect, 0));
}
