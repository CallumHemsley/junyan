# Contextual controls evidence

The full objective remains ACTIVE. The shell alone cannot prove a connected walkable life-sim. Foundation integration and independent whole-game review remain required.

Run the harness with `node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5494 --strictPort`. Open `/src/world/ui/harness.html`. Run `node docs/evidence/0090/probe.mjs` from this worktree to reproduce the callback, scrolling, lookup Escape, inert-state, invoking-focus and tray checks. Registered content comes from the existing content module. The static backdrop is an existing runtime capture, so this harness does not establish movement, camera or domain-action integration.

The panel now caps at 40dvh in portrait and desktop. Short landscape retains a larger allowance to keep close and footer usable. Both top and bottom placements were captured and inspected at 390×664 and 1440×900. Bottom placement preserves the location heading and the initiating table above the panel. The panel scrolls while its close and action rows remain visible. The persistent journal and tray buttons are separate from the panel. The top prototype covers the location heading and was rejected. Foundation must still verify the real player's position remains visible with its actual camera.

The first browser invocation failed because the package's bundled Chromium was absent. The probe uses installed `/usr/bin/chromium`. The first visual prototype exposed missing token CSS in the harness, which was corrected before these captures. No package or lockfile was changed.

## Integration reference

Import from `src/world/ui/index.ts`. The shell imports only its local CSS and uses existing root tokens.

- `ContextualInteraction` accepts `target`, `title`, `dialogue`, `actions`, `children`, `onClose`, `returnFocusTo`, `suspended`, `onLookup`, `onPlay`, `recoveredWordIds`, and `freshWordIds`. `target` derives from validated ActivityBinding. `dialogue` explicitly contains `current` and optional `history`; each entry has a registered `line` and optional token-rendered `speaker`. History opens through a native disclosure without removing token or replay controls. Titles and speakers accept ReactNode. Each action is `{id, control}`. Supply a complete control with existing callbacks and caller-derived disabled state. The shell never wraps it in another button.
- Pass `suspended={wordOpen}` while the existing topmost word card is open. The shell becomes inert. Existing card code owns card Escape handling and token focus restoration. Contextual Escape closes the interaction only when its controls receive the event.
- `RestaurantTableControls` accepts `phase`, `order`, `foods`, `change`, `onChange`, `onLookup`, and caller-rendered `summary`, `changeLabel`, `resetControl`, `receiptSummary`, `thanks`. Supply registered token content in these slots. Submit actions belong in the shell footer. The component does not validate payment or advance a phase.
- `KitchenControls` accepts `foods`, `tray`, `trayHeading`, `pickupEnabled`, `onPickup`, `onReturn`, `onLookup`. The caller determines pickup legality. Food name lookup is a separate WordToken beside the pickup art and beside each icon-only tray return button. `trayHeading` accepts caller-rendered registered content.
- `WorldPocketBar` accepts complete `journalControl` and `trayControl` ReactNodes, so the caller can render registered token labels beside activation controls without nested buttons. Place beside the shell inside a positioned world wrapper. It opens nothing automatically.

No UI component persists feature state or dispatches domain actions. Existing reducers remain authoritative. Do not mount the full legacy service or feature page as shell children.

## Existing label convention

The design system explicitly specifies plain tabular amounts such as `2块` and `23 个词`. The legacy App uses plain `块` in money increments, pickup prices and receipt amounts. This patch preserves that accepted currency convention. Existing content registers `找零` but does not register `本子`, `托盘` or `块`. Pocket controls and tray heading are therefore caller-rendered slots; this component does not fabricate words or audio.

The expanded probe verifies that the seven-entry stress history is initially collapsed, can be explicitly opened, and retains every registered line. It also verifies tray-word lookup and focus restoration before activating the separate return button.

## Narrow short-screen repair

The e02 audit measured a 128px panel and a 16px central viewport at 320×320. The final narrow-width rule overrode the earlier short-height rule. A final combined media query now provides a 176px minimum panel and caps it at the viewport height minus 140px. At 320×320 the panel measures 180px, the central viewport measures 56px, and close/footer remain within the screen. The 390×664 geometry remains unchanged with a 142px central viewport.

Run `node docs/evidence/0090/short-layout.mjs after` against the owned port 5494 harness. The probe checks the 44px minimum central viewport, panel/footer bounds, and actual pickup/return callbacks at both sizes. Before/after geometry is in `short-before.json` and `short-after.json`; captures use the matching names. These demonstrate the owned CSS repair, not an update to the e02 assembly.

A 320px-high screen cannot show the full kitchen, dialogue and world together. The center scrolls through food art, lookup words and tray controls while the close row and action footer stay available. The shared world minimum height and actual camera still need foundation's separate short-screen repair and an integrated recheck.
