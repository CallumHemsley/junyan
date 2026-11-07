---
id: 142
title: Integrate the whole play interface with the pixel world
status: doing
priority: high
type: feature
created: 2026-11-07
---

## Why

The current-source benchmark still prefers Stardew in all three snapshot pairs and identifies cream application chrome as a separate visual register. Improve the complete play frame as one game while preserving the accepted typography, palette and learning interaction.

## Done when

- Propose a coherent treatment for header/scene edge, location/action cards, movement controls, pocket counters and selection/focus cues; one-button reskin or hidden chrome is insufficient.
- Keep the world the first visual read while controls remain legible/discoverable. Use intentional material/edge/value hierarchy and authoritative phase-aware tone where appropriate, preserving DOM Chinese/pinyin-on-tap, intentional unknown-word fog,44px targets, keyboard focus, safe areas and reduced motion.
- Respect design tokens as source of truth and vermilion-only-on-words. No game/content/schema/rule/renderer rewrite; any presentation-only attribute derives from existing authoritative game/light state and is coordinated before edits.
- Early matched original full-app apartment/day, park/phone, town/night and workshop/phone views must earn independent preference before broad polish. Include actual visible controls, never hide them for the comparison.
- Verify active panels/lookups/input/pause/journal/short-tall-landscape layouts, relevant checks/types/build/real journeys and independent final source/native review before merge. No claim this alone closes the overall art goal.

## Notes

- Owner interface-art writer; branch codex/0142-world-interface-art; worktree /private/tmp/junyan-world-world-interface-art; strict ports5636/5637.
- Base accepted main14b8f7b6. Lease src/style.css,world/world.css,world/ui/contextual.css and minimal App presentation markup; design token changes require explicit coordination/source generation. No other current writer leases these.
- Benchmark private benchmark-current/packet/benchmark-final.md. Root reader branch has additional presentationFrame/compact editor behavior; preserve its integration contract without importing unfinished chapter dependencies.
- Raw QA private /private/tmp/junyan-world-private-qa/0142. Source/tests/ticket only committed. Parent owns critics and merges.
- Early candidate: token-derived timber frame, inset paper controls and near-square edges applied across header, scene edge, place/target cards, movement pad, pockets and contextual panel. Extracted the existing service-progress phase expression unchanged so scene and interface share one phase; evening/night select the accepted evening token palette. Lookup/dialog content inherits the shell theme without portals.
- Baseline and candidate02 original full-App captures cover apartment/day desktop, park/day phone, town/night desktop and workshop/phone, with normal controls visible. Actual observed camera, canvas and schema-validated fixtures match in every pair; zero browser errors. Capture source, reports, original PNGs and hashes remain private under the path above. These are staged visual fixtures, not earned gameplay evidence.
- Early checks: all 673 tests across 105 files pass after correcting the painter test's full lighting mock to preserve the extracted phase helper; TypeScript/Vite build passes with the existing large-chunk warning; diff whitespace check passes. Initial test attempt exposed that mock dependency (2 failures) and is retained in private logs. Awaiting independent art retention before journeys and broader panel/layout verification; ticket remains doing.
- Independent early art review prefers the candidate in all four matched pairs and retains its direction, with a valid night-cue revision. Restored a true token-based light/dark pair (13.08:1 at night instead of 1.12:1) and strengthened the viewport keyboard outline. The review's open-ambience finding described the closed rule: actual ba33fff9 computed open ink was already correct (13.91:1 morning, 11.03:1 evening); confirmed with original narrow open/focused captures, without a redundant override. Before/fixed native states and computed contrast are retained privately. Functional journeys and final independent review remain pending.
- Added a browser regression for served counts 0→2→3→4→0, closed/open keyboard-focused ambience, contrasting selected-target rings, and themed nested word lookup with focus return. Desktop and phone pass (2 tests); these use explicitly validated saved-state fixtures, not an earning journey. All new raw results remain under the explicit 0142 private QA directory.
