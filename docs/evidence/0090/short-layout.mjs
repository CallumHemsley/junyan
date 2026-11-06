import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const phase=process.argv[2];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const observations=[];
for(const viewport of [{width:320,height:320},{width:390,height:664}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5494/src/world/ui/harness.html');
 await page.getByRole('button',{name:'1桌',exact:true}).click();
 await page.getByRole('button',{name:'去厨房',exact:true}).click();
 const panel=await page.locator('.world-context').boundingBox();
 const center=await page.locator('.world-context-scroll').evaluate(el=>({clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}));
 const footer=await page.locator('.world-context-actions').boundingBox();
 await page.screenshot({path:`docs/evidence/0090/${viewport.width}-short-${phase}.png`});
 if(phase==='after'){
  assert(center.clientHeight>=44);
  assert(panel.y>=0&&panel.y+panel.height<=viewport.height);
  assert(footer.y+footer.height<=viewport.height);
  await page.locator('.world-kitchen-food > button:first-child').first().click();
  assert.equal(await page.locator('.world-kitchen-tray .world-tray-item').count(),1);
  await page.locator('.world-context-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.locator('.world-kitchen-tray button[aria-label^="放回"]').click();
  assert.equal(await page.locator('.world-kitchen-tray .world-tray-item').count(),0);
 }
 observations.push({viewport,panel,center,footer});
 await page.close();
}
await writeFile(`docs/evidence/0090/short-${phase}.json`,JSON.stringify(observations,null,2)+'\n');
await browser.close();
