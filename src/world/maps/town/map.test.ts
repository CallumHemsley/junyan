import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, contains, findPath } from '../../geometry';
import { project, unproject } from '../../camera';
import definition from './map.json';

const map = worldMapSchema.parse(definition);
describe('authored town travel', () => {
  it('keeps six usable door and path approaches connected with safe arrivals', () => {
    expect(map.exits.map(e => e.targetMapId).sort()).toEqual(['courtyard', 'park', 'residential-hall', 'restaurant', 'riverbank', 'workshop']);
    for (const entry of map.entrances) {
      expect(canStand(map, entry.position), entry.id).toBe(true);
      expect(map.exits.some(e => contains(e.rect, entry.position)), entry.id).toBe(false);
      const path = findPath(map, map.defaultSpawn, entry.position);
      expect(path.length, entry.id).toBeGreaterThan(0);
      let p = map.defaultSpawn;
      for (const next of path) { expect(canWalk(map, p, next), entry.id).toBe(true); p = { ...p, ...next }; }
    }
    for (const exit of map.exits) {
      const r = exit.rect;
      expect(findPath(map, map.defaultSpawn, { x: r.x + r.width / 2, y: r.y + r.height / 2 }).length, exit.id).toBeGreaterThan(0);
      expect(exit.targetEntranceId).toBe('from-town');
    }
  });
  it('reaches every authored observation and landmark without crossing buildings', () => {
    for (const target of [...map.anchors, ...map.landmarks]) expect(findPath(map, map.defaultSpawn, target.position).length, target.id).toBeGreaterThan(0);
    expect(canWalk(map, { x: 34, y: 30 }, { x: 34, y: 20 })).toBe(false);
    expect(canStand(map, { x: 72, y: 42 })).toBe(false);
  });
  it('keeps residents on collision-safe routes and projects phone edges accurately', () => {
    for (const hook of map.npcHooks) for (let i = 1; i < hook.route.length; i++) expect(canWalk(map, hook.route[i - 1], hook.route[i]), hook.id).toBe(true);
    for (const width of [390, 1280]) for (const focus of map.entrances.map(e => e.position)) {
      const camera = { width, height: 640, focus, scale: 22 };
      for (const p of [{ x: 0, y: 0 }, { x: width, y: 640 }, { x: width / 2, y: 320 }]) {
        const roundTrip = project(unproject(p, camera), camera);
        expect(roundTrip.x).toBeCloseTo(p.x, 6); expect(roundTrip.y).toBeCloseTo(p.y, 6);
      }
    }
  });
});
