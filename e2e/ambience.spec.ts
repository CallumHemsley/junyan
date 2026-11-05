import { appendFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { probeAudio, silentResponse } from "./audio-fixtures";
import { playOpening, seedDayOne, withSkip } from "./opening";

const preferenceKey = "junyan-ambience-v1";
const diagnostics = new WeakMap<Page, string[]>();
const native = (page: Page) => page.evaluate(() => {
  const p = window as any;
  const audio = p.__ambienceElements[0] as HTMLAudioElement | undefined;
  return { count: p.__ambienceElements.length, starts: p.__ambienceProbe.length,
    paused: audio?.paused, volume: audio?.volume, time: audio?.currentTime,
    duration: audio?.duration, loop: audio?.loop, events: p.__ambienceProbe };
});
async function start(page: Page) {
  await page.goto(withSkip("/?test=1&seed=42"));
  await expect.poll(async () => (await native(page)).count).toBe(0);
  await page.getByRole("button", { name: "开门迎客" }).click();
  await expect.poll(async () => (await native(page)).time ?? 0).toBeGreaterThan(0);
}
const settings = (page: Page) => page.getByLabel("环境声设置", { exact: true });
const checkbox = (page: Page) => page.getByRole("checkbox", { name: "环境声", exact: true });

test.beforeEach(async ({ page }) => {
  await probeAudio(page);
  const errors: string[] = [];
  diagnostics.set(page, errors);
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(`${message.text()} (${message.location().url})`); });
});
test.afterEach(async ({ page }, info) => {
  const evidence = await native(page);
  appendFileSync("docs/evidence/0063/integrated-native-events.jsonl", JSON.stringify({ project: info.project.name, title: info.title, native: evidence, console: diagnostics.get(page) }) + "\n");
  await info.attach("ambience-native-evidence", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
  if (!info.title.includes("resource failure")) expect(diagnostics.get(page)).toEqual([]);
});

test("settings preserve independent mute and level, keyboard never moves the waiter", async ({ page }, info) => {
  await start(page);
  await settings(page).focus();
  const position = await page.evaluate(() => (window as any).__TEST__.getState().player);
  await page.keyboard.press("Space");
  await expect(checkbox(page)).toBeVisible();
  expect(await page.evaluate(() => (window as any).__TEST__.getState().player)).toEqual(position);
  const slider = page.getByRole("slider", { name: "环境声音量" });
  await slider.focus();
  await page.keyboard.press("Home");
  await expect.poll(async () => (await native(page)).paused).toBe(true);
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("0.2");
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.09);
  await checkbox(page).uncheck();
  await expect.poll(async () => (await native(page)).paused).toBe(true);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), preferenceKey))
    .toEqual({ muted: true, level: .2 });
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  expect((await native(page)).count).toBe(0);
  await settings(page).click();
  await expect(checkbox(page)).not.toBeChecked();
  await expect(slider).toHaveValue("0.2");
  await checkbox(page).check();
  await expect.poll(async () => (await native(page)).paused).toBe(false);
  expect((await native(page)).count).toBe(1);
  await page.screenshot({ path: `docs/evidence/0063/screenshots/${info.project.name}-integrated-settings.png`, fullPage: true });
  for (const target of [settings(page), checkbox(page).locator(".."), slider]) {
    const box = await target.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  expect(await page.locator(".ambience-settings").innerText()).not.toMatch(/[a-z]/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(checkbox(page)).toBeHidden();
  await expect(settings(page)).toBeFocused();
});

test("native ambience survives panel changes and pauses/resumes through app lifecycle listeners", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: /本子/ }).click();
  expect((await native(page)).paused).toBe(false);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide")));
    expect((await native(page)).paused).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow")));
    await expect.poll(async () => (await native(page)).paused).toBe(false);
  }
  // Supply hidden/visible flags at the DOM boundary; actual page events use the same listener.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect((await native(page)).paused).toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(async () => (await native(page)).paused).toBe(false);
  expect((await native(page)).count).toBe(1);
  expect((await native(page)).starts).toBe(5);
});

test("real foreground speech ducks the bed and restores on native end, stop and word cancellation", async ({ page }) => {
  await page.route("**/*.wav", route => silentResponse(route, 300));
  await start(page);
  await page.getByTestId("table-1").click();
  await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.042);
  await expect.poll(async () => (await native(page)).volume, { timeout: 15000 }).toBeCloseTo(.1575);
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.042);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.1575);
  await page.getByTestId("table-1").click();
  await page.locator(".spoken .word").first().click();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.042);
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.1575);
  expect((await native(page)).count).toBe(1);
  expect(await page.evaluate(() => (window as any).__audioElements.every((audio: HTMLAudioElement) => audio.volume === 1 && !audio.muted))).toBe(true);
});

