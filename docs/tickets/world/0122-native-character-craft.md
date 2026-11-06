---
id: 122
title: Recover character volume at native game scale
status: done
priority: high
type: feature
created: 2026-11-06
---

## Why

The canonical pre-world restaurant has richer volumetric actor form than the connected-world hand-built sprite catalog. The user reports worse graphics. Room/shading recovery alone must not mask a remaining actor downgrade.

## Done when

- Compare actual canonical legacy and current actors at real gameplay size and coherent facing/action, with identity and viewport differences disclosed.
- Prototype and retain a meaningful bounded native character craft improvement only when independent comparison supports it. Prefer depth/value/shape and purposeful pose over extra pixel noise.
- Preserve canonical identities, supported directions/actions, floor/seat/table/held-object contacts, stable render anchoring, reduced motion and actual animation/gait. No actor resize or calibration change without an exact approved plan.
- Pure/native checks and actual gameplay/visual-motion review cover the changed behavior. Update obsolete palette-only hash expectations honestly without weakening physical invariants.

## Notes

- Owner: Codex character worker. Artwork-only seam approved by root on 2026-11-06 after actual native/legacy inspection. Private evidence: `/private/tmp/junyan-world-private-qa/0122/`.
- Broad deterministic material planes retain exact sprite alpha/attachment geometry; unchanged silhouettes remain a disclosed limitation.

- Branch codex/0122-native-character-craft; worktree /private/tmp/junyan-world-character-craft; ports5586/5587 strict. First send evidence and exact art/adapter seam before product edits.
- Likely lease native character artwork/sampling tests; existing legacy characterFigure is available for study/reuse. Renderer/global calibration/catalog/shared interfaces require root coordination.118 owns restaurant geometry/camera/materials,121 shared face shader.
- All raw before/after evidence remains private0122; no public QA/push/merge before independent gates. User’s Stardew/AAA craft bar is still unmet.

### Result

- Added broad deterministic cool-shadow/warm-light form planes to the existing head, hair, chest and limb interiors. No noise, new renderer, catalog identity, scale or calibration change. A harsh independent review retained the final revision as modest meaningful game-scale form/readability progress, subtle on phone.
- Exact pre-change alpha masks and all returned frame/contact/held/seat metadata remain unchanged across 25,344 cast/direction/phase/action/carry/reduced-motion cases. Physical provenance remains anchored to `03bc3198`; old palette-only byte-equality expectations are explicitly superseded rather than silently regenerated.
- Final checks: 687 unit/rules tests; TypeScript/Vite build; 10 desktop/phone waiter journey checks including opening, three customers, change, journal and keyboard movement. Actual native/phone/desktop screenshots inspected; no console errors in journey. Reduced-motion canvas bytes freeze. Muted actual movement clips and a separate sampled temporal review show preserved gait/contact behavior, not improved animation.
- Private evidence: `/private/tmp/junyan-world-private-qa/0122/`; independent review `critic-review.md`; paired native frames at 1×/4× and final actual screenshots. Nothing published. Browser sample median ~0.066–0.071ms before versus ~0.085–0.088ms final; fixed-camera world-paint median ~2.2–2.5ms before versus ~2.7–3.1ms final. These short local runs are not a hardware frame-rate guarantee.
- Learned: form shading improves flat native surfaces, but unchanged broad head silhouettes and shared pose vocabulary cannot recover legacy contour and character drawing. Canonical legacy screenshots still look more crafted. The reported significant graphics downgrade remains unresolved; a separately scoped existing-rig reuse experiment is proposed to root, with no implementation in this ticket.
