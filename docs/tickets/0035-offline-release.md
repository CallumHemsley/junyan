---
id: 35
title: Verify offline and update reliability
status: done
priority: medium
type: chore
created: 2026-11-02
---

## Why

Callum requested ten Sol 6.1 medium agents to improve Junyan using pstack, with silent verification and a consolidated morning result.

## Done when

The assigned slice has reproducible evidence, scoped changes where warranted, and an honest PASS, ISSUES or BLOCKED report. Product fixes require independent review before integration.

## Notes

- Baseline: `5dfad15`.
- Scope: Own vite.config.ts, public/sw.js if present, and e2e/overnight-offline.spec.ts only. Inspect actual service-worker ownership before edits; report overlap.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Owner: Codex implementation sub-agent; branch `t3/offline-release`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-a49a30c8`; dev `5216`, preview `5217`, both strict.
- Worker ownership inspected before editing: no `public/sw.js` exists. `scripts/offline.ts` generates `dist/sw.js` in `closeBundle`; generator changes require additional scope. No generator edit is authorized or attempted.
- Browser ports: 5216 dev, 5217 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

## Result: PASS (local production)

- Checkout baseline: `21a4faaa8887dc8091f8d34ee70ad462ea472096`; product baseline: `5dfad15`. Only this ticket and `e2e/overnight-offline.spec.ts` change. No proven product defect, so `vite.config.ts` and the out-of-scope generator remain unchanged.
- Read both requested pstack principles. New tests exercise real production responses, browser service workers, offline navigation, WAV bytes, and a second actual Vite build; they do not stub service-worker state or assert its generated source text.
- Fresh browser contexts load `/junyan/?test=1&seed=42`, wait for service-worker control (installation's precache has completed), disconnect, reload, fetch all 85 WAVs, and compare each response SHA-256 to its repository file. Both browsers return 85/85 matches. Production test hooks remain absent. Manifest start URL, scope and icon resolve under `/junyan/`; every observed HTTP request stays under that base path.
- Chromium's actual WAV and WebKit's repository `silentWav` PCM fixture both decode to `2.32` seconds. Chromium opens a real ordering dialog offline with `--mute-audio`. WebKit never starts audible playback: metadata decoding uses a silent PCM blob, leaving the 85 real cache entries untouched for byte checks.
- Real update: `pnpm exec vite build --base /junyan/ --minify false` changes the release, registration update waits for `controllerchange`, previous caches disappear, and online then offline HTML bytes equal the new artifact. Both browsers observe cache `junyan-7f743cb31de6` replaced by `junyan-0bd41db2882a`. HTML SHA-256 changes from `97ebb8171d3b58699a2bf20cb8842212ec32f5bf97a443562c57410bec1f5f81` to `d5e58317fb432151e05fb7ce43d9a1ee6dbe4d07187e9e2e37600630932587af`. A `finally` build restores normal ignored `dist` output.
- Browser page errors and console errors: `[]`. Offline screenshots at 1440×1000 and 390×844 were inspected in both engines; the existing restaurant, welcome controls and Chinese text render. All 85 local WAV SHA-256 values remain unchanged; the original 67 files were separately compared to commit `0bce3d7`, with zero mismatches.

## Reproduce

Run from this worktree with Node 22 and pnpm. `pnpm install --frozen-lockfile` installed the existing lockfile without changing it. Save the following local harness at ignored `output/offline-release/playwright.config.ts` (create its parent directory first):

```ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "../../e2e",
  testMatch: ["overnight-offline.spec.ts", "waiter.spec.ts", "offline.spec.ts"],
  workers: 1,
  timeout: 120000,
  expect: { timeout: 15000 },
  outputDir: "./results",
  reporter: [["list"], ["json", { outputFile: "output/offline-release/results.json" }]],
  use: { baseURL: "http://127.0.0.1:5216", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { browserName: "chromium", launchOptions: { args: ["--mute-audio"] } } },
    { name: "webkit", testMatch: "overnight-offline.spec.ts", use: { browserName: "webkit" } },
  ],
  webServer: [
    { cwd: process.cwd(), command: "VITE_PORT=5216 pnpm dev", url: "http://127.0.0.1:5216", reuseExistingServer: false },
    { cwd: process.cwd(), command: "pnpm exec vite preview --base /junyan/ --host 127.0.0.1 --port 5217 --strictPort", url: "http://127.0.0.1:5217/junyan/", reuseExistingServer: false },
  ],
});
```

```sh
pnpm test
pnpm build
AUDIO_PREVIEW_URL=http://127.0.0.1:5217/junyan/ OFFLINE_RELEASE_REBUILD=1 pnpm exec playwright test --config output/offline-release/playwright.config.ts
pnpm exec tsc --noEmit --target es2022 --module esnext --moduleResolution bundler --skipLibCheck --esModuleInterop --lib es2022,dom e2e/overnight-offline.spec.ts
git diff --check
```

- Exact final summaries: `Test Files 6 passed (6)` / `Tests 88 passed (88)`; production build `✓ built in 816ms`; browser run `8 passed (1.6m)`; standalone spec typecheck and diff whitespace check exit `0` with no output. Baseline independently reran the same 88 tests and production build successfully.
- Browser coverage: existing production offline test, all three existing waiter journey/save tests (including serving, change and journaling), plus two new offline/update tests in each of Chromium and WebKit.
- Local ignored evidence: `output/offline-release/browser.log`, `unit.log`, `build.log`, `audio-before.sha256`, `output/offline-release/output/offline-release/results.json` (JSON reporter resolves relative to the local config). The report contains `offline-evidence` and `update-evidence` attachments with the values above. Screenshots: `output/offline-release/results/overnight-offline-fresh-pr-18cfc--preserves-every-audio-byte-{chromium,webkit}/offline-{1440,390}.png`.

## Limits and lessons

- Update test is opt-in and requires the exact exclusive local preview URL above because it rebuilds ignored `dist`. Ordinary test runs retain the existing preview default and skip release replacement. Do not parallelize other builds against this preview during the update test.
- Initial harness failures were not product defects: blob metadata URLs are not HTTP base-path requests, and cache deletion can precede controller replacement. Excluding blob URLs and waiting for `controllerchange` made the observations match the user-visible contract; no runtime workaround was added.
- No public-site, AWS, deployment, push, dependency, lockfile, asset, schema or App changes. No children. No system-volume changes. Browser contexts and both owned servers exited; port checks show no listeners on 5216/5217.
- Not claimed: physical iOS/PWA install behavior, storage eviction/quota exhaustion, interrupted installation/update recovery, multi-tab concurrent release changes, or full WebKit game/audio playback. Independent integration review remains the parent's responsibility.
