import { test, expect, type Page } from "@playwright/test";
import data from "../src/content/content.json" with {type:"json"};
import type { Content, GameState } from "../src/contracts";
import { createGame } from "../src/game";
import * as repair from "../src/features/repairs/rules";
import { seedDayOne } from "./opening";

const content=data as Content;
const root=process.env.JUNYAN_NEIGHBOURHOOD_PREVIEW==="1"?"/junyan/":"/";
async function saved(page:Page):Promise<GameState> {
  return page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open("junyan-waiter",1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    try {return await new Promise<GameState>((resolve,reject)=>{const request=db.transaction("saves").objectStore("saves").get("v1");request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
    finally{db.close();}
  });
}

test.describe("saved-fixture migration with real feature voices",()=>{
  test.use({serviceWorkers:"block"});
  test.beforeEach(async({page})=>{
    await page.route("**/favicon.ico",route=>route.fulfill({status:204}));
  });

  test("a real old IndexedDB v1 row restores its journal and initializes locations without the hospital",async({page,baseURL})=>{
    const {neighbourhood,...legacy}=createGame(content);
    legacy.journal={bun:{lookups:2,lastSeen:1.5,recovered:true}};
    await seedDayOne(page,baseURL!,legacy);
    await page.goto(root);
    await expect(page.getByRole("button",{name:"醒来",exact:true})).toHaveCount(0);
    await page.getByRole("button",{name:"开门迎客"}).click();
    await expect.poll(async()=>(await saved(page)).neighbourhood).toEqual(neighbourhood);
    expect((await saved(page)).journal.bun).toEqual(legacy.journal.bun);
    await page.getByRole("navigation",{name:"楼里",exact:true}).getByRole("button",{name:"家",exact:true}).click();
    await expect(page.locator(".apartment")).toBeVisible();
    await expect.poll(async()=>(await saved(page)).neighbourhood?.location).toBe("apartment");
    await page.reload();
    await expect(page.locator(".apartment")).toBeVisible();
    expect((await saved(page)).journal.bun).toEqual(legacy.journal.bun);
  });

  test("corrupt feature fields reset independently while real IndexedDB receipts restore gifts",async({page,baseURL})=>{
    const game=createGame(content);
    let partial=repair.reduce(game.neighbourhood!.repairs,{type:"select",job:"lamp",part:"bulb"},1);
    partial=repair.reduce(partial,{type:"turn",job:"lamp",direction:"tighten"},1);
    const fixture={...game,neighbourhood:{...game.neighbourhood,apartment:null,cats:{broken:true},repairs:partial,claimedGiftIds:["repairs.stool"]}};
    await seedDayOne(page,baseURL!,fixture);
    await page.goto(root);
    await page.getByRole("button",{name:"开门迎客"}).click();
    await expect.poll(async()=>(await saved(page)).neighbourhood?.apartment?.owned).toEqual(["bed","repairs.stool"]);
    expect((await saved(page)).neighbourhood?.cats.story.node).toBe("search");
    expect((await saved(page)).neighbourhood?.repairs).toEqual(partial);
    expect((await saved(page)).neighbourhood?.garden).toEqual(game.neighbourhood?.garden);
    await page.getByRole("navigation",{name:"楼里",exact:true}).getByRole("button",{name:"家",exact:true}).click();
    await expect(page.locator(".apartment-items").getByRole("button",{name:/凳子/})).toBeVisible();
    await page.reload();
    await expect(page.locator(".apartment")).toBeVisible();
    expect((await saved(page)).neighbourhood?.claimedGiftIds).toEqual(["repairs.stool"]);
    expect((await saved(page)).neighbourhood?.apartment.owned.filter(id=>id==="repairs.stool")).toHaveLength(1);
  });
});
