import {test, expect} from '@playwright/test';

test('roof placement plan maps destinations and saved occupants on the same isometric axes', async ({page}, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  await page.route('**/favicon.ico', route => route.fulfill({status: 204}));
  await page.goto('/src/features/garden/harness.html?test=1&presentation=controls&plant=flower');
  await page.locator('.garden-tool-button[aria-label="收拾"]').click();
  await page.locator('.garden-tool-button[aria-label="搬"]').click();
  const gardenSites: Record<number, {x: number; y: number}> = await page.evaluate(async () => {
    const modulePath = '/src/world/maps/rooftop/index.ts';
    return (await import(modulePath)).gardenSites;
  });
  const plan = page.locator('.garden-placement-choices');
  await expect(plan).toBeVisible();
  const sites = page.locator('.garden-placement-site');
  await expect(sites).toHaveCount(6);
  const bounds = await plan.boundingBox();
  const boxes = await sites.evaluateAll(nodes => nodes.map(node => {const rect = node.getBoundingClientRect(); return {top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right};}));
  for (const box of boxes) {
    expect(box.top).toBeGreaterThanOrEqual(bounds!.y);
    expect(box.bottom).toBeLessThanOrEqual(bounds!.y + bounds!.height);
    expect(box.left).toBeGreaterThanOrEqual(bounds!.x);
    expect(box.right).toBeLessThanOrEqual(bounds!.x + bounds!.width);
  }
  const positions = await sites.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    return {site: Number(node.getAttribute('data-site')), x: rect.x + rect.width / 2, y: rect.y};
  }));
  for (const a of positions) for (const b of positions) {
    const first = gardenSites[a.site], second = gardenSites[b.site];
    expect(Math.sign(a.x - b.x)).toBe(Math.sign(first.x - first.y - (second.x - second.y)));
    expect(Math.sign(a.y - b.y)).toBe(Math.sign(first.x + first.y - (second.x + second.y)));
  }
  await expect(sites.nth(0).getByRole('button').first()).toBeDisabled();
  await expect(sites.nth(0).getByRole('button', {name: '花', exact: true})).toBeVisible();
  await expect(sites.nth(4).getByRole('button', {name: '小树', exact: true})).toBeVisible();
  await page.screenshot({path: info.outputPath('placement.png'), fullPage: true});
  await sites.nth(1).getByRole('button').first().click();
  await expect.poll(() => page.evaluate(() => window.__GARDEN_TEST__!.state().plants.flower.site)).toBe(1);
  await page.locator('.garden-tool-button[aria-label="遮阳架"]').click();
  const destination = page.locator('.garden-placement-site[data-site="1"]');
  await expect(destination.getByRole('button', {name: '花', exact: true})).toBeVisible();
  await destination.getByRole('button').first().click();
  await expect.poll(() => page.evaluate(() => window.__GARDEN_TEST__!.state().shade)).toBe(1);
  expect(errors).toEqual([]);
});
