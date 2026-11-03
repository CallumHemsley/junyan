---
id: 56
title: Recover words in the restaurant and fog them everywhere
status: todo
priority: high
type: feature
created: 2026-11-03
---

## Why

[[decisions/0004-hospital-opening]] says recovery works the same way in the restaurant as in the opening, and that the fog is on. After 0055 the fog ends at the end card, and the restaurant still marks words with the old "not in the journal" dot. This ticket carries recovery and the three token states into the waiter loop and gives the fog a design-system style. It is PR 0056 in the plan `docs/plans/hospital-opening.md` (section PR 0056).

## Done when

- [ ] A correct `deliver` in `src/game.ts:226-253` recovers every word of that order's line. A lookup alone recovers nothing.
- [ ] `tokens()` in `src/App.tsx:370-382` renders three states: fogged (not recovered), dot (recovered by the latest correct deliver, held in presentation state and never saved), and plain (recovered earlier). The old rule at `:375` (dot means not in the journal) is removed.
- [ ] The journal shows both recovered and looked-up words.
- [ ] A save from before the opening (no recovery flags) loads with every journal word recovered, through the 0048 legacy rule, so a returning player's known words are not fogged.
- [ ] The fog style is defined in `docs/design/design-system.md` and uses tokens from `docs/design/tokens.css`. A fogged token stays legible, tappable and 44 px. The vermilion accent stays on the new-word dot and the 多谢 chop only.
- [ ] Under reduced motion, sharpening is a fade of 120 ms or less (`src/style.css:809-817`).
- [ ] Unit tests: a correct deliver recovers the order line's words, a wrong deliver recovers nothing, a lookup recovers nothing, and the dot state lasts exactly one step.
- [ ] `pnpm test`, `pnpm build` and `pnpm test:e2e` are green. The journey asserts that a word is fogged before its order is served and plain after.
- [ ] Live check: in the preview, serve three customers at phone 390x844 and desktop 1440x1000, and watch the order words sharpen and take the dot once. Load a seeded legacy save and confirm its journal words are not fogged. Check that the console is clean. Save screenshots to `/tmp/swarm-0056/worker-<n>/` and record a video of one served order.
- [ ] Perf budget: the fog is CSS only, with no per-frame JS, and a dialogue line renders with no visible jank on the phone profile.
- [ ] Review gate: this ticket changes how every word looks. Callum reviews the screenshots and the video before merge.

## Notes

- Depends on: 0055.
- Owns: `src/game.ts` (`deliver` only), `src/game.test.ts`, `tokens()` in `src/App.tsx`, the `.word` and `.new-word` rules in `src/style.css`, the fog section of `docs/design/design-system.md`, and the e2e assertions for the fog.
- Must not touch: `src/opening.ts`, `src/content/`, `src/scene/`, `public/audio/`.
- `docs/design/tokens.json` and `docs/design/tokens.css` are the design source of truth and shared. A new token is a serialized change and goes in both files.
- Ports: `JUNYAN_DEV_PORT=5318`, `JUNYAN_PREVIEW_PORT=5319`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product defaults this ticket implements, which Callum may overrule:
  - D4. In the restaurant, a correct deliver recovers every word of the order's line, a lookup alone does not, and the fog applies everywhere. Legacy saves count every journal word as recovered.
  - D5. Three token states (fogged, dot, plain) replace the old "not in the journal" dot. The journal shows recovered and looked-up words.
- Pointers: `src/game.ts:226-253` `deliver`; `src/App.tsx:370-382` `tokens()` and `:375` the old dot rule; `src/style.css:408-417` `.word`; `:418-427` `.new-word:before`; `:809-817` reduced motion.
