# world/0082: active-bench work pocket

Status ACTIVE. Chosen plan f876255, section5. Historical alias 0082; branch codex/0082-workshop; cloud checkout /workspace/junyan; strict port5484. This is the next bounded art pass after the accepted e02 repair re-verification, not new mechanics or final world acceptance.

New evidence mapping: **docs/evidence/world/0082/**. Historical top-level numeric workshop evidence/ticket bytes are untouched by this owner. Coordinator alone handles relocation and SHA manifests. The inherited foundation branch still contains legacy world documentation; this owner does not reconcile that against current main.

## Current unit

Bench-contained folded cloth, a shallow parts tray, spare fitting/battery, screwdriver and cable live beside the existing selected repair object. Other benches retain their existing work surface. Persistent tool wear remains when the job is returned. Selection, unfinished jobs, completed display and repeats use existing repair state. No map geometry, collider, anchor, reducer, save, day, audio or shared consumer changes.

The entry stones now use a restrained cooler material base so the warm practical pool has a readable local contrast. This is authored material through the existing shadeColor callback, not a screen tint. No extra furniture or general clutter pass.

## Sole-consumer request

`src/world/art/workshop/lighting.ts` now exports pure `workshopAtmosphereHooks(map, repairs): AtmosphereHooks`. The old DOM lighting study moved to lighting-preview.ts within the owner lease, and no longer fetches top-level numeric evidence.

Foundation should use its existing cached static hooks as the base:

```ts
const base = hooksFor(map);
const hooks = map.id === 'workshop' && game?.neighbourhood
  ? workshopAtmosphereHooks(map, game.neighbourhood.repairs, base)
  : base;
```

Pass `hooks` to its existing single `sampleAtmosphere` call. Only the selected job filter is state-derived; do not cache that selection solely by map. Atmosphere5d39236's `authoredLocalLights` owns exact task emitters, tabletop pools, host depth and the workshop ambient-by-phase setting. The helper preserves that base unchanged except for filtering the task-light list. It supplies no fixture geometry, colors, radii, shadows, clock or extra layer.

The first study proposal used a separate returned-lamp pool. Independent review found that emitter would sort behind its shelf. That optional extra is removed: the chosen scope is the active work pocket; completed objects retain their original authoritative artwork. No physical source relocation or fallback lighting layer was added. The shared authored task fixture is the only practical source definition.

Current foundation has not yet consumed this state filter or atmosphere5d39236. The paired pocket captures prove the dressing and sampler adapter in controlled studies, **not final production integration of the new practical pools**. First `after-*` captures document the earlier provisional hook study; a `shared-fixture-*` capture records the reduced state-filter adapter on the currently available base. Final captures must use foundation after it consumes the published authored fixtures and state filter.

## Evidence

Before: source baseline bbce2ba (foundation e48b10e consumed), with original art/default hooks. After: selected work pocket plus the proposed state-derived hooks. Same camera, state, phase, elapsed input and viewport; occupied/empty means adding/removing the existing canonical working resident in the controlled study. These are composition studies, not travel or sustained-life evidence.

- before/after desktop1440x1000 and phone390x844, paired morning/evening and occupied/empty.
- capture.mjs writes only this qualified directory. Source fixture: src/world/art/workshop/pocket-study.html/.ts.
- No authored geometry changes: baseline/after capture JSON includes exact colliders/anchors for comparison.
- TypeScript and focused repair/circulation/render tests pass; new light-projection tests check selection, returned/repeat state, phase sampling and no map mutation.

Next: independent visual review of the local dressing and pool, foundation consumption, actual repair/progress/return proof and resident task/rest motion under the final shared checkpoint. Keep the full goal active.

## Current runtime and review checkpoint

Node22.23.4 typecheck, 21 focused tests and production build pass. Actual desktop/phone repair, return, partial repeat and reload run against the consumed dressing with no console/page errors; completed markers and both active repeat objects persist. Stool claim/reload/idempotence passes separately. The first gift runner used a fixed300ms storage observation and failed without sufficient receipts; the revised runner records saved state and waits for the actual asynchronous result (desktop settled after100ms further polling, phone immediately). No data-loss finding is claimed from that first observation.

Astra helper /root/workshop_review found one source-level P2 in the optional returned-lamp emitter order. The extra returned emitter was removed, and the state filter now reuses atmosphere-owned task geometry. Re-review pending. Dressing was independently judged contained/plausibly scaled; collider/anchor snapshots remain identical. Final production light-pool proof and resident task/rest motion still require the shared consumer checkpoint.

### Reduced adapter review

Astra re-review confirmed the optional returned-emitter P2 resolved by removal and found no new concrete source defect. See review.md. Source provenance, Node22 and historical-path checks are in provenance.json. The exact active state-filter code is ready at6accbab; foundation should consume it with atmosphere5d39236, then this owner will recapture the production pool. No production-lighting PASS is claimed before that step.
