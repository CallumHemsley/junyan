---
id: 205
title: Publish the site on every merge to main
status: done
priority: medium
type: chore
created: 2026-11-12
---

## Why

GitHub Pages serves the `gh-pages` branch, and nothing updated it when PRs merged to `main`: the live site sat on a 4 November build while every map moved to pixel art. Each publish was a manual build and commit.

## Done when

- `.github/workflows/publish.yml` runs on every push to `main` (and by hand): installs with pnpm, runs `pnpm build` (which type-checks), and commits `dist/` to `gh-pages`, skipping when the build is unchanged.
- Pages settings stay as they are (legacy build from `gh-pages`), so no repository setting changes.
- The first run after merge publishes and the live site serves the new bundle.

## Notes

- 2026-11-12: done. Owner Claude; branch `claude/0205-auto-publish`; worktree `/Users/callumhemsley/Personal/junyan-0205`.
- The workflow gates only on the build, not on `vitest run`: the renderer frame-time test flakes on loaded machines and would block publishes. There is still no CI that runs tests on PRs.
- Publishing is serialized (`concurrency: publish-site`), so two quick merges publish in order.
