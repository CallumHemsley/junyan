import { z } from "zod";
import { TABLES, TRAY_CAPACITY, type Content, type GameState } from "./contracts";
import { getOrder, orderTotal } from "./game";
import { canStand } from "./navigation";

const boundedNumber = z.number().nonnegative().max(Number.MAX_SAFE_INTEGER);
const tableSchema = z.number().int().min(1).max(TABLES.length);

const stateSchema = z.object({
  seed: z.number().int().min(0).max(0xffffffff),
  day: z.number().int().positive(),
  level: z.number().int().min(1).max(3),
  player: z.object({
    x: z.number().min(0).max(12),
    y: z.number().min(0).max(10),
  }),
  customers: z
    .array(
      z.object({
        table: z.number().int().min(1).max(4),
        orderId: z.string(),
        phase: z.enum(["seated", "ordered", "checkout", "served"]),
      }),
    )
    .length(4),
  tray: z.array(z.string()).max(TRAY_CAPACITY),
  served: z.number().int().min(0).max(4),
  earnings: boundedNumber,
  mistakes: z.number().int().nonnegative(),
  activeTable: tableSchema.nullable(),
  feedback: z.enum(["none", "wrong-food", "wrong-change", "thanks", "full"]),
  receipt: z
    .object({ table: tableSchema, total: boundedNumber, change: boundedNumber })
    .nullable(),
  journal: z.record(
    z.string(),
    z.object({ lookups: z.number().int().nonnegative(), lastSeen: boundedNumber }),
  ),
  ended: z.boolean(),
});

export function validateSavedGame(
  value: unknown,
  content: Content,
): GameState | null {
  const result = stateSchema.safeParse(value);
  if (!result.success) return null;
  const state = result.data;
  if (
    new Set(state.customers.map((customer) => customer.table)).size !==
      TABLES.length ||
    state.level !== Math.min(state.day, 3) ||
    !canStand(state.player) ||
    state.served !==
      state.customers.filter((customer) => customer.phase === "served").length ||
    state.ended !== (state.served === TABLES.length) ||
    !state.tray.every((id) => content.foods.some((food) => food.id === id))
  )
    return null;

  let earnedToday = 0;
  for (const customer of state.customers) {
    const order = getOrder(state, customer.table, content);
    if (!order || order.level !== state.level) return null;
    const total = orderTotal(order, content);
    if (
      !Number.isFinite(total) ||
      !Number.isFinite(order.paid) ||
      order.paid < total ||
      order.items.reduce((sum, item) => sum + item.quantity, 0) >
        TRAY_CAPACITY ||
      !content.characters.some((character) => character.name === order.customer)
    )
      return null;
    if (customer.phase === "served") earnedToday += total;
  }
  if (
    state.earnings < earnedToday ||
    (state.day === 1 && state.earnings !== earnedToday)
  )
    return null;
  if (
    state.activeTable !== null &&
    !state.customers.some(
      (customer) =>
        customer.table === state.activeTable && customer.phase !== "seated",
    )
  )
    return null;
  if (state.receipt) {
    const receipt = state.receipt;
    const customer = state.customers.find(
      (entry) => entry.table === receipt.table,
    );
    const order = getOrder(state, receipt.table, content);
    if (!order || customer?.phase !== "served") return null;
    const total = orderTotal(order, content);
    if (receipt.total !== total || receipt.change !== order.paid - total) return null;
  }
  return state;
}

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("junyan-waiter", 1);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore("saves");
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
    request.onblocked = () => {
      blocked = true;
      reject(new DOMException("Save database is blocked", "InvalidStateError"));
    };
    request.onerror = () => reject(request.error);
  });
}
export async function loadGame(content: Content): Promise<GameState | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("saves");
      const request = transaction.objectStore("saves").get("v1");
      transaction.oncomplete = () => {
        resolve(validateSavedGame(request.result, content));
      };
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export async function saveGame(state: GameState): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("saves", "readwrite");
      transaction.objectStore("saves").put(state, "v1");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}
