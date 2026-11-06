import { canInspect } from './visibility';
import { canStand, canWalk, findPath } from '../geometry';
import type { WorldMapDefinition } from '../schema';
import type { Navigation } from './model';

export function navigationFor(map: WorldMapDefinition): Navigation {
  return {
    canSee: (from, target) => canInspect(map, from, target),
    canStand: (point, radius) => canStand(map, point, Math.max(radius)),
    canWalk: (from, to, radius) => canWalk(map, from, to, radius),
    route: (from, to, radius, exclusions) => findPath({ ...map,
      colliders: [...map.colliders, ...exclusions.map((rect, index) => ({ id: `life.clearance.${index}`, rect }))],
    }, from, to, radius),
  };
}
