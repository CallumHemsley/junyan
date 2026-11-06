# Production integration packet

Goal ACTIVE. Foundation alone changes shared consumers. Life branch `codex/0087-world-life` owns pure rules, wildlife drawing and the controls-only prompt. Harness proof is not production acceptance.

## Frame and save

1. Restore nested `world.life` with `restoreLife` at the existing save boundary. The schema preserves explicit `elapsedMs`, discoveries, reactions and bounded actor pauses. Missing old fields default safely.
2. From the existing visible frame loop, advance once with `advanceLife(life,deltaMs,!document.hidden)`. Preserve this state at the same authoritative game checkpoint as movement or interaction. Do not persist every animation frame separately or add real-clock catch-up. `sampleLife` consumes the persisted clock, not a fresh component-local clock or a reduced-motion zero.
3. Compile `compileLife(projectedMap,navigationFor(projectedMap))` once for each projected-map identity. A changed collision/habitat projection invalidates the old plan. Diagnostics remain visible to test hooks.
4. Build `LifeContext` with actual game day/seed, `elapsedMs:life.elapsedMs`, world player, reducedMotion, existing cats state and garden maturity. Supply `excludedCharacterIds` for regulars actually depicted in restaurant service. In courtyard pass `habitats:courtyardHabitats(catHabitat(catsState,day))`. The habitat snapshot comes from the courtyard owner. Do not duplicate story/repeat placement rules.
5. Call `sampleLife(plan,context,navigation,life)`. The third argument validates authoritative habitats. The fourth consumes saved sit/wave pauses. Omitting either drops required behavior.

## Drawing

Use `lifeObjects(actors,life,drawResident)` in the SAME sorted WorldRenderObject array as scenery and player. It wraps `drawLifeActor` per actor with each actor's actual ground position. Cats/birds use their explicit wildlife renderer; unknown species must never use the player's human sprite. The callback receives the real view including shadeColor. No independent loop exists.

The resident callback calls the character owner's sampleActor with `characterId`, `facing`, `action`, `elapsedMs:actor.phaseMs`, `reducedMotion:view.reducedMotion`, and provided `posture`, then its drawActor/paint adapter at actor.position. Character owner supplies material shading for resident pixels. Preserve per-object alpha.

After ground/object drawing, call `drawLifeReactions(ctx,life,map.id,[...map.landmarks,...actors.map(a=>({id:a.id,position:a.position}))],view)`. This draws nonverbal ripple, sway and flutter effects. `view.elapsedMs` must match the saved life clock for reaction age. Owned wildlife/reaction material colors call view.shadeColor directly and preserve inherited alpha. No whole-context proxy is needed.

## Physical controls and action dispatch

`nearbyLife(plan,actors,world.position,navigation)` returns reachable physical candidates sorted by distance. Choose the physical candidate alongside existing feature anchors. Do not route a life candidate through world-interact, which currently rejects exploration. Preserve its exact option.id.

Import `LifePrompt` directly from `src/world/life/LifePrompt`. It accepts `option`, caller-provided `line`, `onActivate`, existing `onLookup`/`onPlay`, recoveredWordIds and freshWordIds. It renders only contextual tokens/replay/action controls, no legacy scene or full-page shell. The pure life index intentionally does not import React/CSS.

On activate, recompute the current projected map, context, actor poses and proximity, then call `interactLife(life,plan,actors,context,id,navigation)`. It rechecks reach/visibility and returns `{state,events,line?}`. Store result.state through the existing checkpoint. If line exists, show its exact canonical tokens and play its existing audio through the existing playback callback. The optional line is the resident's already voiced greeting. Environmental events have no invented dialogue or audio. Keep the feedback line in presentation state, never as copied feature state.

A repeat inspection replays a nonverbal reaction without duplicating discovery. Sitting pauses the cat for nine seconds and resumes the route without snapping. Greetings pause residents briefly for a wave. Repeated actions use explicit play time. Restore preserves elapsed pause without offline obligations.

## Outstanding production proof

Verify actual keyboard/touch approaches in courtyard, workshop, rooftop and exterior regions. Check selected physical NPC greeting, cat sit and resume, a solid landmark's inspect/reaction, saved discovery/reload, and all original activities. Inspect actor/object occlusion and the same map/camera at morning/evening with particles off. Do not accept the isolated schematic harness as these passes.

## Authored ecology content

compileLife includes life-owned, schema-validated routine recipes relative to stable authored landmarks. They add the office regular at town.market-pocket and birds at the park reading stone, river jetty bank and mature rooftop pots. A map-owned hook for the same canonical character suppresses its supplemental recipe. Every waypoint and segment still uses shared navigation and entrance exclusions. No map JSON or shared schema is edited. Actual current town, park, riverbank and rooftop geometry tests verify the recipes. Rooftop bird presence reads garden maturity supplied by foundation.
