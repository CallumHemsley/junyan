import { interactAt } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { seedDayOne, withSkip } from "./opening";
import { KITCHEN, TABLES, type Action, type Content, type GameState } from "../src/contracts";

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

async function dispatch(page: Page, action: Action) {
  await page.evaluate((action) => (window as unknown as {
    __TEST__: { dispatch(action: Action): void };
  }).__TEST__.dispatch(action), action);
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
  await activate(page, page.getByRole("group", { name: "今日客人", exact: true })
    .getByRole("button", { name: /^4桌 / }));
  await expect(page.locator(".world-footer")).toContainText("走过去");
  await page.keyboard.press("Escape");
  await expect(page.locator(".world-footer")).not.toContainText("走过去", { timeout: 500 });
  const { state } = await snapshot(page);
  await page.waitForTimeout(3500);
  expect((await snapshot(page)).state.player).toEqual(state.player);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("day summary blocks movement and interaction shortcuts", async ({ page }) => {
  const { state, content } = await snapshot(page);
  for (const customer of state.customers) {
    const order = content.orders.find((entry) => entry.id === customer.orderId)!;
    const target = TABLES.find((entry) => entry.table === customer.table)!;
    const position = { x: target.x + 1.4, y: target.y };
    await dispatch(page, { type: "move", position });
    await dispatch(page, { type: "interact", table: customer.table });
    await dispatch(page, { type: "move", position: { x: KITCHEN.x, y: KITCHEN.y + 1.3 } });
    for (const item of order.items) {
      for (let count = 0; count < item.quantity; count++) {
        await dispatch(page, { type: "pickup", foodId: item.foodId });
      }
    }
    await dispatch(page, { type: "move", position });
    await dispatch(page, { type: "deliver", table: customer.table, now: 1 });
    const total = order.items.reduce((sum, item) => sum + item.quantity * content.foods.find((food) => food.id === item.foodId)!.price, 0);
    await dispatch(page, { type: "pay", table: customer.table, change: order.paid - total });
  }
  await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  const before = (await snapshot(page)).state.player;
  await page.keyboard.press("ArrowRight");
  expect((await snapshot(page)).state.player).toEqual(before);
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  await expect(page.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "回家看看" })).toBeFocused();
});

test("kitchen closes back to the original table trigger after walking", async ({ page }) => {
  const trigger = page.getByRole("group", { name: "今日客人", exact: true })
    .getByRole("button", { name: /^1桌 / });
  await activate(page, trigger);
  await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
  await activate(page, page.getByRole("button", { name: "去厨房", exact: true }));
  await expect(page.getByRole("dialog", { name: "厨房", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("modified arrow shortcuts do not move the waiter", async ({ page }) => {
  const before = (await snapshot(page)).state.player;
  for (const modifier of ["Control", "Alt", "Meta"]) {
    await page.keyboard.press(`${modifier}+ArrowRight`);
    expect((await snapshot(page)).state.player).toEqual(before);
  }
  await page.keyboard.press("ArrowRight");
  expect((await snapshot(page)).state.player).not.toEqual(before);
});

test("keyboard journey keeps named controls and focus across a full day", async ({ page }, info) => {
  await page.screenshot({ path: privateArtifact(`output/playwright/0037/${info.project.name}-restaurant.png`), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const { state, content } = await snapshot(page);
  for (const customer of state.customers) {
    const trigger = page.getByRole("group", { name: "今日客人", exact: true })
      .getByRole("button", { name: new RegExp(`^${customer.table}桌 `) });
    const order = content.orders.find((entry) => entry.id === customer.orderId)!;
    await activate(page, trigger);
    const dialog = page.getByRole("dialog", { name: `${customer.table}桌点餐` });
    await expect(dialog.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
    if (customer.table === 1) {
      const word = dialog.locator(".character-greeting .word").first();
      await activate(page, word);
      const card = page.getByRole("dialog", { name: /的意思$/ });
      await expect(card.getByRole("button", { name: "关闭词卡" })).toBeFocused();
      await expect(page.locator(".modal-backdrop")).not.toHaveAttribute("inert", "");
      await expect(page.locator("main")).toHaveAttribute("inert", "");
      const sourceWords = dialog.locator("[data-word-lookup]");
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
    await activate(page, dialog.getByRole("button", { name: "去厨房", exact: true }));
    const kitchen = page.getByRole("dialog", { name: "厨房", exact: true });
    for (const item of order.items) {
      const food = content.foods.find((entry) => entry.id === item.foodId)!;
      for (let count = 0; count < item.quantity; count++) {
        await activate(page, kitchen.getByRole("button", { name: `拿${food.word.text}`, exact: true }));
      }
    }
    await activate(page, kitchen.getByRole("button", { name: "端好了，去上菜" }));
    await activate(page, trigger);
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
    const receiptWord = dialog.locator(".receipt [data-word-lookup]").first();
    await activate(page, receiptWord);
    await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(receiptWord).toBeFocused();
    await activate(page, continueServing);
  }
  const summary = page.getByRole("dialog", { name: "今日小结" });
  await expect(summary.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(summary.getByRole("button", { name: "回家看看" })).toBeFocused();
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
  await activate(page, page.getByRole("group", { name: "今日客人", exact: true })
    .getByRole("button", { name: /^4桌 / }));
  await expect(page.locator(".world-footer")).toContainText("走过去");
  await page.keyboard.press("Escape");
  await expect(page.locator(".world-footer")).not.toContainText("走过去", { timeout: 500 });
  await page.waitForTimeout(3500);
  await expect(page.getByRole("dialog")).toHaveCount(0);
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
    await page.getByRole("group", { name: "今日客人", exact: true })
      .getByRole("button", { name: /^1桌 / }).click();
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
    await page.getByRole("group", { name: "今日客人", exact: true })
      .getByRole("button", { name: /^1桌 / }).click();
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
  await page.getByRole("group", { name: "今日客人", exact: true })
    .getByRole("button", { name: /^1桌 / }).click();
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
