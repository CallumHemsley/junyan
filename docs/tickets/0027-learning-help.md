---
id: 27
title: Make onboarding usable through the game's learning aids
status: todo
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

- Reserved centrally by parent. Owner Sol 6.1 medium implementation worker, isolated branch/worktree and strict port.
- Evidence: `output/playwright/usability-review/report.md` findings 5 and 6, `desktop-onboarding.png`, `small-phone-onboarding.png`, `word-card-food.png` / reviewer results JSON.
- Sole ownership shared content/contracts/pipeline extension for this round; App edits limited to Help body and visible gloss, coordinated with audio and UI workers.
- Preserve actual Pixel Plays engine, authored four-character voices and existing 67 WAV identities; reuse the local generation pipeline for new Help clips.
- All browser/tests must be silent without changing system volume. Native pronunciation approval remains pending.
