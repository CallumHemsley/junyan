import {test,expect} from '@playwright/test';
import {playOpening} from '../../../e2e/opening';
import {writeFile} from 'node:fs/promises';
test('published foundation viewport with ordinary opening and held movement',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 const viewport=page.getByTestId('world-viewport');await expect(viewport.locator('canvas')).toHaveAttribute('data-rendered','true');
 await viewport.focus();await page.screenshot({path:'docs/world-program/runtime-e627/desktop.png'});
 const read=()=>page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const s=await new Promise<any>(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result)});db.close();return s?.world});
 await page.waitForTimeout(450);const before=await read();
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(600);await page.keyboard.up('ArrowUp');await page.waitForTimeout(450);const moved=await read();
 await page.reload();await expect(viewport.locator('canvas')).toHaveAttribute('data-rendered','true');await page.waitForTimeout(450);const restored=await read();
 await page.getByRole('button',{name:'开门迎客'}).click();await page.setViewportSize({width:390,height:664});await page.waitForTimeout(350);await page.screenshot({path:'docs/world-program/runtime-e627/phone.png',fullPage:true});
 await writeFile('docs/world-program/runtime-e627/observations.json',JSON.stringify({head:'e6270d0',method:'ordinary opening, held keyboard movement, read-only IndexedDB inspection, reload; no debug setters',before:before??null,moved,restored,errors},null,2));
 expect(moved.position.x).toBeLessThan(12);expect(moved.position.y).toBeLessThan(17);expect(restored.position).toEqual(moved.position);expect(errors).toEqual([]);
});
