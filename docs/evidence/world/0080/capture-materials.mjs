import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--mute-audio'] });
const results = [];
try {
  for (const [name, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`${process.env.COURTYARD_PROOF_URL ?? 'http://127.0.0.1:5482'}/docs/evidence/world/0080/material-proof.html`);
    await page.waitForFunction(() => window.courtyardMaterials);
    const frames = {};
    for (const phase of ['morning', 'evening']) {
      const proof = await page.evaluate(phase => window.courtyardMaterials.render(phase), phase);
      assert.deepEqual(proof.alphaFailures, []);
      assert(proof.materialBaseCount > 30, 'Real scene material families must call the shader');
      frames[phase] = proof;
      await page.screenshot({ path: `docs/evidence/world/0080/${name}-materials-${phase}.png` });
    }
    for (const family of ['wood', 'masonry', 'foliage', 'cat']) assert.notEqual(frames.morning.materialExamples[family], frames.evening.materialExamples[family], `${family} must change under the same callback phase`);
    assert.deepEqual(frames.morning.camera, frames.evening.camera);
    assert.equal(new Set(Object.values(frames.evening.materialExamples)).size, 4, 'Material families must remain distinct');
    results.push({ name, frames }); await page.close();
  }
} finally { await browser.close(); }
await writeFile('docs/evidence/world/0080/material-proof.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results.map(({ name, frames }) => ({ name, morning: frames.morning.materialExamples, evening: frames.evening.materialExamples, alphaFailures: frames.evening.alphaFailures })), null, 2));
