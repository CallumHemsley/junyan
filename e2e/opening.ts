import { expect, type Page } from "@playwright/test";
import { content } from "../src/content";
import type { Content } from "../src/contracts";
import { createGame } from "../src/game";


export function withSkip(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}opening=skip`;
}

export async function seedDayOne(page: Page, base: string, state: object = createGame(content, 42)) {
  await page.goto(new URL("audio/manifest.json", base).href);
  await page.evaluate(async (save) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("junyan-waiter", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("saves");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put(save, "v1");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { db.close(); }
    localStorage.removeItem("junyan-waiter-pending-v1");
  }, state);
}

const hanzi = (line: { tokens: { text: string }[] }) => line.tokens.map((word) => word.text).join("");
const foodName = (id: string) => content.foods.find((food) => food.id === id)!.word.text;

export async function playOpening(
  page: Page,
  { shot = async () => {}, reply = "好", afterHandover = async () => {}, pause = async () => {} }: {
    shot?: (name: string) => Promise<unknown>;
    reply?: "好" | "谢谢";
    afterHandover?: () => Promise<unknown>;
    pause?: () => Promise<unknown>;
  } = {},
) {
  const opening = page.locator("main.opening");
  const next = async () => {
    await pause();
    await opening.getByRole("button", { name: "继续", exact: true }).click();
  };
  let shots = 0;
  const snap = async (type: string) => {
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
    await shot(`${String(shots++).padStart(2, "0")}-${type}`);
  };
  const firstRequest = content.opening.steps.findIndex((step) => step.type === "request");
  await expect(page.getByRole("button", { name: "醒来" })).toBeVisible();
  await snap("wake");
  await page.getByRole("button", { name: "醒来" }).click();
  for (const [index, step] of content.opening.steps.entries()) {
    await expect(opening).toHaveAttribute("data-step", String(index));
    if (step.type !== "say-en") await afterHandover();
    switch (step.type) {
      case "say-en":
        await expect(opening.locator('p[lang="en"]')).toHaveText(`“${step.en}”`);
        await snap(step.type);
        await next();
        break;
      case "say":
        await expect(opening.locator(".spoken").first()).toHaveText(hanzi(step.line));
        await snap(step.type);
        await next();
        break;
      case "request": {
        const tray = opening.locator(".bedside");
        const tile = (id: string) => tray.locator(".bedside-tray").getByRole("button", { name: foodName(id), exact: true });
        await snap(step.type);
        await pause();
        if (index === firstRequest) {
          await tile(content.opening.tray.find((id) => id !== step.want)!).click();
          await expect(tray.getByRole("status")).toContainText(hanzi(step.wrong));
          await expect(tile(step.want)).toBeEnabled();
          await snap("wrong");
          await pause();
        }
        await tile(step.want).click();
        await expect(tray.getByRole("status")).toContainText(hanzi(step.ok));
        await snap("handed");
        await next();
        break;
      }
      case "reply": {
        const chips = opening.locator(".reply-chips").getByRole("button");
        const option = step.options.find((choice) => choice.word.text === reply)!;
        await snap(step.type);
        await pause();
        await opening.locator(".reply-chips").getByRole("button", { name: reply, exact: true }).click();
        for (const chip of await chips.all()) await expect(chip).toBeDisabled();
        await expect(opening.getByRole("status")).toContainText(hanzi(option.answer));
        await snap("answer");
        await next();
        break;
      }
      case "end":
        await expect(opening.locator(".end-card h2")).toHaveText(step.title.tokens.map((word) => word.text).join(" · "));
        await snap(step.type);
        await next();
        break;
    }
  }
  await expect(page.getByRole("dialog", { name: "怎么玩" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "怎么玩" }).getByRole("button", { name: "关闭", exact: true })).toBeFocused();
  await snap("day-one");
}
