import { describe, expect, it } from 'vitest';
import { content } from '../../../content';
import { createGame } from '../../../game';
import { projectRestaurant } from './projection';
import { restaurantMap } from '../../../../docs/evidence/0089/foundation-map';

describe('authoritative restaurant projection', () => {
  it('resolves real display names to four canonical actors and stable seats', () => {
    const state = createGame(content, 42);
    const map = { ...restaurantMap, props: [...restaurantMap.props].reverse() };
    const result = projectRestaurant(state, content, map);
    expect(result.customers).toHaveLength(4);
    expect(result.customers.map(c => c.position)).toEqual([
      { x: 5, y: 7.4 }, { x: 17, y: 7.4 }, { x: 5, y: 12.4 }, { x: 17, y: 12.4 },
    ]);
    expect(result.customers.every(c => content.characters.some(character => character.id === c.characterId))).toBe(true);
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
});
