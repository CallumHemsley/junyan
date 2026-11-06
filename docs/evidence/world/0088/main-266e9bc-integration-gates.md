# Current-main semantic integration gates

Status: OPEN — source comparison only, no merged build or inherited-suite PASS.

Compared actual fetched main `266e9bcd922151160d2edff48fb8078c874be135` (PR43, on language-boundary main `ba4419b`) against reviewed world `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Their merge base is `8cd5bc209b7dc2d91cc0f765991de313f813f4eb`. Fetch updated origin/main only; no checkout, merge, production edit or test execution. The findings below are concrete incompatibilities/gates for a future integration, not reproduced defects in a nonexistent combined runtime.

## Required semantic reconciliation

### P1: retain the new language contract in every world consumer

Main `src/contracts.ts:5–10` uses `Word.text` and optional `pronunciation`; `src/content/mandarin.ts:1–11` adapts original authored hanzi/pinyin JSON. World still declares hanzi/pinyin (`src/contracts.ts:4–9`). World additions directly read the old fields: `src/world/WorldViewport.tsx:85,100`, `src/world/ui/RestaurantControls.tsx:53,65`, `src/world/life/LifePrompt.tsx:23`, and world UI/life harnesses. Merely keeping main's schema leaves these consumers uncompilable or with missing tokens/labels; choosing world's contracts would undo PR40. Preserve stable word IDs and adapt world labels to the runtime contract/registered words rather than matching a translated display string.

Main `src/language/index.ts:29` currently selects Mandarin; the French fixture and scoped saves establish an architecture/test boundary, not proof that the shipped UI already offers language selection. Keep real authored audio URLs and token spacing/pronunciation behavior. Main WordLine/FeatureLine/content adapters must coexist with contextual controls, keyboard handling and return focus. No new audio is required.

Gate: build all world modules/harnesses against main's types, check no runtime `.hanzi`/`.pinyin` assumptions survive outside authored-data adapters; exercise actual contextual table, kitchen, resident and feature word cards/replay with Mandarin and a supported alternate-language fixture. Display-text changes must leave IDs, journal and semantic review evidence stable.

### P1: union and order the save restorers; neither side's save.ts is sufficient

Main adds progression validation and purchase recovery (`src/save.ts:12–16,106–112`; `src/progression/save.ts:10–40`) plus language-specific IndexedDB/checkpoint keys (`src/save.ts:131–141,143–166`). World adds `world` parsing and restoration against dynamic maps (`src/save.ts:12–14,109–110`), while its IDB operations still use literal `v1` (`134,151`). Main alone does not preserve the world field; world alone does not preserve/restore progression or paid ownership. Both validators use object schemas that can discard unrecognized fields.

Restore neighbourhood plus valid purchased ownership before constructing dynamic collision maps and validating world positions/anchors. Keep the default Mandarin keys byte-compatible (`v1`, `junyan-waiter-pending-v1`), scope other languages, and pass the language through App's checkpoint and save calls (main `App.tsx:22,42,190`). Preserve world's checkpoint fix and sessionRef ordering (`world App.tsx:117–119`) rather than reinstating an obsolete move exclusion by resolving the App conflict wholesale.

Gate matrix: legacy baseline save; main progression/purchased-items save; world position/selected-anchor/life save; combined save; corrupt review with valid finances; corrupt apartment with valid purchase ledger; over-debit/duplicate purchases; two language slots plus interrupted pending checkpoint. Reload must preserve world position, per-map returns, life elapsed/reactions/departures, journal, earnings and ownership together. A valid day>3 mixed-level order save must remain valid (main `save.ts:73`; `game.ts:73`). Repeat actual move→activity→reload race tests; do not infer them from old passing save suites.

### P1: invitation/location semantics cannot be transplanted as menu navigation

Main `src/neighbourhood/transitions.ts:33–46` handles follow-scenario by changing neighbourhood location and preparing cats/repairs. It never changes world map, walks to an anchor or establishes a contextual binding. Main `src/progression/ProgressionView.tsx:14,19,30–32` chooses invitation/shop UI solely from neighbourhood.location. In world, that field changes when an activity opens (`src/neighbourhood/transitions.ts:75`) and can remain the last activity while walking elsewhere.

A naive union therefore risks an invitation changing feature state while the visible world stays in another region, or an apartment shop remaining available out in town. Main purchase validation also checks only `n.location === 'apartment'` (`src/progression/purchases.ts:13`); that is insufficient as a physical-context check under world semantics. Treat invitations as understandable walking destinations/wayfinding, with scenario preparation bound to real arrival, and mount the shop in a real reachable apartment context. Preserve scenario availability and repeat repair/cat setup rather than deleting progression to avoid this seam.

Gate: after a shift, follow an actual invitation by ordinary movement through doors, observe correct arrival activity, complete it, return and reload. Leaving the apartment must remove remote purchase affordances; direct stale-context purchase actions must not debit money. No portal buttons or silent map teleport as acceptance substitutes.

### P1: paid furniture needs the world renderer, not only the legacy apartment scene

Main adds `blue-vase`, `large-basket`, `small-lamp` to the item schema/vocabulary (`features/apartment/rules.ts:3,119`) and legacy scene art (`scene-data.ts:43–57`). Costs are 8/8/24 (`progression/catalog.json`). World `src/world/art/residential/index.ts:255–305` has no cases for those IDs. Yet its `renderFurnitureObjects:396–404` creates render entries for all non-rug placements and `features/apartment/world.ts:17–21` creates their colliders. A naive integration can thus produce paid, saved invisible collision obstacles even if the old diorama has correct art.

Gate: earn real income; buy each affordable item exactly once; show debit/remaining balance; place, rotate, move, undo and reload it in the actual scrolling apartment; inspect its unique visible form, light/emission where applicable and collision/depth. Undo must not refund a purchase; recovery of damaged placement must retain legitimate paid ownership. Free finds/gifts stay distinct. Do not accept legacy Scene screenshots as world-render evidence.

### P1: preserve progression around world day and feature transitions

Main startDay chooses authored orders with due-word weighting and avoids previous orders when alternatives exist (`game.ts:68–84`; `progression/model.ts:98–104`). After day3 it permits earlier levels. Deliveries and lookup/mistakes update practice/support (`game.ts:183–185,276–285`); meaningful feature transitions update it via `practiceForTransition` (`neighbourhood/transitions.ts:89–92`). World's corresponding return (`transitions.ts:140–142`) additionally preserves safe positions after dynamic furniture/garden edits. Both results must survive the merge.

World `advance-world-day` forwards `{type:'next-day'}` without a timestamp (`transitions.ts:55–57`; App615). Main's UI supplies `now:Date.now()` (`App.tsx:951`). Preserve that explicit timestamp through the world action while resetting service departures and retaining the world state. Without it, next-day order ranking uses the fallback timestamp0 and cannot reflect real-clock due evidence as intended.

Main canonical identities use reviewed word-ID aliases, not display text (`progression/model.ts:7–8,51–57`). Guided neighbourhood completions are deliberately supported exposure (`scenarios.ts:74–78`), not independent recall. Preserve the distinction: both a later game day and elapsed real time govern independent practice (`model.ts:71–77`); invitation due ranking uses a broader OR condition (`91`). This difference is existing source behavior, not an asserted bug.

Gate: four ordinary services and final receipt/replay → explicit departure → ended exploration → visible next-day action → day2 reload; then deterministic multi-day rule coverage through day12 verifies order variety, author-defined valid orders and saved mixed levels. Cross restaurant/feature contexts exercise canonical alias stability, same-day bounds, help/mistake support, clock rollback, due ranking and no farming from movement, recolouring, rearranging, purchases or invitations. Every rule gate must run on the combined exact head; PR43's own tests are source references only here.

## Coordinator-owned namespace reconciliation

There are **two** confirmed ticket-number collisions, not only0082:

- Main `docs/tickets/0082-investigate-offline-speech-probe.md` versus world `docs/tickets/0082-workshop.md` (active builder/branch codex/0082-workshop).
- Main `docs/tickets/0081-living-progression.md` versus world `docs/tickets/0081-residential.md`.

Preserve both histories and evidence; coordinator must allocate canonical IDs/aliases and update central ledger references. No reviewer-created replacement IDs, overwrites or automatic closure. Existing progression/offline evidence under0081 must not be mistaken for residential acceptance. The offline-speech ticket describes an intermittent observer investigation; it is not permission to suppress native playback assertions in the combined build.

## Acceptance handoff

No production merge/fix authored by this reviewer. Coordinator/foundation own integration; language/progression owners should review the semantic resolutions, residential owns paid-item world visuals, and reviewer0088 reruns the above gates on the published build. Keep all ten-region walking, physical anchors, contextual UI, real voices, saves, NPC life and visual ambition in scope. A clean textual merge or isolated rules pass cannot establish integrated acceptance.

Coordinator decision read at `f876255c2e563c357484f6422afe9b27f089fb7e`: qualified world/0077–0090 identities and coordinator-only historical migration resolve namespace ownership; preserve main exact files. This new report uses the chosen qualified evidence path. The semantic gates above remain open until the combined build.
