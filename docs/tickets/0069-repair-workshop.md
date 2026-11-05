---
id: 69
title: Build the reversible repair workshop slice
status: done
priority: high
type: feature
created: 2026-11-05
---

## Why

Deliver the selected apartment-building ensemble while preserving the hospital and breakfast restaurant.

## Done when

- [x] Implement the bounded vertical slice described in the domain plan and central contract, with visible action consequences, repeatable choices and reversible mistakes.
- [x] Pure rules tests and build pass; existing opening, customers, change and journal journey remains green.
- [x] Feature journey, reload/migration, offline voices/assets and clean console are evidenced; phone and desktop screenshots visually inspected.
- [x] Mandarin content is segmented/schema validated, voiced offline, tappable and journalled; pixel art remains consistent and controls accessible.
- [x] Different agent reviews without edits; resolved findings and reviewable PR are recorded. Central lead merges only after independent review, polish and integrated verification; then verifies main.

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

Central lead opened [draft PR 22](https://github.com/CallumHemsley/junyan/pull/22). Independent final reviewer confirmed the isolated browser journeys, rules, 44px targets, 28px text and desktop/390px/320px layouts with clean console. Reviewer found that powered loosening incorrectly requested tightening. The focused correction changes the shared feedback to neutral “先关掉。” and tests both powered directions. The focused independent recheck passed at `36b0b77`. Audio and integrated route/save/offline checks still block completion.

## Final independent isolated review passed

Central lead relayed PASS from `/root/repair_final_check` at `36b0b77`. The reviewer passed all 13 repair rules tests, drove powered loosening, replay and retest at desktop 1440px and phone 390px/320px, verified unchanged physical jobs/completion/recovery, and observed a clean console. The reviewer inspected fresh screenshots and independently reproduced the neutral warning audio-plan hash. `/root/repair_ui_review` passed the remaining isolated behavior; its only finding is resolved.

Every worker below was requested as GPT-6.1 Sol with medium reasoning. Writer was `/root/repair_writer`. Rules reviewers were `/root/repair_rules_review` and `/root/repair_rules_rereview`. Full UI reviewer was `/root/repair_ui_review`; focused final reviewer was `/root/repair_final_check`. Read-only design workers were `/root/repair_design_a` and `/root/repair_design_b`. Cloud capability probe was `/root/cloud_probe`. These requested model settings are recorded without claiming independent runtime model verification.

[Draft PR 22](https://github.com/CallumHemsley/junyan/pull/22) remains blocked by 64 required natural voice clips and shared 0066 route/save/offline/cross-feature verification. Feature IndexedDB reload, old-save migration, shared lookup/journal recovery and day preservation still need integrated evidence. Isolated review PASS does not complete these gates. Ticket stays `blocked`. Central lead owns integration and any eventual merge.


## Local completion

Finished locally after the cloud handoff. The integrated game preserves restaurant progress across apartment, courtyard, workshop and rooftop visits, with shared journal, gifts and saves. Genuine offline voices are committed. Candidate `7b27ca4` passed 308 unit tests, a production build, 12 real production/offline cases and 34 original media/word-card regressions, all with zero skips or failures. Separate reviewers checked source, state recovery, real native playback and exact audio provenance. Actual gameplay demos with audio are verified. See [[evidence/0075/README]] for scope and receipts.

Automated signal, transcript and recorded-playback checks do not certify native Mandarin pronunciation. A separate listening pass is tracked by 0076; no native-listening approval is claimed.
