---
id: 54
title: Prepare the test suite to start past the opening
status: done
priority: high
type: chore
created: 2026-11-03
---

## Why

Once [[decisions/0004-hospital-opening]] ships, every new player sees the opening first, so every existing spec would start in the ward. About 30 tests run against the production preview, where no dev hook exists. Two specs also hard-code 85 WAV files, which breaks as soon as 0050 adds clips. This ticket makes the suite ready before the opening exists, with no behaviour change. It is PR 0054 in the plan `docs/plans/hospital-opening.md` (section PR 0054).

## Done when

- [x] The app reads an `opening=skip` URL parameter, gated on `import.meta.env.DEV` only (not on `test=1`). Until 0055 lands, the parameter does nothing.
- [x] A new `e2e/opening.ts` exports a helper that writes a seeded day-1 save before the page loads, copied from `installSave` in `e2e/save.spec.ts:4,46-65`.
- [x] Every spec that runs against the production preview uses that helper: the production branch of `overlay-focus`, all 8 of `startup-focus`, `offline`, `overnight-offline`, `overnight-keyboard` at `:174`, `:198`, `:223` and `:239` (which assert that `__TEST__` is undefined), and `learning-help` at `:106`.
- [x] Every dev spec passes `opening=skip`.
- [x] `e2e/audio.spec.ts:196` and `e2e/overnight-offline.spec.ts:51` count WAVs from `public/audio/manifest.json` instead of the literal 85.
- [x] `src/scene/record-demo.mjs:22` and `src/scene/renderer.visual.pw.ts:16` pass `opening=skip`.
- [x] Unit tests: none needed beyond the existing suite. `pnpm test` and `pnpm build` are green.
- [ ] Live check: run `pnpm test:e2e` (123 tests) and the audio (61), save (14), recovery (16) and visual (8) configs on this ticket's ports. All pass with the same counts as before.
- [ ] Perf budget: the main e2e suite's wall time stays within 10% of the baseline run on this branch.

## Notes

- Depends on: 0047.
- Owns: `e2e/opening.ts` (new), the spec files in `e2e/` listed above, `src/scene/record-demo.mjs`, `src/scene/renderer.visual.pw.ts`, and the few lines in `src/App.tsx` near `:20-22` that read the URL parameter.
- Must not touch: the rest of `src/App.tsx` (0055 owns it next), `src/scene/renderer.js`, `src/content/`, `public/audio/`, `playwright*.config.ts` ports.
- Changes to shared Playwright configs are serialized. 0055 raises the journey timeout later.
- Ports: `JUNYAN_DEV_PORT=5314`, `JUNYAN_PREVIEW_PORT=5315`, strict. Set the same values for the save, audio, recovery and visual configs if they read a port.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D7. `opening=skip` is gated on `import.meta.env.DEV` only and lands on today's first screen. Production specs use the shared `e2e/opening.ts` seeded-save helper. (The `__TEST__.reset()` part of D7 lands in 0055.)
- Pointers: `src/App.tsx:20-22` test mode; `src/App.tsx:346-363` `window.__TEST__`; `playwright.config.ts:11-12` port variables; main journey `e2e/waiter.spec.ts:69-112`.

### Progress (2026-11-04)

- Owner: Claude Code, PR owner in the opening autopilot stack. Branch `claude/0054-e2e-opening-hooks` on `claude/0047-opening-rules-docs`. Ports `5314`/`5315`. `playwright.save.config.ts` still hard-codes `5184`.
- `pnpm test:e2e`: 127 passed, 4 skipped. The parent link has 119 passed and 4 skipped. The 8 added tests are the four `e2e/opening-hooks.spec.ts` cases on desktop and phone.
- Audio config 61 passed, save config 14 passed, recovery config 16 passed. Vitest 110 passed. `pnpm build` is green.
- Not run here: the visual config, because `src/scene/playwright.visual.config.ts` holds fixed ports `5182`/`5186` that another agent may use, and the perf medians. One head run of `pnpm test:e2e` took 627 s wall time. No parent run on this machine gives a baseline, so the perf box stays open for the root's verify lanes.

### What was learned

- `seedDayOne` opens `audio/manifest.json` on the target origin, so it writes IndexedDB without running app code. WebKit renders that JSON page and accepts the write, so the recovery config's WebKit projects pass.
- A seeded `createGame(content, 42)` save boots the same as fresh storage today, because the app always opens on the help panel. The production specs notice the seed only once 0055 shows the opening to players with no save.
- `overnight-keyboard` at `:198`, `:223` and `:239` load the dev server, so they take `withSkip` per the plan, not `seedDayOne`.
- `src/scene/renderer.visual.pw.ts` and `src/scene/record-demo.mjs` use the literal `opening=skip`, not `withSkip`. `tsconfig.json` type-checks `src`, and an import from `e2e/` would pull the Playwright helpers into the app's type check.
- The preview case in `e2e/opening-hooks.spec.ts` compares the accessibility tree of `?opening=skip` with a plain load in a fresh context, not a fixed screen. It stays valid when 0055 changes what a fresh player sees.
