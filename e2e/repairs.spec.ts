import { test, expect, type Page } from '@playwright/test';
import { initialState, reduce, type State } from '../src/features/repairs/rules';

type Observations = { state: State; actions: unknown[]; recoveries: string[][]; plays: string[]; lookups: string[] };
const read = (page: Page) => page.evaluate(() => (window as unknown as { repairHarness: Observations }).repairHarness);
const action = (page: Page, label: string) => page.locator('.repair-operations .repair-action').filter({ hasText: new RegExp(`^${label}$`) }).click();
const main = (page: Page, label: string) => page.locator('.repair-main-actions').getByRole('button', { name: label, exact: true }).click();
const part = (page: Page, name: string) => page.getByTestId(`repair-part-${name}`).click();
const switchJob = (page: Page, name: string) => page.getByTestId(`repair-job-${name}`).click();

test('isolated repair journey preserves physical causes, reversible choices and callback boundaries', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/evidence/0069/harness.html');
  await expect(page.getByTestId('repairs')).toBeVisible();
  await expect.poll(async () => (await read(page)).plays).toEqual(['repairs.lamp-intro']);
  await page.screenshot({ path: `evidence/0069/${info.project.name}-initial.png`, fullPage: true });
  await main(page, '试试');
  await expect(page.getByTestId('repair-scene')).toHaveAttribute('data-test', 'unstable');
  await part(page, 'bulb');
  await action(page, '拧紧');
  await expect(page.getByTestId('repair-feedback')).toHaveText('先关掉');
  expect((await read(page)).recoveries).toEqual([]);
  await main(page, '关掉');
  await action(page, '拧紧');
  expect((await read(page)).recoveries).toEqual([['repairs.bulb', 'repairs.tighten']]);
  await expect(page.locator('.repair-main-actions').getByRole('button', { name: '放回', exact: true })).toBeDisabled();
  await switchJob(page, 'toy');
  await part(page, 'cover');
  await action(page, '打开');
  await part(page, 'lead');
  await action(page, '接上');
  const partial = await read(page);
  expect(partial.state.jobs.lamp).toMatchObject({ fitting: 'seated', test: 'none' });
  expect(partial.state.jobs.toy).toMatchObject({ lead: 'connected', cell: 'old', cover: 'open' });
  await page.goto(`/evidence/0069/harness.html?state=${encodeURIComponent(JSON.stringify(partial.state))}`);
  await expect(page.getByTestId('repair-part-cell')).toBeVisible();
  await switchJob(page, 'lamp');
  await main(page, '试试');
  await expect(page.getByTestId('repair-scene')).toHaveAttribute('data-test', 'steady');
  await part(page, 'bulb');
  const recoveredBeforeLoosening = (await read(page)).recoveries.length;
  await action(page, '转松');
  await expect(page.getByTestId('repair-feedback')).toHaveText('先关掉');
  expect((await read(page)).plays.at(-1)).toBe('repairs.power-first');
  expect((await read(page)).state.jobs.lamp).toMatchObject({ fitting: 'seated', test: 'steady' });
  expect((await read(page)).recoveries).toHaveLength(recoveredBeforeLoosening);
  await main(page, '试试');
  await expect(page.getByTestId('repair-feedback')).toHaveText('好了现在亮了');
  await page.screenshot({ path: `evidence/0069/${info.project.name}-lamp-steady.png`, fullPage: true });
  await main(page, '放回');
  expect((await read(page)).state.completed).toEqual(['lamp']);
  await expect(page.getByRole('button', { name: '再修一次', exact: true })).toBeFocused();
  await switchJob(page, 'toy');
  await part(page, 'cover');
  await action(page, '盖上');
  await main(page, '试试');
  await expect(page.getByTestId('repair-scene')).toHaveAttribute('data-test', 'still');
  await action(page, '打开');
  await part(page, 'cell');
  await page.screenshot({ path: `evidence/0069/${info.project.name}-toy-exposed.png`, fullPage: true });
  await action(page, '换电池');
  await part(page, 'cover');
  await action(page, '盖上');
  await main(page, '试试');
  await expect(page.getByTestId('repair-scene')).toHaveAttribute('data-test', 'moving');
  await page.screenshot({ path: `evidence/0069/${info.project.name}-toy-moving.png`, fullPage: true });
  await main(page, '放回');
  await expect(page.getByTestId('repair-feedback')).toHaveText('都修好了这个木头凳子给你');
  const returned = await read(page);
  expect(returned.state.completed).toEqual(['lamp', 'toy']);
  expect(returned.plays.at(-1)).toBe('repairs.all-complete');
  await expect(page.locator('.repair-speaker')).toContainText('林姐');
  await expect(page.locator('.repair-scene canvas')).toHaveAttribute('data-speaker', '林姐');
  await page.screenshot({ path: `evidence/0069/${info.project.name}-shelf.png`, fullPage: true });
  await action(page, '再修一次');
  expect((await read(page)).state.completed).toEqual(['lamp', 'toy']);
  const count = (await read(page)).recoveries.length;
  await page.locator('.repair-line .word').first().click();
  expect((await read(page)).recoveries).toHaveLength(count);
  expect((await read(page)).lookups).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('isolated keyboard, touch dimensions and reduced motion remain usable', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/evidence/0069/harness.html');
  const target = page.getByTestId('repair-part-bulb');
  await target.focus();
  await page.keyboard.press('Enter');
  await expect(target).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.repair-part-actions').getByRole('button', { name: '拧紧', exact: true }).focus();
  await page.keyboard.press('Space');
  expect((await read(page)).state.jobs.lamp).toMatchObject({ fitting: 'seated' });
  const dimensions = await page.locator('.repairs button:visible').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { label: element.textContent, width: box.width, height: box.height };
  }));
  expect(dimensions.filter(box => box.height < 44 || box.width < 44)).toEqual([]);
  const sizes = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.width);
  await page.screenshot({ path: `evidence/0069/${info.project.name}-reduced-motion.png`, fullPage: true });
});

