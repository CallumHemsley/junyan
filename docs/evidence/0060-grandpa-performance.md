# 0060 Grandpa performance evidence

## 2026-11-05 — ownership and boundaries

Owner: Codex cloud worker. Branch `codex/0060-subdue-grandpa-opening`; checkout `/workspace/junyan-0060`; base `66ac123`; strict ports 5408/5409. Follow harness-adapted pstack poteto-mode/autopilot-full bug-fix discipline. No bundled pstack playbook found in tracked files. Production audio/content and scene leases are held by 0058/0059; this checkpoint changes only this ticket and its own evidence. No AWS writes, main writes or merges.

## 2026-11-05 — initial cause investigation

State shapes: `OpeningState` selects step and feedback; `WardFrame` holds elder/player posture, present cast, table foods and held item. `wardFrame` always sets elder sitting and makes a wrong offered food his held item. `ward.js` draws elder with fixed crouch 1, scale .88, lean .08, armL .3, armR .35 or raised held-item elbow/hand. No elder pose property depends on time. A raised food pose is static until the next item. Do not describe this as a waving/bouncing animation without browser evidence.

Six line references across two requests (script must stay intact):

| Role | Text | ID |
| --- | --- | --- |
| Milk request | 早上好，年轻人。请给我一杯豆浆。 | elder-milk |
| Milk wrong | 不对，我要豆浆。 | elder-milk-wrong |
| Milk thanks | 谢谢你！ | elder-milk-thanks |
| Egg request | 我还想要一个鸡蛋。 | elder-egg |
| Egg wrong | 不对，我要鸡蛋。 | elder-egg-wrong |
| Egg thanks | 谢谢，谢谢！ | elder-egg-thanks |

Cast uses `uncle-fu-levelled`: pinned Qwen 0.6B CustomVoice, Uncle_Fu, Chinese, speed 1, instructions null, -20 dBFS active RMS / -1 dBFS peak ceiling. Restaurant uses `uncle-fu`; do not recast shared restaurant consumers. Exclamation/repeated thanks are possible semantic contributors, not listening findings.

## 2026-11-05 — expressive-limit evidence

Upstream Qwen README model matrix explicitly leaves Instruction Control blank for **0.6B-CustomVoice**, while 1.7B-CustomVoice has a checkmark. Source read directly on this date: https://github.com/QwenLM/Qwen3-TTS/blob/main/README.md#released-model-description-and-download . The generic API accepts `instruct`, but that is not evidence that this pinned small model supports useful delivery control. Local adapter passes `instructions` to `generate_custom_voice` and rejects Qwen speed != 1. Consequently, a calm/frail instruction-only preset is not a credible fix, and lowering gain alone does not address delivery. Parent reports Ryan+calm and Aiden doctor auditions rejected; no claim of listening by this worker.

Decision: do not spend Mac synthesis on more emotion prompts without checking actual adapter/model behavior and a listening plan. Preserve script/model pins. Audition must compare ordinary conversational phrasing, warmth, pauses, exact Mandarin, no caricature, and audible speech. A model change needs root coordination and explicit justification; no candidate has been accepted.

## 2026-11-05 — adapter proves instructions are dropped

Read the exact declared adapter release, `mlx-audio==0.6.3`: https://github.com/Blaizzy/mlx-audio/blob/v0.6.3/mlx_audio/tts/models/qwen3_tts/qwen3_tts.py#L2167 . `generate_custom_voice` executes `if self.config.tts_model_size == "0b6": instruct = None`. This is stronger evidence than a missing model-table checkmark. The official Qwen adapter independently drops instructions for 0b6 as well: https://github.com/QwenLM/Qwen3-TTS/blob/main/qwen_tts/inference/qwen3_tts_model.py . A prompt change changes our content hash, which changes the seed, but the model sees no instruction. Do not attribute changed random takes to prompt compliance. No inference or listening performed here.

## 2026-11-05 — visual investigation and smallest patch

Parent authorized a ward-local patch after identifying PR11 at `992f73628c80d6a2829173431a4180ccbbd2499c`. Fetched its branch for read-only comparison: it changes `plot` around line 52; this patch changes only Grandpa's pose in `wardScene.draw` around line 202. No dependency on the flicker branch and no rebase or merge.

Alternatives considered: gain-only cannot change performance; instruction-only is ignored by the adapter; removing held food would weaken handover feedback; adding trembling/talking/waving would add caricature and unsupported movement. Chosen visual change: retain seated posture/food continuity, relax free/resting arms .3/.35 -> .12, lean .08 -> .12, lower held elbow/hand and food together (hand height 1.50 -> 1.22; food 1.42 -> 1.14 in figure-local units). No extra animation or new state. Figure remains covered and face/food readable.

