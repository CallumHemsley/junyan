import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';
import {createRenderer, WIDTH, HEIGHT} from './renderer.js';
import {FIGURES, WARD_CAST, wardScene} from './ward.js';
import {WARD_STEPS} from './ward-steps.js';
import {portraitScene} from './portrait-scene.js';
import {captureCanvas} from './scene-frame-hashes.mjs';
import {png} from './png.mjs';

const directory = resolve(process.argv[2] ?? 'output/playwright/0053');
await mkdir(directory, {recursive:true});
const content = JSON.parse(await readFile(new URL('../content/content.json', import.meta.url), 'utf8'));

const upscale = (pixels, width, height, k) => {
  const out = new Uint8ClampedArray(width*k*height*k*4);
  for (let y=0;y<height*k;y++) for (let x=0;x<width*k;x++) {
    const from = ((y/k|0)*width+(x/k|0))*4;
    out.set(pixels.subarray(from, from+4), (y*width*k+x)*4);
  }
  return out;
};
const median = values => [...values].sort((a,b) => a-b)[values.length>>1];

const canvas = captureCanvas();
const bakes = [];
let renderer;
for (let k=0;k<5;k++) {
  const start = performance.now();
  renderer = createRenderer(canvas, wardScene);
  bakes.push(performance.now()-start);
}
const draws = [];
const steps = Object.fromEntries(WARD_STEPS);
for (let k=0;k<20;k++) renderer.draw(steps.wake, k/30);
for (let k=0;k<200;k++) {
  const start = performance.now();
  renderer.draw(k%2 ? steps['doctor-zh'] : steps.wake, k/30);
  draws.push(performance.now()-start);
}

const cards = [];
for (const [index, [step, frame]] of WARD_STEPS.entries()) {
  renderer.draw(frame, 0);
  const bytes = png(canvas.frame);
  await writeFile(resolve(directory, `ward-${step}.png`), bytes);
  await writeFile(resolve(directory, `ward-${step}@3x.png`), png(upscale(canvas.frame, WIDTH, HEIGHT, 3), WIDTH*3, HEIGHT*3));
  const cast = ['elder', ...frame.present].join(', ');
  cards.push(`<figure><figcaption>${index+1}. ${step}: ${cast}; player ${frame.player}; table ${frame.table.join(' ') || 'empty'}; held ${frame.held ?? 'none'}</figcaption><img src="data:image/png;base64,${bytes.toString('base64')}" /></figure>`);
}
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:16px;background:#f4eee4;color:#241d16;font:13px system-ui}main{display:grid;grid-template-columns:repeat(3,540px);gap:12px}figure{margin:0}img{width:540px;height:420px;image-rendering:pixelated}figcaption{padding:6px 0}</style><main>${cards.join('')}</main>`;
await writeFile(resolve(directory, 'ward-contact-sheet.html'), html);

const portraits = captureCanvas();
const portrait = createRenderer(portraits, portraitScene());
const linJie = content.characters.find(character => character.appearance.accessory === 'bun');
const cast = [
  ['doctor', WARD_CAST.doctor, FIGURES.doctor.pose],
  ['nurse', WARD_CAST.nurse, FIGURES.nurse.pose],
  ['aunt', WARD_CAST.aunt, FIGURES.aunt.pose],
  ['elder', WARD_CAST.elder, {crouch:1, scale:.88, lean:.08}],
  ['player', WARD_CAST.player, {lying:true, scale:.88}],
  [`${linJie.id} (bun, for contrast)`, linJie.appearance, {crouch:1, scale:.88}],
];
const castCards = [];
for (const [name, palette, pose] of cast) for (let direction=0;direction<8;direction++) {
  portrait.draw(palette, direction*Math.PI/4, pose, []);
  const width=64, height=70, crop=new Uint8ClampedArray(width*height*4);
  for (let row=0;row<height;row++) crop.set(portraits.frame.subarray(((row+92)*WIDTH+148)*4, ((row+92)*WIDTH+148+width)*4), row*width*4);
  castCards.push(`<figure><figcaption>${direction ? '' : name}&nbsp;</figcaption><img src="data:image/png;base64,${png(crop, width, height).toString('base64')}" /></figure>`);
}
const castHtml = `<!doctype html><meta charset="utf-8"><style>body{margin:12px;background:#f4eee4;color:#241d16;font:12px system-ui}main{display:grid;grid-template-columns:repeat(8,128px);gap:6px}figure{margin:0}img{width:128px;height:140px;image-rendering:pixelated}figcaption{padding:2px 0;height:16px;white-space:nowrap}</style><main>${castCards.join('')}</main>`;
await writeFile(resolve(directory, 'ward-cast.html'), castHtml);

const browser = await chromium.launch({args:['--mute-audio']});
try {
  const page = await browser.newPage({viewport:{width:1700,height:1000}});
  await page.setContent(html);
  await page.screenshot({path:resolve(directory, 'ward-contact-sheet.png'), fullPage:true});
  await page.setViewportSize({width:1100,height:900});
  await page.setContent(castHtml);
  await page.screenshot({path:resolve(directory, 'ward-cast.png'), fullPage:true});
} finally { await browser.close(); }
console.log(JSON.stringify({bakeMs:+median(bakes).toFixed(2), drawMs:+median(draws).toFixed(3)}));
