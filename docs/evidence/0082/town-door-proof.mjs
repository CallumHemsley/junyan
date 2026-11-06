import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const reports=[];
for(const [name,viewport]of[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]]){
 const context=await browser.newContext({viewport,hasTouch:name==='phone',reducedMotion:'reduce',recordVideo:{dir:'docs/evidence/0082/production-video',size:viewport}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5484/?test=1&seed=42');await page.waitForFunction(()=>window.__TEST__?.getState());
 const prior=JSON.parse(await fs.readFile('docs/evidence/0082/production-results.json','utf8')).find(r=>r.name===name);
 const seed=prior.final;
 seed.world={...seed.world,mapId:'workshop',position:{x:15,y:25},facing:'north',activeActivity:null,activeAnchorId:null};
 await page.evaluate(game=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game)),seed);
 await page.goto('http://127.0.0.1:5484/?seed=42');await page.waitForSelector('[data-map="workshop"] canvas[data-rendered="true"]');await page.waitForTimeout(500);
 async function saved(){return page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});try{return await new Promise(resolve=>{const t=db.transaction('saves'),r=t.objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});}finally{db.close();}});}
 async function clickWorld(target){const state=(await saved()).world;const point=await page.evaluate(async({state,target})=>{const {cameraForMap,project}=await import('/src/world/camera.ts');const {worldMaps}=await import('/src/world/registry.ts');const canvas=document.querySelector('[data-testid="world-viewport"] canvas'),rect=canvas.getBoundingClientRect();const camera=cameraForMap(worldMaps[state.mapId].bounds,state.position,canvas.width,canvas.height,rect.width<600?11:15);const p=project(target,camera);return{x:rect.x+p.x*rect.width/canvas.width,y:rect.y+p.y*rect.height/canvas.height};},{state,target});if(name==='phone')await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);}
 async function mapIs(id){for(let n=0;n<100;n++){const game=await saved();if(game?.world?.mapId===id)return game;await page.waitForTimeout(100);}throw Error('door failed '+id);}
 await page.screenshot({path:`docs/evidence/0082/${name}-production-door-before.png`});
 await clickWorld({x:15,y:26.5});const town=await mapIs('town');
 await page.screenshot({path:`docs/evidence/0082/${name}-production-town-arrival.png`});
 await page.reload();await page.waitForSelector('[data-map="town"] canvas[data-rendered="true"]');await page.waitForTimeout(250);const townReload=await saved();
 await clickWorld({x:73.25,y:29.55});const returned=await mapIs('workshop');
 await page.screenshot({path:`docs/evidence/0082/${name}-production-door-return.png`});
 if(returned.neighbourhood.repairs.completed.length!==2)throw Error('repairs lost across door');
 reports.push({name,setup:'disclosed seeded workshop arrival with completed repairs; door movement and reload use normal UI',town:town.world,townReload:townReload.world,returned:returned.world,completed:returned.neighbourhood.repairs.completed,errors});
 await context.close();
}
await fs.writeFile('docs/evidence/0082/town-door-results.json',JSON.stringify(reports,null,2));await browser.close();
