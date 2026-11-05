import { test, expect } from "@playwright/test";
import { seedDayOne, withSkip } from "./opening";
import content from "../src/content/content.json" with { type: "json" };

test.use({ launchOptions: {
  args: ["--mute-audio"],
  ...(process.env.JUNYAN_CHROMIUM ? { executablePath: process.env.JUNYAN_CHROMIUM } : {}),
} });

test("help narrates authored tokens, shows the sequence and journals lookups without English", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(withSkip("/?test=1&seed=42"));
  const help = page.getByRole("dialog", { name: "怎么玩" });
  await expect(help).toBeVisible();
  await expect(help.getByRole("button", { name: "怎么玩", exact: true })).toHaveAttribute("aria-expanded", "false");
  await expect(help.locator("[data-help-step]")).toHaveCount(0);
  await help.getByRole("button", { name: "怎么玩", exact: true }).click();
  await expect(help.locator("[data-help-step]")).toHaveCount(3);
  await expect(help.locator(".help-picture")).toHaveCount(3);
  await expect(help.locator(".pinyin, .gloss")).toHaveCount(0);
  expect(await help.innerText()).not.toMatch(/[a-z]/i);
  await page.screenshot({ path: `output/playwright/0027/${info.project.name}-help.png` });
  const lines = [content.help.welcome, content.help.lookup, ...content.help.steps.map(step => step.line), content.help.pace];
  for (const line of lines) {
    const label = `听${line.tokens.map(word => word.hanzi).join("")}`;
    const response = page.waitForResponse(response => new URL(response.url()).pathname === line.audio);
    await help.getByRole("button", { name: label, exact: true }).click();
    expect((await response).ok()).toBe(true);
  }
  const uniqueWords = [...new Map(lines.flatMap(line => line.tokens).map(word => [word.id, word])).values()];
  for (const word of uniqueWords) {
    const token = help.getByRole("button", { name: word.hanzi, exact: true }).first();
    await token.focus();
    await token.press("Enter");
    const card = page.locator(".word-popover");
    await expect(card.locator("h2")).toHaveText(word.hanzi);
    await expect(card.locator(".pinyin")).toHaveText(word.pinyin);
    await expect(card.locator(".gloss")).toHaveCount(0);
    expect((await card.innerText()).replace(word.pinyin, "")).not.toMatch(/[a-z]/i);
    await page.getByRole("button", { name: "关闭词卡" }).click();
  }
  await help.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: /^本子/ }).click();
  const journal = page.getByRole("dialog", { name: "本子" });
  await expect(journal.locator(".journal-list > button")).toHaveCount(uniqueWords.length);
  await journal.getByRole("button", { name: /^厨房/ }).click();
  await expect(page.locator(".word-popover .pinyin")).toHaveText("chúfáng");
  await page.screenshot({ path: `output/playwright/0027/${info.project.name}-journal-word.png` });
  expect(errors).toEqual([]);
});

test("small-phone help stays within the viewport and food aids retain pictures without glosses", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(withSkip("/?test=1&seed=42"));
  const help = page.getByRole("dialog", { name: "怎么玩" });
  const box = await help.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  await page.screenshot({ path: "output/playwright/0027/small-phone-help.png" });
  await help.getByRole("button", { name: "开门迎客" }).click();
  await page.evaluate(() => {
    const hooks = (window as any).__TEST__;
    hooks.dispatch({ type: "move", position: { x: 3, y: 5.5 } });
    hooks.dispatch({ type: "interact", table: 1 });
    hooks.dispatch({ type: "move", position: { x: 6, y: 1 } });
  });
  for (const food of content.foods) {
    await page.evaluate(foodId => (window as any).__TEST__.dispatch({ type: "pickup", foodId }), food.id);
    await page.getByRole("button", { name: `查看${food.word.hanzi}`, exact: true }).click();
    const card = page.locator(".word-popover");
    await expect(card.locator(".food-art")).toBeVisible();
    await expect(card.locator(".pinyin")).toHaveText(food.word.pinyin);
    expect((await card.innerText()).replace(food.word.pinyin, "")).not.toMatch(/[a-z]/i);
    await page.getByRole("button", { name: "关闭词卡" }).click();
    await page.evaluate(() => (window as any).__TEST__.dispatch({ type: "return-food", index: 0 }));
  }
});

test("help-only vocabulary survives a real saved-game reload", async ({ page }) => {
  await page.goto(withSkip("/"));
  const help = page.getByRole("dialog", { name: "怎么玩" });
  await help.getByRole("button", { name: "怎么玩", exact: true }).click();
  await help.getByRole("button", { name: "厨房", exact: true }).click();
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<number>((resolve, reject) => {
        const request = database.transaction("saves").objectStore("saves").get("v1");
        request.onsuccess = () => resolve(request.result?.journal.kitchen?.lookups ?? 0);
        request.onerror = () => reject(request.error);
      });
    } finally { database.close(); }
  })).toBe(1);
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: /^本子/ }).click();
  await expect(page.locator(".journal-list")).toContainText("厨房");
});

test("production precaches every help line and word for offline replay", async ({ page, context }) => {
  const preview = process.env.JUNYAN_HELP_PREVIEW_URL ?? "http://127.0.0.1:5177/junyan/";
  await seedDayOne(page, preview);
  await page.goto(preview);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  const help = page.getByRole("dialog", { name: "怎么玩" });
  await expect(help).toBeVisible();
  await help.getByRole("button", { name: "怎么玩", exact: true }).click();
  const lines = [content.help.welcome, content.help.lookup, ...content.help.steps.map(step => step.line), content.help.pace];
  const paths = [...new Set(lines.flatMap(line => [line.audio, ...line.tokens.map(word => word.audio)]))];
  for (const path of paths) {
    const duration = await page.evaluate(path => new Promise<number>((resolve, reject) => {
      const audio = new Audio(new URL(path.slice(1), location.href).href);
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.onerror = () => reject(Error(`Missing offline help audio: ${path}`));
      audio.load();
    }), path);
    expect(duration).toBeGreaterThan(0);
  }
  await help.getByRole("button", { name: "厨房", exact: true }).click();
  await expect(page.locator(".word-popover .pinyin")).toHaveText("chúfáng");
});
