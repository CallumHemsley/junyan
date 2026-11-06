import { expect, type Page } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { GameState } from "../src/contracts";
import type { Point, WorldMapDefinition } from "../src/world/schema";
import { restaurantMap } from "../src/world/restaurant";
import { findPath } from "../src/world/geometry";
import { cameraForMap, project } from "../src/world/camera";
import { courtyardForCats } from "../src/world/maps/courtyard/habitat";
import { furnitureColliders } from "../src/features/apartment/world";
import { surfaceHeight } from "../src/world/maps/residential/elevation";

const maps: Record<string, WorldMapDefinition> = { restaurant: restaurantMap };
function loadMaps(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) loadMaps(path);
    else if (entry.name.endsWith(".json")) {
      const map = JSON.parse(readFileSync(path, "utf8"));
      if (map.version === 1 && map.anchors && map.exits && map.bounds) maps[map.id] = map;
    }
  }
}
loadMaps(join(process.cwd(), "src/world/maps"));

// Reading the player's actual save is observation; all changes below use visible controls.
export async function savedGame(page: Page): Promise<GameState> {
  await expect(page.getByTestId("world-viewport")).toBeVisible();
  const read = () => page.evaluate(async () => {
    const hooks = (window as unknown as {__TEST__?: {getState: () => GameState}}).__TEST__;
    if (hooks) return hooks.getState();
    const suffix = document.documentElement.lang === "zh-CN" ? "" : `:${document.documentElement.lang}`;
    const pending = localStorage.getItem(`junyan-waiter-pending-v1${suffix}`);
    if (pending) return JSON.parse(pending);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      if (!db.objectStoreNames.contains("saves")) return null;
      return await new Promise<GameState>((resolve, reject) => {
        const request = db.transaction("saves").objectStore("saves").get(`v1${suffix}`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
  });
  let observed: GameState | null | undefined;
  await expect.poll(async () => { observed = await read(); return !!observed; }, {timeout:5_000}).toBe(true);
  const game = observed!;
  if (!game.world) {
    const mapId = (await page.getByTestId("world-viewport").getAttribute("data-map"))!;
    const spawn = maps[mapId].defaultSpawn;
    game.world = {version:1,mapId,position:{x:spawn.x,y:spawn.y},facing:spawn.facing,returnPositions:{},activeActivity:null,activeAnchorId:null};
  }
  return game;
}
function currentMap(game: GameState) {
  const map = maps[game.world!.mapId];
  if (map.id === "rooftop") {
    const sites = [{x:15,y:22},{x:24,y:22},{x:32,y:19},{x:15,y:29},{x:24,y:29},{x:31,y:12}];
    const pots = Object.entries(game.neighbourhood!.garden.plants).map(([id, plant]) => ({id,position:sites[plant.site]}));
    return {...map, anchors:[...map.anchors,...pots.map(({id,position}) => ({id:`rooftop.pot.${id}`,position:{x:position.x+.7,y:position.y+2.1},radius:1.6,featureId:"garden" as const,interactionId:`garden.${id}`}))], colliders:[...map.colliders,...pots.map(({id,position})=>({id,rect:{...position,width:1.4,height:1.4}}))]};
  }
  if (map.id === "courtyard") return courtyardForCats(map, game.neighbourhood!.cats, game.day);
  if (map.id === "apartment") return {...map,colliders:[...map.colliders,...furnitureColliders(game.neighbourhood!.apartment)]};
  return map;
}
export async function closeActivity(page: Page) {
  const close = page.getByRole("button", { name: "继续走走", exact: true });
  if (await close.isVisible()) {
    await close.click();
    await expect(page.locator(".world-context")).toHaveCount(0);
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  }
}
export async function walkTo(page: Page, destination: Point) {
  await closeActivity(page);
  const game = await savedGame(page);
  const initial = game.world!;
  const map = currentMap(game);
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const world = (await savedGame(page)).world!;
    if (world.mapId !== initial.mapId || Math.hypot(world.position.x-destination.x, world.position.y-destination.y) < .28) return;
    const route = findPath(map, world.position, destination);
    expect(route.length, `walkable route in ${map.id} to ${JSON.stringify(destination)}`).toBeGreaterThan(0);
    const next = route[0];
    const distance = Math.hypot(next.x-world.position.x, next.y-world.position.y);
    const step = Math.min(1, 3 / distance);
    const point = { x: world.position.x+(next.x-world.position.x)*step, y: world.position.y+(next.y-world.position.y)*step };
    const canvas = page.locator(".connected-world canvas");
    const box = (await canvas.boundingBox())!;
    const camera = cameraForMap(map.bounds, world.position, Math.ceil(box.width/2), Math.ceil(box.height/2), box.width < 600 ? 11 : 15, 0, 0, surfaceHeight(map.id, world.position));
    const screen = project(point, camera, surfaceHeight(map.id, point));
    const position = { x: screen.x*box.width/camera.width, y: screen.y*box.height/camera.height };
    if (page.context().browser()?.browserType().name() === "chromium" && await page.evaluate(() => navigator.maxTouchPoints > 0)) await canvas.tap({ position });
    else await canvas.click({ position });
    await expect.poll(async () => {
      const after = (await savedGame(page)).world!;
      return after.mapId !== world.mapId || Math.hypot(after.position.x-point.x, after.position.y-point.y) < .28;
    }, { timeout: 8_000, message: `walk ${map.id} to ${JSON.stringify(point)}` }).toBe(true);
  }
  throw new Error(`World walk exceeded 45 seconds in ${map.id}`);
}
export async function interactAt(page: Page, anchorId: string) {
  await closeActivity(page);
  const game = await savedGame(page);
  const world = game.world!;
  const anchor = currentMap(game).anchors.find(anchor => anchor.id === anchorId);
  expect(anchor, `authored anchor ${anchorId} in ${world.mapId}`).toBeDefined();
  await walkTo(page, anchor!.position);
  const button = page.locator(`[data-world-anchor="${anchorId}"]`);
  for (let n=0; n<20 && !(await button.isVisible()); n++) {
    const cycle = page.locator(".world-target-switch");
    await expect(cycle).toBeVisible();
    await cycle.click();
  }
  await button.click({ timeout: 5_000 });
  await expect(page.locator(".world-context")).toBeVisible();
}
const destinations: Record<string,string> = { "家":"apartment", "院子":"courtyard", "修理间":"workshop", "屋顶花园":"rooftop", "早安小馆":"restaurant", cats:"courtyard", repairs:"workshop", garden:"rooftop" };
export async function visitWorld(page: Page, destination: string) {
  await closeActivity(page);
  const target = destinations[destination] ?? destination;
  for (let count=0; count<12; count++) {
    const world = (await savedGame(page)).world!;
    if (world.mapId === target) {
      const feature = {apartment:"apartment",courtyard:"cats",workshop:"repairs",rooftop:"garden"}[target];
      if (feature) await interactAt(page, currentMap(await savedGame(page)).anchors.find(anchor => anchor.featureId === feature)!.id);
      return;
    }
    const queue = [{ id: world.mapId, exits: [] as WorldMapDefinition["exits"] }];
    const seen = new Set([world.mapId]);
    let route: WorldMapDefinition["exits"] | undefined;
    while (queue.length) {
      const current = queue.shift()!;
      if (current.id === target) { route = current.exits; break; }
      for (const exit of maps[current.id].exits) if (!seen.has(exit.targetMapId)) {
        seen.add(exit.targetMapId); queue.push({id:exit.targetMapId, exits:[...current.exits, exit]});
      }
    }
    expect(route?.length, `door route ${world.mapId} to ${target}`).toBeGreaterThan(0);
    const exit = route![0];
    await walkTo(page, {x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2});
    await expect(page.getByTestId("world-viewport")).toHaveAttribute("data-map", exit.targetMapId, {timeout:8_000});
  }
  throw new Error(`Door route to ${target} exceeded 12 maps`);
}
