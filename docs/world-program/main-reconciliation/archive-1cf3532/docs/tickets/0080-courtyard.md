---
id: 80
title: Courtyard and cats
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

- Owner: builder 3, GPT-6.1 Sol medium. Thread `01a1ae1f-7fc4-77ff-8d9d-144d1889304e`, host `durable`.
- Branch: `codex/0080-courtyard`. Cloud checkout and process handles must be recorded by owner. Strict port 5482.
- Exclusive paths: src/world/maps/courtyard/*; src/world/art/courtyard/*; src/features/cats/*.
- Also owns this ticket and `docs/evidence/0080/`. Do not edit shared contracts or other owners' files.
- Publish map seam requests and integration instructions in the owned evidence directory.

- Persistent objective ACTIVE. No create_goal tool exposed. Full courtyard/alleys/cat-habitat objective remains active until integrated and independently verified.
- Cloud checkout `/workspace/junyan`, based on central ledger `fb167fd`; strict port 5482. No product server running yet.
- Prototype compares sequential courts and courtyard loop. Selected loop for multiple approaches and physical town/hall/park connections. See `docs/evidence/0080/README.md`.
