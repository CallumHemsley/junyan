import { interactAt } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect, type Page, type Locator } from "@playwright/test";
import { withSkip } from "./opening";
import type { Content, GameState } from "../src/contracts";

test.use({ launchOptions: { args: ["--mute-audio"] } });

async function data(page: Page) {
  return page.evaluate(() => {
    const hooks = (window as Window & {
      __TEST__?: { content: Content; getState: () => GameState };
    }).__TEST__!;
    return { content: hooks.content, state: hooks.getState() };
  });
}

async function checkLayout(page: Page, panel: Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await panel.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  for (const word of await panel.locator(".spoken .word:visible").all()) {
    expect(await word.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(28);
  }
  for (const button of await panel.getByRole("button").filter({visible:true}).all()) {
    const box = await button.boundingBox();
    expect(box!.width, await button.innerText()).toBeGreaterThanOrEqual(44);
    expect(box!.height, await button.innerText()).toBeGreaterThanOrEqual(44);
  }
}

async function reachable(button: Locator) {
  await button.scrollIntoViewIfNeeded();
  expect(await button.evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= innerHeight &&
      box.left >= 0 && box.right <= innerWidth &&
      element.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
  })).toBe(true);
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 1440, height: 1000 },
  { width: 844, height: 390 },
  { width: 568, height: 320 },
]) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
  test.use({
    viewport,
    isMobile: viewport.width !== 1440,
    hasTouch: viewport.width !== 1440,
  });
  test(`${viewport.width}x${viewport.height}: service, change and journal stay reachable`, async ({ page }) => {
    test.setTimeout(300_000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const screenshot = async (name: string) => {
      await page.screenshot({ path: privateArtifact(`output/playwright/0036/${viewport.width}x${viewport.height}-${name}.png`), scale: "css" });
    };
    await page.goto(withSkip("/?test=1&seed=42"));
    await expect(page.getByRole("dialog", { name: "怎么玩" })).toBeVisible();
    await checkLayout(page, page.getByRole("dialog"));
    await screenshot("welcome");
    await page.getByRole("button", { name: "开门迎客" }).click();
    await checkLayout(page, page.locator("main"));
    await screenshot("scene");

    for (const table of [1, 2, 3, 4]) {
      const { state, content } = await data(page);
      const order = content.orders.find(entry => entry.id === state.customers.find(customer => customer.table === table)!.orderId)!;
      await interactAt(page, `restaurant.table-${table}`);
      await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
      await checkLayout(page, page.getByRole("dialog"));
      if (table === 1) {
        await screenshot("order");
        await page.locator(".spoken .word:visible").last().click();
        await expect(page.locator(".word-popover")).toBeVisible();
        await checkLayout(page, page.locator(".word-popover"));
        await reachable(page.getByRole("button", { name: "关闭词卡" }));
        await screenshot("word");
        await page.getByRole("button", { name: "关闭词卡" }).click();
      }
      await interactAt(page, "restaurant.kitchen");
      const kitchen = page.locator(".world-context[data-target=kitchen]");
      await expect(kitchen).toBeVisible();
      await checkLayout(page, kitchen);
      for (const item of order.items) {
        const food = content.foods.find(entry => entry.id === item.foodId)!;
        for (let count = 0; count < item.quantity; count++) {
          await page.getByRole("button", { name: `拿${food.word.text}`, exact: true }).click();
        }
      }
      const carry = page.getByRole("button", { name: "端好了，去上菜" });
      await reachable(carry);
      if (table === 1) await screenshot("kitchen-action");
      await carry.click();
      await interactAt(page, `restaurant.table-${table}`);
      await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
      await page.getByRole("dialog").getByRole("button", { name: "上菜", exact: false }).click();
      await expect(page.locator(".world-change-output")).toBeVisible();
      await checkLayout(page, page.getByRole("dialog"));
      const total = order.items.reduce((sum, item) => sum + content.foods.find(food => food.id === item.foodId)!.price * item.quantity, 0);
      for (let change = 0; change < order.paid - total; change++) {
        await page.getByRole("button", { name: "+1块", exact: true }).click();
      }
      const pay = page.getByRole("button", { name: "递上找零" });
      await reachable(pay);
      if (table === 1) await screenshot("change");
      await pay.click();
      await expect(page.locator(".thanks-chop")).toBeVisible();
      await checkLayout(page, page.getByRole("dialog"));
      if (table === 1) await screenshot("receipt");
      await page.getByRole("button", { name: "继续招呼" }).click();
    }
    await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
    await reachable(page.getByRole("button", { name: "明天见" }));
    await page.getByRole("button", { name: "明天见" }).click();
    await page.getByRole("button", { name: /本子/ }).click();
    await expect(page.locator(".journal-list button").first()).toBeVisible();
    await checkLayout(page, page.getByRole("dialog"));
    await screenshot("journal");
    await page.locator(".journal-list button").first().click();
    await expect(page.locator(".pinyin")).not.toBeEmpty();
    await reachable(page.getByRole("button", { name: "关闭词卡" }));
    expect(errors).toEqual([]);
  });
  });
}

test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });
