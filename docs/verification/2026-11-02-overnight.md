# Pstack overnight improvement pass

Status: all ten original tasks have returned. First batch independently accepted and integrated; App/fast-reload fix awaits0044 review. Combined verification and publication remain pending.

Baseline product commit: `5dfad15`. Reserved-task baseline: `21a4faa`. Parent branch: `codex/0030-overnight-pstack`.

## Proof contract

- Baseline independently rerun: 88 unit tests passed; production build passed on November 2, 2026. Existing Rollup annotation warnings are non-fatal.
- Each fix needs a concrete reproduction, scoped correction, meaningful regression proof and independent review before integration.
- The generated verification skill must launch an owned instance, doctor the right checkout, drive a real user action, capture evidence, clean up and prove evidence survives.
- Final combined pass must cover desktop/phone service, change, word journal, reload/offline, audio lifecycle and inspected screenshots with a clean console.
- All browsers stay silent; no system volume changes. Preserve actual Pixel Plays, approved characters including unchanged ZhangLaoshi, calm UI, Mandarin-only visible content and85WAVs.
- No finding, missing report or incomplete coverage is counted as a pass. Avoid speculative features and forced changes.

## Tasks

All ten use `gpt-6.1-sol` with `reasoningEffort=medium`, isolated T3-managed worktrees and no grandchildren. Worker results wake the parent automatically; no polling.

| Ticket | Scope | Thread |
| --- | --- | --- |
| 0031 | Repeatable silent verification | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3Aa8e85c94-bbf3-4631-8e50-ea41db88e074> |
| 0032 | Game rule invariants | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3Abe2fdb6b-b234-451c-b24b-6c4ae14db0d7> |
| 0033 | Saved progress recovery | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A1f829a73-68d1-4ebe-b9b9-86ef1c00c2e7> |
| 0034 | Audio lifecycle | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A80fbcd84-f51c-457a-9b3b-a09ad59af74f> |
| 0035 | Offline update reliability | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A0e6b048a-9d2f-4aee-9133-ebb7813779f6> |
| 0036 | Phone layout polish | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A02d8a5f5-a95c-418c-b6f4-836f1294b614> |
| 0037 | Keyboard interaction | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A20e49bed-15c3-47b2-b716-5774c82bd56d> |
| 0038 | Content audio tooling | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A8f75c953-cf27-4260-9a08-ea27d5906a30> |
| 0039 | Renderer and motion review | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3A0d75e0bf-83f3-497f-9b30-ab04ce686c74> |
| 0040 | Adversarial journey review | <t3-thread://v2/fd288724-fea1-4e7a-9d87-012261496510/thread:delegated-task:command%3Amcp%3Ad6a847d1-b7aa-48be-abc9-f80eb61289b9%3Adelegate-task%3Af06388c0-150e-481f-9245-0cd68b7cb045> |

## Integration queue

| Slice | Result and integration state |
| --- | --- |
| 0031 verification helper | Parent independently executed launch, doctor, two real UI persistence proofs and cleanup. Imported; review in `docs/reviews/0031-verification-parent.md`. |
| 0032 rules | No proven defect; audit report imported. 81,984 transitions and 120 completed days checked. |
| 0033 save recovery | Fix `0b79e33` accepted by0043 and imported as98c1057. |
| 0034 native audio errors | Fix `d3b027d` accepted by0043 and imported as997ae38. |
| 0035 offline | No runtime defect; production offline regression suite imported. |
| 0036 phone | No demonstrated layout defect; five-viewport regression suite imported. |
| 0037 keyboard / 0042 persistence | Imported6d49290 after0044 independently accepted immediate-reload behavior. Two inherited findings were fixed by0045 and accepted by0046. |
| 0038 content audio tooling | Fix `cac4d9c` accepted by0043 and imported as47ccb9c. Parent110unit/build and tooling self-check passed. |
| 0039 renderer | Review imported. Parent fix `e99da37` accepted by0043 and imported as9852ae0; physical hidden-tab restoration remains unverified. |
| 0040 adversarial journey | Review imported. One P2 word-loss defect reproduced six times across Chromium/WebKit; other real service and offline paths passed. |

