import { test, expect, type Page } from "@playwright/test";
import { withSkip } from "./opening";
import { probeAudio, silentResponse, silentWav } from "./audio-fixtures";
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import content from "../src/content/content.json" with { type: "json" };
import manifest from "../public/audio/manifest.json" with { type: "json" };
import { KITCHEN, TABLES, type Order } from "../src/contracts";

const failure = "声音暂时没有播出，再点一次听听。";
const diagnostics = new WeakMap<Page, { pageErrors: string[]; consoleErrors: string[] }>();
async function openTable(page: Page) {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
}
async function settled(page: Page) {
  await page.waitForFunction(() => (window as any).__audioProbe.length &&
    (window as any).__audioProbe.every((row: any) => row.status !== "pending"));
  return page.evaluate(() => (window as any).__audioProbe);
}

test.beforeEach(async ({ page }) => {
  const captured = { pageErrors: [] as string[], consoleErrors: [] as string[] };
  diagnostics.set(page, captured);
  page.on("pageerror", error => captured.pageErrors.push(error.message));
  page.on("console", message => { if (message.type() === "error") captured.consoleErrors.push(message.text()); });
  await probeAudio(page);
});

test.afterEach(async ({ page }, info) => {
  const evidence = await page.evaluate(() => ({
    events: (window as any).__audioProbe,
    current: (window as any).__lastAudio ? {
      paused: (window as any).__lastAudio.paused,
      currentTime: (window as any).__lastAudio.currentTime,
    } : null,
  }));
  await info.attach("audio-evidence", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
  const captured = diagnostics.get(page)!;
  await info.attach("console-evidence", { body: JSON.stringify(captured, null, 2), contentType: "application/json" });
  expect(captured.pageErrors).toEqual([]);
  if (!info.title.includes("genuine current load failure")) expect(captured.consoleErrors).toEqual([]);
});

test("replay during initial load ignores the superseded native AbortError", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  let requests = 0;
  await page.route("**/*.wav", route => silentResponse(route, ++requests === 1 ? 1500 : 0));
  await openTable(page);
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  const events = await settled(page);
  await expect.poll(() => page.evaluate(() => (window as any).__lastAudio.currentTime)).toBeGreaterThan(0);
  await info.attach("native-playback", { body: JSON.stringify({ events, errors }, null, 2), contentType: "application/json" });
  await page.screenshot({ path: `output/playwright/diagnosis/${info.project.name}-${process.env.AUDIO_EVIDENCE || "after"}.png`, fullPage: true });
  expect(events[0].status).toBe("AbortError");
  expect(events.at(-1).status).toBe("playing");
  expect(events.every((row: any) => !row.muted && row.volume === 1)).toBe(true);
  await expect(page.getByText(failure)).toBeHidden();
  expect(errors).toEqual([]);
});

test("a genuine current load failure remains visible and replay recovers", async ({ page }, info) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  let broken = true;
  await page.route("**/*.wav", route => broken ? route.abort("failed") : silentResponse(route));
  await openTable(page);
  await settled(page);
  await expect(page.getByText(failure)).toBeVisible();
  broken = false;
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  expect((await settled(page)).at(-1).status).toBe("playing");
  await expect(page.getByText(failure)).toBeHidden();
  await info.attach("expected-network-console", { body: JSON.stringify(consoleErrors), contentType: "application/json" });
  expect(errors).toEqual([]);
});

test("rapid replay and word taps keep only the latest native media playing", async ({ page }) => {
  await page.route("**/*.wav", route => silentResponse(route, 800));
  await openTable(page);
  await page.getByRole("button", { name: "再听一遍", exact: true }).click({ clickCount: 3, delay: 20 });
  await page.locator(".spoken .word").first().click();
  await page.getByRole("button", { name: "听这个词" }).click();
  const events = await settled(page);
  expect(events.at(-1).status).toBe("playing");
  expect(events.slice(0, -1).every((row: any) => row.status === "AbortError" || row.status === "playing")).toBe(true);
  expect(await page.evaluate(() => (window as any).__audioElements.slice(0, -1).every((audio: HTMLAudioElement) => audio.paused))).toBe(true);
  await expect(page.getByText(failure)).toBeHidden();
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__lastAudio.paused)).toBe(true);
});

test("closing a loading dialogue invalidates playback and its eventual rejection", async ({ page }) => {
  await page.route("**/*.wav", route => silentResponse(route, 1500));
  await openTable(page);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  expect((await settled(page)).at(-1).status).toBe("AbortError");
  expect(await page.evaluate(() => (window as any).__lastAudio.paused)).toBe(true);
  await page.getByRole("button", { name: /本子/ }).click();
  await expect(page.getByText(failure)).toBeHidden();
});

test("day reset invalidates pending audio without polluting the next dialogue", async ({ page }) => {
  await page.route("**/*.wav", route => silentResponse(route, 1500));
  await openTable(page);
  await page.evaluate(() => (window as any).__TEST__.reset());
  expect((await settled(page)).at(-1).status).toBe("AbortError");
  await page.getByTestId("table-1").click();
  await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  expect((await settled(page)).at(-1).status).toBe("playing");
  await expect(page.getByText(failure)).toBeHidden();
});

