---
id: 57
title: Level the restaurant voices to the opening's loudness
status: todo
priority: medium
type: chore
created: 2026-11-03
---

## Why

0049 added per-preset `loudness` and levels only the opening's cast presets (-20 dBFS active speech RMS, -1 dBFS peak cap). The restaurant presets (`serena`, `uncle-fu`, `yunxi`, `xiaobei`) and every dictionary word stay unlevelled so their 85 committed clips keep their names. In the 0049 fixture smoke, Qwen's raw takes ranged from -25.0 to -19.0 dBFS active RMS, so day 1 can sound a few dB quieter or louder than the opening that leads into it. The plan estimates up to about 6 dB.

## Done when

- [ ] `loudness` is added to the four restaurant presets and to the word voice, or the levelled presets replace them.
- [ ] All affected clips are regenerated with `--write-content`; `--plan` shows every asset cached.
- [ ] A listening pass across the opening into day 1 confirms an even level and that each clip still says its text.
- [ ] `pnpm test`, the audio Playwright suite and the offline precache check stay green with the new filenames.

## Notes

- Filed by 0049. Adding `loudness` to a preset changes its identity, so all 85 restaurant filenames change. That needs a listening pass and is why 0049 left it out.
- The Kokoro presets (`yunxi`, `xiaobei`) need a Kokoro environment, which is not cached locally (see 0049 Notes).
- Pointers: `scripts/content-audio.py` `level` and `speech_metrics`; `docs/content-audio.md` "Loudness and the word duration check".
