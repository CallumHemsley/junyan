# 0058 doctor voice — append-only evidence

## 2026-11-05 — ownership and diagnosis

Owner: Codex cloud ticket 0058 writer. Branch `codex/0058-doctor-opening-voice`, checkout `/workspace/junyan-0058`, base `66ac123`. Strict ports 5400/5401. Harness-adapted pstack poteto/autopilot discipline; no bundled playbook found in `/workspace` or `/opt`. Read AGENTS, ticket workflow, accepted decisions 0001/0002/0004, build recommendation, design system and chosen phone mockup, and audio pipeline documentation.

Reported symptom: Callum finds the doctor creepy. Cause is **not yet established by listening**. Current doctor is Ryan in both languages, speed 1, no instructions, -20 dBFS active RMS / -1 dBFS peak cap. Five lines: four English premise lines and `人醒了。我明天再来看看。`. Preserve every authored line, token and English boundary.

Runtime evidence: `uname -sm` => `Linux x86_64`; both module specs absent. Calling `LocalEngines()` with the real Ryan preset fails at its actual Qwen adapter import: `ModuleNotFoundError: No module named 'mlx'`. The model is the pinned MLX 4-bit Qwen checkpoint; no model substitution or fake clips. Parent reports a working Apple GPU runtime at `/tmp/junyan-qwen-venv-0049/bin/python`.

Function boundary comparison: change the two doctor presets rather than generation settings or global audio processing. This preserves dictionary/restaurant/other ward voices and generator version. Candidate inputs are full content/voices copies plus copied baseline manifest/WAVs; only `ryan-en` and `ryan-zh` preset fields change. `ryan-calm` keeps Ryan and adds one bedside delivery instruction in both languages. `aiden` changes both speakers to Aiden with null instructions, keeping one bilingual identity. These are audition hypotheses, not a selected voice. The 0.6B checkpoint's response to instructions must be checked in the actual installed model; an accepted parameter does not prove expressive control. If ignored, reject that candidate rather than changing models silently.

`prepare-auditions.py` creates a new, isolated output tree and refuses reuse. No production inputs, WAVs or manifests change. Read-only plans: baseline 125 cached / 0 pending; each candidate 120 cached / 5 pending, exactly the four English assets plus doctor Mandarin line. Audio pipeline self-check passes. No listening, quality approval, screenshots or changed audio yet.

## Mac synthesis handoff — checkpoint 1

Run from this branch's checkout; parent generates only ignored temporary copies and returns artifacts, never writes this branch. Use a fresh output path if it already exists:

```sh
python3 docs/evidence/0058/prepare-auditions.py output/0058-auditions
for candidate in ryan-calm aiden; do
  HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv-0049/bin/python scripts/content-audio.py \
    --content "output/0058-auditions/$candidate/content.json" \
    --voices "output/0058-auditions/$candidate/voices.json" \
    --output "output/0058-auditions/$candidate/audio" \
    --engine qwen --write-content || break
done
```

Run candidates sequentially. No `--limit`: each has exactly five pending doctor assets and all other production clips cached. Keep the pinned revision, sampling, speed and level unchanged. If the model rejects Aiden or ignores instructions, return that evidence; do not choose a replacement model. Run each same plan command with `python3 scripts/content-audio.py`, those three path flags and `--plan` after generation; require 125 cached / 0 pending before comparing.

Return each candidate's `content.json`, `voices.json`, `audio/manifest.json`, five new WAVs (the filenames in the pending plan), command logs, and actual listening notes/recording paths. Baseline uses current committed clips and needs no generation. Parent may package these ignored files as an artifact or temporary external patch. Writer imports only the selected doctor presets, five changed content references, manifest additions and five actual WAVs after listening; other content/audio must remain unchanged.

Listening comparison: first hear all five baseline lines in order in the actual wake scene and record specific unsettling features with timestamps (e.g. emphasis, pauses, breathiness, pitch, affect). Then compare both candidates at the same playback volume and same scene pacing, including the nurse's following line for relative level. Score clarity, ordinary conversational pace, reassuring professional affect, and recognizable identity across the Mandarin switch; verify exact words, missing/repeated text and Mandarin pronunciation. Record replay and offline playback separately. A browser can be unmuted only for this explicit listening session; all automated checks stay muted. Preserve captured listening evidence and identify the listener; signal metrics do not count as listening. Callum's in-scene acceptance remains outstanding and ticket cannot be done without it.

