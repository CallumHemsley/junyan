---
id: 60
title: Make Grandpa's hospital performance frail and subdued
status: done
priority: medium
type: bug
created: 2026-11-05
---

## Why

Callum reports that Grandpa (老爷爷) is too excited and exaggerated in the hospital opening. As a sick patient resting in bed, he should come across as frail and low-energy, with restrained warmth rather than an exuberant performance.

## Done when

- [x] Review Grandpa's breakfast requests, wrong-item reactions and thanks in the playable opening, assessing both voice delivery and visible gestures/posture. Record which parts create the excessive excitement.
- [x] Give his lines a quieter, gentler, less animated delivery with natural pauses and clear Mandarin. Convey frailty through the performance while keeping speech comfortably audible and understandable; avoid exaggerated trembling, wheezing or other caricature.
- [x] Keep his pose and movements consistent with a patient resting in bed: small, unhurried gestures and restrained reactions. Adjust movement where it contributes to the reported exaggeration.
- [x] Callum selects the believable delivery direction through the A/B audition; complete the selected pipeline clips and authorized self-verification, updating content paths/manifest while keeping the existing breakfast script intact. (User selected A with “A feels right” and explicitly authorized completion without another full-scene human approval gate; no full-scene human listening claim.)
- [x] Run the relevant rules/content and scene tests, audio/offline checks if clips change, and the Playwright opening-to-restaurant journey. Inspect phone and desktop screenshots and a short video with sound, including reduced-motion behavior, and confirm a clean console. Record commands and results in Notes.

## Notes

- Reported by Callum on 2026-11-05: "hes too excited. If he's sick he should be feable and less over exagerated". Exact contributing lines or animations have not yet been verified.
- Opening cast ID: `elder`, display name 老爷爷, voice preset `uncle-fu-levelled` in `src/content/voices.json`. His requests and reactions are in `src/content/content.json`; ward poses and step states are in `src/scene/ward.js` and `src/scene/ward-steps.js`.
- Starting points: `scripts/content-audio.py`, `docs/content-audio.md`, [[tickets/0050-opening-content]], [[tickets/0053-ward-scene]], [[decisions/0004-hospital-opening]].
- Scope is Grandpa in the hospital opening. Check preset consumers before editing shared voices so the restaurant's Uncle Fu is not inadvertently recast. Serialize edits to shared content, voice presets and the manifest with [[tickets/0058-doctor-opening-voice]] and [[tickets/0057-relevel-restaurant-audio]].

### Worker progress — 2026-11-05

- Owner: Codex cloud worker, ticket 0060 only. Branch: `codex/0060-subdue-grandpa-opening`; isolated checkout: `/workspace/junyan-0060`; base: `66ac123`; strict ports: dev `5408`, preview `5409`.
- Evidence and append-only decisions: [[evidence/0060-grandpa-performance]].
- Shared-file leases: 0058 owns voices/content/audio manifest; 0059 owns scene files. No production edits until root releases ownership.
- Investigating actual opening requests, both wrong choices and thanks; no listening acceptance claimed.

- 2026-11-05: root authorized ward-local implementation while PR11 is reviewed. Applied only three pose lines in `wardScene.draw`: relaxed arms, slightly forward rest, lowered held hand/food together. Compared PR11 exact head `992f73628c80d6a2829173431a4180ccbbd2499c`; it changes `plot`, avoiding these lines. No merge/rebase.
- Pinned MLX 0.6.3 **discards instructions for 0b6**, confirmed in upstream release source; do not synthesize prompt-only candidates. Voice performance/listening remains blocked.
- 48 silent actual-opening captures cover both requests, both wrong bread reactions, both thanks, desktop/phone and normal/reduced motion; selected screenshots in `docs/evidence/0060/`. See evidence for exact checks and environment limits.

- Rebased onto main `85a0120`; retained PR11 depth fix. Final build passed; full rules/content/scene suite passed 170/170 with explicit 15s allowance after a load-related 5s timeout. Actual production opening + offline reload retained journal and served 125 cached audio paths; no console errors. Final screenshot/video evidence and scoped quality scores in own evidence file.
- **Incomplete / BLOCKED** on original voice delivery, supported synthesis choice, actual listening comparison and Callum acceptance. Visual portion is independently inspected and implemented; no merge authorization inferred.

- 2026-11-05 completion phase: user selected neutral A with “A feels right” on original two-line preview. Root granted exclusive import lease on main `196f88c`. Imported selected full-six support `cfaa2fd`, retaining the two heard WAVs byte-exact, four SHA-bound/ASR-checked remaining clips, and existing hospital preset ID. Tokens/script/doctor/customer/Help/assets preserved; current checks and independent final-head review underway. Historical BLOCKED entries above describe earlier gates, now resolved by selection and explicit self-verification authorization.

### Completion — selected A

- Completed on current main `196f88c`: exact two user-heard neutral 1.7B Uncle_Fu WAVs reused; four remaining SHA-bound/ASR-aligned clips imported from support `cfaa2fd`. Existing exclusive elder preset only; six refs, six WAVs and manifest replacement; subdued ward pose retained. No other production scope changed.
- Final verification: **206/206 unit tests**, build, audio pipeline self-check, **126/126 cached audio jobs**. **4/4 actual UI opening→four-customer-day journeys** on phone/desktop normal/reduced motion passed (3.9m), including change, journal, next day, clean console. Both wrong-item reactions and all six native replays separately exercised. Production offline reload preserved journal and all126 audio assets; all six Grandpa clips played to native completion while offline.
- User accepted A's original two-line delivery preview, not a claimed full-scene human audition. Cloud worker did not listen. Full support ASR checks word sequences, not tone/affect/naturalness. Explicit user authorization accepts self-verification for the remaining completion gate.
- Selected final screenshots, actual ward video with captured speech (browser output muted), replay/offline receipts and honest quality review: [[evidence/0060/selected-A-final/README]]. Independent exact implementation review at `a2b94f8` passed; final evidence-only head confirmation requested. Root also relayed independent206unit/build and6/6actual Chrome cases passing. Root owns merge; writer has not merged.
- Learned: Qwen0.6B's adapter drops instructions; model capability must be verified before prompt tuning. Existing pipeline content hashes change sampling seeds with preset edits, so audition preference is not isolated evidence of prompt causality. 1.7B neutral was the user-selected direction.