Actual muted Chromium captures used UI clicks through both breakfast requests, both wrong bread choices and both thanks, at 1440x1000 and 390x844, with normal/reduced motion. 48 full screenshots under `/workspace/junyan-0060/output/0060/`; console/pageerror collection empty in `capture-console.json`. Inspected baseline desktop milk thanks and phone egg wrong; candidate desktop milk thanks, phone egg thanks and reduced-motion phone milk wrong. Selected full screenshots committed in `docs/evidence/0060/`. Current seated high-hand shape persists across speech/idle; no time-driven elder gesture exists. `characterFigure` uses fixed mouth geometry; WardScene schedules redraw but does not animate Grandpa's speech. The new lower hand pose is visibly restrained without a model-wide character change.

## 2026-11-05 — baseline verification and environment limits

- `pnpm --config.verify-deps-before-run=false test -- src/opening.test.ts src/opening-view.test.ts src/content.test.ts src/scene/ward.test.ts`: all 169 tests passed (pnpm's extra `--` caused the full suite to run).
- `pnpm --config.verify-deps-before-run=false build`: passed baseline; Rollup warnings about dependency annotation placement only.
- `python3 scripts/content-audio.py --self-check`: passed.
- `python3 scripts/content-audio.py --plan`: 125 assets, all cached; no synthesis.
- After pose patch: direct `node node_modules/vitest/vitest.mjs run src/scene/ward.test.ts src/opening-view.test.ts src/opening.test.ts src/content/content.test.ts`: 34 tests passed.
- pnpm 11 initially generated an untracked workspace build-approval prompt for esbuild. Removed only that generated file; dependency manifests/lockfile remain unchanged. Disabling automatic dependency verification per command avoids reinstalling; installed esbuild successfully built.
- Bundled Playwright Chromium absent. System `/usr/bin/chromium` works through ignored config. Playwright ffmpeg download rejected by network policy (403 Domain forbidden); no sound video or listening acceptance claimed.

## 2026-11-05 — audio handoff boundary

Full cached copies are prepared under ignored `output/0060/{content.json,voices.json,audio/}`. They deliberately retain production Grandpa preset and currently have zero pending clips. Do not generate an instruction-only variant. Once root selects a supported, pinned delivery mechanism, clone only the elder preset and route only `opening.cast[id=elder].voices.zh`; preserve all six text/tokens/recovery/script values and dictionary/restaurant consumers. The read-only plan must show exactly six pending line assets and no other pending asset before Mac synthesis. Use all three isolated paths, `HF_HUB_OFFLINE=1`, existing pinned runtime, and `--engine qwen --write-content`; never run the default production output while 0058 holds its lease.

Root decision needed: current model has no controllable frailty/ordinary-delivery knob. Swapping a preset speaker is not evidence of the requested performance. A different model/mechanism requires justification and coordination, then actual listening comparison by Callum; this worker cannot accept subjective delivery from waveform/config checks.

## 2026-11-05 — current-main final verification and quality review

Rebased onto `85a0120b712242cfb9cf476d504becc2708dfb15` after root merged PR11. The depth-aware `plot` fix is retained verbatim; final implementation still only changes three Grandpa pose lines (now 207–209). Scene lease released by root. Audio lease remains with 0058. No production audio/content modified.

- Full `pnpm --config.verify-deps-before-run=false test` after rebase: 169 passed, one renderer test exceeded 5000 ms under concurrent browser load. No assertion failure. Rerun `node node_modules/vitest/vitest.mjs run --testTimeout=15000`: **170/170 passed**, including PR11's face stability test. No timeout/config change committed.
- `pnpm --config.verify-deps-before-run=false build`: passed after rebase.
- Final ignored Playwright config uses system Chromium, `--mute-audio`, strict running dev port 5408, and production preview 5409. Command: `JUNYAN_DEV_PORT=5408 JUNYAN_PREVIEW_PORT=5409 node node_modules/@playwright/test/cli.js test --config output/0060/final-journey.config.ts e2e/waiter.spec.ts --grep 'wake in the ward'`. Four projects cover desktop/phone normal/reduced motion; final results appended below. Journey plays opening UI, incorrect food then correct food, four real UI customer orders/delivery/change, recovered journal, next day and journal again. Hooks expose deterministic state for assertions, not replacement of gameplay actions. Console errors asserted empty.
- Final `output/0060/final-capture.mjs`: 24 new screenshots and four actual browser videos after rebase; both wrong reactions and thanks captured at both sizes/motion modes. System ffmpeg supplied through an ignored local Playwright cache symlink after blocked downloader; video capture succeeded. All browser output silent. Final console/pageerror list empty. Selected screenshots and desktop video committed alongside sampled video frames. Inspected final desktop milk thanks, phone reduced milk wrong, and video frames sampled once per second. This is limited visual video review, **not audio listening or exhaustive frame review**.
- Production `output/0060/offline.mjs`: played fresh opening via UI, verified recovered words, waited for service-worker control, went offline/reloaded, confirmed opening did not replay and journal retained 鸡蛋/豆浆/谢谢/好. **125/125 cached audio paths** fetched with nonempty WAV payload; console/pageerrors empty. Inspected `final-offline-phone-journal.png`. Initial probe timeout came from an exact accessible-name match excluding the button arrow; corrected the ignored probe, no product change.
- Final audio plan: **125/125 cached**, no synthesis. No regenerated audio or sound-video acceptance exists.

Read-only focused subagent review confirmed the exact pre-rebase committed pose diff `8e97b2a3528d763e7b4077a0b543ca27f9b32b18`, inspected all five initial selected images, and found no actionable visual defect. It did not independently play or rerun checks; root still owns exact final-patch/product approval.

Self-review scores (scoped visual portion, not voice acceptance): presentation **8/10**, immersion **8/10**, usability **8/10**, fun/interest contribution **N/A** for this small posture adjustment. The change is subtle at this raster size; face and food remain readable, blanket coverage retained, no extra input or gesture introduced. It supports resting posture but cannot on its own create believable frailty. Full naturalness/immersion including voice is **unevaluated and blocked**, not scored as passing. Concrete blocking defect: Grandpa's original reported exuberant voice remains unchanged. Ordinary delivery cannot be imposed using ignored 0b6 instructions. Human listening/acceptance and a supported synthesis mechanism are still needed. This is a short vertical slice, not a release-quality Steam game; enjoyment/retention remain hypotheses absent human playtests.

Verdict: **BLOCKED** for ticket completion. Visual portion implemented and self-verified; no merge, no listening or Callum approval claimed.

Final rebased journey result: **4/4 passed (3.6 min)** — desktop, desktop-reduced, phone, phone-reduced. No further implementation edits after the tested pose. Offline/persistence result: `errors: []`, `offlineAssets: 125`, `recoveredJournalPersisted: true`, `subjectiveListening: false`.

## 2026-11-05 — supported 1.7B two-line handoff

Root verified actual 1b7/custom_voice loadability at revision `f35faf19b0cc2160865af64ecf0f22f83d335135` on Mac; no user preference/quality approval yet. Prepared owned `scripts/0060-prepare-grandpa-audition.py` and [[0060-grandpa-1b7-handoff]]. Candidate uses Uncle_Fu, exact milk request + repeated egg thanks, original tokens/pinyin and loudness target, unique hospital audition preset and ordinary low-energy instructions. Local stdlib preparation/real pipeline plan passed: **2 pending / 119 cached**, production hashes unchanged, no synthesis. Complete cached baseline and old comparison WAVs copied into ignored output. Candidate paths are pending, not generated clips. Production files untouched; ticket remains incomplete until actual audition choice, coordinated generation and listening acceptance.

## 2026-11-05 — neutral versus conversational handoff completed

Root reported doctor A accepted (1.7B Ryan with instructions null). No Grandpa acceptance follows. Extended owned preparer with required `--direction neutral|conversational` and separate hospital preset/output per direction. Both two-line plans passed, each **2 pending / 119 cached**. Compared prepared maps: exact model/revision/speaker/language/speed/loudness/text/pinyin and production hashes match; only instructions differ between preset values. Seeds also differ because existing pipeline hashes presets, explicitly disclosed in the handoff. Four candidate clips total pending, no synthesis in cloud and no production changes. Root can generate now from its verified Mac cache, then present old/neutral/conversational request and thanks. All-six generation, subjective acceptance and production lease remain pending.

## 2026-11-05 — selected six-line import prepared against current main

Root reports both real 1.7B two-line auditions generated without failures; neutral/conversational listening choice pending. Reported ASR repeat collapse on conversational thanks is not human acceptance/rejection. Rebased own branch onto current main `97c61bd`, preserving the pose and merged depth fix. Added owned staging-only tool `scripts/0060-stage-grandpa-import.py` and [[0060-final-import]]. It accepts only all six exact-script selected clips and pinned hospital preset, merges against latest checkout content/manifest, validates identities/hash/signal/cache and stages under ignored output without production writes. Two-line fixture correctly refused; synthetic-only six-line success smoke passed with 125 cached jobs and unrelated content retained. No actual inference/import/listening here. Refresh main again after doctor's integration before staging returned real clips. No new approval flow required after selection, lease release and authorized self-verification.

## 2026-11-05 — published support inspected, integration still gated

Fetched support exact `cfaa2fd`; independently read/verified all six neutral WAV Git blobs against inventory, pipeline identity and SHA-bound ASR records, mono PCM16/24kHz, plus byte-exact reuse of two preview WAVs. No stage/import/listening. Updated [[0060-final-import]] to actual subset evidence shape and preservation of exclusive existing `uncle-fu-levelled` ID (superseding provisional new alias). User choice still pending and 0062 lease not closed. Plan requires both before atomic current-main import. If B selected, report to root because only B two-line auditions published and full local B has two reported ASR concerns. No production file changed.
