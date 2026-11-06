import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const mode = process.argv[2]; assert(['baseline', 'after'].includes(mode));
const directory = `docs/evidence/world/0080/e02/${mode}`; await mkdir(directory, { recursive: true });
const manifest = JSON.parse(await readFile('docs/evidence/world/0080/e02/runtime-manifest.json', 'utf8'));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const base = 'http://127.0.0.1:5482', key = 'junyan-waiter-pending-v1', results = [];
try {
  const setup = await browser.newPage(); await setup.goto(`${base}/?test=1&seed=42&opening=skip`); await setup.waitForFunction(() => window.__TEST__?.getState());
  const fixture = await setup.evaluate(() => ({ game: window.__TEST__.getState(), content: window.__TEST__.content })); await setup.close();
  for (const [name, width, height] of [['desktop', 1440, 1000], ['phone390', 390, 844], ['phone320', 320, 740]]) for (const [phase, served] of [['morning', 0], ['evening', 3]]) for (const [landmark, position] of [['arrival', { x: 23, y: 33.5 }], ['laundry', { x: 34, y: 19.05 }], ['cat-rest', { x: 34.5, y: 20.6 }], ['jar', { x: 32.8, y: 21.8 }]]) {
    const game = structuredClone(fixture.game); game.served = served; game.customers.forEach((c, i) => { c.phase = i < served ? 'served' : 'seated'; });
    game.earnings = game.customers.filter(c => c.phase === 'served').reduce((sum, c) => sum + fixture.content.orders.find(o => o.id === c.orderId).items.reduce((cost, item) => cost + fixture.content.foods.find(f => f.id === item.foodId).price * item.quantity, 0), 0);
    game.world = { version: 1, mapId: 'courtyard', position, facing: 'north', returnPositions: {}, activeActivity: null };
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(({ key, game }) => localStorage.setItem(key, JSON.stringify(game)), { key, game });
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/?seed=42&opening=skip`); await page.locator('[data-map="courtyard"] canvas[data-rendered="true"]').waitFor();
    const welcome = page.getByRole('button', { name: /开门迎客/ }); if (await welcome.isVisible()) await welcome.click();
    await page.waitForTimeout(300);
    const image = `${directory}/${name}-${landmark}-${phase}.png`; await page.screenshot({ path: image });
    const canvas = await page.locator('[data-map="courtyard"] canvas').evaluate(c => ({ width: c.width, height: c.height, rect: { width: c.getBoundingClientRect().width, height: c.getBoundingClientRect().height } }));
    assert.deepEqual(errors, []);
    results.push({ name, landmark, phase, position, canvas, image, errors }); await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${directory}/matched-proof.json`, JSON.stringify({ manifest, mode, evidence: 'Actual App composition fixtures. Saved locations/phases are fixed; these images do not prove ordinary travel or completed activities.', results }, null, 2) + '\n');
console.log(`${mode}: ${results.length} actual App fixtures, clean page consoles`);
