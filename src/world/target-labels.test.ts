import { expect, it } from 'vitest';
import { content } from '../neighbourhood/registry';
import { contentWords } from '../content/words';
import { currentPlaceWords, targetWords, placeBadgePaths, worldPlaceName, worldRegionName } from './target-labels';
import {worldMaps} from './registry';
import { nearbyTargets } from './target-selection';
const dictionary = contentWords(content);
it('uses registered current-language words by semantic ID, without inventing named-place vocabulary', () => {
  expect(currentPlaceWords('restaurant', dictionary).map(word => word.id)).toEqual(['shop-name']);
  expect(currentPlaceWords('town', dictionary)).toEqual([]);
  for (const id of ['restaurant', 'town', 'park', 'riverbank', 'courtyard', 'workshop', 'apartment', 'rooftop', 'residential-stairs']) {
    for (const word of currentPlaceWords(id, dictionary)) expect(dictionary.find(entry => entry.id === word.id)).toBe(word);
  }
});
it('retains registered affordance tokens and resolves anchor labels without text matching or segmentation', () => {
  const anchor = {id: 'table', position: {x: 0, y: 0}, radius: 1, featureId: 'restaurant' as const, interactionId: 'table-1'};
  const target = nearbyTargets('restaurant', [anchor], [], anchor.position)[0];
  expect(targetWords(target, dictionary).map(word => word.id)).toEqual(['customer']);
  const word = dictionary.find(word => word.id === 'look')!;
  const option = {id: 'inspect', targetId: 'door', kind: 'inspect' as const, position: anchor.position, label: {id: 'registered', tokens: [word], audio: word.audio}};
  expect(targetWords(nearbyTargets('town', [], [option], anchor.position)[0], dictionary)).toBe(option.label.tokens);
});

it('gives every real exterior and interior a distinct badge and language-owned accessible name', () => {
  const icons = Object.keys(worldMaps).map(id => {
    expect(worldPlaceName(id)).toBeTruthy();
    expect(worldRegionName(id)).toContain(worldPlaceName(id));
    expect(placeBadgePaths(id).length).toBeGreaterThan(0);
    return placeBadgePaths(id).join(' ');
  });
  expect(new Set(icons).size).toBe(Object.keys(worldMaps).length);
  expect(worldPlaceName('town', {id: 'unconfigured-language'})).toBeUndefined();
});
