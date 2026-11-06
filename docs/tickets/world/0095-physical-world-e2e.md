---
id: 95
title: Migrate browser journeys to physical world controls
status: done
priority: high
type: chore
created: 2026-11-06
---

## Why

Existing browser journeys still target removed table lists and location tabs.

## Done when

- Shared helpers walk through real doors and approach physical activity anchors.
- Existing serving, learning, activity, purchase, reload and offline assertions remain covered.
- Generated browser evidence stays outside tracked source pending public QA approval.

## Notes

- Owner: Codex local e2e worker. Branch: `codex/0095-physical-world-e2e`.
- Worktree: `/private/tmp/junyan-world-e2e`; dev port 5508, preview port 5509 (strict).
- Node v22.23.4 verified. Parent owns integration and cross-review.
- Private evidence: `/private/tmp/junyan-world-private-qa/e2e`.

## Completion notes

- A shared journey helper reads actual state, walks via canvas/touch or real keyboard controls, traverses authored doors, and activates only nearby world controls. Normal journeys never dispatch rules actions or inject saves or time.
- Serving, learning, native speech, offline speech, all four activities, gifts, purchases, placement, reload and next-day assertions remain covered. Pocket journal exits and movement-pad keyboard activation have dedicated regressions.
- Cat conversations move their physical anchors; the journey follows the cat before continuing its story. Held-key checks wait for activity-close focus effects to settle.
- Screenshots and native event reports use the private artifact helper; traces and videos were directed outside the checkout. No generated evidence is a source dependency.
- The UI/startup/scheduling test batch was separately leased under ticket 0096. Root owns source integration, cross-review and final combined verification; source regressions found by these journeys were fixed there, including ticket 0097.
- Node 22.23.4, the production build, strict checks of the owned TypeScript tests, and the revised desktop/phone journey checks were verified locally. Detailed raw reports remain private.
- Final owned coverage: all 65 runnable cases passed across the complete batch and focused corrections; the two existing dedicated-autoplay-project skips remain unchanged. The final eight previously failing/unrun phone cases all passed. Root separately verified the final-source unavailable-voice cases on both screen sizes.
