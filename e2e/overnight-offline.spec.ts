import { test as base, expect } from "@playwright/test";
import { seedDayOne } from "./opening";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { silentWav } from "./audio-fixtures";

const test = base.extend({
  launchOptions: async ({ browserName }, use) => {
    await use(browserName === "chromium" ? { args: ["--mute-audio"] } : {});
  },
});

test.use({
  baseURL: process.env.AUDIO_PREVIEW_URL || "http://127.0.0.1:5177/junyan/",
});

const audioFiles = readdirSync("public/audio").filter(name => name.endsWith(".wav")).sort();
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

test("fresh production install completes before offline reload and preserves every audio byte", async ({ page, context, browserName, baseURL }, info) => {
  await seedDayOne(page, baseURL!);
  const errors: string[] = [];
  const requestedPaths: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => {
    const url = new URL(request.url());
    if (url.protocol === "http:") requestedPaths.push(url.pathname);
  });
  await page.goto("./?test=1&seed=42");
  await expect(page.getByRole("button", { name: "开门迎客" })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  expect(await page.evaluate(() => "__TEST__" in window)).toBe(false);
  expect(await page.evaluate(async () => (await navigator.serviceWorker.ready).scope))
    .toBe(new URL("./", page.url()).href);
  const manifestPaths = await page.evaluate(async () => {
    const manifestUrl = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!.href;
    const manifest = await (await fetch(manifestUrl)).json();
    return [manifest.start_url, manifest.scope, ...manifest.icons.map((icon: { src: string }) => icon.src)]
      .map(path => new URL(path, manifestUrl).pathname);
  });
  expect(manifestPaths.every(path => path.startsWith("/junyan/"))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("button", { name: "开门迎客" })).toBeVisible();
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.screenshot({ path: info.outputPath(`offline-${viewport.width}.png`), fullPage: true });
  }
  expect(audioFiles).toHaveLength(85);
  for (const name of audioFiles) {
    const received = await page.evaluate(async name => {
      const response = await fetch(`./audio/${name}`, { cache: "no-store" });
      return { status: response.status, bytes: Array.from(new Uint8Array(await response.arrayBuffer())) };
    }, name);
    expect(received.status, name).toBe(200);
    expect(hash(Buffer.from(received.bytes)), name).toBe(hash(readFileSync(`public/audio/${name}`)));
  }
  const original = readFileSync(`public/audio/${audioFiles[0]}`);
  const media = browserName === "webkit" ? silentWav(original) : original;
  const duration = await page.evaluate(bytes => new Promise<number>((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "audio/wav" })));
    audio.onloadedmetadata = () => { URL.revokeObjectURL(audio.src); resolve(audio.duration); };
    audio.onerror = () => { URL.revokeObjectURL(audio.src); reject(Error("Offline WAV decode failed")); };
    audio.load();
  }), Array.from(media));
  expect(duration).toBeGreaterThan(0);
  if (browserName === "chromium") {
    await page.getByRole("button", { name: "开门迎客" }).click();
    await page.getByTestId("table-1").click();
    await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  }
  expect(requestedPaths.every(path => path.startsWith("/junyan/"))).toBe(true);
  expect(errors).toEqual([]);
  await info.attach("offline-evidence", {
    body: JSON.stringify({ browserName, audioFiles: audioFiles.length, offlineSha256Matches: audioFiles.length, duration, manifestPaths, errors }),
    contentType: "application/json",
  });
});

test("a real rebuilt release replaces the old cache and remains usable offline", async ({ page, context, baseURL }, info) => {
  test.skip(process.env.OFFLINE_RELEASE_REBUILD !== "1", "Opt in: rebuilds ignored dist while using an exclusive local production preview.");
  expect(process.env.AUDIO_PREVIEW_URL).toBe("http://127.0.0.1:5217/junyan/");
  await seedDayOne(page, baseURL!);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("./");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const previousCaches = await page.evaluate(() => caches.keys());
  const previousHtml = hash(readFileSync("dist/index.html"));
  try {
    execFileSync("pnpm", ["exec", "vite", "build", "--base", "/junyan/", "--minify", "false"], { stdio: "pipe" });
    const nextHtml = hash(readFileSync("dist/index.html"));
    expect(nextHtml).not.toBe(previousHtml);
    await page.evaluate(async () => {
      const changed = new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
      await (await navigator.serviceWorker.ready).update();
      await changed;
    });
    await expect.poll(() => page.evaluate(() => caches.keys())).not.toEqual(previousCaches);
    await page.waitForFunction(async previous => {
      const keys = await caches.keys();
      return previous.every(key => !keys.includes(key));
    }, previousCaches);
    await page.reload();
    const servedHtml = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch("./", { cache: "no-store" })).arrayBuffer())));
    expect(hash(Buffer.from(servedHtml))).toBe(nextHtml);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole("button", { name: "开门迎客" })).toBeVisible();
    const offlineHtml = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch("./", { cache: "no-store" })).arrayBuffer())));
    expect(hash(Buffer.from(offlineHtml))).toBe(nextHtml);
    expect(errors).toEqual([]);
    await info.attach("update-evidence", { body: JSON.stringify({ previousHtml, nextHtml, previousCaches, currentCaches: await page.evaluate(() => caches.keys()), errors }), contentType: "application/json" });
  } finally {
    execFileSync("pnpm", ["build"], { stdio: "pipe" });
  }
});
