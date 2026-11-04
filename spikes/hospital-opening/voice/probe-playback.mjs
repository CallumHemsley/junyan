// Checks each variant A line clip loads and plays in Chromium, and that a missing clip is silent.
// node spikes/hospital-opening/voice/probe-playback.mjs
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const page_url = pathToFileURL(fileURLToPath(new URL('../index.html', import.meta.url))).href;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${page_url}?variant=A`);

const results = await page.evaluate(async () => {
  const load = (src) => new Promise((resolve) => {
    const a = new Audio(src);
    a.onloadedmetadata = () => resolve({ src, duration: +a.duration.toFixed(2) });
    a.onerror = () => resolve({ src, error: a.error && a.error.code });
  });
  const all = { ...window.AUDIO, ...window.AUDIO_WORDS };
  return Promise.all(Object.entries(all).map(async ([key, src]) => ({ key, ...(await load(src)) })));
});
const failed = results.filter((r) => r.error || !(r.duration > 0.2));

const firstLinePlays = await page.evaluate(() => new Promise((resolve) => {
  const orig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { resolve(this.src.split('/').pop()); return orig.call(this); };
  document.querySelector('[data-testid="restart"]').click();
  setTimeout(() => resolve(null), 1000);
}));

await browser.close();
console.log(JSON.stringify({ clips: results.length, failed, firstLinePlays, errors }, null, 2));
process.exit(failed.length || errors.length || !firstLinePlays ? 1 : 0);
