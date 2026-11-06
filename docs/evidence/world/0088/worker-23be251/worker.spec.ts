import {test,expect} from '@playwright/test';
import {playOpening} from '../../../../../e2e/opening';
import {writeFile} from 'node:fs/promises';
import {maps,world,walkTo} from './helpers';
import {canStand,canWalk} from './geometry.mjs';
import {cameraForMap,project,pointerGround} from './camera.mjs';
const dir='docs/evidence/world/0088/worker-23be251';
const head='23be251185d989f7b97d36391a8f6478344b1a3b';
async function events(page:any){return page.evaluate(()=>structuredClone((window as any).__workerReview.events));}
async function observation(page:any){return {at:await page.evaluate(()=>performance.now()),world:await world(page),events:await events(page)};}
async function screen(page:any,p:any){const w=await world(page),r=await page.getByTestId('world-viewport').locator('canvas').boundingBox();if(!r)throw Error('canvas missing');const c=cameraForMap(maps[w.mapId].bounds,w.position,Math.ceil(r.width/2),Math.ceil(r.height/2),r.width<600?11:15);const xy=project(p,c);return {x:r.x+xy.x*r.width/c.width,y:r.y+xy.y*r.height/c.height,rect:r,camera:c,world:w};}
async function clickGround(page:any,p:any){const s=await screen(page,p);const hit=await page.evaluate(({x,y}:any)=>document.elementFromPoint(x,y)?.tagName,{x:s.x,y:s.y});if(hit!=='CANVAS')throw Error(`Target is ${hit}, not canvas`);const before=await observation(page);await page.mouse.click(s.x,s.y);return {target:p,screen:s,before,after:await observation(page)};}
async function stop(page:any){await page.getByTestId('world-viewport').focus();await page.keyboard.down('ArrowRight');await page.waitForTimeout(65);await page.keyboard.up('ArrowRight');await page.waitForTimeout(80);}
async function candidates(page:any){const w=await world(page),m=maps[w.mapId],out:any[]=[];for(let x=Math.ceil(w.position.x-16);x<=w.position.x+16;x+=2)for(let y=Math.ceil(w.position.y-16);y<=w.position.y+16;y+=2){const p={x,y},d=Math.hypot(x-w.position.x,y-w.position.y);if(d<3||!canStand(m,p)||m.exits.some((e:any)=>x>=e.rect.x&&x<=e.rect.x+e.rect.width&&y>=e.rect.y&&y<=e.rect.y+e.rect.height))continue;const s=await screen(page,p),r=s.rect;if(s.x<r.x+45||s.x>r.x+r.width-45||s.y<r.y+110||s.y>r.y+r.height-180)continue;out.push({p,d,detour:!canWalk(m,w.position,p)});}return out.sort((a,b)=>Number(b.detour)-Number(a.detour)||b.d-a.d);}
test('production worker lifecycle, native inputs, picking and resize observations',async({page},info)=>{
 const errors:string[]=[],notes:any[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const log:any={events:[]};(window as any).__workerReview=log;
  for(const kind of ['keydown','keyup'])window.addEventListener(kind,(event:any)=>log.events.push({kind,key:event.key,at:performance.now()}),true);
  const NativeWorker=window.Worker;let serial=0;
  class ObservedWorker extends NativeWorker {
   reviewId:number;reviewMap:string|undefined;
   constructor(url:any,options?:any){super(url,options);this.reviewId=++serial;log.events.push({kind:'construct',worker:this.reviewId,url:String(url),at:performance.now()});this.addEventListener('message',(e:any)=>log.events.push({kind:'reply',worker:this.reviewId,at:performance.now(),id:e.data?.id,mapId:e.data?.mapId,path:structuredClone(e.data?.path)}));this.addEventListener('error',(e:any)=>log.events.push({kind:'worker-error',at:performance.now(),message:e.message}));}
   postMessage(message:any,options?:any){this.reviewMap=message?.map?.id??this.reviewMap;log.events.push({kind:'request',worker:this.reviewId,at:performance.now(),id:message?.id,mapId:this.reviewMap,from:message?.from,to:message?.to,includesMap:!!message?.map});if(arguments.length>1)super.postMessage(message,options);else super.postMessage(message);}
  }
  window.Worker=ObservedWorker as any;
 });
 try {
  await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await page.waitForTimeout(700);expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
  const e=maps.restaurant.exits.find((x:any)=>x.targetMapId==='town');await walkTo(page,{x:e.rect.x+e.rect.width/2,y:e.rect.y+e.rect.height/2},'restaurant');await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map','town');await stop(page);
  await page.screenshot({path:`${dir}/${info.project.name}-town.png`,fullPage:true});
  const initial=await candidates(page);notes.push({kind:'visible-candidates',at:await observation(page),candidates:initial});if(initial.length<2)throw Error('Need two visible standable ground targets');
  // Real mouse pointers on both projects; phone project is emulation, not physical-device evidence.
  const burstTargets=await Promise.all(initial.slice(0,Math.min(4,initial.length)).map(x=>screen(page,x.p)));
  const near=initial.filter(x=>!x.detour).sort((a,b)=>a.d-b.d)[0];if(!near)throw Error('No visible direct final target');const nearScreen=await screen(page,near.p);
  const burstStart=await observation(page),burst:any[]=[];
  // No intervening state reads or candidate searches: final input immediately follows the burst.
  for(let i=0;i<20;i++){const s=burstTargets[i%burstTargets.length];await page.mouse.click(s.x,s.y);burst.push({index:i,screen:{x:s.x,y:s.y}});}
  await page.mouse.click(nearScreen.x,nearScreen.y);const finalClick={originalTarget:near.p,screen:nearScreen,after:await observation(page)};const samples=[];for(let i=0;i<12;i++){await page.waitForTimeout(100);samples.push(await observation(page));}notes.push({kind:'burst20-final-near',burstStart,burst,finalClick,samples});
  await stop(page);const far=(await candidates(page))[0];const pendingScreen=await screen(page,far.p);const beforeKey=await observation(page);await page.mouse.click(pendingScreen.x,pendingScreen.y);await page.keyboard.down('ArrowLeft');await page.waitForTimeout(300);await page.keyboard.up('ArrowLeft');const afterKey=await observation(page);await page.waitForTimeout(800);notes.push({kind:'keyboard-pending',click:{target:far.p,screen:pendingScreen},beforeKey,afterKey,afterRelease:await observation(page)});
  await stop(page);
  // Change to odd CSS sizes and compare request targets to exact production inverse projection.
  for(const size of [info.project.name==='phone'?{width:393,height:851}:{width:1439,height:997},info.project.name==='phone'?{width:851,height:393}:{width:1001,height:777}]){
   const before=await observation(page);await page.screenshot({path:`${dir}/${info.project.name}-before-resize-${size.width}.png`});await page.setViewportSize(size);await page.waitForTimeout(300);const after=await observation(page);await page.screenshot({path:`${dir}/${info.project.name}-after-resize-${size.width}.png`});
   const target=(await candidates(page)).filter(x=>!x.detour).sort((a,b)=>a.d-b.d)[0];if(!target){notes.push({kind:'resize',size,before,after,picking:'no unobstructed canvas target available'});continue;}
   const pick=await clickGround(page,target.p);await page.waitForTimeout(300);const record=await observation(page);const inverse=pointerGround({x:pick.screen.x,y:pick.screen.y},{left:pick.screen.rect.x,top:pick.screen.rect.y,width:pick.screen.rect.width,height:pick.screen.rect.height},pick.screen.camera);
   notes.push({kind:'resize-picking',size,before,after,pick,inverse,record});await stop(page);
  }
 }finally{
  const all=await events(page).catch(()=>[]);const replies=new Map(all.filter((e:any)=>e.kind==='reply').map((e:any)=>[`${e.worker}:${e.id}`,e]));const timing=all.filter((e:any)=>e.kind==='request').map((e:any)=>{const r:any=replies.get(`${e.worker}:${e.id}`);return {...e,replyAt:r?.at,replyMs:r?r.at-e.at:null,pathLength:r?.path?.length};});
  await writeFile(`${dir}/${info.project.name}-observations.json`,JSON.stringify({head,limitations:['Native Worker subclass records requests/replies; no artificial delay, no response mutation, no save writes.','Phone is Chromium viewport emulation with mouse input.','Candidate routing uses exact source externally; production receives only normal pointer/keyboard events.','Reply observation does not prove acceptance; correlate subsequent positions.','Resize screenshots permit visual comparison but do not expose internal elapsedMs.'],errors,notes,timing,events:all},null,2));
 }
 expect(errors).toEqual([]);
});
