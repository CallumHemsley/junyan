# Ticket 0061 evidence and decisions

- Base: origin/main 66ac123. Owner: Codex 0061 worker. Branch: codex/0061-switch-word-card-directly. Isolated checkout: /workspace/junyan-0061. Strict ports: 5404/5405.
- No bundled pstack found in workspace or /opt; following supplied pstack 0.15.32 harness-adapted bug discipline.
- Read ticket, repository workflow, accepted decisions 0001–0004, build recommendation and design system.
- Cause from inspection: source ancestors inert and modal card focus trap block existing lookup function. Playback already cancels previous requests.
- State shape remains Word|null plus latest HTMLButtonElement trigger; no content/schema/dependency changes required. Compare: forwarding clicks through inert ancestors would break keyboard/assistive access; keep source active and selectively inert unrelated controls instead.

- Baseline browser reproduction: system Chromium on strict ports 5404/5405 failed second token click with visible/enabled target intercepted by inert app shell; output/0061-baseline.log and test-results trace. Playwright CDN denied download; system /usr/bin/chromium used. Video disabled because bundled ffmpeg missing. Locked install needed npm_config_strict_dep_builds=false (lifecycle script remains disabled).
- Implementation: nonmodal word dialog, selective inert unrelated controls, source/card Tab loop, latest-trigger restoration and capture guard against backdrop/game clicks. Phone source scroll region reserves 200px for compact card. Existing playback unchanged.
- Baseline failure excerpt (real muted system Chromium, original App implementation): `locator.click: Timeout 2000ms exceeded`, target `<button class="word fogged" data-recovered="false">我</button>` visible/enabled/stable, then `<div class="app-shell">…</div> intercepts pointer events`. Source: output/0061-baseline.log. The later test run replaces transient Playwright traces; this excerpt preserves the observed failure.
- Initial post-fix direct switching passed desktop and touch-phone (2/2); inspected both screenshots and confirmed the card and source words occupy separate regions.
- Supplementary code review at checkpoint 6278c5714947deaa26a4b0b43a5fdeb7fb0198b8 found no confirmed implementation defect; reviewer did not run browsers. Writer strengthened receipt setup/visibility, live-card keyboard switching and inert pickup state assertions in response to coverage findings. Final root review remains required.
- Full `pnpm test`: 11 files / 169 tests passed. `pnpm build`: passed with existing Zod annotation warnings only. Logs: output/0061-unit.log, output/0061-build.log.
- Verification harness correction: aborted an intermediate matrix when its command omitted JUNYAN port variables and fell back to 5200/5201. Final matrix explicitly uses 5404/5405; no result from the aborted matrix is counted. Local-only config selects /usr/bin/chromium and disables unavailable video encoding. No dependency/lockfile change is included.
- Focused expanded run exercised all behavior successfully but console assertions caught fixture `/favicon.ico` 404s on desktop+phone production: save seeding opens a raw JSON document before loading the app. The new test now fulfills that default favicon request with 204; application console assertions remain strict and no application error is ignored. Earlier Help test selector was corrected to the expansion button within the open dialog instead of the blocked header button. Full suite rerun required and underway.

## Portable verification

