---
id: 5
title: Sketch the known-word model and the director
status: todo
priority: medium
type: explore
created: 2026-10-25
---

## Why

The game is a scheduler of re-encounters: a word needs 8 to 12 spaced exposures to stick, and the on-screen known fraction has to stay near 95% without the player seeing a number. That needs a per-word model (what counts as an exposure, a lapse, a success) and a director that turns the model's state into "who approaches next and what do they say". Both should be designed on paper before the engine or the stack is chosen.

## Done when

- A note in `docs/ideas/word-model-and-director.md` covering: the unit tracked (lemma or character, per ticket 1); FSRS state per unit; which in-game events are reviews (seen in a line, tapped for a picture, acted on correctly, acted on wrongly) and how each updates the state; the "known" threshold that feeds the generation whitelist.
- The director's inputs and outputs: given the known set, the due queue and the scene, how it picks the next request's new word (if any) and the phrasing level, and how it keeps the band without exposing it.
- A seeding plan for a new player (frequency-ordered list plus a short in-fiction placement, no test).
- Open questions listed for the first code prototype.

## Notes

- Simplest credible model and FSRS vs half-life regression figures in [[ideas/research-llm-graded-generation]] §4.
- Repetition and coverage constraints in [[ideas/research-immersion-theory]] §4; Refold's domain-gating idea in §2.
- Director analogies (Left 4 Dead, flOw, Crash) in [[ideas/research-game-design-patterns]] §5.
