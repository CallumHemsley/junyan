---
title: Design directions
status: draft
created: 2026-10-25
tags: [design, synthesis]
---

# Design directions

Synthesis of the four research notes into constraints, candidate shapes for the game, and a recommended starting hypothesis. Nothing here is decided; the tickets turn the open questions into work.

## What the research pins down

1. **The comprehension band is about 95%, not "one unknown word".** Reading research wants 98% known words for unassisted comprehension, but with pictures on screen 95% is optimal and even 90% is usable. A visually grounded game sits in the "viewing" regime: roughly one unknown token in twenty, and the context must make that one guessable. ([[research-immersion-theory]] §4)
2. **A word needs 8 to 12 meaningful encounters to stick, spread over time.** Nothing is retained below about eight. The game is therefore a *scheduler of re-encounters*, not a dispenser of first encounters. This is the single biggest design consequence. ([[research-immersion-theory]] §4)
3. **Everyday conversation is lexically small.** About 3,000 words give 92 to 95% of spoken Mandarin; 2,000 French lemmas give about 91% of novels. A home / shop / work / friends sim lives in the 2,000 to 5,000 word band. The Sims domain is the right domain. ([[research-immersion-theory]] §5)
4. **Domains must be narrow and words must be dense within them.** Natural text cannot repeat mid-frequency words often enough; narrow domains make a topic's words high-frequency inside it (the "Shrek effect": donkey, ogre and swamp become common words inside Shrek). Decipherment games succeed with about 30 live words per region. ([[research-immersion-theory]] §4, [[research-game-design-patterns]] §2)
5. **Output is not required.** Every immersion method defers speaking for hundreds of hours. A game whose "output" is choosing and acting, never typing or speaking, is orthodox. Speech can be a later experiment. ([[research-immersion-theory]] §3)
6. **"Must understand to act" is the mechanic that works.** The two best-received dedicated games, Wagotabi and Chants of Sennaar, both gate the world on comprehension. Every "click the object, hear the noun, quiz later" game is pleasant and plateaus at 400 to 1,000 words. ([[research-games-landscape]] §1, §5)
7. **Hand-authored content kills these projects.** Koe took ten years for a Part 1; So to Speak six years for 650 words. Text must be templated or generated. ([[research-games-landscape]] §6)
8. **Generated text can be held to a known-word list, but only with a deterministic checker.** Prompting alone leaves about 0.6% out-of-vocabulary words; plan-then-write plus up to five "replace these words" passes gets to 0.01%. Cost is negligible, under a tenth of a cent per line even with retries. Generate nightly, verify fully, fall back to approved lines. ([[research-llm-graded-generation]] §2, §6)
9. **Known-word tracking is solved UX; the scheduler should be FSRS.** Per-lemma spaced-repetition state fed by in-game exposures, with "known" meaning predicted recall above about 0.9. ([[research-llm-graded-generation]] §4)
10. **Hide the dial and keep it cozy.** Never show a comprehension percentage; hold the band by choosing which NPC approaches and how a line is paraphrased. Streaks and XP break cozy loops. Knowledge itself, as a journal, is the progression currency. ([[research-game-design-patterns]] §4, §5, §7)
11. **Mandarin's script is an unsettled question** even within the comprehensible-input community. If Mandarin is first, the pinyin / characters choice is a decision, not a detail. ([[research-immersion-theory]] §5)
12. **The hours are real.** Comfortable comprehension is 600 to 1,000 hours of input for a related language, double for Mandarin. The game cannot shortcut that, so it has to be a game people play for hundreds of hours. That is a Stardew-or-Animal-Crossing shape, not a ten-hour narrative. ([[research-immersion-theory]] §3)

## The reframing

The thing we are building is a **director for comprehension**. Like Left 4 Dead's AI Director picks which zombies spawn to keep tension in band, this game picks which person approaches, what they want, and how they phrase it, so that the player's known fraction of what is on screen stays near 95% and every word they are learning comes back on schedule. The world's language is tuned to the player, invisibly.

Everything else (the setting, the hook, the art) exists to make that director worth sitting in front of for hundreds of hours.

## Candidate shapes

### A. The newcomer (life-sim)

You move to a small town (a French village, a Chinese neighbourhood) knowing nothing. Needs to meet: food, money, a place to live. People to meet: neighbours with routines and lives. Domains unlock as regions and relationships: the bakery first, then the market, then someone invites you to football, then a job.

- **Hook:** build a life; the town's people and their small stories; decorating, routine, belonging.
- **Why it fits:** the Sims domain is exactly the right vocabulary; Animal Crossing's templated, state-aware villager dialogue is the best known generator of repeated everyday language; regions-as-domains is metroidvania gating.
- **Risks:** life-sims are content monsters (art, animation, systems); "build a life" is a texture rather than a goal unless something specific pulls the player forward; dialogue can drift to small talk that teaches little.

### B. The counter (service-sim)

You run a shop, café or stall. Customers arrive with requests. Understanding the request and handing over the right thing is the whole loop. Serve well, earn, expand the stock, and each new shelf is a new vocabulary domain (bread, then dairy, then hardware, then clothes). Regulars return with lives, gossip and favours.

