import { test, expect } from "@playwright/test";
import type { Content, GameState } from "../src/contracts";

test.use({ launchOptions: { args: ["--mute-audio"] } });

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "phone", width: 390, height: 844 },
  { name: "small", width: 320, height: 568 },
  { name: "landscape", width: 844, height: 390 },
]) {
  test(`${viewport.name}: scene-first layout keeps service controls accessible`, async ({ page, isMobile }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.setViewportSize(viewport);
    await page.goto("/?test=1&seed=42");
    const help = page.getByRole("dialog", { name: "怎么玩" });
    const disclosure = help.getByRole("button", { name: "怎么玩", exact: true });
    await expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await expect(help.locator(".help-line")).toHaveCount(1);
    await page.screenshot({ path: `output/playwright/0028/${viewport.name}-welcome.png`, scale: "css" });
    await disclosure.focus();
    await page.keyboard.press("Enter");
    await expect(help.locator("[data-help-step]")).toHaveCount(3);
    await page.screenshot({ path: `output/playwright/0028/${viewport.name}-help-expanded.png`, scale: "css" });
    await disclosure.press("Enter");
    await help.getByRole("button", { name: "关闭", exact: true }).focus();
    await page.keyboard.press("Shift+Tab");
    await expect(disclosure).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(help.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
    await help.getByRole("button", { name: "开门迎客" }).click();
    await page.mouse.move(0, 0);
    await expect(page.locator("main .primary")).toHaveCount(1);
    await expect(page.locator(".customer-row")).toHaveCount(4);
    await expect(page.locator(".tray-section")).toContainText("0 / 6");
    await expect(page.locator(".help-button")).toBeVisible();
    const scene = await page.getByTestId("restaurant-scene").boundingBox();
    expect(scene!.width).toBeGreaterThanOrEqual(Math.min(viewport.width - 32, 560));
    const day = page.locator(".day-toggle");
    await expect(day).toHaveAttribute("aria-expanded", "false");
    await day.focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#day-details")).toBeVisible();
    await expect(page.locator("#day-details")).toContainText("小馆进账 0 块");
    await day.press("Space");
    await expect(page.locator("#day-details")).toBeHidden();
    for (const selector of [".help-button", "nav button", ".day-toggle", ".next-action", ".customer-row", ".kitchen-link"]) {
      for (const button of await page.locator(selector).all()) {
        const box = await button.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (viewport.name === "desktop") {
      const tray = await page.locator(".tray-section").boundingBox();
      expect(tray!.y + tray!.height).toBeLessThanOrEqual(viewport.height);
    }
    await page.screenshot({ path: `output/playwright/0028/${viewport.name}-playable.png`, fullPage: true, scale: "css" });
    await page.locator(".next-action").click();
    await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
    const foodNames = await page.evaluate(() => {
      const hooks = (window as Window & { __TEST__?: { content: Content; getState: () => GameState } }).__TEST__!;
      const order = hooks.content.orders.find(entry => entry.id === hooks.getState().customers[0].orderId)!;
      return order.items.map(item => hooks.content.foods.find(food => food.id === item.foodId)!.word.hanzi);
    });
    await page.keyboard.press("Escape");
    await expect(page.locator(".next-action")).toBeFocused();
    await expect(page.locator(".next-action")).toHaveText("去厨房取餐→");
    for (const food of foodNames) await expect(page.locator("main")).not.toContainText(food);
    await page.locator(".next-action").click();
    const kitchen = page.getByRole("dialog", { name: "厨房" });
    await expect(kitchen).toBeVisible();
    for (let count = 0; count < 6; count++) await kitchen.locator(".food-pick").nth(count).click();
    await kitchen.getByRole("button", { name: "端好了，去上菜" }).click();
    await expect(page.locator(".tray-item")).toHaveCount(6);
    await expect(page.locator(".next-action")).toHaveText("1桌 · 上菜→");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `output/playwright/0028/${viewport.name}-full-tray.png`, fullPage: true, scale: "css" });
    if (isMobile) await page.locator(".tray-item").last().tap();
    else await page.locator(".tray-item").last().click();
    await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator(".tray-item").last()).toBeFocused();
    if (isMobile) await page.locator(".help-button").tap();
    else await page.locator(".help-button").click();
    await page.keyboard.press("Escape");
    await expect(page.locator(".help-button")).toBeFocused();
    await page.getByRole("button", { name: /^本子/ }).click();
    await expect(page.getByRole("dialog", { name: "本子" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /^本子/ })).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test("the next service action follows the last visited waiting table without checking the food", async ({ page }) => {
  await page.goto("/?test=1&seed=42");
  await page.getByRole("button", { name: "开门迎客" }).click();
  for (const table of [1, 4]) {
    await page.getByRole("button", { name: new RegExp(`^${table}桌 `) }).click();
    await expect(page.getByRole("dialog", { name: `${table}桌点餐` })).toBeVisible();
    await page.keyboard.press("Escape");
  }
  await expect(page.locator(".next-action")).toHaveText("去厨房取餐→");
  await page.locator(".next-action").click();
  const kitchen = page.getByRole("dialog", { name: "厨房" });
  await kitchen.locator(".food-pick").first().click();
  await kitchen.getByRole("button", { name: "端好了，去上菜" }).click();
  await expect(page.locator(".next-action")).toHaveText("4桌 · 上菜→");
  await page.locator(".next-action").click();
  await expect(page.getByRole("dialog", { name: "4桌点餐" })).toBeVisible();
});

test("reduced motion keeps disclosures and scene navigation usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?test=1&seed=42");
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.locator(".day-toggle").click();
  await expect(page.locator("#day-details")).toBeVisible();
  expect(await page.locator(".next-action").evaluate(element => getComputedStyle(element).animationName)).toBe("none");
  await page.locator(".next-action").click();
  await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  await page.screenshot({ path: "output/playwright/0028/reduced-motion-dialogue.png", scale: "css" });
});
