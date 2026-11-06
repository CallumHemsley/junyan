import { interactAt, closeActivity, savedGame } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { seedDayOne, withSkip } from "./opening";
import {type Content, type GameState} from "../src/contracts";
import {restaurantMap} from "../src/world/restaurant";
import {findPath} from "../src/world/geometry";

test.use({ launchOptions: { args: ["--mute-audio"] } });
const diagnostics = new WeakMap<Page, string[]>();

async function activate(page: Page, control: Locator) {
  await expect(control).toBeVisible();
  await expect(control).toHaveAccessibleName(/\S/);
  for (let step = 0; step < 80; step++) {
    if (await control.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(control).toBeFocused();
  await page.keyboard.press("Enter");
}

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const hooks = (window as unknown as {
      __TEST__: { getState(): GameState; content: Content };
    }).__TEST__;
    return { state: hooks.getState(), content: hooks.content };
  });
}

async function approach(page: Page, anchorId: string) {
  await closeActivity(page);
  const target=restaurantMap.anchors.find(anchor=>anchor.id===anchorId)!;
  const viewport=page.getByTestId('world-viewport');await viewport.focus();
  for(let step=0;step<250;step++){
    const position=(await savedGame(page)).world!.position;
    if(Math.hypot(position.x-target.position.x,position.y-target.position.y)<.55)break;
    const next=findPath(restaurantMap,position,target.position)[0];expect(next).toBeDefined();
    const dx=next.x-position.x,dy=next.y-position.y;
    const horizontal=dx-dy,vertical=dx+dy;
    const keys=[...(Math.abs(horizontal)>.05?[horizontal>0?'ArrowRight':'ArrowLeft']:[]),...(Math.abs(vertical)>.05?[vertical>0?'ArrowDown':'ArrowUp']:[])];
    for(const key of keys)await page.keyboard.down(key);
    await page.waitForTimeout(Math.max(45,Math.min(120,Math.hypot(dx,dy)/5*1000)));
    for(const key of keys)await page.keyboard.up(key);
  }
  const trigger=page.locator(`[data-world-anchor="${anchorId}"]`);
  for(let n=0;n<20&&!(await trigger.isVisible());n++)await activate(page,page.locator('.world-target-switch'));
  await activate(page,trigger);
  await expect(page.locator('.world-context')).toBeVisible();
}
async function beginWalk(page: Page) {
  const canvas=page.getByTestId('world-viewport').locator('canvas');const box=(await canvas.boundingBox())!;
  const before=(await savedGame(page)).world!.position;
  await canvas.click({position:{x:box.width/2,y:box.height/2-80}});
  await expect.poll(async()=>JSON.stringify((await savedGame(page)).world!.position)).not.toBe(JSON.stringify(before));
}
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  diagnostics.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(withSkip("/?test=1&seed=42"));
  await activate(page, page.getByRole("button", { name: "开门迎客" }));
});

test.afterEach(async ({ page }, info) => {
  const errors = diagnostics.get(page)!;
  await info.attach("console-evidence", { body: JSON.stringify(errors), contentType: "application/json" });
  expect(errors).toEqual([]);
});

