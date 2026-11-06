import { expect, it } from 'vitest';
import { createGame } from '../../game';
import { content } from '../../content';
import { worldMaps } from '../registry';
import { createWorld } from '../state';
import { initialLifeState, worldLifeFrame } from './index';
import { catHabitat } from '../maps/courtyard';

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
