---
id: 1
title: Choose the first language (French or Mandarin)
status: done
priority: high
type: explore
created: 2026-10-25
---

## Why

Every later choice depends on it: text rendering, the unit of knowledge (lemma vs character), the grading tooling, the generation model, and the first ten minutes. The research leans French-first to prove the loop, with the data model kept language-agnostic so Mandarin is a second language rather than a rewrite. The founder is player one, so it is also a question of which language they want to spend hundreds of hours in.

## Done when

- A decision in `docs/decisions/0001-first-language.md` with Context, Decision, Consequences.
- The decision names the unit of knowledge the word model tracks for that language, and states that the script/presentation layer is kept separate from dialogue so the other language can follow.
- If Mandarin: the script presentation (characters with pinyin toggle, hover-reveal, or characters-only with audio) is either decided in the same file or opened as its own ticket.

## Notes

- Trade-offs table in [[ideas/design-directions]] ("French or Mandarin first").
- Coverage and hours figures in [[ideas/research-immersion-theory]] §3 and §5.
- Tooling differences in [[ideas/research-llm-graded-generation]] §2 (French: FLELex and lemmatisation; Mandarin: character grading, two conflicting HSK 3.0 lists).

## Learned

- Decided 2026-10-25: Mandarin first. See [[decisions/0001-first-language]].
- Script presentation decided in the same file: simplified characters as the only visible text, audio on every line, pinyin only on tap and logged as a lookup.
- Unit of knowledge: the word, with characters tracked underneath; both must pass the grader. HSK 3.0 pinned to the 2021 national standard.
- Assumption to confirm with Callum: they are learning simplified characters.
- Consequence for the backlog: every prototype, including the paper one, needs audio.
