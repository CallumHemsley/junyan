---
id: 107
title: Distinguish arranging furniture from nearby inspection
status: done
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
- Completed: the actual `reading-room.project` anchor resolves the registered `table` and `apartment.chair` objects. The adjacent life inspection retains its original line tokens. Existing rendering derives distinct action and cycle accessible names without changing action bindings or word lookup.
- Verification: all 100 Vitest files / 655 tests passed, including the real-map label/identity regression. Production TypeScript/Vite build passed as part of the Playwright preview setup. The focused Playwright check passed on desktop 1440×1000 with keyboard activation and phone 390×844 with real touch activation; it cycles to inspection, observes the saved discovery without opening the editor, cycles back and opens furniture play. Browser console/page errors were empty. Private screenshots were inspected at both widths.
- Provenance and limits: this focused regression declares a reading-room arrival save fixture, then uses ordinary controls; the earlier normal-input audit supplied the original reproduction. It does not establish blind room discovery or repeat the full breakfast journey. Raw QA remains outside the repository. Cross-review and source merge remain with the coordinator.
- Learned: canonical noun labels distinguish an activity from a nearby ambient verb without inventing vocabulary or weakening intentional unfamiliar-word fog.
