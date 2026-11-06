import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, contains, findPath } from '../../geometry';
import { project, unproject } from '../../camera';
import definition from './map.json';
import courier from './courier-hook.json';
import { worldMaps } from '../../registry';
import { compileLife, entranceExclusions } from '../../life';
import { navigationFor } from '../../life/navigation';

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
  it('keeps the allocated courier circuit clear of doors and active targets', () => {
    const navigation = navigationFor(map), exclusions = entranceExclusions(map);
    const points = courier.route;
    for (const point of points) {
      expect(navigation.canStand(point, .22)).toBe(true);
      for (const anchor of map.anchors) expect(Math.hypot(point.x-anchor.position.x, point.y-anchor.position.y)).toBeGreaterThan(anchor.radius+.22);
    }
    for (let i=0; i<points.length; i++) expect(navigation.route(points[i], points[(i+1)%points.length], .22, exclusions).length).toBeGreaterThan(0);
  });
  it('registers every authored resident and bird without blocking door arrivals', () => {
    const plan = compileLife(map, navigationFor(map));
    expect(plan.diagnostics).toEqual([]);
    for (const hook of map.npcHooks) expect(plan.actors.some(actor => actor.id === hook.id), hook.id).toBe(true);
    const couriers = plan.actors.filter(actor => actor.characterId === 'resident-courier');
    expect(couriers).toHaveLength(1);
    expect(couriers[0].profile.greeting).toBeUndefined();
    expect(couriers[0].profile.homeMap).toBe('town');
    const homes = Object.values(worldMaps).flatMap(map => map.npcHooks.filter(hook => hook.characterId === 'resident-courier').map(() => map.id));
    expect(homes).toEqual(['town']);
    expect(map.npcHooks.some(hook => hook.characterId === 'aunt')).toBe(false);
  });
  it('keeps residents on collision-safe routes and projects phone edges accurately', () => {
    for (const hook of map.npcHooks) {
      expect(canStand(map, hook.position), hook.id).toBe(true);
      for (const point of hook.route) expect(canStand(map, point), hook.id).toBe(true);
    }
    for (const actor of compileLife(map, navigationFor(map)).actors) for (const phase of actor.phases) {
      if (phase.action === 'walk') expect(canWalk(map, phase.from, phase.to), actor.id).toBe(true);
    }
    for (const width of [390, 1280]) for (const focus of map.entrances.map(e => e.position)) {
      const camera = { width, height: 640, focus, scale: 22 };
      for (const p of [{ x: 0, y: 0 }, { x: width, y: 640 }, { x: width / 2, y: 320 }]) {
        const roundTrip = project(unproject(p, camera), camera);
        expect(roundTrip.x).toBeCloseTo(p.x, 6); expect(roundTrip.y).toBeCloseTo(p.y, 6);
      }
    }
  });
});
