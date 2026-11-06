import { test, expect, type Locator, type Page } from "@playwright/test";
import { seedDayOne, withSkip } from "./opening";
import { probeAudio, silentResponse } from "./audio-fixtures";

async function switchWords(page: Page, sources: Locator, touch: boolean, shot: string) {
  const activate = async (source: Locator) => touch ? source.tap() : source.click();
  const card = page.locator(".word-popover");
  const title = card.locator("h2");
  await activate(sources.nth(0));
  await expect(card).toHaveAttribute("aria-modal", "false");
  await expect(card.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  for (const index of [1, 0, 1]) {
    await activate(sources.nth(index));
    // Some lookup surfaces use icon buttons; their accessible name contains the word.
    const name = await sources.nth(index).evaluate(e => e.getAttribute("aria-label")?.replace(/^(听|查看)/, "") ?? e.querySelector("span")?.textContent ?? e.textContent);
    await expect(title).toHaveText(name!.trim().replace(/听过.*$/s, "").trim());
    await expect(card).toHaveCount(1);
  }
  await page.screenshot({ path: process.env.JUNYAN_REDUCED_MOTION === "reduce" ? shot.replace(/\.png$/, "-reduced.png") : shot, fullPage: true });
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
  await expect(sources.nth(1)).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  // The production save fixture opens JSON, which requests a default favicon.
  await page.route("**/favicon.ico", route => route.fulfill({ status: 204, body: "" }));
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  (page as any).switchErrors = errors;
});
test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: "wait" });
  expect((page as any).switchErrors).toEqual([]);
});

for (const build of ["development", "production"]) {
  test(`${build}: Help and restaurant switch directly with top-only Escape`, async ({ page, isMobile }, info) => {
    if (build === "production") {
      await seedDayOne(page, process.env.JUNYAN_PREVIEW_URL!);
      await page.goto(process.env.JUNYAN_PREVIEW_URL!);
    } else await page.goto(withSkip("/?test=1&seed=42"));
    const help = page.getByRole("dialog", { name: "怎么玩" });
    await help.getByRole("button", { name: "怎么玩", exact: true }).click();
    await switchWords(page, help.locator("[data-word-lookup]"), isMobile, `output/playwright/0061/${info.project.name}-${build}-help.png`);
    await expect(help).toBeVisible();
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByTestId("table-1").click();
    const parent = page.getByRole("dialog", { name: "1桌点餐" });
    await switchWords(page, parent.locator(".spoken .word"), isMobile, `output/playwright/0061/${info.project.name}-${build}-restaurant.png`);
    await expect(parent).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(parent).toHaveCount(0);
  });
}

test("hospital words switch without advancing the opening", async ({ page, isMobile }, info) => {
  await page.goto("/?test=1&seed=42&opening=play");
  await page.getByRole("button", { name: "醒来" }).click();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "继续", exact: true }).click();
  const opening = page.locator("main.opening");
  const step = await opening.getAttribute("data-step");
  await switchWords(page, opening.locator(".spoken .word"), isMobile, `output/playwright/0061/${info.project.name}-hospital.png`);
  await expect(opening).toHaveAttribute("data-step", step!);
});

test("kitchen, tray, journal and receipt sources keep switching", async ({ page, isMobile }, info) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  await page.getByRole("button", { name: "去厨房", exact: true }).click();
  const kitchen = page.getByRole("dialog", { name: "厨房" });
  await switchWords(page, kitchen.locator(".food-listen"), isMobile, `output/playwright/0061/${info.project.name}-kitchen.png`);
  await kitchen.locator(".food-listen").first().click();
  const trayBefore = await page.evaluate(() => (window as any).__TEST__.getState().tray);
  await kitchen.locator(".food-pick").first().click({ force: true });
  expect(await page.evaluate(() => (window as any).__TEST__.getState().tray)).toEqual(trayBefore);
  await expect(page.locator(".word-popover")).toBeVisible();
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await kitchen.locator(".food-pick").nth(0).click();
  await kitchen.locator(".food-pick").nth(1).click();
  await kitchen.getByRole("button", { name: "端好了，去上菜" }).click();
  await switchWords(page, page.locator(".tray-item"), isMobile, `output/playwright/0061/${info.project.name}-tray.png`);
  await page.getByRole("button", { name: /本子/ }).click();
  await switchWords(page, page.locator(".journal-list button"), isMobile, `output/playwright/0061/${info.project.name}-journal.png`);
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    const h = (window as any).__TEST__;
    const state = h.getState();
    const order = h.content.orders.find((o: any) => o.id === state.customers[0].orderId);
    h.dispatch({ type: "move", position: { x: 4.4, y: 4 } });
    h.dispatch({ type: "interact", table: 1 });
    h.dispatch({ type: "move", position: { x: 6, y: 2.3 } });
    for (let i = 0; i < 2; i++) h.dispatch({ type: "return-food", index: 0 });
    for (const item of order.items) for (let i = 0; i < item.quantity; i++) h.dispatch({ type: "pickup", foodId: item.foodId });
    h.dispatch({ type: "move", position: { x: 4.4, y: 4 } });
    h.dispatch({ type: "deliver", table: 1, now: 1 });
    const total = order.items.reduce((s: number, i: any) => s + i.quantity * h.content.foods.find((f: any) => f.id === i.foodId).price, 0);
    h.dispatch({ type: "pay", table: 1, change: order.paid - total });
  });
  await page.getByTestId("table-1").click();
  const parent = page.getByRole("dialog", { name: "1桌点餐" });
  await expect(parent.locator(".receipt")).toBeVisible();
  const sources = parent.locator(".receipt button, .receipt ~ .spoken .word");
  await switchWords(page, sources, isMobile, `output/playwright/0061/${info.project.name}-receipt.png`);
});

test("rapid keyboard/pointer selection records once and cancels prior native audio", async ({ page }) => {
  await probeAudio(page);
  await page.route("**/*.wav", route => silentResponse(route, 800));
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  const sources = page.locator(".paper-panel .spoken .word");
  const before = await page.evaluate(() => (window as any).__TEST__.getState().journal);
  const selected: string[] = [];
  for (const i of [0, 1, 2, 1]) {
    selected.push((await sources.nth(i).innerText()).trim());
    await sources.nth(i).click();
  }
  const latest = await sources.nth(1).innerText();
  await expect(page.locator(".word-popover h2")).toHaveText(latest);
  await page.waitForFunction(() => (window as any).__audioProbe.at(-1)?.status === "playing");
  expect(await page.evaluate(() => (window as any).__audioElements.slice(0, -1).every((a: HTMLAudioElement) => a.paused))).toBe(true);
  await page.getByRole("button", { name: "关闭词卡" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(sources.last()).toBeFocused();
  await page.keyboard.press("Enter");
  selected.push((await sources.last().innerText()).trim());
  await expect(page.locator(".word-popover h2")).toHaveText(selected.at(-1)!);
  await expect(page.locator(".word-popover")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(sources.last()).toBeFocused();
  const after = await page.evaluate(() => {
    const h = (window as any).__TEST__;
    return { journal: h.getState().journal, words: h.content.orders.flatMap((o: any) => o.line.tokens).concat(h.content.characters.flatMap((c: any) => c.greeting.tokens)) };
  });
  for (const hanzi of new Set(selected)) {
    const id = after.words.find((w: any) => w.text === hanzi).id;
    expect(after.journal[id].lookups - (before[id]?.lookups ?? 0)).toBe(selected.filter(w => w === hanzi).length);
  }
});
