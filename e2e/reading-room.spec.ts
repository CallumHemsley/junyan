import { expect, test, type Page } from '@playwright/test';
import { withSkip, seedDayOne } from './opening';
import { visitWorld, interactAt, savedGame, closeActivity } from './world-journey';
import { probeAudio } from './audio-fixtures';
import { expectNativeSpeech } from './neighbourhood-audio';
import { privateArtifact } from './private-artifacts';
import { readingRoomMap } from '../src/world/maps/reading-room';
import { gridToWorld } from '../src/features/reading-room/world';
import { readingRoomFrame } from '../src/features/reading-room/view';
import { createGame, getOrder, orderTotal } from '../src/game';
import { content } from '../src/content';
import * as apartment from '../src/features/apartment/rules';
import * as repairs from '../src/features/repairs/rules';
import * as reading from '../src/features/reading-room/rules';
import type { Locator } from '@playwright/test';
import { activateReadingControl, readingCell, readingGrid } from './reading-grid';

async function projectState(page: Page) { return (await savedGame(page)).neighbourhood!['reading-room']; }
/** The pixel camera (ticket 0204: the room is drawn top-down by the pixel engine) once it has held still for a few frames. */
async function stableCamera(page: Page) {
  const view = page.locator('.pixel-reading-room');
  await expect(view).toHaveAttribute('data-pixel-camera', /zoom/);
  return view.evaluate(async element => {
    const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    let before = element.getAttribute('data-pixel-camera');
    for (let stable = 0; stable < 3;) { await frame(); const now = element.getAttribute('data-pixel-camera'); stable = now === before ? stable + 1 : 0; before = now; }
    return JSON.parse(before!) as { x: number; y: number; zoom: number; dpr: number; tile: number };
  });
}
/** World tiles (with a height in tiles) to CSS px from the canvas's top-left, through the pixel camera. */
async function projector(page: Page) {
  const camera = await stableCamera(page), scale = camera.zoom / camera.dpr;
  // Heights draw up the screen; nothing draws above the map's top edge, so a point there shows at the edge.
  return (p: { x: number; y: number; z?: number }) => ({ x: (p.x * camera.tile - camera.x) * scale, y: (Math.max(0.05, p.y - (p.z ?? 0)) * camera.tile - camera.y) * scale });
}
async function floorPoint(page: Page, x: number, y: number, brief: 'window' | 'alcove') {
  await readingGrid(page, false);
  const canvas = page.locator('.connected-world canvas'), project = await projector(page);
  const bounds = (await canvas.boundingBox())!;
  const position = project(gridToWorld({ x, y }, brief));
  expect(position.x).toBeGreaterThan(0); expect(position.x).toBeLessThan(bounds.width);
  expect(position.y).toBeGreaterThan(0); expect(position.y).toBeLessThan(bounds.height);
  expect(await canvas.evaluate((element, position) => { const r = element.getBoundingClientRect(); return document.elementFromPoint(r.x + position.x, r.y + position.y) === element; }, position)).toBe(true);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await canvas.tap({ position });
  else await canvas.click({ position });
  await expect.poll(async () => (await projectState(page)).draft).toMatchObject({ x, y });
}
async function expectBriefContext(page: Page) {
  const game = await savedGame(page), canvas = page.locator('.connected-world canvas');
  const project = await projector(page), bounds = (await canvas.boundingBox())!;
  const points = readingRoomFrame(game.neighbourhood!['reading-room']).map(p => project(p));
  const blocked = await canvas.evaluate((element, points) => { const r = element.getBoundingClientRect(); return points.filter(p => { const hit = document.elementFromPoint(r.x + p.x, r.y + p.y); return hit !== element && !(element.inert && hit === element.parentElement); }).slice(0, 3).map(p => ({...p, hit: document.elementFromPoint(r.x + p.x, r.y + p.y)?.className})); }, points);
  const panel = await page.locator('.world-context').boundingBox(), camera = await page.locator('.pixel-reading-room').getAttribute('data-pixel-camera');
  expect(blocked, JSON.stringify({ bounds, panel, camera })).toEqual([]);
}
async function place(page: Page, id: 'table' | 'chair', x: number, y: number, brief: 'window' | 'alcove', turn = false, native = false) {
  async function activate(control: Locator) {
    if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await control.tap();
    else { await control.focus(); await control.press('Enter'); }
  }
  const since = await page.evaluate(() => (window as any).__audioProbe.length);
  await activate(page.locator(`.reading-room [data-item="${id}"]`));
  await expectNativeSpeech(page, `/audio/apartment/line-${id === 'table' ? 'window' : 'left'}.wav`, since);
  if (turn) {
    const beforeRotate = await page.evaluate(() => (window as any).__audioProbe.length);
    await activate(page.getByRole('button', { name: '转一下', exact: true }));
    await expectNativeSpeech(page, '/audio/apartment/line-rotate.wav', beforeRotate);
  }
  if (native) await floorPoint(page, x, y, brief);
  else await readingCell(page, x, y);
  await activate(page.getByRole('button', { name: '放这里', exact: true }));
  await expect.poll(async () => (await projectState(page)).layouts[brief].find(p => p.id === id)).toMatchObject({ x, y, rotation: turn ? 1 : 0 });
}

