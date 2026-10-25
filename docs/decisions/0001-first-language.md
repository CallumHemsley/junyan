---
id: 1
title: Mandarin first, characters on screen, audio on every line
status: accepted
created: 2026-10-25
tags: [decision, language, mandarin, script]
---

# Mandarin first, characters on screen, audio on every line

## Context

The game needs one language to start with. The research ([[ideas/design-directions]], "French or Mandarin first") leaned French: half the hours, no script problem, mature grading tools. Callum chose Mandarin anyway, for two reasons that outweigh the tooling cost. First, Mandarin is where a tool like this helps most, since it is the language where real media stays incomprehensible longest and where nothing comparable exists. Second, Callum is player one and the founder, and hundreds of hours of play have to be hours they want.

Choosing Mandarin forces a second decision that the comprehensible-input community has not settled: what the player sees when a character speaks. Krashen argues for a pinyin-first stage to build oral Mandarin; a study found pinyin shown alongside words interferes with later character recognition; Refold shows characters with pinyin on everything and leans on pop-up dictionaries ([[ideas/research-immersion-theory]] §5). The options were characters with a pinyin toggle, characters with hover-reveal pinyin, or characters only with audio.

A third decision follows: the unit the word model tracks. Chinese word segmentation is unreliable against learner lists, so existing tools grade by character, but meaning lives in words, and the two published "HSK 3.0" lists disagree on 41.5% of their vocabulary ([[ideas/research-llm-graded-generation]] §2).

## Decision

1. **Mandarin Chinese is the first language.** Simplified characters, mainland standard. (Assumption to confirm with Callum: they are learning simplified.)
2. **Characters are the only visible text.** Every line is also voiced, and replaying a line is a first-class control. Pinyin is never shown as a parallel text; it is available per word on tap, alongside the picture, and a tap is logged as a lookup (a weakness signal) exactly like tapping for the picture. Rationale: the sound and the tones come from audio, which is what pinyin-first is trying to achieve, while the eye is on characters from the first second so they are acquired by exposure with sound attached. Showing pinyin by default would give the eye a crutch it never leaves.
3. **The unit of knowledge is the word, with characters tracked underneath.** The word model keeps spaced-repetition state per word. Each word's characters are also tracked, so the grader checks two things: every character is in the player's character set, and the line segments into known words using a segmenter constrained to the player's own word list (plus the current sliver of new words). Both must pass.
4. **The vocabulary reference is HSK 3.0 as published in the 2021 national standard** (GF0025-2021), used only as a frequency prior for seeding and for ordering new words. Any tool that grades against "HSK 3.0" must be checked against that list, not the 2025 exam syllabus.
5. **The script and presentation layer is separate from dialogue content.** Dialogue is stored as words with audio; how a word renders (characters, optional tap-reveal pinyin, later a traditional-character or French renderer) is a presentation concern. This is what makes French a second language rather than a rewrite.

## Consequences

- Time to comfort roughly doubles compared with French: plan for a game that holds up over 1,000 or more hours of play, which strengthens the case for generated, systemic content over authored content.
- Grading tooling has to be built, not downloaded: a whitelist-constrained segmenter, a character-set check, and a pinned HSK 3.0 list. Ticket 3 (the generation spike) is harder and should start early.
- Mandarin text-to-speech quality is now a core dependency, not a nicety, because audio is carrying the tones. Native-prosody voices should be evaluated when the stack is chosen; the paper prototype can use macOS's built-in voice.
- Every prototype, including paper ones, needs audio. A silent paper prototype would test the wrong thing.
- Tone perception is learned from audio alone under this decision. If playtests show the player cannot hear tone distinctions without a visual aid, revisit point 2 with a tone-mark overlay (marks only, not romanisation) as the first thing to try.
- Small models are weaker at obeying Chinese vocabulary constraints than English ones; expect more rewrite passes and budget for a frontier model in the offline batch if needed.
- Closes ticket 1. Supersedes nothing.