test("Escape interrupts walking without a delayed table opening", async ({ page }) => {
  await beginWalk(page);
  await page.keyboard.press('Escape');
  const before=(await savedGame(page)).world!.position;
  await page.waitForTimeout(3500);
  expect((await savedGame(page)).world!.position).toEqual(before);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test("day summary blocks movement and interaction shortcuts", async ({ page }) => {
  const { state, content } = await snapshot(page);
  test.setTimeout(420_000);
  for(const customer of state.customers){
    const order=content.orders.find(entry=>entry.id===customer.orderId)!;
    await approach(page,`restaurant.table-${customer.table}`);await approach(page,'restaurant.kitchen');
    for(const item of order.items)for(let n=0;n<item.quantity;n++)await activate(page,page.getByRole('button',{name:`拿${content.foods.find(food=>food.id===item.foodId)!.word.text}`,exact:true}));
    await activate(page,page.getByRole('button',{name:'端好了，去上菜'}));await approach(page,`restaurant.table-${customer.table}`);
    await activate(page,page.getByRole('button',{name:'上菜',exact:true}));
    const total=order.items.reduce((sum,item)=>sum+item.quantity*content.foods.find(food=>food.id===item.foodId)!.price,0);
    for(let n=0;n<order.paid-total;n++)await activate(page,page.getByRole('button',{name:'+1块',exact:true}));
    await activate(page,page.getByRole('button',{name:'递上找零'}));await activate(page,page.getByRole('button',{name:'继续招呼'}));
  }
  await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  const before = (await savedGame(page)).world!.position;
  await page.keyboard.down("ArrowRight");await page.waitForTimeout(150);await page.keyboard.up("ArrowRight");
  expect((await savedGame(page)).world!.position).toEqual(before);
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  await expect(page.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "出去走走" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", {name:"今日小结"})).toHaveCount(0);
  await activate(page,page.locator(".world-day-summary"));
  await expect(page.getByRole("dialog", {name:"今日小结"})).toBeVisible();
});

test("table and kitchen close back to their local keyboard triggers after walking", async ({ page }) => {
  await approach(page,'restaurant.table-1');
  await page.keyboard.press('Escape');await expect(page.locator('[data-world-anchor="restaurant.table-1"]')).toBeFocused();
  await approach(page,'restaurant.kitchen');
  await page.keyboard.press('Escape');await expect(page.locator('[data-world-anchor="restaurant.kitchen"]')).toBeFocused();
});

test("modified arrow shortcuts do not move the waiter", async ({ page }) => {
  await page.getByTestId("world-viewport").focus();
  const before = (await savedGame(page)).world!.position;
  for (const modifier of ["Control", "Alt", "Meta"]) {
    await page.keyboard.down(modifier);await page.keyboard.down("ArrowRight");await page.waitForTimeout(150);await page.keyboard.up("ArrowRight");await page.keyboard.up(modifier);
    expect((await savedGame(page)).world!.position).toEqual(before);
  }
  await page.keyboard.down("ArrowRight");await page.waitForTimeout(150);await page.keyboard.up("ArrowRight");
  expect((await savedGame(page)).world!.position).not.toEqual(before);
});

test("keyboard journey keeps named controls and focus across a full day", async ({ page }, info) => {
  test.setTimeout(420_000);
  await page.screenshot({ path: privateArtifact(`output/playwright/0037/${info.project.name}-restaurant.png`), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const { state, content } = await snapshot(page);
  for (const customer of state.customers) {
    const trigger=page.locator(`[data-world-anchor="restaurant.table-${customer.table}"]`);
    const order = content.orders.find((entry) => entry.id === customer.orderId)!;
    await approach(page,`restaurant.table-${customer.table}`);
    const dialog = page.getByRole("dialog", { name: `${customer.table}桌点餐` });
    await expect(dialog.getByRole("button", { name: "继续走走", exact: true })).toBeFocused();
    if (customer.table === 1) {
      const word = dialog.locator(".world-context-dialogue .word").first();
      await activate(page, word);
      const card = page.getByRole("dialog", { name: /的意思$/ });
      await expect(card.getByRole("button", { name: "关闭词卡" })).toBeFocused();
      await expect(dialog).not.toHaveAttribute("inert", "");
      await expect(page.locator(".world-pad button").first()).toHaveAttribute("inert", "");
      const sourceWords = page.locator("[data-word-lookup]:visible");
      await page.keyboard.press("Shift+Tab");
      await expect(sourceWords.last()).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(card.getByRole("button", { name: "关闭词卡" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(card.getByRole("button", { name: "听这个词" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(sourceWords.first()).toBeFocused();
      await page.screenshot({ path: privateArtifact(`output/playwright/0037/${info.project.name}-word-card.png`), fullPage: true });
      await page.keyboard.press("Escape");
      await expect(word).toBeFocused();
      await expect(dialog).toBeVisible();
    }
    await approach(page,"restaurant.kitchen");
    const kitchen = page.getByRole("dialog", { name: "厨房", exact: true });
    for (const item of order.items) {
      const food = content.foods.find((entry) => entry.id === item.foodId)!;
      for (let count = 0; count < item.quantity; count++) {
        await activate(page, kitchen.getByRole("button", { name: `拿${food.word.text}`, exact: true }));
      }
    }
    await activate(page, kitchen.getByRole("button", { name: "端好了，去上菜" }));
    await approach(page,`restaurant.table-${customer.table}`);
    await activate(page, dialog.getByRole("button", { name: /^上菜/ }));
    const total = order.items.reduce((sum, item) => sum + item.quantity * content.foods.find((food) => food.id === item.foodId)!.price, 0);
    for (let amount = 0; amount < order.paid - total; amount++) {
      await activate(page, dialog.getByRole("button", { name: "+1块", exact: true }));
    }
    await activate(page, dialog.getByRole("button", { name: "递上找零" }));
    await expect(dialog.locator(".thanks-chop")).toBeVisible();
    const continueServing = dialog.getByRole("button", { name: "继续招呼" });
    await expect(continueServing).toBeFocused();
    await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    const receiptWord = dialog.locator(".world-table-receipt [data-word-lookup]").first();
    await activate(page, receiptWord);
    await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(receiptWord).toBeFocused();
    await activate(page, continueServing);
  }
  const summary = page.getByRole("dialog", { name: "今日小结" });
  await expect(summary.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(summary.getByRole("button", { name: "出去走走" })).toBeFocused();
  await page.screenshot({ path: privateArtifact(`output/playwright/0037/${info.project.name}-summary.png`), fullPage: true });
  await activate(page, summary.getByRole("button", { name: "明天见" }));
  expect((await snapshot(page)).state.day).toBe(2);
  await activate(page, page.getByRole("button", { name: /本子/ }));
  await expect(page.locator(".journal-list button").first()).toBeVisible();
  await page.screenshot({ path: privateArtifact(`output/playwright/0037/${info.project.name}-journal.png`), fullPage: true });
});

test("production keyboard interruption does not reopen a cancelled table", async ({ page }) => {
  const preview = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";
  await seedDayOne(page, preview);
  await page.goto(`${preview}?test=1&seed=42`);
  await activate(page, page.getByRole("button", { name: "开门迎客" }));
  await beginWalk(page);await page.keyboard.press('Escape');
  const before=(await savedGame(page)).world!.position;await page.waitForTimeout(3500);
  expect((await savedGame(page)).world!.position).toEqual(before);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => typeof (window as unknown as { __TEST__?: unknown }).__TEST__)).toBe("undefined");
});

for (const abortWrites of [false, true]) {
  test(`non-test word survives immediate reload (aborted IndexedDB: ${abortWrites})`, async ({ page }) => {
    if (abortWrites) {
      await page.addInitScript(() => {
        const put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (...args) {
          const request = put.apply(this, args);
          this.transaction.abort();
          return request;
        };
      });
    }
    await page.goto(withSkip("/?seed=42"));
    await page.getByRole("button", { name: "开门迎客" }).click();
    await interactAt(page, "restaurant.table-1");
    const dialog = page.locator(".world-context[data-target=table]");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(650);
    await dialog.getByRole("button", { name: "包子", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "包子的意思" })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByRole("button", { name: /本子/ }).click();
    await expect(page.locator(".journal-list")).toContainText("包子");
    await page.locator(".journal-list button").filter({ hasText: "包子" }).click();
    await expect(page.getByRole("dialog", { name: "包子的意思" })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByRole("button", { name: /本子/ }).click();
    await expect(page.locator(".journal-list button").filter({ hasText: "包子" })).toContainText("听过 2 次");
    expect(await page.evaluate(() => typeof (window as unknown as { __TEST__?: unknown }).__TEST__)).toBe("undefined");
  });
}

for (const invalid of ["{", "{}"] as const) {
  test(`invalid recovery checkpoint falls back to IndexedDB: ${invalid}`, async ({ page }) => {
    await page.goto(withSkip("/?seed=42"));
    await page.getByRole("button", { name: "开门迎客" }).click();
    await interactAt(page, "restaurant.table-1");
    await page.locator(".world-context[data-target=table]")
      .getByRole("button", { name: "包子", exact: true }).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("junyan-waiter-pending-v1"))).toBeNull();
    await page.evaluate((invalid) => localStorage.setItem("junyan-waiter-pending-v1", invalid), invalid);
    await page.reload();
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByRole("button", { name: /本子/ }).click();
    await expect(page.locator(".journal-list")).toContainText("包子");
  });
}

test("a failed checkpoint write cannot override a later successful IndexedDB save", async ({ page }) => {
  await page.goto(withSkip("/?seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await interactAt(page, "restaurant.table-1");
  const bun = page.locator(".world-context[data-target=table]")
    .getByRole("button", { name: "包子", exact: true });
  await bun.click();
  expect(await page.evaluate(() => localStorage.getItem("junyan-waiter-pending-v1"))).not.toBeNull();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  });
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await bun.click();
  await expect(page.getByRole("dialog", { name: "包子的意思" })).toBeVisible();
  await page.waitForTimeout(650);
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: /本子/ }).click();
  await expect(page.locator(".journal-list button").filter({ hasText: "包子" })).toContainText("听过 2 次");
});

test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });
