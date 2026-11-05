---
id: 66
title: Integrate saved neighbourhood locations and shared learning
status: doing
priority: high
type: feature
created: 2026-11-05
---

## Why

Deliver the selected apartment-building ensemble while preserving the hospital and breakfast restaurant.

## Done when

- [ ] Implement the bounded vertical slice described in the domain plan and central contract, with visible action consequences, repeatable choices and reversible mistakes.
- [ ] Pure rules tests and build pass; existing opening, customers, change and journal journey remains green.
- [ ] Feature journey, reload/migration, offline voices/assets and clean console are evidenced; phone and desktop screenshots visually inspected.
- [ ] Mandarin content is segmented/schema validated, voiced offline, tappable and journalled; pixel art remains consistent and controls accessible.
- [ ] Different agent reviews without edits; resolved findings and reviewable PR are recorded. Central lead merges only after independent review, polish and integrated verification; then verifies main.

## Dependencies and ownership

Central ledger: [[plans/neighbourhood-coordination]]. Depends on published 0065 contract; integrated completion depends on feature tickets 0067–0070 and existing shared-file lease handoffs.
One writer/branch/cloud checkout and strict port as assigned there. No edits outside assigned files. Domain lead refines this ticket before implementation.

## Notes

Estimate: 1–2 engineering days for a bounded slice plus review; synthesis access may block completion.
Owner, worker ID, branch, checkout, exact commands, evidence and remaining blockers must be recorded here by writer.


### Foundation work

Owner `/root/foundation_writer`. Branch `codex/0066-neighbourhood-foundation`. Cloud worktree `/workspace/junyan-foundation`. Strict development port `5466`.

The coordinator approved the optional embedded envelope. All maintenance leases are closed after main `dd3cc11`; 0066 is the sole shared integration writer. The four pinned domain heads are imported into this branch only. Published integrated source `64c2031` implements production routes, concrete per-feature save recovery, atomic journal transitions, optional idempotent gifts, restaurant-only days, and actual-location ambience presence. Both cumulative earnings labels and all accepted existing audio are preserved.

Current Node 22 verification passes 308 tests and the production build. Previous integrated desktop/phone runs passed eight development and ten production cases, with explicitly labelled feature-media fixtures and separate genuine offline/missing-asset checks. Independent final-source review passes. The original 72-case batch passed 69, with three failures resolved through independently reviewed fixture/contract corrections and a real one-line receipt focus repair; six affected reruns and two final stronger keyboard checks pass. The final production build passes; the 308-test suite is scoped to prior `b89dead`, with pure modules unchanged. See [checkpoint](../evidence/0066/checkpoint.md) for exact commands, inspected four-scene screenshots, artifacts, source boundaries, and review history.

Draft [PR 19](https://github.com/CallumHemsley/junyan/pull/19) remains incomplete: the real audit finds 278 absent feature voice clips. No placeholder assets, actual audible feature demos, public preview URL, offline feature-speech acceptance, or main feature merge is claimed. The cloud synthesis network/pipeline and human listening/play-quality gates remain open.
