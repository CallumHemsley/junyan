---
id: 30
title: Integrate and verify the overnight improvement pass
status: doing
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
- Scope: Parent integration, review and final evidence. No speculative features.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5244 dev, 5245 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

- 0031 verification skill independently reviewed and executed by parent: helper3/3, real browser2/2, doctor/cleanup passed, eleven evidence artifacts retained. Review docs/reviews/0031-verification-parent.md.
- 0032 rules audit and0035 offline regression suite imported after parent diff review. No product changes were warranted in those slices.
- Parent scene scheduling correction is committed on codex/0041-scene-scheduling at e99da37 and awaits0043 independent review together with0033save,0034audio and0038tooling corrections.
- 0042 reserved for production immediate-reload word-loss, assigned to0037App.tsx writer. Other original tasks continue autonomously.

- 0036 phone regression source independently reviewed by parent and imported. Product CSS unchanged; five viewport journeys exercise real controls, derive expected orders through read-only test hooks and assert touch dimensions, text size, overflow, reachability and console cleanliness. Runtime rerun will be part of combined verification.
- 0039 read-only renderer report imported; its baseline scheduling finding remains tracked by0041. No additional art correction warranted.

- 0040 adversarial report imported at929d8ea: six independent no-hook immediate-reload reproductions across desktop/phone Chromium and phone WebKit. Findings assigned to0042; completed service/offline paths are retained as baseline evidence, not proof of the later correction.

- 0043 accepted the four exact product fixes without actionable defects. Imported0033/0034/0038/0041 plus reviewreceipt c305242. Parent110units/build, tooling selfcheck, helper3/3 and exact85WAVbaseline comparisons pass; scoped browser matrix running. 0044 independently reviewing c1a4fb7 App changes before integration.

- Parent first-batch runtime checks:26Chromium browserpasses/2explicit opt-in release-rebuild skips;20nativeaudio Chromium/WebKit passes; helper safety3/3. Phone/desktop scene screenshots inspected. Logs output/verification/overnight-first-batch/{browser,native-retry}.log. First native attempt failed before tests because the ignored nested config lacked root cwd; corrected runner and all20cases passed. Standard native config now includes the new post-start resource-error spec; map/SKILL updated accordingly. Exact85WAVbaseline bytes retained in audio-preservation.json. Owned5244/5245listeners cleared.

- Final0044review accepted immediate-reload correction; inherited startup/focus findings corrected by0045 and independently accepted by0046(ffae5a3). Imported reviewed product7967bcf/review64188d0. Parent full suite119passes/4deliberate skips, native20/20, normal production desktop/phone four-customer+reload+day2 journeys pass;26.48second silent H.264 demo captured and inspected. Exact85WAVbytes preserved.
- Final helper a492df9: doctor identity, two real normalUI word/journal/reload proofs and cleanup pass;11evidence files retained. Canonical native/recovery configs now block service-worker bypass of valid silentPCM routing; affected native20/20 and recovery16/16reruns pass. All product bytes still match reviewed3a74ba9. Full evidence and explicit timeout tradeoff are in docs/verification/2026-11-02-overnight.md. GitHub publication/live proof remains pending.
