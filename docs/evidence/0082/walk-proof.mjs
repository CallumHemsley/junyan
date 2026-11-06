import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const report=[];
for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
 const context=await browser.newContext({viewport,hasTouch:name==='phone',reducedMotion:'reduce',recordVideo:{dir:'docs/evidence/0082/video',size:viewport}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5484/src/world/art/workshop/walk.html');
 const initial=await page.evaluate(()=>window.workshopProof.position);
 await page.locator('canvas').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(850);await page.keyboard.up('ArrowUp');
 const keyboard=await page.evaluate(()=>window.workshopProof.position);
 await page.screenshot({path:`docs/evidence/0082/${name}-walk-entry.png`});
 for(const [label,slug,target] of [['台灯','lamp',{x:8,y:10.8}],['玩具','toy',{x:20.8,y:10.8}],['架子','shelf',{x:23,y:5}],['木头','joinery',{x:12,y:18.8}],['门口','entry',{x:15,y:25}]]) {
  const button=page.getByRole('button',{name:label,exact:true});if(name==='phone')await button.tap();else await button.click();
  await page.waitForFunction(({x,y})=>Math.hypot(window.workshopProof.position.x-x,window.workshopProof.position.y-y)<.08,target,{timeout:20000});
  await page.screenshot({path:`docs/evidence/0082/${name}-walk-${slug}.png`});
 }
 const state=await page.evaluate(()=>window.workshopProof);
 report.push({name,initial,keyboard,state,errors});
 await context.close();
}
await fs.writeFile('docs/evidence/0082/walk-results.json',JSON.stringify(report,null,2));await browser.close();
