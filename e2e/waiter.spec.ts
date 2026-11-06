import { interactAt, closeActivity, savedGame } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect, type Page } from "@playwright/test";
import { playOpening, withSkip } from "./opening";
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
  await interactAt(page, `restaurant.table-${table}`);
  await expect(
    page.locator(".world-context[data-target=table]"),
  ).toBeVisible();
  const character = content.characters.find(c => c.name === order.customer)!;
  await page.locator(".world-dialogue-history summary").click();
  await expect(page.locator(".world-dialogue-history .spoken")).toHaveText(
    character.greeting.tokens.map(w => w.text).join(""),
  );
  await page.locator(".world-dialogue-history .round-button").click();
  await page.locator(".world-dialogue-history summary").click();
  await expect(page.locator(".world-context-dialogue .spoken").first()).toContainText(
    order.line.tokens[0].text,
  );
  if (table === 1) {
    await page.locator(".world-context-dialogue .word").first().click();
    await expect(page.locator(".word-popover .pinyin")).not.toBeEmpty();
    await page.getByRole("button", { name: "关闭词卡" }).click();
  }
  await interactAt(page, "restaurant.kitchen");
  await expect(page.locator(".world-context[data-target=kitchen]")).toBeVisible();
  for (const item of order.items) {
    const food = content.foods.find((f) => f.id === item.foodId)!;
    for (let n = 0; n < item.quantity; n++)
      await page
        .getByRole("button", { name: `拿${food.word.text}`, exact: true })
        .click();
  }
  if (table === 1) {
    await page.getByRole("button", { name:"本子", exact:true }).click();
    await page.getByRole("dialog", {name:"本子", exact:true}).getByRole("button", {name:"关闭",exact:true}).click();
  }
  await page.getByRole("button", { name: "端好了，去上菜" }).click();
  await interactAt(page, `restaurant.table-${table}`);
  await expect(
    page.locator(".world-context[data-target=table]"),
  ).toBeVisible();
  const line = page.locator(".world-context-dialogue").first().locator(".spoken .word");
  const looks = () =>
    line.evaluateAll((words) =>
      words.map((word) =>
        word.classList.contains("fogged") ? "fogged" : word.classList.contains("new-word") ? "dot" : "plain",
      ),
    );
  const before = await looks();
  if (table === 1) {
    expect(before).toContain("fogged");
    expect(before).not.toContain("dot");
  }
  await page.getByRole("button", { name: "上菜", exact: false }).last().click();
  await expect(page.getByRole("button", { name: "递上找零" })).toBeVisible();
  const after = await looks();
  expect(after).not.toContain("fogged");
  before.forEach((look, index) => {
    if (look === "fogged") expect(after[index]).toBe("dot");
  });
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
  await expect(page.locator(".world-context-dialogue .spoken")).toHaveText(character.thanks.tokens.map(w => w.text).join(""));
  await page.locator(".world-context-dialogue .round-button").click();
  if (table === 1) {
    await page.getByRole("button", {name:"本子",exact:true}).click();
    await page.getByRole("dialog", {name:"本子",exact:true}).getByRole("button", {name:"关闭",exact:true}).click();
  }
  await page.getByRole("button", { name: "继续招呼" }).click();
  await expect(page.locator(".world-context")).toHaveCount(0);
}

test("wake in the ward, then collect, recall, deliver, give change, journal, and progress", async ({
  page,
}, info) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/?test=1&seed=42&opening=play");
  await playOpening(page, {
    shot: (name) => page.screenshot({
      path: privateArtifact(`output/playwright/${info.project.name}-opening-${name}.png`),
    }),
    afterHandover: async () =>
      expect(await page.locator(".app-shell").innerText()).not.toMatch(/[a-z]/i),
  });
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByRole("button", { name: /本子/ }).click();
  for (const word of ["豆浆", "鸡蛋", "谢谢", "好"])
    await expect(page.locator(".journal-list")).toContainText(word);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.screenshot({
    path: privateArtifact(`output/playwright/${info.project.name}-restaurant.png`),
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
  await expect(page.getByRole("button", { name: "出去走走" })).toBeFocused();
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
    path: privateArtifact(`output/playwright/${info.project.name}-journal.png`),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("walking connects a keyboard position beside a table without stalling", async ({
  page,
}) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await interactAt(page, "restaurant.table-3");
  await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
  await closeActivity(page);
  const before = (await savedGame(page)).world!.position;
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  await page.getByTestId("world-viewport").focus();
  await expect(page.getByTestId("world-viewport")).toBeFocused();
  await page.keyboard.down("ArrowRight");
  await expect.poll(async () => (await savedGame(page)).world!.position).not.toEqual(before);
  await page.keyboard.up("ArrowRight");
});

test("browser saves and reloads a looked-up word", async ({ page }) => {
  await page.goto(withSkip("/"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await interactAt(page, "restaurant.table-1");
  await expect(page.locator(".world-context-dialogue .word").first()).toBeVisible();
  const word = await page.locator(".world-context-dialogue .word").first().innerText();
  await page.locator(".world-context-dialogue .word").first().click();
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

// Physical walks have their own bounded waits; missing controls should fail promptly.
test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });

test("closing a pocket journal restores the kitchen exit and physical movement", async ({page}) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", {name:"开门迎客"}).click();
  await interactAt(page, "restaurant.table-1");
  await interactAt(page, "restaurant.kitchen");
  await page.getByRole("button", {name:"拿包子",exact:true}).click();
  await page.getByRole("button", {name:"本子",exact:true}).click();
  await page.getByRole("dialog", {name:"本子",exact:true}).getByRole("button", {name:"关闭",exact:true}).click();
  await page.getByRole("button", {name:"端好了，去上菜",exact:true}).click();
  await expect(page.locator(".world-context")).toHaveCount(0);
  const before = (await savedGame(page)).world!.position;
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  await page.getByTestId("world-viewport").focus();
  await expect(page.getByTestId("world-viewport")).toBeFocused();
  await page.keyboard.down("ArrowDown");
  try { await expect.poll(async () => (await savedGame(page)).world!.position).not.toEqual(before); }
  finally { await page.keyboard.up("ArrowDown"); }
});

test("focused movement pad accepts Enter and Space as well as arrow walking", async ({page}) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", {name:"开门迎客"}).click();
  const forward = page.getByRole("button", {name:"向前走",exact:true});
  for (const key of ["Enter", "Space"]) {
    const before = (await savedGame(page)).world!.position;
    await forward.focus();
    await forward.press(key);
    await expect.poll(async () => (await savedGame(page)).world!.position).not.toEqual(before);
  }
});
