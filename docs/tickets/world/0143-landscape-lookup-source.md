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
