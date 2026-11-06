import type { Word } from '../contracts';
import type { Point, WorldMapDefinition } from './schema';
import type { Affordance } from './life/model';

type Identity = { key: string; mapId: string; targetId: string; position: Point };
export type NearbyTarget = Identity & (
  | { source: 'anchor'; anchor: WorldMapDefinition['anchors'][number] }
  | { source: 'life'; affordance: Affordance }
  | { source: 'exit'; exit: WorldMapDefinition['exits'][number]; word: Word }
);
export type TargetSelection = { key: string; mode: 'automatic' | 'manual' };
export const TARGET_SWITCH_MARGIN = .35;
const sourceOrder = { anchor: 0, exit: 1, life: 2 };
const compareKey = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export function nearbyTargets(mapId: string, anchors: WorldMapDefinition['anchors'], life: readonly Affordance[], player: Point): NearbyTarget[] {
  const anchorsByTarget = new Set(anchors.filter(anchor => anchor.featureId !== 'exploration').map(anchor => anchor.id));
  const targets: NearbyTarget[] = [
    ...anchors.filter(anchor => anchor.featureId !== 'exploration').map(anchor => ({
      key: `${mapId}/anchor/${anchor.id}`, mapId, targetId: anchor.id, position: anchor.position, source: 'anchor' as const, anchor,
    })),
    ...life.filter(option => !anchorsByTarget.has(option.targetId)).map(affordance => ({
      key: `${mapId}/life/${affordance.id}`, mapId, targetId: affordance.targetId, position: affordance.position, source: 'life' as const, affordance,
    })),
  ];
  return targets.sort((a, b) => Math.hypot(a.position.x - player.x, a.position.y - player.y) - Math.hypot(b.position.x - player.x, b.position.y - player.y)
    || (sourceOrder[a.source] - sourceOrder[b.source]) || compareKey(a.key, b.key));
}

export function selectTarget(targets: readonly NearbyTarget[], player: Point, previous: TargetSelection | null): NearbyTarget | null {
  const nearest = [...targets].sort((a, b) => Math.hypot(a.position.x - player.x, a.position.y - player.y) - Math.hypot(b.position.x - player.x, b.position.y - player.y)
    || (sourceOrder[a.source] - sourceOrder[b.source]) || compareKey(a.key, b.key))[0];
  if (!nearest) return null;
  const current = targets.find(target => target.key === previous?.key);
  if (!current) return nearest;
  if (previous?.mode === 'manual') return current;
  const distance = (target: NearbyTarget) => Math.hypot(target.position.x - player.x, target.position.y - player.y);
  return distance(current) <= distance(nearest) + TARGET_SWITCH_MARGIN ? current : nearest;
}

export function cycleTarget(targets: readonly NearbyTarget[], currentKey: string, direction: -1 | 1): NearbyTarget | null {
  if (!targets.length) return null;
  const ordered = [...targets].sort((a, b) => compareKey(a.key, b.key));
  const index = ordered.findIndex(target => target.key === currentKey);
  return index < 0 ? ordered[0] : ordered[(index + direction + ordered.length) % ordered.length];
}