- **Hook:** the tight, satisfying service loop (Papers Please, Overcooked, Spiritfarer's cooking); regulars you grow fond of; growing the business.
- **Why it fits:** the request is the perfect gradeable unit, short and generatable; "handed over the right item" is a comprehension check with zero English; repetition with variation is the genre's nature; animation-light (a counter, portraits, items).
- **Risks:** a shop can collapse into a quiz with a costume if requests are the only content; vocabulary skews to nouns and numbers unless requests carry stories; needs the relationship layer to be more than a treadmill.

### C. The case (deduction)

A small-town mystery. Everything is present from the start, as in Her Story or Obra Dinn; progress is understanding what people said. Testimonies, notes, signs. You act on your understanding by accusing, confronting, searching.

- **Hook:** the strongest hook of the three; deduction games are intrinsically "comprehension as progression".
- **Why it fits:** dialogue-dense and animation-light; batch validation (Obra Dinn's rule of three) tests understanding without asking.
- **Risks:** finite; a mystery is played once, while the hours argument needs hundreds of hours; vocabulary tends to the case rather than to everyday life; harder to generate safely because the facts must stay consistent.

### D. Keep Talking (asymmetric co-op)

One player reads instructions in the target language, the other acts. The reading is the game. A mode, not the game, but a cheap, strong one for later.

## Recommended starting hypothesis

**B inside A.** The shop counter is the engine; the town is the frame.

The counter gives the director a clean unit to control: one request, one outcome, one signal. It makes comprehension the action with no translation anywhere. It produces exactly the dense, repeating, everyday language the research says is needed, and it is cheap to build. The town around it supplies the reason to come back: regulars whose lives advance, invitations that open new domains (a customer invites you to the match; now there is a football vocabulary and a place to go), and a slow story about the place.

Expansion is Fantasy Life's interlock: each domain's output feeds another. Learn food words at the counter, then a customer asks you to deliver to the school, and the school is a new domain with new people.

Treat this as the hypothesis to prototype, not a decision. The cheapest test is a paper or greybox prototype of one counter with about 40 words, played by the founder in the target language, to see whether inference is fun and where English is craved.

## How the player gets help, without English

- **Pictures, not glosses.** Tapping a word shows the thing (an image, the object highlighted in the scene, a short animation of the verb), never a translation. Tapping counts as a lapse in the word model.
- **The journal.** Chants of Sennaar's mechanic: the player's own guesses, drawn or picked from icons, overlaid on text in a distinct provisional style until confirmed by action. Visible progress, and a place to be approximately right.
- **Demonstration first.** Portal's window: a new word is seen being used by someone else before the player must act on it.
- **Scaffolding after failure, not a lower target.** After repeated misses, the NPC gestures, points, repeats more slowly, shows the item. Crash Bandicoot's masks, not a difficulty menu.
- **Audio always.** Every line voiced (pre-rendered TTS is about ten dollars for a whole game). For Mandarin the audio carries the tones that characters do not.
- **Mandarin script layer:** a decision to make. Options are characters with a pinyin toggle, characters with hover-reveal pinyin, or characters only with audio. See [[research-immersion-theory]] §5.

## How the game knows you understood

Only by what you do. Handed over the right loaf, walked to the right door, picked the response that made the NPC happy, answered the question with the right item. Wrong actions have in-world consequences (a confused look, the wrong change, a missed bus), never a red X. Lookups are logged as weakness. Over many exposures, action outcomes plus lookups give the word model a confidence per word with no test ever shown.

## Architecture sketch (no stack yet)

```
known-word model          per lemma (or character): FSRS state, last seen, contexts
        │
        ▼
director                  picks domain, NPC, request, phrasing to hold ~95% known
        │                 and to bring due words back; never shows a number
        ▼
content                   templates for stock lines (Animal Crossing style)
                          + generated variation, verified by a deterministic
                          grader against the whitelist; nightly batch; approved
                          fallback lines; TTS pre-rendered
        │
        ▼
scene                     render with per-token tap; outcomes and taps flow
                          back into the word model
```

The grader is the load-bearing part. For French: lemmatise, then check against the known set (FLELex gives a free frequency prior). For Mandarin: grade by character, or by word with a segmenter constrained to the player's own list, and pin one HSK 3.0 standard.

## French or Mandarin first

| | French | Mandarin |
|---|---|---|
| Hours to comfort | ~600 to 1,000 | roughly double |
| Script decision | none | required, contested |
| Grading tooling | lemmatiser + FLELex, mature | segmentation unreliable, two HSK 3.0 lists disagree |
| Generation quality | small models fine | small models worse on Chinese constraints |
| Differentiation | moderate | high, nothing exists |
| Founder as player one | can judge quality sooner | tool would help more |

Leaning: **French first to prove the loop**, with the data model built so the unit of knowledge is pluggable (lemma for French, character or word for Mandarin) and the script layer is separate from the dialogue layer. Mandarin becomes the second language, not a rewrite. This is the founder's call and goes in `docs/decisions/`.

## What to do first

See the tickets. In short: decide the language, paper-prototype one counter with hand-written lines, and in parallel spike the generate-grade-rewrite loop to prove generated text can be held to a 300-word whitelist.

## Related

- [[vision]]
- [[research-immersion-theory]]
- [[research-games-landscape]]
- [[research-llm-graded-generation]]
- [[research-game-design-patterns]]
