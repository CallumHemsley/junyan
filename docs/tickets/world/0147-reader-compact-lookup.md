---
id: 147
title: Keep reading-room word sources fully visible at tiny landscape heights
status: todo
priority: high
type: bug
created: 2026-11-07
---

## Why

Root's separate reader integration regression is red on main63 at844x390. After accepted143 integration,844x390 passes but568x320 still fails full effective44px source height/hit testing in both themes and desktop/touch. Main143 workshop profiles pass; this is a concrete draft-reader composition seam, not a reason to rewrite the accepted base fix.

## Done when

- Diagnose the actual ancestor clipping/scroll geometry using native DOM measurements before editing. Preserve the initial/final failing logs, originals/traces and exact source. Do not weaken44px acceptance or use a test-driven scroll before the immediate-source assertion.
- Fix the smallest reader-only CSS/layout/scroll seam; keep shared143 behavior, original invoking-focus contract, actual presentationFrame camera measurement, pause, DOM tokens, pinyin-on-tap, card fit and restored editing frame. No new game/content/save behavior.
- Meaningful regression drives real saved-state startup and visible desk/source controls at844x390 and568x320 in morning/night and both desktop/touch. Require a fully visible/hittable44px source immediately, fit card, paused movement, both focus returns, no overflow/errors and restored original bounds. Existing portrait reader placement/lookup and base143 profiles remain green.
- Relevant checks/types/build and independent exact-source/native review pass before integration into0102. The chapter remains draft while broader art acceptance is unmet.

## Notes

- Centrally reserved by root from concrete integration failure; writer branch/worktree/ports assigned next. Depends on unpublished0102 chapter, so isolate from root reader integration rather than main. No direct main PR of the dependent chapter.
- Private red baseline/main143 comparison and test source: /private/tmp/junyan-world-private-qa/0102/reader-landscape/{baseline.log,final.log,lookup.spec.ts}. Four of eight combined profiles pass; four568x320 fail source effective height/hits. Source must be inspected rather than assuming an observation issue.
- Raw QA private0147 only. New source regression must use repo-relative imports when committed; original private probes remain unchanged evidence.
