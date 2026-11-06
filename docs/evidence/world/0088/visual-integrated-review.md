# Independent visual and world-experience review

Verdict: **ISSUES / full goal ACTIVE**. Exact reviewed production head: `c4ec7ed6ea60ced7c6c22a1514e273124ceeb678`. A connected prototype is established; the requested large, beautiful, inhabited life-sim world is not yet established. The traversal success must not average the weak art, place identity, or unverified sustained play into a PASS.

This is a read-only implementation review. No application files changed. Ownership below follows `docs/world-program/ledger.md`: town **0079**, residential **0081**, landscape **0084**, characters **0085**.

## Evidence and limits

Actually inspected all ten desktop and all ten phone map PNGs in `integrated-c4ec7ed/`, plus `phone-table.png`, the supplied 15-second contact sheet, and newly decoded video frames at 101–103.75 seconds (4 fps) and 123–125 seconds (1 fps). The additional frames were decoded to memory; no extra artifact files were written. `phone-route.webm` is 164.88 seconds, 390×664, 25 fps; SHA-256 `984d0b32ede9062d10cee3696943067d7098d9e2d539b4181c6eabc35936289a`. This is sampled motion inspection, not continuous playback, audio review, or a measured frame-pacing result. Desktop route video was overwritten and is not claimed.

Compared the actual baseline restaurant, courtyard/cats, workshop and rooftop screenshots in this directory, representing main `8cd5bc209b7dc2d91cc0f765991de313f813f4eb` (documentation-only capture checkout `5132785601e5f2e688f6158d00109869c90ed218`). Exact-head source reads below explain visible defects; they do not substitute for the captures.

The recorded route establishes a useful physical loop through ten maps and seventeen transitions. It does not measure total reachable breadth, all landmarks, unaided discoverability, activity depth, or reasons to return. Apartment, rooftop and workshop visits in the phone event log return after roughly 0.8, 0.8 and 0.5 seconds respectively; those are doorway checks, not experiences of those destinations. Morning-like route captures cannot establish evening, night or weather quality.

Retain the legible cream/jade/wood palette, readable player silhouette, full viewport world, physical connections, and the workshop's differentiated work areas. The new world has more travel but visibly loses some baseline place-specific craft. The five packages below are ranked by their effect on the requested experience.

## 1. Restore authored place identity and remove generic overdraw — P1

**Owners:** foundation **0078** leads integration; courtyard **0080**, town **0079**, rooftop **0083** supply/verify their art. Foundation owns the restaurant seam.

**Observed:** `integrated-c4ec7ed/desktop-restaurant.png` and `phone-restaurant.png` show four solid tan blocks, a long counter block, one tree and checker paving, with no visible diners, tableware, kitchen fittings or room walls. Baseline `desktop-restaurant.png` has patrons, stools, bowls, steamers, cabinet fronts, windows and textured walls. This is a substantial loss of the visual premise of breakfast service. Integrated town and courtyard captures show large blank brown/green building boxes; the courtyard retains fragments of detailed roofs and laundry around them. Rooftop captures read as tan slabs and boxes, with neither the baseline skyline nor a convincing visible garden.

**Exact-head explanation:** `src/world/painter.ts:41–44` calls every art module's ground pass on every map. `src/world/art/courtyard/index.ts:47–50` has no map-ID guard and paints every supplied terrain array as courtyard paving. `painter.ts:47–56` suppresses generic fallback only for IDs returned by `renderObjects`; courtyard exports `drawMap` only. Its detailed object pass is drawn at `painter.ts:69`, then generic props paint afterward at line 70. The exact tree has no town or rooftop `art/*/index.ts`. `src/world/restaurant.ts:10–11` contains only counter/table/tree props and an empty NPC hook list.

**Improvement and proof:** scope each owner renderer to its maps, give authored objects exclusive IDs in the shared depth queue, integrate complete restaurant/town/rooftop art, and preserve activity-state visuals. Restore believable facade openings, roof structure, cookware, seating, plant beds and skyline context while retaining walkable geometry. Reproduce the current map-entry captures before/after, then walk behind every major house/counter/roof to verify that detailed art is neither covered by generic boxes nor drawn over the player. This needs integrated screenshot/depth coverage; a producer preview is insufficient.

## 2. Author mature landscapes and believable light/shadow — P1

**Owners:** landscape **0084** leads composition; atmosphere **0086** and foundation **0078** resolve render/light integration.

**Observed:** `desktop-park.png`, `phone-park.png`, `desktop-riverbank.png` and `phone-riverbank.png` show broad flat rectangular material regions, paths with abrupt right-angle joins, repeated small bushes/flowers/rocks, and similarly sized trees distributed like a prop field. Most critically, tall translucent quadrilateral planes descend beside many trees and read as vertical cards rather than grounded shade. They persist across decoded `phone-route.webm` frames at 123–125 seconds while the camera moves. The river entrance is visually a meadow path with no river visible in its entry capture; this does not prove the river is absent elsewhere.

**Exact-head loci:** landscape composition is authored in `src/world/maps/landscape/author.py:39–50`, `52–85`, `88–125`; silhouettes in `src/world/art/landscape/draw.ts:41–68`. The rectangular shadow implementation at `src/world/atmosphere/index.ts:128–133` and generated hooks at `map-hooks.ts:19` need an isolated comparison to identify which pass produces the observed cards. Do not claim the source location alone proves the whole visual cause.

