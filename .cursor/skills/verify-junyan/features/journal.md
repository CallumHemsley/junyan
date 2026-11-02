# Word journal and saves

## Sub-features

- Tappable spoken word → pinyin card → journal entry.
- `本子` reopens collected words; close/reopen cards.
- Normal-mode IndexedDB persistence, validated synchronous recovery checkpoints and corrupted-save recovery. A newly recorded word survives immediate reload.
- Valid checkpoints restore without waiting for queued IndexedDB operations. Otherwise startup waits up to1500ms, then starts fresh with a save warning and ignores late reads.

## How to get to it (user POV)

Open the stall, select table 1 and tap a word in the Mandarin dialogue. After reloading and reopening the stall, choose `本子` to find it again. Help tokens also collect words (see help map).

## Driving it with Playwright

Use `.cursor/skills/verify-junyan/verify.mjs drive word-proof` against the matching launched run. Assertions check `.word-popover h2`, nonempty `.pinyin`, actual `junyan-waiter` / `saves` / `v1` journal data, and the visible `.journal-list > button` after reload. Inspect before/action/result PNGs and JSON on both viewports. After cleanup, `pnpm exec playwright test e2e/save.spec.ts` additionally checks malformed saves and next-day retention; those tests intentionally inject fixtures and do not replace this UI proof.

## Gotchas

Never add `test=1` to the persistence proof: it disables normal save loading/writing. Use fresh isolated contexts, not the user's profile. The proof reads IndexedDB only after a real click; it never creates a save fixture.

## Immediate reload and startup recovery

The helper deliberately waits for a durable IndexedDB save, so its passing result alone does **not** prove the immediate-reload race. After helper cleanup, run `pnpm exec playwright test e2e/overnight-keyboard.spec.ts`: its normal production cases tap a real word and reload immediately without waiting for storage, including aborted native writes. Run `pnpm exec playwright test --config playwright.recovery.config.ts` separately for real queued database opens, bounded startup, late-read fencing and actual nested keyboard opener restoration on desktop/phone Chromium and WebKit. Both configs support the documented strict port environment variables. Never run them while the helper owns those ports.

Recovery is not lossless: without a usable checkpoint, timeout permits fresh play and subsequent autosave may replace the inaccessible durable snapshot. Do not claim old progress is preserved in this path. Browser WebKit checks must block service-worker bypass of WAV routing and serve valid silent PCM; they do not establish physical Safari behavior or audible quality.
