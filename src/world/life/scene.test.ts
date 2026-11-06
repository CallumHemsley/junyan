import { expect, it } from 'vitest';
import { createGame } from '../../game';
import { content } from '../../content';
import { worldMaps } from '../registry';
import { createWorld } from '../state';
import { initialLifeState, worldLifeFrame } from './index';
import { catHabitat } from '../maps/courtyard';
import { actorsFor, lifeContext } from '../life-bridge';

it('uses one world-life frame for global service presence and authoritative courtyard clues', () => {
  const game = createGame(content, 42);
  const initial = createWorld(worldMaps), life = initialLifeState();
  const world = { ...initial, mapId: 'courtyard', position: { x: 15, y: 20 }, life };
  const frame = worldLifeFrame(worldMaps.courtyard, game, world, false);
  expect(frame.context.excludedCharacterIds).toHaveLength(4);
  expect(frame.actors.some(actor => content.characters.some(character => character.id === actor.characterId))).toBe(false);
  const habitat = catHabitat(game.neighbourhood!.cats, game.day);
  expect(frame.actors.find(actor => actor.characterId === 'white-cat')!.position).toEqual({ x: habitat.white.x, y: habitat.white.y });
  expect(frame.context.elapsedMs).toBe(life.elapsedMs);
  const town = worldLifeFrame(worldMaps.town, game, { ...world, mapId: 'town' }, true);
  expect(town.context.excludedCharacterIds).toEqual(frame.context.excludedCharacterIds);
  expect(town.actors.some(actor => content.characters.some(character => character.id === actor.characterId))).toBe(false);
});

it('earns rooftop birds only from the restored mature tree, not another mature plant', () => {
  const game = createGame(content, 42);
  const world = createWorld(worldMaps, 'rooftop');
  const garden = game.neighbourhood!.garden;
  garden.restored = true;
  garden.plants.flower.growth = 3;
  garden.plants.climber.growth = 3;
  const birds = () => [
    actorsFor(worldMaps.rooftop, game, world, 10000, false),
    worldLifeFrame(worldMaps.rooftop, game, world, false).actors,
  ].map(actors => actors.filter(actor => actor.kind === 'bird'));
  expect(lifeContext(game, world, 10000, false).gardenMature).toBe(false);
  expect(birds()).toEqual([[], []]);
  garden.plants.tree.growth = 3;
  expect(birds().every(actors => actors.length > 0)).toBe(true);
  garden.restored = false;
  expect(birds()).toEqual([[], []]);
});
