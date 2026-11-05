# Real-media release verification

Candidate `7b27ca44a7ed5c9a0eebb45a6a06145beb381287`. Owner `/root/local_integration`. Worktree `/private/tmp/junyan-neighbourhood`. All checks use Node 22.23.4 and existing shared dependencies. No package installation or source fix was needed.

## Results

- All 308 Vitest tests pass across 26 files.
- TypeScript and the production build pass. Existing Zod annotation and bundle-size warnings remain.
- All 12 production browser cases pass on desktop and phone. There are no skips, unexpected failures, or flaky retries.
- All 34 original ambience, word-card, and native error regression cases pass on desktop and phone. There are no skips, unexpected failures, or flaky retries.

[Production cases](production-results.json) and [regression cases](regression-results.json) preserve the actual reporter statistics and per-case results. [Build identity](build-identity.json) records SHA-256 values for the tested production bundle, stylesheet, and service worker.

## Production coverage

The full journey plays the mandatory hospital opening and actual cast speech, then serves four restaurant customers with order and thanks playback. It visits all four neighbourhood locations, places furniture, rejects an invalid placement without learning credit, reunites the cats, completes both repairs, tends the garden, claims all three gifts, reloads saved progress, and advances the restaurant day. Existing restaurant state and the journal survive the visits.

At every location the tests require the actual authored line, line replay, a tapped word, and word replay. Native media must decode with positive duration and successful playback. Successful speech has no request replacement, silence fixture, or fallback. The normal production journey asserts that `window.__TEST__` is absent.

The real service-worker check disconnects before the first visit to any feature. All four locations play their cached lines and words without network access. Saved furniture reloads offline, and the single restaurant ambience owner stops outside the restaurant and resumes on return. The successful paths assert a clean console and no page exceptions. [Native speech events](native-speech-events.json) retain the supplied probe attachments. The probe resets on reload, so each attachment records the final document rather than the entire earlier journey.

The unavailable-audio case deliberately blocks apartment WAV requests with service workers disabled. It requires native failure and the player-facing warning. Removing the route permits actual replay and clears the warning. Its expected error evidence is labelled separately in the speech event file. The real offline success case uses the service worker.

Both projects also pass old-save migration, independent corrupted-feature recovery, and all five doctor clips with replay while offline.

## Original behavior

The additional 34 cases cover independent ambience settings, keyboard behavior, native lifecycle suspension, real foreground speech ducking, recovery after resource failure, unavailable storage, opening transition, reduced motion, touch activation, narrow phone controls, and production offline mute persistence. They also cover direct word switching in Help, hospital, restaurant, kitchen, tray, journal, and receipt. Rapid selection, topmost Escape, focus restoration, and cancellation of superseded audio remain intact.

Some original race and resource-failure tests deliberately intercept media or inject failures. These isolated mechanism tests retain their original fixtures. They do not replace speech in the new production success or offline acceptance journeys. [New ambience events](ambience-native-events.jsonl) preserve only this run. Historical ticket 0063 images and event logs were restored after the tests.

## Commands

```sh
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH pnpm test
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH pnpm build
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH JUNYAN_NEIGHBOURHOOD_PREVIEW=1 pnpm exec playwright test e2e/neighbourhood.spec.ts e2e/neighbourhood-save.spec.ts e2e/neighbourhood-offline.spec.ts e2e/doctor-audio.spec.ts --config playwright.neighbourhood.config.ts
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH JUNYAN_DEV_PORT=5466 JUNYAN_PREVIEW_PORT=5566 pnpm exec playwright test e2e/ambience.spec.ts e2e/word-switch.spec.ts e2e/overnight-audio.spec.ts --config playwright.release-regression.config.ts
```

Production runs on strict port 5566 under `/junyan/`. The first browser command rebuilds before starting preview. The final command used a temporary copy of the normal config with its existing desktop and phone projects, strict ports 5466 and 5566, and JSON results under `output/release-regression`. Its preview command omitted the rebuild so an independent reviewer could use the same verified `dist` concurrently. The temporary file was removed. To reproduce with a fresh build, replace its config argument with `--config playwright.config.ts`.

## Visual inspection and limits

The ten location and offline-return PNGs are fresh captures from the real-media production journey. Selected desktop courtyard, phone garden, and phone offline restaurant captures were opened and inspected. They preserve the accepted pixel style, legible DOM dialogue, navigation, and contained layout. Phone layouts still require vertical scrolling. The two phone ambience captures come from the original regression checks.

Automated browsers launch muted. Native playback validity and these screenshots do not establish human pronunciation or listening quality. Independent voice and gameplay review, audible demos, and coordinator landing remain separate gates. This owner did not push, merge, deploy, or alter accepted cast performances.
