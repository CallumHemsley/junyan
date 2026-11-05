# World contract v1

Status: proposed executable seam, published for coordinated authoring. Foundation 0078 owns the implementation and must report any shape change before dependent integration. This document does not claim an existing API.

## Coordinates and content

World coordinates use continuous tile units with positive x and y along the two ground axes. Map bounds start at zero. Integer cells identify authored terrain. A point is `{x:number,y:number}` and a rectangle is `{x:number,y:number,width:number,height:number}`. Geometry contains finite numbers only. Art cannot silently change navigation geometry.

Each map owner exports a JSON-compatible `WorldMapDefinition` from `src/world/maps/<owner>/index.ts` with the following fields. The JSON payload lives beside the export and is parsed by foundation's Zod schema at the registry boundary. Owners can prototype payloads before that schema exists.

| Field | Shape and meaning |
|---|---|
| `version` | Literal `1` |
| `id` | Stable map ID from the table below |
| `bounds` | `{width,height}` in tile units |
| `defaultSpawn` | `{x,y,facing}`; facing is `north`, `east`, `south` or `west` |
| `walkable` | Array of rectangles forming the traversable surface |
| `colliders` | Array of `{id,rect}` excluded from walkable surface |
| `occluders` | Array of `{id,rect,height,fadeWhenPlayerBehind}` for foreground depth |
| `entrances` | Array of `{id,position,facing}` specifying safe arrival points |
| `exits` | Array of `{id,rect,targetMapId,targetEntranceId,kind}`; kind is `door`, `stairs` or `path` |
| `anchors` | Array of `{id,position,radius,featureId,interactionId}`; featureId uses existing `restaurant`, `apartment`, `cats`, `repairs`, `garden`, or `exploration` |
| `terrain` | Array of `{id,rect,material,variant}`; material and variant refer to owner art |
| `props` | Array of `{id,kind,position,width,height,layer,variant}`; layer is `ground`, `object` or `foreground` |
| `palette` | Named RGB triples, extending accepted cream/jade/ink/wood/brass relationships |
| `npcHooks` | Array of `{id,position,route,characterId}`; route is an array of points |
| `landmarks` | Array of `{id,position,kind}` for coverage and experience review |

IDs are namespaced by map. The shared registry, schema, validator and loader belong to foundation. Do not create ten validators or ten world engines. Unsupported fields go in an owner's proposal, not an unannounced divergent schema.

## Map graph and ownership

| Owner | Map IDs | Required connections and anchors |
|---|---|---|
| 0078 foundation | `restaurant` | Town entrance/return; existing service and kitchen anchors |
| 0079 town | `town` | Restaurant, courtyard, residential hall, workshop, park, riverbank |
| 0080 courtyard | `courtyard` | Town, residential hall, park; cats activity |
| 0081 residential | `residential-hall`, `residential-stairs`, `apartment` | Hall to town and courtyard; hall to stairs; stairs to apartment and rooftop; apartment activity |
| 0082 workshop | `workshop` | Town entrance and return; repairs activity; authored yard can be in the same map |
| 0083 rooftop | `rooftop` | Residential stairs and return; garden activity |
| 0084 landscape | `park`, `riverbank` | Town to each; park to courtyard; park to riverbank makes an exploration loop |

For each required pair A/B, A's entrance from B is `from-B` and exit to B is `to-B`; the exit targets B's `from-A`. Map-local positions are chosen by that owner. A reciprocal exit does not require identical coordinates across maps. Arrival points must stand outside exit trigger rectangles to prevent bounce-back. Path edges should visually continue on arrival; doors and stairs should match their architectural setting.

The table is the first connected tranche, not a world-size cap. Additional maps and repeated places need coordinated IDs and evidence of useful reachable content. No required edge may be replaced by a map-navigation button.

## Navigation and projection

Foundation supplies pure collision, movement, pathfinding, nearby-anchor and transition functions. Movement uses a player footprint, not just a point. Sweep each segment to prevent tunnelling and diagonal corner cuts. Graph validation rejects unknown target maps/entrances, duplicate IDs, blocked spawns, unreachable anchors and exits. Record connected reachable floor area separately from bounds.

