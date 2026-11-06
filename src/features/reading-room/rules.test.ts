import { describe, expect, it } from 'vitest';
import { cells, initialState, legal, recoveryForTransition, reduce, unmetGoal, validate, type Action, type State } from './rules';

function act(s: State, ...actions: Action[]) { return actions.reduce(reduce, s); }
function place(s: State, id: 'table' | 'chair', x: number, y: number, turn = false) {
  return act(s, { type: 'select', id }, ...(turn ? [{ type: 'rotate' } as const] : []), { type: 'preview', x, y }, { type: 'place' });
}
export function solveWindow() { return place(place(initialState(), 'table', 2, 0), 'chair', 1, 0); }
export function solveAlcove() {
  const window = reduce(solveWindow(), { type: 'check' });
  return place(place(reduce(window, { type: 'begin-brief', brief: 'alcove' }), 'table', 2, 0, true), 'chair', 1, 1);
}
describe('communal arrangement briefs', () => {
  it('unlocks two coherent arrangements and preserves the visibly furnished first bay', () => {
    expect(reduce(initialState(), { type: 'begin-brief', brief: 'alcove' })).toEqual(initialState());
    const first = reduce(solveWindow(), { type: 'check' });
    expect(first.completed).toEqual(['window']);
    const second = reduce(solveAlcove(), { type: 'check' });
    expect(second.completed).toEqual(['window', 'alcove']);
    expect(second.layouts.window).toEqual(first.layouts.window);
    expect(validate(second)).toEqual(second);
    expect(reduce(second, { type: 'check' })).toBe(second);
  });
  it('accepts multiple genuine broad-window solutions but requires rotation in the narrow alcove', () => {
    expect(unmetGoal('window', solveWindow().layouts.window)).toBeNull();
    expect(unmetGoal('window', place(place(initialState(), 'table', 3, 0), 'chair', 2, 0).layouts.window)).toBeNull();
    for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
      const p = { id: 'table' as const, x, y, rotation: 0 as const };
      if (legal('alcove', [], p)) expect(unmetGoal('alcove', [p])).not.toBeNull();
    }
    expect(unmetGoal('alcove', solveAlcove().layouts.alcove)).toBeNull();
  });
  it('keeps wrong legal arrangements and invites the unmet voiced instruction', () => {
    const s = place(place(initialState(), 'table', 2, 2), 'chair', 1, 2);
    const checked = reduce(s, { type: 'check' });
    expect(checked.layouts).toBe(s.layouts);
    expect(checked.notice).toBe('window');
    expect(checked.retries.window).toBe(1);
    expect(checked.completed).toEqual([]);
    const rightChair = place(solveWindow(), 'chair', 4, 0);
    expect(reduce(rightChair, { type: 'check' }).notice).toBe('left');
  });
  it('rejects overlap and all protected circulation cells without changing project progress', () => {
    const placed = place(initialState(), 'table', 2, 0);
    const blocked = act(placed, { type: 'select', id: 'chair' }, { type: 'preview', x: 2, y: 0 }, { type: 'place' });
    expect(blocked.layouts).toBe(placed.layouts);
    expect(blocked.notice).toBe('blocked');
    for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
      if (x !== 5 && y !== 4) continue;
      expect(legal('window', [], { id: 'chair', x, y, rotation: 0 })).toBe(false);
    }
    const selected = reduce(placed, { type: 'select', id: 'chair' });
    for (const x of [NaN, Infinity, -1, 2.5, 6]) expect(reduce(selected, { type: 'preview', x, y: 0 })).toBe(selected);
    expect(cells({ id: 'table', x: 2, y: 0, rotation: 1 })).toEqual([{ x: 2, y: 0 }, { x: 2, y: 1 }]);
  });
  it('round-trips unfinished drafts and retries while rejecting corrupt state locally', () => {
    const s = act(initialState(), { type: 'check' }, { type: 'select', id: 'table' }, { type: 'rotate' }, { type: 'preview', x: 3, y: 1 });
    expect(validate(JSON.parse(JSON.stringify(s)))).toEqual(s);
    for (const broken of [
      { ...s, completed: ['alcove'] }, { ...s, selected: null }, { ...s, status: 'complete' },
      { ...s, layouts: { ...s.layouts, window: [{ id: 'chair', x: 5, y: 0, rotation: 0 }] } },
      { ...s, layouts: { ...s.layouts, window: [{ id: 'bed', x: 0, y: 0, rotation: 0 }] } },
    ]) expect(validate(broken)).toBeNull();
  });
  it('replays only the chosen project and never repeats recovery evidence', () => {
    const done = reduce(solveAlcove(), { type: 'check' });
    const replay = act(done, { type: 'begin-brief', brief: 'window' }, { type: 'restart' });
    expect(replay.completed).toEqual(done.completed);
    expect(replay.layouts.alcove).toEqual(done.layouts.alcove);
    expect(replay.layouts.window).toEqual([]);
    expect(recoveryForTransition(solveWindow(), { type: 'check' }, reduce(solveWindow(), { type: 'check' }))).toContain('apartment.beside');
    expect(recoveryForTransition(solveAlcove(), { type: 'check' }, done)).toContain('apartment.turn');
    expect(recoveryForTransition(done, { type: 'check' }, done)).toEqual([]);
    expect(recoveryForTransition(initialState(), { type: 'check' }, reduce(initialState(), { type: 'check' }))).toEqual([]);
  });
});
