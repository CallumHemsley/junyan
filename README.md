# 君言 · 早安小馆

A Mandarin-learning waiter game. Walk to four regulars, hear their orders, recall food at the kitchen, deliver breakfast and give change. Later days introduce quantities and combinations. Tap any spoken word for pronunciation and meaning; the journal and progress save locally in IndexedDB.

## Run

Node 22 and pnpm:

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. Click tables and the kitchen to walk there, or use arrows/WASD and E/Space to interact. There is no time limit. All game text is simplified Chinese, apart from the opening's four voiced English premise lines (decision 0004); tap a word for pinyin, audio and food pictures. English glosses remain internal authoring metadata, never visible game text.

```sh
pnpm test
pnpm test:e2e
pnpm build
```

Playwright requires Chromium (`pnpm exec playwright install chromium`). The browser suite uses explicit ports 5173 (development) and 5177 (production preview) with `strictPort`. Use `VITE_PORT=5174 pnpm dev` for a separate worktree. Serve `dist/` on HTTPS or localhost for the installable PWA and offline cache; audio and content are bundled locally. No backend, account, live generation or paid API is needed.

## Characters and content

Four regulars use four local voices: Serena (林姐, warm neighbour), Yunxi (小李, office worker), Uncle_Fu (张老师, retired teacher), and Xiaobei (小周, student). Each has their own dialogue and Pixel Plays appearance. See [the cast](docs/characters.md) and [the content/audio workflow](docs/content-audio.md) to add lines, characters or voices. Native pronunciation review remains pending.

## Structure

- `src/game.ts`: deterministic rules over explicit state; no browser dependencies.
- `src/content/`: schema-validated JSON, segmented Mandarin tokens and offline audio references.
- `src/scene/`: restaurant rendered with Pixel Plays' actual software rasterizer. Chinese stays in DOM overlays.
- `src/App.tsx`: scene interactions, dialogue, kitchen, change, journal and save integration.
- `vendor/pixel-plays/`: upstream renderer, reference and MIT license. Upstream music is excluded.

`?test=1&seed=42` exposes `window.__TEST__` only in development builds. Production builds do not expose it.

The change in game direction is recorded in [decision 3](docs/decisions/0003-pixel-waiter.md). Backlog and design notes remain under [`docs/`](docs/).

## GitHub Pages

Play at https://callumhemsley.github.io/junyan/. The `gh-pages` branch contains only the compiled static game; its first push automatically started GitHub's Pages deployment. If Pages ever needs re-enabling, in repository **Settings → Pages**, select **Deploy from a branch**, **gh-pages**, **/(root)**, then **Save**. No source merge, backend, custom domain or paid service is required. Future source pushes do not automatically rebuild this publication; rebuild and publish the static branch when updating the shared game.

`pnpm build` uses relative asset URLs, so the same output works at `/` or `/junyan/`. To test the deployment subpath locally, run `pnpm exec vite preview --base /junyan/ --host 127.0.0.1 --port 5177 --strictPort` and open http://127.0.0.1:5177/junyan/. The production offline browser test uses this path and checks all four character voices plus word audio. Bundled dependency notices are distributed in `THIRD-PARTY-NOTICES.txt`.
