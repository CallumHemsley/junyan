---
id: 64
title: Explore more playful interactions in the restaurant
status: todo
priority: medium
type: explore
created: 2026-11-05
---

## Why

Callum wants the player to have more things to do in the café/canteen and asks for a brainstorm about what would make it more fun. Find interactions that are enjoyable in their own right and strengthen the cozy Mandarin setting, building on the existing waiter loop.

## Done when

- [ ] Play the current restaurant loop and identify where the player is waiting, repeating actions without a meaningful choice, or wanting to interact with the scene. Record observations separately from ideas.
- [ ] Produce a focused shortlist of up to five distinct ideas. Possible starting points include preparing or pouring a drink, helping with a small customer request, clearing or arranging a table, responding to a regular, or choosing how to improve the stall. These are prompts for exploration, not committed features.
- [ ] For each idea, describe the player's concrete action, an example moment, why it could be fun, how it fits Mandarin learning without becoming an exercise, and its likely implementation effort. Consider phone controls, accessibility and the gentle pace.
- [ ] Recommend the smallest promising experiment and define how a short playtest would tell whether it adds enjoyment rather than busywork. Describe the minimum prototype, its success criteria and the parts intentionally left out.
- [ ] Save the brainstorm and recommendation in `docs/ideas/restaurant-interactions.md` with the project's idea/research frontmatter. Present the shortlist to Callum for selection before creating implementation tickets or building a prototype.

## Notes

- Requested by Callum on 2026-11-05. This ticket is exploration; no particular new mechanic has been selected.
- Context: [[decisions/0003-pixel-waiter]], [[ideas/build-recommendation]], [[tickets/0002-paper-prototype-one-counter]], [[tickets/0004-pin-down-the-hook]] and the existing pickup, delivery, change, journal and day-progression interactions.
- Respect pure rules over explicit state, injected time/RNG, tappable DOM Mandarin, offline content and audio, and touch targets. Any costly-to-reverse proposal needs a decision for Callum to accept.
- Coordinate with [[tickets/0062-natural-customer-performances]] and [[tickets/0063-restaurant-background-sounds]] so the brainstorm builds on the desired atmosphere without duplicating those tickets.