A camera transform projects world positions into viewport pixels; its inverse maps pointer pixels back to world ground. Input uses the actual canvas bounding rectangle and accounts for device pixel ratio, letterboxing and camera movement. Test round trips, all viewport edges, resized phone orientation and cameras clamped at map bounds.

The foundation compares extending the existing Pixel Plays rasteriser with a thin dedicated world surface using existing primitives. Retain the current renderer unless the measured prototype establishes a concrete limitation. New dependencies or renderer replacement need a recorded comparison, not a speculative engine rewrite.

## Character, atmosphere and life seams

Character owner exports pure pose sampling from `{characterId,facing,action,elapsedMs,reducedMotion}`. Actions initially are `idle`, `walk` and `interact`. Output is a named frame/pose and world-relative draw commands, with no requestAnimationFrame, DOM listener or save writes. Preserve ensemble identity and distinguish directions, foot contact and silhouettes. Foundation adapts legacy renderer calls.

Atmosphere owner exports sampling from `{mapId,day,timeOfDay,elapsedMs,seed,reducedMotion}`. Output is palette/light modifiers and decorative draw commands. Effects do not change collision or game clocks. Use injected elapsed time and seeded variation. Foundation owns the only frame loop and hidden-tab suspension. Water and foliage remain legible at rest with reduced motion.

Life owner exports pure state transitions from explicit world state, time and RNG plus map NPC hooks. NPCs obey the same walkability geometry. Exploration returns named events; foundation integrates saves and existing feature reducers. Life never advances the authoritative restaurant day independently. No new scripted speech without an existing appropriate voiced line.

Before production wiring, foundation publishes the exact draw-command adapter in its evidence directory. Art, character and atmosphere owners supply small runnable adapters against it. Until then isolated visual prototypes may use local adapters inside owned paths.

## Save and activity continuity

Foundation adds a versioned world state to the existing game boundary, with active map, position, facing, per-map safe return positions and explicit active activity. Preserve restaurant.player independently from world traversal coordinates. Returning from an activity restores the world anchor approach position, not the map default. Entering an activity routes to the existing feature reducer and existing registered content/audio.

Validate external saved state at load. Legacy saves infer a safe world location from the current neighbourhood location and retain all valid service, opening, day, journal, gifts and feature state. Unknown map versions, invalid coordinates or obstructed positions recover to a safe entrance without resetting unrelated data. Migration is idempotent. Corrupt nested world state does not invalidate an otherwise valid game.

## Presentation and proof

The world and camera occupy the play area. Interactions appear at nearby anchors with real 44px DOM controls. Chinese signs, dialogue, labels and words remain tappable DOM using existing content infrastructure. No baked text, default pinyin, English after the premise or vermilion scenery. Keep replay and journal usable. Focus returns to the invoking control after dialogue/word cards close.

Every owner records source head, contract version, actual map bounds, reachable floor area, route/landmark evidence, screenshot paths, motion evidence, checks run and failures in its owned evidence directory. A render-only harness is useful for iteration but cannot establish integration acceptance.

## Example module

`example-map.json` beside this document is a structural fixture, not finished map art or an accepted map scale. Its actor and interaction IDs are placeholders to replace with existing registered IDs. The town owner supplies the reciprocal entrance before graph validation can pass.

A builder module can initially export raw data without inventing a shared schema:

```ts
import definition from "./map.json";
export const mapDefinitions = [definition];
```

Foundation imports each owner's `mapDefinitions`, validates them with one schema, and registers the validated result. Residential and landscape modules export multiple definitions through the same array. Do not copy the example's plain floor as finished level design.

The first prototype runtime snapshot is `{mapId, position, facing, camera:{x,y}, returnPositions, activeActivity}`. Camera x/y are the world-space viewport focus; zoom and viewport dimensions are render inputs, not persistent game rules. Foundation may refine the typed state before integration, recording the version and migration implications. Actors and atmosphere sample the explicit elapsed-time inputs defined above. Renderer-specific draw commands remain the foundation's published adapter rather than a second renderer hidden in each module.
