import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";

test("real word lookup persists to the journal after reload", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  const path = (name: string) => `${process.env.JUNYAN_PROOF_DIR}/${info.project.name}-${name}`;
  await page.goto("/?seed=42");
  await page.getByRole("button", { name: "开门迎客" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByTestId("table-1").click();
  await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  const word = page.locator(".spoken .word").first();
  const hanzi = await word.innerText();
  await page.screenshot({ path: path("before.png"), fullPage: true });
  await word.click();
  await expect(page.locator(".word-popover h2")).toHaveText(hanzi);
  await expect(page.locator(".word-popover .pinyin")).not.toBeEmpty();
  await page.screenshot({ path: path("lookup.png"), fullPage: true });
  const stored = () => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<Record<string, unknown>>((resolve, reject) => {
        const request = database.transaction("saves").objectStore("saves").get("v1");
        request.onsuccess = () => resolve(request.result?.journal ?? {});
        request.onerror = () => reject(request.error);
      });
    } finally { database.close(); }
  });
  await expect.poll(async () => Object.keys(await stored()).length).toBeGreaterThan(0);
  const journal = await stored();
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: /^本子/ }).click();
  await expect(page.getByRole("dialog", { name: "本子" }).locator(".journal-list > button").first()).toContainText(hanzi);
  expect(await stored()).toEqual(journal);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: path("persisted.png"), fullPage: true });
  expect(errors).toEqual([]);
  writeFileSync(path("evidence.json"), JSON.stringify({ action: `click first spoken word: ${hanzi}`, result: "pinyin card, IndexedDB journal entry, journal visible after reload", journal, errors, url: page.url(), viewport: page.viewportSize() }, null, 2));
});
