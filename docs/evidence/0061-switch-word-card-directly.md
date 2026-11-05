# Ticket 0061 evidence and decisions

- Base: origin/main 66ac123. Owner: Codex 0061 worker. Branch: codex/0061-switch-word-card-directly. Isolated checkout: /workspace/junyan-0061. Strict ports: 5404/5405.
- No bundled pstack found in workspace or /opt; following supplied pstack 0.15.32 harness-adapted bug discipline.
- Read ticket, repository workflow, accepted decisions 0001–0004, build recommendation and design system.
- Cause from inspection: source ancestors inert and modal card focus trap block existing lookup function. Playback already cancels previous requests.
- State shape remains Word|null plus latest HTMLButtonElement trigger; no content/schema/dependency changes required. Compare: forwarding clicks through inert ancestors would break keyboard/assistive access; keep source active and selectively inert unrelated controls instead.

- Baseline browser reproduction: system Chromium on strict ports 5404/5405 failed second token click with visible/enabled target intercepted by inert app shell; output/0061-baseline.log and test-results trace. Playwright CDN denied download; system /usr/bin/chromium used. Video disabled because bundled ffmpeg missing. Locked install needed npm_config_strict_dep_builds=false (lifecycle script remains disabled).
- Implementation: nonmodal word dialog, selective inert unrelated controls, source/card Tab loop, latest-trigger restoration and capture guard against backdrop/game clicks. Phone source scroll region reserves 200px for compact card. Existing playback unchanged.
- Baseline failure excerpt (real muted system Chromium, original App implementation): `locator.click: Timeout 2000ms exceeded`, target `<button class="word fogged" data-recovered="false">我</button>` visible/enabled/stable, then `<div class="app-shell">…</div> intercepts pointer events`. Source: output/0061-baseline.log. The later test run replaces transient Playwright traces; this excerpt preserves the observed failure.
- Initial post-fix direct switching passed desktop and touch-phone (2/2); inspected both screenshots and confirmed the card and source words occupy separate regions.
- Supplementary code review at checkpoint 6278c5714947deaa26a4b0b43a5fdeb7fb0198b8 found no confirmed implementation defect; reviewer did not run browsers. Writer strengthened receipt setup/visibility, live-card keyboard switching and inert pickup state assertions in response to coverage findings. Final root review remains required.
- Full `pnpm test`: 11 files / 169 tests passed. `pnpm build`: passed with existing Zod annotation warnings only. Logs: output/0061-unit.log, output/0061-build.log.
- Verification harness correction: aborted an intermediate matrix when its command omitted JUNYAN port variables and fell back to 5200/5201. Final matrix explicitly uses 5404/5405; no result from the aborted matrix is counted. Local-only config selects /usr/bin/chromium and disables unavailable video encoding. No dependency/lockfile change is included.