for (const phoneHeight of [664, 844]) test(`frames both whole work bays at phone height ${phoneHeight} for native placement and word-card recovery`, async ({ page, baseURL }, info) => {
  test.setTimeout(90_000);
  test.skip(info.project.name === 'desktop' && phoneHeight === 664, 'Desktop geometry is covered once.');
  if (info.project.name === 'phone') await page.setViewportSize({ width: 390, height: phoneHeight });
  const capture = info.project.name === 'phone' ? `phone-${phoneHeight}` : 'desktop';
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await probeAudio(page);
  // Declared focused fixture: fresh project at its real desk; all editing below uses visible controls.
  const game = createGame(content, 42), position = readingRoomMap.anchors[0].position;
  game.neighbourhood!.location = 'reading-room';
  game.world = { version: 1, mapId: 'reading-room', position, facing: 'north', activeActivity: 'reading-room', activeAnchorId: 'reading-room.project', returnPositions: {} };
  await seedDayOne(page, baseURL!, game); await page.goto('/?seed=42'); await expect(page.locator('.reading-room')).toBeVisible();
  await expectBriefContext(page);
  const beforeReplay = await page.evaluate(() => (window as any).__audioProbe.length);
  await activateReadingControl(page, page.locator('.reading-room-toolbar > .round-button'));
  await expectNativeSpeech(page, '/audio/apartment/line-window.wav', beforeReplay);
  const sentenceRows = await page.locator('.reading-room-current .word').evaluateAll(elements => elements.map(element => Math.round(element.getBoundingClientRect().y)));
  expect(new Set(sentenceRows).size).toBe(1);
  for (const control of await page.locator('.reading-room-toolbar > button,.reading-room-briefs button,.reading-room-toolbar summary,.reading-room-kit button').all()) {
    const box = (await control.boundingBox())!; expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await place(page, 'table', 2, 0, 'window', false, true);
  await place(page, 'chair', 1, 0, 'window', false, true);
  await page.screenshot({ path: privateArtifact(`0115/${capture}-first-native.png`) });
  await page.getByRole('button', { name: '这样可以', exact: true }).click();
  await page.getByRole('button', { name: '第二处窗边', exact: true }).last().click();
  await page.locator('.reading-room [data-item="table"]').click(); await page.getByRole('button', { name: '转一下', exact: true }).click();
  await floorPoint(page, 2, 0, 'alcove'); await expectBriefContext(page);
  await page.screenshot({ path: privateArtifact(`0115/${capture}-second-native-draft.png`) });
  await page.locator('.reading-room-instructions summary').focus(); await page.locator('.reading-room-instructions summary').press('Enter');
  await expectBriefContext(page);
  const beforeInstructionsReplay = await page.evaluate(() => (window as any).__audioProbe.length);
  await activateReadingControl(page, page.locator('.reading-room-instructions .round-button').first());
  await expectNativeSpeech(page, '/audio/apartment/line-window.wav', beforeInstructionsReplay);
  await page.screenshot({ path: privateArtifact(`0115/${capture}-expanded-instructions.png`) });
  const draft = (await projectState(page)).draft;
  await page.locator('.reading-room-current [data-word-lookup]').first().click(); await expect(page.locator('.word-popover')).toBeVisible();
  expect(await page.locator('.connected-world canvas').evaluate(element => element.inert)).toBe(true);
  const worldView = page.getByTestId('world-viewport'), worldBounds = (await worldView.boundingBox())!;
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await worldView.tap({ position: { x: worldBounds.width / 2, y: 4 } });
  else await worldView.click({ position: { x: worldBounds.width / 2, y: 4 } });
  expect((await projectState(page)).draft).toEqual(draft);
  await page.screenshot({ path: privateArtifact(`0115/${capture}-word-card.png`) });
  await page.getByRole('button', { name: '关闭词卡', exact: true }).click(); await expectBriefContext(page);
  expect((await projectState(page)).draft).toEqual(draft);
  expect((await savedGame(page)).world!.position).toEqual(position);
  await closeActivity(page); await interactAt(page, 'reading-room.project'); await expectBriefContext(page);
  expect((await projectState(page)).brief).toBe('alcove'); expect((await projectState(page)).draft).toEqual(draft);
  await floorPoint(page, 2, 0, 'alcove'); await page.getByRole('button', { name: '放这里', exact: true }).click();
  await place(page, 'chair', 1, 1, 'alcove', false, true); await page.getByRole('button', { name: '这样可以', exact: true }).click();
  expect((await projectState(page)).completed).toEqual(['window', 'alcove']); expect((await savedGame(page)).world!.position).toEqual(position);
  await page.locator('.reading-room [data-brief="window"]').click(); await expectBriefContext(page);
  await page.locator('.reading-room [data-brief="alcove"]').click(); await expectBriefContext(page);
  await page.screenshot({ path: privateArtifact(`0115/${capture}-reopened-second-complete.png`) });
  expect(errors).toEqual([]);
});

test('walks into the shared room, rearranges both voiced briefs, retries and persists independent projects', async ({ page }, info) => {
  test.setTimeout(240_000); page.setDefaultTimeout(8_000);
  const errors: string[] = [], failedAudio: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.url().includes('/audio/') && response.status() >= 400) failedAudio.push(response.url()); });
  await probeAudio(page);
  await page.goto(withSkip('/?seed=42'));
  await page.getByRole('button', { name: '开门迎客' }).click();
  const before = await savedGame(page);
  await visitWorld(page, 'reading-room');
  await interactAt(page, 'reading-room.project');
  await expect(page.locator('.reading-room')).toBeVisible();
  await expectNativeSpeech(page, '/audio/apartment/line-window.wav');
  expect(await page.locator('main').innerText()).not.toMatch(/[a-z]/i);
  await page.locator('.reading-room-current [data-word-lookup]').first().click();
  await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();
  await page.getByRole('button', { name: '关闭词卡', exact: true }).click();
  await page.screenshot({ path: privateArtifact(`0101/${info.project.name}-arrival.png`) });
  await page.getByRole('button', { name: '这样可以', exact: true }).click();
  expect((await projectState(page)).retries.window).toBe(1);
  await page.locator('.reading-room [data-item="table"]').click();
  await readingCell(page, 5, 4);
  await page.screenshot({ path: privateArtifact(`0115/${info.project.name}-grid-fallback.png`) });
  await page.getByRole('button', { name: '放这里', exact: true }).click();
  expect((await projectState(page)).layouts.window).toEqual([]);
  await expectNativeSpeech(page, '/audio/apartment/line-blocked.wav');
  await floorPoint(page, 2, 0, 'window');
  await page.screenshot({ path: privateArtifact(`0101/${info.project.name}-native-draft.png`) });
  await page.getByRole('button', { name: '放这里', exact: true }).click();
  await place(page, 'chair', 1, 0, 'window');
  await expectNativeSpeech(page, '/audio/apartment/line-left.wav');
  await page.getByRole('button', { name: '这样可以', exact: true }).click();
  await expect.poll(async () => (await projectState(page)).completed).toEqual(['window']);
  await expectNativeSpeech(page, '/audio/apartment/line-okay.wav');
  await page.getByRole('button', { name: '第二处窗边', exact: true }).last().click();
  await place(page, 'table', 2, 0, 'alcove', true, true);
  await expectNativeSpeech(page, '/audio/apartment/line-rotate.wav');
  await place(page, 'chair', 1, 1, 'alcove');
  await page.getByRole('button', { name: '这样可以', exact: true }).click();
  await expect.poll(async () => (await projectState(page)).completed).toEqual(['window', 'alcove']);
  const done = await savedGame(page);
  expect(done.neighbourhood!.apartment).toEqual(before.neighbourhood!.apartment);
  expect(done.earnings).toBe(before.earnings);
  expect(done.neighbourhood!.claimedGiftIds).toEqual(before.neighbourhood!.claimedGiftIds);
  expect(done.progression!.daily.completed).toEqual(expect.arrayContaining(['reading-room.window', 'reading-room.alcove']));
  expect(Object.values(done.progression!.review).every(review => review.successes === 0)).toBe(true);
  await closeActivity(page);
  await page.screenshot({ path: privateArtifact(`0101/${info.project.name}-both-completed.png`) });
  await visitWorld(page, 'residential-hall');
  await visitWorld(page, 'reading-room');
  await interactAt(page, 'reading-room.project');
  await page.reload();
  await expect(page.locator('.reading-room')).toBeVisible();
  await expect.poll(async () => await projectState(page)).toEqual(done.neighbourhood!['reading-room']);
  await expect(page.locator('.reading-room')).toBeVisible();
  await page.getByRole('button', { name: '重新摆放', exact: true }).click();
  expect((await projectState(page)).completed).toEqual(['window', 'alcove']);
  expect((await projectState(page)).layouts.window).toEqual(done.neighbourhood!['reading-room'].layouts.window);
  expect((await projectState(page)).layouts.alcove).toEqual([]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: privateArtifact(`0101/${info.project.name}-replay-reduced-motion.png`) });
  expect(await page.locator('main').innerText()).not.toMatch(/[a-z]/i);
  expect(errors).toEqual([]); expect(failedAudio).toEqual([]);
});

