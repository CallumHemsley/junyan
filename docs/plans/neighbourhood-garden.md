---
title: Rooftop garden
status: planned
created: 2026-11-05
ticket: 70
---

# Rooftop garden

The player turns a neglected roof into a shared place to sit. Caring for plants makes Mandarin conditions and consequences visible. The first release contains three pots, six placement sites, a movable shade, one recurring neighbour and a bird visit. There is no gardening economy, food crop, timer, plant death or vocabulary quiz.

## First session

After the mandatory hospital opening, the shared neighbourhood navigation offers the roof. The existing restaurant session stays intact. On first arrival the scene contains scattered empty crates, a bare trellis, three small plants and an unused bench. Clearing the crates is one reversible setup action. It reveals the placement sites without adding a rubbish inventory.

The neighbour points to the flower pot. Its soil is dark and its tray holds a small glint of water. The neighbour says 土还是湿的，先别浇水. The player can inspect, wait or water anyway. Waiting leaves the plant ready to grow when the restaurant day advances. Watering wet soil visibly fills the tray and produces a recoverable droop on the next in-game day. No plant dies and no reward disappears permanently.

The next pot is dry. A pale cracked soil texture and the line 这盆土干了，浇一点水 explain the contrast. Watering once darkens the soil. An additional dose is a deliberate visible choice, not an accidental double-click. The third pot introduces arrangement. The player selects the pot and then a vacant site. Selection has a clear outline and a cancel action. Occupied sites cannot silently replace another plant. A movable shade changes which site is protected. The scene shows its shadow, so 把花放在阴凉的地方 has a visible referent.

The player can rearrange freely. Free decoration is never gated by recovered words. The first visit ends whenever the player chooses to return home or to work. Completing the existing restaurant day and using its next-day action advances the shared day. Returning to the roof reveals growth, weather and the result of the player's care. The neighbour's line and plant shape explain each result. Completing several healthy growth steps opens flowers, fills the trellis and brings a bird to the small tree. The bench becomes a communal retreat. A planter gift for the apartment is earned once and remains available after reload.

## Controls and comprehension

Click or tap a pot to select it. Its real DOM label and the neighbour's segmented dialogue use WordToken. Click a vacant site to move it. Keyboard users reach the same controls with Tab and activate with Enter or Space. Escape cancels a pending move. A separate water button targets the selected plant, and a clear wait action acknowledges the wet-soil advice. Shade placement is reversible with the same select-then-place pattern. All controls have Chinese accessible names and at least 44px hit areas. A visible summary identifies the selected plant, soil and care result without relying on colour alone.

Every line can replay through the shared playback callback. Tapping words opens the existing word card and records a lookup. Pinyin appears only there. Related words recover after a meaningful action or an observed day outcome, never merely because the view mounted. No English appears on the game surface. Text remains DOM content, including day, weather and plant labels.

The authored content includes these lines, with dictionary pinyin and gloss retained as metadata only:

| Line | World evidence | Words grounded by action |
|---|---|---|
| 土还是湿的，先别浇水。 | Dark soil and pooled tray, then droop if watered again | 土、湿、先、别、浇水 |
| 这盆土干了，浇一点水。 | Cracked soil becomes dark after one dose | 盆、干、一点、水 |
| 把花放在阴凉的地方。 | Shade covers the selected destination | 花、放、阴凉、地方 |
| 今天下雨，不用浇水。 | Rain and wet exposed soil | 今天、下雨、不用 |
| 水太多了，明天再看看。 | Waterlogged tray and lowered leaves | 太多、明天、再 |
| 比昨天高一点了。 | Climber gains a visible segment against the trellis | 比、昨天、高 |
| 花开了，小鸟也来了。 | Open flower heads and bird on branch | 开、小鸟、来 |

Keep the script small. New controls and labels are presegmented authored JSON too. Reuse canonical existing word IDs only when the dictionary entry is identical. Garden-specific IDs use the garden. prefix. The neighbour reuses an existing resident appearance and stable voice; the author must name the chosen cast member and avoid inventing a conflicting identity. The roof can mention apartment life, but repairs and cats are optional enrichment rather than unlock requirements.

## Rules and progression

