import { expect, it } from 'vitest';
import { createGame } from '../game';
import { content } from '../content';
import { createWorld, reduceWorld, restoreWorld } from './state';
import { worldMaps } from './registry';
import { reducedWorldChanged } from './render-invalidation';
import type { LifeState } from './life';

it('ignores the first clock after restoring a newly created world', () => {
  const world = createWorld(worldMaps), game = { ...createGame(content, 42), world };
  const restored = restoreWorld(world, worldMaps, 'restaurant', false);
  const clock = reduceWorld(restored, { type: 'world-clock', elapsedMs: 1000 }, worldMaps);
  expect(clock.life!.elapsedMs).toBe(1000);
  expect(reducedWorldChanged(game, world, { ...game, world: clock }, clock)).toBe(false);
});

it('ignores only the world clock while preserving movement, discoveries and gameplay repainting', () => {
  const world = createWorld(worldMaps), game = { ...createGame(content, 42), world };
  const clock = { ...world, life: { ...structuredClone(world.life!), elapsedMs: 1000 } };
  expect(reducedWorldChanged(game, world, { ...game, world: clock }, clock)).toBe(false);
  const moved = { ...clock, position: { ...clock.position, x: clock.position.x + .5 } };
  expect(reducedWorldChanged(game, world, { ...game, world: moved }, moved)).toBe(true);
  const discovered = { ...clock, life: { ...clock.life, discoveries: [{ mapId: 'park', landmarkId: 'park.pond', day: 1 }] } };
  expect(reducedWorldChanged(game, world, { ...game, world: discovered }, discovered)).toBe(true);
  expect(reducedWorldChanged(game, world, { ...game, tray: [content.foods[0].id] }, world)).toBe(true);
});

it('repaints reactions, resident pauses and service departures after restoration', () => {
  const world = createWorld(worldMaps), game = { ...createGame(content, 42), world };
  const restored = restoreWorld(world, worldMaps, 'restaurant', false);
  const life = restored.life!;
  const changes: LifeState[] = [
    { ...life, reactions: [{ mapId: 'park', targetId: 'park.pond', reaction: 'watch', atMs: 1000 }] },
    { ...life, pauses: [{ mapId: 'park', targetId: 'resident-reader', startMs: 1000, durationMs: 9000, previousMs: 0 }] },
    { ...life, serviceDepartures: [{ day: 1, table: 1, orderId: 'order-1' }] },
  ];
  for (const life of changes) {
    const changed = { ...restored, life };
    expect(reducedWorldChanged(game, world, { ...game, world: changed }, changed)).toBe(true);
  }
});
