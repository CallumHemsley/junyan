# Production integration packet

Goal ACTIVE. Foundation alone changes shared consumers. Life branch `codex/0087-world-life` owns pure rules, wildlife drawing and the controls-only prompt. Harness proof is not production acceptance.

## Preferred production consumer

`worldLifeFrame(projectedMap,game,world,reducedMotion)` returns `{plan,navigation,life,context,actors,options}`. It consumes the existing courtyard catHabitat, global restaurantPresence, saved life clock, garden maturity and persisted reactions itself. Foundation's life-bridge can delegate to this function instead of reconstructing those inputs. The projected map stays the same snapshot used by collision/art/anchors. Actor-plan caching keys that immutable snapshot.

Insert `lifeObjects(frame.actors,frame.life)` into the existing scenery/player object queue. Its default resident callback delegates to the registered character sampler/renderer with yaw, facing, phase and posture. The full WorldRenderView reaches that callback, including material shading. Use `frame.options` for physical controls. Call `interactLife(frame.life,frame.plan,frame.actors,frame.context,id,frame.navigation)` to activate the current option.

Authoritative cat bindings are independent of optional decorative roam-route validity. A blocked decorative route still emits its diagnostic, but a safe state-derived habitat can display the cat. Shared collision and entrance clearance validate that habitat. Invalid habitats remain absent and diagnosed at the route source, rather than rendered through geometry.

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

## One restaurant/world presence policy

Use `restaurantPresence(game,life)` for BOTH restaurant art projection and global world-life exclusions. `insideCharacterIds` is independent of the player's current map. `tables` reports canonical characterId, inside, reactionVisible and mealVisible. Never independently filter phase !== served in one consumer while the other still draws served people.

A seated, ordered or checkout customer stays inside. A served customer also stays inside until the player acknowledges their visible reaction with the existing continue/close action. At that exact action, foundation calls `releaseServedCustomer(life,game,table)` and checkpoints the returned life state. The helper is a no-op before served and idempotent after acknowledgment. It stores day/table/order identity, so reload preserves presence and another day's order does not inherit a release. No real-clock deadline or new day progression exists.

Restaurant art draws the person only when table.inside. It keeps accepted meal props when table.mealVisible even after departure. The existing receipt/order/game state remains unchanged. Neighbourhood life receives `excludedCharacterIds:restaurantPresence(game,life).insideCharacterIds` on EVERY map. Once released, existing authored routines become eligible. An unacknowledged reaction stays present across reload.

For independent unvoiced background life, proposed canonical actor IDs are neighbour-reader, neighbour-caretaker and neighbour-courier. Character owner must register distinct silhouettes/palettes first; map owners author matching safe hooks at reading, work and delivery places. Life will add profiles/routines only after those contracts land, so unknown IDs cannot silently render as the player's default sprite. No new dialogue or audio is requested.

## Canonical background residents v1

Coordinator c32f128 allocates resident-reader and resident-groundskeeper to park, resident-courier to town, resident-laundry-neighbour to courtyard, and resident-river-walker to riverbank. These exact IDs are now profiles in life/profiles.ts. Their sole-map homeMap is enforced by compileLife; a wrong-map hook is diagnosed and skipped. They have distinct speed/dwell/resting choices, no greeting and no fabricated audio/line. The regulars' restaurant exclusions do not suppress these identities.

Map owners supply the actual hooks. Character0085 must publish support for the five IDs before production art acceptance. Do not accept the generic unknown-character fallback as a background silhouette. Life's profile behavior tests cover deterministic repeated samples, actual movement plus task pauses, reduced-motion poses, zero returned speech and wrong-map rejection. Current proof is pure/profile-level until the exact actor and hook heads are consumed and walked in production.

## Five-hook integration checkpoint

The proof branch now consumes character01e67d2, landscape6732017, courtyard11b46a6 and town2c43a9e over foundatione02a747. All five canonical IDs have exactly one authored hook in their assigned maps. Node22 tests compile every route, sample real-map collision/entrance clearance, observe movement and task phases, and verify registered actor support and zero greeting/audio. Background profiles are typed to 0085's BackgroundResidentId and forbid greetings.

Nearby background residents retain their task posture. A reader keeps reading and a caretaker keeps working until an explicit observation produces a bounded nonverbal acknowledgment. There is no automatic stand-and-wave loop from player proximity. Role-specific resting direction remains world-fixed.

The ordinary-input production proof has been strengthened to derive legacy initial world state before its first checkpoint. Its first run's initial save-reader failure was a proof bug, not a game defect. The proof does not inject a save or spawn and never accepts an absent world checkpoint as successful movement.
