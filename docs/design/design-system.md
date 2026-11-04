---
title: 君言 Junyan design system, 晨雾 Morning Steam
version: 0.1.0
created: 2026-10-31
tags: [design, design-system, tokens]
source: "[[mockups/brief]]"
---

# 君言 Junyan: 晨雾 Morning Steam

A breakfast stall on a cold morning: an 早餐店 with steam rising off the baskets, rice paper and dough, and one vermilion chop. The system is unhurried, steamy and a little hand-stamped. It comes from the polished Morning Steam mock-ups (`mockups/morning-steam-desktop.dc.html`, `mockups/morning-steam-phone.dc.html`), and when this page and the mock-ups disagree, the mock-ups win. The tokens live in `tokens.json`, and `tokens.css` is generated from it.

## Content fundamentals

**Chinese only.** No English, no pinyin. Every string is simplified Chinese and every spoken line is voiced. The one exception is the hospital opening's voiced English premise lines ([[decisions/0004-hospital-opening]]). Pinyin appears only when a word is tapped, beside its picture, and the tap is logged as a lookup ([[decisions/0001-first-language]]).

**Labels are what the stall would say.** 找零, not 退款按钮. 本子, not 词汇表. 下一位 小李, not 队列. 第二天, not 第 2 关. If a label would need a word the player hasn't met, it becomes an icon.

**Icons for verbs, words for nouns.** Replay is a speaker (`aria-label="再听一遍"`), continue a chevron (`继续`), the day's light a sun arc. Food, money, people and the 本子 are always written, because they are the vocabulary. Every icon-only control has a Chinese `aria-label`.

**Confirmation lives in the world.** A right order earns a receipt (粥 ×1 3块, 馒头 ×1 1块, 共 4块), the 多谢 chop and the customer's reaction. Nothing ticks or turns green. A wrong order gets a puzzled customer, not a red cross. Numbers are plain and tabular: 2块, 23 个词.

## Visual foundations

### The ramp

| Token | Morning | What it's for |
|---|---|---|
| `surface-card` | #fbf7ef | Every panel the player reads |
| `surface-raised` | #f4eee4 | Tiles and money inside a panel |
| `surface-control` | #f1eadd | The round replay button |
| `surface-sunk` | #e8dfcf | Wells, avatar disc, a pressed word |
| `hairline` | #241d16 at 10% | The 1px ring on every panel, token underlines |
| `text-primary` | #241d16 | Everything the player must read, plus the 继续 fill |
| `text-secondary` | #5e554a | Speaker, counts, icons |
| `text-muted` | #7b7266 | 24px and up only |

The neutrals lean toward rice paper and dough. Nothing here is a cool grey except `window-cool`, the cold street seen through the window. `jade`, `steam`, `window-cool` and `lamp-glow` are for the scene only and never colour a control.

### The accent rule

