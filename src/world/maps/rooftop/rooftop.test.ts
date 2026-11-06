import {describe, expect, it} from 'vitest';
import {initialState, reduce, siteIds, type State} from '../../../features/garden/rules';
import {gardenSites, rooftopForGarden, rooftopMap} from './index';

type Rect = {x: number; y: number; width: number; height: number};
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
function reachable(map: ReturnType<typeof rooftopForGarden>) {
  const step = .5, radius = .28;
  const clear = (x: number, y: number) => {
    const foot = {x: x - radius, y: y - radius, width: radius * 2, height: radius * 2};
    return map.walkable.some(r => foot.x >= r.x && foot.y >= r.y && foot.x + foot.width <= r.x + r.width && foot.y + foot.height <= r.y + r.height)
      && !map.colliders.some(c => overlap(foot, c.rect));
  };
  const key = (x: number, y: number) => `${x},${y}`;
  const start = map.defaultSpawn;
  const seen = new Set([key(start.x, start.y)]), queue = [{x: start.x, y: start.y}];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const x = p.x + dx, y = p.y + dy, id = key(x, y);
      if (seen.has(id) || !clear(x, y)) continue;
      seen.add(id); queue.push({x, y});
    }
  }
  return {seen, queue, clear};
}

describe('rooftop circulation and existing garden projection', () => {
  it('keeps every destination and stair threshold reachable with the player footprint', () => {
    const map = rooftopForGarden(initialState());
    const route = reachable(map);
    expect(route.clear(map.defaultSpawn.x, map.defaultSpawn.y)).toBe(true);
    for (const destination of [...map.anchors, ...map.landmarks, ...map.entrances]) {
      expect(route.queue.some(p => Math.hypot(p.x - destination.position.x, p.y - destination.position.y) < .6), destination.id).toBe(true);
    }
    for (const exit of map.exits) expect(route.queue.some(p => overlap({x: p.x, y: p.y, width: .01, height: .01}, exit.rect)), exit.id).toBe(true);
    expect(map.exits[0].targetMapId).toBe('residential-stairs');
    expect(overlap({x: map.defaultSpawn.x - .28, y: map.defaultSpawn.y - .28, width: .56, height: .56}, map.exits[0].rect)).toBe(false);
  });

  it('keeps circulation open for every legal three-pot layout and each shade site', () => {
    const state = initialState();
    for (const flower of siteIds) for (const climber of siteIds) for (const tree of siteIds) {
      if (new Set([flower, climber, tree]).size !== 3) continue;
      for (const shade of siteIds) {
        const layout: State = {...state, shade, plants: {
          flower: {...state.plants.flower, site: flower}, climber: {...state.plants.climber, site: climber}, tree: {...state.plants.tree, site: tree},
        }};
        const map = rooftopForGarden(layout);
        // All state-driven footprints stay off the central cross-route and named destinations.
        for (const destination of [...map.anchors, ...map.landmarks]) {
          const foot = {x: destination.position.x - .28, y: destination.position.y - .28, width: .56, height: .56};
          expect(map.colliders.some(c => overlap(foot, c.rect)), `${flower}/${climber}/${tree}/${shade}: ${destination.id}`).toBe(false);
        }
        const route = reachable(map);
        for (const anchor of map.anchors) expect(route.queue.some(p => Math.hypot(p.x - anchor.position.x, p.y - anchor.position.y) < .6), anchor.id).toBe(true);
      }
    }
  }, 60000);

  it('moves art and collision together through the original reducer without mutating saved state', () => {
    let state = reduce(initialState(), {type: 'sync'}, 1);
    state = reduce(state, {type: 'tidy', value: true}, 1);
    const before = structuredClone(state);
    const moved = reduce(state, {type: 'move', plant: 'flower', site: 1}, 1);
    const map = rooftopForGarden(moved);
    const art = map.props.find(p => p.id === 'rooftop.garden-flower')!;
    const collider = map.colliders.find(c => c.id === art.id)!;
    expect(art.position).toEqual(gardenSites[1]);
    expect(collider.rect).toMatchObject({...gardenSites[1], width: art.width, height: art.height});
    expect(state).toEqual(before);
    expect(map.colliders.some(c => c.id === 'rooftop.garden-flower' && c.rect.x === gardenSites[0].x)).toBe(false);
  });

  it('renders growth and care distinctly without adding canopy collision or changing game rules', () => {
    const base = initialState();
    const states = [base, {...base, plants: {...base.plants, flower: {...base.plants.flower, growth: 3, care: 'ready' as const}}}, {...base, plants: {...base.plants, flower: {...base.plants.flower, drooping: true, care: 'extra' as const}}}];
    const variants = states.map(s => rooftopForGarden(s).props.find(p => p.id === 'rooftop.garden-flower')!.variant);
    expect(new Set(variants).size).toBe(3);
    expect(rooftopForGarden(base).colliders.some(c => c.id === 'rooftop.garden-shade')).toBe(false);
    expect(rooftopMap.npcHooks[0].characterId).toBe('lin-jie');
  });
});
