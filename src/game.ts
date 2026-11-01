import { contentWords } from "./content/words";
import { KITCHEN, TABLES, TRAY_CAPACITY } from "./contracts";
import type {
  Action,
  Content,
  Customer,
  GameState,
  Order,
  Position,
} from "./contracts";
import { canStand } from "./navigation";

export function isNear(a: Position, b: Position): boolean {
  return (
    [a.x, a.y, b.x, b.y].every(Number.isFinite) &&
    Math.hypot(a.x - b.x, a.y - b.y) <= 1.8
  );
}

export function canVisitKitchen(state: GameState): boolean {
  return !state.ended && isNear(state.player, KITCHEN);
}

export function getOrder(
  state: GameState,
  table: number,
  content: Content,
): Order | undefined {
  const customer = state.customers.find((entry) => entry.table === table);
  return (
    customer &&
    content.orders.find(
      (order) => order.id === customer.orderId && order.table === table,
    )
  );
}

export function orderTotal(order: Order, content: Content): number {
  let total = 0;
  if (order.items.length === 0) return NaN;
  for (const item of order.items) {
    const food = content.foods.find((entry) => entry.id === item.foodId);
    if (
      !food ||
      !Number.isFinite(food.price) ||
      food.price < 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    )
      return NaN;
    total += food.price * item.quantity;
  }
  return Number.isFinite(total) ? total : NaN;
}

function playable(order: Order, content: Content): boolean {
  const total = orderTotal(order, content);
  return (
    Number.isFinite(total) &&
    Number.isFinite(order.paid) &&
    order.paid >= total &&
    order.items.reduce((sum, item) => sum + item.quantity, 0) <= TRAY_CAPACITY
  );
}

function startDay(content: Content, seed: number, day: number): GameState {
  const level = Math.min(day, 3);
  const customers: Customer[] = TABLES.map(({ table }) => {
    const orders = content.orders.filter(
      (order) =>
        order.table === table &&
        order.level === level &&
        playable(order, content),
    );
    if (orders.length === 0)
      throw new Error(`No playable level ${level} order for table ${table}`);
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return {
      table,
      orderId: orders[Math.floor((seed / 0x100000000) * orders.length)].id,
      phase: "seated",
    };
  });
  return {
    seed,
    day,
    level,
    player: { x: KITCHEN.x, y: KITCHEN.y + 1.5 },
    customers,
    tray: [],
    served: 0,
    earnings: 0,
    mistakes: 0,
    activeTable: null,
    feedback: "none",
    receipt: null,
    journal: {},
    ended: false,
  };
}

export function createGame(content: Content, seed = 42): GameState {
  return startDay(content, Number.isFinite(seed) ? seed >>> 0 : 42, 1);
}

function nearTable(state: GameState, table: number): boolean {
  const position = TABLES.find((entry) => entry.table === table);
  return !!position && isNear(state.player, position);
}

function setPhase(
  state: GameState,
  table: number,
  phase: Customer["phase"],
): Customer[] {
  return state.customers.map((entry) =>
    entry.table === table ? { ...entry, phase } : entry,
  );
}

function matchesTray(tray: string[], order: Order): boolean {
  const counts = new Map<string, number>();
  for (const item of order.items)
    counts.set(item.foodId, (counts.get(item.foodId) ?? 0) + item.quantity);
  for (const foodId of tray) {
    const remaining = counts.get(foodId) ?? 0;
    if (remaining <= 0) return false;
    counts.set(foodId, remaining - 1);
  }
  return [...counts.values()].every((count) => count === 0);
}

export function reduceGame(
  state: GameState,
  action: Action,
  content: Content,
): GameState {
  if (action.type === "lookup") {
    const words = contentWords(content);
    if (
      !Number.isFinite(action.now) ||
      action.now < 0 ||
      !words.some((word) => word.id === action.wordId)
    )
      return state;
    const previous = Object.hasOwn(state.journal, action.wordId)
      ? state.journal[action.wordId]
      : undefined;
    return {
      ...state,
      journal: {
        ...state.journal,
        [action.wordId]: {
          lookups: (previous?.lookups ?? 0) + 1,
          lastSeen: action.now,
        },
      },
    };
  }
  if (action.type === "next-day") {
    if (!state.ended) return state;
    return {
      ...startDay(content, state.seed, state.day + 1),
      journal: state.journal,
      earnings: state.earnings,
    };
  }
  if (state.ended) return state;
  switch (action.type) {
    case "move": {
      const { x, y } = action.position;
      if (!canStand({ x, y })) return state;
      return { ...state, player: { x, y } };
    }
    case "interact": {
      const customer = state.customers.find(
        (entry) => entry.table === action.table,
      );
      if (
        !customer ||
        customer.phase === "served" ||
        !nearTable(state, action.table)
      )
        return state;
      return {
        ...state,
        activeTable: action.table,
        feedback: "none",
        receipt: null,
        customers: setPhase(
          state,
          action.table,
          customer.phase === "seated" ? "ordered" : customer.phase,
        ),
      };
    }
    case "pickup": {
      if (
        !canVisitKitchen(state) ||
        !state.customers.some((entry) => entry.phase === "ordered") ||
        !content.foods.some((food) => food.id === action.foodId)
      )
        return state;
      if (state.tray.length >= TRAY_CAPACITY)
        return { ...state, feedback: "full" };
      return {
        ...state,
        tray: [...state.tray, action.foodId],
        feedback: "none",
      };
    }
    case "return-food": {
      if (
        !canVisitKitchen(state) ||
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= state.tray.length
      )
        return state;
      return {
        ...state,
        tray: state.tray.filter((_, index) => index !== action.index),
        feedback: "none",
      };
    }
    case "deliver": {
      const customer = state.customers.find(
        (entry) => entry.table === action.table,
      );
      const order = getOrder(state, action.table, content);
      if (
        customer?.phase !== "ordered" ||
        !nearTable(state, action.table) ||
        !order ||
        !playable(order, content)
      )
        return state;
      if (!matchesTray(state.tray, order))
        return {
          ...state,
          activeTable: action.table,
          feedback: "wrong-food",
          mistakes: state.mistakes + 1,
        };
      return {
        ...state,
        activeTable: action.table,
        tray: [],
        feedback: "none",
        receipt: null,
        customers: setPhase(state, action.table, "checkout"),
      };
    }
    case "pay": {
      const customer = state.customers.find(
        (entry) => entry.table === action.table,
      );
      const order = getOrder(state, action.table, content);
      if (
        customer?.phase !== "checkout" ||
        !nearTable(state, action.table) ||
        !order ||
        !playable(order, content) ||
        !Number.isFinite(action.change) ||
        action.change < 0
      )
        return state;
      const total = orderTotal(order, content);
      if (action.change !== order.paid - total)
        return {
          ...state,
          activeTable: action.table,
          feedback: "wrong-change",
          mistakes: state.mistakes + 1,
        };
      const served = state.served + 1;
      return {
        ...state,
        customers: setPhase(state, action.table, "served"),
        activeTable: action.table,
        served,
        earnings: state.earnings + total,
        ended: served === TABLES.length,
        feedback: "thanks",
        receipt: { table: action.table, total, change: action.change },
      };
    }
  }
}
