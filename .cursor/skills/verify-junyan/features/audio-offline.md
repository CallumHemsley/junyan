# Audio and offline

## Sub-features

- Greeting `听招呼`, spoken order/reaction `再听一遍`, word playback.
- Retry after a genuine failure, cancel stale requests, preserve native autoplay refusal.
- Installed preview service worker and cached game/audio without network.

## How to get to it (user POV)

Enter the stall, click a table and replay the line or greeting. For offline, first visit the built `/junyan/` preview online and let the service worker take control before disconnecting.

## Driving it with Playwright

After cleanup: `pnpm exec playwright test --config playwright.audio.config.ts --project audio-webkit --project audio-chromium` verifies silent native playback, retry, cancellation, transient activation expiration and all 85 PCM sources. The WebKit tests install the repository silent response fixture before navigating; Chromium is launch-muted and strict-autoplay. `pnpm exec playwright test e2e/offline.spec.ts --project desktop` separately verifies preview caching and offline WAV requests. Inspect native audio/console attachments in traces/results; this suite includes deliberate failure requests, whose expected diagnostics are asserted, not universally suppressed.

## Gotchas

Silent PCM tests prove timing/policy, not voice quality. Do not use zero-byte responses, mute WebKit elements, monkey-patch `play()` or enable autoplay globally. Offline requires first online install; Playwright's helper lookup contexts are intentionally fresh and do not prove offline coverage. Run only the desktop offline project (phone intentionally excludes it). Some focused cancellation specs dispatch state for setup; report that limitation.
