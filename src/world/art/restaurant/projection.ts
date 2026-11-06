import type { Character, Content, Food, GameState, Phase, Position } from '../../../contracts';
import type { RestaurantMap } from './types';
import { RESTAURANT_FURNITURE_PROFILE as furniture } from './furniture';

export const RESTAURANT_TABLES = [
  { table: 1, propId: 'table-5-9' },
  { table: 2, propId: 'table-17-9' },
  { table: 3, propId: 'table-5-14' },
  { table: 4, propId: 'table-17-14' },
] as const;

export type RestaurantCustomer = {
  id: string;
  table: number;
  characterId: string;
  appearance: Character['appearance'];
  phase: Phase;
  position: Position;
  facing: 'south';
  seated: true;
  seatHeight: number;
};
export type RestaurantMeal = { table: number; propId: string; foods: readonly Food['kind'][] };
export type RestaurantProjection = {
  customers: readonly RestaurantCustomer[];
  meals: readonly RestaurantMeal[];
  tray: readonly Food['kind'][];
  served: number;
};

export function projectRestaurant(
  state: Pick<GameState, 'customers' | 'tray' | 'served'>,
  content: Pick<Content, 'orders' | 'characters' | 'foods'>,
  map: RestaurantMap,
  departedCharacterIds: readonly string[] = [],
): RestaurantProjection {
  const customers: RestaurantCustomer[] = [];
  const meals: RestaurantMeal[] = [];
  for (const binding of RESTAURANT_TABLES) {
    const prop = map.props.find(p => p.id === binding.propId);
    const customer = state.customers.find(c => c.table === binding.table);
    if (!prop || !customer) continue;
    const order = content.orders.find(o => o.id === customer.orderId);
    const character = content.characters.find(c => c.name === order?.customer);
    if (!order || !character) continue;
    if (!departedCharacterIds.includes(character.id)) customers.push({
      id: `restaurant.customer.${binding.table}`, table: binding.table,
      characterId: character.id, appearance: character.appearance, phase: customer.phase,
      position: { x: prop.position.x + prop.width / 2, y: prop.position.y + furniture.rearStoolCenterOffsetY },
      facing: 'south', seated: true, seatHeight: furniture.stoolTop,
    });
    if (customer.phase === 'checkout' || customer.phase === 'served') {
      meals.push({ table: binding.table, propId: binding.propId,
        foods: [...new Set(order.items.flatMap(item => {
          const food = content.foods.find(f => f.id === item.foodId);
          return food ? [food.kind] : [];
        }))],
      });
    }
  }
  return { customers, meals, tray: state.tray.flatMap(id => {
    const food = content.foods.find(f => f.id === id);
    return food ? [food.kind] : [];
  }), served: state.served };
}