After selecting/importing audio, rerun `python3 scripts/content-audio.py --self-check`, `--plan`, `pnpm test`, `pnpm build`, and muted Playwright with `JUNYAN_DEV_PORT=5400 JUNYAN_PREVIEW_PORT=5401`. Include opening/three customers/change/journal, audio and offline checks, inspect phone/desktop screenshots and clean console. Independent exact-head review belongs to parent. No merge by this writer.

## 2026-11-05 — checkpoint and baseline verification

Published checkpoint `0d54a6b7981e044582bfc3438c2ca5bee7f90f54`; draft PR https://github.com/CallumHemsley/junyan/pull/13. Parent can synthesize immediately without waiting for cloud browser checks.

- `python3 scripts/content-audio.py --self-check`: passed.
- All three isolated plans: baseline 125 cached / 0 pending, candidates 120 cached / 5 pending each.
- Independent JSON comparison: each copied content equals production exactly; only `ryan-en`/`ryan-zh` differ in candidate voice copies; model, revision, language, speed and loudness unchanged. Production files unchanged.
- `pnpm install --frozen-lockfile` initially stopped on ignored esbuild build script. `pnpm --config.dangerouslyAllowAllBuilds=true install --frozen-lockfile` completed the existing locked esbuild install. Removed the generated untracked `pnpm-workspace.yaml`; no package/lock/config changes retained.
- `pnpm test`: 11 files / 169 tests passed. Host Node v24.22.1 (project guidance requests Node 22).
- `pnpm build`: passed; existing third-party Zod annotation warnings only.
- First muted Playwright attempt could not launch: pinned Chromium executable absent. `pnpm exec playwright install chromium` failed with HTTP 403 `Domain forbidden` at `cdn.playwright.dev`; no policy bypass attempted.
- Installed `/usr/bin/chromium` is available. Retrying with ignored `output/0058-playwright.config.ts` importing base config, setting explicit server cwd, isolated result directory and executable path; mute and strict 5400/5401 retained. First temporary-config server launch failed before browser execution; corrected its relative cwd before retry.

## 2026-11-05 — browser runtime follow-up

System Chromium launches, but video-on-failure setup then blocked every test at `browserContext.newPage`: Playwright's `ffmpeg-1013/ffmpeg-linux` is absent. Disabled video **only in the ignored temporary config**, keeping traces and journey screenshots; re-running the same 41 checks. The preceding failures were infrastructure failures before page execution, not observed game regressions. No screenshots were produced by those failed runs.

## 2026-11-05 — upstream model capability evidence

