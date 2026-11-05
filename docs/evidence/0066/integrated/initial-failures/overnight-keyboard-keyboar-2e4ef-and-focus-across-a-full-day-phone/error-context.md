# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: overnight-keyboard.spec.ts >> keyboard journey keeps named controls and focus across a full day
- Location: e2e/overnight-keyboard.spec.ts:115:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('.modal-backdrop')
Expected: ""
Received: serializes to the same string
Timeout:  10000ms

Call log:
  - Expect "toHaveAttribute" locator('.modal-backdrop') with timeout 10000ms
  - waiting for locator('.modal-backdrop')
    24 × locator resolved to <div class="modal-backdrop">…</div>
       - unexpected value "null"

```

```yaml
- dialog "1桌点餐":
  - button "关闭": ×
  - text: 1桌 · 林姐
  - button "再听一遍"
  - button "早上好"
  - button "听招呼"
  - button "我"
  - button "想"
  - button "要"
  - button "一"
  - button "个"
  - button "包子"
  - paragraph: 点字听词 · 记住后去厨房取餐
  - button "去厨房"
  - button "上菜 →"
```

# Test source

```ts
  31  |   }).__TEST__.dispatch(action), action);
  32  | }
  33  | 
  34  | test.beforeEach(async ({ page }) => {
  35  |   const errors: string[] = [];
  36  |   diagnostics.set(page, errors);
  37  |   page.on("pageerror", (error) => errors.push(error.message));
  38  |   page.on("console", (message) => {
  39  |     if (message.type() === "error") errors.push(message.text());
  40  |   });
  41  |   await page.goto(withSkip("/?test=1&seed=42"));
  42  |   await activate(page, page.getByRole("button", { name: "开门迎客" }));
  43  | });
  44  | 
  45  | test.afterEach(async ({ page }, info) => {
  46  |   const errors = diagnostics.get(page)!;
  47  |   await info.attach("console-evidence", { body: JSON.stringify(errors), contentType: "application/json" });
  48  |   expect(errors).toEqual([]);
  49  | });
  50  | 
  51  | test("Escape interrupts walking without a delayed table opening", async ({ page }) => {
  52  |   await activate(page, page.getByRole("group", { name: "今日客人", exact: true })
  53  |     .getByRole("button", { name: /^4桌 / }));
  54  |   await expect(page.locator(".world-footer")).toContainText("走过去");
  55  |   await page.keyboard.press("Escape");
  56  |   await expect(page.locator(".world-footer")).not.toContainText("走过去", { timeout: 500 });
  57  |   const { state } = await snapshot(page);
  58  |   await page.waitForTimeout(3500);
  59  |   expect((await snapshot(page)).state.player).toEqual(state.player);
  60  |   await expect(page.getByRole("dialog")).toHaveCount(0);
  61  | });
  62  | 
  63  | test("day summary blocks movement and interaction shortcuts", async ({ page }) => {
  64  |   const { state, content } = await snapshot(page);
  65  |   for (const customer of state.customers) {
  66  |     const order = content.orders.find((entry) => entry.id === customer.orderId)!;
  67  |     const target = TABLES.find((entry) => entry.table === customer.table)!;
  68  |     const position = { x: target.x + 1.4, y: target.y };
  69  |     await dispatch(page, { type: "move", position });
  70  |     await dispatch(page, { type: "interact", table: customer.table });
  71  |     await dispatch(page, { type: "move", position: { x: KITCHEN.x, y: KITCHEN.y + 1.3 } });
  72  |     for (const item of order.items) {
  73  |       for (let count = 0; count < item.quantity; count++) {
  74  |         await dispatch(page, { type: "pickup", foodId: item.foodId });
  75  |       }
  76  |     }
  77  |     await dispatch(page, { type: "move", position });
  78  |     await dispatch(page, { type: "deliver", table: customer.table, now: 1 });
  79  |     const total = order.items.reduce((sum, item) => sum + item.quantity * content.foods.find((food) => food.id === item.foodId)!.price, 0);
  80  |     await dispatch(page, { type: "pay", table: customer.table, change: order.paid - total });
  81  |   }
  82  |   await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  83  |   const before = (await snapshot(page)).state.player;
  84  |   await page.keyboard.press("ArrowRight");
  85  |   expect((await snapshot(page)).state.player).toEqual(before);
  86  |   await page.keyboard.press("e");
  87  |   await expect(page.getByRole("dialog", { name: "今日小结" })).toBeVisible();
  88  |   await expect(page.getByRole("button", { name: "明天见" })).toBeFocused();
  89  |   await page.keyboard.press("Escape");
  90  |   await page.keyboard.press("Shift+Tab");
  91  |   await expect(page.getByRole("button", { name: "回家看看" })).toBeFocused();
  92  | });
  93  | 
  94  | test("kitchen closes back to the original table trigger after walking", async ({ page }) => {
  95  |   const trigger = page.getByRole("group", { name: "今日客人", exact: true })
  96  |     .getByRole("button", { name: /^1桌 / });
  97  |   await activate(page, trigger);
  98  |   await expect(page.getByRole("dialog", { name: "1桌点餐" })).toBeVisible();
  99  |   await activate(page, page.getByRole("button", { name: "去厨房", exact: true }));
  100 |   await expect(page.getByRole("dialog", { name: "厨房", exact: true })).toBeVisible();
  101 |   await page.keyboard.press("Escape");
  102 |   await expect(trigger).toBeFocused();
  103 | });
  104 | 
  105 | test("modified arrow shortcuts do not move the waiter", async ({ page }) => {
  106 |   const before = (await snapshot(page)).state.player;
  107 |   for (const modifier of ["Control", "Alt", "Meta"]) {
  108 |     await page.keyboard.press(`${modifier}+ArrowRight`);
  109 |     expect((await snapshot(page)).state.player).toEqual(before);
  110 |   }
  111 |   await page.keyboard.press("ArrowRight");
  112 |   expect((await snapshot(page)).state.player).not.toEqual(before);
  113 | });
  114 | 
  115 | test("keyboard journey keeps named controls and focus across a full day", async ({ page }, info) => {
  116 |   await page.screenshot({ path: `output/playwright/0037/${info.project.name}-restaurant.png`, fullPage: true });
  117 |   expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  118 |   const { state, content } = await snapshot(page);
  119 |   for (const customer of state.customers) {
  120 |     const trigger = page.getByRole("group", { name: "今日客人", exact: true })
  121 |       .getByRole("button", { name: new RegExp(`^${customer.table}桌 `) });
  122 |     const order = content.orders.find((entry) => entry.id === customer.orderId)!;
  123 |     await activate(page, trigger);
  124 |     const dialog = page.getByRole("dialog", { name: `${customer.table}桌点餐` });
  125 |     await expect(dialog.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
  126 |     if (customer.table === 1) {
  127 |       const word = dialog.locator(".character-greeting .word").first();
  128 |       await activate(page, word);
  129 |       const card = page.getByRole("dialog", { name: /的意思$/ });
  130 |       await expect(card.getByRole("button", { name: "关闭词卡" })).toBeFocused();
> 131 |       await expect(page.locator(".modal-backdrop")).not.toHaveAttribute("inert", "");
      |                                                     ^ Error: expect(locator).toHaveAttribute(expected) failed
  132 |       await expect(page.locator("main")).toHaveAttribute("inert", "");
  133 |       const sourceWords = dialog.locator("[data-word-lookup]");
  134 |       await page.keyboard.press("Shift+Tab");
  135 |       await expect(sourceWords.last()).toBeFocused();
  136 |       await page.keyboard.press("Tab");
  137 |       await expect(card.getByRole("button", { name: "关闭词卡" })).toBeFocused();
  138 |       await page.keyboard.press("Tab");
  139 |       await expect(card.getByRole("button", { name: "听这个词" })).toBeFocused();
  140 |       await page.keyboard.press("Tab");
  141 |       await expect(sourceWords.first()).toBeFocused();
  142 |       await page.screenshot({ path: `output/playwright/0037/${info.project.name}-word-card.png`, fullPage: true });
  143 |       await page.keyboard.press("Escape");
  144 |       await expect(word).toBeFocused();
  145 |       await expect(dialog).toBeVisible();
  146 |     }
  147 |     await activate(page, dialog.getByRole("button", { name: "去厨房", exact: true }));
  148 |     const kitchen = page.getByRole("dialog", { name: "厨房", exact: true });
  149 |     for (const item of order.items) {
  150 |       const food = content.foods.find((entry) => entry.id === item.foodId)!;
  151 |       for (let count = 0; count < item.quantity; count++) {
  152 |         await activate(page, kitchen.getByRole("button", { name: `拿${food.word.hanzi}`, exact: true }));
  153 |       }
  154 |     }
  155 |     await activate(page, kitchen.getByRole("button", { name: "端好了，去上菜" }));
  156 |     await activate(page, trigger);
  157 |     await activate(page, dialog.getByRole("button", { name: /^上菜/ }));
  158 |     const total = order.items.reduce((sum, item) => sum + item.quantity * content.foods.find((food) => food.id === item.foodId)!.price, 0);
  159 |     for (let amount = 0; amount < order.paid - total; amount++) {
  160 |       await activate(page, dialog.getByRole("button", { name: "+1块", exact: true }));
  161 |     }
  162 |     await activate(page, dialog.getByRole("button", { name: "递上找零" }));
  163 |     await expect(dialog.locator(".thanks-chop")).toBeVisible();
  164 |     await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  165 |     await activate(page, dialog.getByRole("button", { name: "继续招呼" }));
  166 |   }
  167 |   const summary = page.getByRole("dialog", { name: "今日小结" });
  168 |   await expect(summary.getByRole("button", { name: "明天见" })).toBeFocused();
  169 |   await page.keyboard.press("Tab");
  170 |   await expect(summary.getByRole("button", { name: "回家看看" })).toBeFocused();
  171 |   await page.screenshot({ path: `output/playwright/0037/${info.project.name}-summary.png`, fullPage: true });
  172 |   await activate(page, summary.getByRole("button", { name: "明天见" }));
  173 |   expect((await snapshot(page)).state.day).toBe(2);
  174 |   await activate(page, page.getByRole("button", { name: /本子/ }));
  175 |   await expect(page.locator(".journal-list button").first()).toBeVisible();
  176 |   await page.screenshot({ path: `output/playwright/0037/${info.project.name}-journal.png`, fullPage: true });
  177 | });
  178 | 
  179 | test("production keyboard interruption does not reopen a cancelled table", async ({ page }) => {
  180 |   const preview = process.env.JUNYAN_PREVIEW_URL || "http://127.0.0.1:5177/junyan/";
  181 |   await seedDayOne(page, preview);
  182 |   await page.goto(`${preview}?test=1&seed=42`);
  183 |   await activate(page, page.getByRole("button", { name: "开门迎客" }));
  184 |   await activate(page, page.getByRole("group", { name: "今日客人", exact: true })
  185 |     .getByRole("button", { name: /^4桌 / }));
  186 |   await expect(page.locator(".world-footer")).toContainText("走过去");
  187 |   await page.keyboard.press("Escape");
  188 |   await expect(page.locator(".world-footer")).not.toContainText("走过去", { timeout: 500 });
  189 |   await page.waitForTimeout(3500);
  190 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  191 |   expect(await page.evaluate(() => typeof (window as unknown as { __TEST__?: unknown }).__TEST__)).toBe("undefined");
  192 | });
  193 | 
  194 | for (const abortWrites of [false, true]) {
  195 |   test(`non-test word survives immediate reload (aborted IndexedDB: ${abortWrites})`, async ({ page }) => {
  196 |     if (abortWrites) {
  197 |       await page.addInitScript(() => {
  198 |         const put = IDBObjectStore.prototype.put;
  199 |         IDBObjectStore.prototype.put = function (...args) {
  200 |           const request = put.apply(this, args);
  201 |           this.transaction.abort();
  202 |           return request;
  203 |         };
  204 |       });
  205 |     }
  206 |     await page.goto(withSkip("/?seed=42"));
  207 |     await page.getByRole("button", { name: "开门迎客" }).click();
  208 |     await page.getByRole("group", { name: "今日客人", exact: true })
  209 |       .getByRole("button", { name: /^1桌 / }).click();
  210 |     const dialog = page.getByRole("dialog", { name: "1桌点餐" });
  211 |     await expect(dialog).toBeVisible();
  212 |     await page.waitForTimeout(650);
  213 |     await dialog.getByRole("button", { name: "包子", exact: true }).click();
  214 |     await expect(page.getByRole("dialog", { name: "包子的意思" })).toBeVisible();
  215 |     await page.reload();
  216 |     await page.getByRole("button", { name: "开门迎客" }).click();
  217 |     await page.getByRole("button", { name: /本子/ }).click();
  218 |     await expect(page.locator(".journal-list")).toContainText("包子");
  219 |     await page.locator(".journal-list button").filter({ hasText: "包子" }).click();
  220 |     await expect(page.getByRole("dialog", { name: "包子的意思" })).toBeVisible();
  221 |     await page.reload();
  222 |     await page.getByRole("button", { name: "开门迎客" }).click();
  223 |     await page.getByRole("button", { name: /本子/ }).click();
  224 |     await expect(page.locator(".journal-list button").filter({ hasText: "包子" })).toContainText("听过 2 次");
  225 |     expect(await page.evaluate(() => typeof (window as unknown as { __TEST__?: unknown }).__TEST__)).toBe("undefined");
  226 |   });
  227 | }
  228 | 
  229 | for (const invalid of ["{", "{}"] as const) {
  230 |   test(`invalid recovery checkpoint falls back to IndexedDB: ${invalid}`, async ({ page }) => {
  231 |     await page.goto(withSkip("/?seed=42"));
```