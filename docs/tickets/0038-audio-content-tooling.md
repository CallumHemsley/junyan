---
id: 38
title: Improve reusable content audio tooling
status: done
priority: medium
type: chore
created: 2026-11-02
---

## Why

Callum requested ten Sol 6.1 medium agents to improve Junyan using pstack, with silent verification and a consolidated morning result.

## Done when

The assigned slice has reproducible evidence, scoped changes where warranted, and an honest PASS, ISSUES or BLOCKED report. Product fixes require independent review before integration.

## Notes

- Baseline: `5dfad15`.
- Scope: Own scripts/content-audio.py and docs/content-audio.md only. No model downloads, synthesis, WAV edits or content schema changes.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Owner: Codex implementation sub-agent; branch `t3/content-audio-tooling`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-45713c52`. No server/browser needed; ports 5228/5229 remain unused.
- Audit baseline: `21a4faaa8887dc8091f8d34ee70ad462ea472096` (product baseline `5dfad15`). Baseline stdlib self-check passes and real read-only plan reports 85/85 cached.
- Disposable fixture repro demonstrated contradictory voice provenance accepted as cached, duplicate/filename-less manifest records accepted, and a voice-file edit during generation still updating content. Fixed with identity comparison, manifest shape/uniqueness validation and a voice-input edit guard. Existing hash identity/version and generated WAV bytes are unchanged.
- Browser ports: 5228 dev, 5229 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

## Verification — 2026-11-02

- PASS: `python3 scripts/content-audio.py --self-check` with stdlib/fake samples only. Added observable checks for actual plan CLI no-write behavior, editorial voice aliases, identity/provenance rejection, malformed/duplicate manifest errors, writer exclusion, attempt limits, interrupted content replace/cleanup/retry and voice-file edits. Existing checks remain unchanged. The added self-check transplanted onto baseline code fails at contradictory provenance, proving the regression is detected rather than merely mirroring current code.
- PASS: disposable repro `/tmp/junyan-0038-audit/repro.py`, invoked with either `/tmp/junyan-0038-audit/baseline-content-audio.py` or `scripts/content-audio.py`, reports four unsafe behaviors `true` before and all `false` after. All fixture directories are temporary. Evidence files under `/tmp/junyan-0038-audit/` are local/disposable, not repository assets.
- PASS: `python3 scripts/content-audio.py --plan` before/after; `cmp /tmp/junyan-0038-audit/plan-before.jsonl /tmp/junyan-0038-audit/plan-after.jsonl` exits 0. Both show 85 assets, all cached. Full filename→SHA-256 maps compare equal for exactly 85 production WAVs; sorted JSON map digest `db63d6d1ea457e21d19f4e245e6e383681493d308c3a8d08231939d3b07e95b5`.
- PASS: Python AST parse and `git diff --check`. Only the three owned files changed. No model imports, real synthesis, downloads, playback, content/dependency/WAV edits, browser/server, children, push, deploy, AWS or volume operations.
- Verification gaps: `pnpm test` exits 1 (`vitest: command not found`); `pnpm build` exits 1 (`tsc: command not found`): this checkout has no `node_modules`. No dependencies installed, as requested. The supplied baseline 88-tests/build result was not independently reproduced here. Independent review is left to the parent before integration; native exact-text/pronunciation review remains pending, not replaced by signal checks.

## Learned

A matching digest label is not enough when recorded identity contradicts it. Reject ambiguous provenance before mutation, and guard both authored inputs before changing references. Individual atomic replacements do not provide a cross-file transaction; interrupted runs can leave orphan WAVs, and the documentation now explains safe retry and remaining concurrent-editor limits. Generator-setting/policy changes need an explicit identity-version change; routine tooling fixes and editorial aliases do not.
