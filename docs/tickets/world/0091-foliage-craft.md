---
id: 91
title: Author three native foliage craft specimens
status: doing
priority: high
type: explore
created: 2026-11-06
---

# world/0091 — foliage craft

Status: ACTIVE — authored study ready for review; integration handoff pending. Owner: foliage craft helper assigned by coordinator. Branch `codex/0091-foliage-craft`; cloud worktree `/workspace/junyan-0091`; port5499.

Produce3distinct authored pixel-cluster mature species with branching/negative space/directional light; compare native and production-scale specimens with player/path/shore. Follow `docs/world-program/foliage-craft-v1.md` exact isolated API and lease. Only new foliage.ts and this qualified ticket/evidence;0084 integrates draw.ts/maps. No audio/shadows/renderer rewrite.

Authored camphor, leaning willow and fruit specimens are in `src/world/art/landscape/foliage.ts`. Exact seam exports `drawFoliage`/`foliageBounds`; caller supplies foot-anchored translated/scaled native context, explicit shade callback, seed/time/reduced motion. Bounds conservative including sway. Context saved/restored; inherited alpha preserved. Fixed material shading once per base.

Evidence and reproduction: `docs/evidence/world/0091/README.md`, native/desktop/phone/evening PNGs, browser checks JSON. Production reference approved by coordinator:1b42875 ready-art composition (atmosphere63a5803, landscape52a4046, rooftop2d22909). Evidence imports existing camera/player/ground/light from read-only reference; no shared-source edits. Actual App-scale captures call production cameraForMap with half-resolution backing displayed2× (phone195×310→390×620/unit11; desktop560×320→1120×640/unit15), one specimen per view. Production radius-aware canStand passes for actor.22 and treefoot.5. Original comparison sheets are explicitly reduced-scale. Study is not App/travel/world acceptance.

Typecheck passes; browser console clean. Determinism, reduced-motion, sampled pixel bounds, inherited alpha, transform and unique-material shade checks pass for all3. Latest mean draw cost0.248–0.340ms/1000-draw samples; real phone frame budget remains integration work. Standard Vite build passes;308/308 existing rules tests pass (26 files). Initial custom output-dir build failed existing plugin dist assumption, corrected by standard build. Root/coordinator study review then0084 adapter integration and current-head App capture remain pending; do not mark whole goal complete.

Coordinator native-art direction review: substantial improvement and3distinct branching/open crowns accepted for focused next review. Actual-scale corrected evidence now supplied; no final production acceptance implied.

Actual-scale old52a4046 views also captured at identical foot/camera/actor positions (`actual-phone-old.png`, `actual-desktop-old.png`) for direct before/after comparison.
