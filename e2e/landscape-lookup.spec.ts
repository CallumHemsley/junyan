import {test,expect,type Locator} from '@playwright/test';
import {savedGame} from './world-journey';
import {privateArtifact} from './private-artifacts';

async function effectiveTarget(target:Locator){
 return target.evaluate(element=>{
  const box=element.getBoundingClientRect();
  let left=Math.max(0,box.left),right=Math.min(innerWidth,box.right),top=Math.max(0,box.top),bottom=Math.min(innerHeight,box.bottom);
  for(let parent=element.parentElement;parent;parent=parent.parentElement){
   const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
   if(/auto|scroll|hidden|clip/.test(style.overflowX)){left=Math.max(left,bounds.left+parent.clientLeft);right=Math.min(right,bounds.left+parent.clientLeft+parent.clientWidth);}
   if(/auto|scroll|hidden|clip/.test(style.overflowY)){top=Math.max(top,bounds.top+parent.clientTop);bottom=Math.min(bottom,bounds.top+parent.clientTop+parent.clientHeight);}
  }
  const hit=(x:number,y:number)=>{const hit=document.elementFromPoint(x,y);return hit===element||!!hit&&element.contains(hit);};
  return {box:box.toJSON(),visible:{left,right,top,bottom,width:Math.max(0,right-left),height:Math.max(0,bottom-top)},corners:[[box.left+2,box.top+2],[box.right-2,box.top+2],[box.left+2,box.bottom-2],[box.right-2,box.bottom-2]].map(([x,y])=>hit(x,y))};
 });
}

for(const viewport of [{name:'landscape',width:844,height:390,served:4},{name:'landscape-morning',width:844,height:390,served:0},{name:'low-landscape',width:844,height:320,served:4},{name:'small-landscape',width:568,height:320,served:4},{name:'short-phone',width:320,height:568,served:4},{name:'phone',width:390,height:667,served:4},{name:'tall-phone',width:390,height:960,served:4},{name:'desktop',width:1440,height:1000,served:4}])test(`${viewport.name}: an open lookup keeps its source as a complete usable word target`,async({page},info)=>{
 await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto('/?opening=skip&seed=42');
 await page.evaluate(async(served)=>{
  const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{validateSavedGame}=await import('/src/save.ts');
  const game=createGame(content,42);game.neighbourhood!.location='apartment';game.customers=game.customers.map((customer,index)=>index<served?{...customer,phase:'served'}:customer);game.served=served;game.ended=served===4;
  game.earnings=game.customers.filter(customer=>customer.phase==='served').reduce((sum,customer)=>{const order=content.orders.find(order=>order.id===customer.orderId)!;return sum+order.items.reduce((sum,item)=>sum+content.foods.find(food=>food.id===item.foodId)!.price*item.quantity,0);},0);
  game.world={version:1,mapId:'workshop',position:{x:8,y:10.8},facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null,life:{version:1,elapsedMs:42000,discoveries:[],reactions:[],pauses:[],serviceDepartures:[]}};
  const checked=validateSavedGame(game,content);if(!checked)throw Error('Invalid lookup fixture');localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(checked));
 },viewport.served);
 await page.reload();const opening=page.getByRole('button',{name:'开门迎客',exact:true});if(await opening.isVisible())await opening.click();
 await page.locator('[data-world-anchor="workshop.lamp"]').click();
 const sources=page.locator('.repair-line .word');let source=sources.first();await source.click();
 const card=page.locator('.word-popover');await expect(card).toBeVisible();
 await source.scrollIntoViewIfNeeded();
 const target=await effectiveTarget(source);
 await page.screenshot({path:privateArtifact(`landscape-lookup/${info.project.name}-${viewport.name}-open.png`)});
 await test.info().attach('effective-source-target',{body:JSON.stringify(target,null,2),contentType:'application/json'});
 expect(target.visible.width).toBeGreaterThanOrEqual(44);expect(target.visible.height).toBeGreaterThanOrEqual(44);expect(target.corners).toEqual([true,true,true,true]);
 for(let index=0;index<await sources.count();index++){
  source=sources.nth(index);await source.scrollIntoViewIfNeeded();const next=await effectiveTarget(source);
  expect(next.visible.width).toBeGreaterThanOrEqual(44);expect(next.visible.height).toBeGreaterThanOrEqual(44);expect(next.corners).toEqual([true,true,true,true]);
  const text=await source.innerText();await source.click();await expect(card.locator('h2')).toHaveText(text);
 }
 const wordCard=await card.boundingBox();expect(wordCard!.y).toBeGreaterThanOrEqual(0);expect(wordCard!.y+wordCard!.height).toBeLessThanOrEqual(viewport.height);
 const position=(await savedGame(page)).world!.position;await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);expect((await savedGame(page)).world!.position).toEqual(position);
 await page.keyboard.press('Escape');await expect(source).toBeFocused();await page.keyboard.press('Escape');await expect(page.locator('[data-world-anchor="workshop.lamp"]')).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight)).toBe(true);expect(errors).toEqual([]);
});
