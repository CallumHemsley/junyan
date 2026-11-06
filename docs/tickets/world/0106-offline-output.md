---
id: 106
title: Emit offline assets into the configured build output
status: done
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

- Fixed `offline()` to resolve `config.root` and `config.build.outDir` once Vite resolves its configuration. Enumeration, version hashing and worker emission all use that same output; manifest paths use forward slashes. Existing cache installation, activation and fetch behavior is unchanged.
- Regression: four isolated real Vite fixture builds cover default root/output, a nested root, relative custom output and absolute custom output. Before the fix, the three custom cases lacked their worker; after it, every manifest matches emitted files including public audio, stale output is excluded, unrelated `dist` files remain unchanged, and changing public audio changes the cache key.
- Verified on Node 22: 92 source test files / 622 tests passed; `pnpm exec tsc -b` passed; actual game built successfully to a private absolute output. Vite retains its existing large-bundle advisory.
- Production `/junyan/` on strict preview port 5551: four Chromium checks passed across 1440×1000 desktop and iPhone 13. Fresh workers served JavaScript and controlled the correct scope; both caches contained exactly the current build's 421 manifest URLs. Offline reload returned matching HTML/JS/CSS/audio bytes, native WAV loaded, and the existing offline restaurant interaction/audio test passed. Browser error arrays were empty; desktop/phone screenshots were inspected.
- Private proof: `/private/tmp/junyan-world-private-qa/0106/` contains the red regression, full source/typecheck/build logs, browser report, exact-cache evidence and screenshots. Browser verification used an explicitly seeded day-one save; it does not claim a complete opening/three-customer journey. Root cross-review/integration remains the next step; no branch push or merge was performed.
- Learned: a build plugin must use Vite's resolved output rather than the process working directory; otherwise a successful custom build can silently ship without its worker.