`accent` (#b5462b) is the vermilion of a shop chop, and **it only ever touches words.** It has two jobs:

1. `word-marker`: the dot over a new word, 馒头 in 王奶奶's 老板早。一碗粥，一个馒头。
2. `chop`: the 多谢 stamp that confirms the order on the receipt.

`accent-ink` sets vermilion characters under 24px, such as a new word's headword in the 本子. Vermilion is never a button, a tick, a progress bar or a "correct". The next action is always neutral: 继续 is a `text-primary` circle.

### Evening

The same stall at dusk, under lanterns, not a grey dark mode: panels become lantern-lit tea wood (#2b221a), text becomes rice paper (#f4ead8), steam warms to #f6dcb4, the window goes indigo, and vermilion brightens to #dd6f4f. Every role and rule carries over. Morning is the default.

### Type

**Noto Sans SC** (400, 500) sets the interface. **Noto Serif SC** (500) sets what is spoken or hand-written: the customer's line and the price board. The chop is Serif 600.

| Style | Desktop | Phone |
|---|---|---|
| `spoken` / `spoken-compact` | 40/60 | 32/44 |
| `board` | 20/32 | 20/28 |
| `title` (receipt total) | 20/28 | 16/24 |
| `body` | 16/24 | 14/20 |
| `label` | 14/20 | 14/20 |
| `caption` | n/a | 12/16 |

Spoken Chinese is never smaller than 28px. Board prices are never smaller than 20px. Every figure is tabular.

### Space and shape

A 4px grid, `space-4` to `space-48`. The gutter is `space-24` (screen edge to panel) on desktop and `space-16` on phone; siblings inside a panel sit `space-8` apart. Four radii, one per kind of object: `radius-panel` 16, `radius-chip` 10, `radius-tile` 8 (tiles, money, slots), `radius-receipt` 4 (paper). Round buttons are circles. One shadow, `shadow-panel`, always with a 1px `hairline` ring; chips use the flatter `shadow-chip`. Nothing else casts a shadow.

### Motion

Only the steam loops (a 6s rise, staggered). Everything else moves once, in answer to the player, on one easing, `cubic-bezier(0.22, 1, 0.36, 1)`: **120ms** for a press, **200ms** for an item sliding to the counter or a coin landing, **320ms** for the receipt arriving and the chop pressing down (1.08 to 1, no bounce). Under `prefers-reduced-motion: reduce` the steam holds still at about 50% opacity and transitions become fades of 120ms or less.

## Iconography

Icons are Lucide-style line icons: a 24 viewBox drawn at **20px**, stroke **1.75**, round caps and joins, no fill, in `text-secondary`. The one exception is 继续, whose chevron is drawn in `surface-card` on its `text-primary` circle. The set is small: a speaker for replay, a chevron for continue, a book for the 本子, and a sun arc for the time of day. Food and people are illustrations, not icons. **No emoji anywhere**, including in content.

## Usage rules

- A panel is `surface-card` + `radius-panel` + 1px `hairline` ring + `shadow-panel`, and nothing else.
- Something picked up is `surface-raised` + `radius-tile`, no border.
- A slot to fill is transparent with a dashed `slot-edge`, labelled in `text-secondary` (找零).
- A tile whose item is on the counter goes transparent with a dashed `hairline-strong` edge, art at 35%, its word in `text-secondary`.
- Word tokens are real buttons with a 2px `hairline` underline. A newly recovered word adds the `word-marker` dot and nothing else (no colour, no bold, no gloss). An unrecovered word wears the fog style, which ticket 0056 adds to the tokens.
- One dark filled control per screen: the 继续 circle. Replay sits beside it in `surface-control`.
- `text-muted` never sets text under 24px.
- Touch targets are 44px minimum; a 40px phone circle gets a 44px hit area.
- No Chinese inside images. The engine renders every sign, price and line.

## Using it in code

**Custom properties.** Every token is a CSS custom property named `--<token-name>`: `var(--surface-card)`, `var(--word-marker)`, `var(--space-24)`, `var(--radius-tile)`, `var(--shadow-panel)`. Type styles expand to `--<style>-font-size`, `--<style>-line-height` and `--<style>-font-weight` (for example `--spoken-font-size`). The families are `--font-sans` and `--font-serif`. Motion is `--ease` plus `--duration-press` (120ms), `--duration-move` (200ms) and `--duration-arrive` (320ms). Import `docs/design/tokens.css` (or its copy in the app) once, at the root. Never hard-code a hex value that has a token. The exceptions are illustration fills: item art, coins, notes and the scene plate.

**Themes.** Set `data-theme="morning"` or `data-theme="evening"` on `<html>`. Morning is the default when the attribute is missing. Only colour tokens change between themes. The day cycle switches the attribute; the scene plate is regraded separately.

**Fonts.** Load both faces with one stylesheet link and `display=swap`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500&family=Noto+Serif+SC:wght@500;600&display=swap">
```

Set `font-family: var(--font-sans)` on `body` and `var(--font-serif)` only on the spoken line, the price board and the chop. Use `font-variant-numeric: tabular-nums` anywhere a number appears. For the PWA, self-host subsetted files later. Don't add weights beyond 400 and 500 (sans) and 500 and 600 (serif).

**Rules an implementer must not break.**

1. **The engine renders all Chinese text.** No characters inside images, sprites or canvas bitmaps. Dialogue, the board, item names and the receipt are live DOM text built from word data, so every word can be a token.
2. **The accent only touches words.** `accent`, `accent-ink`, `word-marker` and `chop` are used for the new-word dot, the 多谢 chop and vermilion headwords. They never colour a button, a state, a tick, a border on a control, or feedback of any kind. Never add a success green.
3. **Touch targets are at least 44×44px.** That covers tokens, tiles, money, the replay and 继续 buttons, and any chip that becomes a button. Pad the hit area if the visible shape is smaller.
4. **Respect reduced motion.** Under `prefers-reduced-motion: reduce`, stop the steam loop (static at about 50% opacity), drop translate and scale, and keep only fades of 120ms or less. Use only `--ease`, and only the three durations.
5. **Every icon-only control has a Chinese `aria-label`**, and decorative SVG is `aria-hidden="true"`.
6. **No English, pinyin or emoji in the game UI.** The opening's English premise lines are story text, not UI, and decision 0004 bounds them. Pinyin appears only in the tap-to-reveal word card.
