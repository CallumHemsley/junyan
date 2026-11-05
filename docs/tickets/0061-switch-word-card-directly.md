---
id: 61
title: Switch the open word card when another word is tapped
status: todo
priority: medium
type: bug
created: 2026-11-05
---

## Why

Tapping a word correctly opens its card and speaks it aloud, but Callum cannot then tap another word to switch the card. Closing the card before every lookup interrupts reading and listening. Visible word tokens should remain available for direct switching while the card is open.

## Done when

- [ ] With word A's card open, a single click or tap on another visible word B immediately updates the same card to B's details and plays B's audio, without an explicit close or a second tap. Repeated A → B → C switching works on desktop and touch screens.
- [ ] Switching stops the previous word's playback so pronunciation clips do not overlap. The card always displays the latest selected word, including during rapid taps, and each selection follows the existing lookup/journal behavior without duplicate lookup events.
- [ ] Apply the behavior consistently wherever word cards are available, including opening dialogue, restaurant dialogue, Help, receipts, food words and the journal. Keep the source words accessible alongside the card at phone widths.
- [ ] Preserve explicit close and Escape dismissal, prevent lookup taps from triggering game actions, and provide coherent keyboard navigation between source words and the card. Dismissing the card returns focus to the latest selected word; Escape closes only the card when a parent panel is open. Update any modal/inert/focus-trap behavior to match the new interaction accessibly.
- [ ] Add browser regressions for switching with the card already open, rapid selection/audio replacement, lookup recording and keyboard dismissal/focus. Run relevant rules/content, audio, overlay-focus and journey checks; inspect phone and desktop layouts and confirm a clean console. Record commands and results in Notes.

## Notes

- Reported by Callum on 2026-11-05. Reproduction: tap word A → its card opens and A is spoken → tap word B → cannot switch directly; currently must close A's card first. This behavior is user-reported; no browser reproduction has been run while filing the ticket.
- Expected interaction: tap A → card A + audio A → tap B → card B + audio B, with no close step.
- Starting points: `src/App.tsx` (`lookup`, `wordCard`, overlay focus and inert handling), `src/HospitalOpening.tsx`, `e2e/overlay-focus.spec.ts`, `e2e/learning-help.spec.ts` and the audio browser suite.
- [[tickets/0025-word-card-focus]] introduced the existing nested-overlay focus rules. Adapt those rules deliberately for direct word switching and keep parent-panel dismissal and focus restoration correct.
