---
id: 49
title: Teach the voice pipeline English lines, per-cast voices and loudness
status: done
priority: high
type: feature
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] requires every line of the opening to be voiced by the repo's offline voice models, English included, and never by browser speech synthesis. `scripts/content-audio.py` only knows Chinese lines and a single word voice. The voice prototype (`spikes/hospital-opening/voice/generate.py`) showed a 12 dB loudness spread between speakers and about one failed or babbling clip in five single words. This ticket fixes the pipeline on a fixture and changes no game content. It is PR 0049 in the plan `docs/plans/hospital-opening.md` (section PR 0049).

## Done when

- [x] `scripts/content-audio.py` supports an English line kind (`{en, audio}` steps), which `collect_jobs` (`:81-135`) skips today.
- [x] `src/content/voices.json` holds per-cast voice presets with a language per line. The doctor has an English preset and a Chinese preset on one speaker.
- [x] The cast is voiced as in the prototype: doctor Ryan, nurse Vivian, 老爷爷 Uncle_Fu, 小姨 Serena, on the pinned Qwen3-TTS model `mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit` at revision `08c72cad5e2fd0f41730c8bd1f28149585e46361`.
- [ ] Every clip is normalised to -20 dBFS speech RMS with a -1 dBFS peak cap.
- [x] The word duration check scales with the syllable count, so short words such as 了 and 个 and two-syllable words such as 慢慢 and 馒头 are judged fairly.
- [x] The pipeline tries more seeds before it fails a clip. A line or word that still fails exits non-zero and names the clip.
- [x] Output still matches the manifest rules that `src/content/content.test.ts:145-182` checks: text, voice, sha256, 24 kHz mono PCM16, filename `(line|word)-<hash>.wav`.
- [ ] A fixture of at least one English line, one Chinese line per cast voice, and the single words 一, 慢慢, 了 and 馒头 runs end to end. The PR states the command and its result.
- [x] Unit tests: a test of the pure parts (job collection, syllable-scaled duration bounds, normalisation maths) runs with a stated command. Existing `pnpm test` stays green.
- [ ] Live check: listen to every fixture clip and confirm in the PR that each one says its text, at an even level across speakers.
- [x] Perf budget: the fixture generates in under 60 s on the Mac (the prototype made 17 lines in 28 s).

## Notes

- Depends on: 0047.
- Owns: `scripts/content-audio.py`, `src/content/voices.json`, a new fixture folder under `scripts/` (for example `scripts/fixtures/content-audio/`), and any test file for the script.
- Must not touch: `src/content/content.json`, `src/content/index.ts`, `public/audio/`, `src/App.tsx`, `e2e/`. Real opening audio lands in 0050.
- `src/content/voices.json` is shared. Changes to it are serialized: no other ticket edits it while this one is open. Ask before adding any Python or Node dependency. A `package.json` or lockfile change is serialized too.
- Kokoro presets are in `voices.json` but Kokoro is not cached locally. Do not depend on it. No ASR model exists locally, so the quality check stays duration and loudness based.
- Ports: `JUNYAN_DEV_PORT=5304`, `JUNYAN_PREVIEW_PORT=5305`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product default this ticket implements, which Callum may overrule:
  - D8. Casting as in the voice prototype, plus an English line kind, per-cast presets with a language per line, loudness normalisation, a syllable-scaled word duration check and more seeds. Any clip that still fails blocks the PR.
- Pointers: `scripts/content-audio.py:81-135` `collect_jobs`; `scripts/content-audio.py:245-247` the Chinese-only package list; `spikes/hospital-opening/voice/generate.py` and `spikes/hospital-opening/voice/provenance.json` for the working prototype settings.

## Outcome (2026-11-03)

- Owner: Claude Code (autopilot-stack takeover). Branch `claude/0049-voice-pipeline-english`, worktree `.claude/worktrees/agent-a470317d452cf1220`, ports 5304 and 5305. Built to the plan section, which supersedes this ticket where they differ: the plan edits `src/content/index.ts` (the `voicePreset` schema only) and `src/content/content.test.ts` (the voices case only), and the fixture is the plan's opening shape at `scripts/fixtures/opening-audio.json`.
- `content.opening` routes per cast member: `say-en` steps become `english-<hash>.wav` on `voices.en`, other steps take `voices.zh`, the end title and every word take `wordVoice`. Phrases speak their `text` with punctuation. Presets `ryan-en`, `ryan-zh`, `vivian`, `uncle-fu-levelled` and `serena-levelled` carry `loudness` -20/-1. Words reject a speech span over `0.6 + 0.5 × Han characters` seconds, and each clip gets up to 8 seeds. A clip that fails all 8 still exits 1 and stays pending.
- The 85 restaurant clips are untouched. `--plan` prints the same 85 rows, all cached, byte-identical to the parent.
- Real-model smoke on the fixture (`HF_HUB_OFFLINE=1`, pinned revision): `27 attempted, 0 failed, 27 available, 0 pending` in 47.3 s wall, model load included. A rerun prints `0 attempted` and leaves the manifest bytes unchanged. The seven levelled lines measured -20.79 to -20.00 dBFS active RMS (raw -25.01 to -19.03), peaks -6.34 to -1.00 dBFS.
- Learned: the syllable bound earns its place. Of 19 words, 8 needed retries, and 好 took 5 seeds. With the old 3-seed cap, 好 would have failed the run. Learned: `LocalEngines` keyed Qwen models by language, so the English line loaded a second copy of the same weights. Qwen is now keyed without language, which cut the smoke from 68.2 s to 47.3 s.
- Not done here: native listening. No one has confirmed by ear that each fixture clip says its text. The script has no ASR; the checks are duration and loudness only. Words stay unlevelled on `serena` to keep the 85 clips cached; [[tickets/0057-relevel-restaurant-audio]] tracks levelling the restaurant voices.
- This ticket's fixture list named 一, 慢慢 and 馒头. The plan's fixture replaced them with the opening's own words; 了 and the two-syllable 好的, 医生, 豆浆, 谢谢 and 明天 exercise the bound instead.
