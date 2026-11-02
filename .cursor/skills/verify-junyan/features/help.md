# Help and opening

## Sub-features

- First-run `怎么玩` dialog, collapsed/expanded three-step instructions, authored audio and token cards.
- `开门迎客` enters the restaurant; in-game `怎么玩` reopens help without discarding progress.

## How to get to it (user POV)

Open `/` in a fresh browser context. Choose `怎么玩` in the dialog to expand the sequence; choose `开门迎客` to start. The in-game help button returns to the instructions.

## Driving it with Playwright

After helper cleanup: `pnpm exec playwright test e2e/learning-help.spec.ts`. The spec clicks the named dialog/buttons, verifies exactly three `[data-help-step]` elements, real authored audio requests, token pinyin on activation, journal lookups, and the preview reload entry point. Inspect `output/playwright/0027/` screenshots and failure traces. The generated lookup proof also exercises the opening button, not all help paths.

## Gotchas

Fresh contexts are required for first-run coverage. Normal UI is Mandarin-only; romanization belongs only in a tapped word card. Preview coverage needs the `/junyan/` path and resolved environment URL; never navigate the spec's legacy hardcoded fallback.
