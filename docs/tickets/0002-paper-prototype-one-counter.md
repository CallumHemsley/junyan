---
id: 2
title: Paper-prototype one shop counter in the target language
status: done
priority: high
type: explore
created: 2026-10-25
---

## Why

The core hypothesis is that "understand the request, hand over the right thing" is fun and that inference from visual context works at about 95% known words with no English anywhere. That can be tested in an afternoon with cards, drawings and hand-written lines, before any code. It also surfaces where the player craves English, which tells us what the no-translation help (pictures, journal, gestures) must do.

## Done when

- One scene (a bakery, café or market stall) with roughly 40 words, 15 to 25 hand-written customer requests in the target language, and a few "regular" characters with a line of personality each.
- Played through by Callum, cold, in the target language, with a second person (or Claude) acting as the customers if useful.
- A note in `docs/ideas/prototype-counter.md` recording: did inference work, which words were unguessable and why, where English was craved, whether serving the right item felt like a game or a quiz, and what help was wanted.
- A list of what the next prototype (greybox, in code) must have.

## Notes

- Hypothesis and design rationale in [[ideas/design-directions]] ("Recommended starting hypothesis", "How the player gets help").
- Teaching patterns to try in the scene: demonstration before use, one new word per request, repetition with variation, scaffolding after failure ([[ideas/research-game-design-patterns]] §1, §5).
- Can start before ticket 1 is decided by prototyping in both languages, but is cheaper after it.

## Learned

- Not played. On 2026-10-31 Callum chose to skip the paper prototype and go straight to a playable MVP. The kit (scene, 45 words, 31 scripted visits, four regulars, audio) stays as the content spec for the first in-engine scene; the questions in [[ideas/prototype-counter]] move to the MVP playtest.
