import { interactAt } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect } from "@playwright/test";
import { withSkip } from "./opening";
import type { Content, GameState } from "../src/contracts";

test("two days label lifetime receipts without changing the running total", async ({ page }, info) => {
  test.setTimeout(420_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  const evidence: { day: number; receipts: number; earnings: number; label: string }[] = [];
  let cumulative = 0;
  for (const day of [1, 2]) {
    let receipts = 0;
    for (const table of [1, 2, 3, 4]) {
      const { order, foods } = await page.evaluate(table => {
        const hooks = (window as Window & { __TEST__?: { getState: () => GameState; content: Content } }).__TEST__!;
        const customer = hooks.getState().customers.find(customer => customer.table === table)!;
        return { order: hooks.content.orders.find(order => order.id === customer.orderId)!, foods: hooks.content.foods };
      }, table);
      const total = order.items.reduce((sum, item) => sum + foods.find(food => food.id === item.foodId)!.price * item.quantity, 0);
      receipts += total;
      await interactAt(page, `restaurant.table-${table}`);
      await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
      await interactAt(page, "restaurant.kitchen");
      for (const item of order.items) {
        const food = foods.find(food => food.id === item.foodId)!;
        for (let n = 0; n < item.quantity; n++)
          await page.getByRole("button", { name: `拿${food.word.text}`, exact: true }).click();
      }
      await page.getByRole("button", { name: "端好了，去上菜" }).click();
      await interactAt(page, `restaurant.table-${table}`);
      await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
      await page.getByRole("button", { name: "上菜", exact: false }).last().click();
      await expect(page.getByRole("button", { name: "递上找零" })).toBeVisible();
      for (let n = 0; n < order.paid - total; n++)
        await page.getByRole("button", { name: "+1块", exact: true }).click();
      await page.getByRole("button", { name: "递上找零" }).click();
      await expect(page.locator(".thanks-chop")).toBeVisible();
      await page.getByRole("button", { name: "继续招呼" }).click();
    }
    cumulative += receipts;
    const summary = page.getByRole("dialog", { name: "今日小结" });
    await expect(summary).toBeVisible();
    const earnings = await page.evaluate(() => (window as Window & { __TEST__?: { getState: () => GameState } }).__TEST__!.getState().earnings);
    expect(earnings).toBe(cumulative);
    evidence.push({ day, receipts, earnings, label: await summary.locator(".tally p").nth(1).innerText() });
    await page.screenshot({ path: privateArtifact(`output/playwright/0071/${info.project.name}-day-${day}.png`), fullPage: true });
    await expect(summary.locator(".tally p").nth(1)).toHaveText(`累计进账${cumulative} 块`);
    await expect(page.getByRole("button", { name: "明天见" })).toBeVisible();
    await page.getByRole("button", { name: "明天见" }).click();
    await page.locator(".day-toggle").click();
    await expect(page.locator("#day-details")).toContainText(`累计进账 ${cumulative} 块`);
    await page.locator(".day-toggle").click();
  }
  expect(evidence).toMatchObject([{ day: 1, receipts: 10, earnings: 10 }, { day: 2, receipts: 19, earnings: 29 }]);
  await info.attach("two-day-earnings", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });
