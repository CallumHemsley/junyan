import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../schema';
import { canStand } from '../geometry';
import { mapDefinitions as town } from '../maps/town';
import { mapDefinitions as landscape } from '../maps/landscape';
import { mapDefinitions as rooftop } from '../maps/rooftop';
import { compileLife, navigationFor, sampleLife } from './index';
import { routines } from './routines';

describe('authored life routines on actual map definitions', () => {
  for (const definition of [...town, ...landscape, ...rooftop]) {
    it(`keeps ${definition.id} routines inside real shared geometry and outside entrances`, () => {
      const map = worldMapSchema.parse(definition), navigation = navigationFor(map);
      const plan = compileLife(map, navigation);
      const expected = routines.filter(routine => routine.mapId === map.id);
      expected.forEach(routine => expect(plan.actors.some(actor => actor.id === routine.id), JSON.stringify(plan.diagnostics)).toBe(true));
      for (let elapsedMs = 0; elapsedMs < 90000; elapsedMs += 700) {
        const actors = sampleLife(plan, { day: 2, elapsedMs, player: map.defaultSpawn, seed: 42, reducedMotion: false, gardenMature: true }, navigation);
        actors.forEach(actor => expect(canStand(map, actor.position, actor.radius)).toBe(true));
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
