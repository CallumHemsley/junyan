/**
 * The restaurant map, drawn as the pixel cafe: pure functions from game state to what the pixel
 * engine draws (scene, cast, food on the tables, light). No DOM; `CafeView.tsx` renders the result.
 * The restaurant map's coordinates are the cafe scene's tile units (see `../restaurant.ts`), so a
 * world position is an actor position as it is.
 */
import cafe, { CAFE_TABLES, seatedActor } from "../../pixel/scenes/cafe.ts";
import type { Actor, DayPhase, Facing, Prop, Scene, Vec } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import { content as defaultContent } from "../../content";
import type { Content, GameState } from "../../contracts";
import { restaurantPresence, restoreLife } from "../life";
import type { DayPhase as ServiceDayPhase } from "../atmosphere";
import type { Facing as WorldFacing, Point, WorldMapDefinition } from "../schema";
import { canStand } from "../geometry";

/**
 * The scene the game plays in: the composed cafe without its demo cast (the game supplies its own)
 * and without the previous customers' leftovers, so food on a table always means a served order.
 */
export const liveCafe: Scene = {
  ...cafe,
  actors: undefined,
  props: (cafe.props ?? []).filter(prop => !prop.id?.startsWith("remains/")),
};

/** The cook works the stove line all day, exactly where the composed scene puts her. */
export const COOK: Actor = cafe.actors?.find(actor => actor.id === "cook") ?? { id: "cook", sprite: "char/cook", at: [14.2, 5.7], facing: "down", action: "work" };

const FACING: Record<WorldFacing, Facing> = { north: "up", east: "right", south: "down", west: "left" };
export const pixelFacing = (facing: WorldFacing): Facing => FACING[facing];

/** The service light (`serviceDayPhase`) in the engine's phases. */
export function cafePhase(phase: ServiceDayPhase): DayPhase {
  return phase === "noon" ? "midday" : phase;
}

/**
 * While serving, the waiter turns to what they are serving: the table, or the counter at the pass.
 * Null when no service anchor is active.
 */
export function serviceFacing(position: Point, anchorId: string | null): Facing | null {
  const table = anchorId?.match(/^restaurant\.table-([1-4])$/);
  const target: Vec | null = table ? [CAFE_TABLES[Number(table[1]) - 1].at[0], CAFE_TABLES[Number(table[1]) - 1].at[1] - .45]
    : anchorId === "restaurant.kitchen" ? [position.x, position.y - 1] : null;
  if (!target) return null;
  const dx = target[0] - position.x, dy = target[1] - position.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
}

export type WaiterMotion = { walking: boolean; distance: number };
/** The waiter: `carry-*` while the tray holds food; the walk cycle steps by distance travelled. */
export function waiterActor(position: Point, facing: WorldFacing | Facing, tray: readonly string[], motion: WaiterMotion): Actor {
  const carry = tray.length > 0 ? "carry-" : "";
  return { id: "player", sprite: "char/player", at: [position.x, position.y], facing: facing in FACING ? pixelFacing(facing as WorldFacing) : facing as Facing, action: `${carry}${motion.walking ? "walk" : "idle"}`, distance: motion.distance };
}

/** At most this many dishes are drawn on the waiter's tray (the tray itself holds more). */
export const MAX_TRAY_ITEMS = 3;
export type TraySlot = readonly [dx: number, dy: number];
/**
 * Where carried dishes sit, in art pixels from the waiter's feet to each dish's bottom-centre, for
 * one, two and three dishes, nearest first. In the waiter's 32×64 frame the feet are at [16, 62]:
 * facing down the board's top face spans rows 41–44 between thumbs at columns 1–5 and 26–29; in
 * profile it reaches forward over columns 12–28 with its top on row 42 (dishes further back stand a
 * row or two higher so they show over the near one); facing up it is behind the
 * body with only its ends showing, so the dishes go to the ends where they can peep out.
 * `left` mirrors `right` (dishes are 11 wide on a frame symmetric about x = 16: dx → −1 − dx).
 */
export const TRAY_SLOTS: Record<Exclude<Facing, "left">, readonly (readonly TraySlot[])[]> = {
  down: [[[0, -18]], [[-5, -18], [5, -19]], [[0, -18], [-6, -21], [5, -21]]],
  right: [[[6, -20]], [[3, -20], [8, -22]], [[6, -20], [2, -22], [9, -22]]],
  up: [[[9, -22]], [[9, -22], [-10, -22]], [[9, -22], [-10, -22], [0, -22]]],
};

/**
 * Which foods show on the tray, nearest first: each different food once, in the order picked up,
 * then repeats, so a full tray still shows its variety. Unknown foods are skipped.
 */
export function trayDishes(tray: readonly string[], data: Pick<Content, "foods"> = defaultContent): string[] {
  const known = tray.filter(foodId => data.foods.some(food => food.id === foodId));
  const firsts = known.filter((foodId, index) => known.indexOf(foodId) === index);
  const repeats = known.filter((foodId, index) => known.indexOf(foodId) !== index);
  return [...firsts, ...repeats].slice(0, MAX_TRAY_ITEMS);
}

/** The slot for one of `count` dishes, mirrored for a waiter facing left. */
export function traySlot(facing: Facing, count: number, index: number): TraySlot {
  const [dx, dy] = TRAY_SLOTS[facing === "left" ? "right" : facing][Math.min(count, MAX_TRAY_ITEMS) - 1][index];
  return facing === "left" ? [-1 - dx, dy] : [dx, dy];
}

