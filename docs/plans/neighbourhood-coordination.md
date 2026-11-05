# Neighbourhood coordination

Central owner: apartment lead. Published branch: `codex/0065-neighbourhood-coordination`.
Baseline inspected 2026-11-05: remote main `66ac123fa377f0cdbfb30f5c8bad07edf28790e4`; remote branches/PRs reserve through 0064. Only this owner allocates further IDs.

| Ticket | Owner | Branch slug | Strict Vite port | Exclusive files |
|---|---|---|---|---|
|0065|apartment lead|neighbourhood-coordination|5465|this ledger, apartment plan, initial tickets 0065–0070|
|0066|one Sol medium integration writer|neighbourhood-foundation|5466|src/neighbourhood shared contracts/shell/save/content registry; App.tsx, contracts.ts, game.ts, save.ts, opening.ts, content/index.ts and words.ts, shared styles, offline tooling and integration tests|
|0067|apartment Sol medium writer|apartment-home|5467|src/features/apartment/**, public/audio/apartment/**, e2e/apartment.spec.ts, evidence/0067 and ticket 0067|
|0068|cats lead + one Sol medium writer|neighbourhood-cats|5468|src/features/cats/**, public/audio/cats/**, e2e/cats.spec.ts, docs/plans/neighbourhood-cats.md, evidence/0068 and ticket 0068|
|0069|repairs lead + one Sol medium writer|repair-workshop|5469|src/features/repairs/**, public/audio/repairs/**, e2e/repairs.spec.ts, docs/plans/repair-workshop.md, evidence/0069 and ticket 0069|
|0070|garden lead + one Sol medium writer|rooftop-garden|5470|src/features/garden/**, public/audio/garden/**, e2e/garden.spec.ts, docs/plans/rooftop-garden.md, evidence/0070 and ticket 0070|

Branches use `codex/NNNN-slug`; each writer creates its own cloud checkout. No dependencies change. All four features only; no postperson or coffee shop implementation. The human now authorizes central coordinated merges after independent review, full verification and polish. Feature leads deliver ready PRs; only the central lead lands them and verifies main afterward. No manual deployments.

## Existing leases
Current shared ownership, 2026-11-05. Ticket 0063 merged at `74b81952` and released App, styles, and foreground playback. Ticket 0071 merged at `196f88c` with both cumulative-earnings labels complete, so 0066 is now the sole shared integration writer. Ticket 0062 merged at `cdb8498` and closed the existing content, voices, manifest, and clip lease. Preserve all 126 accepted existing WAV files and current presets. Any future 0060 six-clip atomic import requires the accepted user choice and coordination; it does not block feature work. Ticket 0072's served-food implementation merged as `bca768d`; the restaurant renderer stays maintenance-owned. Keep the accepted single ambience owner, default level .35, foreground/background gains .042/.1575, and actual-location restaurant presence. The four namespaced feature voice inventories still lack 278 real clips; no substitution or completed offline-voice claim is permitted.

## Minimal integration contract v1

- Location IDs: `restaurant | apartment | cats | repairs | garden`. Hospital remains the mandatory opening. After opening, an optional home/location control permits visiting the building without resetting the restaurant session. Returning restores its exact state. No navigation during the opening.
- Existing restaurant `GameState.day` remains authoritative. Only existing completed-day progression advances it. Feature visits/actions never advance time or add a second clock. Pass `day: number` to each feature; per-day opportunities use stored last-claimed day, not wall time. Free decorating always remains available.
- No new currency or global generic inventory in this tranche. Restaurant earnings unchanged. Feature-owned inventories hold local items. Cross-feature rewards are idempotent gift IDs: `repairs.stool`, `garden.planter`, `cats.cushion`; apartment accepts each once and retains it. These are optional enrichment, never gates for other features. Integration owns delivery/claim bookkeeping. Apartment accepts `{type: "receive-gift", giftId}` for these exact IDs and never duplicates a retained item.
- Shared saved neighbourhood envelope is version 1 with location and feature fields (`apartment`, `cats`, `repairs`, `garden`) plus claimed gift IDs. Embed a backward-compatible optional `GameState.neighbourhood` field in the existing IndexedDB save and pending startup checkpoint. Preserve it when next-day constructs the new restaurant state. Old valid restaurant saves initialize empty neighbourhood state, without replaying opening. Invalid feature payload resets only that feature, preserving valid restaurant progress and other features. No new independent feature storage or localStorage. Preserve the existing startup checkpoint. On load, reconcile valid claimed gift IDs into apartment ownership through its idempotent receive-gift reducer, including when corrupted apartment state resets.
- Each feature exports default React view from `src/features/<id>/index.tsx` and pure reducer/initial state/validation from `rules.ts`. View props: `{state, day, onAction, onLookup, onRecover, onPlay, recoveredWordIds?, freshWordIds?}`; both optional word-ID fields are readonly string arrays from the shared journal; callbacks: action object, `(word: Word, trigger: HTMLButtonElement)`, `(wordIds: string[])`, `(line: Line)`. Feature exports `initialState()`, `reduce(state, action, day)`, `validate(value): State | null`, and `gifts(state): string[]`. Integration imports feature types directly; do not edit central types from feature branches.
- Each feature owns schema-validated `content.json` and `content.ts` exporting `words: Word[]` and `lines: Line[]`. IDs and line IDs are prefixed `apartment.`, `cats.`, `repairs.`, `garden.`. Reuse existing canonical words where genuinely identical. Integration registers words for shared journal/lookups and offline enumeration. Spoken content uses existing Word/Line schema shape and committed accurate offline clips. No browser TTS, silent placeholder clips, or unrelated clip relabeling. Report unavailable cloud synthesis as a blocker.
- Existing WordToken/fog/recovery and single playback controller are reused via props. Only successful reducer transitions recover related words; invalid or rejected actions cannot recover words from a UI callback alone. Lookup remains lookup. No decorating vocabulary gate. Shared journal and word card remain DOM text, pinyin tap-only, no English after premise.
- Pixel/isometric style is mandatory (decision 0003 supersedes 0002 art). Feature-local scenes may import existing renderer primitives but cannot edit restaurant/ward renderer. All labels/dialogue real segmented DOM; tokens govern UI, 44px controls, reduced-motion and hidden-tab suspension.
- Integration tests require actual route accessibility, reload/old-save migration and all four feature journeys; feature workers provide isolated harnesses if shared App integration is waiting. Harness completion is not integrated completion.

## Capability and verification
Native collaboration spawn accepted `gpt-6.1-sol` / `medium` / fresh context; probe `/root/cloud_probe` confirmed Linux `/workspace` and `/workspace/junyan`. Child has no independent model metadata. No local workers. Current managed cloud configuration ID differs from requested saved runnable Codex configuration; current checkout and cloud filesystem are verified, configuration equivalence is not claimed.
Pstack was obtained in cloud from configured `cursor/plugins` at commit `2776ddd2355d6d6c8747d3964600f28daf62f049`, path `/workspace/cursor-plugins/pstack/skills/poteto-mode/SKILL.md`. Read orchestration, autopilot-full, feature, shipping and opening-a-pr workflows. Native agents and GitHub connector adapt harness-specific commands; user Sol medium choices override model defaults. This copy has no `show-me` skill or named polish playbook. `show-me-your-work` supplies the decision trail, not the requested PR visual skill. Include truthful GitHub-compatible visuals and report this limitation.

Every completed feature needs pure Vitest tests, build, existing opening→3+ customers→change→journal journey, feature journey, inspected phone/desktop screenshots, clean console, offline assets/audio, reload and migration evidence. Missing verification stays listed as incomplete. No AWS writes, manual deploys, unreviewed main merges or GitHub CLI.

## Throughput checkpoint

- Blocking first steps. Cloud Sol delegation and remote allocations verified before writers start. Shared leases still block App/content integration.
- Independent workstreams. Four domain directories, audio namespaces and journey specs have separate owners.
- Shared mutable state. One integration writer owns game/save/schema/App and the global journal and navigation. Existing maintenance owners retain their leases until handoff.
- Smallest safe decomposition. One bounded ticket per feature plus one integration ticket avoids premature subsystem tickets and duplicate state models.

## Worker record

- `/root/cloud_probe`: completed read-only cloud delegation check, requested gpt-6.1-sol medium.
- `/root/apartment_writer`: active 0067, requested gpt-6.1-sol medium, `/workspace/junyan-apartment`.
- `/root/foundation_writer`: active 0066, requested gpt-6.1-sol medium, `/workspace/junyan-foundation`.
- `/root/coordination_review`: independent no-edit design review, inherited lead model.
- `/root/cloud_audio_probe`: read-only cloud synthesis capability check, requested gpt-6.1-sol medium.
All received the updated conditional merge authority and quality policy. Progress review threshold is 30 minutes without a commit or concrete evidence, excluding explicit lease waits.

## Maintenance craft allocations, 2026-11-05

Remote branch inspection still ends at 0070. Central owner reserves exactly two requested follow-ups. These refine existing restaurant craft and do not add a fifth feature or new economy.

| Ticket | Owner | Branch | Port | Files and dependencies |
|---|---|---|---|---|
|0071|central lead assigns one Sol Medium writer after 0063 App handoff|codex/0071-cumulative-earnings-label|5471|App summary label and focused regression only; no earnings/save changes; serialize with 0066|
|0072|maintenance lead and one Sol Medium writer|codex/0072-served-food-props|5472|src/scene/restaurant-scene.js and focused scene tests/evidence; exclusive lease granted for this scene file; shared SceneFrame typing through 0066 only|

0072 uses representative food/drink from actual order data and existing drawing primitives. Existing orders are already available to the scene adapter; inspect before requesting a type change. The separate restaurant renderer and ward stay outside this lease. 0071 labels the existing lifetime total explicitly; it does not reset earnings per day.
