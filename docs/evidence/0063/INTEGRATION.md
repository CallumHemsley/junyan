# Integration contract (pending 0061 lease release)

Keep one `createAmbience` owner for the mounted application, separate from `createPlayback`. Factory: `new Audio(import.meta.env.BASE_URL + ambienceAsset)`. Import the asset constant without a leading slash so production `/junyan/` works offline.

Feed restaurant presence from the actual app phase, not panel presence: the sound continues while looking at the kitchen, journal or word card, and stops during the hospital/opening and after leaving the restaurant. On `visibilitychange`, supply `visible: !document.hidden`; on pagehide pause too, and on pageshow recalculate phase/visibility. Dispose on owner teardown. StrictMode must recreate the owner after teardown rather than reuse a disposed ref.

Call `gesture()` synchronously in a real user action; do not defer through a React effect or a promise. On initial opening gestures the controller can unlock without creating media while `restaurant` is false. A policy/load failure requires a fresh gesture to retry. Repeated gesture calls while playing do not restart.

Foreground playback should publish one speaking boolean at its ownership boundary: true before the current speech `play()`, false on current ended, stop, error or rejection; stale completions must not clear a newer speech attempt. Feed that boolean to `update({speaking})`. Ducking only changes the ambience element. Never route speech through the ambience controller, change its volume or stop speech from ambience error callbacks.

Keep ambience preference independent of speech/game-save schema. Persist only `{muted, level}` in a separate versioned local preference key with finite/clamped parsing and storage failure fallback. Do not persist unlocked/restaurant/visible/speaking or runtime failure state. Restore preferences before any possible start. Reuse existing neutral UI tokens, Chinese DOM labels (`环境声`, `关闭环境声` / `开启环境声`, `环境声音量`), minimum 44px targets, and a native labelled range input. A fresh volume/mute user action may call gesture to retry failed policy playback.

Required final verification after wiring: actual app phase and document lifecycle, speech start/end/stop/replacement/failure ducking, saved mute/level reload and unavailable storage, no duplicate media after leave/return or mount teardown, offline subpath decode, opening + three customers + change + journal at phone/desktop, controls/screenshots inspected and console clean. Current standalone driver supplies lifecycle/speech flags directly and must not be described as app integration proof. Subjective balance, resemblance, loop seam and ordinary-session Callum approval remain unverified until actual listening occurs.

## Unapplied proposal prepared against main 85a0120

`integration-proposal.patch` is a concrete unified diff for review, **not applied production code**. It modifies App.tsx and foreground playback, adds a scoped controls stylesheet/component/hook, independent preference parsing and tests, and speech-ownership tests. It does not modify the shared style.css. It must be refreshed against 0061's accepted final App/playback changes after root explicitly releases the lease; context applicability is not assumed.

The hook recreates its controller on each StrictMode setup, removes all listeners on cleanup, preserves independent preference through localStorage failures, uses trusted synchronous gesture capture, pauses on visibility/pagehide, restores on pageshow, and keeps one native element. Desktop uses the Chinese label 环境声; compact phone presentation uses the existing speaker icon with Chinese accessible name. The native details panel holds separate ambience mute/level settings; new CSS uses neutral tokens and 44px targets. Proposed speech observer is optional for backward compatibility and clears only on current ownership transitions.

Scratch verification only: copied main 85a0120 sources to `/tmp/junyan-0063-integration-proposal`, applied the proposal there, and typechecked using existing locked dependencies. This is a private static compilation/test exercise, not application of the integration to the ticket production checkout, browser quality acceptance or lease release. Required final app-level checks remain pending.

## Production integration and foundation handoff

Root explicitly released the 0061 lease and authorized production integration. The proposal was applied and main 5c90ba4 (independently reviewed direct word-switch) merged into this ticket branch. The old proposal file remains historical evidence; production source is authoritative now. Scoped CSS avoids changing shared style.css.

For 0066 foundation: current `useAmbience(ready && session.phase === "day")` means restaurant presence because day is the only post-opening location today. When introducing neighbourhood navigation, pass `ready && session.phase === "day" && location === "restaurant"` instead. Keep the single hook owner mounted in the shared application shell, so leaving pauses the same element and returning reuses it; do not mount a second ambience owner per location view. Preserve muted/level preference independently of the neighbourhood/game save schema. Opening, apartment, cats, repairs and garden must keep restaurant ambience silent, including while their own speech plays. Location changes need an explicit regression for pause/return/no duplication, alongside existing visibility/pagehide/pageshow and speech ownership tests. No future routes or neighbourhood schema are implemented by 0063.

0063 retains App/playback integration ownership until root independently accepts this exact combined patch and explicitly hands the lease to 0066. Do not treat this written integration contract as an early lease release.
