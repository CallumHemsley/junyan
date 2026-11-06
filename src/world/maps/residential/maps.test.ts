import { describe, expect, it } from 'vitest';
import { mapDefinitions } from './index';
import { worldMapSchema } from '../../schema';
import { canStand as sharedCanStand, findPath } from '../../geometry';

type Point = { x: number; y: number };
type Rect = Point & { width: number; height: number };
const inside = (p: Point, r: Rect) => p.x >= r.x && p.y >= r.y && p.x < r.x + r.width && p.y < r.y + r.height;

function reachable(map: typeof mapDefinitions[number]) {
  const validated = worldMapSchema.parse(map);
  const canStand = (p: Point) => sharedCanStand(validated, p);
  const start = { x: Math.floor(map.defaultSpawn.x) + .5, y: Math.floor(map.defaultSpawn.y) + .5 };
  const queue = [start];
  const seen = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i], key = `${p.x},${p.y}`;
    if (seen.has(key) || !canStand(p)) continue;
    seen.add(key);
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) queue.push({ x: p.x + dx, y: p.y + dy });
  }
  return { seen, canStand };
}

describe('residential routes', () => {
  for (const map of mapDefinitions) {
    it(`${map.id} connects arrivals, door approaches and every authored landmark`, () => {
      const { seen, canStand } = reachable(map);
      const standable = new Set<string>();
      for (let x = .5; x < map.bounds.width; x++) for (let y = .5; y < map.bounds.height; y++) if (canStand({ x, y })) standable.add(`${x},${y}`);
      expect(seen).toEqual(standable);
      for (const entrance of map.entrances) {
        expect(canStand(entrance.position), entrance.id).toBe(true);
        expect(map.exits.some(exit => inside(entrance.position, exit.rect)), entrance.id).toBe(false);
        expect(seen.has(`${Math.floor(entrance.position.x) + .5},${Math.floor(entrance.position.y) + .5}`), entrance.id).toBe(true);
      }
      for (const landmark of map.landmarks) {
        expect(seen.has(`${Math.floor(landmark.position.x) + .5},${Math.floor(landmark.position.y) + .5}`), landmark.id).toBe(true);
        expect(findPath(worldMapSchema.parse(map), map.defaultSpawn, landmark.position).length, landmark.id).toBeGreaterThan(0);
      }
      for (const exit of map.exits) expect([...seen].some(key => {
        const [x, y] = key.split(',').map(Number);
        return inside({ x, y }, exit.rect);
      }), exit.id).toBe(true);
    });
  }
  it('pairs all internal stairs and door returns by the central naming convention', () => {
    for (const source of mapDefinitions) for (const exit of source.exits) {
      const target = mapDefinitions.find(map => map.id === exit.targetMapId);
      if (!target) continue;
      expect(target.entrances.some(e => e.id === exit.targetEntranceId)).toBe(true);
      expect(target.exits.some(e => e.targetMapId === source.id && e.targetEntranceId === `from-${target.id}`)).toBe(true);
    }
  });
});
