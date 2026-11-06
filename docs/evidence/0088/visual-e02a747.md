# Independent visual review — complete art checkpoint e02a747

Review date: 2026-11-06 UTC. Exact production head: `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Reviewer: Astra visual/world experience, ticket 0088. Read-only review; no production files, checkout, build, or server changed.

**Fresh visual checkpoint: 2/4 — partial. Full goal remains ACTIVE.** This is an independently assessed stage, not an average that cancels failures. Organic landscape construction and actor/furniture integration remain **1/4**. The complete assembly is a substantial visible improvement over the earlier incomplete checkpoint; neither its old missing-art diagnosis nor its old score is being reused as evidence.

## Evidence and limits

The reviewed set is the corrected **40 PNG arrival fixtures** in [integrated-e02a747](integrated-e02a747): `desktop-{morning,evening}-{map}.png` and `phone-{morning,evening}-{map}.png`, for restaurant, town, courtyard, residential-hall, residential-stairs, apartment, workshop, rooftop, park, and riverbank. Nineteen corrected morning views were inspected individually at full image resolution; corrected desktop town was checked in a labelled contact sheet. Evening views were inspected individually or in labelled contact sheets, including individual desktop restaurant/town/courtyard/rooftop/park views. The additional journey/life captures arriving during this review are **not included** in this verdict.

[Survey runner](integrated-e02a747/survey.spec.ts) explicitly declares these fixtures, places the avatar at each map's first declared entrance, clears active interaction state, injects the save, and dismisses the visible `开门迎客` welcome through its ordinary button before capture. These images prove visible composition at those declared arrivals; they do **not** prove door travel, collision correctness, discoverability while walking, activity success, elevation, persistence, or elapsed-time world life.

Morning uses the actual earlier opening/pickup save `integrated-c4ec7ed/desktop-final.json` (day 1, served 0); evening uses the actual earlier activity save `integrated-23be251/desktop-activity-final.json` (day 1, served 3, with earlier furnishing/garden/lamp progress). The file names are fixture phase labels, not an independently observed clock transition. The comparisons are not perfectly controlled lighting experiments: gameplay and tray state also differ.

[Desktop survey](integrated-e02a747/desktop-survey.json): 20 captures, 1440 × 1000, DPR 1, zero recorded page errors. [Phone survey](integrated-e02a747/phone-survey.json): 20 captures, 390 × 664 CSS pixels, DPR 3, zero recorded page errors. Zero errors is not a visual or gameplay pass.

The separate [assembly audit](assembly-e02a747.md) verified 176 manifest files and 21 lease trees against the recorded owner heads. Actual pixels now confirm the town building art, guarded courtyard, complete rooftop, restaurant interior, and detailed workshop are present. The old generic-overdraw/missing-owner-art package is retired for this head.

## Fresh scorecard

Scale: 0 absent, 1 inadequate, 2 partial, 3 convincing, 4 polished. No failed dimension is averaged into PASS.

| Dimension | Score | Current evidence |
|---|---:|---|
| Distinct destination appearance | 2 | Town, workshop, restaurant and rooftop now read differently. Park/riverbank arrivals remain almost interchangeable; unseen destination interiors cannot be inferred. |
| Mature architecture and physical construction | 2 | Roofs, awnings, windows, counters and tool walls establish real places. Stairs still read as detached flat strips and railing sections; home/hall construction and furnishing remain sparse. |
| Organic landscape | **1** | Repeated stepped canopies, regular isolated background-tree spacing, hard planting islands, and rectangular/triangular shadow cards dominate both nature maps. |
| Materials, depth and light | 2 | Roof tile, plaster, wood and paving have useful differentiation. Many large surfaces are flat, tiled or uniformly stippled; exterior evening shifts colour and shadows but has limited local-light richness. |
| Character/prop scale and seated presentation | **1** | Standing avatar is very small beside restaurant and workshop furniture; restaurant customers read mostly as heads peeking above tables rather than clearly seated bodies. Motion is not rated from these stills. |
| Lived-in detail and resident presence | 2 | Workshop tools, town bicycle/market stall, roof crops and courtyard planting improve specificity. Apartment/hall retain large bare areas; the town arrival shows one nearby background person, not enough evidence of a populated daily rhythm. |
| Camera/edge composition | 2 | Town fills the view well and the player remains visible. Courtyard/roof/stair arrivals devote substantial screen area to green void; nature arrivals conceal their destination-specific landmarks on phone. Traversal camera remains unverified. |
| Game-first UI and visual wayfinding | 2 | Compact pocket controls and scene-first presentation are better. Two town actions are visually identical, and nature arrivals have no clear destination landmark or visible place badge in these views. Word recovery and interaction behavior are not graded here. |
| Breadth, loops, purposeful exploration and activity acting | Not established | Ten loaded map fixtures are not a connected-world playthrough. No duration, number of screenshots, or author PASS establishes this gate. |

## Ranked improvement packages — maximum five

### 1. Make landscape destinations organic and distinguishable at arrival

**Lead: 0084 landscape. Support: 0086 atmosphere; 0078 foundation for camera framing.**

Exact e02 evidence: [desktop morning park](integrated-e02a747/desktop-morning-park.png), [desktop evening park](integrated-e02a747/desktop-evening-park.png), [desktop morning riverbank](integrated-e02a747/desktop-morning-riverbank.png), [phone morning park](integrated-e02a747/phone-morning-park.png), [phone morning riverbank](integrated-e02a747/phone-morning-riverbank.png), and their evening counterparts.

Both arrivals are a wide pale path cutting through broad empty grass, with repeated small tree symbols beyond a straight boundary and a few large outlined tree clusters on hard geometric islands. The park's canopy silhouette uses repeated stair-step blocks; the riverbank repeats that same visual vocabulary. On phone, neither arrival reveals a compelling destination-specific feature; no river is visible in the riverbank arrival frame. This is a **framing observation**, not a claim that the map lacks a river elsewhere. Evening makes several tree shadows conspicuous as long angular cards rather than a broken canopy shadow.

Build varied canopy masses and trunks, irregular ground/plant transitions, overlapping understory, and a more convincing near/middle/far woodland edge. Give the river approach a visible water/shore cue and the park approach a distinct gathering or garden landmark. Rework shadow silhouettes and opacity so they sit on the ground without looking like separate polygons.

**Re-review:** both arrival frames plus an ordinary continuous walk to the park landmark and river edge, at morning/evening on phone and desktop. The two destinations should be identifiable without their text labels.

### 2. Finish residential elevation and connected physical architecture

**Lead: 0081 residential. Support: 0078 foundation for elevation, collision and projection; 0085 characters for feet/occlusion.**

Exact e02 evidence: [desktop morning stairs](integrated-e02a747/desktop-morning-residential-stairs.png), [phone morning stairs](integrated-e02a747/phone-morning-residential-stairs.png), both evening stair fixtures, [desktop morning hall](integrated-e02a747/desktop-morning-residential-hall.png).

The stair view reads as two striped floor/ramp pieces beside a large dark rectangular opening, isolated window sections, railing fragments, and long wall spans. The higher landing's supporting volume is not visually explained. These stills do not establish a raised walking surface, correctly placed feet, or safe occlusion. The hall also has an abrupt wall/railing gap and large undifferentiated floor areas, weakening the sense of a complete inhabited building.

Complete readable risers, landing thickness, structural sides and railing joins with a consistent elevation model. Align doorway landings, actor feet, shadows, and collision with that construction. Add a small number of purposeful hall details tied to residents, not scattered filler.

**Re-review:** ordinary ascent/descent from both approaches, stopping on each tread/landing and passing behind railings, with both phone and desktop motion. Raised stairs remain an explicit later gate; the current static artwork is not proof of that gate.

### 3. Establish a common human scale and convincing seated customers

**Lead: 0085 characters. Support: 0089 restaurant, 0082 workshop, 0081 residential, 0078 foundation.**

Exact e02 evidence: [desktop morning restaurant](integrated-e02a747/desktop-morning-restaurant.png), [phone morning restaurant](integrated-e02a747/phone-morning-restaurant.png), [desktop evening restaurant](integrated-e02a747/desktop-evening-restaurant.png), [phone morning workshop](integrated-e02a747/phone-morning-workshop.png), [desktop morning apartment](integrated-e02a747/desktop-morning-apartment.png).

At restaurant tables, customers show a head and little legible seated torso; the near left customer is reduced nearly to a small head behind the tabletop. The standing player beside these tables and the workshop entrance reads markedly smaller than the furniture assembly. The restaurant's counter equipment and dishes then reinforce a dollhouse-scale mismatch. It is especially noticeable on phone because the scene is enlarged without gaining body articulation.

Agree on one standing/seated body reference against a chair, dining table, workbench, door and bed. Adjust actor anchor, seat elevation, table occlusion and furniture proportions together. Show a legible lap/torso/arms at a table, with hands that can plausibly reach food. Do not solve all scale problems by enlarging the player alone.

**Re-review:** same customer before seating, seated, receiving food, eating, and departing, plus player movement beside each reference prop. Still evidence supports this package; actual animation quality awaits new motion.

### 4. Improve arrival framing and nonlexical navigation cues

**Lead: 0078 foundation. Support: 0090 contextual UI; 0079 town, 0080 courtyard, 0083 rooftop and 0084 landscape.**

Exact e02 evidence: [phone morning town](integrated-e02a747/phone-morning-town.png), [phone morning courtyard](integrated-e02a747/phone-morning-courtyard.png), [phone morning rooftop](integrated-e02a747/phone-morning-rooftop.png), [phone morning park](integrated-e02a747/phone-morning-park.png), [phone morning riverbank](integrated-e02a747/phone-morning-riverbank.png), plus desktop courtyard/roof/stairs.

The town presents two same-looking `看看 →` choices without a visible target distinction. Rooftop/courtyard arrivals spend a large lower region on flat green outside-map space, while the roof's garden/pergola destination is outside the phone arrival frame. Nature arrival views lack a visible map badge and are dominated by generic path/grass. The result is less immediate orientation than the richer art could provide.

**The blurred Chinese tokens are intentional learning fog**, confirmed at exact-head `src/style.css:889–895` (`.word.fogged`, blur 1.2px, opacity .55); this is not a renderer bug or a request to remove vocabulary recovery. Preserve the Mandarin DOM learning contract. Distinguish targets with scene highlighting, a stable object/door pictogram, proximity emphasis or target-linked placement that remains useful before a word is recovered. Tune arrival framing and edge treatment to retain player visibility while showing a destination cue and reducing unnecessary void.

**Re-review:** a first-time phone user approaching two adjacent interactions and leaving/returning through real doors, without debug labels. Confirm recovery still works and touches do not hit the wrong action.

### 5. Turn attractive props into a denser lived-in world with local light and visible routines

**Lead: 0087 world-life. Support: 0086 atmosphere, 0081 residential, 0079 town, 0080 courtyard, 0083 rooftop, 0082 workshop.**

Exact e02 evidence: [desktop morning apartment](integrated-e02a747/desktop-morning-apartment.png), [desktop evening apartment](integrated-e02a747/desktop-evening-apartment.png), morning/evening hall, [desktop morning town](integrated-e02a747/desktop-morning-town.png), [desktop evening town](integrated-e02a747/desktop-evening-town.png), [desktop morning workshop](integrated-e02a747/desktop-morning-workshop.png), morning/evening rooftop.

Town awnings/roof tiles/market stall and workshop tools are effective place-specific details. By comparison, the apartment has a very large bare central floor; hall props feel individually placed in a largely empty room. The courtyard and roof are cleaner and more regular than a long-used residential environment. The exterior pairs visibly shift toward cooler/greyer evening light and longer shadows; the town lamp has some local warmth. Interiors remain much more similar between saves. This is not evidence that lighting is absent, and the lit fixture need not imply nighttime.

Concentrate detail around use: a believable resident's work surface, stored seasonal objects, a worn route, plant-care residue, hanging/stowed tools, or an occupied resting place. Let routines leave readable temporary state. Coordinate practical/window light, contact shade and material response so evening changes more than the global tint. Background residents need distinct silhouettes and purposeful local behavior; a single static arrival frame cannot prove or disprove their schedules.

**Re-review:** an ordinary multi-minute route revisiting these places after activities, with visible resident movement/work/rest and local-light changes. Validate durable progression independently. Keep this package subordinate to coherent layout and readable walking paths.

## What this checkpoint establishes

The complete-art assembly has moved from obviously missing/overpainted owner work to recognisable authored places. The workshop is the strongest current example of useful prop specificity; town and rooftop now have unmistakable authored architecture. Outdoor day-state variation exists and the compact HUD allows substantial scene space.

The wider ambition is still unfulfilled at this evidence level: rich connected exploration, meaningful loops, prolonged activity play, raised stairs and background residents need ordinary motion and state evidence. The independently reproduced **435 passing / 1 failing rule test remains a gate**; this visual review neither diagnoses nor waives it. No production approval or full-goal PASS follows from these fixtures.

## Capture identity anchors

These SHA-256 values identify representative corrected files actually reviewed; all refer to `integrated-e02a747/` at the exact production head above. Earlier welcome-covered captures were discarded.

| Capture | SHA-256 |
|---|---|
| desktop-morning-restaurant.png | `036859150a2472c055d29388978975641bbe83b6154a5f0935f6f8e4e4a57eac` |
| desktop-evening-restaurant.png | `ee952331c4c49745e9ea4e643b4dcc064f90204adb9b22511f0dffc01fe9ddaa` |
| desktop-morning-town.png | `363b42f9bf4ce2391a8f015fdbfa9a2e507036efa539efefde70c9c1f5f7394b` |
| desktop-evening-town.png | `70db39f51bc7d65d60dc6b1d0ac0339426e27013bd7dc8fb1aa8f69d80a245b7` |
| desktop-morning-park.png | `ed232d13314aaa13be1e10c54f0c93a4751ad197562cd175c5d28cd8e5814223` |
| desktop-evening-park.png | `fa988b2976b03a8f50bd5470a16c842e6ea923b9302b6315c30a6d271759f339` |
| desktop-morning-residential-stairs.png | `167a29574b924c2788fc256b62a47a64d0c7712be3888bc6af1d52b7a6b21496` |
| phone-morning-restaurant.png | `fdeacd28cf41c629558729f24c178d8dd753933b348b20321058473fded348d0` |
| phone-morning-town.png | `98b37e33793c5f152103b322b6f4dcc750534eb6b1ff86fed10c58af5f474124` |
| phone-morning-park.png | `3ae3886663be0a33f751a71bf9dbf0dccffff72ba711c67c321a32a8c491a26f` |
| phone-morning-riverbank.png | `63a6e746246933aec5c2a4279f7fc9b18e8c378b8e3e6fd976d484462fe972bf` |
| phone-morning-residential-stairs.png | `43ea9e416b8ac5d34137e48eeeb2cc6e6c8d61198b196c0e3d6aa7fd04b5c1f9` |