Workers' passing checks apply to their recorded commits, not automatically to the combined branch. Product deployment remains gated by independent review and combined verification. All evidence stays silent; listening quality and physical-device Safari remain unverified.

## Parent combined first-batch evidence

At integrated product c305242 (later commits only update docs/harness),110unit tests and build passed. Tooling self-check passed; real plan resolves85/85cached jobs; all85WAVbytes exactly match5dfad15. Browser scope:26passes/2opt-in rebuilt-release skips plus20native Chromium/WebKit audio passes. First nested native-runner attempt failed before tests due to config cwd; corrected and rerun successfully. Logs and hash receipt are under `output/verification/overnight-first-batch/`. Phone/desktop scene screenshots inspected; strict ports5244/5245 released. 0044 accepted immediate-reload behavior and identified two inherited startup/focus defects.0045 corrects those;0046 independently accepts the correction. Final combined evidence is below.

## Final combined gate

- Accepted product:3a74ba9, imported unchanged as7967bcf. Review-only0046 receipt ffae5a3 imported64188d0. No actionable defect remained in the final review. Exact App behavior and original negative controls are recorded in `docs/reviews/0046-startup-focus-recheck.md`.
- Parent full suite:119passed/4skipped in10.1minutes. Two native-policy cases are intentionally skipped in the default Chromium projects and pass in the dedicated native run. Two rebuilt-release cases require their separate opt-in/exclusive port; prior0035 release-replacement evidence applies to unchanged service-worker generation.
- Parent native Chromium/WebKit audio:20/20passed in58.5seconds. Parent110units/build and independent0046's110units/build pass. Independent recovery16/16 plus48additional storage/StrictMode probes and57affected checks are separate evidence, not summed into the parent full-suite count.
- Content tooling self-check and verification-helper safety3/3pass.85/85cache jobs resolve. All85WAVfiles are byte-identical to accepted5dfad15.
- Normal production desktop1200×1000 and phone390×844 journeys, without game-state hooks: tap包子→immediate reload→journal retains包子; serve all4customers, give change, enter day2. Both pass with clean consoles. Desktop produces26.48second H.264 video with no audio stream. Phone/desktop scene, order, receipt and recovered-journal screenshots inspected.
- Root evidence:`output/verification/overnight-final/` includes full-browser.log, native-audio.log, audio-preservation.json, real-journey-results.json, demo-source.json, video-proof.json, screenshots, traces and junyan-overnight-silent.mp4. Real demo captured at3a74ba9; integrated runtime bytes must remain identical.
- Final helper at a492df9: launch, doctor, real normal-mode desktop/phone word-save/reload2/2 and cleanup pass. Eleven evidence PNG/JSON files survive cleanup with checksums; both viewports inspected and consoles clean. Evidence:`output/verification/overnight-accepted/` and `overnight-final/helper-evidence-checksums.json`.
- The reviewer isolated valid silentPCM from service-worker interception. The parent carried that harness-only safeguard into both canonical configs, then reran native20/20 and recovery16/16 successfully. Canonical logs:`overnight-final/native-audio-canonical.log` and `recovery-canonical.log`. Product sources/assets remain identical to reviewed3a74ba9; public publication receipt remains pending under0030.

## Material limits

Silent checks do not approve Mandarin pronunciation or native listening quality. Physical iOS/Safari, OS-level hidden-tab restoration and long-term multi-tab write conflicts remain unverified. The explicit1500ms startup policy without a usable checkpoint can start fresh and overwrite the inaccessible old durable save on autosave; it is not lossless recovery. Actual Pixel Plays, accepted cast including unchanged ZhangLaoshi, calm Mandarin UI and all85WAVs remain preserved.
