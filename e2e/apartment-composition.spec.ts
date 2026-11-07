import {expect,test,type Page} from '@playwright/test';
import type {GameState} from '../src/contracts';
import {seedDayOne,withSkip} from './opening';
import {closeActivity,interactAt,savedGame,visitWorld,walkTo} from './world-journey';
import {privateArtifact} from './private-artifacts';

// Same IndexedDB observation used by the shipped neighbourhood persistence journey.
async function stored(page:Page):Promise<GameState|null> {
  return page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    try{return await new Promise<GameState|null>((resolve,reject)=>{const transaction=db.transaction('saves');const request=transaction.objectStore('saves').get('v1');transaction.oncomplete=()=>resolve(request.result??null);transaction.onerror=()=>reject(transaction.error);});}
    finally{db.close();}
  });
}

test('grouped apartment supports real furnishing persistence, relocated tea inspection and physical arrival/departure',async({page,baseURL},info)=>{
  test.setTimeout(240_000);page.setDefaultTimeout(8_000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await seedDayOne(page,baseURL!);
  await page.goto(withSkip('/?seed=42'));
  expect(await page.evaluate(()=>'__TEST__' in window)).toBe(false);
  await page.getByRole('button',{name:'开门迎客'}).click();
  await visitWorld(page,'家');
  await page.getByRole('button',{name:'收下',exact:true}).click();
  const inventory=page.locator('.apartment-items');
  await inventory.getByRole('button',{name:/桌子.*收着/}).click();
  await page.getByRole('button',{name:'第2行第3格',exact:true}).click();
  await page.getByRole('button',{name:'转一下',exact:true}).click();
  await page.getByRole('button',{name:'放这里',exact:true}).click();
  const table={id:'table',x:2,y:1,rotation:1};
  await expect.poll(async()=>(await savedGame(page)).neighbourhood!.apartment.placements.find(p=>p.id==='table')).toEqual(table);
  await inventory.getByRole('button',{name:/桌子.*屋里/}).click();
  await page.getByRole('button',{name:'收起来',exact:true}).click();
  await expect.poll(async()=>(await savedGame(page)).neighbourhood!.apartment.placements.some(p=>p.id==='table')).toBe(false);
  await page.getByRole('button',{name:'撤回',exact:true}).click();
  await expect.poll(async()=>(await savedGame(page)).neighbourhood!.apartment.placements.find(p=>p.id==='table')).toEqual(table);
  await inventory.getByRole('button',{name:/靠垫.*收着/}).click();
  await page.getByRole('button',{name:'第4行第4格',exact:true}).click();
  await page.getByRole('button',{name:'放这里',exact:true}).click();
  await page.locator('.apartment-line .word').first().click();
  await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();
  await page.getByRole('button',{name:'关闭词卡',exact:true}).click();
  const placed=(await savedGame(page)).neighbourhood!.apartment.placements;
  expect(placed.find(p=>p.id==='bed')).toEqual({id:'bed',x:0,y:0,rotation:0});
  expect((await savedGame(page)).journal['apartment.store']?.recovered).toBe(true);
  await page.screenshot({path:privateArtifact(`composition/${info.project.name}-furnishing.png`)});
  await expect.poll(async()=>(await stored(page))?.neighbourhood?.apartment.placements).toEqual(placed);
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('junyan-waiter-pending-v1'))).toBeNull();
  await page.reload();await page.getByTestId('world-viewport').waitFor();
  const open=page.getByRole('button',{name:'开门迎客'});if(await open.isVisible())await open.click();
  await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map','apartment');
  expect((await stored(page))!.neighbourhood!.apartment.placements).toEqual(placed);
  await closeActivity(page);
  await walkTo(page,{x:14.5,y:20.5});
  const inspect=page.locator('[data-world-life="apartment.tea-nook/inspect"]');
  await expect(inspect).toBeVisible();
  await inspect.click();
  await expect.poll(async()=>(await savedGame(page)).world!.life!.discoveries.some(d=>d.landmarkId==='apartment.tea-nook')).toBe(true);
  expect((await savedGame(page)).world!.life!.reactions.find(r=>r.targetId==='apartment.tea-nook')).toMatchObject({mapId:'apartment',reaction:'watch'});
  await page.screenshot({path:privateArtifact(`composition/${info.project.name}-tea-response.png`)});
  await interactAt(page,'apartment.furnish');
  expect((await savedGame(page)).neighbourhood!.apartment.placements).toEqual(placed);
  await visitWorld(page,'早安小馆');
  expect((await savedGame(page)).world!.mapId).toBe('restaurant');
  expect((await savedGame(page)).neighbourhood!.apartment.placements).toEqual(placed);
  expect(errors).toEqual([]);
});
