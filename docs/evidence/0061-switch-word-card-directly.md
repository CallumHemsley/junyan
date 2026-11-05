# Ticket 0061 evidence and decisions

- Base: origin/main 66ac123. Owner: Codex 0061 worker. Branch: codex/0061-switch-word-card-directly. Isolated checkout: /workspace/junyan-0061. Strict ports: 5404/5405.
- No bundled pstack found in workspace or /opt; following supplied pstack 0.15.32 harness-adapted bug discipline.
- Read ticket, repository workflow, accepted decisions 0001–0004, build recommendation and design system.
- Cause from inspection: source ancestors inert and modal card focus trap block existing lookup function. Playback already cancels previous requests.
- State shape remains Word|null plus latest HTMLButtonElement trigger; no content/schema/dependency changes required. Compare: forwarding clicks through inert ancestors would break keyboard/assistive access; keep source active and selectively inert unrelated controls instead.

- Baseline browser reproduction: system Chromium on strict ports 5404/5405 failed second token click with visible/enabled target intercepted by inert app shell; output/0061-baseline.log and test-results trace. Playwright CDN denied download; system /usr/bin/chromium used. Video disabled because bundled ffmpeg missing. Locked install needed npm_config_strict_dep_builds=false (lifecycle script remains disabled).
- Implementation: nonmodal word dialog, selective inert unrelated controls, source/card Tab loop, latest-trigger restoration and capture guard against backdrop/game clicks. Phone source scroll region reserves 200px for compact card. Existing playback unchanged.
