import { canInspect } from './visibility';
import { canStand, canWalk, findPath, PLAYER_RADIUS } from '../geometry';
import type { WorldMapDefinition } from '../schema';
import type { Navigation } from './model';

export function navigationFor(map: WorldMapDefinition): Navigation {
  return {
    canSee: (from, target) => canInspect(map, from, target),
    canStand: (point, radius) => canStand(map, point, Math.max(radius, PLAYER_RADIUS)),
    canWalk: (from, to) => canWalk(map, from, to),
    route: (from, to, _radius, exclusions) => findPath({ ...map,
      colliders: [...map.colliders, ...exclusions.map((rect, index) => ({ id: `life.clearance.${index}`, rect }))],
    }, from, to),
  };
}
