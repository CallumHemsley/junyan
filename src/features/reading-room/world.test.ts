import { expect, it } from 'vitest';
import { worldMapSchema } from '../../world/schema';
import { isExitConnected } from '../../world/exit-safety';
import { readingRoomMap } from '../../world/maps/reading-room';
import { initialState, legal, reduce, type State } from './rules';
import { gridToWorld, placementRect, projectReadingRoom, worldToGrid } from './world';

function solveWindow(): State {
  return { ...initialState(), layouts: { window: [{ id: 'table', x: 2, y: 0, rotation: 0 }, { id: 'chair', x: 1, y: 0, rotation: 0 }], alcove: [] } };
}
function solveAlcove(): State {
  const first = reduce(solveWindow(), { type: 'check' });
  return { ...first, brief: 'alcove', status: 'editing', layouts: { ...first.layouts, alcove: [{ id: 'table', x: 2, y: 0, rotation: 1 }, { id: 'chair', x: 1, y: 1, rotation: 0 }] } };
}

it('maps real floor points to the active project without accepting the circulation outside it', () => {
  for (const brief of ['window', 'alcove'] as const) for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) expect(worldToGrid(gridToWorld({ x, y }, brief), brief)).toEqual({ x, y });
  expect(worldToGrid({ x: 14, y: 17 }, 'window')).toBeNull();
});
it('projects the same footprints into visible objects and collision, including a real draft ghost', () => {
  const selected = reduce(initialState(), { type: 'select', id: 'table' });
  expect(projectReadingRoom(selected).props.find(p => p.id === 'reading-room.draft')).toMatchObject({ kind: 'reading-draft', width: 3, height: 1.5 });
  const state = solveWindow(), projected = projectReadingRoom(state), p = state.layouts.window[0];
  expect(projected.colliders.find(c => c.id === 'reading-room.window.table')?.rect).toEqual(placementRect(p, 'window'));
  expect(projected.props.find(c => c.id === 'reading-room.window.table')).toMatchObject({ position: { x: 7, y: 4 }, width: 3, height: 1.5 });
});
it('keeps the door, activity desk and both protected circulation lanes connected in completed layouts', () => {
  for (const state of [initialState(), reduce(solveWindow(), { type: 'check' }), reduce(solveAlcove(), { type: 'check' })]) {
    const base = worldMapSchema.parse(readingRoomMap), projected = projectReadingRoom(state);
    const map = { ...base, colliders: [...base.colliders, ...projected.colliders] };
    for (const point of [map.defaultSpawn, map.anchors[0].position, gridToWorld({ x: 5, y: 2 }, 'window'), gridToWorld({ x: 2, y: 4 }, 'alcove')]) expect(isExitConnected(map, point)).toBe(true);
  }
});
it('shows the durable first arrangement when its replay draft is cleared and the player changes brief', () => {
  const first = reduce(solveWindow(), { type: 'check' });
  const replay = reduce(first, { type: 'restart' });
  const second = reduce(replay, { type: 'begin-brief', brief: 'alcove' });
  const projection = projectReadingRoom(second);
  expect(projection.props.find(p => p.id === 'reading-room.window.table')?.position).toEqual({ x: 7, y: 4 });
  expect(projection.props.some(p => p.id === 'reading-room.window.chair')).toBe(true);
  expect(projection.colliders.find(c => c.id === 'reading-room.window.table')?.rect).toEqual(placementRect(first.layouts.window[0], 'window'));
});
it('keeps static room fixtures outside every legal project placement', () => {
  const map = worldMapSchema.parse(readingRoomMap);
  for (const brief of ['window', 'alcove'] as const) for (const id of ['table', 'chair'] as const) for (const rotation of [0, 1] as const) for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
    const p = { id, rotation, x, y };
    if (!legal(brief, [], p)) continue;
    const rect = placementRect(p, brief);
    for (const c of map.colliders) expect(rect.x < c.rect.x + c.rect.width && rect.x + rect.width > c.rect.x && rect.y < c.rect.y + c.rect.height && rect.y + rect.height > c.rect.y, `${brief} ${id} ${x},${y} vs ${c.id}`).toBe(false);
  }
});
