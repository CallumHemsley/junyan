import {test,expect} from '@playwright/test';
import {playOpening} from '../../../../e2e/opening';
import {writeFile} from 'node:fs/promises';
const dir='docs/evidence/0088/viewport-e6270d0';
async function saved(page:any){return page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return await new Promise<any>((resolve,reject)=>{const t=db.transaction('saves');const r=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(r.result);db.close()};t.onerror=()=>reject(t.error)})})}
test('published viewport ordinary walking and contextual service',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 const view=page.getByTestId('world-viewport');await expect(view).toBeVisible();await view.focus();
 await page.screenshot({path:`${dir}/${info.project.name}-entry.png`,fullPage:true});
 await page.waitForTimeout(700);const before=await saved(page);
 await page.keyboard.down('ArrowUp');await page.keyboard.down('ArrowRight');await page.waitForTimeout(1600);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowUp');
 await page.waitForTimeout(700);const moved=await saved(page);
 await page.screenshot({path:`${dir}/${info.project.name}-walk.png`,fullPage:true});
 const anchor=page.locator('[data-world-anchor="restaurant.service"]');
 await expect(anchor).toBeVisible();await anchor.click();
 await expect(page.locator('[data-world-activity="restaurant"]')).toBeVisible();await expect(view).toBeVisible();
 await page.screenshot({path:`${dir}/${info.project.name}-activity.png`,fullPage:true});
 await page.getByRole('button',{name:'继续走走',exact:true}).click();await page.waitForTimeout(700);const closed=await saved(page);
 await page.reload();await expect(view).toBeVisible();await page.waitForTimeout(700);const restored=await saved(page);
 await writeFile(`${dir}/${info.project.name}-observations.json`,JSON.stringify({head:'e6270d0',method:'Production normal opening, held keyboard on both emulated viewports, actual anchor and close controls, read-only saves. Not touch-only proof.',errors,before:before?.world,moved:moved?.world,closed:closed?.world,restored:restored?.world},null,2));
 expect(moved.world.position).not.toEqual((before.world?.position??{x:12,y:17}));expect(restored.world.position).toEqual(closed.world.position);expect(errors).toEqual([]);
});
test('edge movement and rendered learning-label audit',async({page},info)=>{
 await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 const view=page.getByTestId('world-viewport');await expect(view).toBeVisible();
 const label=await page.locator('.world-place').evaluate(el=>({text:el.textContent,tag:el.tagName,buttons:el.querySelectorAll('button').length,pointerEvents:getComputedStyle(el).pointerEvents}));
 if(info.project.name==='phone'){
  const pad=await page.getByRole('button',{name:'向后走',exact:true}).boundingBox();if(!pad)throw new Error('pad missing');
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pad.x+pad.width/2,y:pad.y+pad.height/2}]});
  await page.waitForTimeout(5000);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
 }else{await view.focus();await page.keyboard.down('ArrowDown');await page.waitForTimeout(5000);await page.keyboard.up('ArrowDown');}
 await page.waitForTimeout(700);
 await page.screenshot({path:`${dir}/${info.project.name}-edge.png`,fullPage:true});
 await writeFile(`${dir}/${info.project.name}-edge.json`,JSON.stringify({head:'e6270d095dead66ccb1d6fe9fb1815bbee86d702',input:info.project.name==='phone'?'native CDP touchscreen hold on visible pad':'held ArrowDown',label,saved:(await saved(page))?.world},null,2));
});
