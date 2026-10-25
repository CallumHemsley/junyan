---
title: Vision
status: draft
created: 2026-10-25
tags: [vision]
---

# Vision

A video game you play in French or Mandarin, and only in French or Mandarin, that is fun enough to play for its own sake. Learning the language is the side effect, not the activity.

## The bet

Immersion works when the input is comprehensible: you know roughly 95-98% of what is in front of you and can fill the rest from context. Most learners can't get that from real media for a long time, because real media doesn't know what you know. A game does. A game controls every word on screen, knows exactly which words the player has met and how often, and can keep the unknown fraction inside a band where inference is possible without ever interrupting with English.

So the thing we are really building is a world whose language is tuned to the player, wrapped in a game that is worth playing.

## What the player experiences

- The game is in the target language from the first second. No English UI, no translations, no "tap to see the meaning" as the primary path.
- The world starts tiny, and so does the vocabulary. One domain, maybe a flat and a shop. Everything in it is nameable, repeatable, and visually obvious.
- New domains open progressively, as in a life-sim: home, food, shopping, work, friends, sport, travel. Each domain brings its vocabulary, and the game only opens a domain when the player is ready for it.
- Understanding is rewarded by the game itself. Grasping what the baker said gets you the bread. Misreading a sign gets you lost. The language is the interface to the goals, not a quiz layered on top.
- There is a reason to keep playing that has nothing to do with learning: needs to meet, people to know, things to build or collect, a story to uncover. The player should want tomorrow's session for the game's sake.

## Principles

1. **Target language only.** The hard constraint. If a design needs English to work, it is the wrong design.
2. **Comprehension stays in the band.** Every piece of text the player meets should be mostly known, with a controlled sliver of new words that context makes guessable.
3. **Fun first.** If it isn't a good game with the language stripped out, the learning won't survive contact with a Tuesday evening.
4. **The game knows the player.** Which words they've seen, how often, in which contexts, and whether they acted correctly on them. That model drives what the world says next.
5. **Inference over instruction.** The player learns a word by needing it, seeing it in a visual context, and acting on it. Not by being told.

## Open questions

- French or Mandarin first? Mandarin has the script problem (characters vs pinyin, tones); French has far more free material and a lower floor for an English speaker. The choice shapes everything from text rendering to the first ten minutes.
- What is the game's own objective? "Sims-like" is a texture, not a hook. What does the player want?
- How much text is pre-authored vs generated? Hand-written content is controllable but expensive; generated content scales but has to be constrained to the known-word set.
- Speech or text only? Listening is half of immersion, but speech recognition for learners is a hard problem.
- How does the game know the player understood, without asking in English?

## Related

- [[research-immersion-theory]] (the learning science and the methods)
- [[research-games-landscape]] (what already exists and why most of it failed)
- [[research-llm-graded-generation]] (whether constrained text generation is feasible)
- [[research-game-design-patterns]] (how games teach without words)
- [[design-directions]] (candidate shapes for the game)