test("resource failure retries the same ambience owner without disturbing speech", async ({ page }) => {
  await page.route("**/audio/ambience/breakfast.mp3", route => route.abort("failed"));
  await page.route("**/*.wav", route => silentResponse(route));
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await settings(page).click();
  await expect(page.getByText("环境声暂时没有播出。")).toBeVisible();
  await page.unroute("**/audio/ambience/breakfast.mp3");
  await page.getByRole("button", { name: "重试", exact: true }).click();
  await expect(page.getByText("环境声暂时没有播出。")).toBeHidden();
  await expect.poll(async () => (await native(page)).time ?? 0).toBeGreaterThan(0);
  await settings(page).click();
  await page.getByTestId("table-1").click();
  await expect.poll(() => page.evaluate(() => (window as any).__audioProbe.at(-1)?.status)).toBe("playing");
  expect((await native(page)).count).toBe(1);
  expect(diagnostics.get(page)!.every(message => message.startsWith("Failed to load resource:"))).toBe(true);
});

test("unavailable preference storage keeps current-session controls functional", async ({ page }) => {
  await page.addInitScript(() => {
    const read = Storage.prototype.getItem;
    const write = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) { if (key === "junyan-ambience-v1") throw new DOMException("blocked", "SecurityError"); return read.call(this, key); };
    Storage.prototype.setItem = function (key, value) { if (key === "junyan-ambience-v1") throw new DOMException("blocked", "QuotaExceededError"); write.call(this, key, value); };
  });
  await start(page);
  await settings(page).click();
  await checkbox(page).uncheck();
  await expect.poll(async () => (await native(page)).paused).toBe(true);
  await checkbox(page).check();
  await expect.poll(async () => (await native(page)).paused).toBe(false);
});

test("opening stays silent then transitions to one bed, reset stops it", async ({ page }) => {
  test.setTimeout(180000);
  await page.goto("/?test=1&seed=42&opening=play");
  await playOpening(page, { pause: async () => { expect((await native(page)).count).toBe(0); } });
  await expect.poll(async () => (await native(page)).time ?? 0).toBeGreaterThan(0);
  expect((await native(page)).count).toBe(1);
  await page.evaluate(() => (window as any).__TEST__.reset());
  await expect(page.getByRole("button", { name: "醒来" })).toBeVisible();
  expect((await native(page)).paused).toBe(true);
  await page.getByRole("button", { name: "醒来" }).click();
  expect((await native(page)).paused).toBe(true);
});

test("reduced-motion settings remain usable and contained", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page);
  await settings(page).click();
  await expect(checkbox(page)).toBeVisible();
  await page.screenshot({ path: `docs/evidence/0063/screenshots/${info.project.name}-integrated-reduced-motion.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("production ambience plays and preserves mute offline under a relative subpath", async ({ page, context }) => {
  const base = process.env.AUDIO_PREVIEW_URL!;
  // The JSON-only save bootstrap has no icon link; this is its implicit favicon,
  // not an app asset (the application explicitly loads icon.svg).
  await page.route("**/favicon.ico", route => route.fulfill({ status: 204, body: "" }));
  await seedDayOne(page, base);
  await page.goto(base);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  await expect.poll(async () => (await native(page)).time ?? 0).toBeGreaterThan(0);
  expect((await native(page)).duration).toBeCloseTo(73);
  expect((await native(page)).events.every((event: any) => new URL(event.src).pathname.startsWith("/junyan/audio/ambience/"))).toBe(true);
  await settings(page).click();
  await checkbox(page).uncheck();
  await page.reload();
  const startButton = page.getByRole("button", { name: "开门迎客" });
  if (await startButton.isVisible()) await startButton.click();
  await settings(page).click();
  await expect(checkbox(page)).not.toBeChecked();
  expect((await native(page)).count).toBe(0);
});

test.describe("touch activation", () => {
  test.use({ hasTouch: true });
  test("a genuine touch gesture starts the bed on first entry", async ({ page }) => {
    await page.goto(withSkip("/?test=1&seed=42"));
    expect((await native(page)).count).toBe(0);
    await page.getByRole("button", { name: "开门迎客" }).tap();
    await expect.poll(async () => (await native(page)).time ?? 0).toBeGreaterThan(0);
    expect((await native(page)).events.every((event: any) => event.status === "playing")).toBe(true);
    expect((await native(page)).count).toBe(1);
  });
});


test("foreground resource failure releases ducking and direct replay recovers", async ({ page }) => {
  await start(page);
  await page.route("**/*.wav", route => route.abort("failed"));
  await page.getByTestId("table-1").click();
  await expect(page.getByText("声音暂时没有播出，再点一次听听。")).toBeVisible();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.1575);
  await page.unroute("**/*.wav");
  await page.route("**/*.wav", route => silentResponse(route, 300));
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  await expect.poll(async () => (await native(page)).volume).toBeCloseTo(.042);
  await expect(page.getByText("声音暂时没有播出，再点一次听听。")).toBeHidden();
  expect((await native(page)).count).toBe(1);
  expect(diagnostics.get(page)!.every(message => message.startsWith("Failed to load resource:"))).toBe(true);
});

test("narrow phone settings keep every control inside screen gutters", async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await start(page);
  await settings(page).click();
  const box = await page.locator(".ambience-options").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(12);
  expect(box!.x + box!.width).toBeLessThanOrEqual(308);
  await expect(checkbox(page)).toBeVisible();
  await page.screenshot({ path: `docs/evidence/0063/screenshots/${info.project.name}-integrated-narrow-320.png`, fullPage: true });
});
