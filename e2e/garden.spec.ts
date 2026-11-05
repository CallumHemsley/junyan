import {test, expect, type Page} from '@playwright/test';
import type {State} from '../src/features/garden/rules';
const action = (page: Page, name: string) => page.locator(`.garden-tool-button[aria-label="${name}"]`);
const state = (page: Page): Promise<State> => page.evaluate(() => window.__GARDEN_TEST__!.state());
const nextDay = (page: Page) => page.evaluate(() => window.__GARDEN_TEST__!.nextDay());

test('isolated garden care, deliberate mistake, recovery, placement and vocabulary', async ({page}, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  await page.route('**/favicon.ico', route => route.fulfill({status: 204}));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/src/features/garden/harness.html?test=1');
  await expect(page.getByTestId('garden-view')).toBeVisible();
  expect(await page.evaluate(() => window.__GARDEN_TEST__!.recoveries())).toEqual([]);
  await action(page, '收拾').click();
  await expect(page.getByTestId('garden-dialogue')).toHaveText('土还是湿的先别浇水。');
  await expect.poll(() => page.evaluate(() => window.__GARDEN_TEST__!.plays())).toContain('garden.wet-warning');
  expect(await page.locator('[data-testid=garden-harness-pinyin]').count()).toBe(0);
  expect(await page.getByTestId('garden-view').innerText()).not.toMatch(/[A-Za-z]/);
  await page.screenshot({path: `evidence/0070/${info.project.name}-welcome.png`, fullPage: true});

  await page.getByTestId('garden-dialogue').getByRole('button', {name: '土', exact: true}).click();
  await expect(page.getByTestId('garden-harness-pinyin')).toHaveText('tǔ');
  await page.getByRole('button', {name: '收起', exact: true}).click();
  expect(await page.evaluate(() => window.__GARDEN_TEST__!.recoveries())).toEqual([]);
  await action(page, '浇水').click();
  await expect(page.locator('[data-testid=garden-confirm] .garden-tool-button[aria-label="先等"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-testid=garden-confirm]')).toHaveCount(0);
  await action(page, '浇水').click();
  const confirmation = page.getByTestId('garden-confirm');
  await confirmation.locator('button').first().focus();
  await page.keyboard.press('Shift+Tab');
  await expect(confirmation.locator('button').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(confirmation.locator('button').first()).toBeFocused();
  const confirmationWord = page.getByTestId('garden-confirm').getByRole('button', {name: '土', exact: true});
  await confirmationWord.click();
  await expect(page.getByTestId('garden-harness-pinyin')).toHaveText('tǔ');
  await expect(page.getByRole('button', {name: '收起', exact: true})).toBeFocused();
  await page.getByRole('button', {name: '收起', exact: true}).click();
  await expect(confirmationWord).toBeFocused();
  await page.keyboard.press('Escape');
  await action(page, '浇水').dblclick();
  await expect(page.locator('[data-testid=garden-confirm]')).toBeVisible();
  expect((await state(page)).plants.flower.care).toBe('ready');
  await page.screenshot({path: `evidence/0070/${info.project.name}-wet-warning.png`, fullPage: true});
  await page.locator('[data-testid=garden-confirm] .garden-tool-button[aria-label="还是浇"]').click();
  expect((await state(page)).plants.flower.care).toBe('extra');
  expect(await page.evaluate(() => window.__GARDEN_TEST__!.recoveries())).toEqual([]);
  await nextDay(page);
  await expect.poll(async () => (await state(page)).plants.flower.drooping).toBe(true);
  await expect(page.getByTestId('garden-comparison')).toBeVisible();
  await expect(page.getByTestId('garden-dialogue')).toHaveText('水太多了明天再看看。');
  await action(page, '看一看').click();
  await expect.poll(() => page.evaluate(() => window.__GARDEN_TEST__!.recoveries())).toContain('garden.too-much');
  await action(page, '浇水').click();
  expect((await state(page)).plants.flower.care).toBe('ready');
  await nextDay(page);
  await expect.poll(async () => (await state(page)).plants.flower.growth).toBe(1);
  expect((await state(page)).plants.flower.drooping).toBe(false);
  await expect(page.getByTestId('garden-dialogue')).toHaveText('比昨天高一点了。');

  await action(page, '搬').click();
  await page.getByTestId('garden-site-2').click();
  expect((await state(page)).plants.flower.site).toBe(0);
  await page.keyboard.press('Escape');
  await expect(action(page, '搬')).toHaveAttribute('aria-pressed', 'false');
  await action(page, '搬').click();
  await page.getByTestId('garden-site-1').click();
  expect((await state(page)).plants.flower.site).toBe(1);
  await action(page, '搬').click();
  await page.getByTestId('garden-site-0').click();
  expect((await state(page)).plants.flower.site).toBe(0);
  await action(page, '遮阳架').click();
  await page.getByTestId('garden-site-5').click();
  expect((await state(page)).shade).toBe(5);
  await action(page, '遮阳架').click();
  await page.getByTestId('garden-site-0').click();
  expect((await state(page)).shade).toBe(0);
  await page.getByRole('button', {name: '选藤', exact: true}).click();
  await expect(page.getByTestId('garden-dialogue')).toHaveText('先歇一歇明天再看看。');
  await action(page, '浇水').click();
  expect((await state(page)).plants.climber.care).toBe('ready');
  await page.getByRole('button', {name: '选小树', exact: true}).click();
  await action(page, '浇水').click();
  await nextDay(page);
  await expect.poll(async () => (await state(page)).planterEarned).toBe(true);
  await expect(page.locator('.garden-gift')).toBeVisible();
  await expect(page.locator('.garden-weather')).toHaveAttribute('data-weather', 'rain');
  expect((await state(page)).plants.tree.care).toBe('ready');
  await page.screenshot({path: `evidence/0070/${info.project.name}-rain-growth.png`, fullPage: true});

  const snapshot = await page.evaluate(() => window.__GARDEN_TEST__!.snapshot());
  await page.reload();
  await page.evaluate(value => window.__GARDEN_TEST__!.restore(value), snapshot);
  await expect.poll(async () => (await state(page)).planterEarned).toBe(true);
  expect((await state(page)).plants).toEqual(snapshot.state.plants);
  expect(await page.evaluate(() => window.__GARDEN_TEST__!.recoveries())).toEqual([]);
  for (let i = 0; i < 4; i++) {
    for (const id of ['选花', '选藤', '选小树']) {
      await page.getByRole('button', {name: id, exact: true}).click();
      if (await action(page, '浇水').isEnabled()) {
        const selected = id === '选花' ? 'flower' : id === '选藤' ? 'climber' : 'tree';
        if ((await state(page)).plants[selected].care === 'dry') await action(page, '浇水').click();
      }
    }
    await nextDay(page);
    await expect.poll(async () => (await state(page)).day).toBe(snapshot.day + i + 1);
  }
  await expect.poll(() => page.evaluate(() => window.__GARDEN_TEST__!.plays())).toContain('garden.mature-result');
  await page.screenshot({path: `evidence/0070/${info.project.name}-retreat.png`, fullPage: true});
  const metrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    undersized: [...document.querySelectorAll<HTMLButtonElement>('.garden button')].filter(button => {const r = button.getBoundingClientRect(); return r.width < 44 || r.height < 44;}).map(button => button.getAttribute('aria-label') ?? button.textContent),
    spoken: getComputedStyle(document.querySelector('.garden-spoken')!).fontSize,
  }));
  expect(metrics.overflow).toBe(false);
  expect(metrics.undersized).toEqual([]);
  expect(Number.parseFloat(metrics.spoken)).toBeGreaterThanOrEqual(28);
  expect(errors).toEqual([]);
  await info.attach('isolated garden verification', {body: JSON.stringify({metrics, errors, state: await state(page), limitations: ['Callbacks observed in development-only harness', 'Snapshot restore is not central IndexedDB persistence', 'No actual garden voice assets or listening verification']}, null, 2), contentType: 'application/json'});
});


