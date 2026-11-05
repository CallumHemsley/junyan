---
title: Neighbourhood cats
status: implementation-plan
created: 2026-11-05
ticket: 68
---

# Neighbourhood cats

Junyan's neighbours share a courtyard with two recognisable cats. The player learns where each cat likes to sit, follows clues in Mandarin, earns trust through patient actions, and helps a resident find her companion. The reward is a relationship and a cushion for the player's apartment. Food, punishment and vocabulary quizzes have no role in this loop.

This plan implements ticket 0068 under [[neighbourhood-coordination]]. The user's later completion policy authorizes centrally coordinated merging after independent review, polish and full verification. It supersedes the original draft-only language in the initial ledger and ticket. The apartment lead owns shared changes and landing.

## Bounded first release

One courtyard, two animals, one resident, one reunion mystery, and three repeat encounter variants. The white cat 小白 is cautious and likes shelter. The black cat 小黑 is sociable and likes a sunny bench. Their coat colour, tail shape, posture and location identify them together, so colour is never the sole clue. A bicycle, bench, sheltered doorway and planter make the geography legible. A resident shares the existing building ensemble. Reuse a current cast appearance and voice only when identity and licensing fit; otherwise name a local resident consistently without implying a new shared cast contract.

The first-session target is ten minutes including exploration, listening, word taps and a replay of a clue. It is a design target, not measured evidence. Do not pad it with forced timers. After the reunion, the courtyard remains a place to notice and interact with cats. Return visits use the existing restaurant day. No second clock, real-time decay, hunger, neglect, runaway deadline or daily streak.

## First session and controls

| Approximate time | Player action | World feedback and meaning |
| --- | --- | --- |
| 0–1 min | Enter the courtyard through the shared location control and talk to the resident. | The resident looks toward the bicycle and asks for the white cat. Both cats remain visible. |
| 1–3 min | Tap the bicycle, bench or either cat. Replay the clue or tap a word. | The selected object receives a neutral focus outline. The cat looks back. Selecting 小黑 gives a gentle contrast, never a penalty. |
| 3–5 min | Find 小白 under the bicycle. Choose to crouch and wait rather than approach immediately. | Crouching changes player pose. Waiting is an explicit action with an immediate calm response, not a real-time countdown. 小白 uncurls and steps closer. |
| 5–7 min | Invite the cat, then follow its short route to the sheltered doorway. | The cat visibly moves between known landmarks. The route has a start and destination, with a static equivalent under reduced motion. |
| 7–9 min | Call the resident at the doorway after the cat arrives. | Resident and cat reunite. She gives the apartment cushion once. The player can stay with the cats or leave. |
| 9–10 min | Inspect the new relationship, replay a line, open the shared journal, or revisit the bench. | Recovered words are clear. The courtyard still responds after the story ends. The next encounter is available on a later restaurant day. |

All world targets are real buttons, at least 44px, with Mandarin accessible names. Mouse and touch use the same controls. Tab, Shift+Tab, Enter and Space provide the complete journey. No drag precision or timed button sequence. Use DOM targets over the isometric scene and a compact action area near the current dialogue. Words have their own buttons and never nest inside action buttons. Back/leave remains available through the shell. Every spoken line has replay through the existing playback controller.

## Choices and recovery

The player chooses which clue to inspect, which cat to approach, whether to wait, and whether to continue the story now. The wrong cat remains an enjoyable animal to meet. An impatient approach makes 小白 tuck its paws under the bicycle again, with a clear invitation to crouch. It loses no permanent trust and never makes the player repeat a finished chapter.

Earned trust has observable consequences. 小白 stops hiding, accepts an invitation, follows a route and later sits near the player. Small successful actions recover only the words their visible consequences demonstrate. A word tap records a lookup through the shell and does not count as successful comprehension. Replaying dialogue does not grant trust or rewards. Repeating an action cannot farm trust or gifts.

During the introductory mystery, the white cat's bicycle position is stable even if the player leaves and the restaurant day changes. Once the story is complete, the routine derives deterministically from the supplied day. A repeat encounter already started retains its conditions until it ends. This prevents a reload or location change from moving a target mid-clue.

## Repeat encounters

Each variant lasts a few minutes, with both cats available for free observation after completion. The existing day selects an authored variant. One completion per day can advance familiarity. Completing the same encounter again gives its response without duplicating rewards.

