import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--mute-audio'] });
const results = [];
try {
 for (const [device, viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]) {
  const page = await browser.newPage({viewport});
  await page.goto('http://127.0.0.1:5481/src/world/art/town/preview.html');
  await page.waitForFunction(()=>window.townPreview);
  const probe = await page.evaluate(()=>window.townPreview.shadeProbe());
  if(probe.calls<1 || probe.inheritedAlpha!==.45) throw Error('Material callback or inherited alpha failed');
  for(const phase of ['morning','evening']) {
   const result = await page.evaluate(phase=>window.townPreview.production({x:22,y:30},phase,true),phase);
   await page.screenshot({path:`docs/evidence/world/0079/production-${device}-${phase}.png`});
   results.push({device,probe,...result});
  }
  await page.close();
 }
 await writeFile('docs/evidence/world/0079/material-proof.json',JSON.stringify({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),capturedAt:new Date().toISOString(),results},null,2)+'\n');
} finally { await browser.close(); }
