---
id: 138
title: Improve workshop portrait scene framing
status: done
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

- Completed after independent approval of source freeze `59ac1816056bf2c498be57b3273beb59e4d488ed`, relative to merged main `6d11a876`. Owner workshop framing writer; branch `codex/0138-workshop-phone-framing`; worktree `/private/tmp/junyan-world-workshop-phone-framing`; strict ports 5624/5625. Raw QA remains private under `/private/tmp/junyan-world-private-qa/0138`; publication and merge are root-owned.
- Learned: the portrait room-overview threshold is narrowly missed (324.5 versus 320 canvas units on 390×844), selecting a lower local follow window. Optional actual floor/wall geometry now bounds only vertical translation; native scale 11, horizontal follow, other maps and nonportrait behavior stay unchanged. Rendering, pointer inversion and the target cue share the camera; the journey helper supplies the same frame.
- The independent early gate retained one clear closed-phone lamp gain and five ties; eleven of fifteen primary before/candidate images are byte-identical. Matched original phone/desktop/short-phone captures are immutable. Supplemental tall/landscape baseline comparisons transparently substitute only the original compiled camera module in the unchanged native renderer. Independent final inspection covered original native short/tall/landscape, both panels, benches and edge views; no inspected edge view lost the player.
- Writer checks at the source freeze passed: 667 rules tests across 103 files with two workers, TypeScript/build, and eight desktop/phone opening-service, physical-world and normal/reduced workshop journeys, with clean explicit console/error checks. The initial unconstrained rules run hit the existing actor-readability five-second timeout. Independent review passed 21 focused checks across five files, compared 207,424 default-camera outputs and framed projection/inverse round trips, and verified all 174 provenance hashes (including 142 images) with zero mismatches. Exact reports: `/private/tmp/junyan-world-private-qa/0138/independent-final-review.md` and `final-provenance.json`.
- The gain remains narrow: the opposite bench can lie outside portrait horizontal follow; entrance/apron lower backdrop, detached action card and pale/crowded panel copy remain. The 960-CSS-height overview centers the painted envelope, moving it down about 45 CSS pixels. Scripted journeys and stills do not certify continuous-playback polish, frame pacing, physical Safari or broad AAA quality.

Integration requirement: retain root reader's **outer** `current.presentationFrame ? frameCamera(...frameArea...)` override and append the optional workshop argument only to its `explorationCamera` fallback. No unfinished chapter dependency was copied and this isolated approval does not certify the combined reader branch. Recheck that merged call site and run its required combined checks before merge.
