---
id: 58
title: Give the opening doctor a calm, reassuring voice
status: doing
priority: high
type: bug
created: 2026-11-05
---

## Why

Callum reports that the doctor's voice when waking up in the hospital opening sounds "so creepy" and "not like a doctor at all". This first encounter should feel calm and reassuring, with a believable doctor speaking naturally to a patient who has just woken up.

## Done when

- [ ] Listen to all of 王医生's opening lines in context and identify what makes the current delivery unsettling; record the findings rather than assuming a technical cause.
- [ ] Compare a small set of revised takes or voice presets. Choose a natural, professional, reassuring delivery with conversational pacing and clear speech, consistent across the English premise and Mandarin handover.
- [x] Under the latest self-verification authorization, combine Callum's explicit two-line voice selection (A: “sounds believable”) with worker verification of the complete five-line opening, native replay and offline playback. This adapts the earlier human-in-scene criterion: no full in-scene human audition is claimed, and ASR/duration/loudness do not prove naturalness or tones.
- [ ] Regenerate the affected doctor clips through the offline audio pipeline, update content paths and the manifest, and confirm replay, even loudness against the rest of the ward cast, and offline playback. Preserve the accepted script and English boundary in decision 0004.
- [x] Run the rules/content tests, audio and offline checks, and the Playwright opening-to-restaurant journey; inspect phone and desktop screenshots and confirm a clean console. Record commands, results and the listening comparison in Notes.

## Notes

- Reported by Callum on 2026-11-05 while playing the first story's wake-up scene. This ticket captures the feedback; a cause has not yet been verified.
- Current casting: `doctor` / 王医生 in `src/content/content.json`, using `ryan-en` and `ryan-zh` in `src/content/voices.json`. Review all four English premise lines and the Mandarin handover, not just an isolated sample.
- Pointers: `scripts/content-audio.py`, `docs/content-audio.md`, `public/audio/manifest.json`, [[tickets/0049-voice-pipeline-english]], [[tickets/0050-opening-content]], [[tickets/0055-opening-ui]], [[decisions/0004-hospital-opening]]. The original audio tickets explicitly left listening checks outstanding.
- Serialize changes to shared voice presets, content and the manifest. [[tickets/0057-relevel-restaurant-audio]] tracks restaurant loudness separately.

### Ownership — 2026-11-05

- Owner: Codex cloud agent, ticket 0058 only.
- Branch: `codex/0058-doctor-opening-voice`; checkout: `/workspace/junyan-0058`.
- Base: `66ac123` (current origin/main at checkout creation).
- Strict ports: dev 5400, preview 5401 (`JUNYAN_DEV_PORT=5400 JUNYAN_PREVIEW_PORT=5401`).
- Append-only evidence and Mac synthesis/listening handoff: [[evidence/0058/doctor-voice]].
- Production content/audio remain unchanged until real synthesis and listening establish a preferred take.

- Cloud synthesis blocked: Linux x86_64 cannot import MLX. Draft PR #13 publishes exact audition inputs and Mac handoff; parent confirmed a working local runtime. Await actual clips, listening comparison and Callum acceptance before implementation completion. No production audio changes selected.

- Both first-round synthesized auditions rejected by direct user listening feedback; support branch `codex/0058-synthesis-support` at `e62a5c0` is audition evidence only. Pinned mlx-audio 0.6.3 source proves 0b6 instructions are discarded. Evidence now includes source conflict, a supported 1.7B mechanism comparison, exact revision and Mac commands. No rejected clip imported; PR13 must remain draft/unmerged.

- User accepted anonymous A as believable: 1.7B Ryan neutral, null instructions. Acceptance covers first English line and Mandarin handover only; remaining three English clips and complete-sequence verification pending. Rebased this branch onto current main `5c90ba4`; exclusive doctor production integration lease restored. Await root full neutral artifacts; no truncated/rejected content import.

- Selected full neutral artifacts integrated from support `76c7a6d`: two presets/five clips; five unreferenced prior doctor assets retired. Implementation `cfc941f` passes 170 tests/build, 125/0 cache validation, 27 normal browser checks and 9 reduced/persistence/strict-policy checks. Compact reviewer report: [[evidence/0058/verification]]. Code-ready for independent review; full-sequence subjective listening not claimed, ticket remains doing.

- Independent local ASR from support `9562e3c` is included under `docs/evidence/0058/asr/`: pinned Whisper-small recognized all five authored word sequences, allowing punctuation/spacing/case. Cloud rechecked each output against committed WAV SHA256 and exact authored input. ASR does not prove tones, affect or full human listening. The earlier Callum-in-scene criterion is explicitly adapted above under latest self-verification authorization; first/full subjective-listening checkbox remains unticked. Independent product/exact-head review still pending.