**Improvement and proof:** create larger, asymmetric canopy groups with varied ages, readable trunks and layered understory; compose open ground around intentional clearings, banks and destinations. Break up hard material rectangles with authored edges and transitions, and make the river/pond a visible navigational landmark. Replace card-like shade with ground-conforming silhouettes and coherent contact shadows. Verify normal/reduced-motion clips at the same coordinates plus water, shoreline and bridge close-ups, and capture morning/evening/night lighting. Density should describe an ecosystem and paths, not just increase the prop count.

## 3. Give interiors human scale, material character and occupied purpose — P2

**Owners:** residential **0081** leads; workshop **0082**, characters **0085**, world-life **0087**; foundation **0078** integrates.

**Observed:** residential hall, stairs and apartment captures have recognizable architecture and useful furniture, but broad empty floors, very long unbroken walls, repeated window units and an enormous open stairwell dominate their compositions. The apartment has a readable bed/kitchen/seating arrangement; empty space alone does not prove missing furnishing gameplay. Workshop is the strongest integrated destination: specific tools, lamp and toy benches, storage, a bicycle and material differences communicate its purpose. Across these scenes, the small, simply shaded people and broad oversized furnishing masses need a shared scale check; current samples do not prove believable seated, working or carrying contact.

**Exact-head loci:** `src/world/art/residential/index.ts:16–20`, `57–221`, `225–278` author walls, props and furniture; `src/world/characters/adapter.ts:48–51` supplies the shared actor scale. Workshop work areas are in `src/world/art/workshop/paint.ts`.

**Improvement and proof:** establish one actor/door/stool/table/bed scale sheet at the production camera, then compose each room around a few recognizable daily uses. Add purposeful clusters such as shoes and mail at the hall, repair materials at benches, cooking or personal objects at home, and visible architectural thresholds. Vary worn wood, glazed tile, plaster, cloth and metal through edge treatment and localized detail. Preserve furnishing room and walking clearance. Demonstrate a resident sitting at a bench, reaching a work surface and carrying an object with clear feet/hands/contact at phone size; do not accept an animation enum or isolated sprite sheet as that proof.

## 4. Make the camera and navigation present a continuous world — P2

**Owner:** foundation **0078**; map owners supply enclosing scenery and distinct entrances.

**Observed:** `phone-town.png` has a large dark-green void above the street; `phone-rooftop.png` has a large void beneath the parapet; hall, stairs and riverbank captures similarly expose abrupt floating-map boundaries. Town facades offer few visible doorway cues. Place labels misidentify or underspecify locations: town displays 早安小馆, hall 家, stairs 屋顶 and riverbank 看看. The world occupies most of the viewport, which is real progress, but the oversized location badge and fixed pad consume valuable phone space while the current destination remains unclear. `phone-table.png` shows an almost full-screen blurred modal with a second panel behind it, separating ordering from the customer and room.

**Exact-head loci:** `src/world/camera.ts:15–20` clamps the projection's rectangular extent, not an enclosing scenic composition; `painter.ts:31` supplies the flat void. `WorldViewport.tsx:60–72` maps generic vocabulary to place/interaction labels; `world.css:1–4` positions chrome and activity controls.

**Improvement and proof:** author scene-edge continuation and camera limits together, keeping doors, the player and next destination readable in portrait and landscape. Use correct tappable location vocabulary and distinct world entrances, with contextual labels that identify the action or destination. Make activity presentation retain visual connection to the actor and object while preserving large Chinese token targets. Capture every arrival/exit, furthest camera edge, and opened activity at desktop/phone sizes; then run an unaided route to test whether doors and purposes can actually be found. A geometry-informed click script cannot prove that.

## 5. Turn the connected route into worthwhile visits and visible daily life — P1 acceptance gap

**Owners:** world-life **0087** leads; map/feature owners **0079–0084**, characters **0085**, foundation **0078** integrate.

**Observed:** the route and 15-second samples demonstrate real displacement and regional transitions. The 101–103.75-second river segment traverses repeated path/vegetation; the 123–125-second park segment shows player walking poses and a nearby resident. This is evidence of movement, not a lived-world loop. Entry captures communicate few actionable destinations; restaurant has no visible patrons, and most outdoor scenes give no visible reason to stop. `phone-events.jsonl` retains empty life discoveries/reactions on every recorded edge. Because the route deliberately did not pursue them, this is an evidence gap, not a claim that authored discoveries cannot work.

**Exact-head loci:** `src/world/life-bridge.ts:8–11`, `src/world/life/sample.ts:14–38`, `src/world/restaurant.ts:11`, and the landmark/anchor definitions in `src/world/maps/landscape/author.py:25–27`, `73`, `110` are the relevant integration seams.

**Improvement and proof:** connect recognizable destinations to an observable activity and a reason to return: a resident doing work, a garden visibly changing, a repaired object used, a cat clue tied to its actual hiding place, or a discovery that changes a later visit. Make these causes visible in the world with character acting, props and state changes. Independently play a complete outward-and-return session that performs each existing activity, revisits locations at another day/light state and verifies persistent consequences. Measure distinct experienced landmarks, meaningful actions and loop routes separately from empty map area and travel time. Do not close this package on the current 2.75-minute route.

## Experience judgment

Using the ledger's 0–4 rubric: connected traversal **2/4** (one real loop, limited scope); architectural identity **1/4**; landscape maturity **1/4**; material/depth/light **1/4**; inhabited detail **1/4**; world-focused composition/UI **2/4**. Character silhouette readability **2/4**; scale/contact acting, sustained life, unaided exploration and repeat-visit value remain **unverified**. Overall connected-world experience is **2/4, partial**, as a qualitative stage description rather than an average or acceptance score. The visual integration regressions and the missing sustained-experience proof independently prevent PASS.
