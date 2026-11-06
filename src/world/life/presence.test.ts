import { expect, it } from 'vitest';
import { createGame } from '../../game';
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
