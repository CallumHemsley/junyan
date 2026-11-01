---
id: 27
title: Make onboarding usable through the game's learning aids
status: done
priority: high
type: bug
created: 2026-11-01
---

## Why

The Astra usability review confirmed that the first onboarding instructions are unvoiced, untappable Hanzi, while word cards expose English contrary to accepted decision 0001's characters-only presentation.

## Done when

- Onboarding instructions use authored schema-validated, presegmented lines with local audio and tappable word aids.
- A small visual sequence helps a new reader understand ordering, collection, delivery and change without English.
- English gloss metadata remains available internally but is absent from the visible player surface; tap-only pinyin and food pictures remain.
- Help vocabulary uses the existing journal and reusable content-audio pipeline; generated assets retain provenance and offline precaching.
- Desktop/phone and appropriate content/audio regression checks pass silently.

## Notes

- Working: Sol 6.1 medium; branch `t3/chinese-voiced-learning-help`, worktree `t3-cdb18f70`, dev port 5189 / preview 5190 (strict). Only Help body, visible gloss, content contracts, pipeline coverage and isolated Help styles are owned here.
- Completed: six schema-validated, authored Help lines use the existing token/lookup/journal renderer and speaker playback. Three original inline, text-free diagrams show table/order → kitchen/tray → delivery/change. English gloss rendering is removed; internal metadata, tapped pinyin and all seven food pictures remain. README wording now matches.
- Audio: 18 new Serena WAVs (five full lines, thirteen dictionary words; 1,582,872 bytes). The other Help line and four words reuse existing audio. All 67 prior WAV byte hashes and manifest records are unchanged; all 85 jobs are cached and included by automatic service-worker generation. No generator/version/preset change or new dependency.
- Verified 2026-11-01: `pnpm test` (39 passing), `pnpm build`, `python3 scripts/content-audio.py --self-check`, cached `--plan`, original-WAV/provenance and service-worker checks, `git diff --check`. Build has existing third-party Zod annotation warnings only.
- Chromium `--mute-audio` only: 14 desktop/phone browser checks pass (new Help suite plus existing waiter journeys). Coverage includes every Help line's local audio response, keyboard token lookup, all 17 distinct Help words in journal, saved Help-word reload, offline metadata decoding for every Help clip, every food picture without English gloss, and 320×568 viewport bounds. No system-volume changes or audible preview. Screenshots inspected at 1440×1000, 390×844 and 320×568; Help console/page errors empty. Evidence: `output/playwright/0027/`, runner `output/learning-help.playwright.config.ts` with `JUNYAN_HELP_PREVIEW_URL=http://127.0.0.1:5190/junyan/`.
- Integration: Help calls the existing `tokens(line)` helper, so the parent's `lookup(w, event.currentTarget)` signature/focus behavior remains owned by 0025; no lookup, playback, focus/open-handler or load/save wiring edits here. Actual Pixel Plays and four character voices remain unchanged. Native Mandarin pronunciation and real beginner-comprehension review remain pending; tests deliberately did not listen.

- Reserved centrally by parent. Owner Sol 6.1 medium implementation worker, isolated branch/worktree and strict port.
- Evidence: `output/playwright/usability-review/report.md` findings 5 and 6, `desktop-onboarding.png`, `small-phone-onboarding.png`, `word-card-food.png` / reviewer results JSON.
- Sole ownership shared content/contracts/pipeline extension for this round; App edits limited to Help body and visible gloss, coordinated with audio and UI workers.
- Preserve actual Pixel Plays engine, authored four-character voices and existing 67 WAV identities; reuse the local generation pipeline for new Help clips.
- All browser/tests must be silent without changing system volume. Native pronunciation approval remains pending.
