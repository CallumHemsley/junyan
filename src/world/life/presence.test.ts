import { expect, it } from 'vitest';
import { createGame } from '../../game';
import { actorsFor } from '../life-bridge';
import { worldLifeFrame } from './scene';
import { mapsForNeighbourhood } from '../dynamic';
import { createWorld, restoreWorld } from '../state';
import { restoreNeighbourhood } from '../../neighbourhood/model';
import { reduceNeighbourhoodGame } from '../../neighbourhood/transitions';
import { initialState, reduce, validate, type State } from '../../features/reading-room/rules';
import { advanceReadingUse, pathDuration, queueReadingEdit, readingHome } from '../../features/reading-room/use';
import type { GameState } from '../../contracts';
import { content } from '../../content';
import { initialLifeState, restaurantPresence, releaseServedCustomer, restoreLife } from './index';

it('keeps waiting and reacting customers inside on every map until service acknowledgment', () => {
  const game = createGame(content, 42), life = initialLifeState();
  expect(restaurantPresence(game, life).tables.every(table => table.inside)).toBe(true);
  expect(releaseServedCustomer(life, game, 1)).toBe(life);
  const served = { ...game, customers: game.customers.map(customer => customer.table === 1 ? { ...customer, phase: 'served' as const } : customer) };
  const before = restaurantPresence(served, life).tables.find(table => table.table === 1)!;
  expect(before.inside).toBe(true);
  expect(before.reactionVisible).toBe(true);
  expect(before.mealVisible).toBe(true);
  const released = releaseServedCustomer(life, served, 1);
  const after = restaurantPresence(served, released).tables.find(table => table.table === 1)!;
  expect(after.inside).toBe(false);
  expect(after.reactionVisible).toBe(false);
  expect(after.mealVisible).toBe(true);
  expect(restaurantPresence(served, released).insideCharacterIds.includes(after.characterId)).toBe(served.customers.some(customer => {
    const order = content.orders.find(order => order.id === customer.orderId)!;
    return customer.table !== 1 && content.characters.find(character => character.name === order.customer)!.id === after.characterId;
  }));
  expect(releaseServedCustomer(released, served, 1)).toBe(released);
  expect(served.customers.find(customer => customer.table === 1)!.phase).toBe('served');
});

it('restores departure acknowledgment but does not release another day or changed order', () => {
  const game = createGame(content, 42);
  game.customers[0].phase = 'served';
  const released = restoreLife(JSON.parse(JSON.stringify(releaseServedCustomer(initialLifeState(), game, 1))));
  expect(restaurantPresence(game, released).tables.find(table => table.table === 1)!.inside).toBe(false);
  expect(restaurantPresence({ ...game, day: 2 }, released).tables.find(table => table.table === 1)!.inside).toBe(true);
  const changed = { ...game, customers: game.customers.map(customer => customer.table === 1 ? { ...customer, orderId: content.orders.find(order => order.table === 1 && order.id !== customer.orderId)!.id } : customer) };
  expect(restaurantPresence(changed, released).tables.find(table => table.table === 1)!.inside).toBe(true);
});

function readingVisit() {
  const game = createGame(content, 42);
  const customer = game.customers.find(customer => content.orders.find(order => order.id === customer.orderId)?.customer === content.characters.find(character => character.id === 'lin-jie')!.name)!;
  customer.phase = 'served';
  let reading = initialState();
  for (const [id, x] of [['table', 2], ['chair', 1]] as const) {
    reading = reduce(reading, { type: 'select', id });
    reading = reduce(reading, { type: 'preview', x, y: 0 });
    reading = reduce(reading, { type: 'place' });
  }
  reading = reduce(reading, { type: 'check' });
  game.neighbourhood!['reading-room'] = reading;
  const maps = mapsForNeighbourhood(game.neighbourhood!);
  game.world = createWorld(maps, 'reading-room');
  game.world.life = releaseServedCustomer(restoreLife(game.world.life), game, customer.table);
  game.neighbourhood!['reading-room'] = advanceReadingUse(reading, maps['reading-room'], 1000, true, true);
  return game;
}
function actorsOn(game: GameState, mapId: string, elapsedMs: number) {
  const map = mapsForNeighbourhood(game.neighbourhood!)[mapId];
  const world = { ...game.world!, mapId, life: { ...restoreLife(game.world!.life), elapsedMs } };
  return [actorsFor(map, game, world, elapsedMs, false), worldLifeFrame(map, game, world, false).actors];
}
const lin = (actors: ReturnType<typeof actorsFor>) => actors.filter(actor => actor.characterId === 'lin-jie');

