import { test, expect, type Page } from "@playwright/test";
import data from "../src/content/content.json" with { type: "json" };
import { KITCHEN, TABLES, type Content, type GameState } from "../src/contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "../src/game";
import { seedDayOne, withSkip } from "./opening";

const content = data as Content;

function completedDay() {
  let state = createGame(content);
  state = reduceGame(state, { type: "lookup", wordId: content.foods[0].word.id, now: 1234 }, content);
  for (const position of TABLES) {
    const table = position.table;
    const order = getOrder(state, table, content)!;
    state = reduceGame(state, { type: "move", position: { x: position.x, y: position.y - 1.5 } }, content);
    state = reduceGame(state, { type: "interact", table }, content);
    state = reduceGame(state, { type: "move", position: KITCHEN }, content);
    for (const item of order.items) {
      for (let count = 0; count < item.quantity; count++) {
        state = reduceGame(state, { type: "pickup", foodId: item.foodId }, content);
      }
    }
    state = reduceGame(state, { type: "move", position: { x: position.x, y: position.y - 1.5 } }, content);
    state = reduceGame(state, { type: "deliver", table, now: 1 }, content);
    state = reduceGame(state, { type: "pay", table, change: order.paid - orderTotal(order, content) }, content);
  }
  return state;
}

async function stored(page: Page): Promise<GameState> {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<GameState>((resolve, reject) => {
        const request = db.transaction("saves").objectStore("saves").get("v1");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
  });
}

for (const corruption of ["duplicate-tables", "four-served-no-end", "wrong-table-order"] as const) {
  test(`IndexedDB reload recovers from ${corruption}`, async ({ page, baseURL }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    const state = corruption === "four-served-no-end" ? completedDay() : createGame(content);
    if (corruption === "duplicate-tables") state.customers[1].table = 1;
    if (corruption === "four-served-no-end") state.ended = false;
    if (corruption === "wrong-table-order") state.customers[0].orderId = state.customers[1].orderId;
    await seedDayOne(page, baseURL!, state);
    await page.goto(withSkip("/?seed=42"));
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByTestId("table-2").click();
    await expect(page.getByRole("dialog", { name: "2桌点餐" })).toBeVisible();
    await expect(page.locator(".spoken .word").first()).toBeVisible();
    await expect.poll(async () => (await stored(page))?.customers[1].phase).toBe("ordered");
    await page.reload();
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByTestId("table-2").click();
    await expect(page.getByRole("dialog", { name: "2桌点餐" })).toBeVisible();
    await expect(page.locator(".spoken .word").first()).toBeVisible();
    await page.screenshot({ path: `output/playwright/save-${info.project.name}-${corruption}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test("completed IndexedDB save advances days and preserves journal and earnings", async ({ page, baseURL }, info) => {
  const state = completedDay();
  expect(state.ended).toBe(true);
  await seedDayOne(page, baseURL!, state);
  await page.goto(withSkip("/?seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: "明天见" }).click();
  await expect.poll(async () => (await stored(page))?.day).toBe(2);
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  const saved = await stored(page);
  expect(saved.level).toBe(2);
  expect(saved.earnings).toBe(state.earnings);
  expect(saved.journal).toEqual(state.journal);
  await page.getByRole("button", { name: /本子/ }).click();
  await expect(page.locator(".journal-list")).toContainText(content.foods[0].word.hanzi);
  await page.screenshot({ path: `output/playwright/save-${info.project.name}-journal-next-day.png`, fullPage: true });
});

function legacyDay() {
  return { ...createGame(content), journal: { bun: { lookups: 2, lastSeen: 1.5 } } };
}

test("legacy IndexedDB journal loads as recovered and keeps counting lookups", async ({ page, baseURL }) => {
  await seedDayOne(page, baseURL!, legacyDay());
  await page.goto(withSkip("/?seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await expect.poll(async () => (await stored(page))?.journal.bun).toEqual({ lookups: 2, lastSeen: 1.5, recovered: true });
  await page.getByRole("button", { name: /本子/ }).click();
  await page.locator(".journal-list button", { hasText: "包子" }).click();
  await expect.poll(async () => (await stored(page))?.journal.bun).toMatchObject({ lookups: 3, recovered: true });
});

test("legacy checkpoint is rewritten and cleared after autosave", async ({ page }) => {
  await page.goto(withSkip("/?test=1"));
  await page.evaluate((state) => localStorage.setItem("junyan-waiter-pending-v1", JSON.stringify(state)), legacyDay());
  await page.goto(withSkip("/?seed=42"));
  await expect.poll(() => page.evaluate(() => localStorage.getItem("junyan-waiter-pending-v1"))).toBeNull();
  expect((await stored(page)).journal.bun).toEqual({ lookups: 2, lastSeen: 1.5, recovered: true });
});