| Encounter | Observable clue | Player consequence |
| --- | --- | --- |
| Sunny bench | 小黑在椅子旁边。 Visible sun and relaxed black cat by the bench. | Inspect the bench, greet 小黑 and sit nearby. The cat chooses to sit next to the player. |
| Rain shelter | 下雨了。小白在门口。 Visible rain beyond the dry doorway. | Look under the bicycle, notice it is empty, then find 小白 at the doorway and wait beside it. |
| Familiar route | 小白去窗边。 The cat looks toward a window and takes a short route. | Follow at the cat's pace, then invite it to sit. A familiar cat can visit the home through the existing gift/relationship seam when integrated. |

Home visits are the narrative meaning of earned familiarity. The bounded implementation guarantees the reunion and cushion reward. A fully animated cat inside the freely furnished apartment requires a separate agreed apartment contract and stays deferred if that contract is absent. Do not call a cushion alone an implemented home visit.

## Mandarin and inference

All visible Chinese strings live in schema-validated, presegmented JSON. The runtime never segments text. English below is design explanation only and never appears in game. New word and line IDs use `cats.`. Reuse canonical existing word IDs only for the same word, pronunciation and meaning.

| Authored line | Token segmentation | What makes it inferable |
| --- | --- | --- |
| 你看见小白了吗？ | 你 / 看见 / 小白 / 了 / 吗 | The resident looks at the two cats and the camera includes both. |
| 白猫在自行车下面。 | 白 / 猫 / 在 / 自行车 / 下面 | The white cat is drawn beneath the bicycle frame. |
| 不是黑猫，是白猫。 | 不是 / 黑 / 猫 / 是 / 白 / 猫 | The black cat reacts, then the resident gestures toward 小白. |
| 慢慢来。 | 慢慢 / 来 | The resident crouches or the action preview shows a lowered posture. |
| 蹲下，等一等。 | 蹲下 / 等一等 | The player crouches; the cat visibly relaxes. |
| 小白出来了。 | 小白 / 出来 / 了 | The cat leaves the bicycle's cover. |
| 跟着小白走。 | 跟着 / 小白 / 走 | The cat takes the route toward the doorway. |
| 她在门口。 | 她 / 在 / 门口 | The resident waits at the doorway. |
| 找到了，谢谢你。 | 找到 / 了 / 谢谢 / 你 | Resident and cat stand together and respond warmly. |
| 这个垫子送给你。 | 这个 / 垫子 / 送给 / 你 | The cushion appears as a gift and later in the apartment. |
| 下雨了。 | 下雨 / 了 | Rain falls outside the shelter. |
| 小黑在椅子旁边。 | 小黑 / 在 / 椅子 / 旁边 | The black cat sits next to the bench, not beneath it. |

Keep first exposure short. The first clue introduces 白, 猫, 自行车 and 下面 through a single scene. New relationships reuse 在, 旁边 and 门口. Pinyin appears only after a word tap. No Latin gloss appears in the gameplay, word card or journal. Fog and the word marker follow existing recovery rules. Do not use vermilion on selected cats, success indicators, trust meters or buttons.

## Domain and integration

The feature owns an explicit serializable encounter state, a discriminated action union, a fixed table of cat identities/landmarks/encounters, and pure rules. `initialState()`, `reduce(state, action, day)`, `validate(value)` and `gifts(state)` match the central contract. Phase or node identity determines allowed actions. Derived positions and available actions come from selectors, not React conditionals that duplicate rules.

Persist the story node, selected target if meaningful, earned trust, completed encounter evidence, the last completed day, and the current repeat encounter's anchored day. Only durable consequences belong in saves. Audio playback, animation time, focus elements and pointers do not. `gifts` returns `cats.cushion` only after the reunion, and is stable on repeated calls. Integration claims it once. No new currency, generic inventory or feature-local storage.

The view exports from `src/features/cats/index.tsx`. It receives state/day and action, lookup, recovery and playback callbacks. Central integration registers exported `words` and `lines`, stores the cats payload inside its backward-compatible neighbourhood envelope, supplies shared journal/word card/navigation, and applies rewards. Unknown or impossible feature saves return null; central integration resets only cats. Existing restaurant saves and the mandatory opening remain unchanged.

Open integration detail to resolve before final verification: the minimal view props do not include the shared journal or fresh word IDs. If shared WordToken appearance cannot reflect existing recovery through that contract, request an optional journal/fresh prop from the central writer rather than edit shared files or keep a second authoritative journal.

## Art and sound

