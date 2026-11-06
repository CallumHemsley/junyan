import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { cameraForMap, project } from '../../../../src/world/camera.ts';
import { findPath } from '../../../../src/world/geometry.ts';

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
    const encoder = spawn('/usr/bin/ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', `docs/evidence/world/0080/${name}-depth-traversal.mp4`], { stdio: ['pipe', 'ignore', 'pipe'] });
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
    await page.screenshot({ path: `docs/evidence/world/0080/${name}-depth-arrival.png` });
    const start = (await saved()).world.position;
    await page.locator('[data-testid="world-viewport"]').focus();
    if (touch) {
      const pad = page.getByRole('button', { name: '向右走', exact: true });
      const box = await pad.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(500); await page.mouse.up();
    } else { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight'); }
    const keyboardEnd = (await saved()).world.position;
    console.log(JSON.stringify({ name, start, keyboardEnd, ui: await page.locator('body').innerText(), focus: await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 250)), errors }));
    await page.screenshot({ path: `docs/evidence/world/0080/${name}-depth-movement-check.png` });
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
    const views = [];
    for (const [id, goal] of [
      ['house-front', { x: 23, y: 20.5 }], ['house-side', { x: 28.6, y: 16.6 }], ['house-behind', { x: 23, y: 12.6 }],
      ['tree-behind', { x: 9.9, y: 25.4 }], ['tree-side', { x: 12.1, y: 26.6 }], ['tree-front', { x: 11.2, y: 28.1 }],
      ['bench-front', { x: 37, y: 20 }], ['bench-side', { x: 40.5, y: 18.2 }], ['bench-behind', { x: 37, y: 16.9 }],
    ]) {
      await walkTo(goal);
      views.push({ id, position: (await saved()).world.position });
      await page.screenshot({ path: `docs/evidence/world/0080/${name}-depth-${id}.png` });
    }
    results.push({ name, sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), seededStart: true, views, errors, failures, limits: 'Actual physical pointer/touch walking to front/side/behind viewpoints in production. Screenshots require visual inspection; no automated visual-quality PASS is inferred.' });
    await cdp.send('Page.stopScreencast'); await cdp.detach(); encoder.stdin.end();
    await new Promise((resolve, reject) => encoder.on('close', code => code === 0 ? resolve() : reject(Error(encoderErrors.join('')))));
    await writeFile(`docs/evidence/world/0080/${name}-depth-frame-times.json`, JSON.stringify({ source: 'Actual Chromium CDP screencast frames encoded using installed system ffmpeg; 30fps output, no audio track', frames: frameTimes }));
    await context.close();
  }
} finally { await browser.close(); await writeFile('docs/evidence/world/0080/depth-proof.json', `${JSON.stringify(results, null, 2)}\n`); }
console.log(JSON.stringify(results.map(({ name, views, errors }) => ({ name, views, errors })), null, 2));
