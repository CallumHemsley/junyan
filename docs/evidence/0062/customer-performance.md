# 0062 customer performance evidence

## Ownership and scope

- Owner: Codex cloud worker, ticket 0062; branch `codex/0062-natural-customer-performances`.
- Checkout: `/workspace/junyan-0062`; base `66ac123` from current `origin/main` on 2026-11-05.
- Reserved strict ports: Vite 5412, preview 5413. Start with `pnpm exec vite --host 0.0.0.0 --port 5412 --strictPort`; no server started in this checkpoint.
- Production content, voices, audio manifest and scene remain reserved to 0058 then 0060 / 0059. No changes to those files, dependencies, schema, doctor, ticket 0057, or `.claude`.

## Append-only decisions and observations

2026-11-05: Read AGENTS, ticket README, 0062, accepted decisions 0001–0004, build recommendation, design-system and character direction, character and content-audio documentation. No bundled pstack located; follow supplied harness steps. First boundary: isolate review/export tooling from production synthesis and scene edits. State shapes: review row `{character, voiceId, role, lineId, text, audio, sha256, listening}`; generator inputs remain existing `{characters, orders}` and voice config. No new production contract.

2026-11-05: User reports Ryan+calm and Aiden doctor takes rejected on pinned Qwen 0.6B. Do not extrapolate prompt effectiveness from the adapter accepting `instruct`. Establish model support and audible benefit before producing a cast-wide batch. Seek ordinary ordering speech, not exaggerated acting. This is user feedback, not worker listening evidence.

2026-11-05: Static findings (not auditory diagnoses): full restaurant lines concatenate tokens without punctuation; this may affect phrase boundaries, but needs an A/B before any text change. `personality` is editorial metadata, never synthesis input. Qwen adapter rejects speed other than 1; Kokoro rejects instructions. Compare punctuation at the line boundary against unchanged baseline before considering broader model/runtime changes. Do not alter global sampling, frontend or generator VERSION merely to audition a performance.

2026-11-05: `customerPose` sets `greeting: !eating`; backpack arm remains raised before checkout/served (`renderer.js` lines 45–48, 154). All other characters share a phase-based seated pose except glasses lean. This warrants in-context visual review, not an unverified claim that the gesture is unpleasant. Scene owner must approve any change; a bounded greeting would require explicit elapsed state/time, not a hidden render timer.

2026-11-05: Exported all 24 line references (12 social lines, 12 orders), copied actual baseline WAVs with hashes, and made a manual-play HTML index. No autoplay, generation, model downloads or production edits. Listening status remains NOT REVIEWED for every row.

## Cast review targets

These are hypotheses to assess, not things heard by this worker.

| Customer | Retain | Listen/observe across greeting, every order, retry, thanks |
| --- | --- | --- |
| 林姐 / Serena | warm familiar adult neighbour | `早上好`, `不急慢慢来`, `麻烦你了谢谢`: ordinary small courtesy, phrase boundary before 谢谢; no soothing recital or overemphasis |
| 小李 / Yunxi | brisk polite office worker | `早`, `不对再看看吧`, `谢谢明天见`: short greeting, clear correction without scolding, natural goodbye; brisk must not mean clipped consonants |
| 张老师 / Uncle_Fu | mellow precise retired teacher | `早上好呀`, `慢慢来再看看`, `辛苦了谢谢`: no conspicuous drawl, theatrical elder mannerisms or patronizing correction |
| 小周 / Xiaobei | bright sociable adult student | `你好呀`, `不对呀再看看吧`, `谢谢你呀`: light particles without a cartoon bounce; inspect raised hand during ordering and retry |

For every order: exact words and quantities, Mandarin tones and sandhi, no missing/repeated words, natural lexical stress and sentence ending. Compare transitions between speakers at unchanged playback gain; record level issues separately for 0057.

## Mac generation handoff

