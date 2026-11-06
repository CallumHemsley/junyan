# Canonical actor handoff

The authority is coordinator `background-residents-v1.md` at c32f128. This module does not register maps, hooks, schedules or voices.

| Canonical characterId | Sole home map | Supported landmark context |
|---|---|---|
| resident-reader | park | `action: idle`, `posture: sit` for reading dwell; `posture: work` for page/hand adjustment. Default book remains attached during walk. |
| resident-courier | town | `action: walk` between pickup/delivery approaches; `posture: work` for parcel grip/hand-over preparation, without dialogue. Default parcel plus fixed satchel. |
| resident-groundskeeper | park | `action: walk` on the short approach loop; `posture: work` for broom/tool sweep. Default broom; explicit tool override is supported. |
| resident-laundry-neighbour | courtyard | `action: walk` carrying cloth basket; `posture: work` for sorting/folding pause. Default laundry-basket, with visible cloth and hand attachment. |
| resident-river-walker | riverbank | `action: walk`, then `action: idle`/`posture: stand` for water-watching, or explicit `posture: react` for a nonverbal look. Travel hat, long coat, folded umbrella. |

Use `BackgroundResidentId`, `backgroundResidents` and `isBackgroundResidentId` from `src/world/characters/index.ts`. Existing `sampleActor(input)` accepts the canonical characterId and contract-v1 facing/action/elapsedMs/reducedMotion. All five support the existing stand/sit/crouch/work/react posture channel. Do not add unsupported semantic actions or greeting lines. Pass exact world yaw and actual travelled distance for gait whenever the caller has them. Default held objects resolve from the resident definition; explicit heldObject remains optional. Profile cadenceMs affects elapsed-time fallback art frames only, never route speed or clocks.

Call existing `drawActor`/`actorObject` in foundation's one sorted compositor. Explicit shared `view.shadeColor` handles every material; inherited alpha is preserved. Skin/hair/head/body/clothing/tool silhouettes are original. Regular player/cast output is unchanged. No bg-* aliases are accepted or registered, and the river walker is the fifth identity rather than a sixth generic passerby.

Life0087 owns speed/dwell/resting and route state. Map0079/0080/0084 owners author radius-aware standable hooks and collision-safe routes at their assigned landmarks. One sole map per identity, no copied hooks into adjacent maps. The character module cannot prove presence or route clearance. Foundation alone wires shared IDs/state/rendering. Integrated acceptance requires all five visible while regulars remain seated, actual walk/task transitions, landmark-scale desktop/phone recordings, scenery crossings and ordinary player clearance. The art fixture's staged cohort is explicitly not that acceptance.
