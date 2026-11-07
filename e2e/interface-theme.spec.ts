import {test,expect} from '@playwright/test';
import {privateArtifact} from './private-artifacts';

function contrast(a:string,b:string){
 const luminance=(color:string)=>color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(value=>value/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
 const [low,high]=[luminance(a),luminance(b)].sort((x,y)=>x-y);
 return (high+.05)/(low+.05);
}

test('service phases preserve control, cue and lookup contrast through night and reset',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const served of [0,2,3,4,0]){
  await page.goto('/?opening=skip&seed=42');
  await page.evaluate(async(served)=>{
   const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{validateSavedGame}=await import('/src/save.ts');
   const game=createGame(content,42);game.neighbourhood!.location='apartment';
   game.customers=game.customers.map((customer,index)=>index<served?{...customer,phase:'served'}:customer);game.served=served;game.ended=served===4;
   game.earnings=game.customers.filter(customer=>customer.phase==='served').reduce((sum,customer)=>{const order=content.orders.find(order=>order.id===customer.orderId)!;return sum+order.items.reduce((sum,item)=>sum+content.foods.find(food=>food.id===item.foodId)!.price*item.quantity,0);},0);
   game.world={version:1,mapId:'workshop',position:{x:8,y:10.8},facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null,life:{version:1,elapsedMs:42000,discoveries:[],reactions:[],pauses:[],serviceDepartures:[]}};
   const checked=validateSavedGame(game,content);if(!checked)throw Error('Invalid phase fixture');localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(checked));
  },served);
  await page.reload();
  const open=page.getByRole('button',{name:'开门迎客',exact:true});if(await open.isVisible())await open.click();
  await expect(page.locator('.connected-shell')).toHaveAttribute('data-theme',served>=3?'evening':'morning');
  await expect(page.locator('.world-target-cue')).toBeVisible();
  const cue=await page.locator('.world-target-cue').evaluate(element=>({outer:getComputedStyle(element.querySelector('svg')!).stroke,inner:getComputedStyle(element.querySelector('ellipse+ellipse')!).stroke}));
  expect(contrast(cue.outer,cue.inner)).toBeGreaterThan(7);
  const summary=page.locator('.ambience-settings > summary');
  const closed=await summary.evaluate(element=>({ink:getComputedStyle(element).color,paper:getComputedStyle(document.querySelector('.topbar')!).backgroundColor}));
  // CSS color-mix serializes as color(srgb); canvas normalizes it to rgb for WCAG calculation.
  const headerColor=await page.evaluate(color=>{const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!;ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return `rgb(${[...ctx.getImageData(0,0,1,1).data].slice(0,3).join(',')})`;},closed.paper);
  expect(contrast(closed.ink,headerColor)).toBeGreaterThan(4.5);
  await summary.click();await summary.focus();await summary.press('Tab');await page.keyboard.press('Shift+Tab');await expect(summary).toBeFocused();
  const opened=await summary.evaluate(element=>({ink:getComputedStyle(element).color,paper:getComputedStyle(element).backgroundColor,outline:getComputedStyle(element).outlineStyle}));
  expect(contrast(opened.ink,opened.paper)).toBeGreaterThan(4.5);expect(opened.outline).toBe('solid');
  await page.screenshot({path:privateArtifact(`interface/${info.project.name}-${served}-ambience.png`)});
  await summary.press('Escape');
  await page.locator('[data-world-anchor="workshop.lamp"]').click();
  const source=page.locator('.repair-line .word').first();await source.click();
  const wordCard=page.locator('.word-popover');await expect(wordCard).toBeVisible();
  const wordStyle=await wordCard.evaluate(element=>({ink:getComputedStyle(element).color,paper:getComputedStyle(element).backgroundColor}));
  expect(contrast(wordStyle.ink,wordStyle.paper)).toBeGreaterThan(4.5);
  await expect(wordCard.locator('.pinyin')).not.toBeEmpty();
  await page.screenshot({path:privateArtifact(`interface/${info.project.name}-${served}-lookup.png`)});
  await page.keyboard.press('Escape');await expect(source).toBeFocused();await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 expect(errors).toEqual([]);
});
