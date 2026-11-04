import { test, expect, type Page } from "@playwright/test";
import data from "../src/content/content.json" with { type: "json" };
import { KITCHEN, TABLES, type Action, type Content, type GameState } from "../src/contracts";
import { createGame, getOrder, orderTotal } from "../src/game";
import { seedDayOne, withSkip } from "./opening";

const content = data as Content;
const previewURL = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";

async function stored(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const save = await new Promise<GameState>((resolve, reject) => {
        const request = db.transaction("saves").objectStore("saves").get("v1");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return { save, pending: localStorage.getItem("junyan-waiter-pending-v1") };
    } finally { db.close(); }
  });
}

async function landing(page: Page) {
  await expect(page.getByRole("button", { name: "醒来" })).toBeVisible();
  return {
    tree: await page.locator("body").ariaSnapshot(),
    hasTestHooks: await page.evaluate(() => "__TEST__" in window),
  };
}

test("opening=skip on the dev server lands on the help panel", async ({ page }) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await expect(page.getByRole("dialog", { name: "怎么玩" })).toBeVisible();
  await expect(page.getByRole("button", { name: "开门迎客" })).toBeVisible();
});

test("seedDayOne leaves a day-1 save that the preview opens", async ({ page }) => {
  await page.goto(new URL("audio/manifest.json", previewURL).href);
  await page.evaluate(() => localStorage.setItem("junyan-waiter-pending-v1", "{}"));
  await seedDayOne(page, previewURL);
  const { save, pending } = await stored(page);
  expect(save).toEqual(createGame(content, 42));
  expect(save.day).toBe(1);
  expect(save.journal).toEqual({});
  expect(pending).toBeNull();
  await page.goto(`${previewURL}?seed=42`);
  await expect(page.getByRole("button", { name: "开门迎客" })).toBeVisible();
});

test("the preview ignores opening=skip and exposes no test hooks", async ({ page, browser }) => {
  await page.goto(`${previewURL}?opening=skip`);
  const skipped = await landing(page);
  const fresh = await browser.newContext();
  try {
    const plain = await fresh.newPage();
    await plain.goto(previewURL);
    expect(skipped).toEqual(await landing(plain));
    expect(skipped.hasTestHooks).toBe(false);
  } finally { await fresh.close(); }
});

test("__TEST__.reset() returns the day-1 state after a served table", async ({ page }) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  const start = createGame(content, 42);
  const position = TABLES[0];
  const order = getOrder(start, position.table, content)!;
  const beside = { x: position.x, y: position.y - 1.5 };
  const actions: Action[] = [
    { type: "move", position: beside },
    { type: "interact", table: position.table },
    { type: "move", position: KITCHEN },
    ...order.items.flatMap(item => Array.from({ length: item.quantity }, (): Action => ({ type: "pickup", foodId: item.foodId }))),
    { type: "move", position: beside },
    { type: "deliver", table: position.table },
    { type: "pay", table: position.table, change: order.paid - orderTotal(order, content) },
  ];
  const state = () => page.evaluate(() => (window as unknown as { __TEST__: { getState(): GameState } }).__TEST__.getState());
  await page.evaluate(actions => {
    const hooks = (window as unknown as { __TEST__: { dispatch(action: Action): void } }).__TEST__;
    for (const action of actions) hooks.dispatch(action);
  }, actions);
  await expect.poll(async () => (await state()).served).toBe(1);
  await page.evaluate(() => (window as unknown as { __TEST__: { reset(): void } }).__TEST__.reset());
  await expect.poll(state).toEqual(start);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
