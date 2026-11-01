import {mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {projectPosition} from './renderer.js';

const directory=resolve(process.argv[2] ?? 'output/playwright/0022-v3-integrated');
const url=process.env.SCENE_DEMO_URL ?? 'http://127.0.0.1:5182';
await mkdir(directory,{recursive:true});
const browser=await chromium.launch({args:['--mute-audio']});
const context=await browser.newContext({
  viewport:{width:1200,height:1000},reducedMotion:'no-preference',
  recordVideo:{dir:directory,size:{width:1200,height:1000}},
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
let video;
try {
  await page.goto(`${url}/?test=1&seed=42`);
  await page.getByRole('button',{name:'开门迎客'}).click();
  await page.locator('canvas').waitFor({state:'visible'});
  await page.evaluate(()=>{
    const hooks=window.__TEST__;
    hooks.dispatch({type:'move',position:{x:3,y:5.5}});
    hooks.dispatch({type:'interact',table:1});
    hooks.dispatch({type:'move',position:{x:6,y:1}});
    for(let slot=0;slot<6;slot++) hooks.dispatch({type:'pickup',foodId:hooks.content.foods[0].id});
    hooks.dispatch({type:'move',position:{x:6,y:6}});
  });
  await page.waitForTimeout(1500);
  const canvas=page.locator('canvas');
  const bounds=await canvas.boundingBox();
  assert(bounds);
  for(const position of [{x:4.8,y:4.8},{x:7.4,y:7.4},{x:4.8,y:4.8},{x:7.4,y:7.4},{x:6,y:6}]) {
    const screen=projectPosition(position);
    await canvas.click({position:{x:screen.left/100*bounds.width,y:screen.top/100*bounds.height}});
    await page.waitForFunction(position=>{
      const player=window.__TEST__.getState().player;
      return Math.hypot(player.x-position.x,player.y-position.y)<.05;
    },position);
    await page.waitForTimeout(1700);
  }
  const state=await page.evaluate(()=>window.__TEST__.getState());
  assert.equal(state.tray.length,6);
  assert.equal(state.customers.length,4);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:resolve(directory,'demo-final-frame.png')});
  video=page.video();
} finally {
  await context.close();
  await browser.close();
}
const source=await video.path();
const destination=resolve(directory,'waiter-loaded-walk-silent.mp4');
execFileSync('ffmpeg',['-y','-i',source,'-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',destination],{stdio:'pipe'});
const metadata=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_streams','-show_format','-of','json',destination],{encoding:'utf8'}));
assert(metadata.streams.some(stream=>stream.codec_type==='video'));
assert(!metadata.streams.some(stream=>stream.codec_type==='audio'));
await writeFile(resolve(directory,'demo-verification.json'),JSON.stringify({url,launchArgs:['--mute-audio'],errors,metadata},null,2));
console.log(destination);
