import { test, expect, type Page } from "@playwright/test";
import { content } from "../src/content";
import { playOpening } from "./opening";
import { privateArtifact } from "./private-artifacts";

// The hospital opening plays in the pixel ward (ticket 0173): one crisp canvas at a whole zoom,
// no text in it, every DOM control of the opening unchanged.
const steps = content.opening.steps;
const firstRequest = steps.findIndex((step) => step.type === "request");
const auntArrives = steps.findIndex((step) => step.type !== "end" && (step.enter ?? []).includes("aunt"));

async function checkWard(page: Page) {
  const world = page.locator(".opening-world");
  await expect(world.locator("canvas")).toHaveCount(1);
  await expect(world.locator(".restaurant-scene")).toHaveCount(0);
  expect(await world.innerText()).toBe("");
  const ward = world.getByTestId("ward-scene");
  const zoom = Number(await ward.getAttribute("data-zoom"));
  expect(Number.isInteger(zoom) && zoom >= 1).toBe(true);
  // Whole device pixels per art pixel: the canvas's CSS size is its backing store × zoom / dpr.
  const fit = await world.locator("canvas").evaluate((canvas: HTMLCanvasElement, zoom) => {
    const scale = zoom / devicePixelRatio, rect = canvas.getBoundingClientRect(), box = canvas.parentElement!.getBoundingClientRect();
    return {
      width: Math.abs(rect.width - canvas.width * scale) < 0.01, height: Math.abs(rect.height - canvas.height * scale) < 0.01,
      covers: rect.width >= box.width - 0.5 && rect.height >= box.height - 0.5, pixelated: getComputedStyle(canvas).imageRendering === "pixelated",
    };
  }, zoom);
  expect(fit).toEqual({ width: true, height: true, covers: true, pixelated: true });
  return zoom;
}

test("the opening plays in the pixel ward", async ({ page }, info) => {
  test.setTimeout(180_000);
  if (info.project.name === "desktop") await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/?test=1&seed=42&opening=play");
  const zooms = new Set<number>();
  let request = 0;
  await playOpening(page, {
    shot: async (name) => {
      const opening = page.locator("main.opening");
      if (name.endsWith("-wake") || name.endsWith("-day-one")) return;
      const step = Number(await opening.getAttribute("data-step"));
      zooms.add(await checkWard(page));
      const moment = step === 0 ? "1-waking" : name.endsWith("-request") && request++ === 0 ? "2-request" : name.endsWith("-wrong") ? "3-held" : step === auntArrives ? "4-aunt" : null;
      if (moment) await page.screenshot({ path: privateArtifact(`output/pixel/0173/${info.project.name}-${moment}.png`) });
    },
  });
  // A fixed camera: one zoom for the whole opening.
  expect(zooms.size).toBe(1);
  expect(firstRequest).toBeGreaterThan(0);
  expect(auntArrives).toBeGreaterThan(firstRequest);
  expect(errors).toEqual([]);
});
