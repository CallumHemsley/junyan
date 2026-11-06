# Adjacent town arrival comparison

These captures use a valid declared-arrival visual/setup fixture on unchanged assembly e02a747 at port 5497. They are not ordinary travel proof. Fixture validation passed before browser use. Position 34,30 is preserved by `validateSavedGame` and exposes both existing town.restaurant-approach and town.breakfast-steam inspect affordances.

Both existing labels are registered `看看`. At 390×664 and 320×568, the screenshots show two identical detached rows without a target-linked scene cue. Measured action targets are 44×44px and word targets are 56×44px. Lookup Escape restores token focus at both widths. The existing token/focus presentation needs no replacement.

Foundation current source e48b10e was inspected after an explicit tracking-ref fetch. Its newer camera and picking changes must be preserved. Its nearby-row rendering remains the same pattern as this baseline. This report does not claim an e48 browser capture. The owner-ready wiring request is `src/world/ui/arrival-guidance.md`.

Run `node node_modules/vitest/vitest.mjs run --config docs/evidence/world/0090/arrival-guidance/fixture.config.ts` to validate and regenerate the fixture from the declared e02 read-only checkout. Run `node docs/evidence/world/0090/arrival-guidance/probe.mjs` to capture the existing rows and verify hit areas and focus. Each browser page uses a separate disposable profile. This script writes the labelled fixture into that profile's IndexedDB and never changes the shared checkout.
