---
id: 147
title: Keep reading-room word sources fully visible at tiny landscape heights
status: doing
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
- Owner: reader compact-lookup writer; branch codex/0147-reader-compact-lookup; worktree /private/tmp/junyan-world-reader-compact-lookup; strict ports 5647/5648. Base root integration d1c97800 includes draft reader and accepted 143. Diagnosing the concrete reader-only 568×320 failure; no source lease in root integration or 146 tree is assumed.
- Copied the root native test into repo-relative e2e/reading-lookup.spec.ts and reproduced the 568×320 night red before reader CSS edits. Native ancestor/hit probe records a 60×46 word at y70–116 (44px line plus 2px token border), against the accepted 48px contextual panel whose 2px edges leave client y70–114. Bottom hit points y115 hit the panel border; top points hit the correct word. No pocket overlay or incorrect source invoker is involved. Original outer-box predicate reports height true while ignoring the client border; its failure/probe/trace remain private.
- Root approved a reader-only compact lookup line-height of 42px, yielding a full 44px token including its unchanged border. Four CSS lines scope that declaration to spoken reader words while a short-height lookup is open; font size, min44, normal-height typography, shared 143, main, camera and focus/pause handlers remain untouched. The scope includes current-brief and expanded-instruction word families.
- Strengthened the copied regression to intersect every actual overflow client's border-excluded rectangle and require immediate full source/visible-corner hits before any test scrolling. It also opens expanded instructions, switches sources while suspended, checks pinyin/card fit/inert canvas/paused movement/both focus returns, and requires the prior editor bounds after each lookup close. Exact 568×320 night case passes with current/instruction/switched source boxes all 60×44 at y70–114 and four valid hits; no acceptance threshold was lowered. Frozen matrix, portrait/editor and base143 checks follow.
- Frozen 1168dd8c gate passes 15 browser cases with the one pre-existing desktop/664 portrait skip: all eight reader 844×390/568×320 morning/night desktop/touch profiles, all four original/small base143 profiles, and the three existing both-bay portrait placement/lookup cases. Relevant reader/map/camera tests pass 42 tests across nine files with two workers/15-second test bounds. TypeScript/Vite production build and whitespace check pass; only existing annotation/chunk warnings remain. All managed runs reached terminal completion without source edits during execution.
- Private actual-camera verification additionally passes all eight native profiles (12.6 seconds): existing frameCamera agrees with measured presentationArea before/after lookup, the actual production camera remains frozen while paused, and original entry camera returns after activity close. All 24 current/instruction/switched source observations have full 44px effective height and real source/client corner hits. Eight original full-App brief frames plus tiny expanded/source-switch originals were inspected; no card clipping, overflow or browser errors were reported. Read-only camera observation changes no renderer values. Exact red/probe/final logs, traces, original images, source/capture hashes and geometry stay private0147. Ticket remains doing pending independent source/native review; this dependent draft chapter is for root0102 integration, never a direct main PR. Expected untracked dependency symlink is not committed.146 remains untouched.
