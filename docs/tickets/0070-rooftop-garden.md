---
id: 70
title: Build the rooftop garden slice
status: blocked
priority: high
type: feature
created: 2026-11-05
---

## Why

Deliver the selected apartment-building ensemble while preserving the hospital and breakfast restaurant.

## Done when

- [ ] Implement the bounded vertical slice described in the domain plan and central contract, with visible action consequences, repeatable choices and reversible mistakes.
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

## Refined slice and acceptance

Plan: [[plans/neighbourhood-garden]]. The requested plan filename takes precedence over the ledger's initial rooftop-garden alias.

- Restore a small roof, arrange three pots and shade through keyboard/touch controls, inspect dry/wet soil and choose care. No quiz gate.
- Wet-soil watering, waiting and dry-soil watering produce distinct visible results after authoritative restaurant day progression. Wrong care recovers without death or absence penalties.
- Persist positions, care, progress and day cursor through the central envelope. Re-entry cannot double-settle days or duplicate garden.planter.
- Export exactly the shared view/reducer/content contract. No shared-file edits or dependency changes.
- Record real unit, build and browser outcomes. Keep audio, integrated navigation/save/journal/offline checks blocked if unavailable. An isolated harness is not integrated completion.
- Independent reviewer reports defects without edits. Writer fixes and obtains fresh review on material changes. Central lead serializes the now-authorized merge once quality gates pass.

Owner: garden lead, then one GPT-6.1 Sol medium implementation owner. Branch codex/0070-rooftop-garden. Cloud checkout /workspace/garden-0070. Vite 5470 with --strictPort; preview 5471. Estimate 1–2 days plus synthesis and integration review. Dependency 0065 is published at da361c3. Dependency 0066 and existing shared leases remain open.

Implementation worker /root/garden_writer. Requested model GPT-6.1 Sol, medium. Cloud /workspace/garden-0070, branch codex/0070-rooftop-garden. Strict Vite 5470 and preview 5471. Existing plan and refinements retained.

Draft PR [20](https://github.com/CallumHemsley/junyan/pull/20) is parent-managed. First published rules/design commit 6b0bb47. Feature-local browser harness is development-only and does not close shared navigation, IndexedDB, journal, offline or voice gates.

Latest product head 19acc46 is based on main 5c90ba4. Final checks use Node 22.23.4. All 185 unit tests, build, isolated garden desktop/phone 4/4 and existing hospital/restaurant/save desktop/phone 6/6 pass. Final screenshots inspected. Audio manifest has 91 pinned jobs with 82 missing assets. Shared integration, actual offline garden playback/listening and independent integrated review remain open. Evidence: `evidence/0070/verification.md` and `runtime.json`.

Independent review findings P2 rainy shaded-soil advice and P3 readonly vocabulary props are fixed in 3adf7e2 and 19acc46. Independent recheck passed at b12db58. The unchanged [review report](../../evidence/0070/independent-review.md) records scoped implementation PASS and full release BLOCKED. Supporting reviewer results and the historical P2 reproduction screenshot are preserved under `evidence/0070/review/`.

Release remains blocked by 82 missing pinned voice jobs, actual listening and offline playback, and 0066 integration. Central lead retains conditional merge authority and post-merge verification. No merge or deployment performed.
