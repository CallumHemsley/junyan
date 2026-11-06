import { expect, it } from 'vitest';
import { worldMaps } from '../registry';
import { isBackgroundResidentId } from '../characters';
import { compileLife, navigationFor, sampleLife } from './index';

const assignments = [
  ['resident-reader', 'park'], ['resident-courier', 'town'], ['resident-groundskeeper', 'park'],
  ['resident-laundry-neighbour', 'courtyard'], ['resident-river-walker', 'riverbank'],
] as const;

it('consumes all five sole-map authored hooks with real collision-safe walk and task phases', () => {
  for (const [id, mapId] of assignments) {
    expect(isBackgroundResidentId(id)).toBe(true);
    const hooks = Object.values(worldMaps).flatMap(map => map.npcHooks.filter(hook => hook.characterId === id).map(hook => ({ mapId: map.id, hook })));
    expect(hooks, `Missing or duplicated authored hook for ${id}`).toHaveLength(1);
    expect(hooks[0].mapId).toBe(mapId);
    const map = worldMaps[mapId], navigation = navigationFor(map), plan = compileLife(map, navigation);
    expect(plan.diagnostics.filter(item => item.hookId === hooks[0].hook.id)).toEqual([]);
    expect(plan.actors.filter(actor => actor.characterId === id)).toHaveLength(1);
    const positions = new Set<string>(), actions = new Set<string>();
    for (let elapsedMs = 0; elapsedMs < 150000; elapsedMs += 800) {
      const context = { day: 1, elapsedMs, seed: 42, player: map.defaultSpawn, reducedMotion: false, excludedCharacterIds: ['lin-jie', 'xiao-li', 'zhang-laoshi', 'xiao-zhou'] };
      const actor = sampleLife(plan, context, navigation).find(actor => actor.characterId === id)!;
      expect(actor.greeting).toBeUndefined();
      expect(navigation.canStand(actor.position, actor.radius)).toBe(true);
      expect(map.entrances.every(entrance => Math.abs(actor.position.x - entrance.position.x) > .55 + actor.radius || Math.abs(actor.position.y - entrance.position.y) > .55 + actor.radius)).toBe(true);
      expect(map.exits.every(exit => actor.position.x < exit.rect.x - .25 - actor.radius || actor.position.x > exit.rect.x + exit.rect.width + .25 + actor.radius || actor.position.y < exit.rect.y - .25 - actor.radius || actor.position.y > exit.rect.y + exit.rect.height + .25 + actor.radius)).toBe(true);
      positions.add(JSON.stringify(actor.position)); actions.add(actor.action);
    }
    expect(positions.size).toBeGreaterThan(20);
    expect(actions.has('walk')).toBe(true); expect(actions.has('idle')).toBe(true);
  }
});
