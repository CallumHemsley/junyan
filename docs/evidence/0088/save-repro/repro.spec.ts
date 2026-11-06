import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {playOpening} from '../../../../e2e/opening';
async function stores(page:Page) {
 return page.evaluate(async()=>{
  const checkpoint=JSON.parse(localStorage.getItem('junyan-waiter-pending-v1') ?? 'null');
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const saved=await new Promise<any>((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();
  return {checkpoint,saved};
 });
}
test('non-movement checkpoint followed by movement and reload',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
 const nav=page.getByRole('navigation',{name:'楼里',exact:true});
 await nav.getByRole('button',{name:'家',exact:true}).click();
 await page.waitForTimeout(600);
 const before=await stores(page);
 const actionAt=Date.now();
 await nav.getByRole('button',{name:'早安小馆',exact:true}).click();
 await page.keyboard.press('ArrowDown');
 const movementIssuedAt=Date.now();
 await page.waitForTimeout(900);
 const afterMovement=await stores(page);
 await page.screenshot({path:`docs/evidence/0088/save-repro/${info.project.name}-before-reload.png`});
 await page.reload();await expect(nav.getByRole('button',{name:'早安小馆',exact:true})).toHaveAttribute('aria-current','page');
 await page.waitForTimeout(900);
 const afterReload=await stores(page);
 await page.screenshot({path:`docs/evidence/0088/save-repro/${info.project.name}-after-reload.png`});
 await writeFile(`docs/evidence/0088/save-repro/${info.project.name}-stores.json`,JSON.stringify({source:'8cd5bc209b7dc2d91cc0f765991de313f813f4eb',method:'Normal opening then apartment, restaurant navigation and ArrowDown, 900ms idle, reload, 900ms idle; all store access read-only',actionToMovementMs:movementIssuedAt-actionAt,before,afterMovement,afterReload,errors},null,2));
 expect(afterMovement.saved.player).not.toEqual(before.saved.player);
 expect(afterMovement.checkpoint.player).toEqual(before.saved.player);
 expect(afterReload.saved.player).toEqual(afterMovement.saved.player);
});