Use an explicit GardenState and a pure reducer. Store a day cursor, the three plant records, bounded soil/care/growth values, arrangement, shade site, restoration phase, last observation and earned gift. Store no wall-clock timestamp for growth. Inject the authoritative restaurant day into reduce(state, action, day). A sync action settles an unprocessed day exactly once. Rendering may request synchronization through onAction but must not perform hidden game rules.

The first dry/wet contrast is authored and deterministic. Later weather follows a short deterministic in-game pattern. Apply care outcomes and weather in a documented order. Repeated entry, duplicate synchronization and reload must not grant extra growth or gifts. Missing garden visits must not compound damage; settle only outstanding care and keep healthy earned growth. Day rollback, nonfinite days, malformed saves and unknown actions cannot corrupt state. Plant placement remains unique and within the finite sites. Saturate water amounts and growth stages. One wrong care choice must be recoverable on subsequent player-controlled days. The maximum supported missed-day interval must not trigger an unbounded loop.

The repeating loop is inspect, choose care, arrange, return after an in-game day, observe and make a new choice. Mature plants remain decorative and can be moved. Growth unlocks visual variety and social presence, not a compulsory chore schedule. A newly visited roof must initialize its cursor from the current shared day without simulating years of missed care.

## Art, audio and persistence

Use the current Pixel Plays renderer's Scene interface and geometry helpers. Create a feature-local scene with the same palette, light, scale and character rigs. Flower heads, climbing segments, leaves, pot positions, shade and a bird must visibly respond to state. Reuse existing licensed patterns. No text in canvas. Respect reduced motion and suspend animation in hidden tabs. Existing hospital and restaurant renderer files remain untouched.

Use the pinned offline voice pipeline and real committed audio with provenance. Garden assets belong under public/audio/garden. The existing pipeline supports alternate content/output files, but its flat URL output needs a feature-local adapter or a central integration request. Do not relabel unrelated clips or commit silent placeholders. The documented pipeline uses MLX. A Linux CPU path is being investigated; compatibility with the pinned model is unverified. Missing model cache and restricted Hugging Face access currently block synthesis. Missing compatible synthesis is a release blocker, not permission to replace voices or declare audio complete.

The feature owns validation, but the central integration writer owns IndexedDB. Export initialState, reduce, validate and gifts from rules.ts, words and lines from content.ts, and the default view from index.tsx with the exact shared callbacks. The central envelope stores feature state and delivers garden.planter idempotently. Invalid garden state resets only the garden. Existing restaurant saves, journal recovery and other features survive migration. Reload retains placement, care, day cursor and progress. No independent localStorage or IndexedDB store.

## Verification and release boundary

Rules tests cover wet versus dry watering, repeated water, same-day sync, day jump, rollback, shade/placement collisions, recovery, mature plants, gifts and malformed save values. Build must pass. Browser evidence covers real controls, wet warning, wrong-care outcome and recovery, moving pots/shade, token lookup/replay, no default pinyin or English, reload and garden gift. Inspect phone and desktop screenshots, reduced motion, focus and console. Check offline files and actual voiced lines. Re-run the hospital to three restaurant customers, change and journal journey, plus navigation and shared day transitions after central integration.

An isolated view harness proves only the feature component. It does not prove navigation, shared saves, offline service-worker coverage or integrated learning. Keep those gates open until tested in the combined application. A different agent reviews without editing and fixes return to the single writer. The central apartment lead serializes authorized merges after review and verification, then verifies main. No deployment is included.

Defer larger roofs, freeform construction, seasons, plant breeding, inventories, harvests, shops, pets on the roof, weather forecasts and new cast. Preserve a bounded, attractive communal retreat before adding systems.

## Throughput checkpoint

- Blocking first steps. Read central ticket allocation, contracts and active file leases before writing. Compare state-model candidates before implementation.
- Independent workstreams. Read-only design and review can run in parallel. This cohesive feature has one implementation owner.
- Shared mutable state. Central ticket 0066 alone owns App, save envelope, journal registry, offline enumeration and shared contracts. Garden exports a narrow interface.
- Smallest safe decomposition. One 0070 writer owns rules, scene, content and tests because their state and feedback evolve together. Additional ticket IDs require central allocation.
