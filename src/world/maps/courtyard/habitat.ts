import type { WorldMapDefinition } from '../../schema';
import { sceneFacts, type State } from '../../../features/cats/rules';

export const habitatPoints = {
  bicycle: { x: 13.4, y: 17.7 },
  open: { x: 14.8, y: 20 },
  path: { x: 21, y: 21 },
  door: { x: 23.5, y: 4.8 },
  window: { x: 33.5, y: 7.7 },
  black: { x: 35, y: 19.7 },
  aunt: { x: 25, y: 6.6 },
} as const;

export function catHabitat(state: State, day: number) {
  const facts = sceneFacts(state, day);
  const location = facts.white === 'door' ? 'door' : facts.white === 'window' ? 'window'
    : facts.white === 'open' ? 'open' : facts.white === 'path' ? 'path' : 'bicycle';
  return {
    white: { ...habitatPoints[location], location, relaxed: facts.close || state.cats.white.calm },
    black: { ...habitatPoints.black, relaxed: state.cats.black.greeted },
    aunt: habitatPoints.aunt,
    routine: facts.routine,
    crouched: facts.crouched,
  };
}

export function courtyardForCats(map: WorldMapDefinition, state: State, day: number): WorldMapDefinition {
  const habitat = catHabitat(state, day);
  return {
    ...map,
    anchors: map.anchors.map(anchor => {
      const point = anchor.interactionId === 'cats.white' ? habitat.white
        : anchor.interactionId === 'cats.black' ? habitat.black : null;
      return point ? { ...anchor, position: { x: point.x, y: point.y } } : anchor;
    }),
  };
}
