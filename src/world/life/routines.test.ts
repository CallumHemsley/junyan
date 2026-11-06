import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../schema';
import { canStand } from '../geometry';
import { mapDefinitions as town } from '../maps/town';
import { mapDefinitions as landscape } from '../maps/landscape';
import { mapDefinitions as rooftop } from '../maps/rooftop';
import { compileLife, navigationFor, sampleLife } from './index';
import { routines } from './routines';
import { profileFor } from './profiles';

describe('authored life routines on actual map definitions', () => {
  for (const definition of [...town, ...landscape, ...rooftop]) {
    it(`keeps ${definition.id} routines inside real shared geometry and outside entrances`, () => {
      const map = worldMapSchema.parse(definition), navigation = navigationFor(map);
      const plan = compileLife(map, navigation);
      const expected = routines.filter(routine => routine.mapId === map.id);
      for (const routine of expected) {
        const authored = map.npcHooks.filter(hook => profileFor(hook.characterId)?.id === routine.characterId);
        const actors = plan.actors.filter(actor => actor.characterId === routine.characterId);
        expect(actors, JSON.stringify(plan.diagnostics)).toHaveLength(authored.length || 1);
        if (authored.length) {
          expect(actors.map(actor => actor.id).sort()).toEqual(authored.map(hook => hook.id).sort());
          expect(actors.some(actor => actor.id === routine.id)).toBe(false);
        } else expect(actors[0].id).toBe(routine.id);
      }
      const moved = new Map<string, Set<string>>();
      const actions = new Map<string, Set<string>>();
      for (let elapsedMs = 0; elapsedMs < 90000; elapsedMs += 700) {
        const actors = sampleLife(plan, { day: 2, elapsedMs, player: map.defaultSpawn, seed: 42, reducedMotion: false, gardenMature: true }, navigation);
        actors.forEach(actor => {
          expect(canStand(map, actor.position, actor.radius)).toBe(true);
          expect(map.entrances.every(entrance => Math.abs(actor.position.x - entrance.position.x) > .55 + actor.radius || Math.abs(actor.position.y - entrance.position.y) > .55 + actor.radius)).toBe(true);
          expect(map.exits.every(exit => actor.position.x < exit.rect.x - .25 - actor.radius || actor.position.x > exit.rect.x + exit.rect.width + .25 + actor.radius || actor.position.y < exit.rect.y - .25 - actor.radius || actor.position.y > exit.rect.y + exit.rect.height + .25 + actor.radius)).toBe(true);
          const positions = moved.get(actor.id) ?? new Set<string>(); positions.add(JSON.stringify(actor.position)); moved.set(actor.id, positions);
          const phases = actions.get(actor.id) ?? new Set<string>(); phases.add(actor.action); actions.set(actor.id, phases);
        });
      }
      for (const routine of expected) for (const actor of plan.actors.filter(actor => actor.characterId === routine.characterId)) {
        expect(moved.get(actor.id)!.size).toBeGreaterThan(10);
        expect(actions.get(actor.id)!.has('walk')).toBe(true);
        expect(actions.get(actor.id)!.size).toBeGreaterThan(1);
      }
    });
  }
  it('reveals rooftop birds through existing mature-garden authority', () => {
    const map = worldMapSchema.parse(rooftop[0]), navigation = navigationFor(map), plan = compileLife(map, navigation);
    const context = { day: 2, elapsedMs: 10000, player: map.defaultSpawn, seed: 42, reducedMotion: false };
    expect(sampleLife(plan, { ...context, gardenMature: false }, navigation).some(actor => actor.kind === 'bird')).toBe(false);
    expect(sampleLife(plan, { ...context, gardenMature: true }, navigation).some(actor => actor.kind === 'bird')).toBe(true);
  });
});


it('provides one valid town office fallback only when the authored canonical hook is absent', () => {
  const map = worldMapSchema.parse(town[0]);
  map.npcHooks = map.npcHooks.filter(hook => profileFor(hook.characterId)?.id !== 'xiao-li');
  const navigation = navigationFor(map), plan = compileLife(map, navigation);
  const actors = plan.actors.filter(actor => actor.characterId === 'xiao-li');
  expect(actors, JSON.stringify(plan.diagnostics)).toHaveLength(1);
  expect(actors[0].id).toBe('life.town.office-walk');
  const positions = new Set<string>();
  for (let elapsedMs = 0; elapsedMs < 90000; elapsedMs += 500) {
    const actor = sampleLife(plan, { day: 1, elapsedMs, player: map.defaultSpawn, seed: 42, reducedMotion: false }, navigation).find(actor => actor.characterId === 'xiao-li')!;
    expect(canStand(map, actor.position, actor.radius)).toBe(true);
    positions.add(JSON.stringify(actor.position));
  }
  expect(positions.size).toBeGreaterThan(20);
});
