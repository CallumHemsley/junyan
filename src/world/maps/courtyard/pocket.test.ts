import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, findPath } from '../../geometry';
import { courtyardMap } from './index';
import preservation from './pocket-preservation.fixture.json';
import { habitatPoints } from './habitat';

describe('bounded e02 work pocket and physical threshold', () => {
  it('retains all existing arrivals, exits, feature targets and inhabitants', () => {
    for (const key of ['defaultSpawn', 'entrances', 'exits', 'anchors', 'npcHooks'] as const) expect(courtyardMap[key]).toEqual(preservation[key]);
  });
  it('leaves the open gateway and cross-lane passable with the shared player footprint', () => {
    const map = worldMapSchema.parse(courtyardMap);
    expect(canWalk(map, map.defaultSpawn, { x: 23, y: 36.5 })).toBe(true);
    expect(canWalk(map, { x: 20.3, y: 33.5 }, { x: 25.7, y: 33.5 })).toBe(true);
    for (const exit of map.exits) expect(findPath(map, map.defaultSpawn, { x: exit.rect.x + exit.rect.width / 2, y: exit.rect.y + exit.rect.height / 2 }).length).toBeGreaterThan(0);
  });
  it('keeps task endpoints and cat resting surfaces reachable instead of using props as collision', () => {
    const map = worldMapSchema.parse(courtyardMap);
    for (const point of Object.values(habitatPoints)) expect(canStand(map, point)).toBe(true);
    const mat = map.props.find(p => p.id === 'courtyard.black-cat-resting-mat')!;
    expect(mat.layer).toBe('ground');
    expect(map.colliders.some(c => c.id === mat.id)).toBe(false);
    expect(habitatPoints.black.x).toBeGreaterThan(mat.position.x);
    expect(habitatPoints.black.y).toBeGreaterThan(mat.position.y);
    const neighbour = map.npcHooks.find(h => h.characterId === 'resident-laundry-neighbour')!;
    expect(findPath(map, neighbour.position, neighbour.route[0]).length).toBeGreaterThan(0);
  });
});
