# World life design

Status ACTIVE. Contract v1. Sole production owner of `src/world/life/*`. Strict Vite port 5489.

## Grounding

The restaurant owns day progression and the four regulars. Neighbourhood reducers own cats story/repeats, repairs, rooftop weather/growth, and gifts. Life reads those states and never mutates them. Existing content exports canonical segmented voiced lines. Foundation owns the only frame loop, map schemas, navigation, renderer, App, and saved world envelope.

## Alternatives

An event-driven NPC reducer would serialize waypoint indices, remaining dwell times, and partially completed movement for every actor. A pure schedule sampler can derive the same actor position from validated route timing plus explicit elapsed play time. The sampler is selected because reload needs only the explicit play-time clock and discovery/reaction state. Hidden-tab time must never advance that clock. Pausing an interaction freezes the caller's supplied clock.

Straight waypoint interpolation crossed a synthetic wall. An injected shared pathfinder produced cardinal segments around the wall and an entrance exclusion zone. Life will validate every returned segment using the shared collision callback and its own doorway clearance policy. No foundation geometry validator is duplicated.

Model the Domain selects a typed route timeline, a profile registry, and named exploration events. Test Behavior, Not Implementation selects observations of actor positions, inaccessible affordances, duplicate discoveries, and repeat visits.

## Throughput checkpoint

- Blocking first steps. Central allocation acquired. Exact foundation navigation and draw adapters remain pending.
- Independent workstreams. Route and proximity modules belong solely to life. Map authors supply NPC hooks and landmarks.
- Shared mutable state. Foundation alone wires the save envelope and feature reducers. Life exports validation for its nested state.
- Smallest safe decomposition. This builder owns the diff directly. Existing independent Astra reviewer supplies review separation.

## Integration requests

Provide `canStand`, swept `canWalk`, and `route` callbacks with NPC footprint and temporary entrance exclusions. Life consumes contract-v1 map NPC hooks and landmarks directly. It returns actor position/facing/action and an existing canonical greeting line when available. Actors are decorative and never enter player collision geometry. Supply active restaurant character IDs to suppress simultaneous duplicate residents.

Map owners should use canonical character IDs `lin-jie`, `xiao-li`, `zhang-laoshi`, `xiao-zhou`, `aunt`, `white-cat`, `black-cat`, or `bird`. Place route hooks at benches, safe work positions, tree edges, or roof planters, away from exit triggers. Unknown actors are diagnosed, not rendered as random icons.

Life state validation and named event reducers are standalone exports for foundation's save boundary. No shared save or schema writes occur here. Existing activity state remains authoritative. No new audio or dialogue is authored.

## First rules verification

`node node_modules/vitest/vitest.mjs run src/world/life/life.test.ts` passed 12 tests. `node node_modules/typescript/bin/tsc --noEmit` passed. These prove pure module behavior with explicit test geometry, not connected-map experience. The pnpm wrapper tried a dependency reinstall and stopped before compilation; direct installed binaries work without dependency changes.

Foundation published `src/world/schema.ts`, `geometry.ts`, `camera.ts`, and `render-contract.ts`. Its current `canWalk` and `findPath` use a fixed .22 radius. Life requests optional actor-radius inputs for those functions and a path map with entrance exclusion colliders. Current Navigation injection deliberately leaves that adaptation at the shared integration boundary.

Courtyard exports `catHabitat(state, day)` for authoritative cat positions. Life will consume that owner API once the committed module shape is read, avoiding duplicate cat story placement rules. Do not enable generic roaming white-cat hooks during story/repeat sequences.

Exports ready for foundation are `compileLife(map,navigation)`, `sampleLife(plan,context)`, `nearbyLife(plan,actors,player,navigation)`, `interactLife(state,plan,actors,context,actionId,navigation)`, and `restoreLife(value)`. Persist the nested LifeState through the foundation save boundary. Reactions are named data events awaiting the visual adapter. No integrated visual acceptance is claimed.

## Actual-map findings and updated seam

Foundation dependency is merged for the real `WorldRenderView` and `WorldMapDefinition` imports. `navigationFor(map)` now wraps shared canStand/canWalk/findPath, including entrance exclusions as temporary colliders. All actors use at most the shared .22 player radius. Smaller wildlife deliberately gets the conservative player-sized path, so no second pathfinder or collision implementation exists.

`drawLifeActor(ctx,actor,view,drawResident)` draws cats/birds only and delegates residents to the character owner's renderer. Its view is a Pick of foundation's real WorldRenderView. Foundation inserts each actor individually into its object-depth queue. `drawLifeReactions` adds short nonverbal ripple/sway/flutter effects. It has no loop, storage, audio or DOM ownership.

Aliases accepted are cats.white/white-cat, cats.black/black-cat, sparrow/bird, glasses/zhang-laoshi, backpack/xiao-zhou, bun/lin-jie and tie/xiao-li. Canonical actor outputs use the profile ID. `sampleLife(plan,context,navigation)` accepts context.habitats for courtyard's catHabitat output. It validates supplied habitat positions through shared navigation. Generic white-cat roaming stays frozen before reunion.

Parent review caught inspect logic requiring a walkable solid-object center. This is fixed with `canInspect`, which permits the target collider and rejects every intervening collider. Actual-map local geometry snapshots are attributed in solid-landmarks.fixture.json. Tests cover successful jar/jetty inspection, intervening walls, repeat reactions, and discovery reload.

Actual authored-input browser diagnostics found these remaining map defects. Town morning-walk home fails entrance clearance. Courtyard white-cat route has a blocked stop. Park pond-deck at (61,33) has no walkable point within 1.8 tiles. Park and riverbank have no NPC hooks in the fetched snapshots. Other courtyard actors, both workshop residents and the rooftop resident compile. These are not life acceptance passes.

17 focused life tests and TypeScript pass. Browser harness uses cloud /usr/bin/chromium because the matching Playwright bundle is absent. Initial harness had a reduced-motion variable initialization error; fixed before collecting proof. The first browser diagnostics reported no page errors after that fix, plus an irrelevant favicon 404 to remove before final evidence. The harness uses actual map geometry and character-owner artwork, with schematic ground rendering. It is interaction proof, not polished world-art acceptance. No original saved game is touched.

## Independent read-only review and fixes

Native cloud helper `/root/life_readonly_review` reported four actionable findings. Cat sit events now pause the actor timeline for nine seconds, persist the elapsed pause, and resume without teleporting. Greetings pause residents for a brief wave. Authoritative habitat overrides now obey entrance exclusions. Ambiguous overlapping target colliders now remain opaque. Browser proof now asserts actual actor displacement. Regression coverage is 21 life tests. No extra implementation writer was delegated.

Explicit visible play time is now a validated LifeState field with `advanceLife(state,deltaMs,visible)`. Reload never adds offline time. Foundation must pass the persisted LifeState as sampleLife's fourth argument so bounded interactions affect production actors. This supersedes the earlier three-argument call when reactions are enabled.

LifePrompt is a controls-only component using existing WordToken/FeatureLine/replay. It accepts one selected physical option and caller-provided line. It has no game clock, save, audio synthesis, world loop or copied activity reducer.
