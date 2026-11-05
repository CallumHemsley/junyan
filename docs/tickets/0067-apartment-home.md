---
id: 67
title: Make a freely furnished apartment home playable
status: todo
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
- [ ] Different agent reviews without edits; resolved findings and draft PR are recorded. Do not merge main.

## Dependencies and ownership

Central ledger: [[plans/neighbourhood-coordination]]. Depends on published 0065 contract; integrated completion depends on 0066 and existing shared-file lease handoffs.
One writer/branch/cloud checkout and strict port as assigned there. No edits outside assigned files. Detailed specification: [[plans/neighbourhood-apartment]]. Implement its starter bundle, free placement/rotation/store/undo, reversible colour choice and resident suggestions. Owned files are src/features/apartment/**, public/audio/apartment/**, e2e/apartment.spec.ts and docs/evidence/0067/**. Add rules tests for geometry and idempotent gifts, schema/content/audio verification and a deterministic isolated harness while App lease is pending. Exact voice generation is required for completion; report unavailable synthesis.

## Notes

Estimate: 1–2 engineering days for a bounded slice plus review; synthesis access may block completion.
Owner, worker ID, branch, checkout, exact commands, evidence and remaining blockers must be recorded here by writer.
