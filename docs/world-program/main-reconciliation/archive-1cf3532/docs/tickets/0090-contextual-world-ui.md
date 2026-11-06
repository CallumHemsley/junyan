---
id: 90
title: Present physical interactions in a compact world HUD
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

Independent phone capture shows a legacy service page covering most of the world and clipping the tray. Each physical interaction needs scoped controls, not a whole feature page in a floating panel.

## Done when

Typed presentational components show only the selected table/kitchen/bench/cat/plant/furniture interaction, preserve replay and tappable registered Chinese, maintain journal/tray access, and leave visible world context. Touch, keyboard, focus return and scrolling work on phone/desktop. Foundation wires actual selected-anchor bindings and existing reducers. Integrated independent runtime review passes; a standalone harness is insufficient.

## Notes

- GPT-6.1 Sol medium native cloud builder, ID recorded in program ledger after spawn.
- Branch `codex/0090-contextual-world-ui`, isolated `/workspace/junyan-0090`, strict port 5494.
- Owns only `src/world/ui/*`, this ticket, `docs/evidence/0090/*`.
- Foundation retains App, shared CSS, state/actions/save/contracts and all wiring. UI-local CSS inside owned directory is allowed.
- Read integration-v1.1 selected-anchor contract. No new audio/content, dependency changes, hidden CSS-only legacy controls, or production rule changes.
- Goal ACTIVE through real foundation integration and review.

## Active implementation ledger

The full human objective remains ACTIVE. Deliver a large, beautiful, connected, walkable pixel life-sim with the existing Mandarin activities and no new audio. This ticket is not complete until foundation integrates these controls and independent review confirms whole-game behavior.

Owner handle `/root/contextual_world_ui`. Worktree `/workspace/junyan-0090`. Branch `codex/0090-contextual-world-ui`. Strict port 5494. Next action is phone and desktop comparison of compact bottom and top placements with registered content, then foundation integration.

Throughput checkpoint. The selected target and callback contract is implemented first. Browser evidence proves the compact shell next. Foundation wiring and integrated review remain required afterward.

Public exports live in `src/world/ui/index.ts`. `ContextualInteraction` accepts the discriminated `target`, a `ReactNode` title, registered `Line` dialogue with optional `ReactNode` speaker, caller-provided actions with stable IDs and disabled state, scoped children, close callback, invoking element, and existing lookup/replay/recovery props. `WorldPocketBar` accepts counts and explicit journal/tray callbacks. `RestaurantTableControls` receives phase/order/foods/total/change and callbacks. `KitchenControls` receives foods/tray/caller-derived pickupEnabled and callbacks. These components do not dispatch or decide domain legality.

Observed tools. Node v24.22.1, Vite 7.3.7, Playwright 1.64.1. Existing node_modules is symlinked from coordinator checkout. No install or frozen-install claim. `node node_modules/typescript/bin/tsc --noEmit` passed.

### Verified UI unit

Browser evidence and exact integration reference live in `docs/evidence/0090/README.md`. Both top and bottom prototypes were inspected at 390×664 and 1440×900. Bottom dock selected because it preserves the location heading and initiating table. Reduced-motion normal and kitchen captures were inspected at 390×664, 320×568 and 320×320. Narrow pocket controls stack vertically to avoid the existing movement pad. The short viewport retains close/footer with an independently scrollable center.

The current API supersedes the initial action-label contract. Actions are `{id, control: ReactNode}` and the shell does not create nested buttons. Pass `suspended={wordOpen}` for the topmost existing word card. Restaurant labels use required caller-rendered slots documented in the evidence reference. Callback, scrolling, focus return, word-card Escape, pickup and return probes passed with system Chromium. Type checking and all 308 tests in 26 files passed. `git diff --check` passed. No standalone harness completion is claimed.

Next action remains foundation integration using the current exported props, followed by independent review of physical anchor selection, real Mandarin replay, token cards, camera/player visibility, tray/journal access and existing reducer actions in the complete game.
