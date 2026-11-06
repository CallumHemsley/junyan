import { describe, expect, it } from 'vitest';
import { nearbyTargets, selectTarget, cycleTarget, type NearbyTarget } from './target-selection';
import type { Affordance } from './life/model';
const player = {x: 0, y: 0};
const life = (id: string, x: number, targetId = id): Affordance => ({id, targetId, kind: 'inspect', position: {x, y: 0}, label: {id: 'line', tokens: [], audio: '/line.wav'}});
const options = (...rows: Affordance[]) => nearbyTargets('town', [], rows, player);
const automatic = (target: NearbyTarget) => ({key: target.key, mode: 'automatic' as const});

describe('selected nearby target', () => {
  it('selects nearest with an input-order-independent stable tie', () => {
    const forward = options(life('b', 1), life('a', -1));
    const reverse = options(life('a', -1), life('b', 1));
    expect(selectTarget(forward, player, null)?.targetId).toBe('a');
    expect(selectTarget(reverse, player, null)?.key).toBe(selectTarget(forward, player, null)?.key);
  });
  it('resists small adjacent-target distance changes, then switches when materially closer', () => {
    const original = options(life('a', 1), life('b', 1.1));
    const previous = automatic(original[0]);
    const slight = options(life('a', 1.1), life('b', 1));
    expect(selectTarget(slight, player, previous)?.targetId).toBe('a');
    const clear = options(life('a', 1.4), life('b', 1));
    expect(selectTarget(clear, player, previous)?.targetId).toBe('b');
  });
  it('honors an explicit selection while available and invalidates a departed or different-map target', () => {
    const rows = options(life('a', .1), life('b', 1.5));
    const manual = {key: rows[1].key, mode: 'manual' as const};
    expect(selectTarget(rows, player, manual)?.targetId).toBe('b');
    expect(selectTarget(rows.slice(0, 1), player, manual)?.targetId).toBe('a');
    expect(selectTarget(nearbyTargets('park', [], [life('b', 1)], player), player, manual)?.mapId).toBe('park');
    expect(selectTarget([], player, manual)).toBeNull();
  });
  it('excludes rejected exploration anchors and prefers a real feature action over duplicate inspection of the same target', () => {
    const rows = nearbyTargets('restaurant', [
      {id: 'inert', position: player, radius: 1, featureId: 'exploration', interactionId: 'observe'},
      {id: 'kitchen', position: player, radius: 1, featureId: 'restaurant', interactionId: 'kitchen'},
    ], [life('inspect-kitchen', 0, 'kitchen'), life('adjacent', .1)], player);
    expect(rows.map(row => row.targetId)).toEqual(['kitchen', 'adjacent']);
    expect(rows[0].source).toBe('anchor');
  });
  it('preserves distinct adjacent landmarks and cycles by identity without input-order flicker', () => {
    const rows = options(life('steam', .8), life('door', .4), life('npc/greet', .5));
    expect(rows).toHaveLength(3);
    const next = cycleTarget(rows, rows.find(row => row.targetId === 'door')!.key, 1)!;
    expect(next.targetId).toBe('npc/greet');
    expect(cycleTarget([...rows].reverse(), next.key, -1)?.targetId).toBe('door');
    expect(cycleTarget([], 'missing', 1)).toBeNull();
  });
});
