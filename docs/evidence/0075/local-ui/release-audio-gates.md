# Required real-audio browser gates

This change prepares release verification on top of `99ccbda`. The feature audio merge is still pending. No browser success result is claimed for these new assertions.

The neighbourhood success and migration suites now use shipped WAVs. Replacement PCM responses have been removed. Each location must play its authored line, replay it, play a tapped word, and replay that word from its card. Native playback must succeed with decoded media, a finite positive duration, and no media error. The full mandatory opening waits for its actual cast speech, and each restaurant customer must play the order and thanks. The normal journey explicitly has no `window.__TEST__` hook.

The production offline gate visits every location for the first time after disconnecting the network. It requires actual cached lines, word lookup and replay, saved furniture after offline reload, a clean console, and the existing single ambience owner stopping outside the restaurant and resuming on return. It cannot pass through a skipped offline test or a missing-speech warning.

The unavailable-audio test blocks service workers and deliberately aborts only apartment WAV requests. It requires the native load failure and player feedback. Removing the route must then permit successful real replay and clear the failure feedback. The genuine offline success test allows the production service worker.

The dedicated config builds a fresh production artifact before preview. It defaults to strict development port 5466 or strict preview port 5566. Both permit validated environment overrides. The exact browser commands after the asset merge are:

```sh
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH pnpm exec playwright test e2e/neighbourhood.spec.ts e2e/neighbourhood-save.spec.ts --config playwright.neighbourhood.config.ts
PATH=/Users/callumhemsley/.nvm/versions/node/v22.23.4/bin:$PATH JUNYAN_NEIGHBOURHOOD_PREVIEW=1 pnpm exec playwright test e2e/neighbourhood.spec.ts e2e/neighbourhood-save.spec.ts e2e/neighbourhood-offline.spec.ts e2e/doctor-audio.spec.ts --config playwright.neighbourhood.config.ts
```

Node 22 test discovery parses all ten neighbourhood cases. Discovery is the only verification performed before the assets merge. Muted automated playback checks do not establish pronunciation quality or human listening acceptance.
