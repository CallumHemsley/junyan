---
id: 61
title: Switch the open word card when another word is tapped
status: done
priority: medium
type: bug
created: 2026-11-05
---

## Why

Tapping a word correctly opens its card and speaks it aloud, but Callum cannot then tap another word to switch the card. Closing the card before every lookup interrupts reading and listening. Visible word tokens should remain available for direct switching while the card is open.

## Done when

- [x] With word A's card open, a single click or tap on another visible word B immediately updates the same card to B's details and plays B's audio, without an explicit close or a second tap. Repeated A → B → C switching works on desktop and touch screens.
- [x] Switching stops the previous word's playback so pronunciation clips do not overlap. The card always displays the latest selected word, including during rapid taps, and each selection follows the existing lookup/journal behavior without duplicate lookup events.
- [x] Apply the behavior consistently wherever word cards are available, including opening dialogue, restaurant dialogue, Help, receipts, food words and the journal. Keep the source words accessible alongside the card at phone widths.
- [x] Preserve explicit close and Escape dismissal, prevent lookup taps from triggering game actions, and provide coherent keyboard navigation between source words and the card. Dismissing the card returns focus to the latest selected word; Escape closes only the card when a parent panel is open. Update any modal/inert/focus-trap behavior to match the new interaction accessibly.
- [x] Add browser regressions for switching with the card already open, rapid selection/audio replacement, lookup recording and keyboard dismissal/focus. Run relevant rules/content, audio, overlay-focus and journey checks; inspect phone and desktop layouts and confirm a clean console. Record commands and results in Notes.

## Notes

- Reported by Callum on 2026-11-05. Reproduction: tap word A → its card opens and A is spoken → tap word B → cannot switch directly; currently must close A's card first. This behavior is user-reported; no browser reproduction has been run while filing the ticket.
- Expected interaction: tap A → card A + audio A → tap B → card B + audio B, with no close step.
- Starting points: `src/App.tsx` (`lookup`, `wordCard`, overlay focus and inert handling), `src/HospitalOpening.tsx`, `e2e/overlay-focus.spec.ts`, `e2e/learning-help.spec.ts` and the audio browser suite.
- [[tickets/0025-word-card-focus]] introduced the existing nested-overlay focus rules. Adapt those rules deliberately for direct word switching and keep parent-panel dismissal and focus restoration correct.

- Owner: Codex ticket 0061 worker; branch `codex/0061-switch-word-card-directly`; checkout `/workspace/junyan-0061`; strict dev/preview ports `5404`/`5405`; evidence `docs/evidence/0061-switch-word-card-directly.md`.

- Completed on current main `85a0120`: direct pointer/touch/keyboard switching across opening, restaurant, Help, receipt, food and journal; nonmodal card/source focus loop, latest-trigger restoration, top-only Escape and blocked game actions. Existing playback cancellation reused without edits.
- Verification: integrated code checkpoint `d2c698f5caf34ab3c72535d0f97e95d41b80b8c0`: 170 unit tests, automatic production build and 34 focused/boundary/journey browser cases passed with no skips. Earlier 26 Help/overlay cases and 7 reduced-motion/offline cases passed; real complete opening/four-customer days played through UI on both layouts. Evidence, screenshots, exact commands, limitations and scoped quality scores: [review bundle](../evidence/0061-switch-word-card-directly.md).
- PR: https://github.com/CallumHemsley/junyan/pull/14 (draft; root independent exact-head/product acceptance required). READY for that review; not merged. Implementation lease released for 0063. No content/schema/dependency or playback changes. Shared component need is only the `data-word-lookup` marker in `WordToken.tsx`.
- Learned: source words cannot stay interactive beneath a modal/inert ancestor; expose the card as nonmodal, scope available controls explicitly and restore focus from the latest trigger ref rather than the first card's captured trigger.
