// Run after pnpm build. No repository files are served or modified by this driver.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const servers = [
  spawn('node_modules/.bin/vite', ['--host', '127.0.0.1', '--port', '5414', '--strictPort'], { stdio: 'ignore' }),
  spawn('node_modules/.bin/vite', ['preview', '--base', '/junyan/', '--host', '127.0.0.1', '--port', '5415', '--strictPort'], { stdio: 'ignore' }),
];
let browser;
const checks = [];
const assert = (condition, description) => {
  if (!condition) throw new Error(description);
  checks.push(description);
};
try {
  for (const port of [5414, 5415]) {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { ready = (await fetch(`http://127.0.0.1:${port}/`)).ok; } catch {}
      if (ready) break;
      await delay(100);
    }
    assert(ready, `strict server ${port} available`);
  }
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--mute-audio', '--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/ambience-probe.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="zh-CN"><body></body></html>' }));
  await page.goto('http://127.0.0.1:5414/ambience-probe.html');
  await page.evaluate(async () => {
    const { createAmbience, ambienceAsset } = await import('/src/audio/ambience.ts');
    const probe = window.ambienceProbe = { elements: [], plays: 0, errors: [], control: null };
    probe.control = createAmbience(() => {
      const audio = new Audio(new URL(ambienceAsset, location.href).href);
      const play = audio.play.bind(audio);
      audio.play = () => { probe.plays++; return play(); };
      probe.elements.push(audio);
      return audio;
    }, error => { if (error) probe.errors.push(error); });
    probe.control.update({ restaurant: true });
    const button = document.createElement('button');
    button.textContent = '试音';
    button.id = 'ambience-probe';
    button.onclick = () => probe.control.gesture();
    document.body.prepend(button);
  });
  assert(await page.evaluate(() => window.ambienceProbe.elements.length === 0), 'no ambience created before gesture');
  await page.locator('#ambience-probe').click();
  await page.waitForFunction(() => window.ambienceProbe.elements[0]?.currentTime > .1);
  assert(await page.evaluate(() => {
    const p = window.ambienceProbe;
    return p.elements.length === 1 && p.plays === 1 && p.elements[0].loop && !p.elements[0].paused;
  }), 'real MP3 decodes and plays once after gesture');
  await page.evaluate(() => window.ambienceProbe.control.update({ speaking: true }));
  assert(await page.evaluate(() => Math.abs(window.ambienceProbe.elements[0].volume - .042) < .0001), 'speech state ducks native element volume to .042');
  for (const [off, on, label] of [
    [{ visible: false }, { visible: true }, 'hidden/visible'],
    [{ restaurant: false }, { restaurant: true }, 'leave/return'],
    [{ muted: true }, { muted: false }, 'mute/unmute'],
    [{ level: 0 }, { level: .35 }, 'zero/restore'],
  ]) {
    await page.evaluate(patch => window.ambienceProbe.control.update(patch), off);
    assert(await page.evaluate(() => window.ambienceProbe.elements[0].paused), `${label}: native playback paused`);
    await page.evaluate(patch => { window.ambienceProbe.control.update(patch); window.ambienceProbe.control.update(patch); }, on);
    await page.waitForFunction(() => !window.ambienceProbe.elements[0].paused);
    assert(await page.evaluate(() => window.ambienceProbe.elements.length === 1), `${label}: one reused native element`);
  }
  assert(await page.evaluate(() => window.ambienceProbe.plays === 5 && !window.ambienceProbe.errors.length), 'five deliberate starts, no duplicate starts or media failures');
  await page.evaluate(() => window.ambienceProbe.control.dispose());
  assert(await page.evaluate(() => window.ambienceProbe.elements[0].paused), 'disposal pauses real playback');

  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['phone', { width: 390, height: 844 }],
  ]) {
    const layout = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    layout.on('pageerror', error => errors.push(String(error)));
    layout.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await layout.goto('http://127.0.0.1:5414/?test=1&seed=42&opening=skip');
    const start = layout.getByRole('button', { name: '开门迎客' });
    await start.waitFor();
    await start.click();
    await layout.locator('canvas').waitFor();
    await layout.screenshot({ path: `docs/evidence/0063/screenshots/${name}-baseline-reduced-motion.png`, fullPage: true });
    assert(await layout.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} reduced-motion baseline has no horizontal overflow`);
    await layout.close();
  }

  // Production scope-relative asset and service-worker cold-cache/offline decode.
  await page.goto('http://127.0.0.1:5415/junyan/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await page.context().setOffline(true);
  const offline = await page.evaluate(async () => {
    const url = new URL('audio/ambience/breakfast.mp3', location.href);
    const response = await fetch(url);
    const bytes = (await response.arrayBuffer()).byteLength;
    const audio = new Audio(url.href);
    audio.preload = 'auto';
    await new Promise((resolve, reject) => { audio.oncanplaythrough = resolve; audio.onerror = reject; audio.load(); });
    return { bytes, duration: audio.duration };
  });
  console.log(JSON.stringify({ offline }));
  assert(offline.bytes === 438572 && Math.abs(offline.duration - 73) < .02, 'offline production subpath asset cached and decodable (438572 bytes, 73 seconds)');
  assert(!errors.length, `browser page errors absent (${errors.length})`);
  writeFileSync('docs/evidence/0063/browser-results.json', JSON.stringify({ status: 'PASS', checks, offline, limits: 'Silent automated run. Controller supplied lifecycle/speech state directly; game wiring, visible controls and subjective listening are not verified.' }, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', checks: checks.length, offline }));
} finally {
  await browser?.close();
  for (const server of servers) server.kill();
}
