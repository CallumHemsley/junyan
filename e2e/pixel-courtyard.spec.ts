import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { content } from "../src/content";
import { createGame } from "../src/game";
import { seedDayOne } from "./opening";
import { savedGame, walkTo } from "./world-journey";

// The courtyard is walked in the top-down pixel engine (ticket 0176), compiled from its map like the
// town: up the town's lane through the moon gate, cardinal walking, behind the laundry line, and back
// out to the town. Screenshots go to output/pixel/0176/ for review.
const shot = (page: Page, name: string, size: string) => {
  const dir = join(process.cwd(), "output/pixel/0176");
  mkdirSync(dir, { recursive: true });
  return page.screenshot({ path: join(dir, `${size}-${name}.png`) });
};
const settle = (page: Page) => page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

const SIZES = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  { name: "phone", viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
] as const;

for (const size of SIZES) test.describe(size.name, () => {
  test.use({ viewport: size.viewport, deviceScaleFactor: size.deviceScaleFactor, isMobile: size.isMobile, hasTouch: size.hasTouch });

  test(`the courtyard is walked in pixel art (${size.name})`, async ({ page, baseURL }, info) => {
    test.skip(info.project.name !== "desktop", "sizes are set per test");
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    // On the town's lane below the moon gate.
    const game = createGame(content, 42);
    game.world = { version: 1, mapId: "town", position: { x: 45, y: 4 }, facing: "north", returnPositions: {}, activeActivity: null, activeAnchorId: null };
    await seedDayOne(page, baseURL!, game);
    await page.goto("/?opening=skip");
    await page.getByRole("button", { name: "开门迎客" }).click();
    const viewport = page.getByTestId("world-viewport");
    await expect(viewport).toHaveAttribute("data-map", "town");
    await expect(page.locator(".pixel-town")).toHaveAttribute("data-pixel-camera", /zoom/);
    await settle(page);
    await shot(page, "1-moon-gate-lane", size.name);

    // Up through the moon gate into the courtyard, arriving at its entrance from the town.
    await walkTo(page, { x: 45, y: 0.8 });
    await expect(viewport).toHaveAttribute("data-map", "courtyard");
    const yard = page.locator(".pixel-courtyard");
    await expect(yard).toHaveAttribute("data-pixel-camera", /zoom/);
    const camera = JSON.parse((await yard.getAttribute("data-pixel-camera"))!);
    expect(Number.isInteger(camera.zoom)).toBe(true);
    expect(camera.x).toBeGreaterThanOrEqual(0);
    expect(camera.y).toBeGreaterThanOrEqual(0);
    await expect(viewport.locator("canvas")).toHaveCount(1);
    await expect(viewport.locator(".world-place")).toBeVisible();
    const arrived = (await savedGame(page)).world!;
    expect(arrived.facing).toBe("north");
    expect(Math.hypot(arrived.position.x - 23, arrived.position.y - 33.5)).toBeLessThan(.6);
    await settle(page);
    await shot(page, "2-courtyard-arrival", size.name);

    // Arrow keys walk the screen's axes here too.
    await viewport.focus();
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(300);
    await page.keyboard.up("ArrowUp");
    const up = (await savedGame(page)).world!.position;
    expect(up.y).toBeLessThan(arrived.position.y - .2);
    expect(up.x).toBeCloseTo(arrived.position.x, 5);

    // The bicycle court, where the white cat hides.
    await walkTo(page, { x: 16.5, y: 21 });
    await settle(page);
    await shot(page, "3-bicycle-court", size.name);

    // Behind the east laundry line its washing fades so the player stays visible; in front it does not.
    await walkTo(page, { x: 34, y: 8.6 });
    await expect(yard).toHaveAttribute("data-faded", /(^|,)courtyard\.laundry-east(,|$)/);
    await settle(page);
    await shot(page, "4-behind-laundry", size.name);
    await walkTo(page, { x: 34, y: 11 });
    await expect(yard).not.toHaveAttribute("data-faded", /courtyard\.laundry-east/);

    // Back out through the gate to the town.
    await walkTo(page, { x: 23, y: 36.5 });
    await expect(viewport).toHaveAttribute("data-map", "town");
    expect(errors).toEqual([]);
  });
});
