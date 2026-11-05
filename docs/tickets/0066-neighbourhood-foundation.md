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

The coordinator approved the optional embedded neighbourhood envelope. See [integration plan](../evidence/0066/integration-plan.md) for the state comparison, runtime flow, throughput checkpoint, and exact shared patches. Existing shared-file leases remain blocked until explicit handoff.

Standalone contracts, per-feature save validation, navigation, gift idempotency, and the DOM token line are implemented. Independent `/root/foundation_review` found no concrete defects in the first standalone unit at `8939b42` and reran all ten focused tests successfully. The content-registry unit and integrated verification remain incomplete pending independent review and shared-file handoff. Draft [PR 19](https://github.com/CallumHemsley/junyan/pull/19) records the current scope.
