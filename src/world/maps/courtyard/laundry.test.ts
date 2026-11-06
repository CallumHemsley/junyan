import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { worldMaps } from '../../registry';
import { navigationFor } from '../../life/navigation';
import { entranceExclusions } from '../../life/routes';
import { segmentIntersects } from '../../life/visibility';
import { courtyardMap } from './index';
import { habitatPoints } from './habitat';

const id = 'resident-laundry-neighbour';
describe('courtyard laundry neighbour allocation', () => {
  it('has exactly one home in the canonical map and preserves existing inhabitants', () => {
    const assignments = Object.values(worldMaps).flatMap(map => map.npcHooks.filter(h => h.characterId === id).map(h => ({ mapId: map.id, hook: h })));
    expect(assignments).toHaveLength(1);
    expect(assignments[0].mapId).toBe('courtyard');
    expect(courtyardMap.npcHooks.filter(h => ['aunt', 'cats.white', 'cats.black'].includes(h.characterId))).toHaveLength(3);
  });

  it('connects laundry and water-jar approaches through shared radius-aware navigation', () => {
    const map = worldMapSchema.parse(courtyardMap), navigation = navigationFor(map), exclusions = entranceExclusions(map);
    const hook = map.npcHooks.find(h => h.characterId === id)!;
    const stops = [hook.position, ...hook.route];
    expect(stops).toHaveLength(2);
    for (let i = 0; i < stops.length; i++) {
      const from = stops[i], to = stops[(i + 1) % stops.length];
      expect(navigation.canStand(from, .22)).toBe(true);
      const route = navigation.route(from, to, .22, exclusions);
      expect(route.length).toBeGreaterThan(0);
      expect(route.at(-1)).toEqual(to);
      let previous = from;
      for (const point of route) {
        expect(navigation.canWalk(previous, point, .22)).toBe(true);
        expect(exclusions.some(rect => segmentIntersects(previous, point, rect, .22))).toBe(false);
        const steps = Math.max(1, Math.ceil(Math.hypot(point.x - previous.x, point.y - previous.y) / .1));
        for (let n = 0; n <= steps; n++) {
          const at = { x: previous.x + (point.x - previous.x) * n / steps, y: previous.y + (point.y - previous.y) * n / steps };
          for (const cat of ['bicycle', 'open', 'path', 'door', 'window', 'black'] as const) expect(Math.hypot(at.x - habitatPoints[cat].x, at.y - habitatPoints[cat].y)).toBeGreaterThan(.9);
        }
        previous = point;
      }
    }
  });
});

it('uses the published unvoiced work profile for deterministic walking and task pauses', async () => {
  const { compileLife } = await import('../../life/routes');
  const { sampleLife } = await import('../../life/sample');
  const { profileFor } = await import('../../life/profiles');
  const { sampleActor } = await import('../../characters');
  const map = worldMapSchema.parse(courtyardMap), navigation = navigationFor(map), plan = compileLife(map, navigation);
  const resident = plan.actors.find(a => a.characterId === id)!;
  expect(plan.diagnostics.filter(d => d.hookId === 'courtyard.laundry-neighbour')).toEqual([]);
  expect(plan.actors.filter(a => a.characterId === id)).toHaveLength(1);
  expect(profileFor(id)).toMatchObject({ homeMap: 'courtyard', resting: 'work' });
  expect(profileFor(id)?.greeting).toBeUndefined();
  expect(resident.phases.some(p => p.action === 'walk')).toBe(true);
  const tasks = resident.phases.filter(p => p.action === 'work');
  expect(tasks).toHaveLength(2);
  expect(tasks.every(p => p.endMs - p.startMs >= 6000)).toBe(true);
  const context = { day: 1, seed: 42, elapsedMs: 12345, player: { x: 32.8, y: 15.5 }, reducedMotion: false };
  expect(sampleLife(plan, context, navigation)).toEqual(sampleLife(plan, context, navigation));
  const actions = new Set<string>();
  for (let elapsedMs = 0; elapsedMs <= resident.durationMs; elapsedMs += 500) {
    const actor = sampleLife(plan, { ...context, elapsedMs }, navigation).find(a => a.characterId === id)!;
    expect(navigation.canStand(actor.position, actor.radius)).toBe(true);
    expect(actor.greeting).toBeUndefined(); actions.add(actor.activity);
  }
  expect(actions).toContain('walk'); expect(actions).toContain('work');
  const reduced = { characterId: id, facing: 'south' as const, action: 'interact' as const, posture: 'work' as const, reducedMotion: true };
  const still = sampleActor({ ...reduced, elapsedMs: 0 });
  expect(still.frameId).toContain('laundry-basket');
  expect(still.frame.pixels).toEqual(sampleActor({ ...reduced, elapsedMs: 2400 }).frame.pixels);
  expect(sampleActor({ ...reduced, reducedMotion: false, elapsedMs: 0 }).frame.pixels).not.toEqual(sampleActor({ ...reduced, reducedMotion: false, elapsedMs: 260 }).frame.pixels);
  const moving = { ...reduced, posture: 'stand' as const, action: 'walk' as const, reducedMotion: false };
  expect(sampleActor({ ...moving, elapsedMs: 0 }).frame.pixels).not.toEqual(sampleActor({ ...moving, elapsedMs: 260 }).frame.pixels);
});
