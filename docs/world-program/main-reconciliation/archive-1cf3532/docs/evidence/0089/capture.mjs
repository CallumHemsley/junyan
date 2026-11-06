import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const failures=[];
for(const [name,width,height,query] of [['desktop',992,800,''],['phone',366,688,''],['kitchen',992,800,'?x=12&y=8'],['reduced',992,800,'?reduced=1']]) {
 const page=await browser.newPage({viewport:{width,height}});
 page.on('pageerror',e=>failures.push(String(e)));
 await page.goto(`http://127.0.0.1:5493/docs/evidence/0089/preview.html${query}`);
 await page.waitForSelector('body[data-rendered="true"]');
 await page.screenshot({path:`docs/evidence/0089/${name}.png`});
 await page.close();
}
await browser.close();
if(failures.length)throw new Error(failures.join('\n'));
console.log('Four actual-scale evidence captures; no page errors.');
