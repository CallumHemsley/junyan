import { expect, type Locator, type Page } from '@playwright/test';

export async function activateReadingControl(page: Page, control: Locator) {
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await control.tap();
  else { await control.focus(); await control.press('Enter'); }
}

export async function readingGrid(page: Page, open: boolean) {
  const fallback = page.locator('.reading-room-grid-fallback');
  if (await fallback.count() === 0) { expect(open).toBe(false); return; }
  if (await fallback.evaluate(element => element.hasAttribute('open')) !== open) {
    await activateReadingControl(page, fallback.locator('summary'));
  }
  if (open) {
    const targets = await fallback.locator('[data-cell]').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return { width: rect.width, height: rect.height }; }));
    expect(targets).toHaveLength(30);
    expect(targets.every(target => target.width >= 44 && target.height >= 44)).toBe(true);
  }
  await expect(fallback.locator('.reading-room-grid')).toBeVisible({ visible: open });
}

export async function readingCell(page: Page, x: number, y: number) {
  await readingGrid(page, true);
  await activateReadingControl(page, page.locator(`.reading-room [data-cell="${x},${y}"]`));
}
