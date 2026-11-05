# 0063 integrated handoff

**Code complete; root native/unit/build checks reported complete after an isolated rerun; awaiting root's final delta/current-main review.** Root relayed the user's direct **“Works at this level”** acceptance of a 20-second representative preview at actual default gain .1575 / ducked .042 during two shipped LinJie lines. Preserve default level .35 and the calibrated source exactly. See `USER-LISTENING.md` for scope. This does not claim full 73-second loop/day listening, worker auditory perception, enjoyment or final merge approval. Ticket remains doing pending root acceptance.

Branch: `codex/0063-restaurant-background-sounds`. PR: https://github.com/CallumHemsley/junyan/pull/17 . Reviewed current main **5c90ba4b7421755fee3dd5d12e777f70dd34f226** is merged (0061 direct word-switch preserved). Isolated checkout `/workspace/junyan-0063`, strict dev/preview ports **5414/5415**. Final committed SHA is reported in the handoff; `verified-source-sha256.json` binds runtime/test/asset files to the verified source independently of subsequent documentation commits.

## Result

One original offline 73-second preparation bed with irregular cup/pour/preparation textures, one native media owner, trusted click/key start, pause/resume on restaurant/visibility/page lifecycle, independent persisted Chinese mute/level controls and real foreground ownership ducking. Storage failures preserve current-session controls. Runtime resource retry explicitly reloads media; policy retry leaves data loaded. Speech volume/cancellation stays independent. No dependencies, schemas, shared style.css, future routes, AWS or existing .claude files changed.

Observed defects fixed: sparse-event double attenuation (measured before/after), Ogg offline native duration estimate (asset-only MP3 correction), Space bubbling into game controls, large/wrapped settings presentation, and a real 320px clipped panel (x=−70 before; toolbar-anchored within 12px gutters after). Normal application console errors remain checked. The test-only JSON save bootstrap's implicit favicon request gets a 204; the actual app explicitly loads icon.svg. Legacy per-spec browser overrides require the ticket config's JUNYAN_CHROMIUM setting; absent bundled Chromium caused the earlier 26 launch failures, not product failures.

## Actual verification

- `pnpm_config_verify_deps_before_run=false pnpm test`: **178 tests / 14 files PASS** (`integrated-unit-results.txt`). Per-command pnpm flag avoids this environment's automatic-install/esbuild-script approval gate; locked dependencies/config are unchanged.
- `pnpm_config_verify_deps_before_run=false pnpm build`: **PASS** (`integrated-build-results.txt`; existing third-party Zod annotation warnings).
- `pnpm_config_verify_deps_before_run=false JUNYAN_DEV_PORT=5414 JUNYAN_PREVIEW_PORT=5415 pnpm exec playwright test --config docs/evidence/0063/playwright.config.ts e2e/ambience.spec.ts e2e/word-switch.spec.ts e2e/audio.spec.ts e2e/waiter.spec.ts e2e/offline.spec.ts e2e/learning-help.spec.ts e2e/overlay-focus.spec.ts`: **81 PASS / 2 SKIPPED, 5.5 min** (`final-combined-browser-results.txt`). The two existing expired-gesture tests require dedicated audio projects; no WebKit policy pass is claimed. All browser runs use muted browser output, never system volume.
- Twenty-two dedicated ambience cases across desktop/phone cover native MP3 decode, actual click/touch entry, pre-gesture silence, mute/level persistence and zero level, current-session controls with unavailable storage, native foreground end/stop/word-cancellation/error ducking, resource retry/recovery, opening→restaurant→opening reset, one owner through repeated lifecycle listener events, normal/reduced settings, 320px panel containment, production `/junyan/` offline playback/mute reload. `final-native-observations.json` selects latest observations; append-only raw history includes the earlier favicon diagnosis. Visibility flags/pagehide/pageshow are supplied at the DOM listener boundary; actual OS/tab backgrounding and WebKit/mobile hardware are not separately observed.
- Actual seeded DOM/keyboard play completed the full opening, wrong/correct bedside delivery, all four restaurant customers, change, journal, next day and real save/reload on both viewports. Auxiliary failure/phase tests use explicit test hooks or resource fixtures, not a substitute for that complete actual-action journey. Normal app console/page-error assertions passed. This is automated play, not a human playtest.
- Captured and **actually inspected** desktop/phone restaurant, opening request and journal, normal/reduced sound controls and 320px before/after images under `screenshots/`. Original baseline captures are labelled separately. No video or browser audio recording is claimed.
- Supplemental independent read-only boundary review found no concrete lifecycle/cancellation/persistence defect and flagged genuine touch coverage; real tap coverage was added. Reviewer confirmed the measured mix notes did not claim listening. This is not root's final exact-patch/product approval; final scoped panel anchoring still belongs in that review.

## Audio and limits