From the repository root (Node 22, pnpm, installed Chromium):

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405 pnpm exec playwright test --config docs/evidence/0061.playwright.config.ts e2e/word-switch.spec.ts e2e/overlay-focus.spec.ts e2e/learning-help.spec.ts e2e/waiter.spec.ts e2e/audio.spec.ts
```

This VM used `npm_config_strict_dep_builds=false pnpm --config.strict-dep-builds=false` for pnpm commands to keep the esbuild lifecycle script disabled, and `JUNYAN_CHROMIUM=/usr/bin/chromium` to select the installed browser. The committed config is equivalent to the ignored `output/0061.config.ts` used in the run, requires the assigned strict ports and mutes browser audio. Video is disabled because the bundled encoder was unavailable. No subjective listening evaluation occurred; playback implementation and audio assets are unchanged.

New portable regressions are in `e2e/word-switch.spec.ts`; updated overlay expectations are in `e2e/overlay-focus.spec.ts`. The browser suite covers development and production source switching, hospital opening without advancing, Help, restaurant, kitchen, tray, journal and an explicitly visible served receipt; keyboard switching while the same card stays open; top-only Escape and latest-trigger focus; rapid replacement with previous native media paused; exact lookup count increments; and blocked kitchen pickups.

Raw baseline, unit and build logs are preserved under `docs/evidence/0061/`. Screenshots and final browser output will be added after the final matrix.
- Final matrix harness discovery: legacy Help and overlay specs override launchOptions at test scope, dropping the config's system-browser path. Their cases failed before page creation because bundled Chromium is unavailable. Minimal harness-only changes in those two specs now honor optional `JUNYAN_CHROMIUM`; affected cases will all rerun. No application assertion or skip condition changed.
- Final supplementary read-only review of current implementation/tests/config found no confirmed defects; reviewer performed no browser runs. Root exact-head review is still required.

## Inspected browser screenshots

These are actual browser captures, committed with this ticket so review does not depend on VM retention. Phone captures use Chromium touch emulation for iPhone 13; desktop is 1440×1000. All show the card after repeated source selection, with the source region still available. The writer inspected each image below.

- [Desktop Help](0061/desktop-help.png)
- [Phone Help](0061/phone-help.png)
- [Desktop restaurant](0061/desktop-restaurant.png)
- [Phone hospital](0061/phone-hospital.png)
- [Phone kitchen and food card](0061/phone-kitchen.png)

No video or captured listening comparison is supplied: the VM's Playwright video encoder was unavailable, automated playback was muted, and audio assets/controller were not edited. Native audio request/replacement and pause behavior are tested, not subjectively rated.

## Normal-motion verification results

- Full matrix command used `JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405 npm_config_strict_dep_builds=false pnpm --config.strict-dep-builds=false exec playwright test --config output/0061.config.ts e2e/word-switch.spec.ts e2e/overlay-focus.spec.ts e2e/learning-help.spec.ts e2e/waiter.spec.ts e2e/audio.spec.ts`. Result: 32 passed, 2 pre-existing dedicated-audio-project skips, 26 legacy harness launch failures before page creation. All ten new switching cases, both complete four-customer journeys and native media cancellation passed with strict console checks.
- After correcting the optional browser path, every affected case reran using the committed portable config: `JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405 JUNYAN_CHROMIUM=/usr/bin/chromium npm_config_strict_dep_builds=false pnpm --config.strict-dep-builds=false exec playwright test --config docs/evidence/0061.playwright.config.ts e2e/overlay-focus.spec.ts e2e/learning-help.spec.ts` — **26 passed**. No skip/assertion was added to bypass any failed behavior. This includes production offline Help audio precaching and actual saved-game reloads on both sizes.
- The two unchanged skips are the `expired walking gesture` audio test, which explicitly requires project name audio-webkit or audio-chromium with dedicated autoplay-policy settings. Native current/superseded audio, error recovery and rapid cancellation tests did run on desktop and phone; no WebKit result is claimed.
- Durable result files: [normal matrix per-case output](0061/normal-browser.log), [all affected cases passing](0061/affected-browser.log), [169 unit tests](0061/unit.log), [production build](0061/build.log), [baseline reproduction](0061/baseline.log).
- Browser-driven self-play completed the real opening and all four customers through pickup, delivery, change, day progression and the journal on desktop and phone. The journey reads the deterministic hook for order details but does not dispatch fixture actions to complete the day. Those actions are actual UI clicks; both journeys assert a clean error console. Inspected normal-motion day-two journal captures: [desktop](0061/desktop-day-two-journal.png), [phone](0061/phone-day-two-journal.png).

## Reduced motion, offline and scoped quality review

- Command: `JUNYAN_DEV_PORT=5404 JUNYAN_PREVIEW_PORT=5405 JUNYAN_CHROMIUM=/usr/bin/chromium JUNYAN_REDUCED_MOTION=reduce npm_config_strict_dep_builds=false pnpm --config.strict-dep-builds=false exec playwright test --config docs/evidence/0061.playwright.config.ts e2e/word-switch.spec.ts e2e/waiter.spec.ts e2e/offline.spec.ts --grep 'wake in the ward|Help and restaurant|keeps the restaurant'` — **7 passed**. Both layouts played the complete opening and four-customer day again with actual UI actions, change and journal; development+production switching passed; production restaurant reload/audio loading passed with the browser offline. Console assertions passed. [Full log](0061/reduced-offline-browser.log).
- Inspected reduced-motion card/source layouts: [desktop](0061/desktop-help-reduced.png), [phone](0061/phone-help-reduced.png). Also inspected contact sheets assembled from actual opening captures (wake, premise, Chinese handover, request, wrong choice, handover, reply and day one): [desktop](0061/desktop-reduced-opening-contact.png), [phone](0061/phone-reduced-opening-contact.png).

Writer self-assessment of ticket 0061, not independent approval:

| Dimension | Score | Evidence and limit |
| --- | --- | --- |
| Naturalness / presentation | 8/10 for visual presentation | Existing paper/card typography and food art retained; inspected desktop, phone and reduced-motion captures show source/card separation. Fixed bottom space reduces the reading viewport, especially in the hospital. Spoken naturalness is unscored: no subjective listening occurred. |
| Immersion | 8/10 | A→B→C stays in the reading surface and reuses native playback replacement; both real full-day journeys remain intact. Card opening still changes the available reading area, and a dictionary panel remains a visible interruption. |
| Usability | 8/10 | Pointer/touch and live-card keyboard switching, latest trigger focus, top-only Escape, exact lookup counts and blocked pickup all verified. Phone source regions scroll above the card. Real iOS Safari/VoiceOver and physical-device ergonomics were not evaluated. |
| Contribution to fun / interest | 8/10 as a design hypothesis | Removing a close step makes exploratory word chains cheaper; tests establish the reduced interaction cost, not player enjoyment. No human playtest or retention evidence exists for this change. |

No known blocking defect remains within this ticket after the reported fixes/checks. This is a short playable vertical slice, not an assessment that the whole game is ready for a Steam release. Longer-session fun/retention and pronunciation quality cannot be rated from these muted automated runs. Follow-up proposal for root: a native-device/assistive-technology human session comparing A→B lookup chains, reading comfort and perceived pronunciation interruption; no new out-of-scope implementation is included here.
- Root requested integration of reviewed current main 85a0120 before final readiness. Next checkpoint commits this proof, merges origin/main into the ticket branch, then reruns focused/boundary/journey verification on that integrated code.
