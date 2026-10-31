# Junyan mock-up brief (shared by all five directions)

## The game, in one paragraph

Junyan is a cozy Mandarin-learning game. The player runs a small Chinese breakfast stall (早餐店). Customers walk up and say what they want, in Mandarin only, voiced. The player hands over the right items and gives change. Right answers are confirmed by a receipt and the customer's reaction, never by an English message. There is no English anywhere in the game: no UI labels in English, no translations, no pinyin on screen (pinyin only appears when a word is tapped, which we are NOT showing in these mock-ups). Every Chinese line is made of tappable word tokens. A journal collects words the player has met. Four regulars return daily. A day has a time-of-day light (dawn, noon, evening) and ends with a tally. The hard constraints from the design: the dialogue is real text (never baked into an image), the price board is live UI, the scene is one screen (one background, waist-up customer portrait, dialogue box, item tray, price board, money), and the look must be cozy and genuinely good, not a lesson wearing a costume.

## What every mock-up must show (same state in every direction)

A single frozen moment, the second morning, noon light unless the direction says otherwise:

- Customer at the counter: 王奶奶 (Grandma Wang), warm, slow, about 70, grey bun, cardigan. She is saying: **老板早。一碗粥，一个馒头。** Render it as word tokens: 老板 / 早 / 。/ 一碗 / 粥 / ，/ 一个 / 馒头 / 。 Each token is a real element (a button or span inside a sentence) with a subtle touch target. The word **馒头** is the one new word today: mark it with a quiet visual difference (a faint underline or dot), no gloss.
- The price board, rendered as real text, always visible:
  包子 2块 · 馒头 1块 · 鸡蛋 2块 · 油条 2块 · 豆浆 3块 · 粥 大碗 5块 / 小碗 3块 · 饺子 8块 · 茶 3块
- The item tray or shelf the player picks from: 包子, 馒头, 鸡蛋, 油条, 热豆浆, 冰豆浆, 大碗粥, 小碗粥, 饺子, 茶. Draw each as a simple vector illustration (inline SVG or CSS shapes) with its name in Chinese under it. Two items are already placed on the counter for her: 小碗粥 and 馒头.
- Money: she has put down a 5块 note; the player must give 1块 change. Show coins or notes for 1块 and 5块 and 10块 somewhere sensible.
- A small receipt or ticket showing 粥 ×1 3块, 馒头 ×1 1块, 共 4块 (this is how the game confirms, after you act).
- Time and day: 第二天 and a sun or clock mark for noon, and a hint of who is waiting next (a silhouette or small portrait of 小李, an office worker in a hurry).
- The journal entry point (a book icon or tab) with a count: 本子 · 23 个词, or equivalent in Chinese. Keep labels minimal; icons where a label would be English.
- A cat, somewhere, asleep.
- Absolutely no English, no pinyin, no emoji in the artboard. Board notes to Callum go in your report, not in the artboard.

## Portraits and art

There are no image assets yet. Draw everything with inline SVG and CSS: the stall background, the steamers with steam, the customer portrait (stylised, waist-up, 3 to 6 shapes for face, hair, cardigan is fine), item icons. Keep shapes simple and confident; it is a mock-up of composition, palette, type and UI, not final art. Use `aria-hidden="true"` on decorative SVG. No raster images, no data URIs, no external images.

## Typography

Only Google Fonts via one `<link>` in `<helmet>` (css2 URL). Good Chinese choices on Google Fonts: Noto Sans SC, Noto Serif SC, ZCOOL XiaoWei, ZCOOL KuaiLe, Ma Shan Zheng, Zhi Mang Xing, Long Cang. Chinese dialogue text 28 px or larger; price board 20 px or larger; everything 4.5:1 contrast.

## The file format (strict; each rule fails silently if broken)

Each artboard is one self-contained HTML file in this exact shape:

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>Junyan · 早餐店 · [direction]</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap">
<style>
body{margin:0}
a{color:#7a4a1e}a:hover{color:#5a3410}
</style>
</helmet>
<div style="width: 1440px; height: 900px; box-sizing: border-box; position: relative; overflow: hidden; font-family: 'Noto Sans SC', sans-serif; background: #f3e9d8;">
  ... the whole screen, built from nested divs with INLINE styles ...
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"accent":{"editor":"color","default":"#c8502e"},"$preview":{"width":1440,"height":900}}'>
class Component extends DCLogic {
  renderVals() {
    return { accent: this.props.accent ?? '#c8502e' };
  }
}
</script>
</body>
</html>
```

Rules:
- Keep the `<script src="./support.js"></script>` line exactly. Keep the `<x-dc>`, `<helmet>`, and the `data-dc-script` block. `class Component extends DCLogic`, classic JS, no imports.
- All layout and colour as INLINE `style="…"` on elements (that is what the editor's panel edits). `<helmet><style>` holds only `body{margin:0}`, the `a` colours, and `@keyframes` if you animate steam (optional, keep it subtle).
- Lay out groups with flex or grid plus `gap`. Position absolutely only for the scene layers.
- `{{accent}}` may be used in a few inline styles where the accent colour appears (it is the one tweak). No other `{{…}}` holes needed; no expressions in holes.
- Close every element, quote every attribute, no `<iframe>`, no scripts building UI, no `innerHTML`.
- Interactive-looking controls are real elements: `<button type="button">` for tappable words and items, `<a href>` for links. Icon-only buttons get `aria-label` in Chinese.
- No emoji anywhere. Icons are inline stroke SVG.
- Desktop artboard root is exactly 1440×900. Phone artboard root is exactly 390×844 and `$preview` matches. The phone version is a re-layout of the same moment for a portrait touch screen (dialogue and tray reachable by thumb), not a shrink.

## Output

Write exactly two files with the Write tool, nothing else, at the absolute paths given in your task:
1. the desktop artboard (1440×900)
2. the phone artboard (390×844)

Then reply with: the direction's name, a four-line rationale (palette with hex values, type choices, layout idea, the one detail you are proudest of), and any question you would ask the founder. Do not verify, screenshot, or open anything.
