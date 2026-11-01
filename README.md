# 君言 · 早安小馆

A Mandarin-learning waiter game. Walk to four regulars, hear their orders, recall food at the kitchen, deliver breakfast and give change. Later days introduce quantities and combinations. Tap any spoken word for pronunciation and meaning; the journal and progress save locally in IndexedDB.

## Run

Node 22 and pnpm:

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. Click tables and the kitchen to walk there, or use arrows/WASD and E/Space to interact. There is no time limit. All game text is simplified Chinese; pinyin and English glosses appear only on word lookup.

```sh
pnpm test
pnpm test:e2e
pnpm build
```

Playwright requires Chromium (`pnpm exec playwright install chromium`). The browser suite uses explicit port 5173 with `strictPort`. Use `VITE_PORT=5174 pnpm dev` for a separate worktree. Serve `dist/` on HTTPS or localhost for the installable PWA and offline cache; audio and content are bundled locally. No backend, account, live generation or paid API is needed.

## Structure

- `src/game.ts`: deterministic rules over explicit state; no browser dependencies.
- `src/content/`: schema-validated JSON, segmented Mandarin tokens and offline audio references.
- `src/scene/`: restaurant rendered with Pixel Plays' actual software rasterizer. Chinese stays in DOM overlays.
- `src/App.tsx`: scene interactions, dialogue, kitchen, change, journal and save integration.
- `vendor/pixel-plays/`: upstream renderer, reference and MIT license. Upstream music is excluded.

`?test=1&seed=42` exposes `window.__TEST__` only in development builds. Production builds do not expose it.

The change in game direction is recorded in [decision 3](docs/decisions/0003-pixel-waiter.md). Backlog and design notes remain under [`docs/`](docs/).
