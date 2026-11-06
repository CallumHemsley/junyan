import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:992,height:800}});
const hashes=[];
for(const food of ['bun','bread','egg','milk','porridge','youtiao','dumpling']) {
 await page.goto(`http://127.0.0.1:5493/docs/evidence/world/0089/preview.html?x=12&y=8&food=${food}`);
 await page.waitForSelector('body[data-rendered="true"]');
 const frame=await page.screenshot({path:`docs/evidence/world/0089/food-${food}.png`,clip:{x:220,y:240,width:180,height:160}});
 hashes.push(createHash('sha256').update(frame).digest('hex'));
}
await browser.close();
if(new Set(hashes).size!==7)throw new Error('Served foods do not have seven distinct real browser rasters.');
console.log('Seven distinct served-food browser rasters.');
