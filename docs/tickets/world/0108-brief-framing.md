---
id: 108
title: Frame the active furniture brief on narrow screens
status: done
priority: high
type: bug
created: 2026-11-06
---

## Why

The normal-input gameplay audit completed both briefs but found that the second window and editable floor were offscreen on a narrow view. The player's stationary position kept the camera at the first bay while editing disabled movement, leaving the grid as a workaround for missing scene context.

## Done when

- Opening and switching furniture briefs show the relevant window and usable floor, with native placement previews inside the actual space left by the interaction panel on phone and desktop.
- Derive presentation focus from explicit project state and geometry. Preserve player position, collision, saved progress, accurate production picking, panel/word-card recovery, reduced motion and closed-room exploration framing.
- Actual native pointer/touch placement in both bays, brief switching and close/reopen prove the change; focused geometry/framing checks catch the original cropped context. No new unvoiced visible copy.

## Notes

- Centrally reserved after 0107. Owner GPT-6.1 Sol High; branch `codex/0108-brief-framing`, worktree `/private/tmp/junyan-world-brief-framing`, strict ports 5558/5559.
- Lease a small pure reading-room view-focus selector/tests, a narrow generic WorldViewport presentation-focus input/camera hookup, App wiring, and corresponding production-camera test callers. No map/anchor movement, actor resize, teleport, progression/schema or dependency changes.
- Propose the exact interface before implementation. Account for actual panel dimensions, valid placement extents and the window's height; do not just move the existing interaction anchor again or add a screenshot-specific pixel offset.
- 0107 independently owns target-label wording. Keep all raw QA private and do not push or merge from the worker.
- Candidate: the pure feature view includes the active brief's whole legal floor/furniture envelope, authored window and selected ghost. `WorldViewport` fits that geometry inside the actual visible canvas/main area beside or above the panel; the player's position, occlusion input and saved state stay independent.
- Window frame dimensions are shared with the existing painter through a small pure geometry module. Closing the project restores exploration framing. Lookup preserves the last useful presentation area while editing is inert, then remeasures on close; it does not promise playable space behind the word card.
- Focused native-pointer/touch proof uses a declared fresh-project save at the real desk, then completes both bays through actual floor input at 390×664, 390×844 and desktop, including instruction expansion, lookup recovery and panel reopen. Separate existing journeys cover normal navigation, retries and persistence. Keep doing until root cross-review and final integrated verification.

- Root acceptance: independent source review returned the original1.25 furniture envelope as too low for actual1.7 chair backs; writer corrected both full-floor and selected-ghost bounds before intake. Combined source passed663tests across102files, TypeScript/build, and11 desktop/phone chapter/target cases with one intentionally duplicate desktop-size case skipped. Native placement/recovery covers390×664 and390×844. No player move, fake support or actor scaling was introduced.
