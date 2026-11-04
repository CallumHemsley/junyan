import { test, expect, type Page } from "@playwright/test";
import data from "../src/content/content.json" with { type: "json" };
import type { Content } from "../src/contracts";
import { createGame, reduceGame } from "../src/game";
import { silentResponse } from "./audio-fixtures";
import { seedDayOne } from "./opening";

const content = data as Content;
const preview = () => process.env.JUNYAN_PREVIEW_URL!;
const app = () => `${preview()}?seed=42`;
const wake = (page: Page) => page.getByRole("button", { name: "醒来" });
const open = (page: Page) => page.getByRole("button", { name: "开门迎客" });

let errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.route("**/*.wav", (route) => silentResponse(route));
});
test.afterEach(() => expect(errors).toEqual([]));

async function stored(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("saves");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
        const request = db.transaction("saves").objectStore("saves").getAllKeys();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return { keys, pending: localStorage.getItem("junyan-waiter-pending-v1") };
    } finally { db.close(); }
  });
}

test("fresh storage opens on the wordless wake screen", async ({ page }) => {
  await page.goto(app());
  await expect(wake(page)).toBeVisible();
  await expect(open(page)).toHaveCount(0);
  expect(await page.locator(".opening-wake").innerText()).toBe("");
  expect(await page.evaluate(() => "__TEST__" in window)).toBe(false);
});

test("a seeded day-1 save skips the opening", async ({ page }) => {
  await seedDayOne(page, preview());
  await page.goto(app());
  await expect(open(page)).toBeVisible({ timeout: 1500 });
  await expect(wake(page)).toHaveCount(0);
});

test("a recovery checkpoint alone skips the opening", async ({ page }) => {
  const game = reduceGame(createGame(content, 42), { type: "lookup", wordId: "milk", now: 1 }, content);
  await page.goto(new URL("audio/manifest.json", preview()).href);
  await page.evaluate((save) => localStorage.setItem("junyan-waiter-pending-v1", JSON.stringify(save)), game);
  await page.goto(app());
  await open(page).click();
  await page.getByRole("button", { name: /本子/ }).click();
  await expect(page.locator(".journal-list")).toContainText("豆浆");
  await expect(wake(page)).toHaveCount(0);
});

test("an invalid save counts as a new player", async ({ page }) => {
  await seedDayOne(page, preview(), { ...createGame(content, 42), day: -1 });
  await page.goto(app());
  await expect(wake(page)).toBeVisible();
});

test("a reload mid-opening replays it and leaves storage empty", async ({ page }) => {
  await page.goto(app());
  await wake(page).click();
  const opening = page.locator("main.opening");
  const firstRequest = content.opening.steps.findIndex((step) => step.type === "request");
  for (let step = 0; step < firstRequest; step++) {
    await expect(opening).toHaveAttribute("data-step", String(step));
    await opening.getByRole("button", { name: "继续", exact: true }).click();
  }
  await opening.locator(".bedside-tray").getByRole("button", { name: "豆浆", exact: true }).click();
  await opening.getByRole("button", { name: "继续", exact: true }).click();
  await expect(opening).toHaveAttribute("data-step", String(firstRequest + 1));
  await page.waitForTimeout(500);
  await page.reload();
  await expect(wake(page)).toBeVisible();
  expect(await stored(page)).toEqual({ keys: [], pending: null });
});

test("a blocked database keeps today's day-1 fallback", async ({ page, context }) => {
  const holder = await context.newPage();
  try {
    await holder.goto(new URL("audio/manifest.json", preview()).href);
    await holder.evaluate(async () => {
      (window as unknown as { held: IDBDatabase }).held = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("junyan-waiter", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("saves");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase("junyan-waiter");
        request.onblocked = () => resolve();
      });
    });
    await page.goto(app());
    await expect(open(page)).toBeVisible({ timeout: 3000 });
    await expect(page.locator(".save-note")).toBeVisible();
    await expect(wake(page)).toHaveCount(0);
  } finally { await holder.close(); }
});

test("test mode starts on day 1 unless opening=play, and reset follows the same rule", async ({ page }) => {
  const session = () => page.evaluate(() => (window as unknown as { __TEST__: { getSession(): { phase: string } } }).__TEST__.getSession());
  const reset = () => page.evaluate(() => (window as unknown as { __TEST__: { reset(): void } }).__TEST__.reset());
  await page.goto("/?test=1&seed=42");
  await expect(open(page)).toBeVisible();
  expect((await session()).phase).toBe("day");
  await page.goto("/?test=1&seed=42&opening=play");
  await wake(page).click();
  await page.locator("main.opening").getByRole("button", { name: "继续", exact: true }).click();
  await expect(page.locator("main.opening")).toHaveAttribute("data-step", "1");
  await reset();
  await expect(wake(page)).toBeVisible();
  expect(await session()).toMatchObject({ phase: "opening", opening: { step: 0 } });
});
