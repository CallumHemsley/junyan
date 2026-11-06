import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio']});
const url='http://127.0.0.1:5481/src/world/art/town/preview.html',results=[];
try {
 for(const [device,viewport]of[['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});await page.goto(url);await page.waitForFunction(()=>window.townPreview);
  await page.evaluate(()=>window.townPreview.production({x:22.5,y:22},'morning',false));
  await page.evaluate(()=>window.townPreview.production({x:22.5,y:22},'morning',true));
  const toggled=await page.locator('canvas').screenshot();await writeFile(`docs/evidence/0079/reduced-${device}-after-toggle.png`,toggled);
  await page.close();
  const fresh=await browser.newPage({viewport});await fresh.goto(url);await fresh.waitForFunction(()=>window.townPreview);await fresh.evaluate(()=>window.townPreview.production({x:22.5,y:22},'morning',true));
  const rested=await fresh.locator('canvas').screenshot();await writeFile(`docs/evidence/0079/reduced-${device}-fresh.png`,rested);
  results.push({device,equal:toggled.equals(rested),toggledHash:createHash('sha256').update(toggled).digest('hex'),freshHash:createHash('sha256').update(rested).digest('hex')});await fresh.close();
 }
 await writeFile('docs/evidence/0079/reduced-plate-proof.json',JSON.stringify({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),surface:'production-renderer fixture, normal -> reduced compared with fresh reduced',results},null,2)+'\n');
 if(results.some(r=>!r.equal))throw Error('Reduced-motion plate differs from fresh static pose');
}finally{await browser.close();}
