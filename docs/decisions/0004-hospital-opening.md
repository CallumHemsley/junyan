---
id: 4
title: Hospital opening before the waiter job, with a bounded English premise
status: accepted
created: 2026-11-03
tags: [decision, narrative, onboarding, language]
---

# Hospital opening before the waiter job, with a bounded English premise

Status: **accepted** by Callum in chat on 2026-11-03, after comparing the prototype in `spikes/hospital-opening/`. Chosen: variant A, fog on, every line voiced by the project's voice models (never browser text-to-speech), English voiced, breakfast-food requests, no skip.

## Context

Callum wants the game to open in a Chinese hospital. The player wakes and is told they used to speak Mandarin and now cannot. They get the language back by playing, starting as a waiter at 早安小馆 in the loop from [[decisions/0003-pixel-waiter]]. Callum wants the opening to start in English to explain the premise, and to be Chinese from then on.

That breaks a rule the project has kept from the start. [[decisions/0001-first-language]] point 2 makes characters the only visible text. `AGENTS.md` and `docs/design/design-system.md` repeat the rule. Ticket 0027 removed English glosses from word cards, and `e2e/learning-help.spec.ts` asserts that Help and word cards contain no Latin letters.

The premise earns an exception in three ways:

- It gives the all-Chinese world a reason inside the story. Nobody is withholding a translation. The player's own language is coming back.
- It gives progression an arc. Each day returns more of the language, and the waiter loop already raises difficulty across days.
- It turns the journal (本子) into recovered memories rather than a word list.

It also carries four risks:

- A hospital is cold, and any opening delays the first fun action. The game's warmth is at the restaurant.
- Amnesia is a worn trope, and head injury is real. The script must stay light and make no medical claims. The spike's first draft had one ("That happens with this kind of injury"), and the revised script cut it.
- The backstory has to reach a player who cannot yet read Chinese. That is the only reason English is needed.
- "Mandarin was your first language" casts every player as a heritage speaker. The game is built for learners ([[ideas/vision]]), not only for heritage speakers. Heritage speakers may find a game about losing the language either close to home or careless.

## Decision

1. **Shape.** On first run, before day 1, the player wakes on a hospital ward. The opening lasts about one minute. It starts in English with the premise, then hands over to Chinese. The old man in the next bed (老爷爷) asks for two things. The aunt (小姨) arrives, asks whether the player remembers her, and offers work at her shop (店里). The player answers by tapping a Chinese reply. An end card reads 第一天 · 早安小馆, and day 1 of the waiter loop starts. The target is a first request within about 30 seconds, which the prototype should measure.
2. **The opening is the tutorial.** The bedside table works as the kitchen and the next bed as a table. The player picks up and hands over with the waiter loop's own `pickup` and `deliver` actions, so the opening adds no new control. The requests use foods from `content.foods` (the spike asks for 豆浆 and 鸡蛋, with 馒头 as the wrong choice), so recovered words pay off on day 1 and the food art is reused.
3. **Words recover by use.** A word is recovered when the player acts on it correctly, by handing over the named item or choosing it as a reply. A tap for pinyin stays a lookup, as in 0001. Recovered words go into the journal. Recovery works the same way in the restaurant.
4. **The fog is on.** Unrecovered tokens look soft. Recovered tokens sharpen and get the new-word dot the first time.
5. **The English exception has these bounds:**
   - English appears only in the hospital opening.
   - English carries the premise and nothing else. It is never interface. 继续, every `aria-label`, the word card, the journal, the end card and every control are Chinese from the first second.
   - English never appears inside a Chinese line. Under variant B, a recovered word appears as a hanzi token inside an English thought. That is the only mixing.
   - English stops at the handover, the doctor's last English line.
   - English never returns. It is not in later days, not a setting, and not in later story beats. Any further English needs its own decision.
   - English lines are DOM text and are voiced, by an English voice from the same offline pipeline as the Chinese lines (`scripts/content-audio.py`, `src/content/voices.json`). Browser speech synthesis is never used.
6. **The handover is variant A, the doctor's English.** The three variants compared, with counts from the spike's `content.js` measured by script on 2026-11-03:
   - **A. The doctor's English.** 4 English lines, 50 words, all before the first Chinese line. The doctor announces the switch, then speaks Chinese to the nurse. The handover is an event in the story and a single step a test can check. The cost is a fluent English speaker inside the world, which invites the question of why nobody else speaks English. A voiced doctor needs an English voice.
   - **B. The inner voice.** 9 English thoughts, 88 words, running to the step before the end card. Nobody in the world speaks English. Recovery is visible on screen, as English words in the thoughts turn into hanzi. It is also the widest exception. Thoughts risk giving away the gist of the next Chinese line, which cuts against vision principle 5, inference over instruction. The revised script removed the worst case, and every new thought needs the same check. Mixed English and hanzi lines need a new renderer.
   - **C. The memory card.** One card, 4 lines, 30 words, before the scene starts. It is the smallest exception, with the cleanest boundary, and the cheapest to build and test. The cost is that it explains in text on a dark card instead of in the scene, so the game's first moment is reading. Its panel should use the evening tokens, not a new black.