Raw candidate: `public/audio/ambience/breakfast.mp3`, original CC0 synthesized non-speech design, **438,572 bytes / 73 s**, SHA in `audio-sha256.txt`. Measured decoded raw RMS **−30.55 dBFS**, peak **−8.52**, zero clipped samples. Default active pour **−36.76**, ducked **−48.24 dBFS** against the supplied **−20 active speech reference**. Source gain ×8 corrects the initial excessive source/controller attenuation while preserving user level and 11.48 dB ducking. Full active-window/control-range analysis: `MIX.md`, `mix-before.json`, `mix-after.json`; reproducible scripts live under `scripts/ambience-0063*.py`.

Human preview: `listening-comparison.mp3` (42 s), an **offline deterministic render**, not a browser recording or listening result. Sections: 0–14 s speech only; 14–28 default ambience; 28–42 maximum ambience. Same existing voice clip starts at 4/9 s within each section, unchanged in level; real controller gains are applied to ambience around it. JSON records source hashes/timing/provenance. Separate raw asset is needed to audition full repeated loop boundaries.

The user has accepted the representative 20-second mix at its actual default/ducked level, as relayed by root in USER-LISTENING.md. The full 73-second loop, full-session fatigue/seams and broader realism were not auditioned in that reported acceptance. No model here can perceive the audio; those broader dimensions are not marked passed from native playback, metering, file existence or the narrower user quote.

## Product-quality self-review

| Dimension | Evidence-backed assessment | What prevents 10 |
| --- | --- | --- |
| Naturalness / presentation | **Visual presentation 8/10; auditory naturalness unscored** | Neutral Chinese controls, 44px targets, normal/reduced/320px inspected. Real audio timbre/realism is unheard; real-device/accessibility-tool checks absent. The visual score does not rate unheard sound. |
| Immersion | **Unscored, relevant and unverified** | Correct phase/ducking/measured level supports the intent, but atmosphere, repetition and loop believability require listening in the actual session. |
| Usability | **8/10** | Independent mute/level, persistence/failure fallback, touch/keyboard and narrow layout verified. Controls follow the existing inert header while a modal is open; editing settings requires closing that modal. Physical-device/screen-reader testing absent. |
| Contribution to fun / interest | **Unscored, hypothesis only** | No human enjoyment/retention evidence and no auditory perception. A background layer may help atmosphere; that is not a demonstrated player outcome. |

All dimensions apply, so none are marked N/A. No inflated overall 8/10 or READY claim is made for audio dimensions beyond the user-accepted representative level. Known technical defects found within this scope were fixed; remaining acceptance gaps are precise, material and listed above. The game is a short vertical slice, not a release-quality Steam game. Self-scores are not independent approval.

## Foundation / ownership handoff

Read `INTEGRATION.md`: 0066 must add `location === "restaurant"` to the current day-phase presence predicate when adding routes, retain a single shell-level ambience owner, pause on all other locations and opening, and regression-test leaving/return/no duplication. No future route or schema was implemented here. 0063 retains the current App/playback lease until root independently accepts this patch and explicitly hands ownership to 0066. No merge, retarget, deployment or automatic tracking was performed.

## Final targeted cleanup and root verification update

See ROOT-VERIFICATION.md: root's initial muted Mac Chrome selection was35/38, not green; the three isolated reruns on exact7779574 passed3/3 in43.3s after fresh per-archive Vite caches and removal of concurrent inference. No product defect or specific causal performance diagnosis is established. Root178unit/build passed.

Root authorized one targeted test-only cleanup: e2e/word-switch.spec.ts afterEach now drains page routes with unrouteAll({behavior:"wait"}) before the unchanged clean-console assertion. No errors are suppressed, and no assertion/timeout/product/mix changes are made. Focused desktop/phone word-switch regression:10/10 PASS in53.3s, actual output route-drain-word-switch-results.txt. Accepted calibrated source, preference .35 and runtime gains .1575/.042 remain unchanged. Root owns final delta/current-main review, central merge and App/styles/playback handoff.

## Latest root-combined retry-fixture correction

Root's later combined40 run was38 PASS/2 failures of the same explicit Retry locator, with native attempt2 already playing. See RETRY-SEQUENCING.md: settings click capture legitimately starts attempt2; a visible stale first error did not prove current retry rejection. Only the test fixture now synchronizes the second rejection before unroute and verifies a real third-attempt explicit retry. Corrected focused desktop/phone pair2/2 PASS; three repeats each6/6 PASS. Independent static review found no defect. No product/global-gesture/mix/timeout/force-click changes or full-suite rerun. The original verified-source manifest's test hash is historical; retry-sequencing-source-sha256.json records this test-only delta and unchanged runtime hashes. Root's final combined confirmation/delta review and merge/handoff remain central responsibilities.
