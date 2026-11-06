import { describe, expect, it } from 'vitest';
import { content } from '../../../content';
import { createGame, orderTotal, reduceGame } from '../../../game';
import { TABLES } from '../../../contracts';
import { restaurantObjects, RESTAURANT_FURNITURE_PROFILE } from './index';
import type { RestaurantView } from './types';
import { projectRestaurant } from './projection';
import { restaurantMap } from '../../restaurant';

describe('authoritative restaurant projection', () => {
  it('resolves real display names to four canonical actors and stable seats', () => {
    const state = createGame(content, 42);
    const map = { ...restaurantMap, props: [...restaurantMap.props].reverse() };
    const result = projectRestaurant(state, content, map);
    expect(result.customers).toHaveLength(4);
    expect(result.customers.map(c => c.position)).toEqual([
      { x: 5, y: 6.48 }, { x: 12, y: 6.48 }, { x: 5, y: 10.48 }, { x: 12, y: 10.48 },
    ]);
    expect(result.customers.every(c => content.characters.some(character => character.id === c.characterId))).toBe(true);
    expect(result.customers.every(c => c.seatHeight === RESTAURANT_FURNITURE_PROFILE.stoolTop)).toBe(true);
    expect(result.customers.every(c => !('z' in c.position))).toBe(true);
    expect(result.meals).toEqual([]);
  });

  it('projects delivered meals through payment and retains tray order without state writes', () => {
    const state = createGame(content, 42);
    state.customers[0].phase = 'checkout';
    state.customers[1].phase = 'served';
    state.tray = ['bun', 'milk', 'bun'];
    state.served = 1;
    const before = structuredClone(state);
    const result = projectRestaurant(state, content, restaurantMap);
    expect(result.meals.map(m => m.table)).toEqual([1, 2]);
    for (const meal of result.meals) {
      const order = content.orders.find(o => o.id === state.customers.find(c => c.table === meal.table)!.orderId)!;
      expect(meal.foods).toEqual([...new Set(order.items.map(item => content.foods.find(f => f.id === item.foodId)!.kind))]);
    }
    expect(result.tray).toEqual(['bun', 'milk', 'bun']);
    expect(result.served).toBe(1);
    expect(state).toEqual(before);
  });

  it('keeps paid customers seated until explicit canonical departure while retaining meals and receipts', () => {
    const state = createGame(content, 42);
    const customer = state.customers[0];
    customer.phase = 'checkout';
    state.player = { x: TABLES[0].x, y: TABLES[0].y };
    const order = content.orders.find(o => o.id === customer.orderId)!;
    const character = content.characters.find(c => c.name === order.customer)!;
    const paid = reduceGame(state, { type: 'pay', table: customer.table, change: order.paid - orderTotal(order, content) }, content);
    const before = structuredClone(paid);
    const awaitingAcknowledgment = projectRestaurant(paid, content, restaurantMap);
    expect(paid.feedback).toBe('thanks');
    expect(paid.receipt?.table).toBe(customer.table);
    expect(awaitingAcknowledgment.customers.find(c => c.characterId === character.id)?.phase).toBe('served');
    expect(awaitingAcknowledgment.customers).toHaveLength(4);

    const departed = projectRestaurant(paid, content, restaurantMap, [character.id]);
    expect(departed.customers).toHaveLength(3);
    expect(departed.customers.some(c => c.characterId === character.id)).toBe(false);
    expect(departed.meals).toEqual(awaitingAcknowledgment.meals);
    expect(departed.served).toBe(paid.served);
    const view: RestaurantView = {
      project: p => p, elapsedMs: 0, reducedMotion: true, playerPosition: paid.player,
      width: 992, height: 800, pass: 'ground',
    };
    expect(restaurantObjects(restaurantMap, view, departed).map(object => object.id))
      .toContain(`restaurant.table-setting.${customer.table}`);
    expect(paid).toEqual(before);
    expect(projectRestaurant(paid, content, restaurantMap).customers).toHaveLength(4);
  });

});