/**
 * The dishes on the waiter's tray as actors (`food/tray-<foodId>`) that ride with the waiter: the
 * same position, action and walk distance, so they step on the same frames and bob with the
 * body. Drawn just in front of the waiter, or just behind when the waiter faces away and the
 * body hides the tray; further-back dishes draw first. Empty unless the waiter is carrying.
 */
export function trayActors(waiter: Actor, tray: readonly string[], data: Pick<Content, "foods"> = defaultContent): Actor[] {
  if (!waiter.action?.startsWith("carry-")) return [];
  const dishes = trayDishes(tray, data), facing = waiter.facing ?? "down";
  return dishes.map((foodId, index): Actor => {
    const offset = traySlot(facing, dishes.length, index);
    // One to two art pixels from the waiter's own sort point, ordered by how far back the dish sits.
    const depth = (offset[1] + 2 * TILE) / (2 * TILE);
    const sortY = waiter.at[1] + (facing === "up" ? depth - 2 : 1 + depth) / TILE;
    return { id: `tray-${index}`, sprite: `food/tray-${foodId}`, at: waiter.at, facing: "down", action: waiter.action, distance: waiter.distance, phase: waiter.phase, offset, sortY };
  });
}

/** The waiter followed by the dishes on the tray. */
export function waiterActors(position: Point, facing: WorldFacing | Facing, tray: readonly string[], motion: WaiterMotion, data: Pick<Content, "foods"> = defaultContent): Actor[] {
  const waiter = waiterActor(position, facing, tray, motion);
  return [waiter, ...trayActors(waiter, tray, data)];
}

type TableNumber = 1 | 2 | 3 | 4;
const isTable = (table: number): table is TableNumber => table >= 1 && table <= CAFE_TABLES.length;

/** Everyone the presence rules say is inside, seated at their table, plus the cook. */
export function cafeCast(game: Pick<GameState, "day" | "customers" | "world">, data: Pick<Content, "orders" | "characters"> = defaultContent): Actor[] {
  const presence = restaurantPresence(game, restoreLife(game.world?.life), data).tables;
  const seated = presence.filter(entry => entry.inside && isTable(entry.table))
    .map(entry => seatedActor(`customer-${entry.table}`, entry.characterId, entry.table as TableNumber, entry.table - 1));
  return [COOK, ...seated];
}

/**
 * Where served dishes sit on each table, in art pixels from the table's anchor (the top spans
 * dy −49…−27), nearest the customer first. The table's own condiments keep their places.
 */
export const DISH_SLOTS: Record<TableNumber, readonly (readonly [dx: number, dy: number])[]> = {
  1: [[-15, -29], [3, -28], [-12, -41]],
  2: [[-2, -28], [-14, -40], [9, -40]],
  3: [[12, -29], [-4, -28], [12, -41]],
  4: [[0, -40], [-4, -28], [12, -29]],
};
/** At most this many dishes are drawn on one table. */
export const MAX_DISHES = 3;
/** Leftover servings for a customer who has paid and is finishing up. */
const EATEN = new Set(["bun", "youtiao", "dumpling"]);

/** Served food on the tables: each delivered order's servings, as run-time props. */
export function cafeDishes(game: Pick<GameState, "day" | "customers" | "world">, data: Pick<Content, "orders" | "characters" | "foods"> = defaultContent): Prop[] {
  const presence = restaurantPresence(game, restoreLife(game.world?.life), data).tables;
  return presence.flatMap(entry => {
    if (!entry.mealVisible || !isTable(entry.table)) return [];
    const order = data.orders.find(order => order.id === entry.orderId);
    if (!order) return [];
    const servings = order.items.flatMap(item => data.foods.some(food => food.id === item.foodId) ? Array.from({ length: Math.max(1, item.quantity) }, () => item.foodId) : []).slice(0, MAX_DISHES);
    const table = CAFE_TABLES[entry.table - 1];
    const slots = DISH_SLOTS[entry.table];
    const finished = entry.phase === "served";
    return servings.map((foodId, index): Prop => {
      const [dx, dy] = slots[index];
      return {
        id: `dish/table-${entry.table}-${index}`,
        sprite: `food/${finished && EATEN.has(foodId) ? `${foodId}-eaten` : foodId}`,
        at: [table.at[0] + dx / TILE, table.at[1] + dy / TILE],
        solid: false,
        // Sorted with the table (two art pixels in front of it); back dishes draw before front ones.
        sortY: table.at[1] + (dy < -34 ? 1 : 2) / TILE,
      };
    });
  });
}

/**
 * A tap on the floor goes where it was tapped; a tap on furniture goes to the nearest spot beside it
 * where the waiter can stand, so tapping a table walks to that table. Null when nothing is near.
 */
export function tapDestination(map: WorldMapDefinition, point: Vec, reach = 1.6): Point | null {
  const tapped = { x: point[0], y: point[1] };
  if (canStand(map, tapped)) return tapped;
  let best: Point | null = null, bestDistance = Infinity;
  for (let radius = .125; radius <= reach; radius += .125) {
    const steps = Math.max(8, Math.round(radius * 32));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const candidate = { x: tapped.x + Math.cos(angle) * radius, y: tapped.y + Math.sin(angle) * radius };
      if (radius < bestDistance && canStand(map, candidate)) { best = candidate; bestDistance = radius; }
    }
    if (best) return best;
  }
  return null;
}
