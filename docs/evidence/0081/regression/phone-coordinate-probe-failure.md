# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: journey.spec.ts >> ordinary opening, physical service, connected travel and reload
- Location: docs/evidence/0081/journey.spec.ts:30:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 12000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "君言首页" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: 君言 / 早安小馆
    - navigation "小馆" [ref=e7]:
      - group [ref=e8]:
        - generic "环境声设置" [ref=e9] [cursor=pointer]
      - button "本子" [ref=e12] [cursor=pointer]
      - button "怎么玩" [ref=e16] [cursor=pointer]
  - main [ref=e17]:
    - region "早安小馆，方向键走动，点地面走过去" [active] [ref=e18]:
      - button "早安小馆" [ref=e21] [cursor=pointer]
      - generic "走动" [ref=e22]:
        - button "向前走" [ref=e23] [cursor=pointer]: ↑
        - button "向左走" [ref=e24] [cursor=pointer]: ←
        - button "向后走" [ref=e25] [cursor=pointer]: ↓
        - button "向右走" [ref=e26] [cursor=pointer]: →
```

# Test source

```ts
  1  | import {test,expect,type Page} from '@playwright/test';
  2  | import {writeFile} from 'node:fs/promises';
  3  | import {playOpening} from '../../../e2e/opening';
  4  | async function stores(page:Page){return page.evaluate(async()=>{
  5  |  const checkpoint=JSON.parse(localStorage.getItem('junyan-waiter-pending-v1')??'null');
  6  |  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  7  |  const saved=await new Promise<any>((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return {checkpoint,saved};
  8  | });}
  9  | async function state(page:Page){const s=await stores(page);return s.checkpoint??s.saved;}
  10 | async function walkTo(page:Page,target:{x:number;y:number},expectedMap?:string){
  11 |  for(let iteration=0;iteration<240;iteration++){
  12 |   const before=await state(page),mapId=before.world?.mapId??'restaurant';if(expectedMap&&mapId!==expectedMap)return;
  13 |   const step=await page.evaluate(async({save,target})=>{
  14 |    const {mapsForNeighbourhood}=await import('/src/world/dynamic.ts');const {restoreWorld}=await import('/src/world/state.ts');const {findPath}=await import('/src/world/geometry.ts');const {cameraForMap,project}=await import('/src/world/camera.ts');
  15 |    const maps=mapsForNeighbourhood(save.neighbourhood),world=restoreWorld(save.world,maps,save.neighbourhood.location),map=maps[world.mapId];
  16 |    const distance=Math.hypot(world.position.x-target.x,world.position.y-target.y);if(distance<.19)return {done:true};
  17 |    const path=findPath(map,world.position,target);if(!path.length)return {error:`No path ${map.id} ${JSON.stringify(world.position)} to ${JSON.stringify(target)}`};
  18 |    const next=path[0],dx=next.x-world.position.x,dy=next.y-world.position.y,length=Math.hypot(dx,dy),amount=Math.min(1,2.5/length),point={x:world.position.x+dx*amount,y:world.position.y+dy*amount};
  19 |    const canvas=document.querySelector<HTMLCanvasElement>('.connected-world canvas')!,rect=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,world.position,rect.width,rect.height,rect.width<600?11:15),pixel=project(point,camera);
  20 |    return {point,x:rect.left+pixel.x,y:rect.top+pixel.y,mapId:map.id};
  21 |   },{save:before,target});
  22 |   if(step.done)return;if(step.error)throw new Error(step.error);
  23 |   if (page.viewportSize()!.width < 600) await page.touchscreen.tap(step.x!,step.y!); else await page.mouse.click(step.x!,step.y!);
> 24 |   await expect.poll(async()=>{const after=await state(page);return after.world?.mapId!==mapId||Math.hypot(after.world.position.x-step.point!.x,after.world.position.y-step.point!.y)<.24;},{timeout:12000}).toBe(true);
     |                                                                                                                                                                                                             ^ Error: expect(received).toBe(expected) // Object.is equality
  25 |  }
  26 |  throw new Error('Traversal exceeded 240 real click steps');
  27 | }
  28 | async function anchor(page:Page,id:string){const target=await page.evaluate(async id=>{const {worldMaps}=await import('/src/world/registry.ts');return Object.values(worldMaps).flatMap(m=>m.anchors).find(a=>a.id===id)!.position;},id);await walkTo(page,target);await page.locator(`[data-world-anchor="${id}"]`).click();}
  29 | async function exit(page:Page,targetMap:string){const save=await state(page),mapId=save.world.mapId;const target=await page.evaluate(async({mapId,targetMap})=>{const {worldMaps}=await import('/src/world/registry.ts');const e=worldMaps[mapId].exits.find(e=>e.targetMapId===targetMap)!;if(!e)throw new Error(`Missing edge ${mapId} -> ${targetMap}`);return {x:e.rect.x+e.rect.width/2,y:e.rect.y+e.rect.height/2};},{mapId,targetMap});await walkTo(page,target,mapId);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',targetMap);}
  30 | test('ordinary opening, physical service, connected travel and reload',async({page},info)=>{
  31 |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  32 |  await page.goto('/?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
  33 |  expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
  34 |  const checkpoints:any[]=[];
  35 |  for(const table of [1,2,3]){
  36 |   await anchor(page,`restaurant.table-${table}`);await expect(page.getByRole('dialog',{name:`${table}桌点餐`})).toBeVisible();
  37 |   if(table===1){await page.locator('.paper-panel .spoken .word').first().click();await expect(page.locator('.word-popover .pinyin')).toBeVisible();await page.getByRole('button',{name:'关闭词卡'}).click();}
  38 |   const save=await state(page),order=await page.evaluate(async({save,table})=>{const {content}=await import('/src/neighbourhood/registry.ts');const order=content.orders.find(o=>o.id===save.customers.find((c:any)=>c.table===table).orderId)!;return {...order,foods:order.items.map(i=>({name:content.foods.find(f=>f.id===i.foodId)!.word.hanzi,quantity:i.quantity,price:content.foods.find(f=>f.id===i.foodId)!.price}))};},{save,table});
  39 |   await page.getByRole('button',{name:'关闭',exact:true}).click();await anchor(page,'restaurant.kitchen');
  40 |   for(const item of order.foods)for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${item.name}`,exact:true}).click();
  41 |   await page.getByRole('button',{name:'端好了，去上菜'}).click();await anchor(page,`restaurant.table-${table}`);
  42 |   await page.getByRole('button',{name:'上菜',exact:false}).last().click();
  43 |   const total=order.foods.reduce((sum:any,f:any)=>sum+f.price*f.quantity,0);for(let n=0;n<order.paid-total;n++)await page.getByRole('button',{name:'+1块',exact:true}).click();
  44 |   await page.getByRole('button',{name:'递上找零'}).click();await expect(page.locator('.thanks-chop')).toBeVisible();await page.getByRole('button',{name:'继续招呼'}).click();
  45 |   checkpoints.push({table,state:await state(page)});
  46 |  }
  47 |  await page.screenshot({path:`docs/evidence/0081/regression/${info.project.name}-service-world.png`});
  48 |  const route=['town','courtyard','residential-hall','residential-stairs','apartment','residential-stairs','rooftop','residential-stairs','residential-hall','town','workshop','town','park','riverbank','town','restaurant'];
  49 |  for(const destination of route){await exit(page,destination);await page.screenshot({path:`docs/evidence/0081/regression/${info.project.name}-${destination}-arrival.png`});checkpoints.push({destination,state:await state(page)});}
  50 |  const world=page.getByTestId('world-viewport');await world.focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(180);await page.keyboard.up('ArrowUp');await page.waitForTimeout(900);
  51 |  const before=await stores(page);await page.reload();await page.waitForTimeout(900);const after=await stores(page);
  52 |  expect(after.saved.world.position).toEqual(before.saved.world.position);expect(after.saved.served).toBe(3);expect(Object.keys(after.saved.journal).length).toBeGreaterThan(0);expect(errors).toEqual([]);
  53 |  await writeFile(`docs/evidence/0081/regression/${info.project.name}-journey-proof.json`,JSON.stringify({checkpoints,before,after,errors,method:'Ordinary opening and real pointer/keyboard UI; reads state only; no save injection or internal dispatch'},null,2));
  54 | });
  55 |
```
