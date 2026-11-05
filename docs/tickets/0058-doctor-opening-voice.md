---
id: 58
title: Give the opening doctor a calm, reassuring voice
status: todo
priority: high
type: bug
created: 2026-11-05
---

## Why

Callum reports that the doctor's voice when waking up in the hospital opening sounds "so creepy" and "not like a doctor at all". This first encounter should feel calm and reassuring, with a believable doctor speaking naturally to a patient who has just woken up.

## Done when

- [ ] Listen to all of 王医生's opening lines in context and identify what makes the current delivery unsettling; record the findings rather than assuming a technical cause.
- [ ] Compare a small set of revised takes or voice presets. Choose a natural, professional, reassuring delivery with conversational pacing and clear speech, consistent across the English premise and Mandarin handover.
- [ ] Callum hears the proposed voice in the wake-up scene and confirms it feels like a reassuring doctor. Duration and loudness checks alone do not count as voice-quality approval.
- [ ] Regenerate the affected doctor clips through the offline audio pipeline, update content paths and the manifest, and confirm replay, even loudness against the rest of the ward cast, and offline playback. Preserve the accepted script and English boundary in decision 0004.
- [ ] Run the rules/content tests, audio and offline checks, and the Playwright opening-to-restaurant journey; inspect phone and desktop screenshots and confirm a clean console. Record commands, results and the listening comparison in Notes.

## Notes

- Reported by Callum on 2026-11-05 while playing the first story's wake-up scene. This ticket captures the feedback; a cause has not yet been verified.
- Current casting: `doctor` / 王医生 in `src/content/content.json`, using `ryan-en` and `ryan-zh` in `src/content/voices.json`. Review all four English premise lines and the Mandarin handover, not just an isolated sample.
- Pointers: `scripts/content-audio.py`, `docs/content-audio.md`, `public/audio/manifest.json`, [[tickets/0049-voice-pipeline-english]], [[tickets/0050-opening-content]], [[tickets/0055-opening-ui]], [[decisions/0004-hospital-opening]]. The original audio tickets explicitly left listening checks outstanding.
- Serialize changes to shared voice presets, content and the manifest. [[tickets/0057-relevel-restaurant-audio]] tracks restaurant loudness separately.
