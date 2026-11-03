import { chromium } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shotsDir = join(here, 'shots');
const pageUrl = pathToFileURL(join(here, 'index.html')).href;

const MAX_ACTIONS = 80;
const SETTLE_MS = 150;
const CLICK_TIMEOUT = 5000;

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
};

const RUNS = [
  ...['A', 'B', 'C'].flatMap((variant) =>
    Object.keys(VIEWPORTS).map((viewport) => ({ variant, viewport, fog: 1, endOnly: false })),
  ),
  { variant: 'A', viewport: 'phone', fog: 0, endOnly: true },
];

const runName = (run) => `${run.variant}${run.fog ? '' : '-fog0'}-${run.viewport}`;

const isEnglish = (step) => step.type === 'card' || step.type === 'think' || (step.type === 'say' && 'en' in step);
const isChinese = (step) => 'zh' in step;

function runList(content, variant) {
  return [
    ...content.variants[variant].intro,
    ...content.shared.filter((step) => !step.only || step.only === variant),
  ];
}

function handoverIndex(steps) {
  return steps.findIndex((step, i) => isChinese(step) && steps.slice(0, i).some(isEnglish));
}

async function drive(browser, run) {
  const context = await browser.newContext({ viewport: VIEWPORTS[run.viewport], reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

  const result = { run, shots: [], visited: new Set(), actions: 0, recovered: [], done: false, errors, failure: null };
  const state = () => page.evaluate(() => window.__SPIKE__.state());

  async function shoot(beat) {
    const s = await state();
    if (run.endOnly && s.type !== 'end') return;
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(SETTLE_MS);
    const nn = String(result.shots.length + 1).padStart(2, '0');
    const file = `${runName(run)}-${nn}-${s.type}.png`;
    await page.screenshot({ path: join(shotsDir, file), fullPage: true });
    result.shots.push({ file, caption: `${nn} · step ${s.stepIndex} · ${s.type} · ${beat}` });
  }

  let firstRecoveryShot = false;
  async function click(testid, waitFor) {
    if (++result.actions > MAX_ACTIONS) {
      throw new Error(`exceeded ${MAX_ACTIONS} actions; state ${JSON.stringify(await state())}`);
    }
    const before = await state();
    await page.getByTestId(testid).first().click({ timeout: CLICK_TIMEOUT });
    await waitFor(before);
    const after = await state();
    if (!firstRecoveryShot && before.recovered.length === 0 && after.recovered.length > 0) {
      firstRecoveryShot = true;
      await shoot(`first word recovered (${after.recovered.join(' ')})`);
    }
  }

  const untilStepChanges = (before) =>
    page.waitForFunction(
      (prev) => {
        const s = window.__SPIKE__.state();
        return s.stepIndex !== prev || s.done;
      },
      before.stepIndex,
      { timeout: CLICK_TIMEOUT },
    );
  const untilContinueVisible = () => page.getByTestId('continue').first().waitFor({ state: 'visible', timeout: CLICK_TIMEOUT });
  const settle = () => page.waitForTimeout(SETTLE_MS * 2);

  try {
    await page.goto(`${pageUrl}?variant=${run.variant}&fog=${run.fog}`);
    await page.waitForFunction(() => typeof window.__SPIKE__?.state === 'function' && window.CONTENT, null, { timeout: CLICK_TIMEOUT });
    await page.locator('#app[data-step-index]').waitFor({ timeout: CLICK_TIMEOUT });

    const steps = runList(await page.evaluate(() => window.CONTENT), run.variant);
    const items = await page.evaluate(() => window.CONTENT.items);
    const handover = handoverIndex(steps);
    let firstStep = true;
    let firstRequest = true;
    let firstReply = true;

    const advance = () => click('continue', untilStepChanges);
    const ACT = {
      card: advance,
      say: advance,
      think: advance,
      async request(step) {
        const wrong = items.find((hanzi) => hanzi !== step.want);
        await click(`item-${wrong}`, settle);
        if (firstRequest) await shoot(`wrong item (${wrong}), puzzled`);
        firstRequest = false;
        await click(`item-${step.want}`, untilContinueVisible);
        await advance();
      },
      async reply() {
        const chip = page.locator('[data-testid^="reply-"]').first();
        await click(await chip.getAttribute('data-testid'), untilContinueVisible);
        await advance();
      },
    };

    for (;;) {
      const s = await state();
      result.visited.add(s.stepIndex);
      result.recovered = s.recovered;
      if (s.type === 'end') {
        result.done = s.done;
        await shoot('end card');
        break;
      }
      const step = steps[s.stepIndex];
      if (!step || step.type !== s.type) {
        throw new Error(`run list step ${s.stepIndex} is ${step?.type} but engine says ${s.type}`);
      }
      const beats = [
        firstStep && 'first step',
        s.stepIndex === handover && 'handover, first Chinese after English',
        s.type === 'request' && firstRequest && 'first request, tray',
        s.type === 'reply' && firstReply && 'reply',
      ].filter(Boolean);
      firstStep = false;
      if (s.type === 'reply') firstReply = false;
      if (beats.length) await shoot(beats.join(' + '));

      const act = ACT[s.type];
      if (!act) throw new Error(`no action for step type ${s.type}; state ${JSON.stringify(s)}`);
      await act(step);
    }
  } catch (err) {
    result.failure = err.message.split('\n')[0];
    await page.screenshot({ path: join(shotsDir, `${runName(run)}-FAILED.png`), fullPage: true }).catch(() => {});
    result.shots.push({ file: `${runName(run)}-FAILED.png`, caption: `FAILED · ${result.failure}` });
  } finally {
    await context.close();
  }
  return result;
}

function contactSheet(results) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = results
    .map(
      (r) => `<section>
  <h2>${esc(runName(r.run))} <small>${r.done ? 'done' : 'NOT DONE'} · ${r.errors.length} errors${r.failure ? ` · ${esc(r.failure)}` : ''}</small></h2>
  <div class="row">
${r.shots
  .map((s) => `    <figure><a href="${esc(s.file)}"><img src="${esc(s.file)}" loading="lazy"></a><figcaption>${esc(s.caption)}</figcaption></figure>`)
  .join('\n')}
  </div>
</section>`,
    )
    .join('\n');
  return `<!doctype html>
<meta charset="utf-8">
<title>Hospital opening: contact sheet</title>
<style>
  body { font: 14px system-ui, sans-serif; margin: 24px; background: #f4f1ea; color: #222; }
  h2 { font-size: 16px; margin: 32px 0 8px; }
  small { font-weight: normal; color: #666; }
  .row { display: flex; gap: 16px; overflow-x: auto; align-items: flex-start; padding-bottom: 8px; }
  figure { margin: 0; flex: 0 0 auto; }
  img { display: block; max-height: 420px; max-width: 520px; border: 1px solid #ccc; background: #fff; }
  figcaption { max-width: 280px; margin-top: 4px; color: #444; }
</style>
<h1>Hospital opening: contact sheet</h1>
<p>Generated ${esc(new Date().toISOString())} by verify.mjs. One row per variant and viewport.</p>
${rows}
`;
}

await rm(shotsDir, { recursive: true, force: true });
await mkdir(shotsDir, { recursive: true });

const browser = await chromium.launch();
const results = [];
for (const run of RUNS) results.push(await drive(browser, run));
await browser.close();

await writeFile(join(shotsDir, 'index.html'), contactSheet(results));

console.table(
  results.map((r) => ({
    variant: `${r.run.variant}${r.run.fog ? '' : ' (fog0)'}`,
    viewport: r.run.viewport,
    steps: r.visited.size,
    actions: r.actions,
    recovered: r.recovered.length,
    done: r.done,
    'console errors': r.errors.length,
    shots: r.shots.length,
  })),
);
const failed = results.filter((r) => !r.done || r.errors.length || r.failure);
for (const r of failed) {
  console.error(`\n${runName(r.run)}: ${r.failure ?? (r.done ? '' : 'did not reach done')}`);
  for (const e of r.errors) console.error(`  ${e}`);
}
console.log(`\nContact sheet: ${pathToFileURL(join(shotsDir, 'index.html')).href}`);
process.exit(failed.length ? 1 : 0);
