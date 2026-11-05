import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const mode = process.argv[2] ?? 'rehearsal';
assert(['rehearsal', 'tour'].includes(mode), 'Use rehearsal or tour');
const base = process.env.JUNYAN_DEMO_URL ?? 'http://127.0.0.1:5474/';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Capture only a local app');
const out = resolve(process.env.JUNYAN_DEMO_OUTPUT ?? `output/playwright/neighbourhood-${mode}`);
await mkdir(join(out, 'frames'), { recursive: true });
const content = JSON.parse(await readFile('src/content/content.json', 'utf8'));
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1440, height: 1080}, deviceScaleFactor: 1});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
page.on('response', response => {if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);});
await page.addInitScript(() => {
  const context = new AudioContext({sampleRate: 48000});
  const destination = context.createMediaStreamDestination();
  // Keep recorder time advancing before the first actual game sound.
  const clock = context.createConstantSource(); clock.offset.value = 0;
  clock.connect(destination); clock.start();
  const seen = new WeakSet();
  const active = new Set();
  const events = [];
  function tap(media) {
    if (seen.has(media)) return;
    const node = context.createMediaElementSource(media);
    node.connect(destination); node.connect(context.destination); seen.add(media);
    for (const event of ['playing', 'pause', 'ended', 'error']) media.addEventListener(event, () => {
      if (event === 'playing') active.add(media); else active.delete(media);
      events.push({event, src: media.currentSrc || media.src, epochMs: Date.now(), position: media.currentTime});
    });
  }
  window.Audio = new Proxy(window.Audio, {construct(target, args) {const media = Reflect.construct(target, args); tap(media); return media;}});
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    tap(this); context.resume();
    events.push({event: 'play', src: this.currentSrc || this.src, epochMs: Date.now(), volume: this.volume, muted: this.muted});
    return nativePlay.apply(this, args);
  };
  let recorder;
  const chunks = [];
  window.__DEMO_CAPTURE__ = {
    events,
    speaking: () => [...active].some(media => !media.loop && !media.paused && !media.ended),
    start: async () => {
      await context.resume();
      recorder = new MediaRecorder(destination.stream, {mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 192000});
      recorder.ondataavailable = event => chunks.push(event.data);
      const epochMs = Date.now(); recorder.start(100);
      return {epochMs, sampleRate: context.sampleRate, state: context.state};
    },
    stop: () => new Promise(resolve => {
      recorder.onstop = async () => {
        const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer());
        let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
        resolve({base64: btoa(binary), events, epochMs: Date.now()});
      };
      recorder.stop();
    }),
  };
});
await page.goto(`${base}?test=1&seed=42${mode === 'rehearsal' ? '&opening=skip' : '&opening=play'}`);
await page.locator('main').waitFor();
await page.addStyleTag({content: '#demo-pointer{position:fixed;width:15px;height:15px;border:2px solid #241d16;border-radius:50%;background:#fbf7ef99;z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%)}'});
await page.evaluate(() => {const pointer = document.createElement('div'); pointer.id = 'demo-pointer'; document.body.append(pointer); document.addEventListener('pointermove', event => {pointer.style.left = `${event.clientX}px`; pointer.style.top = `${event.clientY}px`;});});
const start = await page.evaluate(() => window.__DEMO_CAPTURE__.start());
const frames = [];
let recording = true;
const capturing = (async () => {
  while (recording) {
    const epochMs = await page.evaluate(() => Date.now());
    const file = `frames/${String(frames.length).padStart(6, '0')}.jpg`;
    await page.screenshot({path: join(out, file), type: 'jpeg', quality: 85});
    frames.push({file, epochMs});
    await page.waitForTimeout(20);
  }
})();
const actions = [];
const chapters = [];
const pause = async (minimum = 600) => {
  await page.waitForTimeout(minimum);
  await page.waitForFunction(() => !window.__DEMO_CAPTURE__.speaking(), null, {timeout: 20000});
  await page.waitForTimeout(250);
};
const click = async locator => {
  console.log(`Click ${await locator.first().textContent({timeout: 5000})}`);
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert(box, 'Control has a visible position');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {steps: 12});
  await page.waitForTimeout(250);
  actions.push({text: await locator.innerText(), epochMs: Date.now()});
  await locator.click(); await pause();
};
const button = name => page.getByRole('button', {name: new RegExp(`^${name}(?:\\s*[→↗])?$`)});
const chapter = name => chapters.push({name, epochMs: Date.now()});
const visit = async name => {chapter(name); await click(page.getByRole('navigation', {name: '楼里', exact: true}).getByRole('button', {name, exact: true}));};
const state = () => page.evaluate(() => window.__TEST__.getState());
async function serve(table) {
  const saved = await state();
  const customer = saved.customers.find(value => value.table === table);
  const order = content.orders.find(value => value.id === customer.orderId);
  await click(page.getByTestId(`table-${table}`));
  const dialog = page.getByRole('dialog', {name: `${table}桌点餐`});
  await click(dialog.getByRole('button', {name: /^去厨房/}));
  for (const item of order.items) for (let n = 0; n < item.quantity; n++) await click(button(`拿${content.foods.find(food => food.id === item.foodId).word.hanzi}`));
  await click(button('端好了，去上菜'));
  await click(page.getByTestId(`table-${table}`));
  await click(dialog.getByRole('button', {name: /^上菜/}));
  const total = order.items.reduce((sum, item) => sum + content.foods.find(food => food.id === item.foodId).price * item.quantity, 0);
  for (let n = 0; n < order.paid - total; n++) await click(dialog.getByRole('button', {name: '+1块', exact: true}));
  await click(dialog.getByRole('button', {name: /^递上找零/}));
  await click(dialog.getByRole('button', {name: /^继续招呼/}));
}
try {
  if (mode === 'rehearsal') {
    chapter('Restaurant rehearsal, opening skipped via dev hook');
    await click(button('开门迎客'));
    await serve(1);
  } else {
    chapter('Opening');
    await click(button('醒来'));
    for (const [index, step] of content.opening.steps.entries()) {
      await page.locator(`main.opening[data-step="${index}"]`).waitFor();
      await pause();
      if (step.type === 'request') await click(page.locator('.bedside-tray').getByRole('button', {name: content.foods.find(food => food.id === step.want).word.hanzi, exact: true}));
      if (step.type === 'reply') await click(page.locator('.reply-chips').getByRole('button', {name: '好', exact: true}));
      await click(page.locator('main.opening').getByRole('button', {name: '继续', exact: true}));
    }
    await click(button('开门迎客'));
    await visit('家');
    await click(button('收下'));
    await click(page.locator('.apartment-items').getByRole('button', {name: /桌子/}));
    await click(button('选格子')); await click(button('第2行第3格'));
    await click(button('转一下')); await click(button('放这里'));
    await page.screenshot({path: join(out, 'apartment.png')});
    await visit('院子');
    await click(page.getByTestId('cats-white'));
    for (const action of ['approach', 'crouch', 'wait', 'approach', 'follow', 'reunite']) await click(page.getByTestId(`cats-action-${action}`));
    await click(button('收下猫靠垫'));
    await page.screenshot({path: join(out, 'cats.png')});
    await visit('修理间');
    await click(page.getByTestId('repair-part-bulb'));
    await click(page.locator('.repair-part-actions').getByRole('button', {name: '拧紧', exact: true}));
    await click(page.locator('.repair-main-actions').getByRole('button', {name: '试试', exact: true}));
    await click(page.locator('.repair-main-actions').getByRole('button', {name: '放回', exact: true}));
    await click(page.getByTestId('repair-job-toy'));
    for (const [part, action] of [['cover','打开'], ['lead','接上'], ['cell','换电池'], ['cover','盖上']]) {
      await click(page.getByTestId(`repair-part-${part}`));
      await click(page.locator('.repair-part-actions').getByRole('button', {name: action, exact: true}));
    }
    await click(page.locator('.repair-main-actions').getByRole('button', {name: '试试', exact: true}));
    await click(page.locator('.repair-main-actions').getByRole('button', {name: '放回', exact: true}));
    await click(button('收下凳子'));
    await page.screenshot({path: join(out, 'repairs.png')});
    await visit('屋顶花园');
    const tool = name => page.locator(`.garden-tool-button[aria-label="${name}"]`);
    await click(tool('收拾')); await click(tool('浇水'));
    await page.keyboard.press('Escape'); await pause();
    for (const plant of ['选藤', '选小树']) {await click(button(plant)); await click(tool('浇水'));}
    await page.screenshot({path: join(out, 'garden.png')});
    await visit('早安小馆');
    chapter('Restaurant day to advance garden growth');
    for (const table of [1, 2, 3, 4]) await serve(table);
    await click(page.getByRole('button', {name: /明天见/}));
    await visit('屋顶花园');
    await click(tool('看一看')); await click(button('收下盆栽'));
    assert.equal((await state()).day, 2, 'Garden growth follows a genuinely completed restaurant day');
    await page.screenshot({path: join(out, 'garden-growth.png')});
  }
  await pause(1800);
} finally {
  recording = false; await capturing;
  const audio = await page.evaluate(() => window.__DEMO_CAPTURE__.stop());
  await writeFile(join(out, 'browser-audio.webm'), Buffer.from(audio.base64, 'base64'));
  const stopEpochMs = audio.epochMs;
  const capture = {sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), mode, base, start, stopEpochMs, frames, actions, chapters, events: audio.events, errors, finalState: await state(), method: 'Native game HTMLMediaElement output routed to WebAudio MediaRecorder. Timed browser screenshots muxed with the live recorded audio. No replacement audio or speech synthesis. Normal browser autoplay policy. Dev hooks only read state; rehearsal skips opening.'};
  await writeFile(join(out, 'capture.json'), JSON.stringify(capture, null, 2));
  await browser.close();
}
assert.equal(errors.length, 0, `Browser errors: ${errors.join('; ')}`);
console.log(`Captured ${out}. Run python3 scripts/record-neighbourhood-demo.py ${JSON.stringify(out)}`);