test('toy may return first, and the final lamp return stages the gift speaker consistently', async ({ page }, info) => {
  let state = initialState();
  for (const action of [
    { type: 'switch', job: 'toy' }, { type: 'select', job: 'toy', part: 'cover' }, { type: 'cover', job: 'toy', position: 'open' },
    { type: 'select', job: 'toy', part: 'cell' }, { type: 'cell', job: 'toy', condition: 'fresh' },
    { type: 'select', job: 'toy', part: 'lead' }, { type: 'lead', job: 'toy', position: 'connected' },
    { type: 'select', job: 'toy', part: 'cover' }, { type: 'cover', job: 'toy', position: 'closed' }, { type: 'test', job: 'toy' },
  ] as const) state = reduce(state, action, 1);
  await page.goto(`/evidence/0069/harness.html?state=${encodeURIComponent(JSON.stringify(state))}`);
  await main(page, '放回');
  await expect(page.getByTestId('repair-feedback')).toHaveText('玩具修好了');
  expect((await read(page)).state.completed).toEqual(['toy']);
  await switchJob(page, 'lamp');
  await part(page, 'bulb');
  await action(page, '拧紧');
  await main(page, '试试');
  await main(page, '放回');
  await expect(page.getByTestId('repair-feedback')).toHaveText('都修好了这个木头凳子给你');
  await expect(page.locator('.repair-scene canvas')).toHaveAttribute('data-speaker', '林姐');
  expect((await read(page)).plays.at(-1)).toBe('repairs.all-complete');
  await page.screenshot({ path: `evidence/0069/${info.project.name}-lamp-last-shelf.png`, fullPage: true });
});

test.skip('integrated navigation, IndexedDB reload, offline natural voices and old saves await central integration and synthesis', () => {});
