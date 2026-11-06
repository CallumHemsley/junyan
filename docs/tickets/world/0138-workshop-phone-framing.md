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