test('rain advice follows the selected pot soil and shelter', async ({page}) => {
  await page.route('**/favicon.ico', route => route.fulfill({status: 204}));
  await page.goto('/src/features/garden/harness.html?test=1');
  await page.evaluate(() => window.__GARDEN_TEST__!.nextDay(3));
  await expect.poll(async () => (await state(page)).day).toBe(3);
  await action(page, '收拾').click();
  await nextDay(page);
  await expect.poll(async () => (await state(page)).day).toBe(4);
  await action(page, '看一看').click();
  await page.getByRole('button', {name: '选藤', exact: true}).click();
  await page.getByRole('button', {name: '选花', exact: true}).click();
  expect((await state(page)).plants.flower.care).toBe('dry');
  expect((await state(page)).shade).toBe((await state(page)).plants.flower.site);
  await expect(page.getByTestId('garden-dialogue')).toHaveText('这盆土干了浇一点水。');
  await action(page, '浇水').click();
  await page.getByRole('button', {name: '选藤', exact: true}).click();
  await page.getByRole('button', {name: '选花', exact: true}).click();
  await expect(page.getByTestId('garden-dialogue')).toHaveText('土还是湿的先别浇水。');
  await page.getByRole('button', {name: '选藤', exact: true}).click();
  await action(page, '看一看').click();
  await page.getByRole('button', {name: '选花', exact: true}).click();
  await page.getByRole('button', {name: '选藤', exact: true}).click();
  await expect(page.getByTestId('garden-dialogue')).toHaveText('今天下雨不用浇水。');
  await action(page, '浇水').click();
  await page.getByTestId('garden-confirm').locator('.garden-tool-button[aria-label="还是浇"]').click();
  await page.getByRole('button', {name: '选花', exact: true}).click();
  await page.getByRole('button', {name: '选藤', exact: true}).click();
  await expect(page.getByTestId('garden-dialogue')).toHaveText('水太多了明天再看看。');
});
