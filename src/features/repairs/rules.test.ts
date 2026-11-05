import { describe, expect, it } from 'vitest';
import { canReturn, currentBench, gifts, initialState, recovered, reduce, validate, type Action, type State } from './rules';
import { content, contentSchema, lines, words } from './content';

const act = (state: State, ...actions: Action[]) => actions.reduce((current, action) => reduce(current, action, 1), state);
const fixedLamp = () => act(initialState(), { type: 'select', job: 'lamp', part: 'bulb' }, { type: 'turn', job: 'lamp', direction: 'tighten' }, { type: 'test', job: 'lamp' });
const toy = () => act(fixedLamp(), { type: 'return', job: 'lamp' }, { type: 'switch', job: 'toy' });
function changeToy(state: State, part: 'lead' | 'cell'): State {
  return act(state, { type: 'select', job: 'toy', part }, part === 'lead' ? { type: 'lead', job: 'toy', position: 'connected' } : { type: 'cell', job: 'toy', condition: 'fresh' });
}
function testToy(state: State): State {
  return act(state, { type: 'select', job: 'toy', part: 'cover' }, { type: 'cover', job: 'toy', position: 'closed' }, { type: 'test', job: 'toy' });
}
describe('repair workshop physical rules', () => {
  it('makes a loose lamp light unevenly, requires power off, and seats the bulb before steady light', () => {
    const loose = act(initialState(), { type: 'test', job: 'lamp' }, { type: 'select', job: 'lamp', part: 'bulb' });
    expect(currentBench(loose)).toMatchObject({ fitting: 'loose', power: 'on', test: 'unstable' });
    const blocked = act(loose, { type: 'turn', job: 'lamp', direction: 'tighten' });
    expect(blocked.feedback).toBe('power-first');
    expect(act(blocked, { type: 'test', job: 'lamp' }).feedback).toBe('lamp-unstable');
    expect(currentBench(blocked)).toEqual(currentBench(loose));
    expect(recovered(loose, { type: 'turn', job: 'lamp', direction: 'tighten' }, blocked)).toEqual([]);
    const fixed = act(blocked, { type: 'power-off', job: 'lamp' }, { type: 'turn', job: 'lamp', direction: 'tighten' });
    expect(canReturn(currentBench(fixed))).toBe(false);
    expect(canReturn(currentBench(act(fixed, { type: 'test', job: 'lamp' })))).toBe(true);
  });
  it('invalidates the successful lamp test when switching off or loosening', () => {
    const off = act(fixedLamp(), { type: 'power-off', job: 'lamp' });
    expect(act(off, { type: 'return', job: 'lamp' })).toBe(off);
    const loose = act(off, { type: 'turn', job: 'lamp', direction: 'loosen' }, { type: 'test', job: 'lamp' });
    expect(currentBench(loose)).toMatchObject({ fitting: 'loose', test: 'unstable' });
  });
  for (const first of ['lead', 'cell'] as const) it(`requires both toy repairs with ${first} first`, () => {
    const open = act(toy(), { type: 'select', job: 'toy', part: 'cover' }, { type: 'cover', job: 'toy', position: 'open' });
    const partial = testToy(changeToy(open, first));
    expect(currentBench(partial)).toMatchObject({ test: 'still' });
    expect(canReturn(currentBench(partial))).toBe(false);
    const reopened = act(partial, { type: 'cover', job: 'toy', position: 'open' });
    const fixed = testToy(changeToy(reopened, first === 'lead' ? 'cell' : 'lead'));
    expect(currentBench(fixed)).toMatchObject({ test: 'moving' });
    expect(validate(fixed)).toEqual(fixed);
    const opened = act(fixed, { type: 'cover', job: 'toy', position: 'open' });
    expect(canReturn(currentBench(opened))).toBe(false);
    const undone = act(opened, { type: 'select', job: 'toy', part: 'lead' }, { type: 'lead', job: 'toy', position: 'loose' });
    expect(currentBench(testToy(undone))).toMatchObject({ test: 'still' });
  });
  it('returns once and keeps the single gift through practice and reset', () => {
    const open = act(toy(), { type: 'select', job: 'toy', part: 'cover' }, { type: 'cover', job: 'toy', position: 'open' });
    const fixed = testToy(changeToy(changeToy(open, 'lead'), 'cell'));
    const returned = act(fixed, { type: 'return', job: 'toy' });
    expect(gifts(returned)).toEqual(['repairs.stool']);
    expect(act(returned, { type: 'return', job: 'toy' })).toBe(returned);
    expect(gifts(act(returned, { type: 'switch', job: 'toy' }, { type: 'reset', job: 'toy' }))).toEqual(['repairs.stool']);
    expect(validate(JSON.parse(JSON.stringify(returned)))).toEqual(returned);
  });
  it('ignores stale jobs and hidden part operations without corrupting state', () => {
    expect(act(initialState(), { type: 'test', job: 'toy' })).toEqual(initialState());
    const state = toy();
    expect(act(state, { type: 'select', job: 'toy', part: 'lead' }, { type: 'lead', job: 'toy', position: 'connected' })).toBe(state);
    expect(act(state, { type: 'return', job: 'toy' })).toBe(state);
  });
  it('recovers only matching physical changes and never lookup, selection or repeated action', () => {
    const before = act(initialState(), { type: 'select', job: 'lamp', part: 'bulb' });
    const action: Action = { type: 'turn', job: 'lamp', direction: 'tighten' };
    const after = reduce(before, action, 99);
    expect(recovered(before, action, after)).toEqual(['repairs.bulb', 'repairs.tighten']);
    expect(recovered(after, action, reduce(after, action, 99))).toEqual([]);
    expect(recovered(initialState(), { type: 'select', job: 'lamp', part: 'bulb' }, before)).toEqual([]);
    expect(after).toEqual(reduce(before, action, 1));
  });
  it('switches freely between unfinished repairs and restores both after reload', () => {
    const lamp = act(initialState(), { type: 'select', job: 'lamp', part: 'bulb' }, { type: 'turn', job: 'lamp', direction: 'tighten' });
    const toy = act(lamp, { type: 'switch', job: 'toy' }, { type: 'select', job: 'toy', part: 'cover' }, { type: 'cover', job: 'toy', position: 'open' }, { type: 'select', job: 'toy', part: 'lead' }, { type: 'lead', job: 'toy', position: 'connected' });
    const reload = validate(JSON.parse(JSON.stringify(toy)))!;
    expect(reload.jobs.lamp).toMatchObject({ fitting: 'seated', test: 'none' });
    expect(reload.jobs.toy).toMatchObject({ lead: 'connected', cell: 'old', cover: 'open' });
    const back = act(reload, { type: 'switch', job: 'lamp' });
    expect(back.selected).toBeNull();
    expect(back.jobs).toEqual(reload.jobs);
    expect(gifts(back)).toEqual([]);
    expect(act(initialState(), { type: 'switch', job: 'toy' }).active).toBe('toy');
  });
  it('rejects malformed and semantically impossible saves', () => {
    const base = initialState();
    for (const value of [null, {}, { ...base, feedback: 'all-complete' }, { ...base, feedback: 'toy-moving' }, { ...base, extra: true }, { ...base, completed: ['lamp', 'lamp'] }, { ...base, selected: 'lead' }, { ...base, jobs: { ...base.jobs, lamp: { ...base.jobs.lamp, test: 'steady' } } }, { ...toy(), jobs: { ...toy().jobs, toy: { kind: 'toy', cover: 'open', lead: 'connected', cell: 'fresh', test: 'moving' } } }]) expect(validate(value)).toBeNull();
    expect(validate(base)).toEqual(base);
  });
  it('validates every reachable state throughout reversible action sequences', () => {
    let states = [initialState()];
    const actions: Action[] = [{ type: 'test', job: 'lamp' }, { type: 'select', job: 'lamp', part: 'bulb' }, { type: 'turn', job: 'lamp', direction: 'tighten' }, { type: 'turn', job: 'lamp', direction: 'loosen' }, { type: 'power-off', job: 'lamp' }, { type: 'return', job: 'lamp' }, { type: 'switch', job: 'toy' }, { type: 'reset', job: 'toy' }, { type: 'select', job: 'toy', part: 'cover' }, { type: 'select', job: 'toy', part: 'lead' }, { type: 'select', job: 'toy', part: 'cell' }, { type: 'cover', job: 'toy', position: 'open' }, { type: 'cover', job: 'toy', position: 'closed' }, { type: 'lead', job: 'toy', position: 'connected' }, { type: 'cell', job: 'toy', condition: 'fresh' }, { type: 'test', job: 'toy' }, { type: 'return', job: 'toy' }];
    for (let depth = 0; depth < 10; depth++) {
      const next = new Map<string, State>();
      for (const state of states) for (const action of actions) {
        const after = reduce(state, action, 1);
        expect(validate(after)).toEqual(after);
        next.set(JSON.stringify(after), after);
      }
      states = [...next.values()];
    }
  });
});
describe('repair content', () => {
  it('contains exact segmented lines and known dictionary words', () => {
    expect(contentSchema.safeParse(content).success).toBe(true);
    expect(lines).toHaveLength(21);
    expect(new Set(words.map(word => word.id)).size).toBe(words.length);
    const invalid = structuredClone(content);
    invalid.characters[0].lines[0].text = '灯泡';
    expect(contentSchema.safeParse(invalid).success).toBe(false);
  });
});
