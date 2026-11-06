import { interactAt, walkTo, savedGame } from "./world-journey";
import { privateArtifact } from "./private-artifacts";
import { test, expect } from "@playwright/test";
import { seedDayOne, withSkip } from "./opening";
import type { Content, GameState } from "../src/contracts";

test.use({ launchOptions: {
  args: ["--mute-audio"],
  ...(process.env.JUNYAN_CHROMIUM ? { executablePath: process.env.JUNYAN_CHROMIUM } : {}),
} });

for (const build of ["development", "production"]) {
  test.describe(build, () => {
    test.beforeEach(async ({ page }) => {
      if (build === "production") {
        const url = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";
        await seedDayOne(page, url);
        await page.goto(`${url}?test=1&seed=42`);
      } else {
        await page.goto(withSkip("/?test=1&seed=42"));
      }
      await expect(page.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
      await page.getByRole("button", { name: "开门迎客" }).click();
    });

    for (const activation of ["pointer", "keyboard"]) {
      test(`word card shares focus with lookup sources and restores both layers (${activation})`, async ({ page, isMobile }, info) => {
        const errors: string[] = [];
        page.on("pageerror", error => errors.push(error.message));
        page.on("console", message => {
          if (message.type() === "error") errors.push(message.text());
        });
        await walkTo(page,{x:6.5,y:9});
        const tableTrigger = page.locator('[data-world-anchor="restaurant.table-1"]');
        await tableTrigger.click();
        const tableDialog = page.locator(".world-context[data-target=table]");
        const parentClose = tableDialog.getByRole("button", { name: "继续走走", exact: true });
        await expect(parentClose).toBeFocused();
        const wordTrigger = tableDialog.locator(".world-context-dialogue .word").first();
        if (activation === "keyboard") {
          for (let index = 0; index < 30; index++) {
            if (await wordTrigger.evaluate(element => element === document.activeElement)) break;
            await page.keyboard.press("Tab");
          }
          await expect(wordTrigger).toBeFocused();
          await page.keyboard.press("Enter");
        } else if (isMobile) await wordTrigger.tap();
        else await wordTrigger.click();
        const wordCard = page.locator(".word-popover");
        const wordClose = wordCard.getByRole("button", { name: "关闭词卡" });
        const replay = wordCard.getByRole("button", { name: "听这个词" });
        await expect(wordClose).toBeFocused();
        await expect(tableDialog).not.toHaveAttribute("inert", "");
        await expect(page.locator(".world-pad button").first()).toHaveAttribute("inert", "");
        const sourceWords = page.locator("[data-word-lookup]:visible");
        await page.keyboard.press("Shift+Tab");
        await info.attach('lookup-focus', {contentType:'application/json',body:JSON.stringify(await page.evaluate(()=>({active:document.activeElement?.outerHTML,words:[...document.querySelectorAll<HTMLElement>('[data-word-lookup]')].map(element=>({text:element.textContent,rects:element.getClientRects().length,inert:!!element.closest('[inert]')}))}))) });
        await expect(sourceWords.last()).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(wordClose).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(replay).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(sourceWords.first()).toBeFocused();
        const replacement=await sourceWords.first().innerText();
        await page.keyboard.press('Enter');
        await expect(wordCard.locator('h2')).toHaveText(replacement);
        await wordTrigger.click();
        await expect(wordCard.locator('h2')).toHaveText(await wordTrigger.innerText());
        await page.screenshot({ path: privateArtifact(`output/playwright/0025/${info.project.name}-${build}-${activation}-word-focus.png`), fullPage: true });
        await page.keyboard.press("Escape");
        await expect(wordCard).toHaveCount(0);
        await expect(tableDialog).toBeVisible();
        await expect(wordTrigger).toBeFocused();
        await expect(tableDialog).not.toHaveAttribute("inert", "");
        await page.keyboard.press("Escape");
        await expect(tableDialog).toHaveCount(0);
        await expect(tableTrigger).toBeFocused();
        await expect(page.locator("main")).not.toHaveAttribute("inert", "");
        expect(errors).toEqual([]);
      });
    }

    for (const helpButton of [".help-button"]) {
      test(`Help cancels an in-flight table arrival (${helpButton})`, async ({ page, isMobile }, info) => {
        const viewport=page.getByTestId('world-viewport');
        const canvas=viewport.locator('canvas');const box=(await canvas.boundingBox())!;
        const before=(await savedGame(page)).world!.position;
        await canvas.click({position:{x:box.width/2,y:box.height/2-80}});
        await expect.poll(async()=>JSON.stringify((await savedGame(page)).world!.position)).not.toBe(JSON.stringify(before));
        await page.locator(helpButton).click();
        const help=page.getByRole('dialog',{name:'怎么玩'});await expect(help).toBeVisible();
        const paused=(await savedGame(page)).world!.position;
        await page.waitForTimeout(3500);await expect(help).toBeVisible();
        expect((await savedGame(page)).world!.position).toEqual(paused);
        await expect(page.locator('.world-context[data-target=table]')).toHaveCount(0);
        await page.screenshot({path:privateArtifact(`${info.project.name}-${build}-help-stable.png`),fullPage:true});
        await page.keyboard.press('Escape');await page.waitForTimeout(500);
        expect((await savedGame(page)).world!.position).toEqual(paused);
        await interactAt(page,'restaurant.table-4');
        await expect(page.locator('.world-context[data-target=table]')).toBeVisible();
      });
    }
  });
}

test("production home navigation stays within the configured game subpath", async ({ page }) => {
  const base = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";
  await seedDayOne(page, base);
  await page.goto(`${base}?test=1&seed=42`);
  await page.getByRole("button", { name: "开门迎客" }).click();
  const brand = page.getByRole("link", { name: "君言首页" });
  expect(await brand.evaluate((element: HTMLAnchorElement) => new URL(element.href).pathname)).toBe("/junyan/");
  await brand.click();
  await expect(page).toHaveURL(base);
  await expect(page.locator(".brand")).toContainText("早安小馆");
  expect(await page.evaluate(() => "__TEST__" in window)).toBe(false);
});

test("receipt word targets are at least 44px and restore focus", async ({ page }, info) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  const {order,foods}=await page.evaluate(()=>{
    const hooks=(window as Window & {__TEST__:{content:Content;getState:()=>GameState}}).__TEST__;
    return {order:hooks.content.orders.find(entry=>entry.id===hooks.getState().customers[0].orderId)!,foods:hooks.content.foods};
  });
  await interactAt(page,'restaurant.table-1');await interactAt(page,'restaurant.kitchen');
  for(const item of order.items)for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${foods.find(food=>food.id===item.foodId)!.word.text}`,exact:true}).click();
  await page.getByRole('button',{name:'端好了，去上菜'}).click();await interactAt(page,'restaurant.table-1');
  await page.getByRole('button',{name:'上菜',exact:true}).click();
  const total=order.items.reduce((sum,item)=>sum+foods.find(food=>food.id===item.foodId)!.price*item.quantity,0);
  for(let n=0;n<order.paid-total;n++)await page.getByRole('button',{name:'+1块',exact:true}).click();
  await page.getByRole('button',{name:'递上找零'}).click();
  const receiptWords = page.locator(".world-table-receipt button");
  await expect(receiptWords.first()).toBeVisible();
  for (const button of await receiptWords.all()) {
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path: privateArtifact(`output/playwright/0025/${info.project.name}-receipt-targets.png`), fullPage: true });
  await receiptWords.first().click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.getByRole("button", { name: "关闭词卡" }).click();
  await expect(receiptWords.first()).toBeFocused();
});

test("kitchen, tray, and journal word cards restore their own triggers", async ({ page }) => {
  await page.goto(withSkip("/?test=1&seed=42"));
  await page.getByRole("button", { name: "开门迎客" }).click();
  await interactAt(page, "restaurant.table-1");
  await interactAt(page, "restaurant.kitchen");
  const kitchen = page.locator(".world-context[data-target=kitchen]");
  const kitchenWord = kitchen.locator(".world-kitchen-food .word").first();
  await kitchenWord.click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(kitchenWord).toBeFocused();
  await kitchen.locator(".world-kitchen-food > button[aria-label]").first().click();
  await kitchen.getByRole("button", { name: "端好了，去上菜" }).click();
  await page.getByRole("button",{name:"托盘",exact:true}).click();
  const trayWord = page.locator(".tray-pocket [data-word-lookup]").first();
  await trayWord.click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trayWord).toBeFocused();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /本子/ }).click();
  const journalWord = page.locator(".journal-list button").first();
  await journalWord.click();
  await expect(page.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(journalWord).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /本子/ })).toBeFocused();
});

test.beforeEach(async ({ page }) => { page.setDefaultTimeout(8_000); });
