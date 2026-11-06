import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});
const evidence=[];
for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844]]) {
 const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'docs/evidence/world/0078/video',size:{width,height}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5480/?test=1&seed=42');
 const help=page.getByRole('button',{name:'开门迎客'});if(await help.count())await help.click();
 await page.waitForTimeout(500);
 const world=page.getByTestId('world-viewport');await world.focus();
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(1300);await page.keyboard.up('ArrowUp');
 await page.screenshot({path:`docs/evidence/world/0078/${name}-world.png`});
 const state=await page.evaluate(()=>window.__TEST__?.getState());
 evidence.push({name,errors,state});
 await context.close();
}
await writeFile('docs/evidence/world/0078/viewport-proof.json',JSON.stringify(evidence,null,2));await browser.close();
