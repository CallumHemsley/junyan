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

- Source dependency 144 merged once at exact `1ea314f5`; accepted main #66 (`c7b42169`) reconciled once as runtime `d250adc1`. Apartment map, authored furniture forms, native bed and wardrobe bytes remain unchanged.
- Round 1 (`4ed66a3b`) retained privately as rejected: receiver samples interleaved rug layers, approach actor/feet were too dim and windows competed with confined practical warmth. Round 2 (`262afe2b`) groups flat samples at their original painter depth, raises quiet-night ambient/reach and restrains window apertures. Separate critic retained all 12 evening/night comparisons, with six daytime ties; this is an agent direction review, not a formal human study.
- Material pipeline: actual face centers/normals/heights receive bounded local irradiance after one global grade; inherited alpha and shadow ownership stay intact. Morning/noon ambient and zero receiver contribution are exact. Whole-frame daytime changes from aperture/pool corrections remain 4.463–4.482% desktop / 6.324–7.284% phone, maximum channel delta 19; no whole-day byte-parity claim. Actor and native-bed local warm response remain outside this bounded change.
- Combined validation at `d250adc1`: 697 tests/111 files, TypeScript/build and four actual waiter/apartment journeys pass. Four actual legal night walks (both viewports/motion settings) moved physically off the naturally hidden target cue with controls visible, verified native contextual WAV playback, word-card pause/focus and exact saved-position reload. Thirty-six final day/evening/night originals are console clean; camera observation is read-only at the production assignment.
- Warm-cache production painter sampling records median 3.4–3.7ms daytime / 6.1–6.6ms night, p90 10.2–11.8ms / 12.9–14.6ms on this headless desktop browser at both viewport sizes. This is CPU draw-call cost, not phone hardware FPS or continuous-animation certification; night work adds cost. Raw originals, initial rejection, daylight deltas, failed private harness setup (no tests ran) and final proof remain private in `/private/tmp/junyan-world-private-qa/0146`. Status stays doing for independent exact-source/native final acceptance.
