---
id: 55
title: Play the hospital opening on first run
status: done
priority: high
type: feature
created: 2026-11-03
---

## Why

This ticket makes [[decisions/0004-hospital-opening]] playable. A new player wakes on the ward, hears the doctor's four English lines, then plays the rest in Chinese: they hand 老爷爷 his breakfast, answer 小姨 with 好 or 谢谢, and reach the end card 第一天 · 早安小馆 and day 1. It joins the rules (0051), the ward scene (0053) and the test hooks (0054). It is PR 0055 in the plan `docs/plans/hospital-opening.md` (section PR 0055).

## Done when

- [ ] A `HospitalOpening` component renders the ward scene and dispatches to `reduceSession`. It holds no hidden rules.
- [ ] The first screen is a wordless tap-to-wake: a soft white screen with one round button of at least 44 px, an eye icon and `aria-label="醒来"`. That tap unlocks audio before the doctor's first line.
- [ ] The opening mounts only when startup finds readable, empty storage: no checkpoint and no `v1` save. An invalid save counts as a new player. An IndexedDB timeout or block keeps today's behaviour (fresh day 1 with the save warning).
- [ ] Autosave and the checkpoint are held off during the opening. A reload mid-opening replays it from the start. The first save is day 1 with the recovered journal.
- [ ] The bedside tray uses the `pickup` and `deliver` action shapes. A wrong item shows 老爷爷's 不对 line and waits.
- [ ] Fog runs in the opening: unrecovered tokens look soft, recovered tokens sharpen and show the vermilion dot the first time. Fogged tokens stay legible and tappable. Under reduced motion the sharpening is a fade of 120 ms or less.
- [ ] English lines are DOM text with `lang="en"` and are voiced from the 0050 clips. Browser speech synthesis is never used. Every control, `aria-label`, the word card, the journal and the end card are Chinese from the first second.
- [ ] After the end card, day 1 opens on today's first screen (the 怎么玩 / 开门迎客 help panel).
- [ ] `__TEST__.reset()` returns to day 1, never the opening, unless the URL has `opening=play`. `opening=skip` from 0054 now skips the opening.
- [ ] Focus, `inert` and modal handling from 0045 and 0046 hold in the opening: keyboard focus moves into each step and back.
- [ ] Unit tests: any new pure helper is tested in Vitest. `pnpm test` and `pnpm build` are green.
- [ ] The journey in `e2e/waiter.spec.ts` plays the opening first. It asserts no Latin letters on the game surface after the handover and the recovered words in the journal, then continues the day. Its timeout is raised to fit.
- [ ] Live check: play the opening in the preview at phone 390x844 and desktop 1440x1000 with sound on. Confirm audio plays from the first doctor line, the wrong item is refused, and day 1 opens on the help panel. Check that the console is clean. Save screenshots of every step to `/tmp/swarm-0055/worker-<n>/` and record a video of the whole opening.
- [ ] Perf budget: the wake button shows within 1 s of load in the desktop preview, the scene holds its 30 fps cap, and the first request arrives within about 30 s of waking (the decision's target; report the measured time).
- [ ] Review gate: this ticket changes the first interaction. Callum reviews the screenshots and the video before merge.

## Notes

- Depends on: 0051, 0053, 0054.
- Owns: `src/App.tsx`, a new `src/HospitalOpening.tsx`, a scene host component in `src/scene/` that can render the ward (adapt or wrap `RestaurantScene.tsx`), `src/style.css` (opening styles only), `e2e/waiter.spec.ts`, any new `e2e/opening.spec.ts`, and the journey timeout in `playwright.config.ts`.
- Must not touch: `src/game.ts`, `src/opening.ts` (send rule bugs back to 0051), `src/content/`, `public/audio/`, `src/scene/renderer.js` and the scene modules. Do not change the restaurant's dot rule: 0056 does that.
- `playwright.config.ts` and `src/App.tsx` are shared. Changes to them are serialized.
- In dev test mode (`?test=1`), startup skips storage (`src/App.tsx:112`). There, the app starts on day 1 unless the URL has `opening=play`, so the journey opens `/?test=1&seed=42&opening=play`.
- Ports: `JUNYAN_DEV_PORT=5316`, `JUNYAN_PREVIEW_PORT=5317`, strict.
- Base branch: base on `codex/0030-overnight-pstack` until Callum merges it into `main`. After that merge, base on `main`.
- Product defaults this ticket implements, which Callum may overrule:
  - D2. The opening plays only on readable, empty storage. An invalid save counts as new. An IndexedDB timeout or block does not play it.
  - D3. The first screen is a wordless tap-to-wake button labelled 醒来, which also unlocks audio.
  - D5 (opening part). Three token states: fogged, dot (recovered on this or the previous step), plain.
  - D6. After the end card, day 1 opens on today's first screen.
  - D7 (reset part). `__TEST__.reset()` returns to day 1 unless `opening=play`.
  - D9 (journey part). The journey asserts no Latin letters after the handover.
- Pointers: `src/App.tsx:55` and `:415` ready and loading; `:57-59` help panel default; `:79-88` checkpoint write; `:111-144` startup with the 1500 ms IndexedDB fallback at `:138`; `:145-157` autosave 350 ms after ready; `:236-283` and `:410-449` focus, inert and modal handling; `:349-355` `__TEST__.reset`; `:370-382` `tokens()`; `src/style.css:408-427` `.word` and `.new-word:before`; `:809-817` reduced motion. The spike `spikes/hospital-opening/app.js` and `shots/` show the intended flow.

## Progress

- 2026-11-04. Owner Claude Code (PR owner in the autopilot stack). Branch `claude/0055-opening-ui` on `claude/0051-opening-rules`. Ports 5316 (dev) and 5317 (preview). Status was `doing` until the verifier's fix-forward round.
- Built: `src/startup.ts` (`startSession`), `src/opening-view.ts` (`tokenLook`, `wardFrame`), `src/HospitalOpening.tsx`, `src/WordToken.tsx`, `src/scene/WardScene.tsx`, `src/icons.tsx`, the Session in `src/App.tsx`, the opening styles, and an `onEnded` follow-up in `src/audio/playback.ts` so the aunt answers when the player's reply clip ends.
- Tests: `src/startup.test.ts` covers every start branch. `src/opening-view.test.ts` plays the script through `reduceOpening` and matches 0053's `WARD_STEPS` frame for frame. `e2e/waiter.spec.ts` plays the whole opening first. `e2e/opening-start.spec.ts` covers the start rules on the preview and the test-mode reset.
- Review media: `docs/design/review/0055-review-*.png` (phone and desktop) and `docs/design/review/0055-review.mp4` (47 s, phone).
- Perf, phone 390x844, preview, CPU throttle 4x, 5 runs, medians: navigation to 醒来 193 ms; returning player to 开门迎客 227 ms; 醒来 to the first `playing` 240 ms; end card 继续 to the 怎么玩 panel 124 ms, longest task 94 ms (the first, cold run had 314 ms). 醒来 to the first request is 50.9 s, over the 35 s budget: the six clips before it last 40.1 s, 32.1 s of that is the four English lines. The fix is in the content (0050), not the UI.
- Learned: the help panel focuses its 关闭 button today (`e2e/calm-ui.spec.ts:33` pins it), not 开门迎客 as the plan says. Day 1 after the opening keeps that behaviour. Tokens carry no punctuation, so the opening lines show no 。 or ，, as in the restaurant.
- 2026-11-04, fix-forward round from the independent verifier. Done.
  - Hand-off long task. The end card's 继续 mounted the day UI and baked the restaurant canvas in one click task. `src/scene/RestaurantScene.tsx` now bakes in its own task after the next frame, so the help panel paints first and still focuses 关闭. Measured with `scripts/perf/handoff.probe.ts` (desktop 1440x1000, production preview, CPU 4x, 10 samples each, longtask PerformanceObserver from the tap). Before: longest task median 98 ms, max 263 ms, 4 of 10 over 100 ms; help panel median 96 ms. After: longest task median 63 ms, max 201 ms; help panel median 30 ms. The one sample over 100 ms in each run is the first sample in a fresh browser (cold code), and there it is the click task itself (201 ms), not the bake. Warm samples are all under 70 ms. The bake alone is 56 to 68 ms warm at 4x, and in an earlier run reached 134 and 154 ms in two of ten samples. Splitting the bake itself would need `renderer.js`, which this ticket must not touch.
  - Wake motion. The eye button no longer breathes; it is still. The veil fades over `--duration-arrive` on `--ease`, not 1.6 s. Only steam loops, as the design system says. Stills `docs/design/review/0055-review-wake-*.png` regenerated by `scripts/perf/wake-stills.probe.ts`. The video `0055-review.mp4` still shows the old breathing ring for its first second.
  - Review gate. Callum waived the pre-merge review of the media ("merge all in, I'll test later").
- Open product item for Callum: the first request arrives about 47 s after waking against the 35 s budget, because the four English premise clips total 32 s. That is a content call (0050), left for Callum to decide.
- Learned: React flushes passive effects synchronously after a discrete event, so a canvas bake in `useEffect` lands in the tap's own task. Deferring it with a frame then a timeout splits the work and lets the new UI paint first.
