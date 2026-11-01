import { test, expect, type Page } from "@playwright/test";
import data from "../src/content/content.json" with { type: "json" };
import { KITCHEN, TABLES, type Content, type GameState } from "../src/contracts";
import { createGame, getOrder, orderTotal, reduceGame } from "../src/game";

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
    state = reduceGame(state, { type: "deliver", table }, content);
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

async function installSave(page: Page, state: GameState) {
  await page.goto("/?test=1");
  await page.evaluate(async (save) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("saves");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put(save, "v1");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { db.close(); }
  }, state);
  await page.goto("/?seed=42");
  await page.getByRole("button", { name: "开门迎客" }).click();
}

for (const corruption of ["duplicate-tables", "four-served-no-end", "wrong-table-order"] as const) {
  test(`IndexedDB reload recovers from ${corruption}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    const state = corruption === "four-served-no-end" ? completedDay() : createGame(content);
    if (corruption === "duplicate-tables") state.customers[1].table = 1;
    if (corruption === "four-served-no-end") state.ended = false;
    if (corruption === "wrong-table-order") state.customers[0].orderId = state.customers[1].orderId;
    await installSave(page, state);
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

test("completed IndexedDB save advances days and preserves journal and earnings", async ({ page }, info) => {
  const state = completedDay();
  expect(state.ended).toBe(true);
  await installSave(page, state);
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
