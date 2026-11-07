import {test,expect} from '@playwright/test';
import {seedDayOne} from './opening';
import {savedGame} from './world-journey';
import {createGame} from '../src/game';
import {content} from '../src/content';
import {readingRoomMap} from '../src/world/maps/reading-room';

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
 const source=page.locator('.reading-room-current [data-word-lookup]').first();await source.click();await expect(page.locator('.word-popover')).toBeVisible();
 const observation=await source.evaluate(el=>{
  const r=el.getBoundingClientRect();const ancestors=[];let current:HTMLElement|null=el;
  while(current){const c=getComputedStyle(current);ancestors.push({tag:current.tagName,class:current.className,rect:current.getBoundingClientRect().toJSON(),client:{width:current.clientWidth,height:current.clientHeight,left:current.clientLeft,top:current.clientTop},scroll:{left:current.scrollLeft,top:current.scrollTop},overflow:{x:c.overflowX,y:c.overflowY},display:c.display,lineHeight:c.lineHeight,padding:c.padding,z:c.zIndex});current=current.parentElement;}
  return {ancestors,hits:[[r.left+1,r.top+1],[r.right-1,r.top+1],[r.left+1,r.bottom-1],[r.right-1,r.bottom-1]].map(([x,y])=>{const hit=document.elementFromPoint(x,y);return {x,y,tag:hit?.tagName,class:hit?.className,rect:hit?.getBoundingClientRect().toJSON(),isSource:!!hit&&el.contains(hit)}})};
 });
 await test.info().attach('native-source-ancestors',{body:JSON.stringify(observation,null,2),contentType:'application/json'});
 await page.screenshot({path:info.outputPath('before-assert.png'),fullPage:true});
 await expect.poll(()=>source.evaluate(el=>{
  const r=el.getBoundingClientRect(),m=document.querySelector('main')!.getBoundingClientRect(),p=document.querySelector('.world-context')!.getBoundingClientRect();
  const left=Math.max(r.left,m.left,p.left),right=Math.min(r.right,m.right,p.right),top=Math.max(r.top,m.top,p.top),bottom=Math.min(r.bottom,m.bottom,p.bottom);
  const hits=[[left+1,top+1],[right-1,top+1],[left+1,bottom-1],[right-1,bottom-1]].every(([x,y])=>el.contains(document.elementFromPoint(x,y)));
  return{width:right-left>=43.99,height:bottom-top>=43.99,hits};
 })).toEqual({width:true,height:true,hits:true});
 const position=(await savedGame(page)).world!.position;
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(80);
 expect((await savedGame(page)).world!.position).toEqual(position);
 const card=await page.locator('.word-popover').boundingBox();expect(card!.x).toBeGreaterThanOrEqual(0);expect(card!.x+card!.width).toBeLessThanOrEqual(width);expect(card!.y).toBeGreaterThanOrEqual(0);expect(card!.y+card!.height).toBeLessThanOrEqual(height);
 await page.screenshot({path:info.outputPath('lookup.png'),fullPage:true});
 await page.keyboard.press('Escape');await expect(source).toBeFocused();await expect.poll(bounds).toEqual(before);
 await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(trigger).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
