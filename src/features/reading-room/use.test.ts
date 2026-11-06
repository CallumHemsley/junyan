import { expect, it } from 'vitest';
import { initialState, legal, unmetGoal, validate, type Placement, type State } from './rules';
import { advanceReadingUse, pathDuration, queueReadingEdit, readingHome, readingUsePose, samplePath } from './use';
import { mapsForNeighbourhood } from '../../world/dynamic';
import { createNeighbourhood } from '../../neighbourhood/model';
import { navigationFor } from '../../world/life/navigation';
import { sampleActor } from '../../world/characters';
import { readingRoomHost } from './neighbours';

function completed(brief: 'window' | 'alcove' = 'window', rotation: 0 | 1 = 0): State {
  const state = initialState();
  const window: Placement[] = [{ id: 'table', x: 2, y: 0, rotation: 0 }, { id: 'chair', x: 1, y: 0, rotation }];
  const alcove: Placement[] = [{ id: 'table', x: 2, y: 0, rotation: 1 }, { id: 'chair', x: 1, y: 1, rotation }];
  return { ...state, status: 'complete', brief, completed: brief === 'window' ? ['window'] : ['window', 'alcove'], layouts: { window, alcove: brief === 'alcove' ? alcove : [] }, completedLayouts: { window, alcove: brief === 'alcove' ? alcove : null } };
}
const mapFor = (state: State) => mapsForNeighbourhood({ ...createNeighbourhood(1), 'reading-room': state })['reading-room'];

it('supports every valid earned arrangement using reachable floor, irrespective of chair rotation', () => {
  let count = 0;
  for (const brief of ['window', 'alcove'] as const) for (const tableRotation of [0, 1] as const) for (const chairRotation of [0, 1] as const) for (let tx = 0; tx < 5; tx++) for (let cx = 0; cx < 5; cx++) for (let cy = 0; cy < 4; cy++) {
    const layout: Placement[] = [{ id: 'table', x: tx, y: 0, rotation: tableRotation }, { id: 'chair', x: cx, y: cy, rotation: chairRotation }];
    if (unmetGoal(brief, layout) || layout.some(p => !legal(brief, layout, p))) continue;
    const base = completed(brief, chairRotation), state = { ...base, layouts: { ...base.layouts, [brief]: layout }, completedLayouts: { ...base.completedLayouts, [brief]: layout } };
    const map = mapFor(state), started = advanceReadingUse(state, map, 1000, true, true), path = started.use?.path;
    expect(path, JSON.stringify(layout)).toBeDefined();
    expect(path![0]).toEqual(readingHome);
    const nav = navigationFor(map);
    for (let ms = 0; ms <= pathDuration(path!); ms += 100) expect(nav.canStand(samplePath(path!, ms).position, .22)).toBe(true);
    expect(validate(JSON.parse(JSON.stringify(started)))).toEqual(started);
    count++;
  }
  expect(count).toBe(28);
});

it('starts only after service release and keeps a safe host when the actual approach is blocked', () => {
  const state = completed(), map = mapFor(state);
  expect(advanceReadingUse(state, map, 1000, false, true)).toBe(state);
  expect(advanceReadingUse(state, map, 1000, true, false)).toBe(state);
  const blocked = { ...map, colliders: [...map.colliders, { id: 'blocked-host', rect: { x: 3, y: 3, width: 9, height: 9 } }] };
  expect(advanceReadingUse(state, blocked, 1000, true, true)).toBe(state);
  const started = advanceReadingUse(state, map, 1000, true, true);
  expect(readingUsePose(started, map, 1000)?.position).toEqual(readingHome);
  expect(readingUsePose(started, map, 1001)?.action).toBe('walk');
  expect(readingUsePose(started, map, 1000 + pathDuration(started.use!.path))?.activity).toBe('work');
});

