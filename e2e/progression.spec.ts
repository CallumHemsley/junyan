import { visitWorld, interactAt, closeActivity, savedGame } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect, type Page } from "@playwright/test";
import type { GameState } from "../src/contracts";
import { withSkip } from "./opening";
import { content } from "../src/content";

const state = (page: Page): Promise<GameState> => page.evaluate(async () => {
  const pending = localStorage.getItem("junyan-waiter-pending-v1");
  if (pending) return JSON.parse(pending);
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("junyan-waiter", 1);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  try { return await new Promise<GameState>((resolve, reject) => {
    const request = db.transaction("saves").objectStore("saves").get("v1");
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  }); } finally { db.close(); }
});
async function serve(page: Page, table: number) {
  const saved = await state(page);
  const order = content.orders.find(o => o.id === saved.customers.find(c => c.table === table)!.orderId)!;
  const foods = content.foods;
  await interactAt(page, `restaurant.table-${table}`);
  await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
  await interactAt(page, "restaurant.kitchen");
  await expect(page.locator(".world-context[data-target=kitchen]")).toBeVisible();
  for (const item of order.items) for (let n = 0; n < item.quantity; n++) await page.getByRole("button", { name: `拿${foods.find(f => f.id === item.foodId)!.word.text}`, exact: true }).click();
  await page.getByRole("button", { name: "端好了，去上菜" }).click();
  await interactAt(page, `restaurant.table-${table}`);
  await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
  await page.getByRole("button", { name: "上菜", exact: false }).last().click();
  const total = order.items.reduce((sum, item) => sum + foods.find(f => f.id === item.foodId)!.price * item.quantity, 0);
  for (let n = 0; n < order.paid - total; n++) await page.getByRole("button", { name: "+1块", exact: true }).click();
  await page.getByRole("button", { name: "递上找零" }).click();
  await page.getByRole("button", { name: "继续招呼" }).click();
}
const visit = visitWorld;

test("a shift buys a furnishing, an invitation leads to a real routine, and the room survives tomorrow", async ({ page }, info) => {
  test.setTimeout(600_000);
  page.setDefaultTimeout(15_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(withSkip("/?seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await visit(page, "apartment");
  await expect(page.locator('[data-buy="blue-vase"]')).toBeDisabled();
  await visit(page, "restaurant");
  for (const table of [1, 2, 3, 4]) await serve(page, table);
  await page.getByRole("button", { name: "出去走走", exact: true }).click();
  await visit(page,"apartment");
  await expect(page.locator('[aria-label="可用的钱"]')).toHaveText("10 块");
  await page.screenshot({ path: privateArtifact(`docs/evidence/0081/${info.project.name}-shop.png`), fullPage: true });
  await page.locator('[data-buy="blue-vase"]').click();
  await expect(page.locator('[aria-label="可用的钱"]')).toHaveText("2 块");
  await expect(page.locator('[data-buy="blue-vase"]')).toBeDisabled();
  await page.locator('.apartment-items').getByRole("button", { name: /蓝色花瓶.*收着/ }).click();
  await expect(page.getByRole("button", {name:"第2行第4格",exact:true})).toBeVisible();
  await page.getByRole("button", { name: "第2行第4格", exact: true }).click();
  await page.getByRole("button", { name: "放这里", exact: true }).click();
  await expect(page.locator('.apartment-items').getByRole("button", { name: /蓝色花瓶.*屋里/ })).toBeVisible();
  await page.locator('.connected-world canvas').scrollIntoViewIfNeeded();
  await page.screenshot({ path: privateArtifact(`docs/evidence/0081/${info.project.name}-furnished.png`), fullPage: true });
  const placed = (await state(page)).neighbourhood!.apartment.placements;
  await expect.poll(() => page.evaluate(() => localStorage.getItem("junyan-waiter-pending-v1"))).toBeNull();
  await page.reload();
  await visit(page,"apartment");
  await expect(page.locator(".apartment")).toBeVisible();
  expect((await state(page)).neighbourhood!.apartment.placements).toEqual(placed);
  await expect(page.locator('[aria-label="可用的钱"]')).toHaveText("2 块");
  const invitation = page.locator('[data-follow-scenario]');
  const scenario = await invitation.getAttribute("data-follow-scenario");
  const beforeInvitationMap = (await savedGame(page)).world!.mapId;
  await invitation.click();
  expect((await savedGame(page)).world!.mapId).toBe(beforeInvitationMap);
  await visit(page, scenario!.split(".")[0]);
  expect((await state(page)).neighbourhood!.location).toBe(scenario!.split(".")[0]);
  await expect(page.locator('[data-location-heading]')).toBeVisible();
  await page.screenshot({ path: privateArtifact(`docs/evidence/0081/${info.project.name}-invitation.png`), fullPage: true });
  await visit(page, "repairs");
  await interactAt(page, "workshop.lamp");
  await page.getByTestId("repair-part-bulb").click();
  await page.locator('.repair-part-actions').getByRole("button", { name: "拧紧", exact: true }).click();
  await page.locator('.repair-main-actions').getByRole("button", { name: "试试", exact: true }).click();
  await page.locator('.repair-main-actions').getByRole("button", { name: "放回", exact: true }).click();
  expect((await state(page)).progression!.review["台灯"]).toMatchObject({ encounters: 1, successes: 0 });
  expect((await state(page)).earnings).toBe(10);
  await visit(page, "restaurant");
  await page.getByRole("button", { name: "今日小结", exact: true }).click();
  await page.getByRole("button", { name: "明天见", exact: false }).click();
  expect((await state(page)).day).toBe(2);
  await visit(page, "apartment");
  expect((await state(page)).neighbourhood!.apartment.placements).toEqual(placed);
  await expect(page.locator('[aria-label="可用的钱"]')).toHaveText("2 块");
  await page.locator('[data-furniture="large-basket"] .word').first().click();
  await expect(page.locator(".word-popover")).toBeVisible();
  await page.getByRole("button", { name: "关闭词卡" }).click();
  expect(await page.locator('.living-progression').innerText()).not.toMatch(/[a-z]/i);
  const targets = await page.locator('.living-progression button:visible').evaluateAll(buttons => buttons.map(b => ({ width: b.getBoundingClientRect().width, height: b.getBoundingClientRect().height })));
  expect(targets.every(t => t.width >= 44 && t.height >= 44)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

// Physical walks have their own bounded waits; missing controls should fail promptly.
test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });
