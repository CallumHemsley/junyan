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
      return !!after.world && (after.world.mapId !== mapId || Math.hypot(after.world.position.x - step.point!.x, after.world.position.y - step.point!.y) < .24);
    }, { timeout: 12000 }).toBe(true);
  }
  throw Error('Real-input route did not finish');
}
async function exitTo(page: Page, mapId: string, touch: boolean) {
  const save = await savedGame(page);
  const target = await page.evaluate(async ({ save, mapId }) => {
    const url = '/src/world/dynamic.ts', stateUrl = '/src/world/state.ts';
    const { mapsForNeighbourhood } = await import(url), { restoreWorld } = await import(stateUrl);
    const maps = mapsForNeighbourhood(save.neighbourhood), world = restoreWorld(save.world, maps, save.neighbourhood!.location), map = maps[world.mapId];
    const exit = map.exits.find((item: { targetMapId: string }) => item.targetMapId === mapId);
    if (!exit) throw Error(`Missing real exit to ${mapId}`);
    return { from: map.id, point: { x: exit.rect.x + exit.rect.width / 2, y: exit.rect.y + exit.rect.height / 2 } };
  }, { save, mapId });
  await walkTo(page, target.point, touch, target.from);
  await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map', mapId);
}

type LifeHint = {
  mapId: string; elapsedMs: number; player: { x: number; y: number };
  target?: { id: string; position: { x: number; y: number }; action?: string; activity?: string };
  options: { id: string; targetId: string; kind: string }[];
};
async function lifeHint(page: Page, targetId: string): Promise<LifeHint> {
  return page.evaluate(async ({ save, targetId }) => {
    const dynamicUrl = '/src/world/dynamic.ts', stateUrl = '/src/world/state.ts', bridgeUrl = '/src/world/life-bridge.ts', lifeUrl = '/src/world/life/index.ts';
    const { mapsForNeighbourhood } = await import(dynamicUrl), { restoreWorld } = await import(stateUrl);
    const { actorsFor, planFor, navigationFor } = await import(bridgeUrl), { nearbyLife } = await import(lifeUrl);
    const maps = mapsForNeighbourhood(save.neighbourhood), world = restoreWorld(save.world, maps, save.neighbourhood!.location), map = maps[world.mapId];
    const elapsedMs = world.life?.elapsedMs ?? 0, actors = actorsFor(map, save, world, elapsedMs, false);
    const target = actors.find((actor: { id: string }) => actor.id === targetId) ?? map.landmarks.find((item: { id: string }) => item.id === targetId);
    return { mapId: map.id, elapsedMs, player: world.position, target: target ? { id: target.id, position: target.position, action: target.action, activity: target.activity } : undefined,
      options: nearbyLife(planFor(map, save), actors, world.position, navigationFor(map)).map((option: { id: string; targetId: string; kind: string }) => ({ id: option.id, targetId: option.targetId, kind: option.kind })) };
  }, { save: await savedGame(page), targetId });
}
async function approachLife(page: Page, targetId: string, touch: boolean) {
  for (let i = 0; i < 10; i++) {
    const hint = await lifeHint(page, targetId);
    if (!hint.target) throw Error(`No production physical target ${targetId}`);
    if (Math.hypot(hint.target.position.x - hint.player.x, hint.target.position.y - hint.player.y) < 1.1 && Math.abs(hint.player.x - hint.target.position.x - hint.player.y + hint.target.position.y) > .95) return;
    const approach = await page.evaluate(async ({ save, target }) => {
      const dynamicUrl = '/src/world/dynamic.ts', geometryUrl = '/src/world/geometry.ts';
      const { mapsForNeighbourhood } = await import(dynamicUrl), { canStand, findPath } = await import(geometryUrl);
      const map = mapsForNeighbourhood(save.neighbourhood)[save.world!.mapId];
      const candidates = [-1, 1].map(sign => ({ x: target.x + sign * .74, y: target.y - sign * .74 }));
      return candidates.filter(point => canStand(map, point) && findPath(map, save.world!.position, point).length)
        .sort((a, b) => Math.hypot(a.x - save.world!.position.x, a.y - save.world!.position.y) - Math.hypot(b.x - save.world!.position.x, b.y - save.world!.position.y))[0];
    }, { save: await savedGame(page), target: hint.target.position });
    if (!approach) throw Error(`No reachable adjacent approach for ${targetId}`);
    await walkTo(page, approach, touch);
  }
  throw Error(`Could not approach moving production target ${targetId}`);
}
async function activateLife(page: Page, targetId: string, touch: boolean) {
  const attempts: unknown[] = [];
  for (let i = 0; i < 16; i++) {
    const hint = await lifeHint(page, targetId), index = hint.options.findIndex(option => option.targetId === targetId);
    if (index < 0 || index >= 2) { await approachLife(page, targetId, touch); continue; }
    const option = hint.options[index], exact = page.locator(`[data-life-action="${option.id}"]`);
    const control = await exact.count() ? exact : page.locator('.world-life-options .world-anchor').nth(index).locator('button').last();
    if (!await control.isVisible()) { await page.waitForTimeout(200); continue; }
    const box = await control.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    const prior = (await savedGame(page)).world?.life?.reactions.find(reaction => reaction.targetId === targetId)?.atMs ?? -1;
    if (touch) await control.tap(); else await control.click();
    await page.waitForTimeout(180);
    const after = await savedGame(page), response = after.world?.life?.reactions.find(reaction => reaction.targetId === targetId);
    attempts.push({ input: touch ? 'touch' : 'mouse', optionId: option.id, index, method: await exact.count() ? 'exact physical binding' : 'visible ordered arrow with read-only proximity hint', responses: after.world?.life?.reactions });
    if (response && response.atMs > prior) return { attempts, response };
    await approachLife(page, targetId, touch);
  }
  throw Error(`Visible controls never produced the intended physical response for ${targetId}`);
}

