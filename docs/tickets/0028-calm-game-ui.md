---
id: 28
title: Simplify the interface around the restaurant
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why

Callum finds the information around the restaurant overwhelming and explicitly requested another implementation agent to revamp it. The restaurant and the next useful action should have a clear visual hierarchy; supporting information should be available when needed.

## Done when

- The game scene is the primary focus on desktop and phone, with substantially less repeated always-visible copy and competing panels.
- Day/progress, carried food, customers, Help and journal remain discoverable without a dashboard of equally weighted details. Recall difficulty must not be weakened by exposing orders outside their existing dialogue flow.
- Existing Mandarin-only, tap-to-learn, voiced Help, focus/overlay lifecycle, 44px controls and reduced-motion behavior are preserved.
- Real Pixel Plays rendering and the four authored voices stay in place; no game-rule, content/schema, audio playback, save or engine changes are needed for the layout revamp.
- Appropriate unit/build and muted browser journeys pass; desktop, 390px and 320px screenshots are inspected, console is clean, and keyboard/touch access to newly disclosed UI is verified.

## Notes

- Active writer: Codex gpt-6.1-sol (medium), branch `t3/calm-game-ui`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-2ed67d28`. Strict ports: dev 5191, preview 5192. Started 2026-11-01; inspecting the integrated baseline before a scene-first layout pass.

- Reserved centrally by parent on `codex/0018-character-voices`; owner Sol 6.1 medium implementation worker in an isolated worktree.
- The reviewed audio fix is now integrated in `src/App.tsx` and `src/audio/playback.ts`; UI ownership is limited to layout/markup/styles and disclosure state. Preserve the existing playback wrapper and effects, save loader, movement logic and fixed focus/inert/one-layer Escape behavior.
- Baseline includes tickets 0025/0026/0027, accepted renderer 0022 and reviewed audio lifecycle 0021. Use strict isolated ports 5191 (dev) / 5192 (preview). All browser launches must be explicitly silent, without changing system volume.
- Cross-review and parent integration required before publication. Do not push, open a PR or deploy.

## Implementation and verification

- Completed 2026-11-01 on the owner/branch/worktree and ports recorded above. The restaurant is now the main surface: removed the slogan/header stack, dashboard sidebar, duplicate Help entry, decorative learning note and page footer. Customer identity/state stays in a compact four-customer strip, with an always-discoverable, wrapping carried-food tray underneath.
- One neutral primary service action follows the current phase: checkout first, then the last visited waiting table when carrying food, kitchen when an order is waiting, otherwise the next seated customer. This affordance reads only phase, active table and tray count; it never reads accepted order contents or checks whether carried food matches. All scene and customer shortcuts remain available.
- Day progress stays visible; earnings and difficulty expand from the day button. Initial Help shows only the authored welcome and opening action. Its disclosure retains every authored line, illustration, word lookup and replay control. The same visible header Help and journal controls work on phone and desktop.
- Existing playback/save/movement/focus/keyboard/dispatch code, from word state through payment handling, was checked byte-for-byte against the parent and is unchanged. No audio, engine, rules, save, content, schema, assets, dependencies or launch configuration changed.
- Verification: `pnpm test` **85/85**; `pnpm build` passed (existing dependency annotation warnings only); `git diff --check` clean. Final isolated browser run: `pnpm exec playwright test --config=output/playwright/0028/playwright.config.ts` **71/71**, zero failures/flaky/skipped. The ignored harness copies the repository tests with only import/evidence-path rewrites, using dev 5191 and `/junyan/` preview 5192, never the shared default ports.
- Browser coverage includes the full four-customer service/change/journal/day progression on desktop and phone, all authored Help tokens/audio and real saved reload, offline production audio, keyboard/touch disclosure and trigger restoration, nested inert/focus/one-Escape behavior, reduced motion, full trays, no horizontal overflow, and the last-visited-table affordance. Native audio lifecycle regressions passed in strict-autoplay Chromium and iPhone WebKit; every browser launch had `--mute-audio`, and WebKit used the existing valid silent PCM responses. Normal journeys had clean consoles; deliberately failed audio requests remain intentional negative-test evidence.
- Visually inspected `output/playwright/0028/{desktop,phone,small}-playable.png` at 1440/390/320 CSS pixels, welcome/expanded Help and populated-tray captures, plus 844px landscape. Desktop keeps the empty-tray service UI within a 1000px viewport; 320px and landscape use ordinary vertical scrolling, never shrink the scene to overlapping controls. Learned: disabling the next-action trigger during walking loses focus restoration, so it stays enabled like the existing scene/customer controls. Collapsed Help unmounts its detail controls so the unchanged focus trap cannot wrap into hidden buttons.
- Evidence and final logs are ignored under `output/playwright/0028/`: `results.json`, `final-run.log`, `build.log`, screenshots and the reproducible isolated config/suite. The supplied parent `0022-v3-integrated` capture directory was absent in this worktree; current baseline screenshots were captured locally before editing instead (`before-*.png`). No audible quality assessment, real-device or screen-reader session was attempted. Parent cross-review/integration is still required; nothing was pushed or published.

## Parent cross-review resolution

- Astra independently checked the integrated layout at 1440/390/320 widths and eight scoped browser cases. One P2 found: the primary action had a generic overriding accessible name even when its visible phase changed.
- Removed that override so the native button name follows the visible phase, with the decorative arrow already hidden from assistive technology. Added seated, kitchen, serving and checkout accessible-name regressions, including activation through the phase-specific name. Parent combined verification follows before publication.

- Parent verification after the label fix: all 85 unit tests and production build pass; muted combined browser run passes 63 checks with one policy-only skip, including phase-specific accessible names, complete service journeys, saves, Help, keyboard focus, touch sizing and production offline audio. Desktop 1440px and phone 390px captures inspected. Existing audio native-policy suite is checked separately before publication.
