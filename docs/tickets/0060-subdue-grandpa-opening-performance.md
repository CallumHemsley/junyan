---
id: 60
title: Make Grandpa's hospital performance frail and subdued
status: todo
priority: medium
type: bug
created: 2026-11-05
---

## Why

Callum reports that Grandpa (老爷爷) is too excited and exaggerated in the hospital opening. As a sick patient resting in bed, he should come across as frail and low-energy, with restrained warmth rather than an exuberant performance.

## Done when

- [ ] Review Grandpa's breakfast requests, wrong-item reactions and thanks in the playable opening, assessing both voice delivery and visible gestures/posture. Record which parts create the excessive excitement.
- [ ] Give his lines a quieter, gentler, less animated delivery with natural pauses and clear Mandarin. Convey frailty through the performance while keeping speech comfortably audible and understandable; avoid exaggerated trembling, wheezing or other caricature.
- [ ] Keep his pose and movements consistent with a patient resting in bed: small, unhurried gestures and restrained reactions. Adjust movement where it contributes to the reported exaggeration.
- [ ] Callum reviews the revised scene with sound and confirms Grandpa feels frail, subdued and believable. Regenerate any changed audio through the offline pipeline and update content paths and the manifest; keep the existing breakfast interactions and script intact.
- [ ] Run the relevant rules/content and scene tests, audio/offline checks if clips change, and the Playwright opening-to-restaurant journey. Inspect phone and desktop screenshots and a short video with sound, including reduced-motion behavior, and confirm a clean console. Record commands and results in Notes.

## Notes

- Reported by Callum on 2026-11-05: "hes too excited. If he's sick he should be feable and less over exagerated". Exact contributing lines or animations have not yet been verified.
- Opening cast ID: `elder`, display name 老爷爷, voice preset `uncle-fu-levelled` in `src/content/voices.json`. His requests and reactions are in `src/content/content.json`; ward poses and step states are in `src/scene/ward.js` and `src/scene/ward-steps.js`.
- Starting points: `scripts/content-audio.py`, `docs/content-audio.md`, [[tickets/0050-opening-content]], [[tickets/0053-ward-scene]], [[decisions/0004-hospital-opening]].
- Scope is Grandpa in the hospital opening. Check preset consumers before editing shared voices so the restaurant's Uncle Fu is not inadvertently recast. Serialize edits to shared content, voice presets and the manifest with [[tickets/0058-doctor-opening-voice]] and [[tickets/0057-relevel-restaurant-audio]].
