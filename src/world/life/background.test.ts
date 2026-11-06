import { describe, expect, it } from 'vitest';
import { compileLife, initialLifeState, interactLife, nearbyLife, sampleLife } from './index';
import type { LifeMap, Navigation } from './model';

const assignments = [
  ['resident-reader', 'park', 'sit'], ['resident-courier', 'town', 'work'],
  ['resident-groundskeeper', 'park', 'work'], ['resident-laundry-neighbour', 'courtyard', 'work'],
  ['resident-river-walker', 'riverbank', 'idle'],
] as const;
const navigation: Navigation = {
  canStand: (p, radius) => p.x >= radius && p.y >= radius && p.x <= 12 - radius && p.y <= 12 - radius,
  canWalk: () => true, route: (_from, to) => [to],
};
function definition(characterId: string, mapId: string): LifeMap {
  return { id: mapId, entrances: [], exits: [], landmarks: [], npcHooks: [
    { id: `fixture.${characterId}`, characterId, position: { x: 4, y: 4 }, route: [{ x: 8, y: 4 }] },
  ] };
}

describe('canonical unvoiced background routines', () => {
  for (const [id, mapId, resting] of assignments) {
    it(`${id} walks, performs its task and remains unvoiced while regulars are inside`, () => {
      const map = definition(id, mapId), plan = compileLife(map, navigation);
      expect(plan.diagnostics).toEqual([]);
      const positions = new Set<string>(), activities = new Set<string>();
      const context = { day: 1, elapsedMs: 0, seed: 42, player: { x: 11, y: 11 }, reducedMotion: false, excludedCharacterIds: ['lin-jie', 'xiao-li', 'zhang-laoshi', 'xiao-zhou'] };
      for (let elapsedMs = 0; elapsedMs < 90000; elapsedMs += 300) {
        const actors = sampleLife(plan, { ...context, elapsedMs }, navigation);
        expect(actors).toEqual(sampleLife(plan, { ...context, elapsedMs }, navigation));
        expect(actors).toHaveLength(1);
        expect(actors[0].greeting).toBeUndefined();
        positions.add(JSON.stringify(actors[0].position)); activities.add(actors[0].activity);
      }
      expect(positions.size).toBeGreaterThan(15);
      expect(activities.has('walk')).toBe(true);
      expect(activities.has(resting)).toBe(true);
      const actor = sampleLife(plan, context, navigation)[0];
      const option = nearbyLife(plan, [actor], actor.position, navigation)[0];
      expect(option.kind).toBe('watch');
      const response = interactLife(initialLifeState(), plan, [actor], { ...context, player: actor.position }, option.id, navigation);
      expect(response.line).toBeUndefined();
      const reduced = sampleLife(plan, { ...context, reducedMotion: true }, navigation)[0];
      expect(reduced.phaseMs).toBe(0);
    });
    it(`rejects ${id} outside its centrally assigned sole map`, () => {
      const plan = compileLife(definition(id, 'unassigned-map'), navigation);
      expect(plan.actors).toEqual([]);
      expect(plan.diagnostics[0].reason).toBe('wrong-home-map');
    });
  }
});

it('lets a nearby reader keep reading, then acknowledge an explicit look without speech', () => {
  const plan = compileLife(definition('resident-reader', 'park'), navigation);
  const far = { day: 1, elapsedMs: 0, seed: 42, player: { x: 11, y: 11 }, reducedMotion: false };
  let elapsedMs = 0;
  while (sampleLife(plan, { ...far, elapsedMs }, navigation)[0].activity !== 'sit') elapsedMs += 100;
  const actor = sampleLife(plan, { ...far, elapsedMs }, navigation)[0];
  const near = { ...far, elapsedMs, player: actor.position };
  const reading = sampleLife(plan, near, navigation)[0];
  expect(reading.activity).toBe('sit');
  expect(reading.action).toBe('idle');
  const option = nearbyLife(plan, [reading], actor.position, navigation)[0];
  const response = interactLife({ ...initialLifeState(), elapsedMs }, plan, [reading], near, option.id, navigation);
  expect(response.line).toBeUndefined();
  const acknowledging = sampleLife(plan, { ...near, elapsedMs: elapsedMs + 500 }, navigation, response.state)[0];
  expect(acknowledging.position).toEqual(actor.position);
  expect(acknowledging.activity).toBe('watch');
  const resumed = sampleLife(plan, { ...near, elapsedMs: elapsedMs + 1900 }, navigation, response.state)[0];
  expect(resumed.activity).toBe('sit');
});
