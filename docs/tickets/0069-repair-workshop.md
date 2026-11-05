---
id: 69
title: Build the reversible repair workshop slice
status: blocked
priority: high
type: feature
created: 2026-11-05
---

## Why

Deliver the selected apartment-building ensemble while preserving the hospital and breakfast restaurant.

## Done when

- [x] Implement the bounded vertical slice described in the domain plan and central contract, with visible action consequences, repeatable choices and reversible mistakes.
- [x] Pure rules tests and build pass; existing opening, customers, change and journal journey remains green.
- [ ] Feature journey, reload/migration, offline voices/assets and clean console are evidenced; phone and desktop screenshots visually inspected.
- [ ] Mandarin content is segmented/schema validated, voiced offline, tappable and journalled; pixel art remains consistent and controls accessible.
- [ ] Different agent reviews without edits; resolved findings and reviewable PR are recorded. Central lead merges only after independent review, polish and integrated verification; then verifies main.

## Dependencies and ownership

Central ledger: [[plans/neighbourhood-coordination]]. Depends on published 0065 contract; integrated completion depends on 0066 and existing shared-file lease handoffs.
One writer/branch/cloud checkout and strict port as assigned there. No edits outside assigned files. Domain lead refines this ticket before implementation.

## Notes

Estimate: 1–2 engineering days for a bounded slice plus review; synthesis access may block completion.
Owner, worker ID, branch, checkout, exact commands, evidence and remaining blockers must be recorded here by writer.

## Refined implementation scope

See [the detailed workshop plan](../plans/neighbourhood-repairs.md). Two reversible physical repairs, a loose lamp fitting and a toy with loose lead and exhausted cell. Test outcomes come from physical state. Repaired objects remain on the shelf; repeat practice grants no extra reward. Exactly one derived `repairs.stool` gift after both returns.

Worker `/root/repair_writer`, branch `codex/0069-repair-workshop`, cloud `/workspace/junyan-repairs`, dev 5469 strict, preview 5569 strict. Exclusive feature files, repair audio, repair e2e, evidence/0069, ticket and repair plan. Estimate 1–2 engineering days plus audio/review. Shared integration belongs to 0066. Model requested by coordinator is GPT-6.1 Sol medium. No nested writer.

Required offline voice synthesis is currently blocked by missing Linux runtime/models. Feature work proceeds with an explicit pending asset manifest and cannot be marked complete until synthesis, listening and integrated checks pass.

## Code-ready verification

Built both reversible repairs, free switching with both partial states retained, guarded fresh tests/returns, practice and one derived gift. Existing pixel rasterizer supplies the enlarged lamp/toy and resident workshop. DOM controls support touch/keyboard, word lookup/recovery seams, 28px speech, 44px targets, focus after return and reduced motion.

Full rules suite passed 180 tests. Build passed. Isolated browser checks passed 9 tests on desktop, 390px and 320px phones. Existing hospital/restaurant/change/journal/day/save checks passed all 6 desktop/phone tests. See [verification evidence](../../evidence/0069/progress.md). Voice inventory currently fails with 64 missing required clips. Integrated route, feature IndexedDB reload/migration, word-card/journal and offline voice checks remain pending. Final independent UI review is parent-owned. Do not mark done until those gates close.

After rebase onto main `5c90ba4`, the full required sequence passed again. Rules now pass 181 tests because main added a ward regression. Build, 9 isolated repair checks and 6 existing desktop/phone journey/save checks passed. Rebase removed inherited coordination commits and preserved central review wording.

## Independent final review

Central lead opened [draft PR 22](https://github.com/CallumHemsley/junyan/pull/22). Independent final reviewer confirmed the isolated browser journeys, rules, 44px targets, 28px text and desktop/390px/320px layouts with clean console. Reviewer found that powered loosening incorrectly requested tightening. The focused correction changes the shared feedback to neutral “先关掉。” and tests both powered directions. Review recheck remains pending. Audio and integrated route/save/offline checks still block completion.
