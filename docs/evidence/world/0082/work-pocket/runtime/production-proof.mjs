import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const reports=[];
for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]) {
 const context=await browser.newContext({viewport,hasTouch:name==='phone',reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5484/?test=1&seed=42');
 await page.waitForFunction(()=>window.__TEST__?.getState());
 const seed=await page.evaluate(()=>{window.__TEST__.dispatch({type:'visit-location',location:'repairs'});return window.__TEST__.getState();});
 delete seed.world;
 await page.evaluate(game=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game)),seed);
 await page.goto('http://127.0.0.1:5484/?seed=42');
 await page.waitForSelector('[data-map="workshop"][data-testid="world-viewport"]');
 async function saved(){return page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});try{return await new Promise((resolve,reject)=>{const t=db.transaction('saves'),r=t.objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}});}
 async function waitAt(target){for(let i=0;i<180;i++){const game=await saved();if(game?.world&&Math.hypot(game.world.position.x-target.x,game.world.position.y-target.y)<.16)return game;await page.waitForTimeout(100);}throw Error(`did not reach ${JSON.stringify(target)}`);}
 async function walk(target){const game=await saved(),from=game.world?.position??{x:15,y:25};const canvas=page.locator('[data-testid="world-viewport"] canvas');const click=await page.evaluate(async({from,target})=>{const {cameraForMap,project}=await import('/src/world/camera.ts');const {workshopDefinition}=await import('/src/world/maps/workshop/index.ts');const canvas=document.querySelector('[data-testid="world-viewport"] canvas');const rect=canvas.getBoundingClientRect();const camera=cameraForMap(workshopDefinition.bounds,from,canvas.width,canvas.height,rect.width<600?11:15);const p=project(target,camera);return{x:rect.x+p.x*rect.width/canvas.width,y:rect.y+p.y*rect.height/canvas.height};},{from,target});if(name==='phone')await page.touchscreen.tap(click.x,click.y);else await page.mouse.click(click.x,click.y);return waitAt(target);}
 await page.waitForFunction(async()=>{const list=await indexedDB.databases();return list.some(d=>d.name==='junyan-waiter');});
 await page.waitForTimeout(600);
 const before=await saved();
 for(const p of [{x:15,y:21.7},{x:15,y:18},{x:12,y:14},{x:10.8,y:10.8},{x:8,y:10.8}])await walk(p);
 await page.screenshot({path:`docs/evidence/world/0082/work-pocket/runtime/${name}-production-lamp-approach.png`});
 await page.locator('[data-world-anchor="workshop.lamp"]').click();
 const main=label=>page.locator('.repair-main-actions').getByRole('button',{name:label,exact:true});
 await page.getByTestId('repair-part-bulb').click();
 await page.locator('.repair-part-actions').getByRole('button',{name:'拧紧',exact:true}).click();
 await main('试试').click();
 await main('放回').click();
 await page.screenshot({path:`docs/evidence/world/0082/work-pocket/runtime/${name}-production-lamp-returned.png`});
 await page.waitForFunction(()=>!document.querySelector('.repair-main-actions'));
 const lamp=await saved();
 await page.getByRole('button',{name:'继续走走',exact:true}).click();
 const closed=await saved();
 await page.reload();await page.waitForSelector('[data-map="workshop"]');
 const reloaded=await saved();
 for(const p of [{x:12,y:12},{x:16,y:12},{x:20.8,y:10.8}])await walk(p);
 await page.locator('[data-world-anchor="workshop.toy"]').click();
 const actualJob=await page.getByTestId('repair-scene').getAttribute('data-object');
 const jobBeforeManual=await page.getByTestId('repair-scene').getAttribute('data-object');
 if(jobBeforeManual!=='toy')throw Error('physical toy bench did not select toy job');
 await page.getByTestId('repair-part-cover').click();
 await page.locator('.repair-part-actions').getByRole('button',{name:'打开',exact:true}).click();
 const parts=await page.locator('.repair-part').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.testid,x:r.x,y:r.y,w:r.width,h:r.height};}));
 for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){const a=parts[i],b=parts[j];if(Math.min(a.x+a.w,b.x+b.w)>Math.max(a.x,b.x)&&Math.min(a.y+a.h,b.y+b.h)>Math.max(a.y,b.y))throw Error('part controls overlap');}
 await page.getByTestId('repair-part-lead').click();
 await page.locator('.repair-part-actions').getByRole('button',{name:'接上',exact:true}).click();
 await page.getByTestId('repair-part-cell').click();
 await page.locator('.repair-part-actions').getByRole('button',{name:'换电池',exact:true}).click();
 await page.getByTestId('repair-part-cover').click();
 await page.locator('.repair-part-actions').getByRole('button',{name:'盖上',exact:true}).click();
 await main('试试').click();await main('放回').click();
 await page.screenshot({path:`docs/evidence/world/0082/work-pocket/runtime/${name}-production-both-returned.png`});
 const both=await saved();
 await page.getByRole('button',{name:'继续走走',exact:true}).click();await page.reload();await page.waitForSelector('[data-map="workshop"]');
 let final=await saved(),settledMs=0;
 for(;settledMs<5000;settledMs+=100){if(final?.neighbourhood.repairs.completed.includes('toy')&&final?.world.activeActivity===null)break;await page.waitForTimeout(100);final=await saved();}
 const activityVisible=await page.locator('.world-context').count();
 reports.push({name,setup:'seeded legacy repairs save; no world position; normal-mode UI and storage thereafter',before,lamp,closed,reloaded,actualJob,jobBeforeManual,both,final,parts,settledMs,activityVisible,errors});
 await fs.writeFile('docs/evidence/world/0082/work-pocket/runtime/production-results.json',JSON.stringify(reports,null,2));
 if(activityVisible!==0)throw Error('closed activity reopened on reload');
 if(!final.neighbourhood.repairs.completed.includes('lamp')||!final.neighbourhood.repairs.completed.includes('toy'))throw Error('completed repairs lost on reload');
 if(final.day!==before.day||JSON.stringify(final.customers)!==JSON.stringify(before.customers))throw Error('restaurant state changed');
 if(Math.hypot(final.world.position.x-20.8,final.world.position.y-10.8)>.2)throw Error('close/reload lost approach position');
 await fs.writeFile('docs/evidence/world/0082/work-pocket/runtime/production-results.json',JSON.stringify(reports,null,2));
 const repeats=[];
 for(const job of ['lamp','toy']){
  for(const p of job==='lamp'?[{x:16,y:12},{x:12,y:12},{x:8,y:10.8}]:[{x:12,y:12},{x:16,y:12},{x:20.8,y:10.8}])await walk(p);
  await page.locator(`[data-world-anchor="workshop.${job}"]`).click();
  await page.getByRole('button',{name:'再修一次',exact:true}).click();
  const selected=job==='lamp'?'bulb':'cover';await page.getByTestId(`repair-part-${selected}`).click();
  await page.locator('.repair-part-actions').getByRole('button',{name:job==='lamp'?'拧紧':'打开',exact:true}).click();
  await page.reload();await page.waitForSelector(`[data-testid="repair-scene"][data-object="${job}"]`);
  let state=await saved();for(let n=0;n<50&&!state.neighbourhood.repairs.jobs[job];n++){await page.waitForTimeout(100);state=await saved();}
  if(!state.neighbourhood.repairs.jobs[job]||state.neighbourhood.repairs.completed.length!==2)throw Error('repeat repair lost active object or completion');
  await page.screenshot({path:`docs/evidence/world/0082/work-pocket/runtime/${name}-production-repeat-${job}.png`});
  repeats.push({job,state:state.neighbourhood.repairs,position:state.world.position});
  await page.getByRole('button',{name:'继续走走',exact:true}).click();
  await page.waitForTimeout(200);
 }
 reports.at(-1).repeats=repeats;
 await fs.writeFile('docs/evidence/world/0082/work-pocket/runtime/production-results.json',JSON.stringify(reports,null,2));
 await context.close();
}
await fs.writeFile('docs/evidence/world/0082/work-pocket/runtime/production-results.json',JSON.stringify(reports,null,2));await browser.close();
