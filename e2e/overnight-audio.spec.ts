import { interactAt } from "./world-journey";
import { test, expect } from "@playwright/test";
import { withSkip } from "./opening";
import { probeAudio, silentResponse } from "./audio-fixtures";

const failure = "声音暂时没有播出，再点一次听听。";

test("a native resource error after playback starts stays visible until replay", async ({ page }, info) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await probeAudio(page);
  await page.route("**/*.wav", route => silentResponse(route));
  await page.route("**/unavailable-audio.wav", route => route.abort("failed"));
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await interactAt(page, "restaurant.table-1");
  await expect.poll(() => page.evaluate(() => (window as any).__audioProbe.at(-1)?.status)).toBe("playing");
  await expect.poll(() => page.evaluate(() => (window as any).__lastAudio.currentTime)).toBeGreaterThan(0);
  await page.evaluate(async () => {
    const audio: HTMLAudioElement = (window as any).__lastAudio;
    await new Promise<void>(resolve => {
      audio.addEventListener("error", () => resolve(), { once: true });
      audio.src = "/unavailable-audio.wav";
      audio.load();
    });
  });
  expect(await page.evaluate(() => (window as any).__lastAudio.error?.code)).toBeGreaterThan(0);
  await expect(page.getByText(failure)).toBeVisible();
  await page.screenshot({ path: info.outputPath("resource-failure.png"), fullPage: true });
  await page.locator(".world-context-dialogue .round-button").first().click();
  await expect.poll(() => page.evaluate(() => (window as any).__audioProbe.at(-1)?.status)).toBe("playing");
  await expect(page.getByText(failure)).toBeHidden();
  await page.evaluate(async () => {
    const previous: HTMLAudioElement = (window as any).__audioElements[0];
    await new Promise<void>(resolve => {
      previous.addEventListener("error", () => resolve(), { once: true });
      previous.load();
    });
  });
  await expect(page.getByText(failure)).toBeHidden();
  await page.screenshot({ path: info.outputPath("recovered.png"), fullPage: true });
  expect(await page.evaluate(() => (window as any).__audioElements.every((audio: HTMLAudioElement) => !audio.muted && audio.volume === 1))).toBe(true);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors.every(message => message.startsWith("Failed to load resource:"))).toBe(true);
  await info.attach("native-media-evidence", {
    body: JSON.stringify(await page.evaluate(() => ({
      attempts: (window as any).__audioProbe,
      previousError: (window as any).__audioElements[0].error?.code,
      previousPaused: (window as any).__audioElements[0].paused,
      currentError: (window as any).__lastAudio.error,
    })), null, 2),
    contentType: "application/json",
  });
  await info.attach("expected-resource-error-console", { body: JSON.stringify(consoleErrors), contentType: "application/json" });
});

test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });
