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

## Toolchain and second artifact checkpoint

The default pnpm wrapper can try to reconcile dependencies before running a command and abort without a TTY. Do not churn the lockfile to solve this. Direct installed entry points bypass that wrapper:

```sh
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js --host 0.0.0.0 --port YOUR_ASSIGNED_PORT --strictPort
node node_modules/@playwright/test/cli.js test --config YOUR_OWNED_CONFIG
```

Paths exist in this cloud checkout. The TypeScript example check passed; Vitest, Vite and Playwright version commands started successfully. Installed versions here are Vitest 3.2.7, Vite 7.3.7, Playwright 1.64.1 and Node 24.22.1. This is not a frozen-install or required-Node-22 verification claim. Review's existing Node 22 toolchain and browser cache are reported in its owned ledger; each worker verifies its own paths. `pnpm --config.verify-deps-before-run=false` is a suggested alternative from root, not tested by this coordinator.

Foundation now publishes the executable art contract at `9f144d5`. Root should relay that exact import path to all art owners. Rooftop `0a88378`, atmosphere `9f019f4`, and reviewer `340adcc` are now remote, so every initial builder/reviewer has a recoverable published branch. Town has advanced to `3747266` with its map.

The repeated schema/standing audit now covers nine map payloads, including town and rooftop. All parse and have standable default spawns and entrances. The pond anchor issue remains at landscape's last fetched head; parent reports owner is actively fixing it. Await a corrected pushed head before closing it.

Independent review at `340adcc` supplies real baseline phone/desktop captures and 2 passing normal-opening/menu/reload journeys. This proves the current baseline's limitations, not connected-world acceptance. Its contract review found no ownership collision and requested precise time units and portal-ID scope. Contract and typed example now clarify both. Executable rendering/depth and clock conversion still need foundation integration proof.

Coordinator visually inspected the character direction sheet at `b94fd1f` and courtyard composition study at `c176f5a`. Character palette/accessory identities are readable, but adjacent directions repeat silhouettes; motion/diagonal readability is not established by the still sheet. Courtyard loop B gives alternate approaches, but broad paving, repeated grass texture and sparse architecture remain prototype-level. These are same-scope art iteration notes, not a claim to have inspected production scenes.

## Runtime-driven follow-up allocation

Re-scanned all fetched remote ticket paths: highest 0088. Reserved **0089 restaurant world art** on 2026-11-06. This adds a focused discovered scope after actual e6270d0 runtime captures exposed generic restaurant blocks. Exclusive lease is `src/world/art/restaurant/*`, ticket 0089 and `docs/evidence/0089/*`; it is removed from foundation's broad art ownership. Foundation retains restaurant map, service rules, App/save/renderer and all integration. Branch `codex/0089-restaurant-world-art`, isolated cloud worktree `/workspace/junyan-0089`, strict port 5493. Native subagent handle follows spawn.

Actual foundation e6270d0 build and one normal-opening/held-movement/reload check passed in isolated coordinator cloud worktree. Evidence is `runtime-e627/`. Full graph, activities, touch, visuals and the distinct checkpoint-race regression remain open.

PR28 exact f9ad801 evidence audit, independently checked by Astra subagent `/root/review_evidence_integrity`: 27 published artifact hashes match; two manifest entries reference missing .last-run.json blobs. Returned as P2 via PR28 comment 6672933089. Stored baseline passes and intentionally failing save regression agree with snapshots. No gameplay acceptance or merge verdict given. New review head 2229625 adds static seam probes, not a manifest fix.

0089 spawned as native cloud collaboration agent `/root/restaurant_world_art`, model GPT-6.1 Sol, medium reasoning. Parent owns this handle and can message it directly. Brief includes isolated branch/worktree, exact lease, active goal, current implemented renderObjects, evidence-driven art gap, no shared writes and no audio. Builder is running; no authored tip yet. Foundation/root notified through PR27 comment. This is the first added focused builder beyond the initial ten.

## Contextual HUD allocation

Verified highest fetched remote ticket 0089, then reserved **0090 contextual world UI**. Independent phone capture showed the legacy service page covering the world and clipping tray controls. Exclusive lease `src/world/ui/*`, own ticket and `docs/evidence/0090/*`; foundation retains App/shared CSS/state/save and dispatch. Branch `codex/0090-contextual-world-ui`, isolated cloud `/workspace/junyan-0090`, port 5494. This is a focused UI module, not a second application integration writer. Selected physical restaurant targets are now explicit in integration-v1.1; foundation must implement them before UI acceptance.

0090 native cloud agent `/root/contextual_world_ui` is running on GPT-6.1 Sol medium with isolated lease and explicit physical-target contract. Both focused additions preserve foundation as sole App/shared-schema writer.

Atmosphere PR29 at ad741f1 inspected. Its base material shade function is present, but map art hardcoded fills do not automatically call it. Integration-v1.1 now specifies one optional backwards-compatible `WorldRenderView.shadeColor` callback, mandatory in production. Foundation supplies one authoritative-phase shader; map/art and generic painter use it for material colors. Phase-independent base materials plus particles is not lighting acceptance. PR29 remains draft and full integrated lighting verification is open.

## Published integration corrections

Latest nine map payloads parse and pass local spawn/entrance/anchor sampling. The combined ten-map portal-reference graph has no missing target entrances, trigger-overlapping arrivals or graph-disconnected map IDs. Exact heads are recorded in published-map-audit.json. Pond anchor local approach defect clears at 6e04784; actual walking routes still require integrated runtime proof.

0089 first head 480587b had a customer projection bug: order.customer stores a Chinese name while code matched character.id. Coordinator inspected actual content and returned P1 directly. Owner fixed at 6b09c77 and added actual-content tests for four canonical customer descriptors, stable table mapping, meals and tray. Preview handle49941 is reported on strict5493. Further visual inspection and integrated review pending.

0090 first WIP 8b90816 publishes typed scoped shell/table/kitchen/pocket components. Coordinator returned nested-button risk from ReactNode action labels plus word-card Escape/focus and visible token-label concerns. Owner is fixing before final API acceptance. Main application integration remains foundation-owned.

Actual town actors use appearance tags backpack/glasses. Alias mapping to xiao-zhou/zhang-laoshi was verified against current content and added to integration-v1.1. Root/foundation and owners notified through PR27 comments.

Latest foundation 74a5213 now supplies shadeColor but also wraps the canvas in shadedContext. That wrapper recognizes outputs through a mutable set to avoid double shading. Coordinator requests that explicitly shaded art bypass the compatibility wrapper and emissive atmosphere layers use the raw context; otherwise base-color identity depends on paint history and glows can be shaded again. Callback remains the single material-lighting seam; no second clock or artist-specific phase logic.

Residential 45ef838 proposes raised surfaces; current production view/camera remains flat. Integration-v1.1 specifies one piecewise tread/landing table, surfaceHeight + surfaceLevels, absolute-Z project, explicit actor/NPC foot height, camera focusZ and height-aware inverse picking. Foundation retains shared camera/picking; residential retains authored geometry. Life runtime consumers and species-specific rendering remain explicit acceptance gates.
