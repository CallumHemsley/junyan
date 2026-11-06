import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const directory = resolve('docs/evidence/0079');
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--mute-audio'] });
const errors = [];
try {
 for (const [device, viewport] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('http://127.0.0.1:5481/src/world/art/town/preview.html');
  await page.waitForFunction(() => window.townPreview);
  for (const [label, point] of [['breakfast', { x: 34, y: 32 }], ['laundry', { x: 22.5, y: 21 }], ['market', { x: 35, y: 41 }], ['moon-gate', { x: 45, y: 7 }], ['workshop', { x: 72, y: 33 }], ['river', { x: 72, y: 47 }]]) {
   await page.evaluate(p => window.townPreview.render(p), point);
   await page.screenshot({ path: resolve(directory, `${device}-${label}.png`) });
  }
  await page.close();
 }
 await writeFile(resolve(directory, 'preview-console.json'), JSON.stringify({ errors, surface: 'isolated town art preview', integrationAcceptance: false }, null, 2) + '\n');
 if (errors.length) throw new Error(errors.join('\n'));
} finally { await browser.close(); }
