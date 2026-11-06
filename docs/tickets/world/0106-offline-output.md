---
id: 106
title: Emit offline assets into the configured build output
status: doing
priority: high
type: bug
created: 2026-11-06
---

## Why

The production-preview gameplay audit found a script MIME error. The offline plugin reads and writes a hardcoded `dist` even when Vite builds to another output directory, leaving the served build without its service worker and potentially packaging a stale asset list.

## Done when

- Generate `sw.js` from the actual resolved Vite root/output, including relative and absolute custom output directories, while preserving default `dist` builds.
- A focused real build regression verifies that the worker and its listed assets belong to that build and that unrelated output is untouched.
- A real production preview under `/junyan/` registers its worker without MIME/console errors, then reloads its assets and game offline. Private QA stays private.

## Notes

- Centrally reserved after 0105. Owner GPT-6.1 Sol High; branch `codex/0106-offline-output`, worktree `/private/tmp/junyan-world-offline-output`, strict dev/preview ports 5550/5551.
- Based on merged main `c545ddf8`, independently of the draft new chapter. Lease `scripts/offline.ts`, one appropriate ordinary source regression and this ticket; no dependencies, feature state, game UI, schemas or lockfile changes.
- Preserve default offline cache behavior. Do not substitute a file copied from an older `dist`; its manifest/cache key must describe the exact generated build.
- Root will review and integrate the source fix, then rebuild the user previews. No push or merge from the worker.
