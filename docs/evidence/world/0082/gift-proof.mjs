import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const reports=[];
for(const[name,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
 const context=await browser.newContext({viewport,hasTouch:name==='phone',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const seed=JSON.parse(await fs.readFile('docs/evidence/world/0082/production-results.json','utf8')).find(r=>r.name===name).final;
 await page.goto('http://127.0.0.1:5484/src/world/art/workshop/preview.html');await page.evaluate(game=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game)),seed);
 await page.goto('http://127.0.0.1:5484/?seed=42');await page.waitForSelector('[data-map="workshop"] canvas[data-rendered="true"]');await page.waitForTimeout(300);
 await page.locator('[data-world-anchor="workshop.toy"]').click();
 const button=page.getByRole('button',{name:'收下凳子',exact:true});if(name==='phone')await button.tap();else await button.click();
 await page.screenshot({path:`docs/evidence/world/0082/${name}-gift-claimed.png`});
 await page.getByRole('button',{name:'继续走走',exact:true}).click();await page.reload();await page.waitForSelector('[data-map="workshop"] canvas[data-rendered="true"]');await page.waitForTimeout(300);
 const state=await page.evaluate(async()=>{const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);});const state=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});db.close();return state;});
 await page.locator('[data-world-anchor="workshop.toy"]').click();const claimAgain=await page.getByRole('button',{name:'收下凳子',exact:true}).count();
 const owned=state.neighbourhood.apartment.owned.filter(id=>id==='repairs.stool'),claimed=state.neighbourhood.claimedGiftIds.filter(id=>id==='repairs.stool');
 reports.push({name,setup:'actual completed-repair save from production UI proof; gift claim and reload use normal UI',owned,claimed,claimAgain,position:state.world.position,errors});
 if(owned.length!==1||claimed.length!==1||claimAgain!==0||errors.length)throw Error('gift claim/reload/idempotence failed');await context.close();
}
await fs.writeFile('docs/evidence/world/0082/gift-results.json',JSON.stringify(reports,null,2));await browser.close();