Use the existing software renderer's box, sphere, capsule, shadow and projection helpers for a warm brick courtyard. Cats need recognisable ears, snout, paws, tails, a crouched pose and a relaxed pose. The white cat has a curled tail and small grey ear detail. The black cat has a longer raised tail and lighter chest detail. The bicycle must read as a bicycle at phone scale. Props and cats use the current muted scene palette. Dialogue and labels remain DOM text.

Use existing voice presets and `scripts/content-audio.py` for content-addressed audio, with feature-owned `public/audio/cats/` output and accurate manifest. Never relabel unrelated clips. Keep audio assets offline, stop obsolete speech on scene/dialogue changes, and replay on explicit user input. Missing audio is a release blocker, not a silent fallback. A production preview must decode each clip and allow offline playback after caching.

Cloud constraint observed at planning: the current Qwen path uses Apple MLX. Linux cannot run that path unchanged. Kokoro presets exist and the pipeline supports CPU, but their model access, intended character identity and quality must be verified before choosing them. Do not rewrite shared voice tooling or change the cast voice without coordination. Ambient effects are optional; unlicensed music and browser speech are excluded.

## Verification and polish

Rules tests cover correct/incorrect cat selection, patient recovery, illegal actions, idempotent trust/rewards, deterministic day variants, anchored encounters across day changes, reload validation and malformed saves. Content tests cover Chinese-only text, token identity, unique IDs, exact audio references and all recoverable word IDs.

Run `pnpm test`, `pnpm build`, and the existing waiter journey with strict dev port 5468 and a separate strict preview port 5568. Add the complete cats journey, keyboard-only path, wrong-cat recovery, rain repeat, journal lookup/recovery and leave/return/reload tests. Test integrated migration from an old restaurant save, preservation of an unfinished restaurant order, and day progression without duplicated rewards. A feature-only test page may unblock scene work while 0066 waits, but it never counts as integrated completion.

Inspect actual phone and desktop screenshots at the clue, patient approach, reunion and rain states. Check scene readability, no overlay collisions, 44px targets, no horizontal scroll, visible focus, reduced motion, hidden-tab suspension and clean console/network. Listen to the authored lines. Record failures and limitations honestly in `evidence/0068/`. A different agent reviews the code and player journey without editing. Writer resolves defects and material fixes get another review before central landing and post-merge verification.

## Deferred scope

More cats, breeding, pet ownership, simulated hunger, daily chores, real-time schedules, procedural mystery text, a new movement engine, social backends, a coffee shop and a general quest engine are outside this release. Animated home visits beyond the agreed apartment seam and longer resident stories need later tickets.

## Design synthesis and throughput

Pstack source commit `2776ddd2355d6d6c8747d3964600f28daf62f049` was obtained in the cloud. Read-only workers `/root/cats_design_a` and `/root/cats_design_b`, both requested GPT-6.1 Sol medium, compared an encounter reducer with a story union against an authored encounter graph. The lead chose the reducer plus story union. It supports two independently interesting cats with fewer authoring and validation rules than a generic graph. Graft the second design's anchored repeat day and durable completion evidence to prevent rerolls and lost recovery after a crash. A cross-family arena judge was not used because the user's requested worker model takes precedence over Pstack's defaults. Independent code and experience review remains required.

Score against the task's rubric, with 1 weak and 3 strong: reducer/story union versus graph scores 3/3 for deterministic saves, 3/3 for free cat choice, 3/2 for minimal API and no engine rewrite, 3/3 for observable recovery, and 2/3 for authored repeat branching. The bounded three-encounter scope makes the simpler state shape the better choice. Prototype and screenshot evidence must still test that judgment.

1. Blocking first steps. Published allocation and shared contract are confirmed. Design comparison is complete. Voice generation and the shared journal-view prop remain integration dependencies.
2. Independent workstreams. One cats implementation owner writes the coupled rules, scene and content. Other feature owners work on their disjoint directories. Read-only reviewers can inspect independently.
3. Shared mutable state. Cats never writes shared App, save, content index, dependencies or renderer. The 0066 writer owns those invariants and final integration.
4. Smallest safe decomposition. One ticket and one writer avoid a scene/content/rules merge inside this small feature. A separate reviewer supplies defect and experience checks without becoming another writer.

## Implementation checkpoint, 2026-11-05

Owner `/root/cats_writer` implements the reserved slice directly. No further code writers were spawned. The independent reviewer and central lead retain review and merge ownership under the full human completion policy in `/workspace/scratch/cats-completion-policy.md`.

Throughput checkpoint:

