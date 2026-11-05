# Rooftop garden verification

## Scope

This evidence covers ticket 0070 in its isolated cloud checkout. Shared integration ticket 0066 owns actual navigation, atomic IndexedDB persistence, combined journal registration, offline enumeration and apartment gift claiming. None of those gates is closed by the feature harness.

The worker is `/root/garden_writer`, requested model GPT-6.1 Sol at medium effort. Strict dev port is 5470 and preview is 5471. Browser runs use system `/usr/bin/chromium` through optional `JUNYAN_CHROMIUM_EXECUTABLE`; Chromium downloads returned policy HTTP 403. All browser launches retain `--mute-audio`. Actual listening is a separate open gate.

Installed `node_modules` is linked from `/workspace/junyan` and matches this checkout's frozen lock versions, including React 19.3.1, Vite 7.3.7, Zod 4.6.7 and Playwright 1.64.1. The managed shell reports Node 24.22.1. The repository requests Node 22; this environment difference is recorded. No dependency or lockfile changed. Direct binaries avoid `pnpm exec`'s attempted automatic modules reinstallation across the symlink.

## Reproduce

Start `./node_modules/.bin/vite --host 127.0.0.1 --port 5470 --strictPort` from this checkout. Run these serially.

- `./node_modules/.bin/vitest run`.
- `./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build`.
- `JUNYAN_CHROMIUM_EXECUTABLE=/usr/bin/chromium ./node_modules/.bin/playwright test --config src/features/garden/playwright.config.ts`.
- `JUNYAN_CHROMIUM_EXECUTABLE=/usr/bin/chromium ./node_modules/.bin/playwright test --config evidence/0070/existing-playwright.config.ts`.
- `PYTHONDONTWRITEBYTECODE=1 python3 src/features/garden/audio-plan.py`.

## Results

All 184 unit tests pass across 13 files. The feature contributes 15 tests covering pure care, bounded day settlement, rollback, same-day idempotence, first-arrival rain, placement, shade, stage caps, gift eligibility, save validation, canonical content and recovery registration. See `unit-results.txt`. The existing hospital, restaurant and save journey also passes all six desktop/phone checks in `existing-results.json`.

The isolated garden journey passes desktop and phone. See `browser-results.json`. It checks real action controls, modal focus, double-click safety, pooled-care state, next-day droop and growth dialogue, recoverability, occupied-site refusal, Escape, moving back, reversible shade, token lookup, no default pinyin/English, playback callbacks, exposed rain, durable gift eligibility, serialized snapshot restoration, no duplicate recovery on restore, at least 44px targets, at least 28px spoken text, no overflow and zero browser console/page errors. The harness records playback calls without pretending unavailable voice assets exist. Snapshot reinjection is not actual central save/reload proof.

`desktop-initial.png` and `phone-initial.png` record the rejected first design with fogged captions. Final `garden-*-welcome.png`, `garden-*-wet-warning.png`, `garden-*-rain-growth.png` and `garden-*-retreat.png` supersede them. The writer inspected actual phone and desktop captures. Interface labels now use plain shared WordToken look; dialogue keeps the existing shared fog. Progress uses neutral ink. The world uses Pixel Plays primitives, existing 林姐 character rig, shade geometry, visible rain, distinct plant growth and eventual tree crown/bird/bench retreat.

Browser checks found incorrect initial focus and an overly strict double-click focus assertion. The first native dialog also conflicted with the shared word card top layer. An ordinary DOM confirmation now traps its own keyboard focus and keeps its tokens mounted while the shared word card owns focus. Closing the word card restores the exact confirmation token. The second pointer click lands on the modal, which safely leaves care unchanged. Focus and double-click safety are now separate assertions. Visual inspection also found stale action dialogue persisting across a day change. Day changes now clear transient UI state, and exact next-day droop/growth dialogue is tested.

## Open release gates

Actual garden voices and listening are blocked. See `audio-status.md` and content-addressed `audio-jobs.json` for exact missing files and pinned identity. No substitutes are committed.

Actual integrated rooftop navigation, restaurant-authoritative next-day transitions, feature migration isolation, shared word-card/journal behavior, central reload, apartment gift delivery and offline assets/audio remain unverified until 0066 combines the features. The development-only harness is absent from the production build entry. The production build currently proves the pre-integration application and compiles all garden TypeScript, not a shipped rooftop route.

Independent code and real integrated player review remains required. Central lead owns merge sequencing and post-merge verification. Ticket remains doing.
