---
id: 23
title: Exercise game usability and adversarial journeys
status: done
priority: high
type: explore
created: 2026-11-01
---

## Why

Callum's first public playtest requests reliable first-dialogue audio, better character design and correct tray occlusion, plus a usability break review.

## Done when

- Requested behavior is verified against a repeatable reproduction or inspected render, with appropriate regression coverage.
- Applicable rules/browser checks pass; visual changes are inspected at phone and desktop sizes.
- Evidence, limitations and review findings are recorded before integration/publication.

## Notes

- Reserved centrally by parent on `codex/0018-character-voices`; writer must record own branch, worktree and strict port.
- Owner: Astra independent read-only reviewer.
- Review live/current game on desktop and phone, first-time learnability, keyboard/touch, audio, recall, delivery, change, journal, saves, boundaries and day transitions. Return concrete reproducible defects and severity; no fixes during review.

## Review completed 2026-11-01

- Independent Astra review returned seven reproducible P2 findings, with no confirmed P1. Evidence and reproduction steps: `output/playwright/usability-review/report.md` (local ignored artifacts).
- UI layer focus/Escape, the deployed home link, interrupted Help and receipt target sizes are covered by ticket 0025; inconsistent saved-state recovery by 0026; learning assistance and visible English by 0027.
- The review passed 38 rules tests, desktop/phone Chromium and phone WebKit journeys, twelve customers over three days, valid save/reload and actual deployed offline audio retrieval. These checks describe the reviewed baseline; integrated fixes require their own final verification.
- Reviewer made no production edits. Browser testing was silent after the explicit mute instruction, and owned browser sessions were closed. Native Mandarin pronunciation remains unapproved.
- Parent integrated the independently reviewed 0025 and 0026 changes; 0027 and audio/visual integration continue separately. Completion of this exploration ticket records the review and assigned follow-ups, not publication of those changes.
