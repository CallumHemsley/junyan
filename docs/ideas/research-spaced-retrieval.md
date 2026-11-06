---
title: Spaced retrieval through changing situations
created: 2026-11-06
status: draft
tags: [research, learning, retrieval, scheduling, game-design]
---

# Spaced retrieval through changing situations

**Recommendation: schedule the language again while letting the story move forward.** A word can return in a different customer's order, a changed quantity, or a later errand. Replaying an identical level is not required by the evidence. The important design question is whether the player must understand the recurring language to act, rather than recognise the old scene.

This is a research proposal, not an accepted architecture or curriculum decision. Recommendations below are design inferences; the cited experiments did not test Junyan or establish a Mandarin-game retention algorithm.

## What the primary studies support

| Finding | Evidence and important boundary | Design implication |
|---|---|---|
| Correct once does not mean durably learned. | Karpicke and Roediger (2008) manipulated continued study and retrieval after successful foreign-vocabulary recall. Continued retrieval improved delayed recall; continued study alone did not in this experiment. This was explicit vocabulary learning, not incidental game interaction. [Original paper](https://doi.org/10.1126/science.1152408). | Bring apparently understood words back. A completed scene must not permanently retire its vocabulary. |
| Spacing depends on the retention horizon. | Cepeda et al. (2008) tested 1,354 people across intervals extending to a year. The best review gap increased with the intended retention interval, but its proportional size changed. The material was factual recall. [Author-hosted paper](https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf). | Use elapsed real time alongside within-session separation. Do not call a universal “1, 3, 7 day” schedule scientifically optimal. |
| Varied contexts can help with equal encounter counts. | Frances et al. (2020) held pseudoword encounters constant while distributing them across different numbers of texts. Greater diversity improved several vocabulary measures. Their foreign-language participants were at least B2 English speakers, not absolute beginners. [Original study](https://www.nature.com/articles/s41598-020-70922-1). | Reuse meanings in varied, comprehensible situations; do not assume beginners can tolerate arbitrary new surrounding language. |
| Context diversity has proficiency boundaries. | Oikawa and Uchihara (2026), with 124 Japanese learners of English, found a delayed meaning-recognition advantage for high-diversity texts. Higher-vocabulary learners benefited more; lower-proficiency learners could be disadvantaged. This does not establish a universal benefit across outcomes. [Original study](https://doi.org/10.1017/S0272263126101818). | Start with a stable setting and change one meaningful feature at a time. Larger moves between situations should follow demonstrated understanding. |
| Easy inference is not equivalent to retrieval. | Van den Broek et al. (2018) compared informative contexts with contexts requiring remembered meanings. Successful retrieval, and retrieval with feedback, produced better later vocabulary outcomes than contextual inference. [Original study](https://onlinelibrary.wiley.com/doi/10.1111/lang.12285). | Illustrations should introduce and support language, but some later choices must depend on the words themselves. |

The effects are not interchangeable. Pagán and Nation (2019) manipulated diversity, spacing, and retrieval within reading: varied contexts helped immediate posttest performance despite slower acquisition, distributed practice did not improve that posttest, and additional exposure had the largest overall learning benefit. Retrieval helped under particular conditions. This is useful counterevidence to “more difficulty always produces more learning.” [Original study](https://onlinelibrary.wiley.com/doi/full/10.1111/cogs.12705).

## Interleave decisions, not random difficulty

Interleaving means mixing examples or categories; spacing means separating encounters in time. They can coincide, but they are different controls. Kornell and Bjork (2008) found that interleaving artists' paintings improved classification of new paintings, even though participants thought blocked practice worked better. Birnbaum et al. (2013; published online 2012) found that juxtaposing categories supported discrimination; spacing that interrupted those comparisons could hurt. Both are category-learning experiments, not proof that randomising every Mandarin word helps. [Kornell and Bjork](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Kornell_Bjork_2008_PsychScience.pdf), [Birnbaum et al.](https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/07/Birnbaum_Kornell_EBjork_RBjork_inpress.pdf).

**Design inference:** after introducing a distinction, mix orders that require choosing between its alternatives. For example, vary quantities across visits instead of letting a customer always buy two items. Keep the surrounding action familiar. Do not introduce several confusable unknown words simultaneously and label the resulting confusion desirable difficulty.

## A hidden scheduler that preserves forward motion

These are proposed policies to prototype, not research-validated parameter values:

1. **Choose a plausible next encounter first.** Story state, available items, and the player's chosen activity constrain what can happen. Among eligible encounters, prefer those that revisit useful, weak, or long-unseen words. If none fit, allow another scene; do not force an implausible review encounter.
2. **Track evidence separately.** Record exposure, lookup/replay, assisted action, independent action, and later independent use in a changed context. Also record which target words were actually necessary to distinguish the action. Serving the correct food says little about every word in its sentence.
3. **Separate immediate repair from later retrieval.** Following a mistake, let the customer clarify and the player repair the order. Treat the immediate corrected answer as assisted. Revisit the target after intervening activity, and again in a later session when available.
4. **Vary one useful dimension.** Keep the target meaning and familiar surrounding words; change speaker, quantity, intention, or task. Avoid repeated encounter IDs when alternatives exist. A different background behind the same sentence is weaker variation than a new reason to use the word.
5. **Treat due words as opportunities.** No visible overdue pile, punishment for absence, or demand to repeat completed days. Returning after a long gap should invite a supportive encounter with familiar language. Real elapsed time changes what the director prefers; it need not become a player obligation.

An illustrative sequence for 豆浆, subject to native-language/content review:

```text
First encounter: a customer orders soy milk, with generous visual support.
Later visit: another customer orders it among plausible food choices.
Next session: an order changes quantity; understanding the noun still matters.
Later story: a regular needs it for someone else, in a new but simple line.
```

The target repeats while the transaction's purpose changes. Keep canonical word/sense identity across variants; a synonym is a different target. Hold the intended sense stable before attempting polysemy. These examples do not prescribe a new location, inventory system, or live generated dialogue for the first slice.

“Independent action” remains an inference. A player might use position, prior customer habits, a highlighted object, or elimination. Audit scenes for these shortcuts. A lookup is useful support and an uncertain weakness signal, not proof of failure. A slow response may reflect distraction or motor demands. Do not turn any one of these signals into a confident mastery judgment.

### Conservative implementation sketch

Keep the first director a pure function over explicit saved state, an injected timestamp, the current game-day index, and seeded RNG. Suggested fields are `lastSeenAt`, `lastIndependentAt`, `lastSeenGameDay`, `independentSuccesses`, `assistedSuccesses`, `recentEncounterIds`, and `recentContextIds`. Store an encounter-level `assistanceUsed` flag as soon as a relevant lookup occurs; a subsequent correct choice is assisted for that target. Preserve raw outcome events where practical so a later model can reinterpret them.

Use both elapsed real time and game-day separation when ranking eligible encounters, with a cooldown against immediate repeats. A game day is pacing metadata, not a substitute for real elapsed time. Inject timestamps rather than reading the clock inside rules. Start with transparent priorities and configurable gaps, without pretending to calculate a calibrated recall probability.

Content IDs may be namespaced by scene while representing the same vocabulary. Link them to a canonical semantic key, such as normalized simplified `hanzi` plus an explicit sense identifier, and aggregate evidence there. Bare hanzi matching is a fallback requiring an audit: homographs, polysemy, and different token boundaries can otherwise merge distinct targets. Store scene/token IDs on events for traceability. This is an implementation proposal, not an empirical finding or a requirement to rewrite existing content schemas.

## Boredom is more than repeated wording

Westgate and Wilson (2018) combined a model with empirical studies supporting separable roles for attention and meaning in boredom. Both under- and overstimulation can be involved. Their tasks do not establish which game mechanics are engaging, but they undermine the assumption that simply adding difficulty or novelty solves boredom. [Author-hosted original paper](https://www.erinwestgate.com/uploads/7/6/4/1/7641726/westgatewilson.psychreview.2018.pdf).

**Design inference:** make the next encounter matter to a returning character or a small player goal. Vary consequences and choices as well as dialogue. Offer comfortable, fluent stretches between challenging moments. A fresh sentence attached to an unchanged action can still feel repetitive; a familiar phrase used to complete a meaningful favour can feel satisfying. These engagement claims need playtesting.

## What to measure before expanding

Compare equal numbers of target encounters across a repeated-situation version and a varied-situation version. Keep target language, support, and total play opportunity as similar as possible. Use a later unfamiliar encounter to test transfer rather than counting same-session order success as retention.

Record three outcomes separately: delayed language-dependent action, assistance needed, and willingness to keep playing. Ask directly whether the activity felt repetitive; completion time alone cannot reveal boredom. Stratify observations by starting knowledge. An audio-plus-text action cannot by itself prove listening ability, character recognition, speaking, or tone production.

**Unverified for Junyan:** the ideal number of encounters, interval lengths, amount of context variation, tolerance for unfamiliar words, and weighting of passive signals. The existing “one word in twenty” idea is a tunable design hypothesis, not a threshold established by these papers. A small prototype can detect confusion and repetition; demonstrating durable learning requires delayed observation across sessions.
