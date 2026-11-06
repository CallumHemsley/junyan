---
id: 78
title: Foundation, travel, player, camera
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

- Owner: builder 1, GPT-6.1 Sol medium. Thread `01a1ae1f-45c2-71c3-9305-a64991b6007b` on host durable.
- Branch: `codex/0078-world-foundation`. Cloud checkout and process handles must be recorded by owner. Strict port 5480.
- Exclusive paths: src/world/* except the explicitly delegated subdirectories; src/App.tsx; src/style.css; src/save*; src/contracts.ts; src/navigation*; src/neighbourhood/*; src/scene/renderer*; src/scene/RestaurantScene.tsx; package.json; pnpm-lock.yaml; offline/build/config files; integration e2e tests.
- Also owns this ticket and `docs/evidence/world/0078/`. Do not edit shared contracts or other owners' files.
- Publish map seam requests and integration instructions in the owned evidence directory.

- Active persistent objective: complete movement, camera, collision, portal graph, all activity integration and compatible saves through independent experience review. No native create_goal tool is exposed.
- Cloud checkout `/workspace/junyan`; baseline `8cd5bc2`; allocation `fb167fd`; implementation and verification remain active.