test('ordinary traversal reaches unvoiced residents, reactions and saved discoveries', async ({ page }, info) => {
  const out = `output/verification/world/0087/production/${info.project.name}`;
  await mkdir(out, { recursive: true });
  const errors: string[] = [], checkpoints: unknown[] = [], touch = info.project.name === 'phone';
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  let completed = false;
  const record = () => writeFile(`${out}/evidence.json`, JSON.stringify({ head, checkpoints, errors, status: completed ? 'passed' : 'incomplete', method: 'Ordinary opening and real pointer/touch/keyboard travel; read-only navigation hints; no injected saves, spawns or internal dispatch.' }, null, 2));
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await record();
  try {
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
    for (const visit of visits) {
      await exitTo(page, visit.mapId, touch);
      for (const id of visit.ids) {
        const save = await savedGame(page);
        const hook = await page.evaluate(async ({ save, id }) => {
          const url = '/src/world/dynamic.ts', { mapsForNeighbourhood } = await import(url);
          return mapsForNeighbourhood(save.neighbourhood)[save.world!.mapId].npcHooks.find((hook: { characterId: string }) => hook.characterId === id);
        }, { save, id });
        expect(hook, `Missing authored production hook for ${id}`).toBeTruthy();
        await approachLife(page, hook.id, touch);
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
        const activation = await activateLife(page, hook.id, touch);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${out}/${id}-after.png` });
        await approachLife(page, hook.id, touch);
        await expect.poll(async () => (await lifeHint(page, hook.id)).target?.action, { timeout: 120000, intervals: [500, 1000] }).toBe('walk');
        const walkBefore = await lifeHint(page, hook.id);
        await page.screenshot({ path: `${out}/${id}-walk-before.png` });
        await expect.poll(async () => {
          const current = await lifeHint(page, hook.id);
          return current.target?.action === 'walk' ? Math.hypot(current.target.position.x - walkBefore.target!.position.x, current.target.position.y - walkBefore.target!.position.y) : 0;
        }, { timeout: 45000, intervals: [200, 500] }).toBeGreaterThan(.08);
        const walkAfter = await lifeHint(page, hook.id);
        await page.screenshot({ path: `${out}/${id}-walk-after.png` });
        await expect.poll(async () => (await lifeHint(page, hook.id)).target?.action, { timeout: 120000, intervals: [500, 1000] }).toBe('idle');
        await approachLife(page, hook.id, touch);
        const task = await lifeHint(page, hook.id);
        await page.screenshot({ path: `${out}/${id}-task.png` });
        checkpoints.push({ id, before, after: await savedGame(page), actors: live.actors, activation, walkBefore, walkAfter, task });
        await record();
      }
    }
    if ((await savedGame(page)).world!.mapId !== 'riverbank') await exitTo(page, 'riverbank', touch);
    const worldControl = page.getByTestId('world-viewport'); await worldControl.focus();
    const keyboardBefore = (await savedGame(page)).world!.position;
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(180); await page.keyboard.up('ArrowUp');
    await expect.poll(async () => { const position = (await savedGame(page)).world!.position; return Math.hypot(position.x - keyboardBefore.x, position.y - keyboardBefore.y); }).toBeGreaterThan(.05);
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
    const discoveryAction = await activateLife(page, 'riverbank.fishing-jetty', touch);
    checkpoints.push({ discoveryAction });
    await record();
    await expect.poll(async () => (await savedGame(page)).world!.life!.discoveries.some(item => item.landmarkId === 'riverbank.fishing-jetty')).toBe(true);
    await page.screenshot({ path: `${out}/physical-discovery.png` });
    const before = await savedGame(page);
    await page.reload(); await page.waitForTimeout(1000);
    const help = page.getByRole('dialog', { name: '怎么玩', exact: true });
    if (await help.isVisible()) {
      const close = help.getByRole('button', { name: '关闭', exact: true });
      if (touch) await close.tap(); else await close.click();
    }
    const after = await savedGame(page);
    expect(after.world!.mapId).toBe(before.world!.mapId);
    expect(Math.hypot(after.world!.position.x - before.world!.position.x, after.world!.position.y - before.world!.position.y)).toBeLessThan(.02);
    expect(after.world!.life!.elapsedMs).toBeGreaterThanOrEqual(before.world!.life!.elapsedMs);
    expect(after.world!.life!.elapsedMs - before.world!.life!.elapsedMs).toBeLessThan(4000);
    expect(after.world!.life!.reactions).toEqual(before.world!.life!.reactions);
    checkpoints.push({ restoredBefore: before.world, restoredAfter: after.world });
    await record();
    expect(after.world!.life!.discoveries.length).toBeGreaterThan(0);
    expect(after.world!.life!.discoveries).toEqual(before.world!.life!.discoveries);
    checkpoints.push({ repeatedDiscovery: await activateLife(page, 'riverbank.fishing-jetty', touch) });
    expect((await savedGame(page)).world!.life!.discoveries.filter(item => item.landmarkId === 'riverbank.fishing-jetty')).toHaveLength(1);
    expect(after.customers.every(customer => customer.phase === 'seated')).toBe(true);
    expect(errors).toEqual([]);
    completed = true;
  } finally {
    await record();
    if (!page.isClosed()) await page.screenshot({ path: `${out}/last-frame.png` }).catch(() => {});
  }
});
