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
