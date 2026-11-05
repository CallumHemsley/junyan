import { test, expect } from "@playwright/test";
import { withSkip } from "./opening";

test("direct word switching keeps latest trigger and parent", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await page.getByTestId("table-1").click();
  const parent = page.getByRole("dialog", { name: "1桌点餐" });
  const words = parent.locator(".spoken .word");
  await words.nth(0).click();
  await words.nth(1).click({ timeout: 2000 });
  await expect(page.locator(".word-popover h2")).toHaveText(await words.nth(1).innerText());
  await page.screenshot({ path: `output/playwright/0061/${info.project.name}-switch.png`, fullPage: true });
  await page.keyboard.press("Escape");
  await expect(words.nth(1)).toBeFocused();
  await expect(parent).toBeVisible();
  expect(errors).toEqual([]);
});