it('gives an explicit approach, read, pending edit and return exclusive presence on both life paths', () => {
  const game = readingVisit(), started = game.neighbourhood!['reading-room'];
  const at = 1000 + pathDuration(started.use!.path) + 500;
  const pending = queueReadingEdit(started, { type: 'restart' }, at)!;
  const map = mapsForNeighbourhood(game.neighbourhood!)['reading-room'];
  const returning = advanceReadingUse(pending, map, at, true, true);
  for (const [reading, clock] of [[started, 1001], [started, at], [pending, at], [returning, at + 100]] as const) {
    game.neighbourhood!['reading-room'] = reading;
    for (const mapId of Object.keys(mapsForNeighbourhood(game.neighbourhood!))) {
      const withVisit = actorsOn(game, mapId, clock);
      const withoutVisit = actorsOn({ ...game, neighbourhood: { ...game.neighbourhood!, 'reading-room': { ...reading, use: null } } }, mapId, clock);
      for (let seam = 0; seam < 2; seam++) {
        expect(lin(withVisit[seam]), `${mapId} seam ${seam}`).toHaveLength(mapId === 'reading-room' ? 1 : 0);
        expect(withVisit[seam].filter(actor => actor.characterId !== 'lin-jie')).toEqual(withoutVisit[seam].filter(actor => actor.characterId !== 'lin-jie'));
      }
    }
  }
  const done = advanceReadingUse(returning, map, at + pathDuration(returning.use!.returnPath!), true, false);
  expect(done.use).toBeNull();
  expect(done.status).toBe('editing');
  game.neighbourhood!['reading-room'] = done;
  expect(actorsOn(game, 'town', at + 10000).every(actors => lin(actors).length === 1)).toBe(true);
  for (const actors of actorsOn(game, 'reading-room', at + 10000)) expect(lin(actors)[0].position).toEqual(readingHome);
});

it('restores the explicit owner while invalid and missing visits keep the existing home fallback', () => {
  const game = readingVisit(), started = game.neighbourhood!['reading-room'];
  game.neighbourhood = restoreNeighbourhood(JSON.parse(JSON.stringify(game.neighbourhood)), game.day);
  game.world = restoreWorld(JSON.parse(JSON.stringify(game.world)), mapsForNeighbourhood(game.neighbourhood));
  expect(actorsOn(game, 'town', 2000).every(actors => lin(actors).length === 0)).toBe(true);
  const invalid: State[] = [
    { ...started, use: null },
    validate({ ...started, use: { path: 'broken' } })!,
    { ...started, use: { ...started.use!, path: [{ x: 13, y: 17 }, { x: 14, y: 17 }] } },
    { ...started, use: { ...started.use!, startedAt: 1000000 } },
    { ...started, use: { ...started.use!, returnAt: 1000000, returnPath: [...started.use!.path].reverse(), pending: 'restart' } },
  ];
  for (const reading of invalid) {
    game.neighbourhood['reading-room'] = reading;
    expect(actorsOn(game, 'town', 2000).every(actors => lin(actors).length === 1)).toBe(true);
    for (const actors of actorsOn(game, 'reading-room', 2000)) expect(lin(actors)[0].position).toEqual(readingHome);
  }
  game.neighbourhood['reading-room'] = invalid[0];
  for (const actors of actorsOn(game, 'reading-room', 2000)) expect(lin(actors)[0].position).toEqual(readingHome);
});

it('preserves restaurant ownership before acknowledgment and resets the visit on the next day', () => {
  let game = readingVisit();
  const retained = { ...game, world: { ...game.world!, life: initialLifeState() } };
  for (const mapId of ['town', 'reading-room']) expect(actorsOn(retained, mapId, 2000).every(actors => lin(actors).length === 0)).toBe(true);
  expect(actorsOn(game, 'reading-room', 2000).every(actors => lin(actors).length === 1)).toBe(true);
  game = { ...game, ended: true, neighbourhood: { ...game.neighbourhood!, location: 'restaurant' } };
  const next = reduceNeighbourhoodGame(game, { type: 'advance-world-day', now: 3000 }, content);
  expect(next.day).toBe(2);
  expect(next.neighbourhood!['reading-room'].use).toBeNull();
  expect(next.neighbourhood!['reading-room'].completedLayouts).toEqual(game.neighbourhood!['reading-room'].completedLayouts);
  expect(actorsOn(next, 'reading-room', 3000).every(actors => lin(actors).length === 0)).toBe(true);
});
