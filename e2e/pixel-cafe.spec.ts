import { test, expect, type Page } from "@playwright/test";
import { interactAt, savedGame, walkTo, closeActivity } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { withSkip } from "./opening";
import type { Content, GameState } from "../src/contracts";

// The restaurant plays in the top-down pixel cafe (ticket 0157): cardinal walking, the waiter
// carrying while the tray holds food, served food on the table, and DOM overlays on the scene.
const data = (page: Page) => page.evaluate(() => {
  const hooks = (window as unknown as { __TEST__: { getState(): GameState; content: Content } }).__TEST__;
  return { state: hooks.getState(), content: hooks.content };
});
const shot = (page: Page, name: string, project: string) =>
  page.screenshot({ path: privateArtifact(`output/pixel/integration/${project}-${name}.png`) });

async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

test("the waiter loop plays in the pixel cafe", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  const viewport = page.getByTestId("world-viewport");
  await expect(viewport).toHaveAttribute("data-map", "restaurant");
  await expect(page.locator(".pixel-cafe")).toHaveAttribute("data-pixel-camera", /zoom/);
  const camera = JSON.parse((await page.locator(".pixel-cafe").getAttribute("data-pixel-camera"))!);
  expect(Number.isInteger(camera.zoom)).toBe(true);
  // One canvas, drawn at whole art pixels, and no old isometric canvas beside it.
  await expect(viewport.locator("canvas")).toHaveCount(1);
  await settle(page);
  await shot(page, "1-start", info.project.name);

  // Arrow keys walk the screen's axes.
  const start = (await savedGame(page)).world!.position;
  await viewport.focus();
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowUp");
  const up = (await savedGame(page)).world!.position;
  expect(up.y).toBeLessThan(start.y - .2);
  expect(up.x).toBeCloseTo(start.x, 5);
  expect((await savedGame(page)).world!.facing).toBe("north");

  // Take two orders, collect one at the pass and carry it out.
  const { content } = await data(page);
  for (const table of [1, 4]) {
    await interactAt(page, `restaurant.table-${table}`);
    await expect(page.locator(".world-context[data-target=table]")).toBeVisible();
  }
  await interactAt(page, "restaurant.kitchen");
  await expect(page.locator(".world-context[data-target=kitchen]")).toBeVisible();
  await settle(page);
  await shot(page, "2-kitchen-panel", info.project.name);
  // A delivery must match one order exactly, so the tray carries table 1's.
  let { state } = await data(page);
  const order = content.orders.find(o => o.id === state.customers.find(c => c.table === 1)!.orderId)!;
  for (const item of order.items) {
    const food = content.foods.find(f => f.id === item.foodId)!;
    for (let n = 0; n < item.quantity; n++) await page.getByRole("button", { name: `拿${food.word.text}`, exact: true }).click();
  }
  await page.getByRole("button", { name: "端好了，去上菜" }).click();
  await closeActivity(page);
  expect((await data(page)).state.tray.length).toBeGreaterThan(0);
  await walkTo(page, { x: 9.6, y: 9.2 });
  await settle(page);
  await shot(page, "3-carrying", info.project.name);

  // Serve table 1: the order lands on its table and the customer stays seated to pay.
  await interactAt(page, "restaurant.table-1");
  await page.getByRole("button", { name: "上菜", exact: true }).click();
  ({ state } = await data(page));
  expect(state.customers.find(c => c.table === 1)!.phase).toBe("checkout");
  await settle(page);
  await shot(page, "4-served-panel", info.project.name);
  await closeActivity(page);
  await settle(page);
  await shot(page, "5-served", info.project.name);

  // The target cue sits on the scene where its anchor is.
  const cue = page.locator(".world-target-cue");
  if (await cue.isVisible()) {
    const box = (await cue.boundingBox())!, view = (await viewport.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(view.x - box.width);
    expect(box.y).toBeGreaterThanOrEqual(view.y - box.height);
  }
  expect(errors).toEqual([]);
});
