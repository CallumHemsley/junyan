---
title: Spike findings — vocabulary-constrained generation for Mandarin
status: draft
created: 2026-10-25
tags: [spike, mandarin, llm, ticket-3, findings]
---

# Spike findings: can generated Mandarin stay inside the player's words?

Result of [[tickets/0003-spike-constrained-generation]]. Code and raw outputs are in `spikes/0003-constrained-generation/` (see its README). The question was whether a model can write customer lines for the breakfast stall that use only a whitelist of known words plus a sliver of new ones, checked by a deterministic grader, with a rewrite loop for violations.

## Verdict: go, with a different hard problem than expected

**Whitelist adherence is not the hard part.** Across four generation runs, 180 lines, two models and two whitelist sizes, the grader found **zero** out-of-vocabulary tokens and zero out-of-vocabulary characters. The rewrite loop never had anything to rewrite. (It works; a synthetic test with three violating lines went from 2/5 clean to 5/5 clean in one pass.)

**Naturalness and plausibility under constraint is the hard part.** A blind review found Haiku's lines averaged 3.8/5 for naturalness against Opus's 4.6/5, with failure modes the whitelist grader cannot see: the vendor's lines put in the customer's mouth, corrections with nothing to correct, "the usual" treated as a menu item, an iced dumpling, a ten-yuan youtiao. These are exactly the "forced to fit a word" errors the research predicted, and they are the real quality gate.

So the pipeline the game needs is: generate with an Opus-class model → deterministic whitelist grader (cheap, exact, keep it) → **a second, LLM-judge pass for role, plausibility and register** → scene-state in the prompt so lines are never context-free. Cost stays negligible either way.

## What was run

Whitelists, from HSK 3.0 as the 2021 national standard via the `hsk30` package:

- **507**: all of band 1. A realistic "known set" for a player a few weeks in.
- **300**: a seeded 300-word subset of band 1 with a forced grammar core, so it has holes (no 牛奶, 喜欢, 想, 多). The stress test.
- **New words** (the sliver the generator must feature, all outside band 1): 馒头 油条 豆浆 粥 饺子 碗 根 冰 老板 老样子.

| run | model | list | lines | scene | clean at pass 0 | token OOV | lines using a new word | distinct |
|---|---|---|---|---|---|---|---|---|
| 1 | Haiku 5.5 | 507 | 50 | orders | 50/50 | 0.00% | 50/50 | 100% |
| 2 | Opus 5.5 | 507 | 50 | orders | 50/50 | 0.00% | 50/50 | 100% |
| 3 | Haiku 5.5 | 300 | 50 | orders | 50/50 | 0.00% | 50/50 | 100% |
| 4 | Haiku 5.5 | 300 | 30 | small talk, 12–30 chars | 30/30 | 0.00% | 30/30 | 100% |

For comparison, the 46 hand-written lines of the paper prototype also grade 46/46 clean against list 507, which is a useful check that the prototype is in band.

**How the model was called.** There are no Anthropic API credentials on this machine and the `claude` CLI is not logged in from the shell, so each run used the spike's file backend: the exact prompt was handed to a Claude Code subagent pinned to the model, which replied with only the JSON. That is the model behind a thin agent wrapper, not a bare API call. The SDK backend in `spike.py` is written and untested; re-run with a key before quoting these numbers as API behaviour. The direction of the result is unlikely to change: SRS-Stories reported 0.64% OOV with a 70B open model at B1 on *stories*; short, scene-scoped lines with a full function-word inventory are an easier case, and Claude-class models are stronger.

## The grader

Deterministic, no model, about 60 lines of Python:

1. Strip punctuation and digits.
2. Every character must be in the character set of the known words plus new words.
3. Segment by forward maximum match over the whitelist alone (no outside dictionary). Anything that cannot be segmented is out of vocabulary.

It also reports what jieba, an off-the-shelf segmenter, would call OOV against the same list: **23–40%** of tokens on every batch, all false positives (jieba merges 两个, 一杯, 这个, 早上好 into units the list does not contain). This is the segmentation problem from the research in one number, and the reason to grade with a whitelist-constrained segmenter, not a general one.

Known limitation: an unknown run is grouped into one token, and a known single-character word inside an unknown compound gets peeled off (煎饼果子 → "煎饼果" + 子). Fine for the rewrite prompt; fix before using counts as statistics.

## The naturalness review

A separate Opus subagent, prompted as a native mainland speaker, rated every line blind (batches labelled A–D, no model names). It is an LLM judge, not a human; treat as indicative. Full tables in `spikes/0003-constrained-generation/runs/review-*.md`.

| batch | model, list, scene | grammar | naturalness |
|---|---|---|---|
| A | Haiku, 507, orders | 4.88 | 3.76 |
| B | Opus, 507, orders | 4.98 | 4.60 |
| C | Haiku, 300, orders | 4.86 | 3.76 |
| D | Haiku, 300, small talk | 4.70 | 2.67 |

