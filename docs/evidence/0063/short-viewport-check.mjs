// Focused supplement for final 7779574 runtime: no application changes or audio playback to speakers.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const url = 'http://127.0.0.1:5414';
const server = spawn('node_modules/.bin/vite', ['--host', '127.0.0.1', '--port', '5414', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(`Strict-port server exited ${server.exitCode}`);
    try { ready = (await fetch(url)).ok; } catch {}
    if (ready) break;
    await delay(100);
  }
  assert(ready, 'strict server ready');
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--mute-audio', '--no-sandbox'] });
  const results = [];
  for (const viewport of [{ width: 320, height: 320 }, { width: 568, height: 320 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${url}/?test=1&seed=42&opening=skip`);
    await page.getByRole('button', { name: '开门迎客' }).click();
    await page.getByLabel('环境声设置', { exact: true }).click();
    const pane = await page.locator('.ambience-options').boundingBox();
    const toggle = await page.getByRole('checkbox', { name: '环境声', exact: true }).locator('..').boundingBox();
    const slider = await page.getByRole('slider', { name: '环境声音量' }).boundingBox();
    assert(pane.x >= 12 && pane.x + pane.width <= viewport.width - 12, 'panel inside horizontal gutters');
    assert(pane.y >= 0 && pane.y + pane.height <= viewport.height, 'panel inside short viewport vertically');
    for (const target of [toggle, slider]) {
      assert(target.width >= 44 && target.height >= 44, '44px label/range target');
      assert(target.x >= 0 && target.y >= 0 && target.x + target.width <= viewport.width && target.y + target.height <= viewport.height, 'control visible without scrolling');
    }
    const screenshot = `docs/evidence/0063/screenshots/short-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ path: screenshot, fullPage: false });
    assert.deepEqual(errors, [], 'clean console/page errors');
    results.push({ viewport, pane, toggle, slider, screenshot, errors });
    await page.close();
  }
  writeFileSync('docs/evidence/0063/short-viewport-results.json', JSON.stringify({ runtimeHead: '77795742da738de2b93506b73a9f40d98717a243', status: 'PASS', limits: 'Focused native-browser layout supplement. No listening or final independent approval claimed.', results }, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally {
  await browser?.close();
  server.kill();
}
