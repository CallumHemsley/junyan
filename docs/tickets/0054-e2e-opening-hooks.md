---
id: 54
title: Prepare the test suite to start past the opening
status: todo
priority: high
type: chore
created: 2026-11-03
---

## Why

Once [[decisions/0004-hospital-opening]] ships, every new player sees the opening first, so every existing spec would start in the ward. About 30 tests run against the production preview, where no dev hook exists. Two specs also hard-code 85 WAV files, which breaks as soon as 0050 adds clips. This ticket makes the suite ready before the opening exists, with no behaviour change. It is PR 0054 in the plan `docs/plans/hospital-opening.md` (section PR 0054).

## Done when

- [ ] The app reads an `opening=skip` URL parameter, gated on `import.meta.env.DEV` only (not on `test=1`). Until 0055 lands, the parameter does nothing.
- [ ] A new `e2e/opening.ts` exports a helper that writes a seeded day-1 save before the page loads, copied from `installSave` in `e2e/save.spec.ts:4,46-65`.
- [ ] Every spec that runs against the production preview uses that helper: the production branch of `overlay-focus`, all 8 of `startup-focus`, `offline`, `overnight-offline`, `overnight-keyboard` at `:174`, `:198`, `:223` and `:239` (which assert that `__TEST__` is undefined), and `learning-help` at `:106`.
- [ ] Every dev spec passes `opening=skip`.
- [ ] `e2e/audio.spec.ts:196` and `e2e/overnight-offline.spec.ts:51` count WAVs from `public/audio/manifest.json` instead of the literal 85.
- [ ] `src/scene/record-demo.mjs:22` and `src/scene/renderer.visual.pw.ts:16` pass `opening=skip`.
- [ ] Unit tests: none needed beyond the existing suite. `pnpm test` and `pnpm build` are green.
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
