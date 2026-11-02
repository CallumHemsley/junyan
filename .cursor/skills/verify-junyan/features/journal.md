# Word journal and saves

## Sub-features

- Tappable spoken word → pinyin card → journal entry.
- `本子` reopens collected words; close/reopen cards.
- Normal-mode IndexedDB persistence across reload; corrupted-save recovery has separate regression coverage.

## How to get to it (user POV)

Open the stall, select table 1 and tap a word in the Mandarin dialogue. After reloading and reopening the stall, choose `本子` to find it again. Help tokens also collect words (see help map).

## Driving it with Playwright

Use `.cursor/skills/verify-junyan/verify.mjs drive word-proof` against the matching launched run. Assertions check `.word-popover h2`, nonempty `.pinyin`, actual `junyan-waiter` / `saves` / `v1` journal data, and the visible `.journal-list > button` after reload. Inspect before/action/result PNGs and JSON on both viewports. After cleanup, `pnpm exec playwright test e2e/save.spec.ts` additionally checks malformed saves and next-day retention; those tests intentionally inject fixtures and do not replace this UI proof.

## Gotchas

Never add `test=1` to the persistence proof: it disables normal save loading/writing. Use fresh isolated contexts, not the user's profile. The proof reads IndexedDB only after a real click; it never creates a save fixture.
