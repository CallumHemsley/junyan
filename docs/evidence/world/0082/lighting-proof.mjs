import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const page=await browser.newPage({viewport:{width:1280,height:1050},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5484/src/world/art/workshop/lighting.html');await page.waitForFunction(()=>window.workshopLighting?.phase==='morning');
for(const [label,id]of[['早上','morning-material'],['傍晚','evening-material'],['灯光','evening-lit']]){await page.getByRole('button',{name:label,exact:true}).click();await page.screenshot({path:`docs/evidence/world/0082/${id}.png`});}
const proof=await page.evaluate(()=>window.workshopLighting);
await fs.writeFile('docs/evidence/world/0082/lighting-results.json',JSON.stringify({setup:'same production map, camera, saved repairs and exact art functions; named atmosphere phases injected; material pair has no effect/particle draws; lit frame uses paintWorld',proof,errors},null,2));
if(!proof.alphaPreserved||proof.changedPixels<1000||errors.length)throw Error('lighting proof failed');
await browser.close();
