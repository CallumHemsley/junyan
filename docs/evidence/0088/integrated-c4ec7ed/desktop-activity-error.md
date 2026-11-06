# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity.spec.ts >> physical service, journal, cats, furnishing undo, garden and repair continuity
- Location: docs/evidence/0088/integrated-c4ec7ed/activity.spec.ts:38:1

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('cats-white')
    - locator resolved to <button type="button" class="cats-target" aria-pressed="false" data-testid="cats-white">小白</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" class="cats-target" aria-pressed="false" data-testid="cats-black">小黑</button> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" class="cats-target" aria-pressed="false" data-testid="cats-black">小黑</button> intercepts pointer events
    - retrying click action
      - waiting 100ms
    28 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button type="button" class="cats-target" aria-pressed="false" data-testid="cats-black">小黑</button> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "君言首页" [ref=e5] [cursor=pointer]:
      - /url: ./
      - generic [ref=e6]: 君言
      - generic [ref=e7]: 君言 / 早安小馆
    - navigation "小馆" [ref=e8]:
      - group [ref=e9]:
        - generic "环境声设置" [ref=e10] [cursor=pointer]: 环境声
      - button "本子 17" [ref=e14] [cursor=pointer]:
        - generic [ref=e17]: 本子
        - generic [ref=e18]: "17"
      - button "怎么玩" [ref=e19] [cursor=pointer]
  - main [ref=e20]:
    - region "院子，方向键走动，点地面走过去" [ref=e21]:
      - button "院子" [ref=e24] [cursor=pointer]
      - generic "走动" [ref=e25]:
        - button "向前走" [disabled] [ref=e26]: ↑
        - button "向左走" [disabled] [ref=e27]: ←
        - button "向后走" [disabled] [ref=e28]: ↓
        - button "向右走" [disabled] [ref=e29]: →
    - generic [ref=e30]:
      - button "继续走走" [ref=e31] [cursor=pointer]
      - generic "院子" [active] [ref=e32]:
        - region "院子" [ref=e33]:
          - generic [ref=e34]:
            - heading [level=2] [ref=e35]:
              - button "院子" [ref=e36] [cursor=pointer]
            - generic [ref=e37]:
              - button "小白" [ref=e38] [cursor=pointer]
              - text: ·
              - button "小黑" [ref=e39] [cursor=pointer]
          - generic [ref=e40]:
            - button "小白" [ref=e41] [cursor=pointer]
            - button "小黑" [ref=e42] [cursor=pointer]
          - generic "看看" [ref=e43]:
            - button "阿姨" [ref=e44] [cursor=pointer]
            - button "自行车" [ref=e45] [cursor=pointer]
            - button "椅子" [ref=e46] [cursor=pointer]
            - button "门口" [ref=e47] [cursor=pointer]
            - button "窗边" [ref=e48] [cursor=pointer]
          - generic [ref=e49]:
            - paragraph [ref=e50]:
              - button "阿姨" [ref=e51] [cursor=pointer]
            - generic [ref=e52]:
              - button "你" [ref=e53] [cursor=pointer]
              - button "看见" [ref=e54] [cursor=pointer]
              - button "小白" [ref=e55] [cursor=pointer]
              - button "了" [ref=e56] [cursor=pointer]
              - button "吗" [ref=e57] [cursor=pointer]
            - button "再听" [ref=e59] [cursor=pointer]: ↻
