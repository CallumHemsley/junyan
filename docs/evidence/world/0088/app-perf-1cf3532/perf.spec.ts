import {test,expect} from '@playwright/test';
import {playOpening} from '../../../../../e2e/opening';
import {readFileSync,writeFileSync} from 'node:fs';
const out='/workspace/junyan/docs/evidence/world/0088/app-perf-1cf3532',mode=process.env.PERF_MODE??'production';
const history=JSON.parse(readFileSync('/workspace/junyan/docs/evidence/0088/integrated-e02a747/phone-journey-final.json','utf8')).state;
async function saved(page:any){return page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return new Promise<any>((resolve,reject)=>{const t=db.transaction('saves');const r=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(r.result);db.close()};t.onerror=()=>reject(t.error)})})}
async function seed(page:any,state:any){await page.evaluate(async save=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise<void>((resolve,reject)=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(save,'v1');t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)});localStorage.removeItem('junyan-waiter-pending-v1')},state);}
async function clear(page:any){await page.evaluate(()=>{const p=(window as any).__appPerf;p.calls=[];p.frames=[];p.tasks=[];p.active=true;})}
async function result(page:any){return page.evaluate(()=>{const p=(window as any).__appPerf;return {calls:p.calls,frames:p.frames,tasks:p.tasks,now:performance.now()}})}
async function settle(page:any){await page.getByTestId('world-viewport').waitFor();const welcome=page.getByRole('button',{name:'开门迎客'});if(await welcome.isVisible())await welcome.click();await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));}
test('measure actual App movement restyle and reload',async({page})=>{
 const errors:string[]=[],rows:any[]=[];const persist=()=>writeFileSync(`${out}/${mode}-measurements.json`,JSON.stringify({head:process.env.PERF_HEAD??'1cf3532e9b40cbdd99d51ee860562e8f292a1d4e',mode,fixtureOrigin:'integrated-e02a747/phone-journey-final.json, actual recorded ordinary journey; altered only current map/position/activity for isolated labelled scenarios',errors,rows},null,2));
 page.on('pageerror',e=>{errors.push(e.message);persist()});
 await page.addInitScript(()=>{const p:any={active:true,calls:[],frames:[],tasks:[]};(window as any).__appPerf=p;let last=0;requestAnimationFrame(function tick(t){if(last&&p.active)p.frames.push(t-last);last=t;requestAnimationFrame(tick)});new PerformanceObserver(list=>{if(p.active)for(const e of list.getEntries())p.tasks.push({start:e.startTime,duration:e.duration})}).observe({type:'longtask',buffered:true});});
 await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await settle(page);
 rows.push({scenario:'normal-opening',metrics:await result(page)});persist();
 for(const scenario of ['ordinary-restaurant','journey-town','journey-apartment']){
  if(scenario!=='ordinary-restaurant'){const s=structuredClone(history);s.world.activeActivity=null;s.world.activeAnchorId=null;s.neighbourhood.apartment.selected=null;s.neighbourhood.apartment.draft=null;
   if(scenario==='journey-town'){s.world.mapId='town';s.world.position={x:34,y:32};s.neighbourhood.location='restaurant'}else{s.world.mapId='apartment';s.world.position={x:17.5,y:13.5};s.neighbourhood.location='apartment'}
   await seed(page,s);const start=Date.now();await page.reload();await settle(page);rows.push({scenario:`${scenario}-cold-reload`,wallMs:Date.now()-start,metrics:await result(page),state:await saved(page)});persist();
  }
  await page.getByTestId('world-viewport').focus();
  for(let i=0;i<5;i++){await clear(page);const start=Date.now();await page.keyboard.down('ArrowUp');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');await page.keyboard.down('ArrowDown');await page.waitForTimeout(400);await page.keyboard.up('ArrowDown');await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve())));rows.push({scenario,iteration:i,wallMs:Date.now()-start,metrics:await result(page)});persist();}
 }
 await page.waitForTimeout(500);const current=await saved(page);rows.push({scenario:'after-movement',state:current});persist();
 // Return to the recorded apartment activity anchor only as a diagnostic fixture; following edits use real UI.
 const s=structuredClone(history);s.neighbourhood.apartment.selected=null;s.neighbourhood.apartment.draft=null;await seed(page,s);await page.reload();await settle(page);
 await expect(page.locator('.apartment-options')).toBeVisible();
 for(let i=0;i<5;i++){await clear(page);const name=i%2?'蓝色':'米色';const start=Date.now();await page.getByRole('button',{name,exact:true}).click();await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));rows.push({scenario:'restyle-colour',iteration:i,wallMs:Date.now()-start,metrics:await result(page)});persist();}
 for(let i=0;i<5;i++){await clear(page);const name=i%2?'小':'大';const start=Date.now();await page.getByRole('group',{name:'地毯大小'}).getByRole('button',{name,exact:true}).click();await page.evaluate(()=>new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));rows.push({scenario:'restyle-rug',iteration:i,wallMs:Date.now()-start,metrics:await result(page)});persist();}
 await page.waitForTimeout(600);const before=await saved(page);for(let i=0;i<5;i++){const start=Date.now();await page.reload();await settle(page);rows.push({scenario:'journey-apartment-reload',iteration:i,wallMs:Date.now()-start,metrics:await result(page)});persist();}
 await page.waitForTimeout(600);const after=await saved(page);rows.push({scenario:'final',before,after});persist();expect(after.world.position).toEqual(before.world.position);expect(after.neighbourhood.apartment.colour).toEqual(before.neighbourhood.apartment.colour);expect(errors).toEqual([]);
});
