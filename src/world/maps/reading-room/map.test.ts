import { expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, findPath } from '../../geometry';
import { readingRoomMap } from './index';
import { projectReadingRoom } from '../../../features/reading-room/world';
import { initialState, legal } from '../../../features/reading-room/rules';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';
import { worldMaps } from '../../registry';
import { createWorld, reduceWorld, restoreWorld } from '../../state';
import { isExitConnected } from '../../exit-safety';
import { readingHome } from '../../../features/reading-room/use';
import { regions } from '../../../features/reading-room/world';

it('authors a real reading-room identity with an accessible hall return and furnishing station', () => {
  const base = worldMapSchema.parse(readingRoomMap), projection = projectReadingRoom(initialState());
  const map = { ...base, colliders: [...base.colliders, ...projection.colliders] };
  expect(map.id).toBe('reading-room');
  expect(map.anchors[0].featureId).toBe('reading-room');
  for (const entrance of map.entrances) expect(canStand(map, entrance.position)).toBe(true);
  expect(findPath(map, map.defaultSpawn, map.anchors[0].position).length).toBeGreaterThan(0);
  expect(findPath(map, map.defaultSpawn, { x: 14, y: 16.5 }).length).toBeGreaterThan(0);
  expect(map.exits[0]).toMatchObject({ targetMapId: 'residential-hall', targetEntranceId: 'hall.from-reading-room' });
});

it('aligns the compact actual floor, shell, threshold and preserved work bays', () => {
  const map = worldMapSchema.parse(readingRoomMap), floor = map.terrain[0].rect;
  expect(floor).toEqual({ x: 2, y: 3, width: 24, height: 14 });
  expect(map.walkable).toEqual([floor]);
  expect(map.bounds).toEqual({ width: 28, height: 19 });
  const prop = (id: string) => map.props.find(p => p.id === `reading-room.${id}`)!;
  expect(prop('back-wall').width).toBe(floor.width);
  expect(prop('west-wall').height).toBe(floor.height);
  expect(prop('east-wall')).toMatchObject({ position: { x: floor.x + floor.width, y: floor.y }, height: floor.height });
  const threshold = prop('hall-threshold'), exit = map.exits[0].rect;
  expect(threshold.position.y).toBe(exit.y);
  expect(exit.y + exit.height).toBe(floor.y + floor.height);
  expect(map.colliders.find(c => c.id === 'reading-room.entry-left')!.rect).toMatchObject({ x: threshold.position.x, y: threshold.position.y, height: threshold.height });
  const rightJamb = map.colliders.find(c => c.id === 'reading-room.entry-right')!.rect;
  expect(rightJamb.x + rightJamb.width).toBeCloseTo(threshold.position.x + threshold.width);
  expect(rightJamb).toMatchObject({ y: threshold.position.y, height: threshold.height });
  for (const p of map.props.filter(p => ['reading-shelf', 'reading-cart', 'reading-notice', 'reading-plant', 'reading-lamp'].includes(p.kind))) {
    expect(map.colliders.find(c => c.id === p.id)?.rect, p.id).toEqual({ ...p.position, width: p.width, height: p.height });
  }
  for (const region of Object.values(regions)) {
    expect(region.x + region.columns * region.cellSize).toBeLessThan(floor.x + floor.width);
    expect(region.y + region.rows * region.cellSize).toBeLessThan(floor.y + floor.height);
  }
  const projection = projectReadingRoom(initialState()), actual = { ...map, colliders: [...map.colliders, ...projection.colliders] };
  expect(canStand(actual, readingHome)).toBe(true);
  expect(findPath(actual, map.defaultSpawn, readingHome).length).toBeGreaterThan(0);
});

it('walks reciprocal hall entry and exit and safely restores removed-acreage saves', () => {
  const room = worldMaps['reading-room'], hall = worldMaps['residential-hall'];
  const inbound = hall.exits.find(exit => exit.targetMapId === room.id)!;
  const destination = { x: inbound.rect.x + inbound.rect.width / 2, y: inbound.rect.y + inbound.rect.height / 2 };
  const fromHall = { ...createWorld(worldMaps), mapId: hall.id, position: { x: destination.x, y: destination.y + 1 } };
  const entered = reduceWorld(fromHall, { type: 'world-move', position: destination }, worldMaps);
  expect(entered.mapId).toBe(room.id);
  expect(entered.position).toEqual(room.entrances[0].position);
  const exit = room.exits[0].rect, toHall = { x: exit.x + exit.width / 2, y: exit.y + exit.height / 2 };
  const exited = reduceWorld(entered, { type: 'world-move', position: toHall }, worldMaps);
  expect(exited.mapId).toBe(hall.id);
  expect(exited.position).toEqual(hall.entrances.find(e => e.id === 'hall.from-reading-room')!.position);
  for (const position of [{ x: 14, y: 17.5 }, { x: 27.5, y: 18.5 }, { x: 27, y: 10 }, { x: 14, y: 19.5 }]) {
    const legacy = { ...entered, position, returnPositions: { [room.id]: { ...position, facing: 'north' as const } } };
    const restored = restoreWorld(legacy, worldMaps);
    expect(canStand(room, position)).toBe(false);
    expect(canStand(room, restored.position)).toBe(true);
    expect(isExitConnected(room, restored.position)).toBe(true);
    expect(restored.returnPositions[room.id]).toBeUndefined();
    expect(findPath(room, restored.position, toHall).length).toBeGreaterThan(0);
  }
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
