import { test, expect } from '@playwright/test';
import content from '../../src/content/content.json' with { type: 'json' };
import { playOpening } from '../../e2e/opening';

test('all 23 changed restaurant clips finish native playback offline', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop', 'Native media coverage once; real UI journey covers all four layouts');
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(process.env.AUDIO_PREVIEW_URL!);
  await playOpening(page);
  await page.getByRole('button', { name: '开门迎客' }).click();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  const lines = [
    ...content.characters.flatMap(character => [character.greeting, character.retry, character.thanks]),
    ...content.orders.map(order => order.line),
  ].filter(line => line.id !== 'zhang-retry');
  expect(lines).toHaveLength(23);
  const evidence = [];
  for (const line of lines) {
    const result = await page.evaluate(async ({ id, path }) => {
      const media = new Audio(new URL(`.${path}`, document.baseURI).href);
      return await new Promise<{ id: string; url: string; duration: number; endedAt: number; ended: boolean }>((resolve, reject) => {
        const timer = setTimeout(() => { media.pause(); reject(Error(`Playback timeout: ${id}`)); }, 20_000);
        media.onerror = () => { clearTimeout(timer); reject(Error(`Native media failed: ${id}`)); };
        media.onended = () => {
          clearTimeout(timer);
          resolve({ id, url: media.src, duration: media.duration, endedAt: media.currentTime, ended: media.ended });
        };
        media.play().catch(error => { clearTimeout(timer); reject(error); });
      });
    }, { id: line.id, path: line.audio });
    expect(result.ended).toBe(true);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.endedAt).toBeCloseTo(result.duration, 1);
    evidence.push(result);
  }
  await info.attach('all23-native-offline-playback.json', { body: JSON.stringify({ clips: evidence, errors }, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});

test('each regular shows the correct retry after an actual wrong delivery', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/?test=1&seed=42&opening=skip');
  await page.getByRole('button', { name: '开门迎客' }).click();
  for (const table of [1, 2, 3, 4]) {
    await page.getByTestId(`table-${table}`).click();
    await expect(page.getByRole('dialog', { name: `${table}桌点餐` })).toBeVisible();
    // Empty tray is an actual incorrect delivery; no test-state dispatch.
    await page.getByRole('button', { name: /^上菜/ }).click();
    const regular = content.characters[table - 1];
    await expect(page.getByRole('status')).toContainText(regular.retry.tokens.map(word => word.hanzi).join(''));
    await page.screenshot({ path: `output/0062-final/${info.project.name}-retry-${table}.png`, fullPage: true });
    await page.getByRole('button', { name: '关闭', exact: true }).click();
  }
  expect(errors).toEqual([]);
});