test('shows completed reading nooks in real morning and evening room saves', async ({ page, baseURL }, info) => {
  test.setTimeout(90_000);
  let state = reading.initialState();
  const actions: reading.Action[] = [
    { type: 'select', id: 'table' }, { type: 'preview', x: 2, y: 0 }, { type: 'place' },
    { type: 'select', id: 'chair' }, { type: 'preview', x: 1, y: 0 }, { type: 'place' }, { type: 'check' },
    { type: 'begin-brief', brief: 'alcove' }, { type: 'select', id: 'table' }, { type: 'rotate' }, { type: 'preview', x: 2, y: 0 }, { type: 'place' },
    { type: 'select', id: 'chair' }, { type: 'preview', x: 1, y: 1 }, { type: 'place' }, { type: 'check' },
  ];
  for (const action of actions) state = reading.reduce(state, action);
  for (const time of ['morning', 'evening'] as const) {
    const game = createGame(content, 42);
    game.neighbourhood!['reading-room'] = state; game.neighbourhood!.location = 'reading-room';
    game.journal = { table: { lookups: 0, lastSeen: 1, recovered: true }, 'apartment.chair': { lookups: 0, lastSeen: 1, recovered: true } };
    game.world = { version: 1, mapId: 'reading-room', position: readingRoomMap.anchors[0].position, facing: 'north', activeActivity: null, activeAnchorId: null, returnPositions: {} };
    if (time === 'evening') {
      game.customers = game.customers.map((customer, index) => index < 3 ? { ...customer, phase: 'served' as const } : customer);
      game.served = 3;
      game.earnings = game.customers.filter(customer => customer.phase === 'served').reduce((total, customer) => total + orderTotal(getOrder(game, customer.table, content)!, content), 0);
    }
    await seedDayOne(page, baseURL!, game);
    await page.goto('/?seed=42');
    await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map', 'reading-room');
    const open = page.getByRole('button', { name: '开门迎客' });
    if (await open.isVisible()) await open.click();
    await expect(page.locator('.connected-world canvas')).toHaveAttribute('data-rendered', 'true');
    await page.screenshot({ path: privateArtifact(`0101/${info.project.name}-${time}-scene.png`) });
  }
});

