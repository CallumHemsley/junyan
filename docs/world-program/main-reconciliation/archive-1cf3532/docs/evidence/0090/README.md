# Contextual controls evidence

The full objective remains ACTIVE. The shell alone cannot prove a connected walkable life-sim. Foundation integration and independent whole-game review remain required.

Run the harness with `node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5494 --strictPort`. Open `/src/world/ui/harness.html`. Run `node docs/evidence/0090/probe.mjs` from this worktree to reproduce the callback, scrolling, lookup Escape, inert-state, invoking-focus and tray checks. Registered content comes from the existing content module. The static backdrop is an existing runtime capture, so this harness does not establish movement, camera or domain-action integration.

Both top and bottom placements were captured and inspected at 390×664 and 1440×900. Bottom placement preserves the location heading and the initiating table above the panel. The panel scrolls while its close and action rows remain visible. The persistent journal and tray buttons are separate from the panel. The top prototype covers the location heading and was rejected. Foundation must still verify the real player's position remains visible with its actual camera.

The first browser invocation failed because the package's bundled Chromium was absent. The probe uses installed `/usr/bin/chromium`. The first visual prototype exposed missing token CSS in the harness, which was corrected before these captures. No package or lockfile was changed.

## Integration reference

Import from `src/world/ui/index.ts`. The shell imports only its local CSS and uses existing root tokens.

- `ContextualInteraction` accepts `target`, `title`, `dialogue`, `actions`, `children`, `onClose`, `returnFocusTo`, `suspended`, `onLookup`, `onPlay`, `recoveredWordIds`, and `freshWordIds`. `target` derives from validated ActivityBinding. Each dialogue entry has a registered `line` and optional token-rendered `speaker`. Titles and speakers accept ReactNode. Each action is `{id, control}`. Supply a complete control with existing callbacks and caller-derived disabled state. The shell never wraps it in another button.
- Pass `suspended={wordOpen}` while the existing topmost word card is open. The shell becomes inert. Existing card code owns card Escape handling and token focus restoration. Contextual Escape closes the interaction only when its controls receive the event.
- `RestaurantTableControls` accepts `phase`, `order`, `foods`, `change`, `onChange`, `onLookup`, and caller-rendered `summary`, `changeLabel`, `resetControl`, `receiptSummary`, `thanks`. Supply registered token content in these slots. Submit actions belong in the shell footer. The component does not validate payment or advance a phase.
- `KitchenControls` accepts `foods`, `tray`, `pickupEnabled`, `onPickup`, `onReturn`, `onLookup`. The caller determines pickup legality. Food name lookup is a separate WordToken beside the pickup art, avoiding nested buttons and duplicate visible pickup names.
- `WorldPocketBar` accepts journal/tray counts and explicit callbacks. Place beside the shell inside a positioned world wrapper. It opens nothing automatically.

No UI component persists feature state or dispatches domain actions. Existing reducers remain authoritative. Do not mount the full legacy service or feature page as shell children.
