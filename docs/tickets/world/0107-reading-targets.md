---
id: 107
title: Distinguish arranging furniture from nearby inspection
status: doing
priority: high
type: bug
created: 2026-11-06
---

## Why

The normal-input gameplay audit found two adjacent reading-room actions both displayed and announced as 看看. Cycling only moved a ring, so the player could not tell which action opened the furniture project.

## Done when

- The reading project and nearby inspection have distinct semantic visible token labels and accessible names using existing registered vocabulary.
- Preserve Mandarin-only presentation, intentional unfamiliar-word fog, real word lookup audio, target cycling and the existing game action binding.
- Focused label checks and an actual desktop/phone nearby-target cycle demonstrate which action starts furniture play. No source or raw QA is published before review.

## Notes

- Centrally reserved after 0106. Owner GPT-6.1 Sol High; branch `codex/0107-reading-targets`, worktree `/private/tmp/junyan-world-target-clarity`, strict ports 5556/5557.
- Lease `src/world/target-labels.ts`, its focused test, this ticket and only necessary E2E verification. Do not edit WorldViewport, camera, content, maps, rules, schemas or dependencies; 0108 owns active-brief framing.
- Follow the design's nouns-as-words convention: canonical table/chair tokens can identify the arrangement task. Do not invent unvoiced visible text or remove learning fog.
