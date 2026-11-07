---
id: 138
title: Improve workshop portrait scene framing
status: doing
priority: high
type: bug
created: 2026-11-07
---

## Why

Independent district review finds about193pixels of empty backdrop above the workshop in an original phone fixture, reducing the visible room's presence. Improve actual portrait composition while preserving readable actors and gameplay.

## Done when

- Reproduce the original native phone view and inspect camera/math/actual room bounds before proposing a minimal framing change. Avoid a renderer rewrite, arbitrary fixed pixel offsets or shrinking actors.
- Show matched original phone/desktop and short/tall-phone views for an independent early image gate. Keep player, target furniture and useful work area visible with overlays open and closed.
- Preserve world/canvas picking agreement, real keyboard/touch paths, reduced-motion behavior, pause/lookup/focus and other maps' cameras. Game geometry/content/rules remain unchanged.
- Cross-review exact source; run meaningful camera/picking tests, rules/types/build, actual service/world journeys and native console-clean inspection before merge.

## Notes

- Owner workshop framing writer; branch codex/0138-workshop-phone-framing; worktree /private/tmp/junyan-world-workshop-phone-framing; strict ports5624/5625.
- Base merged main6d11a876. Independent evidence /private/tmp/junyan-world-private-qa/district-critic/review.md and provenance.json. New raw QA private /private/tmp/junyan-world-private-qa/0138.
- Shared camera and WorldViewport changes require root coordination; unfinished reader branch has additional framing support. Propose seam before edits and avoid unrelated changes. No broad AAA claim.

- Diagnosis: the painted workshop narrowly exceeds the portrait room-overview threshold (324.5 versus320 canvas units on390×844). Local follow then places the apex~193CSS px below the viewport. Optional explicit floor/wall geometry now bounds vertical translation; horizontal follow and native scale11 stay unchanged.
- Early gate: matched private before/candidate captures at1440×1000,390×844 and390×667, player at lamp8,10.8, toy20.8,10.8 and entrance15,25, with activity panels open/closed. Source and camera/picking regression ready for independent retention review; broader verification follows only after that gate.
- Independent early gate retained the narrow closed-phone gain (one clear candidate win, five ties); it did not approve a broad visual-quality claim. Private gate: /private/tmp/junyan-world-private-qa/0138/blind-gate-01/independent-final.md.
- The live journey helper now supplies the same workshop frame as rendering. Added native normal/reduced-motion regression covering keyboard movement, touch ground routes, both benches, rear/side edges, entrance, target cue agreement, panels, lookup pause/focus,390×667/844/960,598/600 breakpoints and844×390 landscape. The saved fixture only enters the workshop; subsequent movement/interactions use real input.
- Verification before final review:667 rules pass with two workers; explicit TypeScript/build pass. Unconstrained rules run hit the existing actor-readability5s timeout under concurrent load. Original camera outputs without the optional frame match3528 baseline invocations exactly. Broad final journeys run against the next clean source freeze; ticket remains doing until independent final source/runtime review.
- Remaining limitations: the opposite bench is outside portrait horizontal follow, entrance lower backdrop and detached action card remain, and no every-view improvement or AAA-quality claim is made. Taller room-overview framing centers the painted envelope, so it moves down about45CSS px instead of applying the tall phone's closed-view upward shift. Supplemental tall/landscape baseline comparison transparently substitutes only the original compiled camera module in the browser; actual original phone/desktop/shortphone captures are immutable.
