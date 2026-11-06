import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { cameraForMap, project } from '../../../../../output/world-0080-e02-runtime/src/world/camera.ts';
import { findPath } from '../../../../../output/world-0080-e02-runtime/src/world/geometry.ts';

const base = process.env.COURTYARD_PROOF_URL ?? 'http://127.0.0.1:5482';
const map = JSON.parse(await readFile('src/world/maps/courtyard/map.json', 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const results = [];
const checkpointKey = 'junyan-waiter-pending-v1';
try {
  const setup = await browser.newPage();
  await setup.goto(`${base}/?test=1&seed=42&opening=skip`);
  await setup.waitForFunction(() => window.__TEST__?.getState());
  const initial = await setup.evaluate(() => window.__TEST__.getState());
  await setup.close();
  for (const [name, width, height, touch] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: touch, hasTouch: touch, serviceWorkers: 'block' });
    const seeded = structuredClone(initial);
    seeded.world = { version: 1, mapId: 'courtyard', position: { x: 23, y: 33.5 }, facing: 'north', returnPositions: {}, activeActivity: null };
    await context.addInitScript(({ key, game }) => { if (!sessionStorage.getItem('courtyard-proof-seeded')) { localStorage.setItem(key, JSON.stringify(game)); sessionStorage.setItem('courtyard-proof-seeded', 'true'); } }, { key: checkpointKey, game: seeded });
    const page = await context.newPage(), errors = [], failures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => failures.push({ url: request.url(), error: request.failure()?.errorText }));
    const encoder = spawn('/usr/bin/ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', `docs/evidence/world/0080/e02/${name}-app-traversal.mp4`], { stdio: ['pipe', 'ignore', 'pipe'] });
    const encoderErrors = []; encoder.stderr.on('data', chunk => encoderErrors.push(chunk.toString()));
    const cdp = await context.newCDPSession(page), frameTimes = [];
    cdp.on('Page.screencastFrame', frame => { frameTimes.push(frame.metadata.timestamp); encoder.stdin.write(Buffer.from(frame.data, 'base64')); void cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {}); });
    page.on('close', () => encoder.stdin.end());
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: width, maxHeight: height, everyNthFrame: 1 });
    const saved = () => page.evaluate(async key => {
      const pending = localStorage.getItem(key); if (pending) return JSON.parse(pending);
      return new Promise((resolve, reject) => { const request = indexedDB.open('junyan-waiter', 1); request.onerror = () => reject(request.error); request.onsuccess = () => { const db = request.result; const get = db.transaction('saves', 'readonly').objectStore('saves').get('v1'); get.onsuccess = () => { resolve(get.result); db.close(); }; get.onerror = () => reject(get.error); }; });
    }, checkpointKey);
    await page.goto(`${base}/?seed=42&opening=skip`);
    await page.locator('[data-testid="world-viewport"][data-map="courtyard"] canvas[data-rendered="true"]').waitFor();
    const welcome = page.getByRole('button', { name: /开门迎客/ });
    if (await welcome.isVisible()) await welcome.click();
    await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-app-arrival.png` });
    const start = (await saved()).world.position;
    await page.locator('[data-testid="world-viewport"]').focus();
    if (touch) {
      const pad = page.getByRole('button', { name: '向右走', exact: true });
      const box = await pad.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(500); await page.mouse.up();
    } else { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight'); }
    const keyboardEnd = (await saved()).world.position;
    console.log(JSON.stringify({ name, start, keyboardEnd, ui: await page.locator('body').innerText(), focus: await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 250)), errors }));
    await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-movement-check.png` });
    assert(Math.hypot(keyboardEnd.x - start.x, keyboardEnd.y - start.y) > .5, `${name} movement must visibly change saved world position`);
    const traversed = [];
    async function walkTo(goal) {
      let here = (await saved()).world.position;
      const path = findPath(map, here, goal);
      assert(path.length, `Shared path must reach ${JSON.stringify(goal)}`);
      for (const waypoint of path) {
        const distance = Math.hypot(waypoint.x - here.x, waypoint.y - here.y), steps = Math.max(1, Math.ceil(distance / 3));
        const begin = { ...here };
        for (let i = 1; i <= steps; i++) {
          const target = { x: begin.x + (waypoint.x - begin.x) * i / steps, y: begin.y + (waypoint.y - begin.y) * i / steps };
          here = (await saved()).world.position;
          const canvas = page.locator('[data-testid="world-viewport"] canvas'), bounds = await canvas.boundingBox();
          const size = await canvas.evaluate(c => ({ width: c.width, height: c.height }));
          const camera = cameraForMap(map.bounds, here, size.width, size.height, bounds.width < 600 ? 11 : 15);
          const point = project(target, camera);
          const px = bounds.x + point.x / size.width * bounds.width;
          const py = bounds.y + point.y / size.height * bounds.height;
          assert(px > bounds.x && px < bounds.x + bounds.width && py > bounds.y && py < bounds.y + bounds.height, 'Pointer path segment must be inside actual canvas');
          if (touch) await page.touchscreen.tap(px, py); else await page.mouse.click(px, py);
          const deadline = Date.now() + 5000;
          for (;;) {
            const at = (await saved()).world.position;
            if (Math.hypot(at.x - target.x, at.y - target.y) < .15) break;
            assert(Date.now() < deadline, `Actual pointer travel did not reach ${JSON.stringify(target)}; stopped at ${JSON.stringify(at)}`);
            await page.waitForTimeout(100);
          }
          here = (await saved()).world.position; traversed.push(here);
        }
      }
      await page.waitForTimeout(600);
      const arrived = (await saved()).world.position;
      console.log('arrived', name, goal, arrived);
      assert(Math.hypot(arrived.x - goal.x, arrived.y - goal.y) < .25, 'Stable final position must match intended landmark');
    }
    await walkTo({ x: 14.5, y: 18.5 });
    await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-app-bicycle.png` });
    let approach = (await saved()).world.position;
    await page.locator('[data-world-anchor="courtyard.white"]').click();
    await page.locator('.world-context[data-target="cat"]').waitFor();
    approach = (await saved()).world.position;
    let activity = { status: 'pending' };
    try {
      assert.equal(await page.locator('.cats-view').getAttribute('data-presentation'), 'controls');
      assert.equal(await page.getByTestId('cats-white').count(), 0);
      for (const action of ['crouch', 'wait', 'approach', 'follow', 'reunite']) await page.getByTestId(`cats-action-${action}`).click();
      const reunited = await saved();
      assert.equal(reunited.neighbourhood.cats.story.node, 'reunited');
      assert.equal(reunited.day, initial.day);
      assert.deepEqual(reunited.player, initial.player);
      activity = { status: 'completed', story: reunited.neighbourhood.cats.story };
      await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-app-reunion.png` });
    } catch (error) {
      activity = { status: 'blocked', error: error.message };
      throw error;
      await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-app-activity-blocked.png` });
    }
    await page.locator('.world-context-close').click();
    assert(Math.hypot((await saved()).world.position.x - approach.x, (await saved()).world.position.y - approach.y) < .01, 'Activity return must retain approach');
    await walkTo({ x: 34.5, y: 20.6 });
    await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-app-bench.png` });
    await page.waitForTimeout(600);
    const beforeReload = await saved(); console.log('reload-source', name, beforeReload.world); await page.reload();
    await page.locator('[data-testid="world-viewport"][data-map="courtyard"] canvas[data-rendered="true"]').waitFor();
    const afterReload = await saved();
    assert.equal(afterReload.neighbourhood.cats.story.node, beforeReload.neighbourhood.cats.story.node);
    assert.deepEqual(afterReload.world.position, beforeReload.world.position);
    assert.equal(afterReload.day, initial.day);
    await page.screenshot({ path: `docs/evidence/world/0080/e02/${name}-app-reloaded.png` });
    results.push({ name, runtimeManifest: 'runtime-manifest.json', sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), seededStart: true, start, keyboardEnd, traversed, approach, preservedRestaurantPosition: afterReload.player, catStory: afterReload.neighbourhood.cats.story, activity, journalEntries: Object.keys(afterReload.journal).length, reloadPosition: afterReload.world.position, errors, failures, limits: 'Seeded normal saved game starts in courtyard. Actual keyboard/pad/pointer travel, feature actions and persistence are used. Connected entrance journey and opening/service regression remain separate gates.' });
    await cdp.send('Page.stopScreencast'); await cdp.detach(); encoder.stdin.end();
    await new Promise((resolve, reject) => encoder.on('close', code => code === 0 ? resolve() : reject(Error(encoderErrors.join('')))));
    await writeFile(`docs/evidence/world/0080/e02/${name}-frame-times.json`, JSON.stringify({ source: 'Actual Chromium CDP screencast frames encoded using installed system ffmpeg; 30fps output, no audio track', frames: frameTimes }));
    await context.close();
  }
} finally { await browser.close(); await writeFile('docs/evidence/world/0080/e02/app-proof.json', `${JSON.stringify(results, null, 2)}\n`); }
console.log(JSON.stringify(results.map(({ name, catStory, activity, errors, failures }) => ({ name, catStory, activity, errors, failures })), null, 2));