```

# Test source

```ts
  1  | import {test,expect} from '@playwright/test';
  2  | import {playOpening} from '../../../../e2e/opening';
  3  | import {writeFile,appendFile} from 'node:fs/promises';
  4  | import {readFileSync} from 'node:fs';
  5  | import definitions from './maps.json' with {type:'json'};
  6  | import {restaurantMap} from './restaurant.mjs';
  7  | import {findPath,canStand} from './geometry.mjs';
  8  | import {cameraForMap,project} from './camera.mjs';
  9  | const dir='docs/evidence/0088/integrated-c4ec7ed';
  10 | const maps=Object.fromEntries([restaurantMap,...definitions].map(m=>[m.id,m]));
  11 | async function game(page:any){return page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return await new Promise<any>((resolve,reject)=>{const t=db.transaction('saves');const r=t.objectStore('saves').get('v1');t.oncomplete=()=>{resolve(r.result);db.close()};t.onerror=()=>reject(t.error)})})}
  12 | async function world(page:any){return (await game(page))?.world??{mapId:'restaurant',position:{x:12,y:17},activeActivity:null}}
  13 | async function walkTo(page:any,target:any,expectedMap:string){
  14 |  const canvas=page.getByTestId('world-viewport').locator('canvas');
  15 |  for(let attempt=0;attempt<240;attempt++){
  16 |   const state=await world(page);if(state.mapId!==expectedMap)return;
  17 |   const from=state.position,d=Math.hypot(target.x-from.x,target.y-from.y);if(d<.18)return;
  18 |   const path=findPath(maps[expectedMap],from,target);if(!path.length)throw new Error(`No route ${expectedMap} ${JSON.stringify(from)} -> ${JSON.stringify(target)}`);
  19 |   const step=path.find((p:any)=>Math.hypot(p.x-from.x,p.y-from.y)>.15)??target;
  20 |   const length=Math.hypot(step.x-from.x,step.y-from.y),limit=Math.min(length,4);
  21 |   const local={x:from.x+(step.x-from.x)/length*limit,y:from.y+(step.y-from.y)/length*limit};
  22 |   const rect=await canvas.boundingBox();if(!rect)throw new Error('canvas missing');
  23 |   const camera=cameraForMap(maps[expectedMap].bounds,from,Math.ceil(rect.width/2),Math.ceil(rect.height/2),rect.width<600?11:15);
  24 |   const p=project(local,camera);const x=rect.x+p.x*rect.width/camera.width,y=rect.y+p.y*rect.height/camera.height;
  25 |   if(x<rect.x||x>rect.x+rect.width||y<rect.y||y>rect.y+rect.height)throw new Error(`Route target outside camera ${expectedMap}`);
  26 |   await page.mouse.click(x,y);await page.waitForTimeout(limit/5*1000+180);
  27 |   const after=await world(page);if(after.mapId===expectedMap&&Math.hypot(after.position.x-from.x,after.position.y-from.y)<.025)throw new Error(`Input stalled ${expectedMap} at ${JSON.stringify(from)} toward ${JSON.stringify(local)}`);
  28 |  }
  29 |  throw new Error(`Route timeout ${expectedMap}`);
  30 | }
  31 | async function closeActivity(page:any){const close=page.getByRole('button',{name:'关闭',exact:true});if(await close.count())await close.last().click();const walk=page.getByRole('button',{name:'继续走走',exact:true});if(await walk.count())await walk.click();}
  32 | async function enter(page:any,id:string){const w=await world(page),a=maps[w.mapId].anchors.find((a:any)=>a.id===id);if(!a)throw new Error(`anchor absent ${id}`);let target=a.position;if(!canStand(maps[w.mapId],target)){const options=[];for(let x=-a.radius;x<=a.radius;x+=.3)for(let y=-a.radius;y<=a.radius;y+=.3){const p={x:a.position.x+x,y:a.position.y+y};if(Math.hypot(x,y)<=a.radius&&canStand(maps[w.mapId],p))options.push(p)}target=options.sort((p,q)=>Math.hypot(p.x-w.position.x,p.y-w.position.y)-Math.hypot(q.x-w.position.x,q.y-w.position.y))[0];}if(!target)throw new Error('no anchor approach');await walkTo(page,target,w.mapId);await page.locator(`[data-world-anchor="${id}"]`).click();}
  33 | 
  34 | const content=JSON.parse(readFileSync('/workspace/junyan-review-integration/src/content/content.json','utf8'));
  35 | const gardenData=JSON.parse(readFileSync('/workspace/junyan-review-integration/src/features/garden/content.json','utf8'));
  36 | const gardenName=(id:string)=>gardenData.words.find((w:any)=>w.id===gardenData.labels[id]).hanzi;
  37 | async function travel(page:any,route:string[]){for(const next of route){const before=await world(page),m=maps[before.mapId],exit=m.exits.find((e:any)=>e.targetMapId===next);if(!exit)throw new Error(`No edge ${m.id}->${next}`);await walkTo(page,{x:exit.rect.x+exit.rect.width/2,y:exit.rect.y+exit.rect.height/2},m.id);await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',next);}}
  38 | test('physical service, journal, cats, furnishing undo, garden and repair continuity',async({page},info)=>{
  39 |  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  40 |  const log=`${dir}/${info.project.name}-activity-events.jsonl`;await writeFile(log,'');
  41 |  const note=async(stage:string)=>{const state=await game(page);await appendFile(log,JSON.stringify({stage,at:new Date().toISOString(),state})+'\n');console.log(info.project.name,stage);await page.screenshot({path:`${dir}/${info.project.name}-activity-${stage}.png`,fullPage:true});};
  42 |  try {
  43 |   await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();await page.waitForTimeout(700);expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
  44 |   for(const table of [1,2,3]){
  45 |    await enter(page,`restaurant.table-${table}`);
  46 |    const dialog=page.getByRole('dialog',{name:`${table}桌点餐`});await expect(dialog).toBeVisible();
  47 |    const current=await game(page),customer=current.customers.find((c:any)=>c.table===table),order=content.orders.find((o:any)=>o.id===customer.orderId);
  48 |    if(table===1){await dialog.locator('[data-word-lookup]').first().click();await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();await page.getByRole('button',{name:'关闭词卡',exact:true}).click();}
  49 |    await closeActivity(page);await enter(page,'restaurant.kitchen');
  50 |    for(const item of order.items){const food=content.foods.find((f:any)=>f.id===item.foodId);for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${food.word.hanzi}`,exact:true}).click();}
  51 |    await closeActivity(page);await enter(page,`restaurant.table-${table}`);
  52 |    await dialog.getByRole('button',{name:/^上菜/}).click();
  53 |    const total=order.items.reduce((sum:number,item:any)=>sum+content.foods.find((f:any)=>f.id===item.foodId).price*item.quantity,0);
  54 |    for(let n=0;n<order.paid-total;n++)await dialog.getByRole('button',{name:'+1块',exact:true}).click();
  55 |    await dialog.getByRole('button',{name:'递上找零'}).click();await expect(dialog.locator('.thanks-chop')).toBeVisible();
  56 |    await dialog.getByRole('button',{name:/继续招呼/}).click();await closeActivity(page);
  57 |    await expect.poll(async()=> (await game(page)).served).toBe(table);await note(`served-${table}`);
  58 |   }
  59 |   await page.getByRole('button',{name:/本子/}).click();await expect(page.getByRole('dialog',{name:'本子',exact:true}).locator('.journal-list')).toBeVisible();await note('journal');await closeActivity(page);
  60 |   await travel(page,['town','courtyard']);await enter(page,'courtyard.white');await expect(page.getByTestId('cats-view')).toBeVisible();
  61 |   // Physical anchor opens existing saved activity; select the visible cat control, not a teleport.
> 62 |   await page.getByTestId('cats-white').click();
     |                                        ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  63 |   for(const action of ['crouch','wait','approach','follow','reunite'])await page.getByTestId(`cats-action-${action}`).click();
  64 |   await expect.poll(async()=> (await game(page)).neighbourhood.cats.story.node).toBe('reunited');
  65 |   await page.getByRole('button',{name:'收下猫靠垫',exact:true}).click();await note('cats-reunited');await closeActivity(page);await note('cats-world-after');
  66 |   await travel(page,['residential-hall','residential-stairs','apartment']);await enter(page,'apartment.furnish');await page.getByRole('button',{name:'收下',exact:true}).click();
  67 |   const original=(await game(page)).neighbourhood.apartment.placements;
  68 |   await page.locator('.apartment-items').getByRole('button',{name:/桌子/}).click();await page.getByRole('button',{name:'选格子',exact:true}).click();await page.getByRole('button',{name:/第2行第3格/}).click();await page.getByRole('button',{name:'放这里',exact:true}).click();
  69 |   await expect.poll(async()=> (await game(page)).neighbourhood.apartment.placements.find((p:any)=>p.id==='table')).toMatchObject({x:2,y:1});await note('furnished');
  70 |   await page.getByRole('button',{name:'撤回',exact:true}).click();await expect.poll(async()=> (await game(page)).neighbourhood.apartment.placements).toEqual(original);
  71 |   const beforeReload=await game(page);await page.reload();await expect(page.locator('[data-world-activity="apartment"]')).toBeVisible();
  72 |   await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(beforeReload.neighbourhood);expect((await game(page)).world.position).toEqual(beforeReload.world.position);expect((await game(page)).world.activeAnchorId).toBe('apartment.furnish');await note('undo-reloaded');await closeActivity(page);
  73 |   await travel(page,['residential-stairs','rooftop']);await enter(page,'rooftop.garden');await expect(page.getByTestId('garden-view')).toBeVisible();
  74 |   for(const plant of ['climber','tree']){await page.getByRole('button',{name:`${gardenName('select')}${gardenName(plant)}`,exact:true}).click();await page.locator(`.garden-tool-button[aria-label="${gardenName('water-verb')}"]`).click();await expect.poll(async()=> (await game(page)).neighbourhood.garden.plants[plant].care).toBe('ready');}
  75 |   await note('garden-cared');const cared=(await game(page)).neighbourhood;await page.reload();await expect(page.getByTestId('garden-view')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(cared);await closeActivity(page);
  76 |   await travel(page,['residential-stairs','residential-hall','town','workshop']);await enter(page,'workshop.lamp');
  77 |   await page.getByTestId('repair-part-bulb').click();await page.locator('.repair-part-actions').getByRole('button',{name:'拧紧',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'试试',exact:true}).click();await page.locator('.repair-main-actions').getByRole('button',{name:'放回',exact:true}).click();await note('lamp-repaired');
  78 |   const repaired=(await game(page)).neighbourhood;await page.reload();await expect(page.locator('[data-world-activity="repairs"]')).toBeVisible();await expect.poll(async()=> (await game(page)).neighbourhood).toEqual(repaired);await closeActivity(page);
  79 |   await travel(page,['town','courtyard']);expect((await game(page)).neighbourhood.cats.story.node).toBe('reunited');await note('cat-return');
  80 |   expect(errors).toEqual([]);
  81 |  } finally {await writeFile(`${dir}/${info.project.name}-activity-final.json`,JSON.stringify({head:'c4ec7ed6ea60ced7c6c22a1514e273124ceeb678',errors,state:await game(page)},null,2));await page.screenshot({path:`${dir}/${info.project.name}-activity-final.png`,fullPage:true});}
  82 | });
  83 | 
```