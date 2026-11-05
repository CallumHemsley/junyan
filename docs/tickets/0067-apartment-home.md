---
id: 67
title: Make a freely furnished apartment home playable
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
One writer/branch/cloud checkout and strict port as assigned there. No edits outside assigned files. Detailed specification: [[plans/neighbourhood-apartment]]. Implement its starter bundle, free placement/rotation/store/undo, reversible colour choice and resident suggestions. Owned files are src/features/apartment/**, public/audio/apartment/**, e2e/apartment.spec.ts and docs/evidence/0067/**. Add rules tests for geometry and idempotent gifts, schema/content/audio verification and a deterministic isolated harness while App lease is pending. Exact voice generation is required for completion; report unavailable synthesis.

## Notes

Estimate: 1–2 engineering days for a bounded slice plus review; synthesis access may block completion.
Owner, worker ID, branch, checkout, exact commands, evidence and remaining blockers must be recorded here by writer.

Worker: `/root/apartment_writer`; requested model `gpt-6.1-sol`, reasoning `medium` (runtime has no independent model introspection). Branch `codex/0067-apartment-home`, cloud checkout `/workspace/junyan-apartment`, strict Vite port `5467`.

Checkpoint implementation is present; release is blocked by 47 missing new voice references and pending shared route/save integration. See `docs/evidence/0067/README.md` for exact runs, screenshot inspections, ownership boundaries and remaining checks. No feature completion or native playback claim.

Draft PR: https://github.com/CallumHemsley/junyan/pull/21 . Final Node 22 verification passed 184 Vitest tests, TypeScript, production build and ten desktop/phone browser tests. Independent no-edit pixel review reproduced and confirmed the keyboard focus fix. New voices, integrated feature reload/migration and offline playback remain incomplete.


## Local completion

Finished locally after the cloud handoff. The integrated game preserves restaurant progress across apartment, courtyard, workshop and rooftop visits, with shared journal, gifts and saves. Genuine offline voices are committed. Candidate `7b27ca4` passed 308 unit tests, a production build, 12 real production/offline cases and 34 original media/word-card regressions, all with zero skips or failures. Separate reviewers checked source, state recovery, real native playback and exact audio provenance. Actual gameplay demos with audio are verified. See [[evidence/0075/README]] for scope and receipts.

Automated signal, transcript and recorded-playback checks do not certify native Mandarin pronunciation. A separate listening pass is tracked by 0076; no native-listening approval is claimed.