1. Check out this branch in a new Mac worktree. Run `python3 scripts/ticket-0062/prepare-audition.py --output output/0062-audition`. Open its `index.html` manually for all-four baseline review; log line ID, actual audible issue, timestamp, listener and listening setup. The pack is not the playable restaurant and cannot satisfy contextual acceptance alone.
2. Use the parent's already available Qwen environment, offline; do not install a new model. Inspect installed `mlx_audio` CustomVoice implementation and cached model config/model card for the exact pinned 0.6B revision. Record whether instruction conditioning is implemented and supported by this model size, with source paths/lines. An accepted keyword or differing hash is not proof. If instructions are unsupported or listening gives no useful effect, stop prompt auditions and report the limit; larger models or paid services require an explicit choice and existing authorized runtime.
3. First useful same-identity comparison: duplicate the exported content/voices into `output/0062-punctuation/`, adding only punctuation via each affected line's `text` field (leave tokens, IDs, speakers and presets unchanged). Start with a documented problematic phrase for each customer, not a full batch. Use `--plan` to inspect intended differences before generation. These are generator fixtures, not schema-approved production game content. Inspect/compare all resulting takes, including an unchanged baseline; discard changes with no audible improvement.
4. Exact isolated commands, from the worktree (set `QWEN_PY` and `KOKORO_PY` to the parent's existing interpreter paths):

```sh
python3 scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --plan
HF_HUB_OFFLINE=1 "$QWEN_PY" scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --engine qwen --write-content
HF_HUB_OFFLINE=1 "$KOKORO_PY" scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --engine kokoro --write-content
```

Run sequentially. Kokoro must use its separate existing runtime, with the pinned frontend/model cache. Missing runtime/cache is a blocker, not permission to install a substitute. Generated references are `/audio/` URLs; do not put audition references in production before copying the verified manifest/WAVs together after ownership release.

5. Capture actual before/after listening notes and files; present all four to Callum for review. No subjective approval can be inferred from signal metrics. Once shared ownership is released, make only approved production changes, coordinate level effects with 0057, then rerun rules/content, audio/offline, build and full opening → three customers → change → journal journey on strict ports 5412/5413. Automated browser audio stays muted; deliberate audition playback is manual. Capture phone/desktop screenshots and a short video with sound; inspect both screenshots and console. Independent review of exact patch on current main precedes any merge.

## Executed validation

- `python3 scripts/ticket-0062/prepare-audition.py --output output/0062-audition`: PASS, 24 references, 4 customers; real baseline WAV copies and SHA-256 metadata.
- `python3 scripts/content-audio.py --plan > output/0062-audition/production-plan.jsonl`: exit 0; read-only production cache plan.
- `python3 scripts/content-audio.py --self-check`: PASS, mocked pipeline safety/routing checks, not real synthesis.
- Plain `pnpm test` / `pnpm build`: initially blocked by pnpm refusing a symlinked modules directory; removed only our symlink and copied existing installed dependencies into our own checkout. No install or dependency-file changes.
- `pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false test`: PASS, 169 tests / 11 files.
- `pnpm --config.manage-package-manager-versions=false --config.verify-deps-before-run=false build`: PASS; two dependency PURE-comment warnings.
- Host: x86_64 Linux; Python reports mlx/kokoro/torch absent. No Mac GPU connection configured. No subjective listening, candidate synthesis, browser journey, screenshot inspection, audio/offline browser check or video recorded by this worker.

## Evidence locations and verdict

- Existing audible baseline files: `/workspace/junyan-0062/output/0062-audition/*.wav` (ignored copies of shipped assets).
- Manual listening index: `/workspace/junyan-0062/output/0062-audition/index.html`.
- Hashes and review inventory: `/workspace/junyan-0062/output/0062-audition/baseline.json`.
- No candidate WAVs, screenshots or video yet. No listening approval.
- BLOCKED for ticket completion: Mac model-capability inspection and real auditions/listening; shared production ownership release; Callum all-four review; contextual browser evidence and independent exact-patch review. This preparation checkpoint is reviewable but does not implement or complete 0062.

## 2026-11-05 follow-up: played baseline and concrete punctuation experiment

This entry supersedes the earlier checkpoint's statement that no browser runs or screenshots existed. Still no candidate synthesis or subjective listening.

- Added owned `scripts/ticket-0062/playwright.config.ts`: extends existing journeys, records video, runs desktop/phone with normal/reduced motion; explicit optional `JUNYAN_CHROMIUM_PATH`. No shared test/config edit.
- Browser setup initially failed: pnpm's implicit dependency check tried to reinstall; explicit CLI flags fixed it. Then Playwright 1.64.1 expected an absent bundled Chromium. Used existing `/usr/bin/chromium`; no browser/model/dependency download. Repro command below uses the final portable config (during executed run the identical executable path was literal).

```sh
JUNYAN_DEV_PORT=5412 JUNYAN_PREVIEW_PORT=5413 JUNYAN_CHROMIUM_PATH=/usr/bin/chromium PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers node_modules/.bin/playwright test --config scripts/ticket-0062/playwright.config.ts --grep 'wake in the ward|browser saves|production keeps'
```

Result: **10 passed in 2.4m**. Four full opening → four-customer day → change → tally → next day/journal runs (desktop, desktop-reduced, phone, phone-reduced); four looked-up-word save/reload runs; two desktop production offline/audio runs. The main journeys click actual UI controls for wake, dialogue advance, wrong/right hospital request, reply, restaurant greeting/replay, food pickup, delivery, change and journal. Their test hook reads order/state to choose actions; it does not dispatch gameplay or seed/skip the opening. The separate offline test seeds day-one state, explicitly a supplementary fixture check, not evidence of playing the opening offline. Journey console/page-error assertions passed. Browser audio was muted via launch flag; video has no listening evidence.

Inspected actual screenshots with image tools: desktop opening request, restaurant and journal; desktop reduced restaurant; phone opening request, restaurant and journal; phone reduced restaurant and journal. Paths: `/workspace/junyan-0062/output/playwright/{desktop,desktop-reduced,phone,phone-reduced}-{restaurant,journal}.png` and `*-opening-07-request.png`. These are preserved ignored local artifacts. Normal/reduced layouts are stable in the inspected views. Phone journal uses a scrollable single column; the partial next word at the bottom is a scroll boundary, not horizontal overflow. Restaurant controls, identities and progress are readable. No new layout defect established in these views.

Captured muted videos under `/workspace/junyan-0062/output/0062-browser/waiter-wake-in-the-ward-th-bc2de-change-journal-and-progress-{desktop,desktop-reduced,phone,phone-reduced}/video.webm`. Inspected sampled contact sheets of desktop and phone video (every 3s): `/workspace/junyan-0062/output/0062-browser/{desktop,phone}-video-contact.png`. This is sampled visual inspection, not continuous full-video watching or listening. No screenshot of all four retries yet; that remains a specific contextual audition requirement.

### Supported audition hypothesis and fixture

Root independently raised the same punctuation hypothesis. Added `punctuation.json` with explicit ordinary sentence endings for all orders/greetings, and comma boundaries for multi-clause retry/thanks, avoiding exclamations. `prepare-punctuation.py` exports disposable generator fixtures, preserving visible tokens and voice preset bytes. It validates each synthesis text equals tokens after removing the opening contract's existing punctuation whitelist `，。！？·`. No generated clip or production/schema change is implied.

```sh
python3 scripts/ticket-0062/prepare-punctuation.py --output output/0062-punctuation
python3 scripts/content-audio.py --content output/0062-punctuation/content.json --voices output/0062-punctuation/voices.json --output output/0062-punctuation/audio --plan > output/0062-punctuation/plan.jsonl
```

Executed both successfully. A separate direct comparison through primary `collect_jobs` verified 24 changed line synthesis texts/cache identities, unchanged speaker presets and pronunciation metadata, and identical dictionary asset identities. Mac handoff step 3 can now run this exporter instead of manually authoring fixture punctuation. The sequential offline Qwen/Kokoro generation commands above apply unchanged. Start by selecting one retry/thanks per customer in copied fixture inputs if limiting synthesis cost; the full 24-line inventory is ready, not a recommendation for mass regeneration.

Production integration proposal **only if listening supports it**: `Line` in `src/contracts.ts:9` lacks `text`; `Phrase` extends it. Strict `lineSchema` in `src/content/index.ts:29` rejects the fixture field. The current token/text equivalence refinement at lines 135–138 applies only to opening phrases; reuse its punctuation whitelist/validation for any extended restaurant shape. Update restaurant voice-provenance expectations in `src/content/content.test.ts:204` to use authored text when present. Renderer and gameplay consume tokens/audio, so preserve those fields and line IDs. Primary `scripts/content-audio.py` already selects line `text` when present; no generator change/VERSION bump required. Content/types/schema/test edits need root's shared-file lease and listening evidence first. Do not make restaurant schema changes merely to ship this experiment.

### Scoped quality review (self-review, not independent approval)

| Dimension | Score | Evidence and limit |
| --- | --- | --- |
| Naturalness / performance | Not scoreable yet (BLOCKED) | No model-generated candidate or actual listening; a number would fabricate the ticket's central result. Applies to the ticket, so this is not N/A. |
| Presentation of review materials | 7/10 | All 24 baseline lines labelled with identities, hashes and manual controls. Lacks paired generated A/B playback, in-game candidate context and human notes; cannot reach 8 yet. |
| Immersion contribution | N/A for preparation-only patch | No shipped experience changed; baseline visuals are coherent, but voice contribution cannot be assessed without listening. |
| Usability of review workflow | 7/10 | Reproducible one-command baseline/candidate preparation and actual multi-layout journey evidence; still requires separate Mac runtimes/manual comparison and no candidate comparison UI. |
| Fun/interest contribution | N/A for preparation-only patch | No validated gameplay/performance improvement delivered. Any benefit from more natural regulars is a hypothesis pending human playtests. |

Known scoped blockers: missing audible A/B, all-four retry context, user approval and ownership release. Static candidate defect to investigate: punctuation may produce excessive pauses; do not assume any punctuation change is better. No proven production defect was fixed in this checkpoint. The working short vertical slice and clean mechanics are not release-quality Steam validation, retention evidence or proof of player enjoyment. Remains **BLOCKED**, not READY; root still assigns independent product and exact-patch review.

## 2026-11-05 root probe results and 0066 foundation handoff

Root reports actual punctuation-only **thanks** probes for all four existing voices, with unchanged presets/tokens: Qwen 2 generated / 0 failed; isolated pinned Kokoro 0.9.4 / Torch 2.8 runtime 2 generated / 0 failed; final small fixture 12 available / 0 pending (including shared words). Root retains paired before/after files temporarily for listening. These are **root-reported synthesis results**, not this worker's generation/listening verification; no customer take is accepted. Root runtime paths `/tmp/junyan-0062-kokoro-env` and model cache `/tmp/junyan-0062-models` are not present in this cloud checkout, as checked with `ls -d`; do not treat those as executable cloud paths. Obtain exact paired file paths, hashes and listener decisions from root before promoting any asset. Successful generation does not establish improved phrasing or exact Mandarin.

Lease: ticket **0066 is sole writer** for `src/contracts.ts`, `src/content/index.ts`, `src/content/words.ts`. Worker 0062 will not edit them. Restaurant production content/voices/manifest/WAV edits await a later explicit root lease. Root's 1.7B doctor investigation selects no customer production model.

### Minimal proposed 0066 change, conditional on listening acceptance

1. Preserve backward compatibility: extend `Line` at `src/contracts.ts:9` to `{ id: string; tokens: Word[]; audio: string; text?: string }`. Keep `Phrase = Line & { text: string }`, so opening text remains required. No save format or gameplay state change.
2. Extend strict `lineSchema` at `src/content/index.ts:29` with optional `text`, constrained by the same `^[\\p{Script=Han}，。！？·]+$` policy as current `phraseSchema`. For **every** present line text, reject unless `text.replace(/[，。！？·]/gu, '') === tokens.map(word => word.hanzi).join('')`. Missing `text` must keep old concatenation behavior. Use explicit `text !== undefined`, not truthiness, so empty text cannot bypass checks. Keep unknown-key rejection. Reuse the validation for mandatory opening phrases without dropping the current nested error paths; do not merely widen the TypeScript type while stripping/ignoring text in Zod.
3. No change to `contentWords` or `contentLines` traversal is needed for optional text: both already enumerate tokens, and `Phrase` extends `Line`. Preserve enumeration of all social/order/help/opening tokens and their IDs. A shared `spokenText(line)` helper is optional; no new abstraction is required for just two provenance-map call sites.
4. Provenance test handoff (`src/content/content.test.ts:204` and `:206`): expected spoken text becomes `line.text ?? line.tokens.map(word => word.hanzi).join('')`. Preserve exact speaker checks and WAV byte hashes; do not weaken them to ignore punctuation or allow a stale baseline audio reference. Opening `phrase.text` expectations remain exact. Coordinate ownership of this test file with root before writing it.
5. Focused semantic regressions: (a) untouched shipped content without restaurant `text` still parses; (b) a disposable character thanks with `text='麻烦你了，谢谢。'` parses and survives parsing verbatim; (c) representative greeting/order/retry/helper line accepts punctuation-only text; (d) changed, missing, duplicated or reordered Hanzi fails with a path ending `text`; (e) empty text, Latin, spaces, unsupported punctuation and unknown fields fail; (f) mandatory opening text cannot be omitted. Existing token arrays and word enumeration must remain identical after adding text.
6. Pipeline change is unnecessary: primary `scripts/content-audio.py:113` already reads `text` when present and hashes it. Keep VERSION, presets, sampling and dictionary routing unchanged. 0062 verified fixture plans before/after and dictionary identities. After accepted production content/audio promotion, run pipeline `--plan` and content provenance tests against the actual updated manifest; require cached referenced clips, exact matching punctuated text and unchanged unedited asset identities.

The optional field exposes no new player-facing text: App renders `line.tokens`, and audio replay uses `line.audio`. All four identities, visible Mandarin, vocabulary recovery, saved order IDs and journal entries stay stable. If only the four thanks probes are accepted, change only those four production line texts/assets; do not automatically promote the remaining 20 candidate lines. Keep longer order/retry experiments separate until listened to. Neither this proposal nor the real root probes completes 0062.

## 2026-11-05 real support probes received and paired

Fetched the support-only branch; resolved immutable commit `bf90baa2d266d59368829573c3d4f73c2c0fe05b`. Read its local-probes README, inventory and all four candidate manifest entries; extracted each WAV directly using `git show` into ignored comparison output, without merging the support branch or importing its truncated fixture/voices into production.

Added owned `scripts/ticket-0062/prepare-comparison.py`. Reproduce after fetching the support branch:

```sh
python3 scripts/ticket-0062/prepare-comparison.py --output output/0062-comparison
python3 -m http.server 5412 --bind 127.0.0.1 --directory output/0062-comparison
```

Exporter verifies exactly one thanks per customer, current baseline paths, unchanged current voice presets, token/pinyin equivalence, candidate checksum against both inventory and manifest, shipped baseline checksum against production manifest, and mono PCM16/24kHz decode for all eight files. Exports labelled manual before/after controls, immutable source commit, checksums/durations and NOT REVIEWED status in `review.json`. No gain, trimming, resampling or auto-play; starting one clip pauses the other controls to avoid overlapping comparisons. Candidate seed changes too: this is a useful take comparison, not causal isolation of punctuation.

Executed export: PASS, four verified pairs/eight real WAVs. In muted system Chromium loaded all eight actual clips' metadata successfully and checked eight controls/no autoplay/no phone horizontal overflow. Captured and inspected full comparison screenshots at 1000px and 390px. `file://` was blocked by Chromium administrator policy; normal local HTTP succeeded. The first HTTP inspection had an incidental missing favicon request; exporter now includes a data favicon. Shut down temporary server after inspection. No baseline gameplay tests rerun for artifact receipt.

Reviewer-accessible local artifacts:

- `/workspace/junyan-0062/output/0062-comparison/index.html`
- `/workspace/junyan-0062/output/0062-comparison/review.json`
- `/workspace/junyan-0062/output/0062-comparison/{lin,li,zhang,zhou}-thanks-{before,after}.wav`
- `/workspace/junyan-0062/output/0062-comparison/review-{desktop,phone}.png`

Actual generated candidates now exist in this cloud's isolated pack; earlier absent-candidate statements describe the earlier checkpoint. **Still no actual listening, preference, exact-Mandarin approval or in-game acceptance.** Root retains local paired MP3s for user audition; user review must identify preferred take per customer and concrete audible defects before 0066/0062 production integration. Greeting/order/retry auditions remain outstanding; four accepted thanks would not complete the whole ticket.

Quality self-review update: preparation presentation and comparison usability **8/10**, because paired real audio now has clear labels, complete provenance and inspected responsive controls. Lacks in-game paired comparison, listener decision capture in the page and full-cast line coverage, which keeps it below 10. Naturalness remains blocked/unscored; immersion/fun contribution of production remains unvalidated. No production file or shared schema was changed. BLOCKED remains the ticket verdict.

## 2026-11-05 explicit user sample acceptance and bridge request

Root relays direct user acceptance: **“All four revised samples work”** for paired 林姐/小李/张老师/小周 thanks probes. These four are accepted samples; this worker still claims no personal listening. Chosen direction is unchanged existing cast plus authored punctuation, not a recast. Root is generating remaining 20 lines sequentially and reusing accepted four WAVs byte-for-byte. Final 24-line acceptance and contextual verification are not inferred.

Immediate isolated 0066 bridge handoff is published at `docs/evidence/0062/foundation-bridge-handoff.md`: optional backward-compatible Line.text, required Phrase.text, strict Mandarin/punctuation and token-equivalence validation at each line boundary, exact provenance expectations and focused regressions. Shared files remain untouched. Production import must start from current main after 0058 doctor import and an explicit root lease; patch matching 24 restaurant line IDs only, preserve opening/neighbourhood/presets/dictionary, and merge complete manifest records. No retirement without reference analysis, especially shared 林姐/Help greeting. Remaining artifacts/ASR, lease, integration and independent review still outstanding.

## 2026-11-05 full-set staging and explicit ASR hold

Fetched/read support commit `64edaa7fe7d83264bbaac14b445d7ad1d9b94f13`, full selected-punctuation README, inventory and 24 subset manifest entries. Added **staging-only** importer `scripts/ticket-0062/stage-import.py`. It has no production-write option. It reads current checkout's complete content/manifest/voices, patches only the 24 matching restaurant line IDs' `text`/`audio`, proves all other content survives byte-equivalent JSON data comparison, verifies candidate identity through primary collect_jobs, validates all actual WAV hashes/cache/signal checks, confirms four accepted thanks bytes unchanged, merges records without dropping any existing manifest entry and retains every old WAV. No truncated fixture or stale voice import. Source input hashes and checkout HEAD are recorded to invalidate stale staging before later promotion.

Executed against the current prelease checkout:

```sh
python3 scripts/ticket-0062/stage-import.py --output output/0062-staged-prelease
python3 scripts/content-audio.py --content output/0062-staged-prelease/content.json --voices output/0062-staged-prelease/voices.json --output output/0062-staged-prelease/audio --plan > output/0062-staged-prelease/plan.jsonl
```

Results: 24 target lines, 24 added manifest records, four accepted thanks unchanged, zero retired files, productionWritten=false. Separate JSON assertion found **126 complete-game staged asset identities cached / zero pending**. This is prelease staging against the old checkout, not integration against current main after the doctor bridge. Must rerun in a fresh output directory against updated main after the root lease; do not promote these old staged files. No game/schema/source production files changed.

Root then reported full-set ASR: 12 order lines and four accepted thanks matched under the stated punctuation/traditional/digit normalization. Short `早` was transcribed `走`; `不对` → `部队` (homophones) and `不对呀` → `不略呀` remain uncertain. Material issue: 张老师 `慢慢来，再看看。` transcribed only `慢慢來`. Root is investigating unprompted cropped ASR and baseline comparison. **HOLD `zhang-retry`** until root resolves possible second-clause omission. Do not describe all 24 as ASR-passed or cleared. Staging report now explicitly marks CANDIDATES_NOT_CLEARED and the held line; successful cache/signal checks cannot override it.

Import plan after clearance and explicit lease: first update branch onto current main containing 0058 atomic doctor import and the separately reviewed bridge; read current shared instructions; regenerate fresh staging against that state; compare original opening/help/neighbourhood/voices and complete manifest preservation; import only targeted text/audio fields plus cleared candidate records/WAVs. Keep old files/records (including shared Help greeting). Run focused content/rules/audio/offline, build and actual normal/reduced phone/desktop full-day play on strict 5412/5413; inspect new evidence, compare transitions/retry in context and obtain independent exact-patch/product review. User acceptance remains limited to the four thanks probes. BLOCKED pending root's clip resolution, production lease and final verification.

## 2026-11-05 resolved selection: 23 improvements, original teacher retry retained

Root rejects new `zhang-retry` candidate `line-71cc826bfe95375cd38207f20368356df6c5fefc9fb79f99b309065b8fb382d9.wav`: unprompted ASR omitted 再看看; cropped tail gave hallucinated 呵. Original `line-4f91607bbafecbcec2897ab11215d244f9acfc539402746b50994c9dcf17ed17.wav` baseline transcribed exact 慢慢來再看看. Retain the entire original teacher retry object, original WAV bytes and manifest record, **without adding text**. No word/preset/pipeline/model changes to force a replacement. The scope is now 23 selected punctuation line changes, not 24.

Root also reports short Kokoro flags on baseline: 早→走, 不对→部队; 小周 retry old 布瑞雅/new 不略呀. These are ASR ambiguities, not established regressions or model-listening approval. The 12 orders and four accepted thanks matched normalized ASR. Do not claim all 24 passed. Root will publish revised selected23 package and raw ASR/baseline evidence; current staging pins the existing full24 source and explicitly filters the rejected line/record/WAV.

Updated staging-only importer to require exactly the remaining 23 target IDs, preserve original `zhang-retry` object and exclude the rejected candidate. Executed into fresh `output/0062-staged-selected23`: 23 added records, four accepted thanks unchanged, zero retired files, productionWritten=false. Primary full-game plan: **126 cached / zero pending**. Separate assertions confirmed original teacher retry object exactly equal with no text added and rejected WAV absent. This supersedes the earlier 24-target plan/hold policy. Staging is still against prelease checkout; revised support source, raw proof, current main doctor+bridge and explicit production lease are still needed before real import. Root's bounded rejection is final for that candidate; do not rerun or promote it.

## 2026-11-05 leased production import on current main

Root explicitly released restaurant content/manifest/WAV ownership after doctor PR13 landed at main `9545141f28b5e1be53a7d62ac95e8befc4b064c8` (includes bridge). Fetched/rebased this isolated branch onto that main. Read shared instructions again and revised selected inventory/raw ASR at support `10d34263df55efb14d28b5c3cc21f915f01b98e1`. Raw evidence is now copied verbatim under `docs/evidence/0062/asr/`; it includes the rejected candidate solely as ASR evidence, never production audio.

Fresh staging/import patched only 23 restaurant text/audio fields, merged corresponding 23 records and copied 23 verified WAVs. Four user-accepted thanks hashes preserved. Explicit comparisons against current main proved unchanged opening/new doctor, Help, voice preset bytes and entire original teacher retry. No shared schema, scene, tokens, dictionary audio, neighbourhood content or dependencies changed.

Initial unit run:192passed/1failed because existing exact-reference corpus test prohibits unused WAVs/manifest records. Resolved by complete recursive `/audio/` reference analysis over live content: **22 replaced old restaurant clips were unreferenced** and retired with their records. Preserved old 林姐 greeting because Help still references it; teacher retry preserved. `retired-clips.json` records retired names and complete live references. This supersedes earlier staging policy of retaining all old records: removal now has explicit reference proof and satisfies the repository contract.

After cleanup: **193 tests passed /11files**, pipeline self-check PASS, read-only production plan **126cached/0pending**. Build passed before cleanup; final browser verification rebuilds after cleanup. Build emitted existing dependency PURE-comment warnings only. Final gameplay/retry/all23-native-offline run in progress; no final browser pass yet. No new listening claimed; four thanks accepted by user,23selected by root with ASR limitations recorded.
