import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const dir = new URL('./', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--mute-audio']});
const errors = [];
for (const [device, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
  const page = await browser.newPage({viewport: {width, height}, reducedMotion: 'reduce'});
  page.on('pageerror', error => errors.push(`${device}: ${error.message}`));
  await page.goto('http://127.0.0.1:5485/src/features/garden/harness.html?test=1');
  await page.getByTestId('garden-scene').waitFor();
  await page.screenshot({path: `${dir}baseline-${device}.png`, fullPage: true});
  await page.goto('http://127.0.0.1:5485/src/world/art/rooftop/harness.html?test=1');
  await page.getByRole('button', {name: '全景', exact: true}).click();
  await page.screenshot({path: `${dir}seedlings-${device}.png`});
  await page.getByRole('button', {name: '长成', exact: true}).click();
  await page.screenshot({path: `${dir}mature-overview-${device}.png`});
  for (const [label, name] of [['花园', 'garden'], ['楼梯', 'stairs'], ['凉棚', 'terrace'], ['远景', 'skyline']]) {
    await page.getByRole('button', {name: label, exact: true}).click();
    await page.screenshot({path: `${dir}${name}-${device}.png`});
  }
  await page.getByRole('button', {name: '花园', exact: true}).click();
  await page.getByRole('button', {name: '积水', exact: true}).click();
  await page.screenshot({path: `${dir}drooping-${device}.png`});
  await page.close();
}
await browser.close();
await writeFile(`${dir}art-capture.json`, JSON.stringify({errors, note: 'Adapter-only render proof. No player traversal or integration claimed.'}, null, 2));
if (errors.length) throw new Error(errors.join('\n'));
