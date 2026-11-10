import { describe, expect, it } from "vitest";
import cafe, { CAFE_TABLES } from "../../pixel/scenes/cafe.ts";
import { compileScene, createAtlas, type Rect } from "../../pixel/engine/index.ts";
import { sprites } from "../../pixel/registry.ts";
import { content } from "../../content";
import { createGame } from "../../game";
import { canStand, findPath, nearbyAnchors } from "../geometry";
import { createWorld, reduceWorld } from "../state";
import { worldMaps } from "../registry";
import { restaurantMap } from "../restaurant";
import { releaseServedCustomer, restoreLife } from "../life";
import { cafeCast, cafeDishes, cafePhase, liveCafe, MAX_DISHES, serviceFacing, tapDestination, trayActors, trayDishes, traySlot, TRAY_SLOTS, waiterActor, waiterActors } from "./cafe";
import { TILE } from "../../pixel/kit/index.ts";
import { cardinalDirections, isPixelMap } from "./maps";

const compiled = compileScene(liveCafe, createAtlas(sprites));
const rect = (r: Rect) => r.map(v => Math.round(v * 1e4) / 1e4).join(",");

describe("the restaurant map is the pixel cafe's room", () => {
  it("shares the scene's size, walkable floor and every collider", () => {
    expect(restaurantMap.bounds).toEqual({ width: cafe.size[0], height: cafe.size[1] });
    const [x, y, width, height] = compiled.walkable;
    expect(restaurantMap.walkable).toEqual([{ x, y, width, height }]);
    const fromMap = restaurantMap.colliders.map(({ rect: r }) => rect([r.x, r.y, r.width, r.height])).sort();
    // On a mismatch: node src/pixel/tools/colliders.ts cafe --out src/world/pixel/cafe-colliders.json
    expect(fromMap).toEqual(compiled.colliders.map(rect).sort());
    // The map's table props (stable ids) stand on the scene's tables.
    ["table-5-9", "table-17-9", "table-5-14", "table-17-14"].forEach((id, index) => {
      const prop = restaurantMap.props.find(p => p.id === id)!;
      const table = restaurantMap.colliders.find(c => c.id === `table-${index + 1}`)!.rect;
      expect(rect([prop.position.x, prop.position.y, prop.width, prop.height])).toBe(rect([table.x, table.y, table.width, table.height]));
    });
  });

  it("puts the kitchen at the pickup mark, the door at the street door and a service spot by each table", () => {
    const kitchen = restaurantMap.anchors.find(a => a.id === "restaurant.kitchen")!;
    expect([kitchen.position.x, kitchen.position.y]).toEqual(compiled.marks.pickup.at);
    const door = compiled.marks.door.at, exit = restaurantMap.exits.find(e => e.id === "to-town")!;
    expect(Math.abs(exit.rect.x + exit.rect.width / 2 - door[0])).toBeLessThan(.01);
    expect(exit.rect.y + exit.rect.height).toBeCloseTo(compiled.walkable[1] + compiled.walkable[3]);
    for (const t of CAFE_TABLES) {
      const anchor = restaurantMap.anchors.find(a => a.id === `restaurant.table-${t.table}`)!;
      // Within reach of the middle of the table's footprint.
      expect(Math.hypot(anchor.position.x - t.at[0], anchor.position.y - (t.at[1] - .45))).toBeLessThan(anchor.radius);
    }
  });

  it("lets the waiter reach every anchor and the door from the entrance, never the kitchen floor", () => {
    const spawn = restaurantMap.defaultSpawn;
    expect(canStand(restaurantMap, spawn)).toBe(true);
    for (const anchor of restaurantMap.anchors) {
      expect(canStand(restaurantMap, anchor.position)).toBe(true);
      expect(findPath(restaurantMap, spawn, anchor.position).length).toBeGreaterThan(0);
      // Each service spot selects its own target first.
      expect(nearbyAnchors(restaurantMap, anchor.position)[0].id).toBe(anchor.id);
    }
    const exit = restaurantMap.exits[0].rect;
    expect(findPath(restaurantMap, spawn, { x: exit.x + exit.width / 2, y: exit.y + exit.height / 2 }).length).toBeGreaterThan(0);
    expect(findPath(restaurantMap, spawn, { x: 15, y: 5.5 })).toEqual([]);
  });

  it("walks out of the door into town and back in at the entrance", () => {
    let world = createWorld(worldMaps);
    expect(world.mapId).toBe("restaurant");
    const exit = restaurantMap.exits[0].rect;
    for (const step of findPath(restaurantMap, world.position, { x: exit.x + exit.width / 2, y: exit.y + exit.height / 2 })) {
      world = reduceWorld(world, { type: "world-move", position: step }, worldMaps);
      if (world.mapId !== "restaurant") break;
    }
    expect(world.mapId).toBe("town");
  });

  it("walks the screen's axes on pixel maps", () => {
    expect(isPixelMap("restaurant")).toBe(true);
    expect(isPixelMap("town")).toBe(false);
    expect(cardinalDirections.ArrowUp).toEqual({ x: 0, y: -1 });
    expect(cardinalDirections.d).toEqual({ x: 1, y: 0 });
  });
});

