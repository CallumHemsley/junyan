import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Content, GameState } from "../src/contracts";
import base from "../src/content/content.json" with {type:"json"};
import gardenData from "../src/features/garden/content.json" with {type:"json"};
import { playOpening } from "./opening";
import { probeAudio, silentWav } from "./audio-fixtures";

const content = base as Content;
const appRoot = process.env.JUNYAN_NEIGHBOURHOOD_PREVIEW === "1" ? "/junyan/" : "/";
const missingVoiceFixture = silentWav(readFileSync(`public${content.foods[0].word.audio}`));
const gardenName = (id: string) => gardenData.words.find(word => word.id === gardenData.labels[id as keyof typeof gardenData.labels])!.hanzi;
const gardenTool = (page: Page, id: string) => page.locator(`.garden-tool-button[aria-label="${gardenName(id)}"]`);
async function stored(page: Page): Promise<GameState | null> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve,reject) => {
      const request=indexedDB.open("junyan-waiter",1);
      request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    });
    try {
      return await new Promise<GameState|null>((resolve,reject)=>{
        const transaction=db.transaction("saves");
        const request=transaction.objectStore("saves").get("v1");
        transaction.oncomplete=()=>resolve(request.result ?? null);
        transaction.onerror=()=>reject(transaction.error);
      });
    } finally { db.close(); }
  });
}
async function visit(page: Page, name: string) {
  await page.getByRole("navigation",{name:"楼里",exact:true}).getByRole("button",{name,exact:true}).click();
  await expect(page.getByRole("navigation",{name:"楼里",exact:true}).getByRole("button",{name,exact:true})).toHaveAttribute("aria-current","page");
}
async function startNormally(page: Page) {
  await page.goto(`${appRoot}?seed=42`);
  await expect(page.getByRole("navigation",{name:"楼里",exact:true})).toHaveCount(0);
  await playOpening(page);
  await page.getByRole("button",{name:"开门迎客"}).click();
}
async function serve(page: Page, table: number) {
  const saved=(await stored(page))!;
  const customer=saved.customers.find(value=>value.table===table)!;
  const order=content.orders.find(value=>value.id===customer.orderId)!;
  await page.getByTestId(`table-${table}`).click();
  const dialog=page.getByRole("dialog",{name:`${table}桌点餐`});
  if(customer.phase==="seated" || saved.tray.length===0) {
    await dialog.getByRole("button",{name:"去厨房",exact:true}).click();
    for(const item of order.items) {
      const food=content.foods.find(value=>value.id===item.foodId)!;
      for(let n=0;n<item.quantity;n++) await page.getByRole("button",{name:`拿${food.word.hanzi}`,exact:true}).click();
    }
    await page.getByRole("button",{name:"端好了，去上菜"}).click();
    await page.getByTestId(`table-${table}`).click();
  }
  await dialog.getByRole("button",{name:/^上菜/}).click();
  const total=order.items.reduce((sum,item)=>sum+content.foods.find(food=>food.id===item.foodId)!.price*item.quantity,0);
  for(let n=0;n<order.paid-total;n++) await dialog.getByRole("button",{name:"+1块",exact:true}).click();
  await dialog.getByRole("button",{name:"递上找零"}).click();
  await expect(dialog.locator(".thanks-chop")).toBeVisible();
  await dialog.getByRole("button",{name:"继续招呼"}).click();
}
function restaurantSnapshot(game: GameState) {
  const {neighbourhood,journal,...restaurant}=game;
  return restaurant;
}

