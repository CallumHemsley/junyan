import { expect, test } from '@playwright/test';
import { createGame, getOrder, orderTotal } from '../src/game';
import { content } from '../src/content';
import { readingRoomMap } from '../src/world/maps/reading-room';
import { releaseServedCustomer } from '../src/world/life/presence';
import type { LifeState } from '../src/world/life/interactions';
import { pathDuration } from '../src/features/reading-room/use';
import { seedDayOne } from './opening';
import { savedGame } from './world-journey';
import { privateArtifact } from './private-artifacts';

test.use({ video: 'on' });

for (const reducedMotion of [false, true]) test(`earned reading, visible return and restored replay${reducedMotion ? ' with reduced motion' : ''}`, async ({ page, baseURL }, info) => {
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  // Declared fixture: Lin's real breakfast acknowledgement already happened; the project is empty.
  const game = createGame(content, 42), lin = content.characters.find(c => c.id === 'lin-jie')!;
  const customer = game.customers.find(customer => getOrder(game, customer.table, content)?.customer === lin.name)!;
  customer.phase = 'served'; game.served = 1; game.earnings = orderTotal(getOrder(game, customer.table, content)!, content);
  game.neighbourhood!.location = 'reading-room';
  game.world = { version: 1, mapId: 'reading-room', position: readingRoomMap.anchors[0].position, facing: 'north', activeActivity: 'reading-room', activeAnchorId: 'reading-room.project', returnPositions: {}, life: releaseServedCustomer({ version: 1, elapsedMs: 0, discoveries: [], reactions: [], pauses: [], serviceDepartures: [] } satisfies LifeState, game, customer.table) };
  await seedDayOne(page, baseURL!, game);
  await page.goto('/?seed=42');
  await expect(page.locator('.reading-room')).toBeVisible();
  for (const [id, x] of [['table', 2], ['chair', 1]] as const) {
    await page.locator(`.reading-room [data-item="${id}"]`).click();
    await page.locator(`.reading-room [data-cell="${x},0"]`).click();
    await page.getByRole('button', { name: '放这里', exact: true }).click();
  }
  await page.getByRole('button', { name: '这样可以', exact: true }).click();
  await expect.poll(async () => Boolean((await savedGame(page)).neighbourhood!['reading-room'].use)).toBe(true);
  const reading = async () => (await savedGame(page)).neighbourhood!['reading-room'];
  const started = (await reading()).use!;
  await page.screenshot({ path: privateArtifact(`0112/${info.project.name}-${reducedMotion}-approach.png`) });
  await expect.poll(async () => (await savedGame(page)).world!.life!.elapsedMs, { timeout: 12000 }).toBeGreaterThan(started.startedAt + pathDuration(started.path) + 500);
  await page.screenshot({ path: privateArtifact(`0112/${info.project.name}-${reducedMotion}-reading.png`) });
  const before = await savedGame(page), layout = (await reading()).layouts.window;
  await page.getByRole('button', { name: '重新摆放', exact: true }).click();
  await expect(page.locator('.reading-room')).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('button', { name: '重新摆放', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '第一处窗边', exact: true })).toBeDisabled();
  expect((await reading()).layouts.window).toEqual(layout);
  await page.screenshot({ path: privateArtifact(`0112/${info.project.name}-${reducedMotion}-return.png`) });
  await page.reload();
  await expect(page.locator('.reading-room')).toBeVisible();
  await expect.poll(async () => (await reading()).status, { timeout: 12000 }).toBe('editing');
  expect((await reading()).layouts.window).toEqual([]);
  expect((await reading()).completedLayouts.window).toEqual(layout);
  expect((await reading()).use).toBeNull();
  const after = await savedGame(page);
  expect(after.earnings).toBe(before.earnings);
  expect(after.progression).toEqual(before.progression);
  expect(after.journal).toEqual(before.journal);
  await page.screenshot({ path: privateArtifact(`0112/${info.project.name}-${reducedMotion}-replay.png`) });
  expect(await page.locator('main').innerText()).not.toMatch(/[a-z]/i);
  expect(errors).toEqual([]);
});