describe("cafe cast and tables from game state", () => {
  it("seats each customer at their table with the right sprite and keeps the cook in the kitchen", () => {
    const game = createGame(content, 42);
    const cast = cafeCast(game);
    expect(cast[0]).toMatchObject({ id: "cook", sprite: "char/cook", action: "work" });
    for (const customer of game.customers) {
      const order = content.orders.find(o => o.id === customer.orderId)!;
      const character = content.characters.find(c => c.name === order.customer)!;
      const actor = cast.find(a => a.id === `customer-${customer.table}`)!;
      expect(actor).toMatchObject({ sprite: `char/${character.id}`, action: "sit", at: CAFE_TABLES[customer.table - 1].seat.at });
    }
    expect(cafeDishes(game)).toEqual([]);
  });

  it("puts served food on its table and lets a released customer leave", () => {
    let game = createGame(content, 42);
    game = { ...game, customers: game.customers.map(c => c.table === 3 ? { ...c, phase: "checkout" } : c.table === 4 ? { ...c, phase: "served" } : c) };
    const dishes = cafeDishes(game);
    const order3 = content.orders.find(o => o.id === game.customers.find(c => c.table === 3)!.orderId)!;
    const table3 = dishes.filter(d => d.id?.startsWith("dish/table-3-"));
    expect(table3.map(d => d.sprite)).toEqual(order3.items.flatMap(i => Array(i.quantity).fill(`food/${i.foodId}`)).slice(0, MAX_DISHES));
    for (const dish of table3) {
      expect(dish.sortY).toBeGreaterThan(CAFE_TABLES[2].at[1]);
      expect(Math.abs(dish.at[0] - CAFE_TABLES[2].at[0])).toBeLessThan(1);
    }
    expect(dishes.some(d => d.id?.startsWith("dish/table-4-"))).toBe(true);
    const life = releaseServedCustomer(restoreLife(undefined), game, 4);
    const released = { ...game, world: { ...createWorld(worldMaps), life } };
    expect(cafeCast(released).some(a => a.id === "customer-4")).toBe(false);
  });

  it("shows what is really on the tray: distinct foods first, at most three, unknown foods skipped", () => {
    expect(trayDishes([])).toEqual([]);
    expect(trayDishes(["milk"])).toEqual(["milk"]);
    expect(trayDishes(["bun", "bun", "milk"])).toEqual(["bun", "milk", "bun"]);
    expect(trayDishes(["bun", "bun", "bun", "milk", "egg", "egg"])).toEqual(["bun", "milk", "egg"]);
    expect(trayDishes(["teapot", "egg"])).toEqual(["egg"]);
    // Every food the game serves has a tray sprite for each carrying action, framed like the waiter's.
    const atlas = createAtlas(sprites);
    for (const food of content.foods) for (const action of ["carry-idle", "carry-walk"]) {
      const dish = atlas.get(`food/tray-${food.id}/${action}-down`), waiter = atlas.get(`char/player/${action}-down`);
      expect([dish.frameCount, dish.fps]).toEqual([waiter.frameCount, waiter.fps]);
    }
  });

  it("puts the tray's dishes on the waiter, riding the same frames, in front unless facing away", () => {
    const at = { x: 3, y: 4 };
    expect(waiterActors(at, "south", [], { walking: true, distance: 1 })).toHaveLength(1);
    const [waiter, ...dishes] = waiterActors(at, "south", ["bun", "egg", "porridge", "milk"], { walking: true, distance: 1.2 });
    expect(dishes.map(d => d.sprite)).toEqual(["food/tray-bun", "food/tray-egg", "food/tray-porridge"]);
    for (const dish of dishes) {
      expect(dish).toMatchObject({ at: waiter.at, action: "carry-walk", distance: 1.2, facing: "down" });
      // Just in front of the waiter: within two art pixels.
      expect(dish.sortY! - 4).toBeGreaterThan(0);
      expect(dish.sortY! - 4).toBeLessThan(2 / TILE);
    }
    // The nearest dish (first picked) sits lowest on the board and draws over the two behind it.
    expect(dishes[0].offset![1]).toBeGreaterThan(dishes[1].offset![1]);
    expect(dishes[0].sortY!).toBeGreaterThan(dishes[1].sortY!);
    expect(dishes.map(d => d.offset)).toEqual(TRAY_SLOTS.down[2]);
    // Facing away, the body hides the tray, so the dishes draw behind the waiter.
    for (const dish of trayActors(waiterActor(at, "north", ["bun", "egg"], { walking: false, distance: 0 }), ["bun", "egg"])) {
      expect(dish.sortY!).toBeLessThan(4);
      expect(dish.sortY!).toBeGreaterThan(4 - 2 / TILE);
    }
    // Left is the mirror of right.
    for (const count of [1, 2, 3]) for (let i = 0; i < count; i++) {
      const [rx, ry] = traySlot("right", count, i), [lx, ly] = traySlot("left", count, i);
      expect([lx, ly]).toEqual([-1 - rx, ry]);
    }
    // Every slot keeps the dish (11 wide, centred on dx) within the waiter's 32-wide frame and on the board's rows.
    for (const slots of Object.values(TRAY_SLOTS)) for (const [count, layout] of slots.entries()) {
      expect(layout).toHaveLength(count + 1);
      for (const [dx, dy] of layout) {
        expect(16 + dx - 5).toBeGreaterThanOrEqual(0);
        expect(16 + dx + 5).toBeLessThanOrEqual(31);
        expect(62 + dy).toBeGreaterThanOrEqual(40);
        expect(62 + dy).toBeLessThanOrEqual(44);
      }
    }
    // Not carrying, nothing rides along.
    expect(trayActors(waiterActor(at, "south", [], { walking: false, distance: 0 }), ["bun"])).toEqual([]);
  });

  it("carries a tray while the tray holds food and maps the service light", () => {
    expect(waiterActor({ x: 3, y: 4 }, "west", [], { walking: true, distance: 2 })).toMatchObject({ sprite: "char/player", facing: "left", action: "walk", distance: 2, at: [3, 4] });
    expect(waiterActor({ x: 3, y: 4 }, "north", ["bun"], { walking: false, distance: 0 }).action).toBe("carry-idle");
    expect(waiterActor({ x: 3, y: 4 }, "south", ["bun"], { walking: true, distance: 0 }).action).toBe("carry-walk");
    expect(cafePhase("noon")).toBe("midday");
    // Serving, the waiter turns to the table or the pass from their service spot.
    const spot = (id: string) => restaurantMap.anchors.find(a => a.id === id)!.position;
    expect(serviceFacing(spot("restaurant.table-1"), "restaurant.table-1")).toBe("up");
    expect(serviceFacing(spot("restaurant.table-2"), "restaurant.table-2")).toBe("left");
    expect(serviceFacing(spot("restaurant.table-4"), "restaurant.table-4")).toBe("right");
    expect(serviceFacing(spot("restaurant.kitchen"), "restaurant.kitchen")).toBe("up");
    expect(serviceFacing(spot("restaurant.kitchen"), null)).toBeNull();
    expect(cafePhase("night")).toBe("night");
  });

  it("drops the demo cast and the previous customers' leftovers from the live scene only", () => {
    expect(liveCafe.actors).toBeUndefined();
    expect(liveCafe.props!.some(p => p.id?.startsWith("remains/"))).toBe(false);
    expect(cafe.props!.some(p => p.id?.startsWith("remains/"))).toBe(true);
  });

  it("sends a tap on furniture to the nearest spot beside it", () => {
    expect(tapDestination(restaurantMap, [6, 9])).toEqual({ x: 6, y: 9 });
    const beside = tapDestination(restaurantMap, [3.4, 5.6])!;
    expect(canStand(restaurantMap, beside)).toBe(true);
    expect(Math.hypot(beside.x - 3.4, beside.y - 5.6)).toBeLessThan(1);
    expect(tapDestination(restaurantMap, [5, .5])).toBeNull();
  });
});