test('restores an old save without taking private furnishings, gifts or sibling progress', async ({ page, baseURL }) => {
  test.setTimeout(150_000); page.setDefaultTimeout(8_000);
  await probeAudio(page);
  const game = createGame(content, 42), n = game.neighbourhood!;
  n.apartment = apartment.reduce(n.apartment, { type: 'accept-starter' }, 1);
  n.apartment = apartment.reduce(n.apartment, { type: 'receive-gift', giftId: 'repairs.stool' }, 1);
  n.claimedGiftIds = ['repairs.stool'];
  n.repairs = repairs.reduce(n.repairs, { type: 'select', job: 'lamp', part: 'bulb' }, 1);
  n.repairs = repairs.reduce(n.repairs, { type: 'turn', job: 'lamp', direction: 'tighten' }, 1);
  const { ['reading-room']: ignored, ...legacy } = n;
  expect(ignored.completed).toEqual([]);
  await seedDayOne(page, baseURL!, { ...game, neighbourhood: legacy });
  await page.goto('/?seed=42');
  await page.getByRole('button', { name: '开门迎客' }).click();
  await expect.poll(async () => (await savedGame(page)).neighbourhood?.['reading-room']).toBeDefined();
  const restored = await savedGame(page);
  expect(restored.neighbourhood!['reading-room'].completed).toEqual([]);
  for (const feature of ['apartment', 'cats', 'repairs', 'garden', 'claimedGiftIds'] as const) expect(restored.neighbourhood![feature]).toEqual(n[feature]);
  await visitWorld(page, 'reading-room');
  await interactAt(page, 'reading-room.project');
  await place(page, 'table', 2, 0, 'window');
  await page.locator('.reading-room [data-item="chair"]').click();
  await readingCell(page, 1, 0);
  const draft = await projectState(page);
  await page.reload();
  await expect(page.locator('.reading-room')).toBeVisible();
  await expect.poll(async () => await projectState(page)).toEqual(draft);
  for (const feature of ['apartment', 'cats', 'repairs', 'garden', 'claimedGiftIds'] as const) expect((await savedGame(page)).neighbourhood![feature]).toEqual(n[feature]);
});
