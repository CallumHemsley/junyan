import { expect, test, type Page } from '@playwright/test';
import { withSkip, seedDayOne } from './opening';
import { visitWorld, interactAt, savedGame, closeActivity } from './world-journey';
import { probeAudio } from './audio-fixtures';
import { expectNativeSpeech } from './neighbourhood-audio';
import { privateArtifact } from './private-artifacts';
import { cameraForMap, project } from '../src/world/camera';
import { readingRoomMap } from '../src/world/maps/reading-room';
import { gridToWorld } from '../src/features/reading-room/world';
import { createGame, getOrder, orderTotal } from '../src/game';
import { content } from '../src/content';
import * as apartment from '../src/features/apartment/rules';
import * as repairs from '../src/features/repairs/rules';
import * as reading from '../src/features/reading-room/rules';
import type { Locator } from '@playwright/test';

async function projectState(page: Page) { return (await savedGame(page)).neighbourhood!['reading-room']; }
async function floorPoint(page: Page, x: number, y: number, brief: 'window' | 'alcove') {
  const world = (await savedGame(page)).world!, canvas = page.locator('.connected-world canvas');
  const bounds = (await canvas.boundingBox())!, context = (await page.locator('.world-context').boundingBox())!;
  const width = Math.ceil(bounds.width / 2), height = Math.ceil(bounds.height / 2);
  const camera = cameraForMap(readingRoomMap.bounds, world.position, width, height, bounds.width < 600 ? 11 : 15, bounds.width < 800 ? (context.height + 84) / 2 : 0, bounds.width >= 800 ? (context.width + 32) / 2 : 0);
  const point = project(gridToWorld({ x, y }, brief), camera);
  const position = { x: point.x * bounds.width / width, y: point.y * bounds.height / height };
  expect(position.x).toBeGreaterThan(0); expect(position.x).toBeLessThan(bounds.width);
  expect(position.y).toBeGreaterThan(0); expect(position.y).toBeLessThan(bounds.height);
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await canvas.tap({ position });
  else await canvas.click({ position });
  await expect.poll(async () => (await projectState(page)).draft).toMatchObject({ x, y });
}
async function place(page: Page, id: 'table' | 'chair', x: number, y: number, brief: 'window' | 'alcove', turn = false, native = false) {
  async function activate(control: Locator) {
    if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await control.tap();
    else { await control.focus(); await control.press('Enter'); }
  }
  await activate(page.locator(`.reading-room [data-item="${id}"]`));
  if (turn) await activate(page.getByRole('button', { name: '转一下', exact: true }));
  if (native) await floorPoint(page, x, y, brief);
  else await activate(page.locator(`.reading-room [data-cell="${x},${y}"]`));
  await activate(page.getByRole('button', { name: '放这里', exact: true }));
  await expect.poll(async () => (await projectState(page)).layouts[brief].find(p => p.id === id)).toMatchObject({ x, y, rotation: turn ? 1 : 0 });
}

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
  await page.locator('.reading-room [data-cell="5,4"]').click();
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
  await page.locator('.reading-room [data-cell="1,0"]').click();
  const draft = await projectState(page);
  await page.reload();
  await expect(page.locator('.reading-room')).toBeVisible();
  await expect.poll(async () => await projectState(page)).toEqual(draft);
  for (const feature of ['apartment', 'cats', 'repairs', 'garden', 'claimedGiftIds'] as const) expect((await savedGame(page)).neighbourhood![feature]).toEqual(n[feature]);
});
