---
id: 29
title: Refine four hairstyles and enlarge their eyes
status: doing
priority: high
type: feature
created: 2026-11-01
---

## Why

After judging the five production-model close-ups, Callum accepted the diagnosis that four hairstyles look like small lumpy caps perched on exposed heads, with high hairlines, abrupt temple gaps and insufficient distinction. Callum also requested larger eyes for those four characters. 张老师 is explicitly excluded from both changes.

## Done when

- Waiter, 林姐, 小李 and 小周 have fuller, connected hair coverage, deliberate hairlines and distinct silhouettes: soft short fringe; swept-back hair into a bun; tidy side part; fringe/side locks flowing into a ponytail respectively.
- Those four characters have visibly larger, readable eyes at actual game resolution, with convincing placement/depth at oblique angles. 张老师 retains his current hair and eyes exactly.
- Eight-direction standing/seated/served and walking views hold together without detached hair blobs, exposed unintended bald patches, eyes showing through the rear head, clipping or unnatural overlap. Existing tray orientation/occlusion and authored clothing/identity remain intact.
- The actual Pixel Plays renderer, Mandarin DOM UI, voice/audio assets, game rules and save behavior remain unchanged.
- Independent cross-review, appropriate unit/build and muted phone/desktop journey checks pass. Before/after native/enlarged close-ups and a silent all-five turntable are delivered for parent inspection.

## Notes

