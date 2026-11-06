import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:960,height:760}});
const errors=[];page.on('pageerror',error=>errors.push(String(error)));
const cases=[['e02',1,0],['proportional',.7,.77*.7-7/18],['compact',.55,.77*.55-7/18],['attached-original',1,0],['attached-proportional',.7,0],['calibration-1.2',1,0,1.2],['calibration-1.35',1,0,1.35],['attached-elder',1,0,1,'zhang-laoshi'],['calibration-elder-1.2',1,0,1.2,'zhang-laoshi']];
const evidence=[];
for(const [name,ratio,z,multiplier=1,character='lin-jie']of cases)for(const scale of [24,18]) {
 await page.goto(`http://127.0.0.1:5493/docs/evidence/world/0089/seat-proof.html?ratio=${ratio}&z=${z}&scale=${scale}&seatY=${name==='e02'?7.4:7.48}&source=${name.startsWith('attached')||name.startsWith('calibration')?'attached':'e02'}&multiplier=${multiplier}&character=${character}`);
 await page.waitForSelector('body[data-rendered="true"]');
 await page.screenshot({path:`docs/evidence/world/0089/seat-${name}-${scale}.png`});
 evidence.push({name,rows:await page.evaluate(()=>window.seatProof)});
}
await browser.close();if(errors.length)throw new Error(errors.join('\n'));
await writeFile('docs/evidence/world/0089/seat-metrics.json',JSON.stringify(evidence,null,2)+'\n');
console.log('Actual e02 sampler/adapter seat cases captured at scales24 and18.');
