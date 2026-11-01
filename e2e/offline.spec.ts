import { test, expect } from "@playwright/test";

test.use({ baseURL: "http://127.0.0.1:5177" });

test("production keeps the restaurant and Mandarin audio available offline", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?test=1&seed=42");
  await expect(page.getByRole("button", { name: "开门迎客" })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  expect(await page.evaluate(() => typeof (window as any).__TEST__)).toBe(
    "undefined",
  );
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  const duration = await page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const audio = new Audio("/audio/order-01.m4a");
        audio.oncanplaythrough = () => resolve(audio.duration);
        audio.onerror = () =>
          reject(Error("Mandarin audio unavailable offline"));
        audio.load();
      }),
  );
  expect(duration).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