- Implementation owner: Sol 6.1, single production writer; branch `t3/character-hair-eyes`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-1c58ceeb`, baseline `eeeb18dd79554d10e7506ab01148ded7cebf639f`. Isolated dev/preview ports `5193`/`5194`. Root checkout is read-only. Started 2026-11-01; baseline renderer copied into this worktree's ignored evidence directory before editing. Independent review remains required; keep status doing at implementation handoff.

- Reserved centrally by parent. Astra orchestrator coordinates Sol 6.1 medium implementation and independent verification workers; one production writer for renderer geometry, declarations, related tests/helpers and this ticket.
- User confirmed the four hairstyle directions in chat and explicitly added larger eyes for everyone except 张老师. Preserve his isolated portrait/geometry across angles, rather than comparing entire scene pixels that include changed neighbours.
- Ticket 0028 UI revamp is active in a separate worktree and owns App/styles/disclosure. Do not edit those files, schemas/content, playback, assets, rules, saves, dependencies or vendored engine code.
- Strict isolated ports 5193 (dev) / 5194 (preview). Every browser launch must be explicitly silent; no system-volume changes or audible playback. Offscreen Pixel Plays rendering preferred for angle/contact sheets.
- Existing comparison: `output/playwright/character-integrated-root/cast-contact-sheet.png`. Parent baseline is `ed13443` plus this reservation; source geometry is `src/scene/renderer.js` with reusable characterFigure/customerPose helpers.
- No push, PR, merge or deployment by delegates; parent integrates after review and publication follows combined UI/art verification.

### Implementation handoff — 2026-11-01

- Four connected crowns, different fringe/part/bun/ponytail silhouettes and inset, larger two-layer eyes are implemented in the actual renderer. The elder hair/eye branches are untouched. No production interface changed, so declarations remain unchanged. No App/styles, content, rules, saves, audio, assets, dependencies, vendor or ticket 0028 edits. No root checkout writes, delegation, push, PR, merge or deployment.
- Iteration: raised the first pass's too-low fringe to leave the eyes clear; removed 小李's eye-crowding tiny brow; inset the larger eyes after explicit rear-quarter suppression comparisons revealed leakage. Final current-render eye suppression changes **zero pixels across 60 rear pose/yaw comparisons**. Native front footprint grows from 2 to 9–10 standing/walking pixels and from 4 to 8 seated/served pixels. This is a geometry/depth test, not camera-angle hiding.
- Evidence root: `/Users/callumhemsley/.t3/worktrees/junyan/t3-1c58ceeb/output/playwright/0029/`. `head-closeups-{1x,4x}.png`, `{standing,seated,served,walk-a,walk-b}-{1x,3x}.png`, `empty-tray-{1x,3x}.png`, before/after per-character native 360×280 PNGs, and `all-five-silent-turntable.mp4`. Five cast × eight yaws × five poses = **200 before/after pairs**, plus eight paired empty waiter trays. Captures use baseline `eeeb18d` and final production geometry through the real rasterizer. Nearest-neighbour close-ups and full-app phone/desktop screenshots inspected by the writer; independent reviewer not yet assigned.
- Elder proof: `elder-proof.json` asserts **40 exact complete-geometry comparisons and 40 exact full isolated 360×280 RGBA comparisons**, not whole-scene equality. Includes per-pose/yaw SHA-256 digests, unchanged other-cast body geometry, native eye footprint and rear-eye checks. Unit test pins an aggregate baseline elder geometry digest. No golden baseline was regenerated from modified geometry.
- Silent turntable: `all-five-silent-turntable.mp4` is 10 seconds, five cast together through all eight yaws and all five poses. `video-probe.json` reports exactly one H.264 video stream and **no audio stream**. No audible playback, audio preview, system-volume changes, paid services, external assets or WebKit fixtures. All Chromium launches explicitly include `--mute-audio`.

### Reproduction and checks

All commands run with cwd `/Users/callumhemsley/.t3/worktrees/junyan/t3-1c58ceeb`. Temporary configs are ignored and retained beside evidence. They set `strictPort: true`, explicit web-server cwd, dev `5193`, preview `5194`, isolated Vite cache and `--mute-audio`; default 5173/5177 configs and parent servers are untouched.

```sh
pnpm install --frozen-lockfile
pnpm exec vitest run
pnpm build
AUDIO_PREVIEW_URL=http://127.0.0.1:5194/junyan/ pnpm exec playwright test --config output/playwright/0029/playwright.config.ts
node src/scene/render-character-evidence.mjs output/playwright/0029 eeeb18d
ffprobe -v error -show_entries stream=codec_type,codec_name -show_entries format=duration -of json output/playwright/0029/all-five-silent-turntable.mp4
git diff --check
```

- Final Vitest: **88/88 tests, 6/6 files** (renderer 13; game/rules 22; content 10; saves 31; navigation 4; audio 8). `unit-final.log`. The earlier `pnpm test -- src/scene/renderer.test.ts` invocation also ran all 88, not a renderer-only subset.
- Final build: **TypeScript + Vite passed**, `build.log`. An initial newly authored test fixture needed its palette imported from validated content rather than untyped JSON; fixed before final verification. Dependency Rollup PURE-annotation warnings remain non-blocking; no dependency edits.
- Final Playwright: **17/17 passed** in muted Chromium, desktop 1440×1000 and phone 390×664 CSS viewport (iPhone 13 profile; full-page output is taller). Includes two complete **four-customer** journeys with correct change, word lookup/journal and next-day progress; six waiter tests total, eight save regressions, one production offline test at `/junyan/`, and two renderer reduced-motion tests. Journey and renderer tests assert clean browser console/page errors; reduced-motion canvas bytes stay equal over 45 frames. `playwright.log`, `playwright-results.json`, `0029-{phone,desktop}-playable-{empty,full}.png`; journey screenshots also at `output/playwright/0029-{phone,desktop}-{restaurant,journal}.png`.
- Capture self-checks and video probe passed; `evidence.log`, `elder-proof.json`, `video-probe.json`. `git diff --check` clean. Playwright-managed servers stopped at completion; no listeners remain on 5193/5194.
- Limits/gates: Chromium only (no WebKit/Firefox/device-hardware claim); no pronunciation assessment; current checkout UI only, not the independent 0028 revision. Evidence and temporary configs are ignored local artifacts, not committed binaries. **Status stays doing pending independent review and parent acceptance.**
