import { content } from '../../content';
import type { Content, GameState } from '../../contracts';
import type { LifeState } from './interactions';

type ServiceState = Pick<GameState, 'day' | 'customers'>;
export function restaurantPresence(game: ServiceState, life: LifeState, data: Pick<Content, 'orders' | 'characters'> = content) {
  const tables = game.customers.flatMap(customer => {
    const order = data.orders.find(order => order.id === customer.orderId);
    const character = data.characters.find(character => character.name === order?.customer);
    if (!character) return [];
    const released = customer.phase === 'served' && life.serviceDepartures.some(visit => visit.day === game.day && visit.table === customer.table && visit.orderId === customer.orderId);
    return [{ table: customer.table, orderId: customer.orderId, characterId: character.id, phase: customer.phase,
      inside: !released, reactionVisible: customer.phase === 'served' && !released,
      mealVisible: customer.phase === 'checkout' || customer.phase === 'served' }];
  });
  return { tables, insideCharacterIds: [...new Set(tables.filter(table => table.inside).map(table => table.characterId))] };
}

export function releaseServedCustomer(life: LifeState, game: ServiceState, table: number): LifeState {
  const customer = game.customers.find(customer => customer.table === table);
  if (customer?.phase !== 'served') return life;
  if (life.serviceDepartures.some(visit => visit.day === game.day && visit.table === table && visit.orderId === customer.orderId)) return life;
  const serviceDepartures = [...life.serviceDepartures.filter(visit => visit.day === game.day), { day: game.day, table, orderId: customer.orderId }];
  return { ...life, serviceDepartures };
}
