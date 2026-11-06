import { describe, expect, it } from 'vitest';
import { createGame, getOrder, orderTotal } from '../game';
import { validateSavedGame } from '../save';
import { content, featureContent } from './registry';
import { createNeighbourhood } from './model';
import { reduceNeighbourhoodGame } from './transitions';
import type { GameState } from '../contracts';
import type { Action } from '../features/reading-room/rules';
import { mapsForNeighbourhood } from '../world/dynamic';
import { createWorld, reduceWorld, restoreWorld } from '../world/state';
import { canStand, findPath } from '../world/geometry';
import { activityTarget } from '../world/activity';
import { worldMaps } from '../world/registry';
import { artCoverage } from '../world/art-registry';

const act = (game: GameState, action: Action) => reduceNeighbourhoodGame(game, { type: 'feature-action', feature: 'reading-room', action, now: 100 }, content);
function projectGame() {
  const game = createGame(content, 42);
  return reduceNeighbourhoodGame(game, { type: 'visit-location', location: 'reading-room' }, content);
}
function finishWindow(game: GameState) {
  for (const action of [{ type: 'select', id: 'table' }, { type: 'preview', x: 2, y: 0 }, { type: 'place' }, { type: 'select', id: 'chair' }, { type: 'preview', x: 1, y: 0 }, { type: 'place' }, { type: 'check' }] as Action[]) game = act(game, action);
  return game;
}
describe('fifth chapter integration', () => {
  it('defaults only the missing or corrupt project slice and preserves prior state', () => {
    const game = projectGame(), n = game.neighbourhood!;
    const { ['reading-room']: ignored, ...legacy } = n;
    for (const reading of [undefined, { ...n['reading-room'], brief: 'unknown' }]) {
      const saved = validateSavedGame({ ...game, neighbourhood: { ...legacy, ...(reading ? { 'reading-room': reading } : {}) } }, content)!;
      expect(saved.neighbourhood?.['reading-room']).toEqual(createNeighbourhood(1)['reading-room']);
      for (const feature of ['apartment', 'cats', 'repairs', 'garden', 'claimedGiftIds'] as const) expect(saved.neighbourhood?.[feature]).toEqual(n[feature]);
    }
    expect(ignored.completed).toEqual([]);
  });
  it('keeps canonical speech registered once and project ownership separate', () => {
    expect(featureContent['reading-room']).toEqual({ words: [], lines: [] });
    const game = finishWindow(projectGame());
    expect(game.neighbourhood?.['reading-room'].status).toBe('complete');
    expect(game.neighbourhood?.apartment).toEqual(createNeighbourhood(1).apartment);
    expect(new Set(content.neighbourhood!.lines.map(line => line.id)).size).toBe(content.neighbourhood!.lines.length);
    expect(game.journal['apartment.window'].recovered).toBe(true);
    expect(game.progression?.daily.completed).toContain('reading-room.window');
    expect(Object.values(game.progression!.review).every(review => review.successes === 0 && review.interval === 1)).toBe(true);
    const restored = validateSavedGame(JSON.parse(JSON.stringify(game)), content)!;
    expect(restored.progression).toEqual(game.progression);
    expect(restored.neighbourhood).toEqual(game.neighbourhood);
  });
  it('preserves earned purchases, gifts and restaurant progress when only the new slice is corrupt', () => {
    let game = createGame(content, 42);
    game = { ...game, earnings: game.customers.reduce((sum, customer) => sum + orderTotal(getOrder(game, customer.table, content)!, content), 0), customers: game.customers.map(customer => ({ ...customer, phase: 'served' })), served: 4, ended: true, neighbourhood: { ...createNeighbourhood(1), location: 'apartment', claimedGiftIds: ['cats.cushion'] } };
    game = reduceNeighbourhoodGame(game, { type: 'purchase-furniture', id: 'blue-vase' }, content);
    const restored = validateSavedGame({ ...game, neighbourhood: { ...game.neighbourhood, 'reading-room': null } }, content)!;
    expect(restored.earnings).toBe(game.earnings);
    expect(restored.customers).toEqual(game.customers);
    expect(restored.progression).toEqual(game.progression);
    expect(restored.neighbourhood?.apartment.owned).toContain('blue-vase');
    expect(restored.neighbourhood?.apartment.owned).toContain('cats.cushion');
    expect(restored.neighbourhood?.claimedGiftIds).toEqual(['cats.cushion']);
    expect(restored.neighbourhood?.['reading-room']).toEqual(createNeighbourhood(1)['reading-room']);
  });
  it('rejects project editing outside its actual active physical activity', () => {
    const game = projectGame();
    const remote = { ...game, world: createWorld(worldMaps) };
    expect(act(remote, { type: 'select', id: 'table' })).toBe(remote);
    const inactive = { ...game, world: createWorld(worldMaps, 'reading-room') };
    expect(act(inactive, { type: 'select', id: 'table' })).toBe(inactive);
  });
  it('changes dynamic furniture atomically while keeping every prior feature unchanged', () => {
    const before = projectGame(), after = finishWindow(before), maps = mapsForNeighbourhood(after.neighbourhood!);
    expect(maps['reading-room'].colliders.some(c => c.id === 'reading-room.window.table')).toBe(true);
    for (const id of ['apartment', 'cats', 'repairs', 'garden'] as const) expect(after.neighbourhood?.[id]).toBe(before.neighbourhood?.[id]);
    const retry = act(after, { type: 'check' });
    expect(retry).toBe(after);
    const second = act(after, { type: 'begin-brief', brief: 'alcove' });
    expect(second.neighbourhood?.['reading-room'].completed).toEqual(['window']);
    expect(second.neighbourhood?.['reading-room'].status).toBe('editing');
  });
  it('uses a real reciprocal hall door and restores the real activity identity', () => {
    const hall = worldMaps['residential-hall'], room = worldMaps['reading-room'];
    expect(hall.colliders.some(c => c.id === 'residential-hall.west-threshold')).toBe(false);
    expect(hall.colliders.some(c => c.id === 'residential-hall.east-threshold')).toBe(true);
    const exit = hall.exits.find(e => e.targetMapId === room.id)!;
    const entry = room.entrances.find(e => e.id === exit.targetEntranceId)!;
    expect(canStand(room, entry.position)).toBe(true);
    expect(findPath(hall, hall.defaultSpawn, { x: 6.5, y: 12.4 }).length).toBeGreaterThan(0);
    const hallState = { ...createWorld(worldMaps), mapId: hall.id, position: { x: 6.5, y: 13 } };
    const arrived = reduceWorld(hallState, { type: 'world-move', position: { x: 6.5, y: 12.5 } }, worldMaps);
    expect(arrived.mapId).toBe('reading-room');
    expect(arrived.position).toEqual(entry.position);
    const returnExit = room.exits[0], returnEntry = hall.entrances.find(e => e.id === returnExit.targetEntranceId)!;
    expect(returnEntry.position).toEqual({ x: 6.5, y: 14 });
    const target = room.anchors.find(a => a.featureId === 'reading-room')!;
    const active = { ...arrived, position: target.position, activeActivity: 'reading-room' as const, activeAnchorId: target.id };
    expect(restoreWorld(active, worldMaps).activeActivity).toBe('reading-room');
    expect(activityTarget(active, room)).toEqual({ kind: 'reading-room' });
    expect(artCoverage()['reading-room']).toBe(1);
  });
});
