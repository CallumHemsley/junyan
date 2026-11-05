---
id: 64
title: Explore more playful interactions in the restaurant
status: done
priority: medium
type: explore
created: 2026-11-05
---

## Why

Callum wants the player to have more things to do in the café/canteen and asks for a brainstorm about what would make it more fun. Find interactions that are enjoyable in their own right and strengthen the cozy Mandarin setting, building on the existing waiter loop.

## Done when

- [x] Play the current restaurant loop and identify where the player is waiting, repeating actions without a meaningful choice, or wanting to interact with the scene. Record observations separately from ideas.
- [x] Produce a focused shortlist of up to five distinct ideas. Possible starting points include preparing or pouring a drink, helping with a small customer request, clearing or arranging a table, responding to a regular, or choosing how to improve the stall. These are prompts for exploration, not committed features.
- [x] For each idea, describe the player's concrete action, an example moment, why it could be fun, how it fits Mandarin learning without becoming an exercise, and its likely implementation effort. Consider phone controls, accessibility and the gentle pace.
- [x] Recommend the smallest promising experiment and define how a short playtest would tell whether it adds enjoyment rather than busywork. Describe the minimum prototype, its success criteria and the parts intentionally left out.
- [x] Save the brainstorm and recommendation in `docs/ideas/restaurant-interactions.md` with the project's idea/research frontmatter. Present the shortlist to Callum for selection before creating implementation tickets or building a prototype.

## Notes

- Requested by Callum on 2026-11-05. This ticket is exploration; no particular new mechanic has been selected.
- Context: [[decisions/0003-pixel-waiter]], [[ideas/build-recommendation]], [[tickets/0002-paper-prototype-one-counter]], [[tickets/0004-pin-down-the-hook]] and the existing pickup, delivery, change, journal and day-progression interactions.
- Respect pure rules over explicit state, injected time/RNG, tappable DOM Mandarin, offline content and audio, and touch targets. Any costly-to-reverse proposal needs a decision for Callum to accept.
- Coordinate with [[tickets/0062-natural-customer-performances]] and [[tickets/0063-restaurant-background-sounds]] so the brainstorm builds on the desired atmosphere without duplicating those tickets.

### Execution evidence (append-only)

- 2026-11-05: Owner Codex ticket 0064; branch `codex/0064-restaurant-interactions`; isolated checkout `/workspace/junyan-0064`; base `66ac123` (current origin/main at start). Strict dev/preview ports `5406` / `5407`. Only this ticket and `docs/ideas/restaurant-interactions.md` are writable deliverables; runtime evidence stays outside tracked files.
- Read shared guidance, ticket conventions, accepted decisions 0001–0004, Morning Steam design guidance/tokens and build recommendation. Decision 0003 governs the current pixel waiter surface over the earlier counter mockups. No bundled pstack playbooks found in workspace; following the supplied poteto-mode/autopilot-full harness steps, adapted to exploration. No new mechanic, implementation ticket, dependency or schema changes are authorized here. Parent assigns independent review; no merge by this writer.

- 2026-11-05: Draft PR opened early: https://github.com/CallumHemsley/junyan/pull/12. Actual muted browser exploration served three customers through scene controls and revisited a served table; JSON records dialog text, click-to-dialog timings (0.88–2.40s, including automation overhead) and no captured console/page errors. Existing journey completed the opening, four customers, change, lookup/journal and day-two progression on desktop and phone: **2 passed**. Inspected desktop/phone restaurant and journal screenshots plus desktop order, kitchen, receipt and revisit screenshots. Full silent WebM recordings retained; no subjective listening or full-video-review claim.
- 2026-11-05: Compared five interaction boundaries: preparation, optional post-service favour, departed-table arrangement, regular conversation and closing decoration. Recommended one optional napkin favour as the smallest experiment, with reviewed Mandarin/audio required if selected, a named isolated state shape, rough effort, comparison protocol, enjoyment/obligation thresholds and explicit exclusions. This is an untested hypothesis; Callum selects before any implementation ticket/prototype. No shared-file needs for this deliverable; future content/audio/save needs are estimates in the idea note, not edits.
- 2026-11-05: Validation: `pnpm test` passed **169 tests / 11 files** (initial run on inherited Node 24; repeated with Node 22.23.4 in `unit-node22.log`); `JUNYAN_DEV_PORT=5406 JUNYAN_PREVIEW_PORT=5407 PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers pnpm exec playwright test --config /workspace/evidence-0064/playwright.config.ts e2e/waiter.spec.ts -g 'wake in the ward'` passed **2/2**. External config only sets isolated paths, system Chromium and video capture, retaining `--mute-audio`, strict ports and no server reuse. Playwright preview ran `pnpm build`; standalone Node 22 `pnpm build` also passed. Build emitted dependency annotation warnings; browser journey console assertions remained clean. No dependency/lockfile/schema/product changes.
- 2026-11-05: Evidence root `/workspace/evidence-0064/`: `explore.mjs`, `exploration.json`, `desktop-order.png`, `desktop-kitchen.png`, `desktop-receipt.png`, `desktop-revisit.png`, `unit.log`, `unit-node22.log`, `journey.log`, `build.log`, and `test-results/waiter-wake-in-the-ward-th-bc2de-change-journal-and-progress-{desktop,phone}/video.webm`. Existing journey screenshots are `/workspace/junyan-0064/output/playwright/{desktop,phone}-{restaurant,journal}.png`. Local runtime artifacts are not committed; preserve before teardown. Independent review remains assigned by parent; this writer has not merged or claimed approval. Exploration delivered; mechanic selection remains open.

- 2026-11-05 review fix: Independent review of `6a338f8` found one P2: cloud-local evidence was unavailable to the reviewer. The follow-up explicitly authorizes `docs/evidence/0064/` as supporting scope. Exported original observation JSON and eight original screenshots, plus a portable driver and reproduction README, to [committed evidence](../evidence/0064/README.md); updated the [idea provenance links](../ideas/restaurant-interactions.md#inspection-and-provenance). Single-run timing claims retain their original JSON proof and are qualified as automation-inclusive samples, not benchmarks. Bulky videos/logs remain local; historical paths above are preserved as an append-only trail. No product changes; future mechanic selection does not gate merging this completed brainstorm. Parent must review the new exact head before merge; this writer will not merge.
- 2026-11-05 review-fix validation: original exported JSON/eight screenshots match the originals byte-for-byte (supporting set 941,536 bytes); all new relative Markdown links resolve; `node --check docs/evidence/0064/explore.mjs` and `git diff --check` passed. The portable driver was executed with Node 22, `CHROMIUM_PATH=/usr/bin/chromium EVIDENCE_OUTPUT=/workspace/evidence-0064/reproduce node docs/evidence/0064/explore.mjs`, against `pnpm dev --host 127.0.0.1 --port 5406 --strictPort`: three services and the revisit completed, captured errors empty. Reproduction output stays untracked; committed captures retain the original timings. No product suite rerun needed for this evidence-only fix.