test("expired walking gesture reports native policy rejection and direct replay recovers", async ({ page }, info) => {
  test.skip(!["audio-webkit", "audio-chromium"].includes(info.project.name), "Requires the dedicated WebKit or strict-autoplay Chromium audio project");
  await page.addInitScript(() => {
    const frame = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => frame(() => setTimeout(() => callback(performance.now()), 600));
  });
  await page.route("**/*.wav", route => silentResponse(route));
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  await page.waitForTimeout(10000);
  const initial = await settled(page);
  expect(initial[0].sinceClick).toBeGreaterThan(5000);
  expect(initial[0].active).toBe(false);
  expect(initial[0].status).toBe("NotAllowedError");
  await expect(page.getByText("点一下喇叭，再听一遍。")).toBeVisible();
  await expect(page.getByText(failure)).toBeHidden();
  await page.getByRole("button", { name: "再听一遍", exact: true }).click();
  expect((await settled(page)).at(-1).status).toBe("playing");
  await expect(page.locator(".save-note")).toHaveCount(0);
  await info.attach("policy-scope", { body: `Native first attempt: ${initial[0].status}; active=${initial[0].active}. Silent PCM, unmuted element. No unlock claim.`, contentType: "text/plain" });
});

test("autosaving a word does not invalidate its pending playback", async ({ page }) => {
  await page.route("**/*.wav", route => silentResponse(route, 1200));
  await page.goto(withSkip("/"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  await page.locator(".spoken .word").first().click();
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise<number>((resolve, reject) => {
      const request = database.transaction("saves").objectStore("saves").get("v1");
      request.onsuccess = () => { resolve(Object.keys(request.result?.journal || {}).length); database.close(); };
      request.onerror = () => reject(request.error);
    });
  })).toBeGreaterThan(0);
  expect((await settled(page)).at(-1).status).toBe("playing");
  await expect(page.getByText(failure)).toBeHidden();
});

test("advancing the day invalidates audio even with the table panel still open", async ({ page }) => {
  await page.route("**/*.wav", route => silentResponse(route, 2000));
  await openTable(page);
  await page.evaluate(({ kitchen, tables }) => {
    const hooks = (window as any).__TEST__;
    const state = hooks.getState();
    for (const target of tables) {
      const order: Order = hooks.content.orders.find((entry: Order) => entry.id === state.customers.find((customer: any) => customer.table === target.table).orderId);
      hooks.dispatch({ type: "move", position: { x: target.x + 1.4, y: target.y } });
      hooks.dispatch({ type: "interact", table: target.table });
      hooks.dispatch({ type: "move", position: { x: kitchen.x, y: kitchen.y + 1.3 } });
      let total = 0;
      for (const item of order.items) {
        total += hooks.content.foods.find((food: any) => food.id === item.foodId).price * item.quantity;
        for (let count = 0; count < item.quantity; count++) hooks.dispatch({ type: "pickup", foodId: item.foodId });
      }
      hooks.dispatch({ type: "move", position: { x: target.x + 1.4, y: target.y } });
      hooks.dispatch({ type: "deliver", table: target.table, now: 1 });
      hooks.dispatch({ type: "pay", table: target.table, change: order.paid - total });
    }
  }, { kitchen: KITCHEN, tables: TABLES });
  await page.waitForFunction(() => (window as any).__TEST__.getState().ended);
  await page.evaluate(() => (window as any).__TEST__.dispatch({ type: "next-day" }));
  await page.waitForFunction(() => (window as any).__TEST__.getState().day === 2);
  expect((await settled(page)).at(-1).status).toBe("AbortError");
  expect(await page.evaluate(() => (window as any).__lastAudio.paused)).toBe(true);
  await expect(page.getByText(failure)).toBeHidden();
});

test("raw repository WAVs contain PCM samples and silent fixtures preserve headers and duration", async () => {
  const directory = new URL("../public/audio/", import.meta.url);
  const files = (await readdir(directory)).filter(name => name.endsWith(".wav"));
  expect(files).toHaveLength(manifest.clips.length);
  expect(files.sort()).toEqual(manifest.clips.map(clip => clip.filename).sort());
  const referenced = new Set<string>();
  const collectAudio = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("/audio/")) referenced.add(value.slice(7));
    else if (value && typeof value === "object") Object.values(value).forEach(collectAudio);
  };
  collectAudio(content);
  expect([...referenced].sort()).toEqual(files);
  for (const file of files) {
    const original = await readFile(new URL(file, directory));
    expect(createHash("sha256").update(original).digest("hex")).toBe(manifest.clips.find(clip => clip.filename === file)!.sha256);
    const silent = silentWav(original);
    expect(silent.length).toBe(original.length);
    let dataBytes = 0;
    for (let offset = 12; offset + 8 <= original.length;) {
      const size = original.readUInt32LE(offset + 4);
      if (original.toString("ascii", offset, offset + 4) === "data") {
        expect(silent.subarray(offset, offset + 8)).toEqual(original.subarray(offset, offset + 8));
        expect(original.subarray(offset + 8, offset + 8 + size).some(sample => sample !== 0)).toBe(true);
        expect(silent.subarray(offset + 8, offset + 8 + size).every(sample => sample === 0)).toBe(true);
        dataBytes += size;
      } else expect(silent.subarray(offset, offset + size + 8)).toEqual(original.subarray(offset, offset + size + 8));
      offset += 8 + size + (size % 2);
    }
    expect(dataBytes).toBeGreaterThan(0);
  }
});
