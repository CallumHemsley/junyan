import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { savedGame, walkTo } from "./world-journey";
import { withSkip } from "./opening";
import { restaurantMap } from "../src/world/restaurant";

// The town is walked in the top-down pixel engine (ticket 0174): leaving the restaurant onto the
// street, cardinal walking, the market, and walking behind the junction tree. Screenshots go to
// output/pixel/0174/ for review.
const shot = (page: Page, name: string, size: string) => {
  const dir = join(process.cwd(), "output/pixel/0174");
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

  test(`the town is walked in pixel art (${size.name})`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "sizes are set per test");
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(withSkip("/?test=1&seed=42"));
    await page.getByRole("button", { name: "开门迎客" }).click();
    const viewport = page.getByTestId("world-viewport");
    await expect(viewport).toHaveAttribute("data-map", "restaurant");

    // Out of the street door and onto the lane.
    const door = restaurantMap.exits.find(e => e.id === "to-town")!.rect;
    await walkTo(page, { x: door.x + door.width / 2, y: door.y + door.height / 2 });
    await expect(viewport).toHaveAttribute("data-map", "town");
    const town = page.locator(".pixel-town");
    await expect(town).toHaveAttribute("data-pixel-camera", /zoom/);
    const camera = JSON.parse((await town.getAttribute("data-pixel-camera"))!);
    expect(Number.isInteger(camera.zoom)).toBe(true);
    // The camera stays inside the 80×64 town.
    expect(camera.x).toBeGreaterThanOrEqual(0);
    expect(camera.y).toBeGreaterThanOrEqual(0);
    await expect(viewport.locator("canvas")).toHaveCount(1);
    // The place name and labels stay DOM.
    await expect(viewport.locator(".world-place")).toBeVisible();
    await settle(page);
    await shot(page, "1-street", size.name);

    // Arrow keys walk the screen's axes.
    const start = (await savedGame(page)).world!.position;
    await viewport.focus();
    await page.keyboard.down("ArrowDown");
    await page.waitForTimeout(250);
    await page.keyboard.up("ArrowDown");
    const down = (await savedGame(page)).world!.position;
    expect(down.y).toBeGreaterThan(start.y + .2);
    expect(down.x).toBeCloseTo(start.x, 5);
    expect((await savedGame(page)).world!.facing).toBe("south");

    // Across the road to the market pocket.
    await walkTo(page, { x: 34, y: 42.2 });
    await settle(page);
    await shot(page, "2-market", size.name);

    // Behind the junction tree: its canopy fades once drawn taller than its footprint (a placeholder box does not cover the player).
    await walkTo(page, { x: 18.75, y: 27.6 });
    await settle(page);
    await shot(page, "3-behind-tree", size.name);
    const faded = await town.getAttribute("data-faded");
    expect(faded === null || faded.split(",").includes("town.junction")).toBe(true);

    // Back in at the restaurant door.
    await walkTo(page, { x: 34, y: 28.6 });
    await expect(viewport).toHaveAttribute("data-map", "restaurant");
    expect(errors).toEqual([]);
  });
});
