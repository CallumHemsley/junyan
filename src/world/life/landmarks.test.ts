import { describe, expect, it } from 'vitest';
import fixtures from './solid-landmarks.fixture.json';
import { worldMapSchema } from '../schema';
import { canStand, canWalk } from '../geometry';
import { compileLife, initialLifeState, interactLife, navigationFor, nearbyLife, restoreLife } from './index';
import type { LifeContext } from './index';

const approaches = {
  courtyard: { x: 27.25, y: 21 },
  riverbank: { x: 38.25, y: 39 },
};

describe('actual occupied landmark geometry', () => {
  for (const fixture of fixtures.filter(item => item.map.id !== 'park')) {
    it(`inspects and revisits ${fixture.map.id} without walking onto its solid landmark`, () => {
      const map = worldMapSchema.parse(fixture.map);
      const player = approaches[map.id as keyof typeof approaches], target = map.landmarks[0];
      const navigation = navigationFor(map), plan = compileLife(map, navigation);
      expect(canStand(map, player)).toBe(true);
      expect(canWalk(map, player, target.position)).toBe(false);
      const option = nearbyLife(plan, [], player, navigation).find(item => item.targetId === target.id);
      expect(option?.kind).toBe('inspect');
      const context: LifeContext = { player, day: 1, elapsedMs: 1000, seed: 42, reducedMotion: false };
      const first = interactLife(initialLifeState(), plan, [], context, option!.id, navigation);
      expect(first.events.map(item => item.type)).toEqual(['discovered', 'reacted']);
      expect(first.state.reactions[0].reaction).toBe('ripple');
      const restored = restoreLife(JSON.parse(JSON.stringify(first.state)));
      const repeat = interactLife(restored, plan, [], { ...context, day: 2, elapsedMs: 2000 }, option!.id, navigation);
      expect(repeat.events.map(item => item.type)).toEqual(['reacted']);
      expect(repeat.state.discoveries).toEqual(first.state.discoveries);
    });

    it(`rejects an intervening wall before the occupied ${fixture.map.id} landmark`, () => {
      const map = worldMapSchema.parse(fixture.map);
      const player = approaches[map.id as keyof typeof approaches], target = map.landmarks[0];
      const midpoint = { x: player.x + (target.position.x - player.x) * .35, y: player.y + (target.position.y - player.y) * .35 };
      map.colliders.push({ id: 'regression.intervening-wall', rect: { x: midpoint.x - .05, y: midpoint.y - .2, width: .1, height: .4 } });
      expect(canStand(map, player)).toBe(true);
      expect(nearbyLife(compileLife(map, navigationFor(map)), [], player, navigationFor(map))).toEqual([]);
    });
  }

  it('does not pretend the currently inaccessible park pond-deck has a reachable approach', () => {
    const map = worldMapSchema.parse(fixtures.find(item => item.map.id === 'park')!.map);
    const target = map.landmarks[0];
    const approaches = [];
    for (let dx = -1.75; dx <= 1.75; dx += .25) for (let dy = -1.75; dy <= 1.75; dy += .25) {
      if (Math.hypot(dx, dy) <= 1.8 && canStand(map, { x: target.position.x + dx, y: target.position.y + dy })) approaches.push({ dx, dy });
    }
    expect(approaches).toEqual([]);
  });
});
