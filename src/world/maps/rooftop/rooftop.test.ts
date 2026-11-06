import {describe, expect, it} from 'vitest';
import {compileLife, navigationFor, sampleLife} from '../../life';
import {worldMapSchema} from '../../schema';
import {canStand, findPath} from '../../geometry';
import {initialState, reduce, siteIds, type State} from '../../../features/garden/rules';
import {gardenSites, rooftopForGarden, rooftopMap} from './index';

type Rect = {x: number; y: number; width: number; height: number};
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
function reachable(map: ReturnType<typeof rooftopForGarden>) {
  const step = .5;
  const definition = worldMapSchema.parse(map);
  const clear = (x: number, y: number) => canStand(definition, {x, y}, .28);
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
  it('validates against the shared schema and traverses to every landmark using foundation pathfinding', () => {
    const map = worldMapSchema.parse(rooftopForGarden(initialState()));
    for (const landmark of map.landmarks) {
      expect(canStand(map, landmark.position), landmark.id).toBe(true);
      expect(findPath(map, map.defaultSpawn, landmark.position).length, landmark.id).toBeGreaterThan(0);
    }
  });
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
        const bird = map.npcHooks.find(hook => hook.characterId === 'bird')!;
        const stops = [bird.position, ...bird.route];
        const definition = worldMapSchema.parse(map);
        for (let i = 0; i < stops.length; i++) {
          const from = stops[i], to = stops[(i + 1) % stops.length];
          for (let step = 0; step <= 10; step++) expect(canStand(definition, {x: from.x + (to.x - from.x) * step / 10, y: from.y + (to.y - from.y) * step / 10}, .1), `bird ${flower}/${climber}/${tree}/${shade}`).toBe(true);
        }
        const route = reachable(map);
        for (const anchor of map.anchors) expect(route.queue.some(p => Math.hypot(p.x - anchor.position.x, p.y - anchor.position.y) < .6), anchor.id).toBe(true);
      }
    }
  }, 60000);

  it('clears the real crate footprints through the existing tidy action', () => {
    const before = reduce(initialState(), {type: 'sync'}, 1);
    const after = reduce(before, {type: 'tidy', value: true}, 1);
    const cluttered = rooftopForGarden(before), clear = rooftopForGarden(after);
    expect(cluttered.props.filter(p => p.kind === 'garden-crate')).toHaveLength(2);
    expect(clear.props.filter(p => p.kind === 'garden-crate')).toHaveLength(0);
    expect(cluttered.colliders.some(c => c.id === 'rooftop.garden-crate-a')).toBe(true);
    expect(clear.colliders.some(c => c.id === 'rooftop.garden-crate-a')).toBe(false);
  });

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

  it('keeps the bird reward beside the saved tree through every legal move', () => {
    let state = reduce(initialState(), {type: 'sync'}, 1);
    state = reduce(state, {type: 'tidy', value: true}, 1);
    for (const site of siteIds) {
      // Move any other occupant out before moving the tree with the real reducer.
      const occupant = (['flower', 'climber'] as const).find(id => state.plants[id].site === site);
      if (occupant) {
        const free = siteIds.find(value => !Object.values(state.plants).some(plant => plant.site === value))!;
        state = reduce(state, {type: 'move', plant: occupant, site: free}, 1);
      }
      state = reduce(state, {type: 'move', plant: 'tree', site}, 1);
      const map = worldMapSchema.parse(rooftopForGarden(state));
      const navigation = navigationFor(map), plan = compileLife(map, navigation);
      expect(plan.diagnostics, `site ${site}`).toEqual([]);
      const bird = plan.actors.find(actor => actor.characterId === 'bird')!;
      expect(bird, `site ${site}`).toBeDefined();
      expect(bird.home.x).toBeCloseTo(gardenSites[site].x + .3);
      expect(bird.home.y).toBeCloseTo(gardenSites[site].y + 2.1);
      for (let elapsedMs = 0; elapsedMs < bird.durationMs; elapsedMs += 700) {
        const pose = sampleLife(plan, {day: 1, elapsedMs, seed: 42, player: map.defaultSpawn, reducedMotion: false, gardenMature: true}, navigation).find(actor => actor.id === bird.id)!;
        expect(canStand(map, pose.position, pose.radius)).toBe(true);
      }
    }
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
