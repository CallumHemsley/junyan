---
id: 3
title: Spike the generate-grade-rewrite loop against a 300-word whitelist
status: done
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

## Learned

- Go. Whitelist adherence was a non-problem: 180 generated lines, two models, 507- and 300-word lists, zero OOV tokens; the rewrite loop never fired (verified separately on synthetic violations). Write-up: [[ideas/spike-constrained-generation]].
- The real gate is semantic: role confusion (vendor lines in the customer's mouth), forced target words, setup-free corrections, textbook register. Blind LLM-judge naturalness: Opus 4.60, Haiku 3.76 on orders; Haiku small talk under 300 words 2.67. Add a rubric judge; generate inside scene state; use Opus-class for generation.
- jieba flags 23–40% of tokens as OOV on every clean batch: grade with a whitelist-constrained segmenter, never a general one.
- Not done: API-backed run (no credentials on this machine; the `claude` CLI is not logged in from the shell), so cost and latency are estimates from token counts and list prices. The SDK backend is written and untested. `/pstack:poteto-mode` could not be invoked by the agent; it is user-invoked only.
- Model calls went through Claude Code subagents pinned to Haiku 5.5 / Opus 5.5, not bare API calls.
