# Local application verification

Owner `/root/local_integration`. Worktree `/private/tmp/junyan-neighbourhood`. Branch `codex/0066-neighbourhood-foundation`. Base `986be57`, which contains the clean cloud handoff `840c21f`. This evidence accompanies the courtyard continuity fix in the same commit.

## Changes and reproduction

Entering the courtyard previously produced no initial speech event. Activating its crouch action with the keyboard removed the focused button and left focus on `BODY`. A real Chromium probe reproduced both defects before the fix.

The courtyard now plays its current saved feedback when it mounts. When an action removes the focused control, focus moves to the first available action. Existing action controls retain focus when they remain mounted. The focused reference is transient UI state. Saved game rules and schemas are unchanged.

The existing keyboard journey now asserts arrival playback and focus after crouch, wait, approach, follow, and reunion. A separate Chromium probe observed the next focus targets as wait, approach, follow, reunite, and begin.

## Checks

All commands use the existing root `node_modules` through a local symlink. No install or lockfile change is claimed.

```sh
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH pnpm test
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH pnpm build
JUNYAN_DEV_PORT=5466 JUNYAN_PREVIEW_PORT=5566 pnpm exec playwright test e2e/neighbourhood.spec.ts e2e/neighbourhood-save.spec.ts e2e/waiter.spec.ts e2e/overnight-keyboard.spec.ts --reporter=line
```

Node 22.23.4 passes all 308 tests and the production build after the fix. The build retains the existing two Zod annotation warnings and bundle-size warning.

The browser batch passes all 36 desktop and phone cases under local Node 26.12.1. It covers the mandatory opening, restaurant orders and change, all four locations, furniture placement and rejected placement, cat reunion, both repairs, garden care and confirmation, three gifts, day two, journal lookup, reload, old saves, corrupt feature recovery, keyboard continuity, and pending-save failures. Development uses strict port 5466. Production uses strict port 5566 and `/junyan/`.

Against those running servers, a temporary config inherited the normal projects and ports while omitting server startup. The stronger courtyard keyboard journey passes both projects. Apartment, repairs, and garden checks pass 14 cases. Their two pre-existing synthesis-dependent integration placeholders remain skipped. Those isolated harnesses check controls, 44px targets, reduced motion, placement, reversible mistakes, and recovery callbacks. The temporary config is excluded from the commit.

## Inspected screenshots and limits

The eight PNGs here come from the actual complete integration journey at desktop 1440×1000 and iPhone 13 dimensions. All eight were opened and inspected locally. They show coherent pixel scenes, readable dialogue, visible navigation, and no horizontal page overflow. Phone views require vertical scrolling. Apartment inventory intentionally scrolls horizontally within its own strip. Garden dialogue is below the scene on desktop.

The broad browser run began before the courtyard patch and completed after it. Desktop integration screenshots precede the patch. Phone screenshots include it. The patch does not alter scene rendering or styles. The separate courtyard regressions and Node 22 checks run after the patch.

The complete integration journey and migration tests still disclose replacement PCM responses for absent feature WAVs. The separate missing-voice test verifies native failure. These passing cases establish interaction and save behavior only. Browsers launch muted. Genuine feature speech, local offline speech, listening review, and audible demos remain blocked on ticket 0073. Convert the neighbourhood suites to real audio success checks after those assets merge, retaining unavailable-audio feedback through an explicit injected failure.

No production source includes replacement clips or playback interception. No audio, cast, restaurant renderer, content JSON, dependencies, or lockfiles changed. Independent review and final voiced acceptance remain pending.
