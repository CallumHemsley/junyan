---
id: 31
title: Create a repeatable silent verification skill
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

- Worker: Codex Sol 6.1 medium; branch `t3/repeatable-silent-verification`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-acbce26e`; dev `5200`, preview `5201`.
- Starting checkout: `21a4faaa8887dc8091f8d34ee70ad462ea472096`; product baseline: `5dfad159c8d3544efccdbaf6500b54f4d3562062`.

- Baseline: `5dfad15`.
- Scope: Own .cursor/skills/verify-junyan/, playwright.config.ts and playwright.audio.config.ts only. Create feature map and prove launch/doctor/drive/cleanup.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5200 dev, 5201 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

### Implementation and verification

- Added `.cursor/skills/verify-junyan/SKILL.md`, executable launch/doctor/drive/cleanup helper, real-UI lookup/persistence proof, safety regression checks, and four maps: help, serving, journal/saves, audio/offline. The normal-mode proof never writes fixtures or dispatches game actions.
- Both Playwright configs now default to strict dev `5200` / preview `5201`, accept `JUNYAN_DEV_PORT` / `JUNYAN_PREVIEW_PORT`, reject legacy/invalid/colliding ports and refuse existing servers. Resolved preview URLs reach the existing help/offline/overlay specs. Every Chromium project is launch-muted; the dedicated WebKit tests keep the repository's silent PCM fixture and native unmuted autoplay semantics unchanged.
- Doctor checks exact HEAD, product bytes, build bytes, process liveness, actual process checkout, unique run-config command identity and exclusive listener ownership before checking game HTML. Cleanup terminates only matching owned PIDs and preserves all evidence.
- `pnpm install --frozen-lockfile`: passed; no dependency/lockfile edits. `pnpm test`: **88/88 passed**. `pnpm build` (also exercised by helper/Playwright launch): passed, with existing Zod/Rollup annotation warnings only.
- `node --test .cursor/skills/verify-junyan/verify.test.mjs`: **3/3 passed**, including occupied-port refusal, wrong checkout/version/source and refusal to kill a foreign PID.
- `.cursor/skills/verify-junyan/verify.mjs launch|doctor|drive|cleanup word-proof`: passed end to end; **2/2 desktop/phone proofs**, real `早上好` lookup → pinyin → real IndexedDB journal → visible entry after reload; clean console. Six before/action/result screenshots inspected; traces, save JSON, process manifest and cleanup receipt retained under `output/verification/word-proof/`.
- `pnpm exec playwright test --config playwright.audio.config.ts --project audio-webkit --project audio-chromium`: **18/18 passed**, including native policy refusal/replay recovery, cancellation and all 85 WAV/header/duration checks. `pnpm exec playwright test e2e/waiter.spec.ts e2e/learning-help.spec.ts e2e/offline.spec.ts e2e/overlay-focus.spec.ts`: **33/33 passed**, including four-customer serving/change/day progression on desktop and phone and production offline/help paths.
- Additional configurable-port run: occupied `5220` was correctly refused without reuse/termination; rerun uses prechecked-free `5290` / `5291`, with native-playback JSON retained as `output/verification/word-proof/audio-results.json`. Final committed-SHA lookup proof and evidence checksum survival check are recorded in `output/verification/committed-proof/`.
- Learned: normal `?test=1` bypasses persistence, so it is unsuitable for a save proof; a live HTTP endpoint is not checkout ownership. The helper is deliberately macOS-local (`lsof`/`ps`) and serial within one checkout because builds share `dist`.
- Gaps: no listening/voice-quality claim, real-device Safari claim, full browser-matrix claim or independent review. No product/assets/WAV changes, no push/deploy/AWS/system-volume changes. Ignored evidence is local, not committed; preserve it for review. Result: **PASS** for this verification-tooling slice.
