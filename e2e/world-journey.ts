import { language } from "../src/language";
import { expect, type Page } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { GameState } from "../src/contracts";
import type { Point, WorldMapDefinition } from "../src/world/schema";
import { restaurantMap } from "../src/world/restaurant";
import { findPath, canStand, canWalk, movePlayer } from "../src/world/geometry";
import { explorationCamera, project } from "../src/world/camera";
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
  const read = () => page.evaluate(async languageId => {
    const hooks = (window as unknown as {__TEST__?: {getState: () => GameState}}).__TEST__;
    if (hooks) return hooks.getState();
    const suffix = languageId === "zh-CN" ? "" : `:${languageId}`;
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
  }, language.id);
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
    const shade = sites[game.neighbourhood!.garden.shade];
    const obstacles = [...(!game.neighbourhood!.garden.restored ? [{id:"crate-a",rect:{x:18,y:25,width:1.2,height:1.2}},{id:"crate-b",rect:{x:20.5,y:27,width:1.4,height:1.2}}] : []), ...[0,1.8].map(side=>({id:`shade-${side}`,rect:{x:shade.x-.3+side,y:shade.y-.4,width:.15,height:.15}}))];
    return {...map, anchors:[...map.anchors,...pots.map(({id,position}) => ({id:`rooftop.pot.${id}`,position:{x:position.x+.7,y:position.y+2.1},radius:1.6,featureId:"garden" as const,interactionId:`garden.${id}`}))], colliders:[...map.colliders,...obstacles,...pots.map(({id,position})=>({id,rect:{...position,width:1.4,height:1.4}}))]};
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
  const deadline = Date.now() + 75_000;
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
    const camera = explorationCamera(map.bounds, world.position, Math.ceil(box.width/2), Math.ceil(box.height/2), 0, 0, surfaceHeight(map.id, world.position));
    const screen = project(point, camera, surfaceHeight(map.id, point));
    const position = { x: screen.x*box.width/camera.width, y: screen.y*box.height/camera.height };
    const clear = await canvas.evaluate((element, position) => {
      const bounds = element.getBoundingClientRect();
      return document.elementFromPoint(bounds.left+position.x,bounds.top+position.y) === element;
    }, position);
    if (map.id === "residential-stairs") {
      const choices = [
        {x:-1,y:-1,keys:["ArrowUp"]},{x:1,y:1,keys:["ArrowDown"]},{x:1,y:-1,keys:["ArrowRight"]},{x:-1,y:1,keys:["ArrowLeft"]},
        {x:1,y:0,keys:["ArrowDown","ArrowRight"]},{x:-1,y:0,keys:["ArrowUp","ArrowLeft"]},{x:0,y:-1,keys:["ArrowUp","ArrowRight"]},{x:0,y:1,keys:["ArrowDown","ArrowLeft"]},
      ];
      const candidates = choices.map(choice => {
        const length=Math.hypot(choice.x,choice.y);
        const position=movePlayer(map,world.position,{x:choice.x/length*.35,y:choice.y/length*.35});
        return {choice,position,distance:Math.hypot(position.x-point.x,position.y-point.y)};
      }).filter(candidate=>canWalk(map,world.position,candidate.position)&&Math.hypot(candidate.position.x-world.position.x,candidate.position.y-world.position.y)>.05).sort((a,b)=>a.distance-b.distance);
      expect(candidates.length, `keyboard stair route from ${JSON.stringify(world.position)}`).toBeGreaterThan(0);
      const directions = candidates[0].choice.keys;
      await page.getByTestId("world-viewport").focus();
      for (const key of directions) await page.keyboard.down(key);
      try { await page.waitForTimeout(Math.min(180,Math.max(75,distance/5*1000))); }
      finally { for (const key of directions) await page.keyboard.up(key); }
      await expect.poll(async () => (await savedGame(page)).world!.position, {timeout:2_000,message:`stairs ${JSON.stringify({from:world.position,to:point,directions,route})}`}).not.toEqual(world.position);
      continue;
    }
    if (!clear) {
      // A nearby target card can cover the ground; use the visible movement pad.
      const controls = [{name:"向前走",x:-1,y:-1},{name:"向后走",x:1,y:1},{name:"向右走",x:1,y:-1},{name:"向左走",x:-1,y:1}];
      const candidates = controls.map(control => {
        const position = movePlayer(map, world.position, {x:control.x*.5/Math.SQRT2,y:control.y*.5/Math.SQRT2});
        const path = findPath(map,position,destination);
        let previous=position, distance=0;
        for (const waypoint of path) {distance+=Math.hypot(waypoint.x-previous.x,waypoint.y-previous.y);previous=waypoint;}
        return {control,position,distance:path.length?distance:Infinity};
      }).filter(candidate=>Number.isFinite(candidate.distance) && canWalk(map,world.position,candidate.position) && Math.hypot(candidate.position.x-world.position.x,candidate.position.y-world.position.y)>.1).sort((a,b)=>a.distance-b.distance);
      expect(candidates.length, `movement pad route in ${map.id}`).toBeGreaterThan(0);
      const direction = candidates[0].control.name;
      const pad = page.getByRole("button", {name:direction,exact:true});
      await pad.focus();
      await pad.press("Enter");
      await expect.poll(async () => (await savedGame(page)).world!.position, {timeout:2_000}).not.toEqual(world.position);
      continue;
    }
    if (page.context().browser()?.browserType().name() === "chromium" && await page.evaluate(() => navigator.maxTouchPoints > 0)) await canvas.tap({ position });
    else await canvas.click({ position });
    await expect.poll(async () => {
      const after = (await savedGame(page)).world!;
      return after.mapId !== world.mapId || Math.hypot(after.position.x-point.x, after.position.y-point.y) < .28;
    }, { timeout: 8_000, message: `walk ${map.id} to ${JSON.stringify(point)}` }).toBe(true);
  }
  throw new Error(`World walk exceeded 75 seconds in ${map.id}`);
}
export async function interactAt(page: Page, anchorId: string) {
  await closeActivity(page);
  const game = await savedGame(page);
  const world = game.world!;
  const anchor = currentMap(game).anchors.find(anchor => anchor.id === anchorId);
  expect(anchor, `authored anchor ${anchorId} in ${world.mapId}`).toBeDefined();
  const map = currentMap(game);
  const approaches = [anchor!.position, ...[.5,.9,1.2].filter(radius=>radius<anchor!.radius).flatMap(radius=>Array.from({length:8},(_,index)=>({x:anchor!.position.x+Math.cos(index*Math.PI/4)*radius,y:anchor!.position.y+Math.sin(index*Math.PI/4)*radius})))];
  const approach = approaches.find(point => canStand(map,point) && findPath(map,world.position,point).length>0);
  expect(approach, `reachable approach to ${anchorId}`).toBeDefined();
  await walkTo(page, approach!);
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
