# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: overnight-keyboard.spec.ts >> keyboard journey keeps named controls and focus across a full day
- Location: e2e/overnight-keyboard.spec.ts:115:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "君言首页" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: 君言
      - generic [ref=e7]: 君言 / 早安小馆
    - navigation "小馆" [ref=e8]:
      - group [ref=e9]:
        - generic "环境声设置" [ref=e10] [cursor=pointer]: 环境声
      - button "本子 7" [ref=e14] [cursor=pointer]:
        - generic [ref=e17]: 本子
        - generic [ref=e18]: "7"
      - button "怎么玩" [ref=e19] [cursor=pointer]
  - main [ref=e20]:
    - navigation "楼里" [ref=e21]:
      - button "早安小馆" [ref=e22] [cursor=pointer]
      - button "家" [ref=e23] [cursor=pointer]
      - button "院子" [ref=e24] [cursor=pointer]
      - button "修理间" [ref=e25] [cursor=pointer]
      - button "屋顶花园" [ref=e26] [cursor=pointer]
    - generic [ref=e27]:
      - region "早安小馆餐厅" [ref=e28]:
        - generic [ref=e29]:
          - button "第一天 · 早市" [ref=e30] [cursor=pointer]:
            - generic [aria-hidden] [ref=e35]: +
          - generic "招呼客人 1 / 4 桌" [ref=e36]: 1 / 4 桌
        - generic [ref=e37]:
          - generic [aria-hidden] [ref=e38] [cursor=pointer]
          - button "1桌" [pressed] [ref=e39] [cursor=pointer]
          - button "2桌" [ref=e41] [cursor=pointer]
          - button "3桌" [ref=e44] [cursor=pointer]
          - button "4桌" [ref=e47] [cursor=pointer]
          - button "取餐" [ref=e50] [cursor=pointer]
        - button "2桌 · 听点餐" [ref=e52] [cursor=pointer]:
          - text: 2桌 · 听点餐
          - generic [aria-hidden] [ref=e53]: →
      - region "今日客人和托盘" [ref=e54]:
        - group "今日客人" [ref=e55]:
          - button "1桌 林姐 多谢" [ref=e56] [cursor=pointer]:
            - generic [ref=e57]: 1桌
            - generic [ref=e58]:
              - generic [ref=e59]: 林姐
              - generic [ref=e60]: 多谢
          - button "2桌 小李 等候点餐" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]: 2桌
            - generic [ref=e63]:
              - generic [ref=e64]: 小李
              - generic [ref=e65]: 等候点餐
          - button "3桌 张老师 等候点餐" [ref=e66] [cursor=pointer]:
            - generic [ref=e67]: 3桌
            - generic [ref=e68]:
              - generic [ref=e69]: 张老师
              - generic [ref=e70]: 等候点餐
          - button "4桌 小周 等候点餐" [ref=e71] [cursor=pointer]:
            - generic [ref=e72]: 4桌
            - generic [ref=e73]:
              - generic [ref=e74]: 小周
              - generic [ref=e75]: 等候点餐
        - group "托盘" [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]: 托盘
            - generic [ref=e79]: 0 / 6
          - button "厨房" [ref=e80] [cursor=pointer]:
            - text: 厨房
            - generic [aria-hidden] [ref=e81]: ↗
  - dialog "1桌点餐" [ref=e83]:
    - button "关闭" [ref=e84] [cursor=pointer]: ×
    - generic [ref=e85]:
      - generic [ref=e86]: 1桌 · 林姐
      - button "再听一遍" [ref=e87] [cursor=pointer]
    - generic [ref=e90]:
      - generic [ref=e91]: 早安小馆
      - paragraph [ref=e92]:
        - button "包子" [ref=e93] [cursor=pointer]
        - generic [ref=e94]: ×1
        - generic [ref=e95]: 2块
      - paragraph [ref=e96]:
        - generic [ref=e97]: 共 2块
        - generic [ref=e98]: 找零 3块
      - generic [ref=e99]: 多谢
    - generic [ref=e100]:
      - button "麻烦" [ref=e101] [cursor=pointer]
      - button "你" [ref=e102] [cursor=pointer]
      - button "了" [ref=e103] [cursor=pointer]
      - button "谢谢" [ref=e104] [cursor=pointer]
    - button "继续招呼 →" [ref=e105] [cursor=pointer]:
      - text: 继续招呼
      - generic [ref=e106]: →
```

# Test source

```ts
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
  131 |       await expect(page.locator(".modal-backdrop")).not.toHaveAttribute("inert", "");
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
> 164 |     await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
      |                                                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
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
  232 |     await page.getByRole("button", { name: "开门迎客" }).click();
  233 |     await page.getByRole("group", { name: "今日客人", exact: true })
  234 |       .getByRole("button", { name: /^1桌 / }).click();
  235 |     await page.getByRole("dialog", { name: "1桌点餐" })
  236 |       .getByRole("button", { name: "包子", exact: true }).click();
  237 |     await expect.poll(() => page.evaluate(() => localStorage.getItem("junyan-waiter-pending-v1"))).toBeNull();
  238 |     await page.evaluate((invalid) => localStorage.setItem("junyan-waiter-pending-v1", invalid), invalid);
  239 |     await page.reload();
  240 |     await page.getByRole("button", { name: "开门迎客" }).click();
  241 |     await page.getByRole("button", { name: /本子/ }).click();
  242 |     await expect(page.locator(".journal-list")).toContainText("包子");
  243 |   });
  244 | }
  245 | 
  246 | test("a failed checkpoint write cannot override a later successful IndexedDB save", async ({ page }) => {
  247 |   await page.goto(withSkip("/?seed=42"));
  248 |   await page.getByRole("button", { name: "开门迎客" }).click();
  249 |   await page.getByRole("group", { name: "今日客人", exact: true })
  250 |     .getByRole("button", { name: /^1桌 / }).click();
  251 |   const bun = page.getByRole("dialog", { name: "1桌点餐" })
  252 |     .getByRole("button", { name: "包子", exact: true });
  253 |   await bun.click();
  254 |   expect(await page.evaluate(() => localStorage.getItem("junyan-waiter-pending-v1"))).not.toBeNull();
  255 |   await page.evaluate(() => {
  256 |     Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  257 |   });
  258 |   await page.getByRole("button", { name: "关闭词卡" }).click();
  259 |   await bun.click();
  260 |   await expect(page.getByRole("dialog", { name: "包子的意思" })).toBeVisible();
  261 |   await page.waitForTimeout(650);
  262 |   await page.reload();
  263 |   await page.getByRole("button", { name: "开门迎客" }).click();
  264 |   await page.getByRole("button", { name: /本子/ }).click();
```