import { test, expect, type Page } from "@playwright/test";
import { withSkip } from "./opening";
import type { Content, GameState } from "../src/contracts";

async function data(page: Page) {
  return page.evaluate(() => {
    const hooks = (window as any).__TEST__;
    return {
      state: hooks.getState() as GameState,
      content: hooks.content as Content,
    };
  });
}
async function serve(page: Page, table: number) {
  let { state, content } = await data(page);
  const order = content.orders.find(
    (o) => o.id === state.customers.find((c) => c.table === table)!.orderId,
  )!;
  await page
    .getByRole("button", { name: new RegExp(`^${table}桌 ${order.customer}`) })
    .click();
  await expect(
    page.getByRole("dialog", { name: `${table}桌点餐` }),
  ).toBeVisible();
  const character = content.characters.find(c => c.name === order.customer)!;
  await expect(page.locator(".character-greeting")).toHaveText(
    character.greeting.tokens.map(w => w.hanzi).join(""),
  );
  await page.getByRole("button", { name: "听招呼", exact: true }).click();
  await expect(page.locator(".spoken").last()).toContainText(
    order.line.tokens[0].hanzi,
  );
  if (table === 1) {
    await page.locator(".spoken .word").first().click();
    await expect(page.locator(".word-popover .pinyin")).not.toBeEmpty();
    await page.getByRole("button", { name: "关闭词卡" }).click();
  }
  await page.getByRole("button", { name: "去厨房", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "厨房" })).toBeVisible();
  for (const item of order.items) {
    const food = content.foods.find((f) => f.id === item.foodId)!;
    for (let n = 0; n < item.quantity; n++)
      await page
        .getByRole("button", { name: `拿${food.word.hanzi}`, exact: true })
        .click();
  }
  await page.getByRole("button", { name: "端好了，去上菜" }).click();
  await page
    .getByRole("button", { name: new RegExp(`^${table}桌 ${order.customer}`) })
    .click();
  await expect(
    page.getByRole("dialog", { name: `${table}桌点餐` }),
  ).toBeVisible();
  await page.getByRole("button", { name: "上菜", exact: false }).last().click();
  const total = order.items.reduce(
    (sum, item) =>
      sum +
      content.foods.find((f) => f.id === item.foodId)!.price * item.quantity,
    0,
  );
  for (let n = 0; n < order.paid - total; n++)
    await page.getByRole("button", { name: "+1块", exact: true }).click();
  await page.getByRole("button", { name: "递上找零" }).click();
  await expect(page.locator(".thanks-chop")).toBeVisible();
  await expect(page.locator(".spoken")).toHaveText(character.thanks.tokens.map(w => w.hanzi).join(""));
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  await page.getByRole("button", { name: "继续招呼" }).click();
}

test("collect, recall, deliver, give change, journal, and progress", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.screenshot({
    path: `output/playwright/${info.project.name}-restaurant.png`,
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  expect(overflow).toBe(false);
  for (const table of [1, 2, 3, 4]) await serve(page, table);
  await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  await expect(page.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "明天见" })).toBeFocused();
  await page.getByRole("button", { name: "明天见" }).click();
  const { state, content } = await data(page);
  expect(state.day).toBe(2);
  expect(state.level).toBe(2);
  expect(Object.keys(state.journal).length).toBeGreaterThan(0);
  expect(
    state.customers.every(
      (c) => content.orders.find((o) => o.id === c.orderId)?.level === 2,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /本子/ }).click();
  await expect(page.locator(".journal-list button").first()).toBeVisible();
  await page.screenshot({
    path: `output/playwright/${info.project.name}-journal.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("walking connects a keyboard position beside a table without stalling", async ({
  page,
}) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.evaluate(() =>
    (window as any).__TEST__.dispatch({
      type: "move",
      position: { x: 1.95, y: 3.85 },
    }),
  );
  await page.getByTestId("table-3").click();
  await expect(page.getByRole("dialog", { name: "3桌点餐" })).toBeVisible();
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  const before = (await data(page)).state.player;
  await page.getByTestId("table-3").focus();
  await page.keyboard.press("ArrowRight");
  expect((await data(page)).state.player).not.toEqual(before);
});

test("browser saves and reloads a looked-up word", async ({ page }) => {
  await page.goto(withSkip("/"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("group", { name: "今日客人", exact: true }).getByRole("button", { name: /^1桌 / }).click();
  await expect(page.locator(".spoken .word").first()).toBeVisible();
  const word = await page.locator(".spoken .word").first().innerText();
  await page.locator(".spoken .word").first().click();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const r = indexedDB.open("junyan-waiter", 1);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        return new Promise<number>((resolve, reject) => {
          const r = db.transaction("saves").objectStore("saves").get("v1");
          r.onsuccess = () => {
            resolve(Object.keys(r.result?.journal || {}).length);
            db.close();
          };
          r.onerror = () => reject(r.error);
        });
      }),
    )
    .toBeGreaterThan(0);
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: /本子/ }).click();
  await expect(page.locator(".journal-list")).toContainText(word);
});
