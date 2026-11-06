import {test,expect} from '@playwright/test';
import {playOpening} from '../e2e/opening';
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('ordinary opening then offline world reload and exact audio bytes',async({page,context})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');await playOpening(page);await page.getByRole('dialog',{name:'怎么玩'}).getByRole('button',{name:'关闭',exact:true}).click();
 await expect(page.getByTestId('world-viewport').locator('canvas')).toHaveAttribute('data-rendered','true');
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await page.getByTestId('world-viewport').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(300);await page.keyboard.up('ArrowUp');await page.waitForTimeout(500);
 const state=()=>page.evaluate(async()=>{const r=indexedDB.open('junyan-waiter',1);const db=await new Promise<IDBDatabase>(resolve=>r.onsuccess=()=>resolve(r.result));const q=db.transaction('saves').objectStore('saves').get('v1');const s=await new Promise<any>(resolve=>q.onsuccess=()=>resolve(q.result));db.close();return s});
 const before=await state();expect(before.world).toBeTruthy();await context.setOffline(true);await page.reload();await expect(page.getByTestId('world-viewport').locator('canvas')).toHaveAttribute('data-rendered','true');await page.waitForTimeout(500);const after=await state();expect(after.world.position).toEqual(before.world.position);
 const files=readdirSync('public/audio').filter(n=>n.endsWith('.wav'));const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
 for(const name of files){const bytes=await page.evaluate(async name=>{const r=await fetch('./audio/'+name);if(!r.ok)throw Error(name+':'+r.status);return Array.from(new Uint8Array(await r.arrayBuffer()));},name);expect(hash(Buffer.from(bytes)),name).toBe(hash(readFileSync('public/audio/'+name)));}
 const manifest=await page.evaluate(async()=>{const link=document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!;return (await fetch(link.href)).json()});expect(manifest.start_url).toBeTruthy();
 await page.screenshot({path:'audit/offline-phone.png',fullPage:true});expect(errors).toEqual([]);
 writeFileSync('audit/offline-proof.json',JSON.stringify({head:'e02a747',method:'ordinary opening and held keyboard movement, offline reload, read-only saved-state observation, every existing WAV byte verified; no fixture/state injection',audioFiles:files.length,before:before.world,after:after.world,errors},null,2));
});
