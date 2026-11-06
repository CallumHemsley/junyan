import { expect, it } from 'vitest';
import { readingRoomMap } from '../../maps/reading-room';
import { worldMapSchema } from '../../schema';
import { projectReadingRoom } from '../../../features/reading-room/world';
import { initialState, reduce } from '../../../features/reading-room/rules';
import { renderObjects } from './index';

it('renders room fixtures and actual project furniture as depth-sorted objects', () => {
  let state = initialState();
  state = reduce(state, { type: 'select', id: 'table' });
  state = reduce(state, { type: 'preview', x: 2, y: 0 });
  state = reduce(state, { type: 'place' });
  state = reduce(state, { type: 'select', id: 'chair' });
  state = reduce(state, { type: 'preview', x: 1, y: 0 });
  state = reduce(state, { type: 'place' });
  state = reduce(state, { type: 'check' });
  const base = worldMapSchema.parse(readingRoomMap), p = projectReadingRoom(state), map = { ...base, props: [...base.props, ...p.props], occluders: [...base.occluders, ...p.occluders] };
  const objects = renderObjects(map);
  expect(objects.find(o => o.id === 'reading-room.window.table')).toBeDefined();
  expect(objects.find(o => o.id === 'reading-room.window.table')?.occlusion).toMatchObject({ height: 1.2 });
  expect(objects.filter(o => o.id.startsWith('reading-room.back-wall.'))).toHaveLength(26);
  expect(objects.some(o => o.id === 'reading-room.broad-window')).toBe(true);
  expect(objects.some(o => o.id === 'reading-room.return-cart')).toBe(true);
  const table = objects.find(o => o.id === 'reading-room.window.table')!;
  expect(objects.find(o => o.id === 'reading-room.window.table.book')!.depth).toBeGreaterThan(table.position.x + table.position.y);
  expect(objects.find(o => o.id === 'reading-room.broad-window')!.depth).toBeGreaterThan(15.3);
});
