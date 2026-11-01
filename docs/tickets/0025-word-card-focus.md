---
id: 25
title: Fix word card focus and in-game home navigation
status: done
priority: high
type: bug
created: 2026-11-01
---

## Why

The independent Astra reviewer reproduced focus escaping an open word card and Escape dismissing both the card and its parent table dialog.

The reviewer also confirmed that the production brand link uses `/` and leaves the `/junyan/` game for an unrelated personal homepage. Include this small navigation correction in the same App UI change.

## Done when

- Opening a word card moves focus into it; Tab and Shift+Tab stay within the top overlay.
- Escape closes only the word card, returning focus to its triggering word; subsequent Escape can close the parent dialog.
- The home link resolves to the deployed game base path and keeps production navigation within `/junyan/`.
- Opening Help or another overlay cancels pending walk arrivals, so a stale table arrival cannot replace it.
- Receipt word buttons remain at least 44×44px, including on phone.
- Relevant browser regressions pass with all test output muted, and no audio logic changes overlap ticket 0021.

## Notes

- Writer: Codex implementation sub-agent; branch `codex/0025-word-card-focus`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-ea80c1c5` (base `28b2c3e`).
- Local strict ports: dev `5183`, production preview `5187`; worktree-only Playwright configuration, Chromium `--mute-audio`, no system-volume changes.
- Completed: separate parent/word focus lifecycles (including focus after initial save loading), top-overlay Tab/Shift+Tab trapping, inert underlying controls, top-only Escape, explicit word-trigger restoration, and a brand link using Vite's configured base. Overlay opening cancels pending movement/arrival callbacks. Receipt word targets now have a 44px minimum width as well as height.
- Added confirmed scope from parent: Help interrupted by a table-4 arrival (`output/playwright/usability-review/help-interrupted-by-arrival.png`) and receipt word `包子` measuring 36×44px. Only the `.receipt button` CSS rule is owned here; save loading and playback logic remain out of scope.
- Verification: all 38 rules/content/navigation/renderer tests passed (`pnpm test`); application and new browser-spec TypeScript checks passed; production build with `pnpm exec vite build --base /junyan/` passed. Only existing dependency annotation warnings from Zod were emitted.
- Muted browser verification: 22 passed, 2 intentionally skipped (the header Help button is hidden on phone; its visible footer equivalent is tested). This includes desktop + Chromium phone, development + production nested focus/keyboard/pointer regressions, all five word-entry surfaces (dialogue, receipt, kitchen, tray, journal), both visible Help controls, production brand navigation, receipt bounding boxes, and the existing complete four-customer/change/journal/day-progression journey on both sizes. Console/page errors were checked by nested-focus regressions and existing journeys; none occurred. All Chromium launches used `--mute-audio`; system volume was unchanged.
- Reproduce locally: build as above, then `JUNYAN_PREVIEW_URL=http://127.0.0.1:5187/junyan/ pnpm exec playwright test --config output/playwright/0025.config.ts e2e/overlay-focus.spec.ts e2e/waiter.spec.ts --grep 'word card|Help cancels|production home|receipt word|collect, recall' --timeout=45000 --reporter=line`. The ignored local config replaces only server ports and adds muted launch options; no shared configuration changes are committed.
- Evidence: `output/playwright/0025-verified.log`, `output/playwright/0025-rules.log`, `output/playwright/0025-build.log`; inspected screenshots in `output/playwright/0025/`, including `desktop-production-keyboard-word-focus.png`, `phone-production-keyboard-word-focus.png`, `phone-production-footer-help-stable.png`, and `phone-receipt-targets.png`.
- Learned: a child overlay must not restart its parent's focus lifecycle; pointer triggers must be captured explicitly for touch restoration. Inert backgrounds alone do not provide keyboard wrapping. Initial async readiness also needs to trigger parent focus setup. Pending arrival callbacks belong to the overlay lifecycle, not just the navigation controls.
- Scope preserved: no audio pipeline, save-load implementation, renderer, content, dependency, lockfile, schema, or launch-configuration changes; all 67 WAVs remain unchanged. No push, PR, deployment, or AWS operation. Parent integrates and cross-reviews before publication; no independent review or full unrelated browser matrix was run here.
- Reserved centrally by parent on `codex/0018-character-voices`; writer records own worktree, branch and strict port.
- Reviewer evidence: `output/playwright/usability-review/desktop-word-focus.png`, HEAD `536f9d9`, App.tsx parent focus effect around 190–220 and word card around 748–783.
- Reproduction: open table 1, tap first greeting word; focus lands on underlying table close, Tab reaches underlying replay, Escape closes both overlays.
- Owner: Sol 6.1 medium implementation worker. All tests must be silent without changing system volume.
- Additional production evidence: `output/playwright/usability-review/production-home-leaves-game.png`; App.tsx brand link around line 326.
