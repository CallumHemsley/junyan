---
id: 3
title: Spike the generate-grade-rewrite loop against a 300-word whitelist
status: todo
priority: high
type: explore
created: 2026-10-25
---

## Why

Hand-authored dialogue is what killed every comparable project. The design depends on generated lines that stay inside the player's known words plus a controlled sliver of new ones. Prior work (SRS-Stories) says this works with a deterministic checker and a rewrite loop, but not with prompting alone, and that Chinese is harder. We need to see it work in our language with a small, cheap model before building anything on it.

## Done when

- A throwaway script in a scratch folder (not the app) that takes: a known-word set of about 300 words, a list of 5 to 10 "new" target words, and a scene brief (a customer at a bakery wants something), and produces 50 customer requests.
- A deterministic grader for the chosen language: French lemmatises and checks against the set; Mandarin grades by character (or constrained-segmented words) against one pinned HSK 3.0 list.
- Reported: out-of-vocabulary rate before and after rewrite passes, retries needed, cost per accepted line, latency, and a subjective note on blandness and naturalness (have a native or advanced speaker read 20 lines if possible).
- A short write-up in `docs/ideas/spike-constrained-generation.md` with a go / no-go on generated content and the recommended loop.

## Notes

- Architecture and prior results in [[ideas/research-llm-graded-generation]] §2 and §6: plan-then-write, up to five "replace these unknown words" passes, fall back to approved lines; constrained decoding was worse.
- Expect over-use of light words ("thing", "do") under tight constraints; measure it.
- Use `/pstack:poteto-mode` for the spike; it is the riskiest technical assumption in the project.
- Depends on ticket 1 for the language, but the French path can start immediately since the tooling is known.
