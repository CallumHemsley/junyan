---
id: 87
title: Residents, wildlife and exploration
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

- Owner: builder 10, GPT-6.1 Sol medium. Thread `01a1ae20-f4aa-770f-aefd-1821e92d1072`, host `durable`.
- Branch: `codex/0087-world-life`. Cloud checkout and process handles must be recorded by owner. Strict port 5489.
- Exclusive paths: src/world/life/*.
- Also owns this ticket and `docs/evidence/world/0087/`. Do not edit shared contracts or other owners' files.
- Publish map seam requests and integration instructions in the owned evidence directory.

## Active objective

Keep this goal ACTIVE until residents, wildlife, environmental reactions, and discoveries work across the integrated connected world and independent review verifies repeated visits, collision safety, and persistence. No native create_goal tool is exposed. This committed ticket is the durable record.

- Cloud worker `ccarenv_b64_Y2NhcmVudl8xMTEzYmUxNDFlMzA4MTkxYjNlYjVmMDcxOWQ2MjdiMA`, checkout `/workspace/junyan`.
- Contract v1 from coordinator commit `fb167fd`. Baseline main `8cd5bc2` verified as an ancestor.
- First unit is pure route compilation and actor sampling. Foundation injects navigation rather than life implementing another pathfinder.
- Next units are proximity actions, discoveries, canonical voiced-content reuse, and the render adapter.
- Pending proof includes actual connected maps, real keyboard/touch visits, save/reload, inspected desktop/phone screenshots and motion, and independent review. No acceptance claim.

## Module checkpoint

- Head 1ef35dc publishes worldLifeFrame, lifeObjects, LifePrompt, restaurantPresence/releaseServedCustomer, deterministic routes, validated ecology recipes and solid-landmark interaction rules. API packet is docs/evidence/world/0087/integration.md.
- 33 focused life tests and TypeScript pass. Earlier current-base full suite/build passed 391 tests. Scoped browser evidence is docs/evidence/world/0087/isolated; limitations and independent helper findings are in verification.md.
- Status remains doing. Shared production consumers, full normal-world proof, background resident contracts and independent Astra acceptance are outstanding. No native goal registration is claimed.
