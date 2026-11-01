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

## Publication verified

- First push to `gh-pages` automatically started GitHub's built-in Pages workflow; no settings write or user action was needed. Build, deploy and report-build-status jobs all succeeded: https://github.com/CallumHemsley/junyan/actions/runs/41350661839.
- Live URL https://callumhemsley.github.io/junyan/ returns HTTP 200. Live HTTP checks passed for every linked script, stylesheet, manifest and icon, the service worker, notices, `.nojekyll`, and all 67 WAVs with SHA-256 matching the local audio manifest across all four voices.
- Live browser opened the actual renderer, entered the game and opened 林姐's Mandarin order; its audio loaded from `/junyan/audio/`. The deployed service worker controls `/junyan/`, all 67 WAVs are precached, and production `window.__TEST__` is absent.
- Static publication commit `1ff6898064681c8b8b4047838c84aabaf371427f` was built from source `1b4ff456fc387cff01e5be5177696ca5fa920416`. Only this publication record and README wording changed after that build. No PR or merge was necessary; `main` is unchanged. Personal `.claude/launch.json` remains untracked and untouched.
