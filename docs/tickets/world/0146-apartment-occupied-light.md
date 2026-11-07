---
id: 146
title: Give apartment evenings a physical occupied-light hierarchy
status: doing
priority: high
type: feature
created: 2026-11-07
---

## Why

Independent apartment144 critics consistently find night near-daylight with detached light patches. Source confirms sampleAtmosphere defaults every interior phase to ambient[.92,.89,.83] unless the map supplies ambientByPhase; only workshop currently supplies that override. Apartment uses generic fixture light shapes rather than its actual living-area lamp/window geometry.

## Done when

- Use the existing per-map ambientByPhase/local-light hook seam for apartment only; existing serviceDayPhase and explicit time/reduced-motion inputs remain authoritative. Do not introduce a new light engine, global grade, time/state, or affect hallway/stairs/restaurant/workshop palettes.
- Establish a coherent evening/night hierarchy with readable player and paths, warm occupied focal area and cooler/quieter surroundings. Bind light apertures/pools to actual current lamp/window geometry and supporting surfaces, not broad detached decals. Actual material response and emitter/ground ownership must be assessed before claiming illumination.
- Preserve source144 grouping and map/collider/landmark/furniture/save geometry; do not edit another writer tree. Derive fixture-relative shapes so the accepted layout coordinates remain authoritative. Coordinate any residential artist/shader source lease centrally before editing.
- Early actual full-App phone/desktop day/evening/night matched originals must retain a meaningful independent preference before broad polish. Protect daytime appearance and critical word/player/control contrast. No crop/resize/composite comparisons; no forcedAAA or benchmark parity claim.
- Test relevant deterministic phase/hook/material/alpha/depth behavior, canonical audio/DOM/focus/pause rules, actual traversal/learning and normal/reduced viewports. Independent exact-source/native review before merge; global goal remains open.

## Notes

- Centrally reserved by root after source diagnosis on main121c7aaa. Assign writer/branch/worktree/strict ports after an active reviewer slot frees; status remains todo until then.
- Proposed primary lease atmosphere/local-lights.ts and targeted tests; any physical surface-response seam in residential art requires explicit coordination with144 and a bounded design first. No texture/noise-only pass.
- QA private /private/tmp/junyan-world-private-qa/0146, source/test/ticket only committed. No new raw public exports.

- Writer: Codex district/lighting. Branch `codex/0146-apartment-occupied-light`; worktree `/private/tmp/junyan-world-apartment-lighting`; strict preview ports 5645/5646. Initial primary lease is local-lights/hooks plus explicit empty-pool compatibility semantics/tests; residential artist lease awaits central release after 144.
