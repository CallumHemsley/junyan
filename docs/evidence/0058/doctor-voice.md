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
