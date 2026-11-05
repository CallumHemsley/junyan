import { test, expect } from '@playwright/test';
import content from '../src/content/content.json' with { type: 'json' };
import { probeAudio } from './audio-fixtures';

// Real shipped WAVs and production service worker; browser launch remains muted.
test('all five doctor lines play and replay offline in the production opening', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await probeAudio(page);
  const preview = process.env.JUNYAN_PREVIEW_URL!;
  await page.goto(`${preview}?seed=42`);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  expect(await page.evaluate(() => '__TEST__' in window)).toBe(false);
  await page.getByRole('button', { name: '醒来', exact: true }).click();
  const opening = page.locator('main.opening');
  const steps = content.opening.steps.filter(step => step.who === 'doctor');
  expect(steps).toHaveLength(5);
  for (const step of steps) {
    const english = step.type === 'say-en';
    const path = english ? step.audio : step.line!.audio;
    if (english) await expect(opening.locator('p[lang="en"]')).toContainText(step.en!);
    else await expect(opening.locator('.spoken').first()).toHaveText(step.line!.tokens.map(word => word.hanzi).join(''));
    await page.waitForFunction(path => (window as any).__audioProbe.some((row: any) => row.src.endsWith(path) && row.status === 'playing'), path);
    const before = await page.evaluate(() => (window as any).__audioProbe.length);
    await opening.getByRole('button', { name: '再听一遍', exact: true }).click();
    await page.waitForFunction(({ path, before }) => (window as any).__audioProbe.slice(before).some((row: any) => row.src.endsWith(path) && row.status === 'playing'), { path, before });
    await opening.getByRole('button', { name: '继续', exact: true }).click();
  }
  await expect(opening.locator('p[lang="en"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});
