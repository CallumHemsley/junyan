import { expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, findPath } from '../../geometry';
import { readingRoomMap } from './index';
import { projectReadingRoom } from '../../../features/reading-room/world';
import { initialState, legal } from '../../../features/reading-room/rules';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';

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

it('keeps the grouped return fixtures clear of every legal furniture footprint and the protected routes', () => {
  const base = worldMapSchema.parse(readingRoomMap);
  const routes = [
    [base.defaultSpawn, { x: 11.9, y: 14.4 }, { x: 11.9, y: 10.75 }, { x: 12.6, y: 6.5 }, { x: 12, y: 7 }],
    [{ x: 5, y: 10.75 }, { x: 23, y: 10.75 }],
    [base.defaultSpawn, { x: 14, y: 13.7 }, { x: 17.95, y: 14.1 }],
  ];
  // A safe desk approach is inside the existing interaction radius, outside all editable cells.
  expect(Math.hypot(12 - base.anchors[0].position.x, 7 - base.anchors[0].position.y)).toBeLessThan(base.anchors[0].radius);
  for (const brief of ['window', 'alcove'] as const) for (const id of ['table', 'chair'] as const) for (const rotation of [0, 1] as const) for (let x = 0; x < 6; x++) for (let y = 0; y < 5; y++) {
    const placement = { id, rotation, x, y };
    if (!legal(brief, [], placement)) continue;
    const state = initialState(), projected = projectReadingRoom({ ...state, brief, layouts: { ...state.layouts, [brief]: [placement] } });
    const map = { ...base, colliders: [...base.colliders, ...projected.colliders] };
    for (const route of routes) for (let i = 1; i < route.length; i++) expect(canWalk(map, route[i - 1], route[i]), `${brief}/${id}/${rotation}/${x},${y} protected route ${i}`).toBe(true);
  }
  const cart = base.props.find(p => p.id === 'reading-room.return-cart')!, lamp = base.props.find(p => p.id === 'reading-room.lamp')!;
  for (const fixture of [cart, lamp]) expect(base.colliders.find(c => c.id === fixture.id)?.rect).toEqual({ ...fixture.position, width: fixture.width, height: fixture.height });
  const light = atmosphereHooksForMap(base).lights!.find(light => light.id === lamp.id)!;
  expect(light.position).toMatchObject({ x: lamp.position.x + lamp.width / 2, y: lamp.position.y + lamp.height / 2 });
});
