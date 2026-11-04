# Hospital opening prototype: contract

Throwaway prototype. Never imported by the app. Opened straight from disk (`file://`), no build, no server, plain browser JS (no modules, no framework).

The question it answers: the game opens in a Chinese hospital, the player once spoke Mandarin and has lost it. English explains the premise, then the game turns Chinese and words "come back" as the player uses them. **How should English hand over to Chinese?** Three variants:

- **A. The doctor's English.** The doctor explains in English, then says they'll stop, and speaks Chinese to the nurse. From then on the world is Chinese.
- **B. The inner voice.** Nobody else speaks English. The player's own thoughts are English, and recovered words swap into Chinese inside the thoughts ("He wants 水").
- **C. The memory card.** A short English card over black, then the scene is Chinese only.

A **fog** toggle works on all three: unrecovered Chinese tokens look soft (muted, slightly blurred), recovered ones are crisp and get the vermilion new-word dot the first time.

## Files and owners (one writer each)

| File | Owner | What |
|---|---|---|
| `CONTRACT.md` | coordinator | this file |
| `content.js` | content agent | `window.CONTENT`, the script |
| `art.js` | art agent | `window.ART`, the SVG scene and items |
| `index.html`, `app.js` | engine agent | page, styles, state machine, switcher |
| `verify.mjs`, `shots/` | verify agent | Playwright drive and screenshots |

`index.html` loads, in order: `../../docs/design/tokens.css`, `art.js`, `content.js`, `app.js`.

## `window.CONTENT`

```js
window.CONTENT = {
  words: { '水': { pinyin: 'shuǐ', gloss: 'water' }, ... },   // every non-punctuation zh token must be a key
  cast: { doctor: { name: '王医生' }, nurse: { name: '护士' }, grandpa: { name: '老爷爷' }, aunt: { name: '阿姨' } },
  items: ['水', '苹果', '香蕉'],                                 // tray tiles, keys of words and of ART.item
  variants: { A: { label, intro: [Step] }, B: {...}, C: {...} },
  shared: [Step],                                               // runs after the variant's intro
}
```

A zh line is a string of tokens separated by single spaces, e.g. `'年轻人 ， 请 给 我 水 。'`. Punctuation tokens are `，。！？……` and need no `words` entry.

`Step` (every step may also carry `enter: [castId]`, `leave: [castId]`, `recover: [hanzi]` applied when the step completes, and `only: 'A'|'B'|'C'` to restrict it to one variant):

- `{ type: 'card', lines: [string] }` English lines on a dark full-panel card, then continue.
- `{ type: 'say', who, en: string }` English speech in the dialogue panel.
- `{ type: 'say', who, zh: string }` Chinese speech, tokens tappable (pinyin on tap, spoken via speechSynthesis zh-CN when available).
- `{ type: 'think', text: string }` the player's English thought. `{水}` placeholders render the word's `gloss` until recovered, then the hanzi.
- `{ type: 'request', who, zh, want, wrongZh, okZh }` Chinese request, tray of `items` shown, tapping `want` hands it over and shows `okZh`, a wrong item shows `wrongZh` and waits.
- `{ type: 'reply', options: [{ zh, answerZh, recover }] }` the player answers by tapping a Chinese chip; the speaker answers with `answerZh` (speaker is the last `who` seen).
- `{ type: 'end' }` end card: `第一天 · 早安小馆` and the recovered words.

## `window.ART`

- `ART.room(present: string[]) -> string` SVG markup, `viewBox="0 0 800 450"`, a hospital room with the player's bed, the next bed (老爷爷), a window, bedside table. Draws each cast id in `present` (doctor, nurse, grandpa, aunt). No text in the SVG.
- `ART.item[hanzi] -> string` SVG markup, `viewBox="0 0 64 64"`, for every entry of `CONTENT.items`.

## Engine hooks (for verify)

- URL params `?variant=A|B|C&fog=1|0`. Defaults `A` and `1`.
- `data-testid`: `variant-A`, `variant-B`, `variant-C`, `fog-toggle`, `restart`, `continue` (advances card/say/think steps and the post-request/post-reply line), `token` (each zh token, with `data-hanzi` and `data-recovered="true|false"`), `item-<hanzi>`, `reply-<hanzi>`, `end-card`, `memory-count`.
- Root element `#app` carries `data-step-index` and `data-step-type`.
- `window.__SPIKE__.state()` returns `{ variant, stepIndex, type, recovered: string[], done: boolean }`.

## Design

Use `docs/design/tokens.css` variables and read `docs/design/design-system.md`. Spoken Chinese in `--font-serif`, never under 28px. Accent vermilion only on the new-word dot. No green, no ticks, no emoji. 44px touch targets. Respect `prefers-reduced-motion`. Layout works at 390px and 1280px widths. Switcher chrome may be English (it is dev chrome).
