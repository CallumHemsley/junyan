import { test, expect } from "@playwright/test";
import { seedDayOne, withSkip } from "./opening";
import type { Action, Content, GameState } from "../src/contracts";

test.use({ launchOptions: { args: ["--mute-audio"] } });

for (const build of ["development", "production"]) {
  test.describe(build, () => {
    test.beforeEach(async ({ page }) => {
      if (build === "production") {
        const url = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";
        await seedDayOne(page, url);
        await page.goto(`${url}?test=1&seed=42`);
      } else {
        await page.goto(withSkip("/?test=1&seed=42"));
      }
      await expect(page.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
      await page.getByRole("button", { name: "开门迎客" }).click();
    });

    for (const activation of ["pointer", "keyboard"]) {
      test(`word card shares focus with lookup sources and restores both layers (${activation})`, async ({ page, isMobile }, info) => {
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        page.on("console", message => {
          if (message.type() === "error") errors.push(message.text());
        });
        const tableTrigger = page.getByRole("group", { name: "今日客人", exact: true }).getByRole("button", { name: /^1桌 / });
        await tableTrigger.click();
        const tableDialog = page.getByRole("dialog", { name: "1桌点餐" });
        const parentClose = tableDialog.getByRole("button", { name: "关闭", exact: true });
        await expect(parentClose).toBeFocused();
        const wordTrigger = tableDialog.locator(".character-greeting .word").first();
        if (activation === "keyboard") {
          for (let index = 0; index < 4; index++) {
            if (await wordTrigger.evaluate(element => element === document.activeElement)) break;
            await page.keyboard.press("Tab");
          }
          await expect(wordTrigger).toBeFocused();
          await page.keyboard.press("Enter");
        } else if (isMobile) await wordTrigger.tap();
        else await wordTrigger.click();
        const wordCard = page.locator(".word-popover");
        const wordClose = wordCard.getByRole("button", { name: "关闭词卡" });
        const replay = wordCard.getByRole("button", { name: "听这个词" });
        await expect(wordClose).toBeFocused();
        await expect(page.locator(".modal-backdrop")).not.toHaveAttribute("inert", "");
        await expect(page.locator("main")).toHaveAttribute("inert", "");
        const sourceWords = tableDialog.locator("[data-word-lookup]");
        await page.keyboard.press("Shift+Tab");
        await expect(sourceWords.last()).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(wordClose).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(replay).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(sourceWords.first()).toBeFocused();
        await page.screenshot({ path: `output/playwright/0025/${info.project.name}-${build}-${activation}-word-focus.png`, fullPage: true });
        await page.keyboard.press("Escape");
        await expect(wordCard).toHaveCount(0);
        await expect(tableDialog).toBeVisible();
        await expect(wordTrigger).toBeFocused();
        await expect(page.locator(".modal-backdrop")).not.toHaveAttribute("inert", "");
        await page.keyboard.press("Escape");
        await expect(tableDialog).toHaveCount(0);
        await expect(tableTrigger).toBeFocused();
        await expect(page.locator("main")).not.toHaveAttribute("inert", "");
        expect(errors).toEqual([]);
      });
    }

    for (const helpButton of [".help-button"]) {
      test(`Help cancels an in-flight table arrival (${helpButton})`, async ({ page, isMobile }, info) => {
        await page.getByRole("group", { name: "今日客人", exact: true }).getByRole("button", { name: /^4桌 / }).click();
        await expect(page.locator(".world-footer")).toContainText("走过去");
        await page.locator(helpButton).click();
        const help = page.getByRole("dialog", { name: "怎么玩" });
        await expect(help).toBeVisible();
        await expect(page.locator(".world-footer")).not.toContainText("走过去");
        await page.waitForTimeout(3500);
        await expect(help).toBeVisible();
        await expect(page.getByRole("dialog", { name: "4桌点餐" })).toHaveCount(0);
        await page.screenshot({ path: `output/playwright/0025/${info.project.name}-${build}-${helpButton.includes("world-footer") ? "footer" : "header"}-help-stable.png`, fullPage: true });
        await page.keyboard.press("Escape");
        await page.getByRole("group", { name: "今日客人", exact: true }).getByRole("button", { name: /^4桌 / }).click();
        await expect(page.getByRole("dialog", { name: "4桌点餐" })).toBeVisible();
      });
    }
  });
}

test("production home navigation stays within the configured game subpath", async ({ page }) => {
  const base = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";
  await seedDayOne(page, base);
  await page.goto(`${base}?test=1&seed=42`);
  await page.getByRole("button", { name: "开门迎客" }).click();
  const brand = page.getByRole("link", { name: "君言首页" });
  expect(await brand.evaluate((element: HTMLAnchorElement) => new URL(element.href).pathname)).toBe("/junyan/");
  await brand.click();
  await expect(page).toHaveURL(base);
  await expect(page.locator(".brand")).toContainText("早安小馆");
  expect(await page.evaluate(() => "__TEST__" in window)).toBe(false);
});

test("receipt word targets are at least 44px and restore focus", async ({ page }, info) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.evaluate(() => {
    const hooks = (window as Window & { __TEST__?: { content: Content; getState: () => GameState; dispatch: (action: Action) => void } }).__TEST__!;
    const order = hooks.content.orders.find(entry => entry.id === hooks.getState().customers[0].orderId)!;
    hooks.dispatch({ type: "move", position: { x: 4.4, y: 4 } });
    hooks.dispatch({ type: "interact", table: 1 });
    hooks.dispatch({ type: "move", position: { x: 6, y: 2.3 } });
    for (const item of order.items) {
      for (let count = 0; count < item.quantity; count++) hooks.dispatch({ type: "pickup", foodId: item.foodId });
    }
    hooks.dispatch({ type: "move", position: { x: 4.4, y: 4 } });
    hooks.dispatch({ type: "deliver", table: 1, now: 1 });
    const total = order.items.reduce((sum, item) => sum + hooks.content.foods.find(food => food.id === item.foodId)!.price * item.quantity, 0);
    hooks.dispatch({ type: "pay", table: 1, change: order.paid - total });
  });
  await page.getByRole("group", { name: "今日客人", exact: true }).getByRole("button", { name: /^1桌 / }).click();
  const receiptWords = page.locator(".receipt button");
  await expect(receiptWords.first()).toBeVisible();
  for (const button of await receiptWords.all()) {
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: `output/playwright/0025/${info.project.name}-receipt-targets.png`, fullPage: true });
  await receiptWords.first().click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await expect(receiptWords.first()).toBeFocused();
});

test("kitchen, tray, and journal word cards restore their own triggers", async ({ page }) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("group", { name: "今日客人", exact: true }).getByRole("button", { name: /^1桌 / }).click();
  await page.getByRole("button", { name: "去厨房", exact: true }).click();
  const kitchen = page.getByRole("dialog", { name: "厨房" });
  const kitchenWord = kitchen.locator(".food-listen").first();
  await kitchenWord.click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(kitchenWord).toBeFocused();
  await kitchen.locator(".food-pick").first().click();
  await kitchen.getByRole("button", { name: "端好了，去上菜" }).click();
  const trayWord = page.locator(".tray-item").first();
  await trayWord.click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trayWord).toBeFocused();
  await page.getByRole("button", { name: /本子/ }).click();
  const journalWord = page.locator(".journal-list button").first();
  await journalWord.click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(journalWord).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /本子/ })).toBeFocused();
});
