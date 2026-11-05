import { sceneFacts, type State } from '../../../features/cats/rules';

export const habitatPoints = {
  bicycle: { x: 13.4, y: 17.7 },
  open: { x: 14.8, y: 20 },
  path: { x: 21, y: 21 },
  door: { x: 23.5, y: 4.8 },
  window: { x: 33.5, y: 7.2 },
  black: { x: 35, y: 19.7 },
  aunt: { x: 25, y: 6.6 },
} as const;

export function catHabitat(state: State, day: number) {
  const facts = sceneFacts(state, day);
  return {
    white: { ...habitatPoints[facts.white], location: facts.white, relaxed: facts.close || state.cats.white.calm },
    black: { ...habitatPoints.black, relaxed: state.cats.black.greeted },
    aunt: habitatPoints.aunt,
    routine: facts.routine,
    crouched: facts.crouched,
  };
}