test.describe("interaction-only routes with native PCM responses for missing feature voices",()=>{
  test.use({serviceWorkers:"block"});
  test("normal opening, all four real locations, learning, gifts, reload and restaurant-only next day",async({page},info)=>{
    test.setTimeout(240000);
    const errors:string[]=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
    await page.route(/\/audio\/(apartment|cats|repairs|garden)\/.*\.wav(?:\?.*)?$/,route=>route.fulfill({status:200,contentType:"audio/wav",body:missingVoiceFixture}));
    await probeAudio(page);
    await startNormally(page);
    await page.getByTestId("table-1").click();
    await page.getByRole("button",{name:"去厨房",exact:true}).click();
    await page.getByRole("button",{name:"拿包子",exact:true}).click();
    await page.getByRole("button",{name:"端好了，去上菜"}).click();
    await expect.poll(async()=> (await stored(page))?.tray.length).toBe(1);
    const restaurant=restaurantSnapshot((await stored(page))!);

    await visit(page,"家");
    await page.getByRole("button",{name:"收下",exact:true}).click();
    await expect(page.locator(".apartment .new-word").first()).toBeVisible();
    await page.locator(".apartment-items").getByRole("button",{name:/桌子/}).click();
    await page.getByRole("button",{name:"选格子",exact:true}).click();
    const beforeInvalid=(await stored(page))!.journal;
    await page.getByRole("button",{name:/第1行第1格/}).click();
    await page.getByRole("button",{name:"放这里",exact:true}).click();
    await expect(page.locator(".apartment-speech")).toContainText("这里先不放");
    await expect.poll(async()=> (await stored(page))?.journal).toEqual(beforeInvalid);
    await page.getByRole("button",{name:/第2行第3格/}).click();
    await page.getByRole("button",{name:"放这里",exact:true}).click();
    await expect.poll(async()=> (await stored(page))?.neighbourhood?.apartment.placements.find(item=>item.id==="table")).toMatchObject({x:2,y:1});
    await page.screenshot({path:`output/neighbourhood/${info.project.name}-apartment.png`,fullPage:true});
    expect(await page.evaluate(()=> (window as any).__ambienceElements.every((audio:HTMLAudioElement)=>audio.paused))).toBe(true);
    expect(await page.evaluate(()=> (window as any).__ambienceElements.length)).toBe(1);

    await visit(page,"院子");
    const clue=page.locator(".cats-speech [data-word-lookup]").first();
    await clue.click();
    await expect(page.locator(".word-popover .pinyin")).not.toBeEmpty();
    await page.getByRole("button",{name:"关闭词卡",exact:true}).click();
    await expect(clue).toBeFocused();
    await page.getByTestId("cats-white").click();
    await expect(page.locator(".cats-speech .new-word").first()).toBeVisible();
    await page.locator(".cats-replay").click();
    await page.getByTestId("cats-action-approach").click();
    await expect.poll(async()=> (await stored(page))?.neighbourhood?.cats.feedback).toBe("gentle");
    await page.getByTestId("cats-action-crouch").click();
    await page.getByTestId("cats-action-wait").click();
    await page.getByTestId("cats-action-approach").click();
    await page.getByTestId("cats-action-follow").click();
    await page.getByTestId("cats-action-reunite").click();
    await expect.poll(async()=> (await stored(page))?.neighbourhood?.cats.story.node).toBe("reunited");
    await page.getByRole("button",{name:"收下猫靠垫",exact:true}).click();
    const giftWord=page.locator(".neighbourhood-gift-note [data-word-lookup]").first();
    await giftWord.click();
    await expect(page.locator(".word-popover .pinyin")).not.toBeEmpty();
    await page.getByRole("button",{name:"关闭词卡",exact:true}).click();
    await expect(giftWord).toBeFocused();
    await page.screenshot({path:`output/neighbourhood/${info.project.name}-cats.png`,fullPage:true});

    await visit(page,"修理间");
    await page.getByTestId("repair-part-bulb").click();
    await page.locator(".repair-part-actions").getByRole("button",{name:"拧紧",exact:true}).click();
    await page.locator(".repair-main-actions").getByRole("button",{name:"试试",exact:true}).click();
    await page.locator(".repair-main-actions").getByRole("button",{name:"放回",exact:true}).click();
    await page.getByTestId("repair-job-toy").click();
    await page.getByTestId("repair-part-cover").click();
    await page.locator(".repair-part-actions").getByRole("button",{name:"打开",exact:true}).click();
    await page.getByTestId("repair-part-lead").click();
    await page.locator(".repair-part-actions").getByRole("button",{name:"接上",exact:true}).click();
    await page.getByTestId("repair-part-cell").click();
    await page.locator(".repair-part-actions").getByRole("button",{name:"换电池",exact:true}).click();
    await page.getByTestId("repair-part-cover").click();
    await page.locator(".repair-part-actions").getByRole("button",{name:"盖上",exact:true}).click();
    await page.locator(".repair-main-actions").getByRole("button",{name:"试试",exact:true}).click();
    await page.locator(".repair-main-actions").getByRole("button",{name:"放回",exact:true}).click();
    await page.getByRole("button",{name:"收下凳子",exact:true}).click();
    await page.screenshot({path:`output/neighbourhood/${info.project.name}-repairs.png`,fullPage:true});

    await visit(page,"屋顶花园");
    await gardenTool(page,"tidy").click();
    await gardenTool(page,"water-verb").click();
    const confirmation=page.getByTestId("garden-confirm");
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button",{name:"土",exact:true}).first().click();
    await expect(page.locator(".word-popover")).toBeVisible();
    await page.getByRole("button",{name:"关闭词卡",exact:true}).click();
    await page.keyboard.press("Escape");
    await expect(confirmation).toHaveCount(0);
    for(const plant of ["climber","tree"] as const) {
      await page.getByRole("button",{name:`${gardenName("select")}${gardenName(plant)}`,exact:true}).click();
      await gardenTool(page,"water-verb").click();
      await expect.poll(async()=> (await stored(page))?.neighbourhood?.garden.plants[plant].care).toBe("ready");
    }
    await page.screenshot({path:`output/neighbourhood/${info.project.name}-garden.png`,fullPage:true});
    const beforeReload=(await stored(page))!;
    await page.reload();
    await expect(page.getByTestId("garden-view")).toBeVisible();
    await expect.poll(async()=> (await stored(page))?.neighbourhood).toEqual(beforeReload.neighbourhood);
    await visit(page,"家");
    for(const gift of ["cats.cushion","repairs.stool"] as const) expect((await stored(page))?.neighbourhood?.apartment.owned.filter(id=>id===gift)).toHaveLength(1);
    await visit(page,"早安小馆");
    await expect.poll(async()=>restaurantSnapshot((await stored(page))!)).toEqual(restaurant);
    await expect.poll(()=>page.evaluate(()=> (window as any).__ambienceElements.filter((audio:HTMLAudioElement)=>!audio.paused).length)).toBe(1);
    expect(await page.evaluate(()=> (window as any).__ambienceElements.length)).toBe(1);
    for(const table of [1,2,3,4]) await serve(page,table);
    await expect(page.getByRole("dialog",{name:"今日小结"})).toContainText("累计进账");
    await page.getByRole("button",{name:"回家看看",exact:true}).click();
    await expect.poll(async()=> (await stored(page))?.day).toBe(1);
    await visit(page,"早安小馆");
    await page.getByRole("button",{name:"明天见",exact:false}).click();
    await visit(page,"屋顶花园");
    await expect.poll(async()=> (await stored(page))?.day).toBe(2);
    await expect.poll(async()=> Object.values((await stored(page))!.neighbourhood!.garden.plants).every(plant=>plant.growth===1)).toBe(true);
    await gardenTool(page,"observe").click();
    await expect(page.locator(".garden-spoken .new-word").first()).toBeVisible();
    await page.getByRole("button",{name:"收下盆栽",exact:true}).click();
    await page.reload();
    await expect(page.getByTestId("garden-view")).toBeVisible();
    await expect(page.getByRole("button",{name:"收下盆栽",exact:true})).toHaveCount(0);
    await expect.poll(async()=> (await stored(page))?.neighbourhood?.claimedGiftIds).toEqual(["cats.cushion","repairs.stool","garden.planter"]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    expect(errors).toEqual([]);
    await info.attach("interaction-only-audio-disclosure",{body:"Namespaced missing feature WAV requests received in-memory native PCM fixtures. This verifies interaction/save/playback ownership, not real feature speech or offline voice readiness. Real existing speech and ambience were unchanged.",contentType:"text/plain"});
  });
});

test("real missing feature voice reports native failure without a substitute",async({page},info)=>{
  const failures:string[]=[];
  page.on("console",message=>{if(message.type()==="error")failures.push(message.text());});
  await probeAudio(page);
  await page.goto(`${appRoot}?test=1&seed=42`);
  await page.getByRole("button",{name:"开门迎客"}).click();
  await visit(page,"家");
  await expect(page.getByText("声音暂时没有播出，再点一次听听。",{exact:true})).toBeVisible();
  expect(await page.evaluate(()=> (window as any).__audioProbe.some((event:any)=>event.src.includes("/audio/apartment/") && event.status!=="playing"))).toBe(true);
  const nativeFailures=await page.evaluate(()=> (window as any).__audioElements.filter((audio:HTMLAudioElement)=>audio.src.includes("/audio/apartment/") && audio.error).map((audio:HTMLAudioElement)=>({src:audio.src,code:audio.error!.code,message:audio.error!.message})));
  expect(nativeFailures.length).toBeGreaterThan(0);
  await info.attach("expected-missing-real-audio",{body:JSON.stringify({nativeFailures,consoleErrors:failures},null,2),contentType:"application/json"});
});
