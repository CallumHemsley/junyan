import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';

const directory = resolve(process.argv[2] ?? 'output/playwright/0053-video');
const url = process.argv[3] ?? 'http://127.0.0.1:5182';
const seconds = 3;
await mkdir(directory, {recursive:true});
const browser = await chromium.launch({args:['--mute-audio']});
const size = {width:390, height:844};
const context = await browser.newContext({viewport:size, deviceScaleFactor:2, isMobile:true, hasTouch:true, recordVideo:{dir:directory, size}});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type()==='error') errors.push(message.text()); });
let video;
try {
  await page.goto(`${url}/?test=1&seed=42&opening=skip`);
  const steps = await page.evaluate(async () => {
    const {createRenderer} = await import('/src/scene/renderer.js');
    const {wardScene} = await import('/src/scene/ward.js');
    const {WARD_STEPS} = await import('/src/scene/ward-steps.js');
    document.body.innerHTML = '<main style="margin:0;padding:24px 0;background:#f4eee4;min-height:100vh;font:15px system-ui;color:#241d16"><canvas style="width:100%;image-rendering:pixelated;display:block"></canvas><p id="step" style="padding:12px 16px;margin:0"></p></main>';
    document.body.style.margin = '0';
    const renderer = createRenderer(document.querySelector('canvas'), wardScene);
    const label = document.getElementById('step');
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now()-start)/1000;
      const index = Math.min(WARD_STEPS.length-1, Math.floor(elapsed/3));
      const [name, frame] = WARD_STEPS[index];
      label.textContent = `${index+1}/${WARD_STEPS.length} ${name}`;
      renderer.draw(frame, elapsed);
      requestAnimationFrame(tick);
    };
    tick();
    return WARD_STEPS.length;
  });
  await page.waitForTimeout(steps*seconds*1000+500);
  assert.deepEqual(errors, []);
  video = page.video();
} finally {
  await context.close();
  await browser.close();
}
const destination = resolve(directory, 'ward-review.mp4');
execFileSync('ffmpeg', ['-y','-i',await video.path(),'-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',destination], {stdio:'pipe'});
const duration = Number(execFileSync('ffprobe', ['-v','quiet','-show_entries','format=duration','-of','csv=p=0',destination], {encoding:'utf8'}));
assert(duration >= 30 && duration <= 60, `duration ${duration}`);
console.log(JSON.stringify({destination, duration, errors}));
