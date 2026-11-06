import { expect, it } from 'vitest';
import { createGame, getOrder, orderTotal } from '../../game';
import { content } from '../../content';
import { reduceNeighbourhoodGame } from '../../neighbourhood/transitions';
import { mapsForNeighbourhood } from '../../world/dynamic';
import { createWorld } from '../../world/state';
import { worldMaps } from '../../world/registry';
import { actorsFor } from '../../world/life-bridge';
import { worldLifeFrame } from '../../world/life/scene';
import { pathDuration, readingHome } from './use';
import type { Action } from './rules';
import type { GameState } from '../../contracts';
import { validateSavedGame } from '../../save';

const act = (game: GameState, action: Action) => reduceNeighbourhoodGame(game, { type: 'feature-action', feature: 'reading-room', action, now: 100 }, content);
const tick = (game: GameState, elapsedMs: number) => reduceNeighbourhoodGame(game, { type: 'world-clock', elapsedMs }, content);
function fixture() {
  let game = createGame(content, 42);
  const table = game.customers.find(customer => getOrder(game, customer.table, content)?.customer === content.characters.find(c => c.id === 'lin-jie')!.name)!.table;
  const order = getOrder(game, table, content)!;
  game = { ...game, served: 1, earnings: orderTotal(order, content), customers: game.customers.map(customer => customer.table === table ? { ...customer, phase: 'served' } : customer), world: { ...createWorld(worldMaps), position: worldMaps.restaurant.anchors.find(a => a.id === `restaurant.table-${table}`)!.position, activeActivity: 'restaurant', activeAnchorId: `restaurant.table-${table}` } };
  // The real service acknowledgement owns the release marker.
  game = reduceNeighbourhoodGame(game, { type: 'world-close' }, content);
  game = { ...game, world: { ...createWorld(worldMaps, 'reading-room'), life: game.world!.life, position: worldMaps['reading-room'].anchors[0].position, activeActivity: 'reading-room', activeAnchorId: 'reading-room.project' }, neighbourhood: { ...game.neighbourhood!, location: 'reading-room' } };
  for (const action of [{ type: 'select', id: 'table' }, { type: 'preview', x: 2, y: 0 }, { type: 'place' }, { type: 'select', id: 'chair' }, { type: 'preview', x: 1, y: 0 }, { type: 'place' }, { type: 'check' }] as Action[]) game = act(game, action);
  return game;
}
it('starts from the next real clock and preserves life-bridge/frame/save parity during travel and queued edit', () => {
  let game = fixture();
  expect(game.neighbourhood!['reading-room'].use).toBeNull();
  game = tick(game, 1000);
  const before = game.neighbourhood!['reading-room'];
  expect(before.use?.startedAt).toBe(1000);
  const maps = mapsForNeighbourhood(game.neighbourhood!);
  expect(actorsFor(maps['reading-room'], game, game.world!, 1000, false)[0].position).toEqual(readingHome);
  game = tick(game, 2500);
  const restored = validateSavedGame(JSON.parse(JSON.stringify(game)), content)!;
  expect(restored).not.toBeNull();
  const expected = actorsFor(maps['reading-room'], game, game.world!, 2500, false);
  expect(actorsFor(maps['reading-room'], restored, restored.world!, 2500, false)).toEqual(expected);
  expect(worldLifeFrame(maps['reading-room'], game, game.world!, false).actors).toEqual(expected);
  game = act(game, { type: 'restart' });
  expect(game.neighbourhood!['reading-room'].use?.returnAt).toBeNull();
  // Closing the panel cannot reverse against a stale saved clock.
  game = reduceNeighbourhoodGame(game, { type: 'world-close' }, content);
  expect(game.neighbourhood!['reading-room'].use?.returnAt).toBeNull();
  const position = actorsFor(maps['reading-room'], game, game.world!, 3300, false)[0].position;
  game = tick(game, 3300);
  expect(actorsFor(maps['reading-room'], game, game.world!, 3300, false)[0].position).toEqual(position);
  const use = game.neighbourhood!['reading-room'].use!;
  const journal = game.journal, progression = game.progression, earnings = game.earnings;
  game = tick(game, 3300 + pathDuration(use.returnPath!));
  expect(game.neighbourhood!['reading-room'].layouts.window).toEqual([]);
  expect(game.neighbourhood!['reading-room'].completedLayouts.window).toEqual(before.completedLayouts.window);
  expect(game.journal).toBe(journal); expect(game.progression).toBe(progression); expect(game.earnings).toBe(earnings);
});

it('never displays a reader still bound to service, including a new day', () => {
  let game = tick(fixture(), 1000);
  const maps = mapsForNeighbourhood(game.neighbourhood!);
  const table = game.customers.find(customer => getOrder(game, customer.table, content)?.customer === content.characters.find(c => c.id === 'lin-jie')!.name)!.table;
  game = { ...game, customers: game.customers.map(customer => customer.table === table ? { ...customer, phase: 'seated' } : customer) };
  expect(actorsFor(maps['reading-room'], game, game.world!, 2000, false)).toEqual([]);
  expect(tick(game, 2000).neighbourhood!['reading-room'].use).toBeNull();
});

it('drops only future lifecycle metadata when the actual saved clock is older or reset', () => {
  const started = tick(fixture(), 1000), queued = act(tick(started, 2000), { type: 'restart' }), returning = tick(queued, 3000);
  for (const source of [started, returning]) for (const life of [undefined, { ...source.world!.life!, elapsedMs: 0 }, { ...source.world!.life!, elapsedMs: -1 }]) {
    const restored = validateSavedGame(JSON.parse(JSON.stringify({ ...source, world: { ...source.world, life } })), content)!;
    expect(restored.neighbourhood!['reading-room'].use).toBeNull();
    expect(restored.neighbourhood!['reading-room'].layouts).toEqual(source.neighbourhood!['reading-room'].layouts);
    expect(restored.neighbourhood!['reading-room'].completedLayouts).toEqual(source.neighbourhood!['reading-room'].completedLayouts);
    expect(restored.progression).toEqual(source.progression);
    expect(restored.journal).toEqual(source.journal);
    expect(restored.neighbourhood!.apartment).toEqual(source.neighbourhood!.apartment);
  }
  const futureReturn = { ...returning, neighbourhood: { ...returning.neighbourhood!, 'reading-room': { ...returning.neighbourhood!['reading-room'], use: { ...returning.neighbourhood!['reading-room'].use!, returnAt: 1_000_000_000 } } } };
  expect(validateSavedGame(JSON.parse(JSON.stringify(futureReturn)), content)!.neighbourhood!['reading-room'].use).toBeNull();
  expect(validateSavedGame(JSON.parse(JSON.stringify(returning)), content)!.neighbourhood!['reading-room']).toEqual(returning.neighbourhood!['reading-room']);
});
