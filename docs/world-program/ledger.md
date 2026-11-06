# Connected world program

Status: **ACTIVE**. Started 2026-11-05. No numeric token budget.

The goal is a large, beautiful, connected, walkable Mandarin pixel life-sim world with the breadth, density, character and exploration ambition requested by the human. Five decorated rooms, map buttons, empty oversized maps or one polished street do not complete it. Existing breakfast service, opening, voices, learning, journal, gifts and day progression survive.

Baseline main is `8cd5bc209b7dc2d91cc0f765991de313f813f4eb`. All remote branch ticket paths were scanned after fetching on 2026-11-05. Highest existing ticket was 0076. This branch reserves 0077 through 0088 centrally. Only the program coordinator reserves subsequent IDs.

## Ownership and allocation

The parent creates the initial ten Sol 6.1 medium builders and Astra reviewer. This coordinator must not duplicate them. IDs were relayed by the parent on 2026-11-05. Each owner writes its own ticket and evidence directory; only the coordinator writes this ledger and contract. Owners publish WIP commits early and after each buildable unit. No force pushes. GitHub tools own PR metadata and merges; git owns branch publication. No gh, audio generation, AWS writes, manual deployments or changes to local preview 5474.

| Ticket | Builder | Branch | Exclusive production paths | Thread / head / proof |
|---|---|---|---|---|
| 0078 | 1. Foundation, travel, player, camera | `codex/0078-world-foundation` | src/world/* except the explicitly delegated subdirectories; src/App.tsx; src/style.css; src/save*; src/contracts.ts; src/navigation*; src/neighbourhood/*; src/scene/renderer*; src/scene/RestaurantScene.tsx; package.json; pnpm-lock.yaml; offline/build/config files; integration e2e tests | `01a1ae1f-45c2-71c3-9305-a64991b6007b` on host `durable`; no implementation head or proof received |
| 0079 | 2. Town street and restaurant exterior | `codex/0079-town-street` | src/world/maps/town/*; src/world/art/town/* | `01a1ae1f-9b25-7540-9729-c9106db4c055` on host `durable`; no implementation head or proof received |
| 0080 | 3. Courtyard and cats | `codex/0080-courtyard` | src/world/maps/courtyard/*; src/world/art/courtyard/*; src/features/cats/* | `01a1ae1f-7fc4-77ff-8d9d-144d1889304e` on host `durable`; no implementation head or proof received |
| 0081 | 4. Residential halls, stairs, apartment | `codex/0081-residential` | src/world/maps/residential/*; src/world/art/residential/*; src/features/apartment/* | `01a1ae1f-60be-71ac-b17f-c10bb16c706b` on host `durable`; no implementation head or proof received |
| 0082 | 5. Workshop and repair yard | `codex/0082-workshop` | src/world/maps/workshop/*; src/world/art/workshop/*; src/features/repairs/* | `01a1ae20-69b1-74c6-855c-c2e228970064` on host `durable`; no implementation head or proof received |
| 0083 | 6. Rooftop garden and skyline | `codex/0083-rooftop` | src/world/maps/rooftop/*; src/world/art/rooftop/*; src/features/garden/* | `01a1ae20-85bf-7293-b853-cd8a6ebb7057` on host `durable`; no implementation head or proof received |
| 0084 | 7. River, park, paths and outer landscape | `codex/0084-landscape` | src/world/maps/landscape/*; src/world/art/landscape/* | `01a1ae20-bd21-7127-bf23-09146cdb604d` on host `durable`; no implementation head or proof received |
| 0085 | 8. Directional character pixel animation | `codex/0085-characters` | src/world/characters/* | `01a1ae20-a104-7194-a9ec-12689dfeb07f` on host `durable`; no implementation head or proof received |
| 0086 | 9. Lighting, weather, water and foliage | `codex/0086-atmosphere` | src/world/atmosphere/* | `01a1ae20-d945-75c9-a467-153692bd804e` on host `durable`; no implementation head or proof received |
| 0087 | 10. Residents, wildlife and exploration | `codex/0087-world-life` | src/world/life/* | `01a1ae20-f4aa-770f-aefd-1821e92d1072` on host `durable`; no implementation head or proof received |
| 0088 | Independent Astra review orchestrator | `codex/0088-world-review` | `docs/evidence/0088/*`; own ticket | `01a1ae1f-27e8-72f0-8ffc-26564922f069` on host `durable`; no verdict |

0077 owns `docs/world-program/*` and its ticket. Only foundation builder 0078 edits production integration, shared schemas, renderer, saves, dependencies and offline cache. Map owners own local JSON/art/render adapters and do not patch the registry. Character and atmosphere owners export modules; foundation wires them. Existing feature dialogue/audio references remain intact. No production audio file is owned by this program.

## Throughput checkpoint

- **Blocking first steps.** Publish allocation and contract. Foundation confirms the executable schema and projection adapter, then publishes a buildable walking/camera seam. Compare existing rasteriser camera adaptation with a thin world canvas prototype before changing engines or dependencies.
- **Independent workstreams.** Builders 2–7 author map layouts and art in isolated modules. Builders 8–10 prototype animation, atmosphere and life. Each can render an isolated comparison while foundation builds the seam.
- **Shared mutable state.** Foundation alone writes engine integration and save contracts. Owners write separate evidence files; coordinator reconciles their facts into this ledger.
- **Smallest safe decomposition.** Ten domain owners match the requested breadth. First integration joins town, one interior, movement and an existing activity. It is a verifiable unit, not program completion.

## Buildable units and dependencies

1. Contract reservation and ownership, then foundation schema validation and camera/input round-trip proof.
2. Town street plus restaurant entrance and return, retaining the full opening/service/change/journal journey.
3. Courtyard, residential hallway and stairs, apartment, workshop and rooftop connected by reciprocal world entrances. Per-map safe return positions survive reload.
4. Riverbank, park, bridge/path loop and outer districts connect to town and courtyard. Authored landmarks and activities occupy reachable paths.
5. Character/atmosphere/life modules integrate through the single foundation writer. Full experience review follows on desktop and phone, including motion and traversal videos.
6. Evidence-backed defect and art passes continue. Further tickets are allocated centrally after gaps are demonstrated.

## Completion gates

All gates remain unverified. No game change has landed from this program.

- Continuous walk/door/stairs route visits restaurant, apartment, cats, workshop, rooftop, park and river, and returns to the original activity without state loss.
- Collision, pathfinding, graph validation, camera edges, inverse pointer mapping, keyboard and touch work on real rendered scenes.
- Save reload preserves map, player, facing and return points. Legacy and corrupt saves recover safely without losing valid game, journal, gift or opening progress.
- Original opening, service, change, journal, authoritative restaurant day, existing audio and offline checks pass.
- Desktop and phone screenshots and motion recordings are inspected. Console is clean; targets are 44px; Chinese remains tappable DOM; focus, reduced motion and hidden-tab suspension work.
- Reviewer measures reachable floor area, shortest and exploration route lengths, distinct landmarks, inhabited places, repeated visual motifs and meaningful return visits. Raw array dimensions do not count as breadth.
- Independent reviewer reports EXPERIENCE scores with evidence and remaining defects. Scores do not override failed functional gates. Full scope remains active until repeated review withstands audit.

## Runtime and coordination record

Cloud shell is operational in `/workspace/junyan`. Environment reports source configuration `dc9cb9f5-85c5-4d05-b8ce-cdc0265b462f~cecfg_6aeca0160340819b8d94a0335a99f1c7`, different from the requested saved environment. Parent clarified that the saved environmentConfigId and runtime source_config_id are different identifier types. The attached managed cloud runtime is authorized after verifying this repository and baseline. Both checks passed. No local worker is used.

No persistent-goal mutation or cross-thread send tool is exposed in this session. This committed ACTIVE ledger is a durable fallback, not a claim that a native goal was created. IDs are recorded above. Parent must relay this contract to the initial builders when cross-chat sending is unavailable. Do not infer worker liveness from silence or wait timeouts. Record actual thread cursor, process handle or remote push when available.

Pstack source was fetched from configured `cursor/plugins` into `/workspace/cursor-plugins`. Read poteto-mode and orchestrate/autopilot-full/feature/shipping. Human instructions override plugin defaults: Sol medium builders, Astra review, GitHub connector, no force pushes, cloud only. Experience First keeps traversal and real exploration as the target. Separate Before Serializing Shared State gives each builder independent map/art paths and reserves shared engine files to foundation.

## Latest checkpoint

- Allocation and contract published as `fb167fd5047010beaac7809b4d6a41a804b7fb42`, PR https://github.com/CallumHemsley/junyan/pull/27. No merge verdict yet.
- Native thread read confirmed foundation idle awaiting allocation. Root must resume it with ticket 0078, branch `codex/0078-world-foundation`, port 5480 and the published contract. This session cannot send or start turns in peer chats.
- Native thread reads showed the other nine builder chats active. This is a status observation, not implementation proof. Their remote tips and artifacts remain unverified.
- Residential compared gallery and switchback prototypes, provisionally preferring switchback. Requested safe-position recovery after furniture edits. Foundation must account for dynamic colliders without duplicating apartment state.
- Independent review reported baseline P1 gaps in button-only travel, movement outside restaurant, per-place persistence and button-driven journey coverage. These match foundation and integrated-review assignments. Reviewer did not claim runtime evidence.
- Root corrected runtime authorization. Review can now run in the attached managed cloud runtime. Contract example `example-module.ts` provides the initial typed data shape; foundation still owns production types and schema.

## Verification and next actions

- `node node_modules/typescript/bin/tsc --noEmit --skipLibCheck --target es2022 docs/world-program/example-module.ts` passed.
- `python -m json.tool docs/world-program/example-map.json` passed. `git diff --check` passed.
- The first `pnpm exec tsc` attempt stopped in pnpm's dependency reinstall wrapper before compilation. The direct installed compiler then passed. No lockfile or dependency changes were made.
- A subsequent native wait snapshot confirmed foundation and reviewer have active turns. The earlier idle observation is superseded; no restart is needed on the evidence currently available.
- Foundation next publishes executable contract import paths, renderer adapter, map validation and camera/input proof under 0078, then integrates owner artifacts.
- Reviewer next reviews PR 27's ownership/contract and produces the independent baseline evidence under 0088. Its runtime identifier blocker has been resolved by parent clarification.
- Each builder next records its branch head, checkout, process handle and first artifact in its own evidence directory. Coordinator compares actual diffs and integration instructions before accepting delivery.
- The full goal remains ACTIVE. There is no integrated game head, runtime acceptance verdict or merge from this program yet.

## Published artifact review, first data tranche

Actual remote tips inspected after fetch:

| Owner | Tip | Inspected artifact |
|---|---|---|
| 0078 | `2532c61` | Executable Zod schema, geometry, camera and adapter proposal |
| 0079 | `d13dd48` | Active objective and layout rationale; no map at this tip |
| 0080 | `c176f5a` | Courtyard map, habitat projection and layout study |
| 0081 | `856d8a6` | Hall, stairs and apartment maps; furniture transform proposal |
| 0082 | `2ed1ad3` | Workshop map and lamp/toy anchor integration requests |
| 0084 | `14a2ce1` | Park and riverbank maps and authoring source |
| 0085 | `b94fd1f` | Character direction prototype and image artifact |
| 0087 | `78e65d6` | Schedule sampler design and canonical actor IDs |

Rooftop and atmosphere had no remote branch at this fetch, but native thread snapshots showed active tool calls and reports of authored units. Reviewer reported a successful production baseline build and a capture setup failure. None of those status reports is a runtime acceptance verdict. All eleven threads remain accounted for.

`audit-published.mjs` reads the published foundation schema/geometry and map JSON directly from git refs. `published-map-audit.json` records the exact tested heads. Seven map payloads passed Zod parsing and local default-spawn/entrance standing checks. This audit does not claim graph reachability or visual quality.

### Required fixes and integration handoffs

- **0084 landscape:** `park.pond-deck` at (61,33), radius 1.4, is wholly inside collider `park.pond-2`, rectangle (40,29,23,7), at head 14a2ce1. The nearest edge is 2 tiles away before accounting for player radius. No standing point can invoke this anchor. Move the anchor onto reachable decking or correct collision geometry, then prove an ordinary-control approach.
- **0078 foundation and 0080 courtyard:** canonical actor IDs from world-life are `white-cat` and `black-cat`; courtyard currently proposes `cats.white` and `cats.black`. Use one explicit normalization at the registry boundary or update the courtyard hooks. Preserve cat clue anchors from `catHabitat` during encounters.
- **0078 foundation:** the initial `WorldState.activeActivity` stores a feature ID only. Contextual entry needs the anchor/interaction identity too, or an equivalent explicit selected-target transition. Workshop's `repair-lamp` and `repair-toy` dispatch the existing switch action before controls open; cats need existing selected-target actions. Do not replace the map with legacy diorama views.
- **0078 plus feature owners:** publish an embedding prop/hook for controls-only UI. The live world stays the main viewport for apartment, repairs, cats and garden. Feature owners own their component extraction; foundation alone wires App and shared state. Existing reducers, voices and saves remain authoritative.
- **All art owners:** foundation adapter proposal is in `docs/evidence/0078/adapter-v1.md` at 2532c61. It uses logical canvas pixels, `project(point,z?)`, and ground/object/foreground passes. No DPR multiplication, loop or DOM in owner art. Foundation still needs a concrete per-object ordering contract so owner draw calls do not paint whole building layers over actors incorrectly.

Cross-thread send remains absent. Root relays these same-scope fixes; no replacement workers are warranted by current evidence.