Measure words were correct in every batch but one slip (大碗粥，一个). Grammar is fine everywhere. The gap is register and plausibility:

- **Role confusion.** Haiku repeatedly wrote the vendor's line as the customer's: 没有饺子了, 油条一根两块, 几根油条, 您要冰吗. About five lines per batch.
- **Forced words.** Under the tighter list, new words were jammed where they do not fit: 来一个饺子，不要冰 (an iced single dumpling), 有老样子吗 ("do you have the usual" as a product), 那个老样子, 十块一根 (a price invented so 对不对 had something to check).
- **Setup-free lines.** Corrections with nothing to correct (不，四个馒头 as an opener), answers without a question (我喝豆浆), 好吗 permission calques.
- **Textbook register.** 请给我, 早上好老板, 我喜欢热豆浆.

Opus made almost none of these and produced the best lines in the set: 两根油条，不，三根; 没有饺子了？那来一碗粥; 还是老样子吧.

**Small talk collapsed.** Batch D, the regulars' chat under the 300-word list, scored 2.67. Only 5 of 30 lines sounded like a regular talking to the owner. The rest were self-introductions the owner would already know (我教中文, 我是小学生), narration nobody needs (我昨天在小学吃了一个馒头), plain orders, lines addressed to a child or a grandmother instead of the owner, and two unrelated clauses joined by a comma. The reviewer's structural point: **not one sentence-final particle** (啊 呢 呀 嘛) in 30 lines, which alone makes everything stiff, even though 呢 and 吧 were on the list. School words were recycled as filler in six lines, which is list vocabulary being used up rather than a topic being spoken about. Small talk needs words band 1 does not have (生意, 不错, 挺, 又, 刚, 下班) and the particles. So: orders are generatable now; small talk is not, at this vocabulary size, and probably wants templates in the Animal Crossing manner until the known set is larger.

The reviewer also listed words a beginner could not infer at a stall even though they are "known" by frequency: 老样子 above all, plus 一会儿, 还是…吧, 就行, 在这儿吃 (needs 带走 as its contrast), 不用找了. This is a design note, not a generation flaw: some words need a routine or a contrast in the world to be learnable, and the director should know which.

## Cost and latency

Not measured through the API. From the prompt and reply sizes (about 1,000 input tokens for the whitelist and brief, 250 output tokens for 50 lines) and current list prices:

| model | per 50 lines | per line | a day of 200 lines |
|---|---|---|---|
| Haiku 5.5 | ~$0.0002 | ~$0.000005 | ~$0.001 |
| Opus 5.5 | ~$0.01 | ~$0.0002 | ~$0.04 |

Adding an Opus judge pass roughly doubles it. Either way this is noise. Generation can run as a nightly batch for the next day's content, fully graded before the player sees it, so latency does not matter; the research's 1–5 s per call is fine for that.

## What this changes in the design

1. **Keep the deterministic grader as the hard gate.** It is exact, free, and the one component no model can be trusted to replace. Grade words with a whitelist-constrained segmenter and characters separately, as decision 0001 says.
2. **Add a judge, not a stricter whitelist.** The quality failures are semantic. A rubric judge (is this the customer's line, is the order plausible, is there a setup for this correction, is the register right) can run on the cheap model over the Opus-generated lines, and reject into regeneration.
3. **Generate inside scene state, not freestanding.** Most "needs context" lines (好，一碗粥; 冰的，两杯; 馒头和油条都要) are fine *as replies*. Give the generator the dialogue state (what the vendor just offered, what the customer already asked) and the lines will land.
4. **Use Opus-class for generation.** The cost difference is cents a day and the naturalness gap is large. Haiku is for the judge and for anything live.
5. **Some "known" words need a teaching situation.** 老样子 is the clearest: the regular's routine teaches it, a sentence never will. The director should carry a per-word note on *how* it is learnable (visual object, routine, contrast pair, gesture), not just whether it is known.
6. **The rewrite loop stays, as a safety net**, but expect it to idle. Budget one pass, not five.
7. **Gate registers by vocabulary size.** Orders and requests work at 300 words. Small talk does not; template it (personality pools keyed to game state, as Animal Crossing does) until the known set carries particles and everyday collocations, and teach the particles early since they carry most of the "sounds like a person" effect.

## Open questions for the next spike

- Does adherence hold at 1,000–3,000 known words with longer, two-speaker exchanges, where the model has more room to drift? (The research says level drifts over multi-turn dialogue.)
- Does a rubric judge on Haiku catch the role and plausibility errors a human would? Needs a small labelled set from the review above.
- Re-run through the API to confirm the agent-wrapper numbers and get real latency.
- Pinyin and tone: nothing here touches audio. The small-talk lines will need voicing; check that TTS prosody survives constrained, slightly stilted text.

## Related

- [[design-directions]], [[research-llm-graded-generation]] §2 and §6
- [[decisions/0001-first-language]]
- Code: `spikes/0003-constrained-generation/`
