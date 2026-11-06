---
id: 86
title: Lighting, weather, water and foliage
status: doing
priority: high
type: feature
created: 2026-11-05
---

## Why

Part of the active connected-world program. Replace fixed diorama travel with immersive world-space play while preserving the accepted game.

## Done when

The scope in `docs/world-program/ledger.md` is implemented against `docs/world-program/contract-v1.md`, integrated by 0078, and independently verified on the current head. Include desktop and phone evidence, reachable-content proof and relevant rule tests. An isolated map preview alone does not complete this ticket.

## Notes

- Owner: builder 9, GPT-6.1 Sol medium. Thread 01a1ae20-d945-75c9-a467-153692bd804e.
- Branch: `codex/0086-atmosphere`. Cloud checkout /workspace/junyan. Durable objective: docs/evidence/world/0086/goal.md; no native create_goal tool exposed. Strict port 5488.
- Exclusive paths: src/world/atmosphere/*.
- Also owns this ticket and `docs/evidence/world/0086/`. Do not edit shared contracts or other owners' files.
- Publish map seam requests and integration instructions in the owned evidence directory.

- Reusable module, depth adapter and reflection hooks published. Draft PR https://github.com/CallumHemsley/junyan/pull/29. Current full suite 324 passed; atmosphere 11. Production study desktop/phone motion, browser reduced-motion and cost evidence: docs/evidence/world/0086/progress.md.
- ACTIVE: foundation wiring, actual connected-map traversal and independent review remain. No integrated quality PASS.

- Follow-up: canonical named phases documented; explicit material/emissive boundary and exact emitters added. Native paintWorld snapshots for five maps in three phases inspected. Bridge cutouts and connected-water fill protect crossings. Latest Node 22 full suite: 389 passed, TypeScript passed. Visual findings remain open; see docs/evidence/world/0086/progress.md.

- Shadow correction: atmosphere5d0609a plus unchanged landscape52a4046 establish one contact/cast boundary. Isolated native landmark captures, overlap/inherited-alpha/deck pixel checks and400-test Node22 regression evidence are in docs/evidence/world/0086/shadow-boundary.md. Focused review pending; full goal stays ACTIVE.
