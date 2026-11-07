import {test,expect,type Locator} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {seedDayOne} from './opening';
import {savedGame} from './world-journey';
import {createGame} from '../src/game';
import {content} from '../src/content';
import {readingRoomMap} from '../src/world/maps/reading-room';

async function observeSource(source:Locator){
 return source.evaluate(el=>{
  const r=el.getBoundingClientRect(),ancestors=[];
  let left=Math.max(0,r.left),right=Math.min(innerWidth,r.right),top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);
  for(let current:HTMLElement|null=el;current;current=current.parentElement){
   const c=getComputedStyle(current),b=current.getBoundingClientRect();
   ancestors.push({tag:current.tagName,class:current.className,rect:b.toJSON(),client:{width:current.clientWidth,height:current.clientHeight,left:current.clientLeft,top:current.clientTop},scroll:{left:current.scrollLeft,top:current.scrollTop},overflow:{x:c.overflowX,y:c.overflowY},lineHeight:c.lineHeight,padding:c.padding,z:c.zIndex});
   if(current===el)continue;
   if(/auto|scroll|hidden|clip/.test(c.overflowX)){left=Math.max(left,b.left+current.clientLeft);right=Math.min(right,b.left+current.clientLeft+current.clientWidth);}
   if(/auto|scroll|hidden|clip/.test(c.overflowY)){top=Math.max(top,b.top+current.clientTop);bottom=Math.min(bottom,b.top+current.clientTop+current.clientHeight);}
  }
  const hit=(x:number,y:number)=>{const target=document.elementFromPoint(x,y);return {x,y,tag:target?.tagName,class:target?.className,isSource:!!target&&el.contains(target)};};
  return {rect:r.toJSON(),visible:{left,right,top,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)},ancestors,hits:[[r.left+1,r.top+1],[r.right-1,r.top+1],[r.left+1,r.bottom-1],[r.right-1,r.bottom-1]].map(([x,y])=>hit(x,y)),visibleHits:[[left+1,top+1],[right-1,top+1],[left+1,bottom-1],[right-1,bottom-1]].map(([x,y])=>hit(x,y))};
 });
}

for(const [width,height] of [[844,390],[568,320]])for(const served of [0,4])test(`reading lookup ${width}x${height} served${served}`,async({page,baseURL},info)=>{
 await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const game=createGame(content,42);game.neighbourhood!.location='reading-room';
 game.customers=game.customers.map((c,i)=>i<served?{...c,phase:'served'}:c);game.served=served;game.ended=served===4;
 game.earnings=game.customers.filter(c=>c.phase==='served').reduce((s,c)=>{const order=content.orders.find(o=>o.id===c.orderId)!;return s+order.items.reduce((n,i)=>n+content.foods.find(f=>f.id===i.foodId)!.price*i.quantity,0);},0);
 game.world={version:1,mapId:'reading-room',position:readingRoomMap.anchors[0].position,facing:'north',activeActivity:null,activeAnchorId:null,returnPositions:{}};
 await seedDayOne(page,baseURL!,game);await page.goto('/?seed=42');
 const trigger=page.locator('[data-world-anchor="reading-room.project"]');await expect(trigger).toBeVisible();await trigger.click();
 const panel=page.locator('.world-context');await expect(page.locator('.reading-room')).toBeVisible();
 const bounds=()=>page.evaluate(()=>Object.fromEntries(['main','.connected-world canvas','.world-context'].map(s=>{const r=document.querySelector(s)!.getBoundingClientRect();return[s,{x:r.x,y:r.y,width:r.width,height:r.height}];})));
 const before=await bounds();
 async function lookup(source:Locator,label:string){
  const text=await source.innerText();await source.click();const card=page.locator('.word-popover');await expect(card).toBeVisible();await expect(card.locator('h2')).toHaveText(text);await expect(card.locator('.pinyin')).not.toBeEmpty();
  // Acceptance precedes any test scroll: include every overflow ancestor's actual client box.
  await expect.poll(async()=>{const o=await observeSource(source);return {width:o.visible.width>=44,height:o.visible.height>=44,hits:[...o.hits,...o.visibleHits].every(p=>p.isSource)};}).toEqual({width:true,height:true,hits:true});
  const observation=await observeSource(source);writeFileSync(info.outputPath(`${label}-ancestors.json`),JSON.stringify(observation,null,2));
  await page.screenshot({path:info.outputPath(`${label}-lookup.png`),fullPage:true});
  expect(await page.locator('.connected-world canvas').evaluate(el=>el.inert)).toBe(true);
  const position=(await savedGame(page)).world!.position;await page.keyboard.press('ArrowRight');await page.waitForTimeout(80);expect((await savedGame(page)).world!.position).toEqual(position);
  const r=await card.boundingBox();expect(r!.x).toBeGreaterThanOrEqual(0);expect(r!.x+r!.width).toBeLessThanOrEqual(width);expect(r!.y).toBeGreaterThanOrEqual(0);expect(r!.y+r!.height).toBeLessThanOrEqual(height);
 }
 const current=page.locator('.reading-room-current [data-word-lookup]').first();await lookup(current,'brief');
 await page.keyboard.press('Escape');await expect(current).toBeFocused();await expect.poll(bounds).toEqual(before);
 await page.locator('.reading-room-instructions summary').click();const expandedBefore=await bounds();
 const instruction=page.locator('.reading-room-instructions [data-word-lookup]').first();await lookup(instruction,'instruction');
 const switched=page.locator('.reading-room-instructions [data-word-lookup]').last();await lookup(switched,'switched-instruction');
 await page.keyboard.press('Escape');await expect(switched).toBeFocused();await expect.poll(bounds).toEqual(expandedBefore);
 await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(trigger).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight)).toBe(true);expect(errors).toEqual([]);
});
