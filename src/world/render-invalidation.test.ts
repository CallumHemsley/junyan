import { expect, it } from 'vitest';
import { createGame } from '../game';
import { content } from '../content';
import { createWorld } from './state';
import { worldMaps } from './registry';
import { reducedWorldChanged } from './render-invalidation';

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
