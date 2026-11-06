import { test, expect, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { playOpening } from '../../../e2e/opening';
import type { GameState } from '../../contracts';

async function savedGame(page: Page): Promise<GameState> {
  return page.evaluate(async () => {
    const pending = localStorage.getItem('junyan-waiter-pending-v1');
    if (pending) return JSON.parse(pending);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('junyan-waiter', 1);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const value = await new Promise<GameState>((resolve, reject) => {
      const request = db.transaction('saves').objectStore('saves').get('v1');
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    db.close(); return value;
  });
}
async function walkTo(page: Page, target: { x: number; y: number }, touch: boolean, exitingMap?: string) {
  for (let i = 0; i < 240; i++) {
    const save = await savedGame(page), mapId = save.world?.mapId ?? 'restaurant';
    if (exitingMap && mapId !== exitingMap) return;
    const step = await page.evaluate(async ({ save, target }) => {
      const dynamicUrl = '/src/world/dynamic.ts', stateUrl = '/src/world/state.ts', geometryUrl = '/src/world/geometry.ts', cameraUrl = '/src/world/camera.ts';
      const { mapsForNeighbourhood } = await import(dynamicUrl), { restoreWorld } = await import(stateUrl);
      const { findPath } = await import(geometryUrl), { cameraForMap, project } = await import(cameraUrl);
      const maps = mapsForNeighbourhood(save.neighbourhood), world = restoreWorld(save.world, maps, save.neighbourhood!.location), map = maps[world.mapId];
      if (Math.hypot(world.position.x - target.x, world.position.y - target.y) < .19) return { done: true };
      const route = findPath(map, world.position, target);
      if (!route.length) return { error: `No real path on ${map.id} to ${JSON.stringify(target)}` };
      const next = route[0], dx = next.x - world.position.x, dy = next.y - world.position.y;
      const amount = Math.min(1, 2.5 / Math.hypot(dx, dy));
      const point = { x: world.position.x + dx * amount, y: world.position.y + dy * amount };
      const canvas = document.querySelector<HTMLCanvasElement>('.connected-world canvas')!, rect = canvas.getBoundingClientRect();
      const camera = cameraForMap(map.bounds, world.position, canvas.width, canvas.height, rect.width < 600 ? 11 : 15), pixel = project(point, camera);
      return { point, x: rect.left + pixel.x / canvas.width * rect.width, y: rect.top + pixel.y / canvas.height * rect.height };
    }, { save, target });
    if (step.done) return;
    if (step.error) throw Error(step.error);
    if (touch) await page.touchscreen.tap(step.x!, step.y!); else await page.mouse.click(step.x!, step.y!);
    await expect.poll(async () => {
      const after = await savedGame(page);
      return after.world?.mapId !== mapId || Math.hypot(after.world!.position.x - step.point!.x, after.world!.position.y - step.point!.y) < .24;
    }, { timeout: 12000 }).toBe(true);
  }
  throw Error('Real-input route did not finish');
}
async function exitTo(page: Page, mapId: string, touch: boolean) {
  const save = await savedGame(page), from = save.world!.mapId;
  const point = await page.evaluate(async ({ save, mapId }) => {
    const url = '/src/world/dynamic.ts', { mapsForNeighbourhood } = await import(url);
    const map = mapsForNeighbourhood(save.neighbourhood)[save.world!.mapId];
    const exit = map.exits.find((item: { targetMapId: string }) => item.targetMapId === mapId);
    if (!exit) throw Error(`Missing real exit to ${mapId}`);
    return { x: exit.rect.x + exit.rect.width / 2, y: exit.rect.y + exit.rect.height / 2 };
  }, { save, mapId });
  await walkTo(page, point, touch, from);
  await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map', mapId);
}

test('ordinary traversal reaches unvoiced residents, reactions and saved discoveries', async ({ page }, info) => {
  const out = `output/verification/0087/production/${info.project.name}`;
  await mkdir(out, { recursive: true });
  const errors: string[] = [], checkpoints: unknown[] = [], touch = info.project.name === 'phone';
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/?seed=42'); await playOpening(page);
  await page.getByRole('button', { name: '开门迎客' }).click();
  expect(await page.evaluate(() => '__TEST__' in window)).toBe(false);
  expect((await savedGame(page)).customers.every(customer => customer.phase === 'seated')).toBe(true);
  const visits = [
    { mapId: 'town', ids: [] },
    { mapId: 'courtyard', ids: ['resident-laundry-neighbour'] },
    { mapId: 'park', ids: ['resident-reader', 'resident-groundskeeper'] },
    { mapId: 'riverbank', ids: ['resident-river-walker'] },
    { mapId: 'town', ids: ['resident-courier'] },
  ];
  try {
    for (const visit of visits) {
      await exitTo(page, visit.mapId, touch);
      for (const id of visit.ids) {
        const save = await savedGame(page);
        const hook = await page.evaluate(async ({ save, id }) => {
          const url = '/src/world/dynamic.ts', { mapsForNeighbourhood } = await import(url);
          return mapsForNeighbourhood(save.neighbourhood)[save.world!.mapId].npcHooks.find((hook: { characterId: string }) => hook.characterId === id);
        }, { save, id });
        expect(hook, `Missing authored production hook for ${id}`).toBeTruthy();
        await walkTo(page, hook.position, touch);
        const before = await savedGame(page);
        expect(before.world?.life?.elapsedMs, 'Production life clock must checkpoint actual play time').toBeGreaterThan(0);
        const live = await page.evaluate(async save => {
          const dynamicUrl = '/src/world/dynamic.ts', bridgeUrl = '/src/world/life-bridge.ts', lifeUrl = '/src/world/life/index.ts';
          const { mapsForNeighbourhood } = await import(dynamicUrl), { actorsFor } = await import(bridgeUrl), { restaurantPresence } = await import(lifeUrl);
          const map = mapsForNeighbourhood(save.neighbourhood)[save.world!.mapId], world = save.world!;
          const actors = actorsFor(map, save, world, world.life?.elapsedMs ?? 0, false);
          const inside = restaurantPresence(save, world.life).insideCharacterIds;
          return { actors, duplicatedInside: actors.filter((actor: { characterId: string }) => inside.includes(actor.characterId)) };
        }, before);
        expect(live.duplicatedInside).toEqual([]);
        await page.screenshot({ path: `${out}/${id}-before.png` });
        const action = page.locator(`[data-life-action="${hook.id}/watch"]`);
        await action.waitFor({ state: 'visible', timeout: 90000 });
        const box = await action.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44); expect(box!.width).toBeGreaterThanOrEqual(44);
        await action.click();
        await expect.poll(async () => (await savedGame(page)).world!.life!.reactions.some(reaction => reaction.targetId === hook.id)).toBe(true);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${out}/${id}-after.png` });
        checkpoints.push({ id, before, after: await savedGame(page), actors: live.actors });
      }
    }
    const approach = await page.evaluate(async save => {
      const dynamicUrl = '/src/world/dynamic.ts', geometryUrl = '/src/world/geometry.ts', lifeUrl = '/src/world/life/index.ts';
      const { mapsForNeighbourhood } = await import(dynamicUrl), { canStand, findPath } = await import(geometryUrl), { compileLife, navigationFor, nearbyLife } = await import(lifeUrl);
      const map = mapsForNeighbourhood(save.neighbourhood)[save.world!.mapId], landmark = map.landmarks.find((item: { id: string }) => item.id === 'riverbank.fishing-jetty');
      if (!landmark) throw Error('Missing authored fishing landmark');
      const navigation = navigationFor(map), plan = compileLife(map, navigation);
      for (let radius = .5; radius <= 1.75; radius += .25) for (let angle = 0; angle < 16; angle++) {
        const point = { x: landmark.position.x + Math.cos(angle * Math.PI / 8) * radius, y: landmark.position.y + Math.sin(angle * Math.PI / 8) * radius };
        if (canStand(map, point) && findPath(map, save.world!.position, point).length && nearbyLife(plan, [], point, navigation).some((option: { targetId: string }) => option.targetId === landmark.id)) return point;
      }
      throw Error('No reachable physical inspect approach');
    }, await savedGame(page));
    await walkTo(page, approach, touch);
    const inspect = page.locator('[data-life-action="riverbank.fishing-jetty/inspect"]');
    await inspect.waitFor({ state: 'visible' }); await inspect.click();
    await expect.poll(async () => (await savedGame(page)).world!.life!.discoveries.some(item => item.landmarkId === 'riverbank.fishing-jetty')).toBe(true);
    await page.screenshot({ path: `${out}/physical-discovery.png` });
    const before = await savedGame(page);
    await page.reload(); await page.waitForTimeout(1000);
    const after = await savedGame(page);
    expect(after.world!.life!.discoveries.length).toBeGreaterThan(0);
    expect(after.world!.life!.discoveries).toEqual(before.world!.life!.discoveries);
    await inspect.waitFor({ state: 'visible' }); await inspect.click();
    expect((await savedGame(page)).world!.life!.discoveries.filter(item => item.landmarkId === 'riverbank.fishing-jetty')).toHaveLength(1);
    expect(after.customers.every(customer => customer.phase === 'seated')).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await page.screenshot({ path: `${out}/last-frame.png` });
    await writeFile(`${out}/evidence.json`, JSON.stringify({ head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checkpoints, errors,
      method: 'Ordinary opening and real pointer/touch travel; source/save reads only; no injected save, actor spawn or internal dispatch.' }, null, 2));
  }
});
