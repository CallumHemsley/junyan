import {test,expect,type Page} from '@playwright/test';
import content from '../../../../src/content/content.json' with { type: 'json' };
async function playOpening(page:Page){
 await page.getByRole('button',{name:'醒来',exact:true}).click();
 const opening=page.locator('main.opening');
 for(const [index,step] of content.opening.steps.entries()){
  await expect(opening).toHaveAttribute('data-step',String(index));
  if(step.type==='request'){const food=content.foods.find(f=>f.id===step.want)!;await opening.locator('.bedside-tray').getByRole('button',{name:food.word.hanzi,exact:true}).click();}
  if(step.type==='reply')await opening.locator('.reply-chips').getByRole('button').first().click();
  await opening.getByRole('button',{name:'继续',exact:true}).click();
 }
}
import {cameraForMap,project} from '/workspace/junyan-audit-e02/src/world/camera';
import {writeFile} from 'node:fs/promises';
const out='/workspace/junyan-0090/docs/evidence/0090/integration-e02';
async function read(page:Page){return page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const state=await new Promise<any>(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result)});db.close();return state;});}
async function walk(page:Page,to:{x:number;y:number}){
 await page.waitForTimeout(1600);const saved=await read(page);const box=(await page.locator('.connected-world canvas').boundingBox())!;
 const camera=cameraForMap({width:24,height:22},saved.world.position,Math.ceil(box.width/2),Math.ceil(box.height/2),11);
 const point=project(to,camera);await page.mouse.click(box.x+point.x*2,box.y+point.y*2);await page.waitForTimeout(2800);
}
test('ordinary opening to physical table and kitchen controls',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await playOpening(page);await page.getByRole('button',{name:/开门迎客/}).click();
 await page.screenshot({path:`${out}/390-entry.png`});
 await walk(page,{x:6.5,y:14});await page.screenshot({path:`${out}/390-table-arrival.png`});
 await expect(page.getByRole('button',{name:'3桌点餐',exact:true})).toBeVisible();await page.getByRole('button',{name:'3桌点餐',exact:true}).click();
 await expect(page.locator('.world-context')).toBeVisible();await page.waitForTimeout(300);await page.screenshot({path:`${out}/390-table-open.png`});
 const token=page.locator('.world-context .spoken .word').first();await token.click();await expect(page.locator('.word-popover')).toBeVisible();await page.screenshot({path:`${out}/390-word-card.png`});await page.keyboard.press('Escape');await expect(page.locator('.word-popover')).toHaveCount(0);await expect(page.locator('.world-context')).toBeVisible();
 const focusReturned=await token.evaluate(el=>el===document.activeElement);await page.screenshot({path:`${out}/390-after-word-escape.png`});
 await page.locator('.world-context .world-context-close').click();
 await page.getByRole('button',{name:'本子',exact:true}).click();await expect(page.getByRole('dialog',{name:'本子',exact:true})).toBeVisible();await page.screenshot({path:`${out}/390-journal.png`});await page.getByRole('button',{name:'关闭',exact:true}).click();
 await walk(page,{x:9,y:11});await walk(page,{x:12,y:9});await walk(page,{x:12,y:6.5});await page.screenshot({path:`${out}/390-kitchen-arrival.png`});await page.locator('[data-world-anchor="restaurant.kitchen"]').click();
 await expect(page.locator('.world-kitchen-foods')).toBeVisible();await page.screenshot({path:`${out}/390-kitchen-open.png`});
 await page.locator('.world-kitchen-food > button:first-child').first().click();await page.locator('.world-context-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await page.screenshot({path:`${out}/390-kitchen-tray.png`});
 await page.locator('.world-context .world-context-close').click();await page.getByRole('button',{name:'托盘',exact:true}).click();await page.screenshot({path:`${out}/390-tray-modal.png`});await page.getByRole('button',{name:'关闭',exact:true}).click();
 await page.setViewportSize({width:320,height:320});await page.locator('[data-world-anchor="restaurant.kitchen"]').click();await page.waitForTimeout(300);await page.screenshot({path:`${out}/320-short-kitchen.png`});
 const shortScroll=await page.locator('.world-context-scroll').evaluate(el=>({height:el.clientHeight,scrollHeight:el.scrollHeight}));
 let shortPickupError:string|null=null;
 try { await page.locator('.world-kitchen-food > button:first-child').first().click({timeout:2500}); } catch(error) { shortPickupError=String(error); }
 await page.screenshot({path:`${out}/320-short-pickup-attempt.png`});
 const short=await page.locator('.world-context').boundingBox();const saved=await read(page);
 await writeFile(`${out}/observations.json`,JSON.stringify({head:'e02a747',profile:'ordinary opening and pointer travel; no state setters or fixture writes',focusReturned,short,shortScroll,shortPickupError,saved,errors},null,2));
 expect(errors).toEqual([]);expect(focusReturned).toBe(true);
});
