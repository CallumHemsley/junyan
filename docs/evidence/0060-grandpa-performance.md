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
