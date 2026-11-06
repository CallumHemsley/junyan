import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'output/verification/world/0087/browser');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const reports = [];
try {
  for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, recordVideo: { dir: path.join(out, name), size: viewport }, hasTouch: name === 'phone' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('http://127.0.0.1:5489/src/world/life/harness.html');
    await page.waitForFunction(() => window.__LIFE_PROOF__);
    await page.evaluate(() => window.__LIFE_PROOF__.reset());
    const visits = [];
    for (const [mapId, point, landmarkId] of [
      ['courtyard', { x: 27.25, y: 21 }, 'courtyard.water-jar'],
      ['riverbank', { x: 38.25, y: 39 }, 'riverbank.fishing-jetty'],
    ]) {
      await page.evaluate(({ mapId, point }) => { window.__LIFE_PROOF__.setMap(mapId); window.__LIFE_PROOF__.seedApproach(point); }, { mapId, point });
      await page.waitForTimeout(100);
      const before = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
      if (name === 'desktop') {
        await page.keyboard.down('ArrowRight'); await page.waitForTimeout(130); await page.keyboard.up('ArrowRight');
      } else {
        const button = page.locator('[data-key="ArrowRight"]');
        const box = await button.boundingBox();
        const touch = await context.newCDPSession(page);
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
        await page.waitForTimeout(130);
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await touch.detach();
      }
      const afterMove = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
      if (afterMove.travelled <= 0 || afterMove.player.x === before.player.x) throw Error(`Movement failed in ${mapId}`);
      const action = page.locator(`[data-action="${landmarkId}/inspect"]`);
      await action.waitFor({ state: 'visible' });
      const hit = await action.boundingBox();
      if (hit.width < 44 || hit.height < 44) throw Error('Undersized interaction');
      await action.click(); await page.waitForTimeout(250);
      const reacted = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
      if (!reacted.life.discoveries.some(item => item.landmarkId === landmarkId)) throw Error(`No discovery at ${landmarkId}`);
      await page.screenshot({ path: path.join(out, `${name}-${mapId}-reaction.png`) });
      await page.reload(); await page.waitForFunction(() => window.__LIFE_PROOF__);
      const restored = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
      if (!restored.life.discoveries.some(item => item.landmarkId === landmarkId)) throw Error(`Discovery lost on reload at ${landmarkId}`);
      await page.evaluate(({ mapId, point }) => { window.__LIFE_PROOF__.setMap(mapId); window.__LIFE_PROOF__.seedApproach(point); }, { mapId, point: afterMove.player });
      await page.waitForTimeout(100);
      await page.locator(`[data-action="${landmarkId}/inspect"]`).click();
      const repeated = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
      if (repeated.life.discoveries.filter(item => item.landmarkId === landmarkId).length !== 1) throw Error('Duplicate discovery');
      visits.push({ mapId, landmarkId, initialApproach: point, before: before.player, after: afterMove.player, travelled: afterMove.travelled, discoveries: repeated.life.discoveries, reactions: repeated.life.reactions, persistedClockMs: restored.life.elapsedMs });
    }
    await page.evaluate(() => window.__LIFE_PROOF__.setMap('workshop'));
    await page.waitForTimeout(100);
    const motionBefore = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
    const actor = motionBefore.actors[0];
    await page.evaluate(point => window.__LIFE_PROOF__.seedApproach(point), actor.position);
    await page.screenshot({ path: path.join(out, `${name}-workshop-motion-before.png`) });
    await page.waitForTimeout(4000);
    const motionAfter = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
    await page.screenshot({ path: path.join(out, `${name}-workshop-motion-after.png`) });
    if (!motionAfter.actors.some(actor => { const before = motionBefore.actors.find(item => item.id === actor.id); return before && Math.hypot(actor.position.x - before.position.x, actor.position.y - before.position.y) > .1; })) throw Error('Residents did not move');
    const diag = [];
    for (const mapId of ['town', 'courtyard', 'workshop', 'rooftop', 'park', 'riverbank']) {
      await page.evaluate(id => window.__LIFE_PROOF__.setMap(id), mapId);
      await page.waitForTimeout(50);
      const state = await page.evaluate(() => window.__LIFE_PROOF__.inspect());
      diag.push({ mapId, actors: state.actors.map(actor => actor.id), diagnostics: state.diagnostics });
    }
    if (errors.length) throw Error(errors.join('\n'));
    const video = page.video();
    await context.close();
    reports.push({ name, viewport, visits, motionBefore: motionBefore.actors, motionAfter: motionAfter.actors, diagnostics: diag, errors, sources: motionAfter.sources, video: await video.path(), limitations: ['Isolated life harness with schematic ground, not integrated world art acceptance.', 'Approach starts are explicit proof fixtures; keyboard/pointer movement and DOM actions execute normally.', 'LocalStorage is isolated proof persistence, not the foundation IndexedDB save integration.', 'Phone directional proof uses real CDP touchscreen input on the control; full production touch travel remains pending.'] });
  }
  await writeFile(path.join(out, 'evidence.json'), JSON.stringify(reports, null, 2));
  console.log(JSON.stringify({ reports: reports.map(item => ({ device: item.name, visits: item.visits.length, actors: item.motionAfter.length, errors: item.errors, video: item.video })), output: out }));
} finally { await browser.close(); }
