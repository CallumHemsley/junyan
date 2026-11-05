# Apartment implementation checkpoint

Ticket 0067 adds a freely furnished home while preserving the hospital and restaurant. This checkpoint is blocked for release by missing new voices and pending shared route/save integration. It is not a completed feature.

## Current implementation

The pure reducer owns a 6×5 room, starter delivery, placement previews, rotation, storage, undo, colour choice, rug sizes and bounded daily finds. Furniture can sit on rugs. A protected edge and row keep a route clear. Ownership and gift claim history survive undo. Saved-state validation checks both the layout and undo snapshot.

The scene uses the existing 360×280 Pixel Plays software renderer and character rig. The room is baked once per mount. Furniture and selection outlines draw from current state. Direct floor taps map through the public camera projection. Arrow keys move through adjacent grid cells; Enter places the selected item. The optional grid provides individually labelled cells. The phone furniture tray scrolls horizontally.

The view uses callbacks for actions, word lookups, recovery and line playback. It passes the resulting reducer notice to playback. Rejected placement and repeated colour selection do not recover words. The isolated dev harness records playback callbacks; it does not play or claim to verify unavailable speech. It has no feature-local persistence and is excluded from the production build.

## Throughput checkpoint

- Blocking first steps: repository decisions, central contract and file ownership were read before implementation. New audio requires approved cloud model access.
- Independent workstreams: this worker owns the apartment files. The foundation writer owns the shared route, save and content registry.
- Shared mutable state: no shared application, schema, dependency or renderer file was edited. Integration callbacks retain central save and journal ownership.
- Smallest safe decomposition: one writer owns the feature reducer, content and view so its transitions and UI stay consistent. A separate agent reviews without edits.

## Verification so far

- Installed Vitest, TypeScript and Vite binaries ran directly. The shared `node_modules` symlink causes `pnpm` to attempt an unsafe reinstall, which pnpm refused. Dependencies and lockfile did not change.
- Full baseline plus initial apartment suite passed 178 tests on Node 24.22.1. The refined apartment suite passed 13 tests on required Node 22.23.4.
- Original first-run hospital, four customers, change, journal and save/reload journeys passed on desktop and phone using cloud Chromium. This was eight browser tests before the final renderer revision.
- Final isolated apartment journeys passed four browser tests on Node 22 with direct phone touch, desktop clicks, keyboard placement, invalid placement recovery, callback agreement, 44px targets and no page overflow. The first journey checks page exceptions; final full-console checks remain part of integrated verification.
- TypeScript and production build passed before the final scene adapter revision. Final checks after rebasing current main are recorded below when complete.
- Desktop and phone screenshots were opened and inspected. The first vector draft was rejected. The current screenshots show the existing pixel renderer, visible resident, compact tray and direct selection outline.

Reproduce the browser checks with `PATH=/workspace/.junyan-tools/node_modules/node/bin:$PATH node_modules/.bin/playwright test --config docs/evidence/0067/playwright.config.ts`. The config uses only strict port 5467 and the installed `/usr/bin/chromium`. Chromium transport is muted. This is not a listening test.

## Open release gates

`audio-availability.json` lists 47 unavailable references among 54 unique word and line references. Seven exact canonical word clips exist. No new clips, silent substitutes, browser speech or relabelled recordings were added. `python3 docs/evidence/0067/audit-audio.py` reports the current truth and exits nonzero while audio is missing. Cloud model downloads were blocked by the configured proxy; the existing pinned local synthesis scripts target MLX. The coordinator is handling model access.

The shared apartment route, leaving and returning, actual IndexedDB feature reload, legacy-save migration, offline caching and new native voice playback are not verified by this isolated harness. A person has not assessed enjoyment. The requested show-me visual skill was absent from the cloud plugin copy. Screenshots and an append-only decision trail are provided without claiming that skill ran.

Model request: `gpt-6.1-sol`, reasoning `medium`. Worker `/root/apartment_writer`. Runtime has no independent model metadata. Pstack Model the Domain shaped the explicit reducer and validated room state. Control UI shaped direct browser evidence; technical-writing, unslop and deslop shaped this checkpoint. Independent review is recorded after the reviewer responds.