## Consequences

Accepting this amends [[decisions/0001-first-language]] point 2 for the opening only, and 0001 should gain a line that links here. The waiter loop from [[decisions/0003-pixel-waiter]] keeps its rules, and its `deliver` action also records recovery. This decision supersedes nothing.

**Rule text to amend.** This draft does not edit these files.

- In `AGENTS.md`, "What the game is" says "No English, no pinyin on screen (pinyin only on tap)". It needs an exception for the opening's premise lines.
- The same section says "The player runs a breakfast stall (早餐店)". It needs to say that a one-minute hospital opening comes first.
- In `AGENTS.md`, "Verification" asks for "the Playwright journey green (open, serve three customers, give change, journal a word)". It needs "play the opening" after "open".
- In `docs/design/design-system.md`, "Content fundamentals" says "**Chinese only.** No English, no pinyin. Every string is simplified Chinese and every spoken line is voiced." It needs the opening as the one exception. The English is voiced, so "every spoken line is voiced" still holds.
- In `docs/design/design-system.md`, rule 6 says "**No English, pinyin or emoji in the game UI.**" It needs the same exception. The UI chrome stays Chinese.
- The fog is adopted, so the "Usage rules" in `docs/design/design-system.md` say "A new word adds the `word-marker` dot and nothing else: no colour, no bold, no gloss." They need a fog style for unrecovered words.
- Ticket conventions. `docs/tickets/README.md` has no language or journey rule and needs no change. Open ticket 0004 asks for a list of what the game is not, including "no English". That would become "no English after the opening". Done tickets 0002 and 0027 stay as records.
- Outside those files, `README.md` says "All game text is simplified Chinese", and the draft `docs/ideas/vision.md` says the game is in the target language "from the first second".

**Saves.** `src/save.ts` stores one `GameState` under key `v1` in the IndexedDB database `junyan-waiter`, and its `stateSchema` requires `day` of at least 1. The opening becomes a phase before day 1. The game holds it in memory and does not save it. A reload mid-opening replays it from the start, which costs at most a minute. The first save happens when the opening ends, as day 1 with the recovered words in the journal. An existing `v1` save means the player has passed the opening, so current players go straight to their day. Any path that discards an invalid save and starts a new game also replays the opening. Today journal entries come only from the `lookup` action, so each entry needs a field for recovery, and `stateSchema` must accept it.

**Content schema.** `contentSchema` in `src/content/index.ts` is a `z.strictObject`, so the opening needs a new `opening` field. The field holds a step script, a union on `type` with steps for the English premise, a Chinese line, a request, a reply and the end. Chinese steps reuse `Line`, pre-segmented with audio. English steps carry a plain `en` string that the token renderer never receives. Each step declares the words it recovers. The opening adds a second scene and four cast members (the doctor, the nurse, 老爷爷 and 小姨). Each needs art, and each speaker needs a voice in `src/content/voices.json`. New words need dictionary entries and audio clips.

**Tests.**

- The opening's step logic is a pure function, tested in Vitest like `src/game.ts`. Tests cover step order, recovery, and the hand-off to day 1 with recovered words in the journal.
- A content test asserts that English appears only in the opening's premise steps. The bound then lives in code, not only in this note.
- The Playwright journey plays the opening first, because every new player does. It asserts no Latin letters on the game surface after the handover, as `e2e/learning-help.spec.ts` already does for Help.
- The other 12 specs in `e2e/` start past the opening through a hook, for example `?test=1&seed=42&opening=skip`. The hook is gated to dev and test builds, like `window.__TEST__`.

**Accessibility.** English lines are real DOM text, like every Chinese line. They carry `lang="en"` inside the page's `lang="zh-CN"`, so screen readers switch voice. Touch targets stay at 44px. A fogged token stays legible and tappable. Under reduced motion, its sharpening is a fade of 120ms or less.

## Answered and open questions

Answered on 2026-11-03: A (1), fog on (2), English voiced (3), "used to speak" (4, as in the spike), and no skip on first run (5).

Still open:

1. Is the opening replayable later, for example from the journal?
2. Do 小姨 and 老爷爷 appear again in the restaurant?
3. Is recovery only a frame, or a story with later beats in Chinese, such as memories returning on later days?