Fetched [QwenLM/Qwen3-TTS README](https://github.com/QwenLM/Qwen3-TTS/blob/main/README.md) through GitHub connector; returned blob SHA `8287bac4e611b907688a74b90a1d39cf7dbeec58`. Its model table explicitly marks instruction control for 1.7B CustomVoice, leaving 0.6B CustomVoice blank. It describes Ryan as “Dynamic male voice with strong rhythmic drive”, and Aiden as “Sunny American male voice with a clear midrange”; both are supported speakers and can speak all supported languages, with native language recommended. This is capability/casting evidence, **not listening evidence** or proof of this reported cause.

Handoff refinement: prioritise baseline versus `aiden` synthesis. `ryan-calm` is a capability diagnostic only; skip it if installed model code confirms instructions are unsupported. Do not infer improvement from a new seed or filename. No silent move to 1.7B. Existing checkpoint inputs remain reproducible; no candidate selected.

## 2026-11-05 — visual inspection

Inspected real journey screenshots in this checkout: `output/playwright/desktop-opening-01-say-en.png`, `desktop-opening-05-say.png`, `desktop-restaurant.png`, `desktop-journal.png`, `phone-opening-01-say-en.png`, `phone-opening-05-say.png`. English doctor lines fit their panel with visible replay/continue controls; Mandarin handover renders word tokens with the accepted unrecovered-word fog. Desktop restaurant and journal render without apparent clipping. These screenshots show baseline shipped visuals and say nothing about voice quality. No video/audio capture produced (video encoder unavailable; automated browser muted).

## 2026-11-05 — browser result and handoff verdict

Command: `JUNYAN_DEV_PORT=5400 JUNYAN_PREVIEW_PORT=5401 pnpm exec playwright test --config output/0058-playwright.config.ts e2e/waiter.spec.ts e2e/opening-start.spec.ts e2e/audio.spec.ts e2e/overnight-audio.spec.ts e2e/offline.spec.ts`.

Result: **38 passed, 2 skipped, 1 did not run; exit 1** in 2.7 minutes. One error outside a test: `route.fetch: Test ended` from `e2e/audio-fixtures.ts:25`, registered by `e2e/opening-start.spec.ts:21`, while a phone English WAV fetch remained in flight. Both full waiter journeys passed (desktop 35.1s, phone 34.6s), including opening, four served tables, change, journal, day progression and clean console assertions. Desktop production offline audio check passed. Dedicated strict-autoplay project is required for the two skipped gesture-policy cases; it was not run. Do not call the overall browser suite green. No test source changed to hide this cleanup issue.

Also inspected `output/playwright/phone-restaurant.png` and `phone-journal.png`; game layout and journal controls remain visible. Screenshot artifact root: `/workspace/junyan-0058/output/playwright/`. Traces/error context: `/workspace/junyan-0058/output/0058-test-results/`. No listening or audio/video recording available from this cloud run.

Verdict: **BLOCKED** for implementation completion. Exact candidate handoff is published; await Mac artifacts and actual baseline/candidate listening with recorded notes, then Callum's in-scene approval, final audio/offline checks and parent's independent exact-head review. Ticket status is blocked. No production source/audio, dependencies, schemas, restaurant or other cast changed; no AWS writes and no merge.

## 2026-11-05 — user rejects both original auditions

Direct user feedback relayed by parent: listened to **both** local auditions and said “neither sounds right. Why does it not sound like a normal doctor”. Both `ryan-calm` and `aiden` are **REJECTED**. Parent reports each real synthesis finished with 5 attempted / 0 failed / 125 available / 0 pending. Audition-only artifacts are on support branch `codex/0058-synthesis-support` at `e62a5c0`; this writer has not imported that branch or its clips. Do not import either as a fix; do not merge PR13. Successful signal checks and user rejection coexist: the failure is perceived performance quality.

### Matched adapter diagnosis

Downloaded, but did not install, the exact pinned PyPI wheel `mlx_audio-0.6.3-py3-none-any.whl`, SHA256 `2cfaef542f29c0eb0f58bb3823eafbb9acf9df9b01a7f45a9bbf3b4b5d44dab9`. Source path inside wheel: `mlx_audio/tts/models/qwen3_tts/qwen3_tts.py`, lines 2167–2169, explicitly discards the instruction:

```python
if self.config.tts_model_size == "0b6":
    instruct = None
```

The production adapter calls this exact `generate_custom_voice` function. Therefore the original `ryan-calm` text **never reached style conditioning** for the pinned 0.6B model. Changed preset hashes also change sampling seeds; any audible difference cannot be attributed to that ignored instruction. This is an established capability limit, not a diagnosis of every audible defect. I should have checked the exact pinned adapter before offering this candidate.

Official [Qwen inference source](https://github.com/QwenLM/Qwen3-TTS/blob/main/qwen_tts/inference/qwen3_tts_model.py), fetched through GitHub connector at blob `f4d33bf3d60c404ee540e58488545ccf5347e25f`, lines 799–800, also discards instructions for 0b6. The [official README matrix](https://github.com/QwenLM/Qwen3-TTS/blob/main/README.md) agrees. The [official 0.6B Hugging Face model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice) contradicts those sources by claiming natural-language style control and showing an instruct example. Prioritise actual matched adapter behavior over that model-card claim. Parent should confirm the installed function via `inspect.getsource(type(model).generate_custom_voice)`; cloud wheel inspection is not a claim to have inspected the Mac's installed files.

Performance approach diagnosis: switching fixed 0.6B timbres does not provide control over ordinary conversational delivery; a role-heavy reassurance prompt was both unsupported and poorly targeted to the user's request. Each authored line is generated independently without surrounding dialogue, so continuity is also a plausible risk; no listening evidence isolates that risk yet. There is no evidence here that loudness, punctuation, quantization or a particular accent caused the complaint. Do not apply speculative pitch/time processing, rewrite lines or hunt seeds blindly.

### Materially different comparison: supported style conditioning

Audition-only checkpoint: [MLX 1.7B CustomVoice](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit), exact [revision](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit/commit/f35faf19b0cc2160865af64ecf0f22f83d335135) `f35faf19b0cc2160865af64ecf0f22f83d335135`. Reviewed model config identifies `tts_model_size: 1b7`, `tts_model_type: custom_voice`, four-bit quantization and Ryan speaker support. Official matrix marks 1.7B CustomVoice instruction control supported; pinned adapter preserves instructions when size is 1b7. This establishes a materially different mechanism, **not a promise of naturalness**. Cloud cannot synthesize; Mac currently caches only 0.6B, so one explicit pinned download is needed. No production model/dependency change.

`prepare-supported-auditions.py` makes two isolated full-content copies:

- `larger-neutral`: Ryan, larger model, null instructions. Tests capacity without performance direction.
- `larger-conversation`: identical larger model and Ryan, with: `Speak to one person beside you in an ordinary conversational voice. Use matter-of-fact phrasing, relaxed everyday pacing and light natural warmth.`

This avoids an archetypal “reassuring doctor” performance request. Keep all four English texts and Mandarin handover verbatim, both languages on Ryan, current speed 1, -20/-1 loudness, native-rate pipeline, sampling and bounded validation unchanged. Changing identities changes deterministic seeds, so this is a quality comparison, not a controlled causal measurement of the prompt alone. No more 0.6B variants.

### Precise Mac handoff — round 2 (supersedes round 1)

First, download **only this explicitly pinned audition model** using the existing runtime (online download, no inference). Keep its returned snapshot path and command log:

```sh
/tmp/junyan-qwen-venv-0049/bin/python - <<'PY'
from huggingface_hub import snapshot_download
print(snapshot_download('mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit',
    revision='f35faf19b0cc2160865af64ecf0f22f83d335135', token=False))
PY
```

Then preflight offline, before spending time on takes:

```sh
HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv-0049/bin/python - <<'PY'
import inspect
from pathlib import Path
from huggingface_hub import snapshot_download
from mlx_audio.tts.utils import load_model
model = load_model(Path(snapshot_download(
    'mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit',
    revision='f35faf19b0cc2160865af64ecf0f22f83d335135', token=False)))
assert model.config.tts_model_size == '1b7'
assert model.config.tts_model_type == 'custom_voice'
print(model.config.tts_model_size, model.config.tts_model_type)
print(model.get_supported_speakers())
print(inspect.getsource(type(model).generate_custom_voice))
PY
```

If load/compatibility/memory fails, report the exact failure; do not install packages, change weights, lift memory limits or fall back to another model silently. If preflight succeeds:

```sh
python3 docs/evidence/0058/prepare-supported-auditions.py output/0058-supported-auditions
for candidate in larger-neutral larger-conversation; do
  HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv-0049/bin/python scripts/content-audio.py \
    --content "output/0058-supported-auditions/$candidate/content.json" \
    --voices "output/0058-supported-auditions/$candidate/voices.json" \
    --output "output/0058-supported-auditions/$candidate/audio" \
    --engine qwen --write-content || break
done
```

Cloud validation of both prepared copies: each plan has 120 cached / exactly 5 pending (4 English + 1 Mandarin); content equals production exactly and only the two doctor presets differ. No synthesis or quality pass claimed. No need to rerun unchanged game tests for this documentation/preparer-only checkpoint.

Return the same artifact contract as round 1 plus model preflight output and runtime version. Present two anonymous labels in the same wake scene, at the same volume, to the user. First compare the first English line and Mandarin handover; stop if both still sound unnatural. Only a promising voice proceeds to the complete four-line premise and nurse transition. Ask for ordinary believable conversation, exact words, clear Mandarin and consistent identity; avoid prompting the listener to favour “calmness”. Record what they reject or prefer in their own words and retain actual listening/scene capture paths. Root cannot hear audio and must not invent listening notes. Both larger takes remain hypotheses, not production choices.

If supported conversational direction still fails, stop expanding synthetic preset variants. Next materially different strategy is a short performance-led bilingual human recording of the exact script (or a consensually supplied reference with a separately evaluated local cloning model). That would establish natural conversational timing directly rather than extrapolating from preset names. No human recording, reference use, model change or paid service has occurred or been silently authorized by this plan. Discuss that route with the user based on the round-2 evidence.

## 2026-11-05 — narrow round-2 probe before full generation

Parent independently resolved the same exact pin with `HfApi(token=False)` and reports total snapshot size 2,312,059,416 bytes; not cached yet. No production model choice. The source-backed 1b7 capability comparison stands; user's two first-round rejections stand.

The supported preparer now defaults to **only the first English line and Mandarin handover**, preserving both authored steps exactly. It removes other opening steps/cast only in the ignored pipeline fixture; that fixture is not a playable opening or a replacement for production content. Both candidate plans validated: **87 cached / 2 pending**, texts exactly `Ah, you're awake. Don't try to sit up yet.` and `人醒了。我明天再来看看。`. Other content stays copied only to reuse the known cache. No additional cast is synthesized. `--full` explicitly opts into all five doctor lines later; do not use it before a promising listening result.

Use the pinned download and offline model preflight above, then this **replacement synthesis command** (four new clips total across two comparison arms):

```sh
python3 docs/evidence/0058/prepare-supported-auditions.py output/0058-supported-probe
for candidate in larger-neutral larger-conversation; do
  HF_HUB_OFFLINE=1 /tmp/junyan-qwen-venv-0049/bin/python scripts/content-audio.py \
    --content "output/0058-supported-probe/$candidate/content.json" \
    --voices "output/0058-supported-probe/$candidate/voices.json" \
    --output "output/0058-supported-probe/$candidate/audio" \
    --engine qwen --write-content || break
done
```

After generation each fixture should plan as **89 cached / 0 pending**. Return two new WAVs, manifest, voices/content fixtures and logs per candidate. Do not import these truncated fixtures into the game. For in-scene listening, parent can construct temporary full production copies and replace only the first English and doctor Mandarin audio references with probe outputs; keep the remaining three English clips identified as baseline, not candidate. Alternatively play only the two probe clips for the initial comparison, then run the full in-scene comparison if the user hears a promising result. Only that user's actual comparison can decide whether further work is justified.

If promising, prepare a **new** output path with `--full`, copy verified probe WAVs and their matching manifest entries into that candidate output, and synthesize the remaining three doctor lines through the same pipeline. Do not reuse a probe's truncated content as full content. Existing sample identities match between probe/full because kind, exact text, preset, pinyin and generator version match. Final full plan requires 125 cached / 0 pending. Writer alone imports an accepted production result after actual listening and review.

## 2026-11-05 — expanded product-quality gate

Root requires actual UI play-throughs, normal/reduced-motion phone/desktop inspection, persistence/offline checks, independent product review and honest quality assessment before READY. This checkpoint remains **BLOCKED**, never READY. No 1.7B replacement audio has arrived in this cloud checkout, and this model cannot hear the local experience. Actual user rejection of both original auditions remains the only listening-quality verdict; no numerical voice score can honestly be inferred from config, signal checks, screenshots or tests.

Existing normal-motion waiter journeys exercised the opening and four complete customer interactions through visible UI actions, change and journal. They use dev/test mode for deterministic state inspection/order lookup, not direct state mutation to complete those actions. Persistence/save fixtures are supplemental checks, not substitutes for that actual UI sequence. Automated playback is muted, so these are interaction/visual reviews, not listening. The separate production offline test checked actual repository WAV loading with networking disabled; it did not listen or approve a proposed replacement.

Independent read-back of this patch: production presets/content/audio remain unchanged; probe fixtures intentionally truncate the opening and must never be shipped as content. Checked default probe preserves the two authored steps, keeps one bilingual Ryan speaker and changes only doctor presets; output must be fresh. No inference that 1.7B will sound better without a user comparison. Root's separate reviewer has not yet provided exact-head defect or product acceptance; this writer's read-back is not independent approval.

Quality assessment (scope: doctor voice change, not game-release readiness):

| Dimension | Score / evidence | What prevents 10 |
| --- | --- | --- |
| Naturalness / spoken presentation | **Unrated, blocking**: user rejects both real first-round takes; 1.7B unheard here | Need an accepted ordinary conversational bilingual performance; cloud cannot assign an honest listening score |
| Visual presentation | **8/10 baseline only**, phone/desktop screenshot inspection, visible replay/continue and fitting dialogue | This branch adds no visual improvement; screenshot inspection cannot establish live delivery quality or all device behaviour |
| Immersion | **Unrated, blocking** for proposed voice | User says neither sounds like a normal doctor; new mechanism has no actual listening result yet |
| Usability | **8/10 baseline UI only**, full UI journeys, replay recovery checks, journal/reload checks | Voice intelligibility not evaluated here; full browser run has a teardown error and strict-autoplay cases remain unrun |
| Contribution to fun / interest | **Unrated**, relevant but unproven | An ordinary believable introduction may reduce friction, but no accepted voice or human playtest demonstrates increased enjoyment/retention |

No dimension is labelled N/A merely because it cannot be measured. These limited self-scores are not an independent review or approval. The game is a short vertical slice, not established release-quality Steam content; fun and retention remain hypotheses absent human playtest evidence.

Concrete defects / open gates: (1) rejected naturalness remains unresolved; next action is the supported two-line Mac probe and user comparison, not blind preset retakes; (2) original 0.6B prompt was provably ignored—documented and removed from the active strategy; (3) suite cleanup `route.fetch: Test ended` needs a scoped verification-tooling follow-up, proposed for root: cancel/await pending audio routes on teardown and prove both normal/silent fixture paths finish without stray callbacks. Do not edit shared e2e fixtures under this voice ticket's lease. (4) strict-autoplay and new-voice offline checks remain for final integration. No known audio-quality blocker is waived by baseline test success.

Reduced-motion command: `JUNYAN_DEV_PORT=5400 JUNYAN_PREVIEW_PORT=5401 pnpm exec playwright test --config output/0058-reduced-playwright.config.ts e2e/waiter.spec.ts e2e/save.spec.ts --grep 'wake in the ward|browser saves and reloads|completed IndexedDB save'`. Temporary config imports the existing ignored system-Chromium config and sets `reducedMotion: reduce` in both projects, with unique `desktop-reduced`/`phone-reduced` screenshot names. **6 passed, exit 0, 1.4m**. Full journeys include opening, four customers, change, journal and clean console assertions; persistence checks verify looked-up word reload and next-day journal/earnings retention. The completed-day save fixture is explicitly supplemental, not proof that the day was played; the separate complete waiter journey supplies that evidence.

Inspected actual reduced-motion screenshots: `output/playwright/desktop-reduced-opening-01-say-en.png`, `desktop-reduced-opening-05-say.png`, `desktop-reduced-restaurant.png`, `desktop-reduced-journal.png`, `phone-reduced-opening-01-say-en.png`, `phone-reduced-opening-05-say.png`, `phone-reduced-journal.png`. Layout fits, replay/continue remain visible, journal text remains legible with visible close control. Screenshot inspection cannot establish motion timing or listening quality. Normal-motion screenshots/results are recorded above. No new production change or voice-quality claim. Overall verdict remains BLOCKED pending actual replacement clips and user/product/exact-patch acceptance.

## 2026-11-05 — parent reports successful supported-model probes

Parent reports actual Mac preflight of the downloaded pinned `f35faf19b0cc2160865af64ecf0f22f83d335135` checkpoint: `1b7/custom_voice`, `generate_custom_voice` present, loaded with the existing adapter and 5GB limit. Both two-line probes generated successfully using `HF_HUB_CACHE=/tmp/junyan-supported-models HF_HUB_OFFLINE=1`: each 2 attempted / 0 failed / 89 available / 0 pending. These are parent-reported technical results; cloud writer has not received or listened to their artifacts.

Parent presented anonymous A (neutral) and B (conversation) to the user; subjective choice is pending. Neither candidate is approved or imported. Doctor production-file hold remains in place; await explicit feedback and chosen artifacts before further synthesis or production edits. Related work remains separately owned: 0062 punctuated same-voice fixtures, 0060 visual pose, 0063 isolated ambience. No changes to their files or shared leases. Verdict stays BLOCKED on listening/acceptance, final complete-line verification and independent review.

For any later synthesis with the parent's new cache, retain both `HF_HUB_CACHE=/tmp/junyan-supported-models` and `HF_HUB_OFFLINE=1` on the real-model command. The earlier handoff omitted this now-established cache selector; omitting it could produce an avoidable offline-cache failure.
