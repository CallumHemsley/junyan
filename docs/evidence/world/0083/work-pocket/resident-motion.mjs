import {chromium} from '@playwright/test';
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
// Bundle the real pure life adapter for observation only; production owns all advancement.
const compiled=await esbuild.build({entryPoints:['src/world/life-bridge.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {actorsFor}=await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const mapBuild=await esbuild.build({entryPoints:['src/world/maps/rooftop/index.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {rooftopForGarden}=await import(`data:text/javascript;base64,${Buffer.from(mapBuild.outputFiles[0].text).toString('base64')}`);
const dir=new URL('./',import.meta.url).pathname,fixtures=JSON.parse(await readFile(`${dir}fixtures.json`,'utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block',recordVideo:{dir,size:{width:390,height:844}}});
const game=structuredClone(fixtures.fixtures.find(f=>f.occupancy==='occupied').game);game.world.position={x:19,y:20};
await context.addInitScript(save=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(save)),game);
const page=await context.newPage(),video=page.video(),errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:5485/');await page.locator('[data-map=rooftop] canvas[data-rendered=true]').waitFor();const welcome=page.getByRole('button',{name:/^开门迎客/});if(await welcome.isVisible())await welcome.click();await page.locator('.modal-backdrop').waitFor({state:'hidden'});
const started=Date.now();for(let i=0;i<36;i++){
 const saved=await page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);return new Promise((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves'),q=tx.objectStore('saves').get('v1');tx.oncomplete=()=>{resolve(q.result);db.close();};tx.onerror=()=>reject(tx.error);};});});
 const actor=actorsFor(rooftopForGarden(saved.neighbourhood.garden),saved,saved.world,saved.world.life.elapsedMs,false).find(a=>a.characterId==='lin-jie');samples.push({wallMs:Date.now()-started,lifeElapsedMs:saved.world.life.elapsedMs,actor});
 if([0,8,16,24,35].includes(i))await page.screenshot({path:`${dir}phone-resident-${i}.png`});await page.waitForTimeout(1000);
}
await context.close();await video.saveAs(`${dir}phone-resident-motion.webm`);await browser.close();
const activities=[...new Set(samples.map(s=>s.actor?.activity))];await writeFile(`${dir}resident-motion.json`,JSON.stringify({sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),kind:'Actual production animation/clock following declared valid served/departed fixture; pure adapter observes persisted time only',activities,samples,errors,limitations:'Existing e02 life profile supplies work/walk and terrace dwell, not seated rest/contact. No morning duplicate Lin fabricated.'},null,2));if(errors.length||!activities.includes('walk')||!activities.includes('work'))throw new Error('Motion evidence incomplete');
