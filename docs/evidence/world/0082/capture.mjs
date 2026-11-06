import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const results=[];
for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
 await page.goto('http://127.0.0.1:5484/src/world/art/workshop/preview.html');
 for(const [label,slug] of [['台灯','lamp'],['玩具','toy'],['架子','shelf'],['木头','joinery'],['门口','entry']]) {
  await page.getByRole('button',{name:label,exact:true}).click();
  await page.screenshot({path:`docs/evidence/world/0082/${name}-${slug}.png`});
 }
 await page.getByRole('button',{name:'放回',exact:true}).click();
 await page.getByRole('button',{name:'架子',exact:true}).click();
 await page.screenshot({path:`docs/evidence/world/0082/${name}-returned.png`});
 results.push({name,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 await page.close();
}
await fs.writeFile('docs/evidence/world/0082/render-results.json',JSON.stringify(results,null,2));
await browser.close();
