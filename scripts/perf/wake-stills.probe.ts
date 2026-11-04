import { test, expect, devices } from "@playwright/test";

const sizes = {
  desktop: { viewport: { width: 1440, height: 1000 } },
  phone: { ...devices["iPhone 13"] },
};

for (const [name, options] of Object.entries(sizes)) {
  test(`wake still ${name}`, async ({ browser }) => {
    const { defaultBrowserType: _, ...context } = options as typeof options & { defaultBrowserType?: string };
    const page = await (await browser.newContext(context)).newPage();
    await page.goto(`${process.env.JUNYAN_PREVIEW_URL}?seed=42`);
    await expect(page.getByRole("button", { name: "醒来" })).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await page.screenshot({ path: `docs/design/review/0055-review-wake-${name}.png` });
  });
}
