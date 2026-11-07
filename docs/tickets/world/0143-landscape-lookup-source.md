---
id: 143
title: Keep the lookup source visible in short landscape play
status: doing
priority: high
type: bug
created: 2026-11-07
---

## Why

Interface142 QA reproduces an existing844x390 lookup layout where the source word lies at y56-100 while the visible main region startsy76. Native scrollIntoView cannot fully expose it, although the wordcard itself fits and source returns focus. A language-learning lookup should keep its source context accessible.

## Done when

- Reproduce the exact state from142's private coverage evidence/handoff; distinguish source visibility while lookup is open from restored context after close.
- Make the smallest coherent landscape lookup-layout/scroll correction on a separate branch after the stable142 source, preserving44px targets, wordcard visibility, original game camera contract, input pause and both focus returns.
- Verify actual effective visible/hit regions and native scroll access at844x390 plus short/tall portrait and desktop, no overflow, using a meaningful regression that fails the current layout.
- Cross-review exact source and native frames; affected journeys/types/build pass. Preserve DOM word tokens and pinyin-on-tap; no gameplay/content/renderer change.

## Notes

- Centrally reserved by root from discovered142 QA; not an exception to its in-progress art gate. Owner/branch/worktree/ports assigned when142 freezes. Status todo until writer starts.
- Evidence private /private/tmp/junyan-world-private-qa/0142; new143 QA stays private under corresponding143directory. No new public raw exports.
- Known metrics are from both before/after shell min-height control; clipping predates142 and must not be falsely attributed to its theme coverage fix.
- Owner: interface/lookup writer; branch codex/0143-landscape-lookup-source; worktree /private/tmp/junyan-world-landscape-lookup-source; strict ports 5639/5640. Prepared from stable 142 freeze a11f96a083049c8d52685a9bf9bdbd658aad49e9, with the central ticket reserved in 9f53c965 and an independent copy of existing dependencies.
- Preparation only: private 142 handoff inspected; no 143 runtime or test edits. Waiting for the parent's follow-up after the independent 142 critic slot completes before implementation starts. Ticket marked doing at the parent's explicit preparation instruction.
- Implementation authorized after 142's independent approval. Native browser regression reproduced the exact failure before CSS edits: a 44px DOM source had only 23.203125px effective visible height at 844×390, even after native scroll-to-source. The private red trace/screenshot/log retain that failure.
- Cause: the lookup constrains main to 90px, while the contextual panel still uses viewport-sized height/bottom anchoring and a fixed heading above its separate scrollport. During short-height lookup only, constrain that panel to main and scroll it as one region. The initial correction passed desktop and touch-phone; a separate 568×320 test then exposed a 20px main/16px visible source, so reserve a minimum 48px main (44px target plus the two 2px edges). Main/card/canvas sizing at the original 844×390 stays unchanged; smaller screens use the measured minimum without changing renderer rules.
- Focused matrix passes all 16 desktop/phone cases (29.1 seconds): 844×390 night/morning, 844×320, 568×320, 320×568, 390×667, 390×960 and 1440×1000. It checks every dialogue word's effective clipped area and corner hit regions after native scrolling, real word-source switching, card fit, movement pause, both Escape focus returns and no document overflow. Validated entry fixtures are explicit; they are not earning-journey claims. Production build/TypeScript pass in this test startup with existing dependency-annotation and chunk-size warnings. All raw artifacts stay under explicit private 0143 QA.
- The manually scrolled matrix was not accepted as completion: original native frames showed that compact reflow initially hid the clicked source completely. Strengthened the regression to require a full effective 44px source and working corner hit points immediately after lookup, before any test-driven scrolling; it failed with 0px on the CSS-only freeze. At the parent's explicit contextual-component lease, added a five-line UI effect that instantly scrolls the current connected `returnFocusTo` word into view on suspension/source changes, checking `hasAttribute` for the empty data attribute. The original captured invoking-element ref and close-focus handling stay unchanged. The exact strengthened landscape case now passes; native scrolling remains an additional check.
- The CSS-only broader run was explicitly stopped and its partial log preserved before this effect edit; it is not counted as passing. Bounded unit run (`--maxWorkers=2 --testTimeout=15000`) passes all 677 tests across 106 files in 22.73 seconds. The 48px main minimum changes measured main only when viewport height is below 348px; original 844×390 geometry is unchanged. Final frozen-source matrix/journeys and native camera/normal-layout comparisons follow before independent review. Reader code is intentionally absent; root owns the active-brief 844×390/568×320 combined measured-area check.