it('queues replay at a fresh clock without a jump, freezes furniture until home, and restores the exact return', () => {
  for (const action of [{ type: 'restart' }, { type: 'begin-brief', brief: 'alcove' }] as const) {
    const state = completed(), map = mapFor(state), started = advanceReadingUse(state, map, 1000, true, true);
    const queued = queueReadingEdit(started, action, 2000)!;
    expect(queued.layouts).toBe(state.layouts);
    expect(queued.status).toBe('complete');
    expect(queued.use?.returnAt).toBeNull();
    const at = 2900, prior = readingUsePose(queued, map, at)!;
    const returning = advanceReadingUse(queued, map, at, true, true);
    expect(readingUsePose(returning, map, at)?.position).toEqual(prior.position);
    const restored = validate(JSON.parse(JSON.stringify(returning)))!;
    expect(readingUsePose(restored, map, at + 100)).toEqual(readingUsePose(returning, map, at + 100));
    expect(advanceReadingUse(returning, map, at + pathDuration(returning.use!.returnPath!) - 1, true, true).layouts).toBe(state.layouts);
    const done = advanceReadingUse(returning, map, at + pathDuration(returning.use!.returnPath!), true, false);
    expect(done.use).toBeNull();
    expect(done.status).toBe('editing');
    expect(done.completedLayouts).toBe(state.completedLayouts);
    expect(done.brief).toBe(action.type === 'restart' ? 'window' : 'alcove');
  }
});

it('resumes a saved settled reader on reentry, keeps ground feet/native held book and freezes incidental motion', () => {
  const state = completed('alcove', 1), map = mapFor(state), started = advanceReadingUse(state, map, 1000, true, true);
  const at = 1000 + pathDuration(started.use!.path) + 5000;
  const restored = validate(JSON.parse(JSON.stringify(started)))!;
  expect(advanceReadingUse(restored, map, at, true, false)).toBe(restored);
  const normal = readingRoomHost(restored, { elapsedMs: at, reducedMotion: false }, map)[0];
  const reduced = readingRoomHost(restored, { elapsedMs: at, reducedMotion: true }, map)[0];
  expect(normal.position).toEqual(reduced.position);
  expect(reduced.phaseMs).toBe(0);
  const sample = sampleActor({ characterId: reduced.characterId, facing: reduced.facing, yaw: reduced.yaw, action: reduced.action, posture: 'work', heldObject: reduced.heldObject, elapsedMs: 0, reducedMotion: true });
  expect(sample.frame.seatContact).toBeUndefined();
  expect(sample.frame.feet.every(foot => foot.planted && Math.abs(foot.y - sample.frame.anchor.y) <= 1)).toBe(true);
  expect(sample.frameId).toContain('/book');
  expect(readingRoomHost(restored, { elapsedMs: at, reducedMotion: false, excludedCharacterIds: ['lin-jie'] }, map)).toEqual([]);
});

it('defaults legacy or corrupt lifecycle data without losing validated earned furniture', () => {
  const state = completed(), { use: ignored, ...legacy } = state;
  expect(validate(legacy)).toEqual(state);
  expect(validate({ ...state, use: { path: 'broken' } })).toEqual(state);
});

it('discards an invalid saved route without losing the earned layout or posing at an unrelated location', () => {
  const state = completed(), map = mapFor(state), started = advanceReadingUse(state, map, 1000, true, true);
  const corrupt = { ...started, use: { ...started.use!, path: [{ x: 13, y: 17 }, { x: 14, y: 17 }] } };
  const restored = validate(JSON.parse(JSON.stringify(corrupt)))!;
  expect(readingUsePose(restored, map, 2000)).toBeNull();
  const recovered = advanceReadingUse(restored, map, 2000, true, true);
  expect(recovered.use).toBeNull();
  expect(recovered.completedLayouts).toEqual(state.completedLayouts);
});

it('discards a future-clock pending visit without applying its destructive edit', () => {
  const state = completed(), map = mapFor(state), started = advanceReadingUse(state, map, 1_000_000_000, true, true);
  const corrupt = { ...started, use: { ...started.use!, pending: 'restart' as const } };
  const recovered = advanceReadingUse(corrupt, map, 1000, true, true);
  expect(recovered.use).toBeNull();
  expect(recovered.layouts).toBe(state.layouts);
  expect(recovered.completedLayouts).toBe(state.completedLayouts);
});

it('does not sample a return before its saved clock or at an invalid clock', () => {
  const state = completed(), map = mapFor(state), started = advanceReadingUse(state, map, 1000, true, true);
  const returning = advanceReadingUse(queueReadingEdit(started, { type: 'restart' }, 2000)!, map, 2900, true, true);
  expect(readingUsePose(returning, map, 2899)).toBeNull();
  expect(readingUsePose(returning, map, NaN)).toBeNull();
  expect(readingUsePose(returning, map, Infinity)).toBeNull();
  expect(readingUsePose(returning, map, 2900)).not.toBeNull();
});
