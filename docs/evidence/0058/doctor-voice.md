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
