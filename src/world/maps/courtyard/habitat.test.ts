import { describe, expect, it } from 'vitest';
import { initialState, reduce, validate, gifts, type Action, type State } from '../../../features/cats/rules';
import { catHabitat, habitatPoints } from './habitat';

const act = (state: State, actions: Action[], day = 1) => actions.reduce((s, action) => reduce(s, action, day), state);
const reunite = () => act(initialState(), [
  { type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' },
  { type: 'approach' }, { type: 'follow' }, { type: 'reunite' },
]);

describe('world cat habitat preserves feature facts', () => {
  it('keeps the introductory cat beneath the bicycle across days and reload', () => {
    const state = act(initialState(), [{ type: 'select', target: 'white' }, { type: 'crouch' }]);
    const restored = validate(JSON.parse(JSON.stringify(state)))!;
    expect(catHabitat(restored, 200).white).toMatchObject({ ...habitatPoints.bicycle, location: 'bicycle' });
    expect(catHabitat(restored, 200).white).toEqual(catHabitat(state, 1).white);
    expect(gifts(restored)).toEqual([]);
  });

  it('places emerging, following and reunited cats in the matching physical habitats', () => {
    let state = act(initialState(), [{ type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' }]);
    expect(catHabitat(state, 1).white).toMatchObject(habitatPoints.open);
    state = reduce(state, { type: 'approach' }, 1);
    expect(catHabitat(state, 1).white).toMatchObject(habitatPoints.path);
    state = reduce(state, { type: 'follow' }, 1);
    expect(catHabitat(state, 1).white).toMatchObject(habitatPoints.door);
    state = reduce(state, { type: 'reunite' }, 1);
    expect(catHabitat(state, 1).white).toMatchObject(habitatPoints.door);
    expect(gifts(state)).toEqual(['cats.cushion']);
  });

  it('anchors a rain encounter to the dry doorway even when the restaurant day advances', () => {
    const state = reduce(reunite(), { type: 'begin' }, 2);
    const later = validate(JSON.parse(JSON.stringify(state)))!;
    expect(catHabitat(later, 12).routine).toBe('rainy');
    expect(catHabitat(later, 12).white).toMatchObject(habitatPoints.door);
    expect(later).toEqual(state);
  });

  it('moves a followed route to the window and leaves black beside its bench', () => {
    const before = act(reunite(), [{ type: 'begin' }, { type: 'select', target: 'white' }], 3);
    const after = reduce(before, { type: 'follow' }, 3);
    expect(catHabitat(before, 3).white.location).not.toBe('window');
    expect(catHabitat(after, 3).white).toMatchObject({ ...habitatPoints.window, location: 'window' });
    expect(catHabitat(after, 3).black).toMatchObject(habitatPoints.black);
  });
});

it('projects target anchors from the same authoritative cat habitat without mutating the authored map', async () => {
  const { courtyardForCats } = await import('./habitat');
  const { courtyardMap } = await import('./index');
  const { worldMapSchema } = await import('../../schema');
  const map = worldMapSchema.parse(courtyardMap);
  const original = structuredClone(map);
  const state = reduce(reunite(), { type: 'begin' }, 2);
  const projected = courtyardForCats(map, state, 100);
  expect(projected.anchors.find(a => a.interactionId === 'cats.white')?.position).toEqual(habitatPoints.door);
  expect(projected.anchors.find(a => a.interactionId === 'cats.black')?.position).toEqual(habitatPoints.black);
  expect(map).toEqual(original);
  expect(projected.props).toBe(map.props);
});
