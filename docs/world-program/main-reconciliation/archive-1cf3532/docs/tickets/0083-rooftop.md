---
id: 83
title: Rooftop garden and skyline
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

- Owner: builder 6, GPT-6.1 Sol medium. Thread ID pending parent relay.
- Branch: `codex/0083-rooftop`. Cloud checkout and process handles must be recorded by owner. Strict port 5485.
- Exclusive paths: src/world/maps/rooftop/*; src/world/art/rooftop/*; src/features/garden/*.
- Also owns this ticket and `docs/evidence/0083/`. Do not edit shared contracts or other owners' files.
- Publish map seam requests and integration instructions in the owned evidence directory.
- Worker thread `01a1ae20-85bf-7293-b853-cd8a6ebb7057`, cloud `/workspace/junyan`, strict port 5485. Base coordinator commit fb167fd, main 8cd5bc2.
- ACTIVE durable objective in `docs/evidence/0083/goal.md`. Native create_goal/send-to-thread unavailable.
- First WIP authors v1 map JSON and pure garden-state projection. Dynamic colliders follow the saved pot sites; canopy collision uses feet only. Foundation must register `rooftopForGarden(state)` so movement and rendering receive the same projection.
- Shared draw adapter pending 0078. Stair exit uses central reciprocal `to-residential-stairs` / `from-rooftop`; safe arrival is outside trigger.
