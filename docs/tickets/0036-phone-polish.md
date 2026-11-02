---
id: 36
title: Polish phone readability and touch comfort
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

- Owner: Codex implementation worker; branch `t3/phone-ui-polish`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-7043b04f`.
- Started at `21a4faa` (product baseline `5dfad15`); dev `5220`, preview `5221`, both strict. Inspecting baseline before changing CSS.

- Baseline: `5dfad15`.
- Scope: Own src/style.css and e2e/overnight-phone.spec.ts only. Preserve calm hierarchy and tokens; fix only observed defects.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5220 dev, 5221 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

## Findings and evidence

- No reproducible readability, sub-44px target, horizontal overflow, or obscured-action defect was found in the inspected states. `src/style.css` is deliberately unchanged. Its Git blob is `f2a5ee98fe6653f744c681500bda98efacccb719` at both the product baseline and this worktree.
- Added `e2e/overnight-phone.spec.ts`. Five viewport journeys cover 320×568, 390×844, 1440×1000, 844×390, and 568×320. The four phone/landscape cases enable Chromium mobile layout and touch support. Each journey opens the stall, serves all four customers through kitchen selection and correct change, reads receipts, advances the day, and opens a journal word card.
- Checks cover all accessible buttons in the scene and each visited panel, including 44×44px minimum bounds, document/panel horizontal overflow, spoken-word type of at least 28px, and center-point hit testing of scrolled kitchen/payment actions and word-card close controls. Console errors and uncaught page errors must remain empty.
- Baseline screenshots are `output/playwright/before-{320,390,1440}-scene.png`, corresponding order/kitchen/welcome captures, and landscape word cards. Final journey screenshots are under `output/playwright/0036/`, named by viewport and state. Inspected baseline and final phone/desktop scenes, orders, kitchen action, change, receipt, word card, and journal. Long kitchens scroll vertically without hiding the action permanently; no sticky controls or redesign were needed.
- Production preview on strict port 5221 passed welcome, scene and order smoke checks at 320, 390 and 1440px. Measurements in `output/playwright/0036/production-measurements.json` report minimum order-dialog targets of 44×44px, no panel overflow, 28px greetings, 30px phone orders and 32px desktop orders, and zero console/page errors. Production screenshots use `preview-{width}-{scene,order}.png` in the same directory.
- All browser execution used Chromium `--mute-audio`. No system volume changes, children, push, deployment or AWS calls.

## Verification

- Local result: PASS. Final touch-emulated/desktop run passed all five journeys in 2.0 minutes. No product CSS changes were warranted.
- `pnpm test`: 88 tests passed across six files.
- `pnpm build`: passed. Rollup reported non-fatal annotation warnings from the existing Zod dependency.
- Focused Playwright configuration is retained locally at `output/playwright/0036.config.ts`. It points to this worktree's `e2e` directory, selects only `overnight-phone.spec.ts`, uses one worker, a 90-second timeout, and base URL `http://127.0.0.1:5220`. It adds `--mute-audio` and has no automatic servers, so it cannot claim another worker's ports.
- Reproduce locally with `pnpm dev --port 5220 --strictPort`, then `pnpm exec playwright test --config output/playwright/0036.config.ts`. The normal repository Playwright configuration also discovers the new spec, but starts its own default servers instead.
- Limitations: emulated Chromium only, not physical phones, WebKit, OS text scaling or browser zoom. Tested default day-one content at seed 42, not every future dialogue. Screenshots/configuration/measurement JSON are local ignored evidence, not committed assets. Independent review remains for the integrating parent.
- Learned: the recently approved scene-first layout already handles the tested phone widths. Verification coverage is useful; an unproven CSS adjustment would add risk without fixing an observed problem.
