import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const reports=[];
for(const[name,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
 const context=await browser.newContext({viewport,hasTouch:name==='phone',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const seed=JSON.parse(await fs.readFile('docs/evidence/world/0082/work-pocket/runtime/production-results.json','utf8')).find(r=>r.name===name).final;
 await page.goto('http://127.0.0.1:5484/src/world/art/workshop/preview.html');await page.evaluate(game=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game)),seed);
 await page.goto('http://127.0.0.1:5484/?seed=42');await page.waitForSelector('[data-map="workshop"] canvas[data-rendered="true"]');await page.waitForTimeout(300);
 await page.locator('[data-world-anchor="workshop.toy"]').click();
 const button=page.getByRole('button',{name:'收下凳子',exact:true});if(name==='phone')await button.tap();else await button.click();
 await page.screenshot({path:`docs/evidence/world/0082/work-pocket/runtime/${name}-gift-claimed.png`});
 await page.getByRole('button',{name:'继续走走',exact:true}).click();await page.reload();await page.waitForSelector('[data-map="workshop"] canvas[data-rendered="true"]');await page.waitForTimeout(300);
 const read=()=>page.evaluate(async()=>{const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);});const state=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});db.close();return state;});
 let state=await read(),settledMs=0;
 for(;settledMs<5000;settledMs+=100){if(state?.neighbourhood.claimedGiftIds.includes('repairs.stool')&&state?.neighbourhood.apartment.owned.includes('repairs.stool'))break;await page.waitForTimeout(100);state=await read();}
 await page.locator('[data-world-anchor="workshop.toy"]').click();const claimAgain=await page.getByRole('button',{name:'收下凳子',exact:true}).count();
 const owned=state.neighbourhood.apartment.owned.filter(id=>id==='repairs.stool'),claimed=state.neighbourhood.claimedGiftIds.filter(id=>id==='repairs.stool');
 reports.push({name,setup:'actual completed-repair save from production UI proof; gift claim and reload use normal UI',owned,claimed,claimAgain,settledMs,position:state.world.position,errors});
 await fs.writeFile('docs/evidence/world/0082/work-pocket/runtime/gift-results.json',JSON.stringify(reports,null,2));
 if(owned.length!==1||claimed.length!==1||claimAgain!==0||errors.length)throw Error('gift claim/reload/idempotence failed');await context.close();
}
await fs.writeFile('docs/evidence/world/0082/work-pocket/runtime/gift-results.json',JSON.stringify(reports,null,2));await browser.close();
