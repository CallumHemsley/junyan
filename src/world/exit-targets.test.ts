import { expect, it } from 'vitest';
import { content } from '../neighbourhood/registry';
import { contentWords } from '../content/words';
import { worldMaps } from './registry';
import { nearbyExitTargets } from './exit-targets';
import { canStand, canWalk, findPath } from './geometry';
import { explorationCamera, project } from './camera';
import { pickSurface } from './surfaces';
import { advanceRoute } from './locomotion';
import { createWorld, reduceWorld } from './state';
import { targetWords } from './target-labels';
import { cycleTarget, selectTarget, type NearbyTarget } from './target-selection';
import { worldMapSchema } from './schema';
const dictionary = contentWords(content);
it('offers the real residence threshold from its clear nearby landing using the canonical home word', () => {
  const targets = nearbyExitTargets(worldMaps.town, { x: 12, y: 22.5 }, dictionary);
  expect(targets).toHaveLength(1);
  expect(targets[0]).toMatchObject({ source: 'exit', targetId: 'to-residential-hall', position: { x: 11.5, y: 21.6 } });
  if (targets[0].source !== 'exit') throw new Error('Expected exit cue');
  expect(targets[0].word).toBe(dictionary.find(word => word.id === 'apartment.home'));
});


it('distinguishes the unsupported elevated face inverse from the existing reachable threshold', () => {
  const map = worldMaps.town, player = { x: 20.3, y: 29.1 };
  const camera = explorationCamera(map.bounds, player, 720, 462);
  expect(canStand(map, player)).toBe(true);
  expect(pickSurface(project({ x: 11.5, y: 21.32 }, camera, 1.325), camera, map)).toBeNull();
  expect(findPath(map, player, { x: 11.5, y: 21.6 })).not.toHaveLength(0);
  expect(nearbyExitTargets(map, player, dictionary)).toEqual([]);
});

it('limits the cue to the small clear landing apron, with direct ground access', () => {
  const map = worldMaps.town;
  for (const player of [{ x: 11.5, y: 20.5 }, { x: 11.5, y: 23 }, { x: 13.5, y: 22.5 }]) expect(nearbyExitTargets(map, player, dictionary)).toEqual([]);
  const player = { x: 12, y: 22.5 }, target = { x: 11.5, y: 21.6 };
  const blocked = { ...map, colliders: [...map.colliders, { id: 'test.landing-obstacle', rect: { x: 11.5, y: 22, width: .2, height: .1 } }] };
  expect(canStand(blocked, player)).toBe(true); expect(canStand(blocked, target)).toBe(true);
  expect(canWalk(blocked, player, target)).toBe(false);
  expect(findPath(blocked, player, target)).not.toHaveLength(0);
  expect(nearbyExitTargets(blocked, player, dictionary)).toEqual([]);
});

it('omits missing or unknown references and non-door exits without creating closed-shop targets', () => {
  const map = worldMaps.town, player = { x: 12, y: 22.5 };
  expect(nearbyExitTargets(map, player, [])).toEqual([]);
  for (const change of [{ cueWordId: undefined }, { cueWordId: 'unknown.word' }, { kind: 'path' as const }, { kind: 'stairs' as const }]) {
    const altered = { ...map, exits: map.exits.map(exit => exit.id === 'to-residential-hall' ? { ...exit, ...change } : exit) };
    expect(nearbyExitTargets(altered, player, dictionary)).toEqual([]);
  }
  expect(Object.values(worldMaps).flatMap(map => map.exits.filter(exit => exit.cueWordId).map(exit => `${map.id}/${exit.id}`))).toEqual(['town/to-residential-hall']);
  expect(worldMapSchema.safeParse({ ...map, exits: map.exits.map(exit => ({ ...exit, cueWordId: '' })) }).success).toBe(false);
});

it('keeps canonical word/audio identity through labels and all three target sources stable under ties', () => {
  const exit = nearbyExitTargets(worldMaps.town, { x: 12, y: 22.5 }, dictionary)[0];
  const word = dictionary.find(word => word.id === 'apartment.home')!;
  expect(targetWords(exit, dictionary)).toEqual([word]);
  expect(targetWords(exit, dictionary)[0]).toBe(word);
  expect(word.audio).toBe('/audio/apartment/word-home.wav');
  const position = exit.position;
  const life: NearbyTarget = { key: 'town/life/inspect', mapId: 'town', targetId: 'inspect', position, source: 'life', affordance: { id: 'inspect', targetId: 'inspect', position, kind: 'inspect', label: { id: 'look', tokens: [], audio: '/audio/look.wav' } } };
  const anchor: NearbyTarget = { key: 'town/anchor/station', mapId: 'town', targetId: 'station', position, source: 'anchor', anchor: { id: 'station', position, radius: 1, featureId: 'apartment', interactionId: 'station' } };
  for (const rows of [[life, exit], [exit, life]]) expect(selectTarget(rows, position, null)?.key).toBe(exit.key);
  for (const rows of [[life, exit, anchor], [anchor, exit, life], [exit, life, anchor]]) expect(selectTarget(rows, position, null)?.key).toBe(anchor.key);
  expect(cycleTarget([life, exit, anchor], exit.key, 1)?.key).toBe(cycleTarget([anchor, exit, life], exit.key, 1)?.key);
});

it('follows collision-aware movement to the real exit before the existing door transition', () => {
  const map = worldMaps.town, position = { x: 12, y: 22.5 };
  const target = nearbyExitTargets(map, position, dictionary)[0];
  let world = { ...createWorld(worldMaps), mapId: map.id, position };
  let route = findPath(map, position, target.position);
  expect(route).not.toHaveLength(0);
  const first = advanceRoute(map, position, route, .04);
  expect(Math.hypot(first.position.x - position.x, first.position.y - position.y)).toBeGreaterThan(0);
  expect(Math.hypot(first.position.x - position.x, first.position.y - position.y)).toBeLessThanOrEqual(.201);
  for (let step = 0; step < 30 && world.mapId === 'town'; step++) {
    const movement = advanceRoute(map, world.position, route, .04); route = movement.remaining;
    world = reduceWorld(world, { type: 'world-move', position: movement.position }, worldMaps);
  }
  expect(world.mapId).toBe('residential-hall');
  expect(world.position).toEqual(worldMaps['residential-hall'].entrances.find(entry => entry.id === 'from-town')!.position);
});
