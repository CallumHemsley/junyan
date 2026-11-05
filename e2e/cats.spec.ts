import { test, expect, type Page } from '@playwright/test';
import type { State } from '../src/features/cats/rules';

declare global { interface Window { __CATS_HARNESS__: { state: () => State; day: (day: number) => void; restore: (state: unknown) => void; events: { recover: string[][]; lookup: string[]; play: string[] } } } }
const harness = '/src/features/cats/harness.html?test=1';
const state = (page: Page) => page.evaluate(() => window.__CATS_HARNESS__.state());
const action = (page: Page, type: string) => page.getByTestId(`cats-action-${type}`).click();
async function reunite(page: Page) {
  await page.getByTestId('cats-white').click();
  for (const type of ['crouch', 'wait', 'approach', 'follow', 'reunite']) await action(page, type);
  expect((await state(page)).story.node).toBe('reunited');
}
test.describe('isolated cats contract surface', () => {
  test('wrong cat, patient recovery, reunion, repeats, and serialized restoration', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(harness);
    await expect(page.getByTestId('cats-view')).toBeVisible();
    await expect(page.locator('.cats-harness-word')).toHaveCount(0);
    await page.screenshot({ path: `evidence/0068/${info.project.name}-initial-clue.png`, fullPage: true });
    await page.getByTestId('cats-black').click();
    await expect(page.getByTestId('cats-dialogue')).toContainText('不是黑猫是白猫');
    await action(page, 'greet');
    await action(page, 'sit');
    expect((await state(page)).cats.black.satTogether).toBe(true);
    await page.screenshot({ path: `evidence/0068/${info.project.name}-black-friend.png`, fullPage: true });
    await page.getByTestId('cats-white').click();
    await action(page, 'approach');
    await expect(page.getByTestId('cats-dialogue')).toContainText('慢慢来');
    await action(page, 'space');
    await action(page, 'crouch');
    await action(page, 'wait');
    await page.screenshot({ path: `evidence/0068/${info.project.name}-emerged.png`, fullPage: true });
    for (const type of ['approach', 'follow', 'reunite']) await action(page, type);
    await expect(page.getByTestId('cats-dialogue')).toContainText('这个垫子送给你');
    await page.screenshot({ path: `evidence/0068/${info.project.name}-reunion.png`, fullPage: true });
    const saved = await state(page);
    await page.goto(`${harness}&day=2&state=${encodeURIComponent(JSON.stringify(saved))}`);
    expect((await state(page)).story).toEqual(saved.story);
    await action(page, 'begin');
    await page.screenshot({ path: `evidence/0068/${info.project.name}-rain-shelter.png`, fullPage: true });
    await page.getByTestId('cats-bicycle').click();
    const anchored = await state(page);
    await page.goto(`${harness}&day=3&state=${encodeURIComponent(JSON.stringify(anchored))}`);
    await page.getByTestId('cats-door').click();
    await action(page, 'wait');
    expect((await state(page)).lastCompletedDay).toBe(2);
    for (const day of [3, 4]) {
      await page.evaluate(day => window.__CATS_HARNESS__.day(day), day);
      await action(page, 'begin');
      await page.getByTestId(day === 3 ? 'cats-white' : 'cats-black').click();
      for (const type of day === 3 ? ['follow', 'approach'] : ['greet', 'sit']) await action(page, type);
    }
    expect((await state(page)).completedKinds).toEqual(['rainy', 'route', 'sunny']);
    const targets = await page.locator('.cats-view button').evaluateAll(buttons => buttons.map(button => ({ text: button.textContent, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })));
    expect(targets.filter(button => button.width < 43.5 || button.height < 43.5)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
  test('complete keyboard journey, tap-only pinyin, replay and recovery callbacks', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(harness);
    await expect(page.getByTestId('cats-white')).toBeVisible();
    const press = async (testId: string) => {
      const target = page.getByTestId(testId);
      for (let n = 0; n < 100; n++) {
        await page.keyboard.press('Tab');
        if (await target.evaluate(element => element === document.activeElement)) {
          await expect(target).toBeFocused();
          await page.keyboard.press('Enter'); return;
        }
      }
      throw new Error(`Keyboard cannot reach ${testId}`);
    };
    await press('cats-white');
    for (const type of ['crouch', 'wait', 'approach', 'follow', 'reunite']) await press(`cats-action-${type}`);
    expect((await state(page)).story.node).toBe('reunited');
    await page.locator('.cats-speech .word').first().click();
    await expect(page.getByRole('dialog')).toContainText('zhǎo dào');
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByRole('button', { name: '再听', exact: true }).click();
    const events = await page.evaluate(() => window.__CATS_HARNESS__.events);
    expect(events.play.at(-1)).toBe('cats.reunion');
    expect(events.lookup).toContain('cats.found');
    expect(events.recover.flat()).toContain('cats.cushion');
    expect(new Set(events.recover.flat()).size).toBe(events.recover.flat().length);
  });
});

test('courtyard motion pauses while hidden and respects reduced motion', async ({ page }) => {
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.putImageData;
    Object.assign(window, { __catsPaints: 0 });
    CanvasRenderingContext2D.prototype.putImageData = function (...args: Parameters<typeof original>) {
      const counter = window as unknown as { __catsPaints: number };
      counter.__catsPaints++;
      return original.apply(this, args);
    };
  });
  await page.goto(harness);
  await page.waitForFunction(() => (window as unknown as { __catsPaints: number }).__catsPaints >= 3);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const before = await page.evaluate(() => (window as unknown as { __catsPaints: number }).__catsPaints);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => (window as unknown as { __catsPaints: number }).__catsPaints)).toBe(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForFunction(before => (window as unknown as { __catsPaints: number }).__catsPaints > before, before);
  const reduced = await page.evaluate(() => (window as unknown as { __catsPaints: number }).__catsPaints);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => (window as unknown as { __catsPaints: number }).__catsPaints)).toBe(reduced);
});

test('repeat detours keep patient actions and visible companions consistent', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(harness);
  await reunite(page);
  await page.evaluate(() => window.__CATS_HARNESS__.day(2));
  await action(page, 'begin');
  await page.getByTestId('cats-white').click();
  await action(page, 'space');
  expect((await state(page)).cats.white.gaveSpace).toBe(true);
  expect(await page.evaluate(() => window.__CATS_HARNESS__.events.recover.flat())).toContain('cats.back');
  await page.screenshot({ path: `evidence/0068/${info.project.name}-rain-space.png`, fullPage: true });
  await action(page, 'wait');
  await page.evaluate(() => window.__CATS_HARNESS__.day(3));
  await action(page, 'begin');
  await page.getByTestId('cats-white').click();
  await action(page, 'follow');
  await action(page, 'approach');
  expect((await state(page)).cats.white.rested).toBe(true);
  await page.screenshot({ path: `evidence/0068/${info.project.name}-window-friend.png`, fullPage: true });
  await page.evaluate(() => window.__CATS_HARNESS__.day(4));
  await action(page, 'begin');
  await page.getByTestId('cats-black').click();
  await page.getByTestId('cats-white').click();
  await expect(page.getByTestId('cats-action-greet')).toHaveCount(0);
  await page.getByTestId('cats-black').click();
  await action(page, 'greet');
  await page.getByTestId('cats-white').click();
  await expect(page.getByTestId('cats-action-sit')).toHaveCount(0);
  await page.getByTestId('cats-black').click();
  await action(page, 'sit');
  expect((await state(page)).cats.black.satTogether).toBe(true);
});
