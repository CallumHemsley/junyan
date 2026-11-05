import { describe, expect, it } from 'vitest';
import { choices, gifts, initialState, recoveryForTransition, recoveredWords, reduce, routineForDay, sceneFacts, validate, type Action, type State } from './rules';

const run = (actions: Action[], day = 1, start = initialState()) => actions.reduce((state, action) => reduce(state, action, day), start);
const reunion = () => run([
  { type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' },
  { type: 'approach' }, { type: 'follow' }, { type: 'reunite' },
]);
function finishRepeat(state: State, day: number): State {
  const start = reduce(state, { type: 'begin' }, day);
  const actions: Record<ReturnType<typeof routineForDay>, Action[]> = {
    sunny: [{ type: 'select', target: 'black' }, { type: 'greet' }, { type: 'sit' }],
    rainy: [{ type: 'select', target: 'bicycle' }, { type: 'select', target: 'white' }, { type: 'wait' }],
    route: [{ type: 'select', target: 'white' }, { type: 'follow' }, { type: 'approach' }],
  };
  return run(actions[routineForDay(day)], day, start);
}
describe('courtyard relationships and reunion', () => {
  it('meets either cat first and black-cat friendship never solves the mystery', () => {
    const state = run([{ type: 'select', target: 'black' }, { type: 'greet' }, { type: 'sit' }]);
    expect(state.cats.black).toEqual({ greeted: true, satTogether: true });
    expect(state.story.node).toBe('search');
    expect(gifts(state)).toEqual([]);
    expect(reduce(state, { type: 'select', target: 'white' }, 1).cats.black).toEqual(state.cats.black);
  });
  it('shows a gentle impatient response without removing earned calm or progress', () => {
    let state = run([{ type: 'select', target: 'white' }, { type: 'space' }, { type: 'crouch' }]);
    state = reduce(state, { type: 'approach' }, 1);
    expect(state.story.node).toBe('crouched');
    expect(state.feedback).toBe('gentle');
    expect(state.cats.white.calm).toBe(true);
    expect(reduce(state, { type: 'wait' }, 1).story.node).toBe('emerged');
  });
  it('requires the visible patient route and grants exactly one stable gift ID', () => {
    const initial = initialState();
    for (const type of ['reunite', 'follow', 'wait', 'approach'] as const) expect(reduce(initial, { type }, 1)).toEqual(initial);
    const state = reunion();
    expect(state.story).toEqual({ node: 'reunited', day: 1 });
    expect(gifts(state)).toEqual(['cats.cushion']);
    expect(gifts(reduce(state, { type: 'reunite' }, 1))).toEqual(['cats.cushion']);
    expect(validate(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });
  it('permits cat and landmark detours without resetting the story', () => {
    const emerged = run([{ type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' }]);
    const back = run([{ type: 'select', target: 'black' }, { type: 'greet' }, { type: 'select', target: 'aunt' }, { type: 'select', target: 'white' }], 3, emerged);
    expect(back.story.node).toBe('emerged');
    expect(run([{ type: 'approach' }, { type: 'follow' }, { type: 'reunite' }], 3, back).story).toEqual({ node: 'reunited', day: 3 });
  });
  it('keeps introductory positions stable across restaurant days', () => {
    expect(sceneFacts(initialState(), 1).white).toBe('bicycle');
    expect(sceneFacts(initialState(), 200).white).toBe('bicycle');
  });
  it('continues meaningful companionship with both cats after reunion', () => {
    const state = run([{ type: 'select', target: 'white' }, { type: 'wait' }], 1, reunion());
    expect(state.cats.white.rested).toBe(true);
    expect(state.feedback).toBe('white-sitting');
    expect(gifts(state)).toEqual(['cats.cushion']);
  });
});
describe('anchored repeat routines', () => {
  it('uses authored deterministic weather and completes all three visits', () => {
    let state = reunion();
    for (const day of [2, 3, 4]) {
      state = finishRepeat(state, day);
      expect(state.repeat).toEqual({ status: 'complete', day, kind: routineForDay(day) });
      expect(validate(state)).toEqual(state);
    }
    expect(state.completedKinds).toEqual(['rainy', 'route', 'sunny']);
    expect(gifts(state)).toEqual(['cats.cushion']);
  });
  it('starts no repeat on the reunion day, earlier day, or already completed day', () => {
    const sameDay = reduce(reunion(), { type: 'begin' }, 1);
    expect(sameDay.repeat.status).toBe('idle');
    const complete = finishRepeat(reunion(), 2);
    for (const day of [1, 2]) expect(reduce(complete, { type: 'begin' }, day).repeat).toEqual(complete.repeat);
  });
  it('anchors weather and steps through reload and a day change', () => {
    const start = reduce(reunion(), { type: 'begin' }, 2);
    const observed = reduce(start, { type: 'select', target: 'bicycle' }, 2);
    const restored = validate(JSON.parse(JSON.stringify(observed)))!;
    expect(sceneFacts(restored, 4).routine).toBe('rainy');
    expect(reduce(restored, { type: 'begin' }, 4)).toEqual(restored);
    const complete = run([{ type: 'select', target: 'door' }, { type: 'wait' }], 4, restored);
    expect(complete.lastCompletedDay).toBe(2);
    expect(sceneFacts(complete, 4).routine).toBe('sunny');
    expect(reduce(complete, { type: 'begin' }, 4).repeat.status).toBe('active');
  });
  it('accepts direct shelter discovery and makes the empty bicycle an optional clue', () => {
    const start = reduce(reunion(), { type: 'begin' }, 2);
    const direct = run([{ type: 'select', target: 'white' }, { type: 'wait' }], 2, start);
    expect(direct.completedKinds).toEqual(['rainy']);
    expect(recoveredWords(direct)).not.toContain('cats.empty');
    const done = finishRepeat(reunion(), 2);
    expect(done.completedKinds).toEqual(['rainy']);
    expect(recoveredWords(done)).toContain('cats.empty');
  });
  it('cannot farm repeat evidence, relationships, recovery or gifts', () => {
    const done = finishRepeat(reunion(), 4);
    const repeated = run([{ type: 'begin' }, { type: 'greet' }, { type: 'sit' }, { type: 'reunite' }], 4, done);
    expect(repeated.completedKinds).toEqual(['sunny']);
    expect(repeated.lastCompletedDay).toBe(4);
    expect(recoveryForTransition(done, repeated)).toEqual([]);
    expect(gifts(repeated)).toEqual(['cats.cushion']);
  });
});
describe('durable demonstrated recovery', () => {
  it('recovers step back only after giving space rather than waiting', () => {
    const waited = run([{ type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' }]);
    expect(recoveredWords(waited)).toContain('cats.wait');
    expect(recoveredWords(waited)).not.toContain('cats.back');
    expect(recoveredWords(reduce(waited, { type: 'space' }, 1))).toContain('cats.back');
  });
  it('uses canonical vocabulary IDs and reports only new consequences', () => {
    const before = run([{ type: 'select', target: 'white' }, { type: 'crouch' }, { type: 'wait' }, { type: 'approach' }, { type: 'follow' }]);
    const after = reduce(before, { type: 'reunite' }, 1);
    expect(recoveryForTransition(before, after)).toContain('thank-you');
    expect(recoveryForTransition(after, reduce(after, { type: 'reunite' }, 1))).toEqual([]);
    expect(recoveryForTransition(initialState(), reduce(initialState(), { type: 'wait' }, 1))).toEqual([]);
  });
});
describe('save boundary', () => {
  it.each([null, {}, { ...initialState(), extra: true }, { ...initialState(), version: 2 }, { ...initialState(), feedback: 'unknown' }])('rejects malformed saves %j', value => expect(validate(value)).toBeNull());
  it('rejects impossible relationship, story and reward evidence', () => {
    expect(validate({ ...initialState(), story: { node: 'reunited', day: 1 } })).toBeNull();
    expect(validate({ ...initialState(), cats: { ...initialState().cats, black: { greeted: false, satTogether: true } } })).toBeNull();
    expect(validate({ ...reunion(), repeat: { status: 'complete', day: 2, kind: 'sunny' }, completedKinds: ['sunny'], lastCompletedDay: 2 })).toBeNull();
    expect(validate({ ...reunion(), repeat: { status: 'active', encounter: { kind: 'rainy', step: 'find', day: 1 } } })).toBeNull();
    expect(validate({ ...reunion(), completedKinds: ['rainy', 'rainy'], lastCompletedDay: 2 })).toBeNull();
  });
  it('ignores invalid injected days', () => {
    for (const day of [0, -1, 1.5, NaN, Infinity]) expect(reduce(reunion(), { type: 'begin' }, day)).toEqual(reunion());
  });
  it('keeps reachable saves valid under free exploration and repeated actions', () => {
    const actions: Action[] = [{ type: 'select', target: 'white' }, { type: 'select', target: 'black' }, { type: 'select', target: 'bicycle' }, ...(['crouch', 'wait', 'space', 'approach', 'follow', 'reunite', 'greet', 'sit', 'begin'] as const).map(type => ({ type }))];
    let state = initialState();
    for (let n = 0; n < 500; n++) {
      state = reduce(state, actions[(n * 73 + Math.floor(n / 7)) % actions.length], 1 + Math.floor(n / 40));
      expect(validate(state)).toEqual(state);
      for (const choice of choices(state)) expect(validate(reduce(state, choice.action, 1 + Math.floor(n / 40)))).not.toBeNull();
    }
  });
});
