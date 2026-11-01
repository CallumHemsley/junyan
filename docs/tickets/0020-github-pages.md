---
id: 20
title: Publish the completed game on GitHub Pages
status: done
priority: high
type: chore
created: 2026-11-01
---

## Why

Callum wants a local testing URL and a free GitHub Pages link to share with friends.

## Done when

- The existing Pixel Plays game and four local voices build and work under `/junyan/`, including offline audio.
- Source and a license-complete static build are pushed to GitHub without touching personal launch settings.
- Pages is published and checked over HTTP, or the exact remaining account action is documented if settings access is unavailable.

## Notes

- Owner: Codex implementation sub-agent, sole writer. Existing branch `codex/0018-character-voices` retained as requested; root worktree `/Users/callumhemsley/Personal/junyan`, development port 5173, production subpath preview port 5177, both strict.
- Reserved centrally as highest ticket + 1. No AWS, paid hosting, repository visibility changes, or renderer/audio substitutions.
- Repository is already public. GitHub connector rejects Pages endpoints and exposes no Pages settings write. Shared preview is signed out; native Chrome access was denied. Prepared static `gh-pages` publication avoids needing a source merge or a custom Actions workflow.

## Delivered 2026-11-01

- Relative Vite assets and audio, scope-relative service worker precache and registration, and relative PWA manifest work at both the root and the GitHub Pages project subpath. Actual Pixel Plays renderer and all 67 offline WAVs preserved.
- Distributed complete Pixel Plays, React, React DOM, Scheduler and Zod notices with the static build, plus `.nojekyll`. No model weights or upstream music distributed.
- Verification: production build and all 38 unit tests passed; all 7 desktop/phone browser checks passed, including four character voices and dictionary audio offline under `/junyan/`, production test hooks absent, and correct PWA scope/icon. Desktop and phone screenshots inspected; journey console clean. Real HTTP checks byte-verified all 67 WAVs against their manifest hashes, covering all four voice configurations; index, script/style, manifest, icon, service worker and notices served successfully.
- Remaining account action if Pages stays disabled: repository Settings → Pages → Deploy from a branch → `gh-pages` / `/(root)` → Save. Expected URL: `https://callumhemsley.github.io/junyan/`. Do not call the URL live until HTTP verification succeeds. Source is pushed on the requested existing branch; the static publication is separate and does not merge into `main`.
- Free hosting conditions checked against official GitHub Docs: public repositories are supported on GitHub Free; published site size limit 1 GB and soft monthly bandwidth limit 100 GB. This approximately 7 MB static game needs no paid API or runtime backend. See https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages and https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits.
- Learned: Vite's base setting alone does not rewrite content JSON audio or generated service-worker cache paths; those runtime URLs must also be deployment-relative. Source pushes do not automatically regenerate the static publication branch.
