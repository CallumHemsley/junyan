import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { cameraForMap, project } from '../../../../src/world/camera.ts';
const base = process.env.COURTYARD_PROOF_URL ?? 'http://127.0.0.1:5482', key = 'junyan-waiter-pending-v1';
const map = JSON.parse(await readFile('src/world/maps/courtyard/map.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const results = [];
try {
  const setup = await browser.newPage(); await setup.goto(`${base}/?test=1&seed=42&opening=skip`); await setup.waitForFunction(() => window.__TEST__?.getState());
  const fixture = await setup.evaluate(() => ({ game: window.__TEST__.getState(), content: window.__TEST__.content })); await setup.close();
  for (const [name, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
    const frames = {};
    for (const [phase, served] of [['morning', 0], ['evening', 3]]) {
      const game = structuredClone(fixture.game); game.served = served;
      game.customers.forEach((c, i) => { c.phase = i < served ? 'served' : 'seated'; });
      game.earnings = game.customers.filter(c => c.phase === 'served').reduce((sum, c) => sum + fixture.content.orders.find(o => o.id === c.orderId).items.reduce((cost, item) => cost + fixture.content.foods.find(f => f.id === item.foodId).price * item.quantity, 0), 0);
      game.world = { version: 1, mapId: 'courtyard', position: { x: 16, y: 21 }, facing: 'east', returnPositions: {}, activeActivity: null };
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.addInitScript(({ key, game }) => { if (!sessionStorage.getItem('phase-seeded')) { localStorage.setItem(key, JSON.stringify(game)); sessionStorage.setItem('phase-seeded', 'true'); } }, { key, game });
      const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}/?seed=42&opening=skip`); await page.locator('[data-testid="world-viewport"][data-map="courtyard"] canvas[data-rendered="true"]').waitFor();
      const welcome = page.getByRole('button', { name: /开门迎客/ }); if (await welcome.isVisible()) await welcome.click();
      await page.waitForTimeout(200);
      const canvas = page.locator('[data-testid="world-viewport"] canvas'), bounds = await canvas.boundingBox(), size = await canvas.evaluate(c => ({ width: c.width, height: c.height }));
      const camera = cameraForMap(map.bounds, game.world.position, size.width, size.height, bounds.width < 600 ? 11 : 15);
      const families = { wood: { x: 21, y: 19.12, z: 1.25 }, masonry: { x: 21.6, y: 19.12, z: 2.85 }, foliage: { x: 18.2, y: 24.2, z: .65 } };
      const patches = {};
      for (const [family, p] of Object.entries(families)) {
        const pixel = project(p, camera, p.z);
        assert(pixel.x > 1 && pixel.y > 1 && pixel.x < size.width - 1 && pixel.y < size.height - 1, `${name}/${family} probe must lie inside the actual logical canvas`);
        patches[family] = await canvas.evaluate((c, p) => Array.from(c.getContext('2d').getImageData(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3).data), pixel);
      }
      const saved = await page.evaluate(key => { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; }, key);
      if (saved) { assert.equal(saved.served, served); assert.deepEqual(saved.world.position, game.world.position); }
      await page.screenshot({ path: `docs/evidence/world/0080/${name}-production-lit-${phase}.png` });
      frames[phase] = { served, camera, patches, errors, particleHooks: 'No particles declared by default courtyard atmosphere hooks; local light overlays enabled', reducedMotion: true };
      await context.close();
    }
    assert.deepEqual(frames.morning.camera, frames.evening.camera);
    for (const family of ['wood', 'masonry', 'foliage']) assert.notDeepEqual(frames.morning.patches[family], frames.evening.patches[family], `Actual production ${family} pixels must change`);
    assert.deepEqual(frames.morning.errors, []); assert.deepEqual(frames.evening.errors, []);
    results.push({ name, sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), fixture: 'Validated normal saves with restaurant served count 0 or 3 drive the authoritative phase. No day-clock override, context proxy or particle overlay is used by this owner.', frames });
  }
} finally { await browser.close(); }
await writeFile('docs/evidence/world/0080/production-light-proof.json', JSON.stringify(results, null, 2) + '\n'); console.log(results.map(r => ({ name: r.name, materialFamiliesChanged: Object.keys(r.frames.morning.patches) })));