- **Blocking first steps.** Read policy, ticket, accepted decisions, contract, renderer, content, tokens and Pstack feature/domain/proof/UI guidance before writes. Two competing designs were completed by the lead.
- **Independent workstreams.** Pure rules, authored content and feature-local scene remain within one bounded slice. Foundation owns shell/save/content registration. Voice generation is blocked independently.
- **Shared mutable state.** No shared source, schema, dependency or lockfile edits. Existing canonical vocabulary is reused. Only feature payload and reducer transitions own story facts.
- **Smallest safe decomposition.** One writer owns the coupled story, relationships, view and scene. A different reviewer inspects without edits. No nested writers.

The reunion is a discriminated story union. Each cat keeps independent durable relationship facts. Repeats record their authored day and routine until completion. Rain shelter accepts direct discovery of the cat or doorway. Inspecting the empty bicycle is optional, and its comprehension evidence is stored separately. Patient actions grant only demonstrated vocabulary. The shell's approved optional `recoveredWordIds` and `freshWordIds` props resolve the earlier journal contract question. No feature-local production journal or save exists.

The development-only isolated surface is `/src/features/cats/harness.html?test=1`. It records callback IDs instead of pretending to play missing speech. Serialized state in its URL exercises the feature save boundary; it does not establish IndexedDB migration, shared gift delivery, navigation or offline integration.

Measured checks and captures live under `evidence/0068`. The first production build and all 194 rule tests passed. Both desktop and phone mandatory hospital, four customers, change, journal, movement and looked-up-word reload checks passed. Both isolated cats mouse/touch and keyboard journeys passed, including wrong-cat friendship, impatient recovery, reunion, three repeats, callback recovery and serialized restoration across a day change. Initial screenshots were inspected and actor/label spacing is being refined before independent review.

Audio remains a release blocker. The central Linux probe found no cached models and model hosts returned proxy 403. Qwen's shared pipeline requires Apple MLX. `evidence/0068/missing-audio.json` lists exact authored clips still absent. No placeholder audio, unrelated relabeling or browser speech fallback was added. Actual voice generation, listening and offline decode/playback are unverified. Shared navigation, real saves/migration, apartment gift reconciliation and production offline feature registration await foundation integration. Ticket remains doing.

Independent review of `99df4df` found three repeat action/scene mismatches. Rain's offered give-space action now has durable evidence and visible retreat. Repeat actions follow the selected cat or its current landmark, so detours cannot greet or sit with a different cat accidentally. Route completion records the completion day and companionship, retaining the window destination and seated pose through same-day reload. Three targeted rules/pose regressions were added. The two narration comments requested by review were removed. Source changes require fresh independent review. The updated focused suite has 28 tests and the fixed build passed. On the rebased main before this review round, all 195 rules and 12 desktop/phone cats/waiter/motion browser checks passed. Review-fix browser regressions are authored and await the independent browser lane; they are not yet claimed passed.

The fresh independent review at `0e07106` ran 28 focused tests, build and 14 browser checks, then reproduced a remaining pose mismatch on window-target late route completion and familiar doorway-target rain waiting. The full failing-head report is preserved verbatim in `evidence/0068/review-0e07106.md`, with original probe logs and selected captures in the adjacent directory. The material fix recognizes the doorway or window as the white companion only when the cat is actually there. The direct cat target remains valid; unrelated landmarks and black-cat detours retain their own behavior. No reducer or save schema change was needed. Four focused cases compare aliases after serialized reload and preserve negative detours. The updated feature suite has 32 passing tests and build passed. All 10 cats browser checks passed across desktop and phone, including actual-canvas comparisons of alias and direct-cat poses after reload. These remain isolated checks. Voices and shared foundation checks remain release blockers.

## Final isolated verification at source 384b3ca

The independent verdict for exact source `384b3ca9ce62cd640b7cffa3ac4aabe54fb4e503` is PASS for the bounded isolated feature. The reviewer independently ran 32 focused tests and build, 12 late-route/rain probes, two authored actual-canvas parity cases and two negative-detour cases across desktop and phone. Page and console error collectors were empty in authored and negative cases. Six fresh captures were inspected with no new layout blocker. `evidence/0068/review-384b3ca.md` is the verbatim report; its adjacent directory preserves small logs, specs/configs and those captures. Prior failing-head evidence stays historical and unchanged.

Release remains BLOCKED by absent genuine new voices and central 0066/0063 integration. This isolated PASS proves neither actual speech nor real shared persistence/migration, navigation, journal registration, apartment gift delivery or offline operation. Evidence-only finalization changes no production or test file. Central apartment lead alone serializes integration, landing and post-merge checks when the complete human quality bar is satisfied.
