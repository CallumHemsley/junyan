import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const tranche=process.argv[2]||'after';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const results=[];
for(const[name,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const phase of ['morning','evening'])for(const occupied of [false,true]){
  await page.goto(`http://127.0.0.1:5484/src/world/art/workshop/pocket-study.html?phase=${phase}&occupied=${occupied?1:0}`);await page.waitForFunction(()=>window.workshopPocketStudy?.ready);
  await page.screenshot({path:`docs/evidence/world/0082/work-pocket/${tranche}-${name}-${phase}-${occupied?'occupied':'empty'}.png`});
  results.push({name,phase,occupied,study:await page.evaluate(()=>window.workshopPocketStudy),errors:[...errors]});
 }
 await page.close();
}
await fs.writeFile(`docs/evidence/world/0082/work-pocket/${tranche}-results.json`,JSON.stringify(results,null,2));await browser.close();
