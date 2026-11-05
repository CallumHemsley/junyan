# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ambience.spec.ts >> foreground resource failure releases ducking and direct replay recovers
- Location: e2e/ambience.spec.ts:240:1

# Error details

```
Error: apiResponse.body: Response has been disposed
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
      - button "本子 0" [ref=e14] [cursor=pointer]:
        - generic [ref=e17]: 本子
        - generic [ref=e18]: "0"
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
          - generic "招呼客人 0 / 4 桌" [ref=e36]: 0 / 4 桌
        - generic [ref=e37]:
          - generic [aria-hidden] [ref=e38] [cursor=pointer]
          - button "1桌" [pressed] [ref=e39] [cursor=pointer]
          - button "2桌" [ref=e42] [cursor=pointer]
          - button "3桌" [ref=e45] [cursor=pointer]
          - button "4桌" [ref=e48] [cursor=pointer]
          - button "取餐" [ref=e51] [cursor=pointer]
        - button "去厨房取餐" [ref=e53] [cursor=pointer]:
          - text: 去厨房取餐
          - generic [aria-hidden] [ref=e54]: →
      - region "今日客人和托盘" [ref=e55]:
        - group "今日客人" [ref=e56]:
          - button "1桌 林姐 等候上菜" [ref=e57] [cursor=pointer]:
            - generic [ref=e58]: 1桌
            - generic [ref=e59]:
              - generic [ref=e60]: 林姐
              - generic [ref=e61]: 等候上菜
          - button "2桌 小李 等候点餐" [ref=e62] [cursor=pointer]:
            - generic [ref=e63]: 2桌
            - generic [ref=e64]:
              - generic [ref=e65]: 小李
              - generic [ref=e66]: 等候点餐
          - button "3桌 张老师 等候点餐" [ref=e67] [cursor=pointer]:
            - generic [ref=e68]: 3桌
            - generic [ref=e69]:
              - generic [ref=e70]: 张老师
              - generic [ref=e71]: 等候点餐
          - button "4桌 小周 等候点餐" [ref=e72] [cursor=pointer]:
            - generic [ref=e73]: 4桌
            - generic [ref=e74]:
              - generic [ref=e75]: 小周
              - generic [ref=e76]: 等候点餐
        - group "托盘" [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]: 托盘
            - generic [ref=e80]: 0 / 6
          - button "厨房" [ref=e81] [cursor=pointer]:
            - text: 厨房
            - generic [aria-hidden] [ref=e82]: ↗
  - dialog "1桌点餐" [ref=e84]:
    - button "关闭" [ref=e85] [cursor=pointer]: ×
    - generic [ref=e86]:
      - generic [ref=e87]: 1桌 · 林姐
      - button "再听一遍" [active] [ref=e88] [cursor=pointer]
    - generic [ref=e91]:
      - button "早上好" [ref=e93] [cursor=pointer]
      - button "听招呼" [ref=e94] [cursor=pointer]
    - generic [ref=e97]:
      - button "我" [ref=e98] [cursor=pointer]
      - button "想" [ref=e99] [cursor=pointer]
      - button "要" [ref=e100] [cursor=pointer]
      - button "一" [ref=e101] [cursor=pointer]
      - button "个" [ref=e102] [cursor=pointer]
      - button "包子" [ref=e103] [cursor=pointer]
    - paragraph [ref=e104]: 点字听词 · 记住后去厨房取餐
    - generic [ref=e105]:
      - button "去厨房" [ref=e106] [cursor=pointer]
      - button "上菜 →" [ref=e107] [cursor=pointer]:
        - text: 上菜
        - generic [ref=e108]: →
```

# Test source

```ts
  1  | import { expect, type Page, type Route } from "@playwright/test";
  2  | 
  3  | export function silentWav(bytes: Buffer) {
  4  |   const silent = Buffer.from(bytes);
  5  |   expect(silent.toString("ascii", 0, 4)).toBe("RIFF");
  6  |   expect(silent.toString("ascii", 8, 12)).toBe("WAVE");
  7  |   let bits = 0;
  8  |   for (let offset = 12; offset + 8 <= silent.length;) {
  9  |     const size = silent.readUInt32LE(offset + 4);
  10 |     const kind = silent.toString("ascii", offset, offset + 4);
  11 |     if (kind === "fmt ") {
  12 |       expect(silent.readUInt16LE(offset + 8)).toBe(1);
  13 |       bits = silent.readUInt16LE(offset + 22);
  14 |     }
  15 |     if (kind === "data") {
  16 |       expect(bits).toBeGreaterThan(0);
  17 |       silent.fill(bits === 8 ? 128 : 0, offset + 8, offset + 8 + size);
  18 |     }
  19 |     offset += 8 + size + (size % 2);
  20 |   }
  21 |   return silent;
  22 | }
  23 | 
  24 | export async function silentResponse(route: Route, delay = 0) {
  25 |   const response = await route.fetch({ headers: { ...route.request().headers(), range: "bytes=0-" } });
> 26 |   const body = silentWav(await response.body());
     |                                         ^ Error: apiResponse.body: Response has been disposed
  27 |   if (delay) await new Promise(resolve => setTimeout(resolve, delay));
  28 |   await route.fulfill({ status: 200, contentType: "audio/wav", body });
  29 | }
  30 | 
  31 | export async function probeAudio(page: Page) {
  32 |   await page.addInitScript(() => {
  33 |     const probe = window as any;
  34 |     probe.__audioProbe = [];
  35 |     probe.__audioElements = [];
  36 |     probe.__ambienceProbe = [];
  37 |     probe.__ambienceElements = [];
  38 |     probe.__lastClickAt = 0;
  39 |     document.addEventListener("click", () => { probe.__lastClickAt = performance.now(); }, true);
  40 |     const original = HTMLMediaElement.prototype.play;
  41 |     HTMLMediaElement.prototype.play = function () {
  42 |       const row = {
  43 |         src: this.src, at: performance.now(), active: navigator.userActivation?.isActive,
  44 |         sinceClick: performance.now() - probe.__lastClickAt,
  45 |         muted: this.muted, volume: this.volume, status: "pending",
  46 |       };
  47 |       if (new URL(this.src, location.href).pathname.includes("/audio/ambience/")) {
  48 |         probe.__ambienceProbe.push(row);
  49 |         if (!probe.__ambienceElements.includes(this)) probe.__ambienceElements.push(this);
  50 |       } else {
  51 |         probe.__audioProbe.push(row);
  52 |         probe.__audioElements.push(this);
  53 |         probe.__lastAudio = this;
  54 |       }
  55 |       return original.call(this).then(
  56 |         () => { row.status = "playing"; },
  57 |         error => { row.status = error.name; throw error; },
  58 |       );
  59 |     };
  60 |   });
  61 | }
  62 | 
```