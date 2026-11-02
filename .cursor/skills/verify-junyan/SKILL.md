---
name: verify-junyan
description: Launch, diagnose and silently drive Junyan's real browser UI with Playwright, persistent screenshots and safe per-instance cleanup. Use after UI changes or to reproduce game, journal, save, help, offline and native audio issues.
---

# Verify Junyan

## Launch

Run from the checkout root with Node 22, pnpm and macOS `lsof`/`ps`. No account, backend or AWS is involved. Install the locked dependencies once with `pnpm install --frozen-lockfile`. If browsers are missing, run `pnpm exec playwright install chromium webkit` (downloads browser binaries, not application dependencies).

```sh
.cursor/skills/verify-junyan/verify.mjs launch word-proof
```

This builds the current checkout and starts loopback Vite dev **5200** and `/junyan/` preview **5201**, both `--strictPort`, with separate logs and a recorded process identity. It refuses occupied ports, including an existing Junyan server. Never drive **5173/5177**, reuse another worker's instance, kill by process name, change system volume or touch repository audio files. Use a fresh run name each time. The launcher cleans up on launch failure; inspect its logs before retrying.

Override both ports only if allocated to this worker:

```sh
JUNYAN_DEV_PORT=5220 JUNYAN_PREVIEW_PORT=5221 .cursor/skills/verify-junyan/verify.mjs launch alternate-proof
```

The standalone configs use the same environment variables and defaults. Do not run them while the helper owns those ports: `pnpm test:e2e` and `pnpm exec playwright test --config playwright.audio.config.ts` each launch their own strict, non-reused instances. Use them serially after cleanup. They export the resolved preview URL to the existing offline/help/overlay specs; do not set the old URL overrides.

## Doctor

```sh
.cursor/skills/verify-junyan/verify.mjs doctor word-proof
```

Read-only: compares canonical checkout, exact HEAD, hashes of tracked product/config/audio input bytes and built `dist` bytes; verifies live recorded PIDs, unique run-config command identity, each process's actual working directory, exclusive port ownership, and game HTML. HTTP 200 alone never suffices. Source edits, commits or a rebuilt preview require cleanup/relaunch. There is no auth to check. Doctor proves identity and readiness to drive; only the browser proof establishes a usable UI. Logs and `instance.json` identify the version, source fingerprint and URLs. If identity fails, do not bypass it or kill the unexpected process.

## Drive

```sh
.cursor/skills/verify-junyan/verify.mjs drive word-proof
```

Doctor runs first. The helper runs `proof.spec.ts` with isolated Chromium desktop and phone contexts: open the stall, click table 1, click a real spoken word, observe its pinyin card, inspect the real IndexedDB save, reload and observe the journal entry. No internal setters, save injection or `?test=1`: normal persistence is exercised. It also asserts the real Pixel Plays canvas, no horizontal overflow and a clean console. Contexts start with empty IndexedDB and close automatically.

For broader checks, use the [feature map](features/README.md). Some existing regression specs deliberately seed or dispatch state: useful focused coverage, **not** a substitute for the real UI proof. Report every failing precondition and do not weaken a journey to pass.

## Evidence

Evidence is in `output/verification/word-proof/` (ignored by git). Desktop and phone each leave `before.png`, `lookup.png`, `persisted.png`, `evidence.json`, a Playwright trace under `results/`, and a combined `results.json`. Inspect all screenshots, read the action/result and saved journal JSON, and retain failure artifacts too. `instance.json` records SHA, content/build hashes and owned processes; dev/preview logs remain. A trace records the click and resulting state, not merely the final screenshot. Open a trace with `pnpm exec playwright show-trace <trace.zip path from results/>` only when needed; close its viewer afterward.

Silence is a transport/launch boundary, not a product patch: **every Chromium project uses `--mute-audio`**. WebKit runs only `e2e/audio.spec.ts`, whose native media tests route WAV responses through `e2e/audio-fixtures.ts`'s valid silent PCM fixture. It preserves RIFF headers, timing, unmuted `volume=1` elements and native `play()`/autoplay policy; no fake `play()`, element muting, global autoplay bypass or WAV edits. Do not expand WebKit coverage without routing every audio path first. The strict Chromium audio project retains `--autoplay-policy=user-gesture-required`. The raw-WAV regression verifies all 85 repository WAVs against the manifest and silent header/duration integrity. Listening quality is intentionally **not** verified silently.

## Cleanup

Always clean up, including after a failed drive:

```sh
.cursor/skills/verify-junyan/verify.mjs cleanup word-proof
test -s output/verification/word-proof/desktop-before.png
test -s output/verification/word-proof/desktop-persisted.png
test -s output/verification/word-proof/phone-persisted.png
test -s output/verification/word-proof/results.json
test -s output/verification/word-proof/cleanup.json
```

Cleanup verifies command identity and checkout before terminating only the two recorded PIDs, verifies they stopped and removes only the generated runtime config. Evidence, logs, results, traces and the manifest survive; `cleanup.json` records teardown. Browser profiles are ephemeral. `dist` remains the normal ignored build output. Repeated cleanup of already stopped PIDs is safe; PID reuse with a different command is refused, never guessed. Do not delete the run directory as cleanup. If the helper is interrupted during launch, run cleanup using its already-written manifest. For standalone Playwright configs, Playwright owns server/context teardown.

## Helpers

`verify.mjs launch|doctor|drive|cleanup RUN` is executable and shown above; `proof.config.ts` and `proof.spec.ts` are Playwright inputs, not shell scripts. Never run `drive` directly without doctor. Sequential runs share `dist`, so avoid concurrent builds in this checkout even on different ports. For map upkeep after product changes, use `/maintain-verification-skill` when available.

Run the helper's safety regression checks with `node --test .cursor/skills/verify-junyan/verify.test.mjs`. They verify rejected legacy/invalid ports, occupied-port ownership, wrong checkout/version/source, and refusal to terminate a foreign PID. They start no browser, alter no product files and clean their temporary manifests.
