import { expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, findPath } from '../../geometry';
import { readingRoomMap } from './index';
import { projectReadingRoom } from '../../../features/reading-room/world';
import { initialState } from '../../../features/reading-room/rules';

it('authors a real reading-room identity with an accessible hall return and furnishing station', () => {
  const base = worldMapSchema.parse(readingRoomMap), projection = projectReadingRoom(initialState());
  const map = { ...base, colliders: [...base.colliders, ...projection.colliders] };
  expect(map.id).toBe('reading-room');
  expect(map.anchors[0].featureId).toBe('reading-room');
  for (const entrance of map.entrances) expect(canStand(map, entrance.position)).toBe(true);
  expect(findPath(map, map.defaultSpawn, map.anchors[0].position).length).toBeGreaterThan(0);
  expect(findPath(map, map.defaultSpawn, { x: 14, y: 19.5 }).length).toBeGreaterThan(0);
  expect(map.exits[0]).toMatchObject({ targetMapId: 'residential-hall', targetEntranceId: 'hall.from-reading-room' });
});
