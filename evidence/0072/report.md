# 0072 served food: review packet

READY for central exact-head/current-main review. Draft PR [#24](https://github.com/CallumHemsley/junyan/pull/24); writer has not merged. Branch `codex/0072-served-food-props`, isolated checkout `/workspace/junyan-0072`; base main `5c90ba4b7421755fee3dd5d12e777f70dd34f226`. Requested writer settings Sol Medium; independent runtime model metadata unavailable.

## Behavior and boundary

Before: every successful delivery became the same bowl and pale sphere, including bun-only and soy-milk-only orders. After: existing order items enter the scene as an explicit third factory argument. One representative per distinct food ID appears only in checkout/served phases. Current food IDs equal their kinds, protected by a focused invariant test. No new persisted fields, schema, dependency, content, audio, tray or payment rules. Quantities stay on the receipt; a bun ×3 remains one representative bun. Mixed meals show each distinct kind in order, evenly spaced; existing orders contain at most three kinds. No preparation mechanic or hidden gameplay rule.

| Existing food | Representative |
|---|---|
| bun | rounded pale bun with top fold |
| bread | rectangular steamed bread with scores |
| egg | pale egg with golden yolk |
| milk | tall jade soy-milk cup with straw |
| porridge | jade bowl with pale porridge |
| youtiao | paired golden sticks |
| dumpling | jade bowl with two pale dumplings |

Table badges moved below tables in the local adapter after independent review demonstrated that 44px phone badges covered the original new props. Targets retain their size, text and callbacks. No shared App/style/renderer changes.

## Verification actually performed

Node **22.23.4**, pnpm, installed Chromium `/usr/bin/chromium`, browser-level `--mute-audio`. Strict dev5472/preview5572. Original config reused the writer's already-running strict-port dev server; preview was started with strictPort.

| Command/check | Result |
|---|---|
| `pnpm test` under Node22 | 12 files, 175 tests passed |
| `pnpm build` under Node22 | passed; two locked-Zod comment-annotation warnings |
| `JUNYAN_DEV_PORT=5472 JUNYAN_PREVIEW_PORT=5572 pnpm exec playwright test --config evidence/0072/verify.config.ts` | 13 passed, exit0; see [journey.log](journey.log) |
| Original opening → four customers → change → journal → next day | passed on desktop/phone, normal/reduced motion |
| Original walking and saved-word reload | passed in all four projects |
| Original production offline restaurant + Mandarin audio | passed; offline clips loaded with positive duration; no listening claim |
| `node evidence/0072/play.mjs final-saved 1440` | two complete saved days, all seven foods, mixed orders, wrong delivery/return, change, checkout reload twice, journal; errors=[], overflow=false |
| `node evidence/0072/play.mjs final-saved 390 reduce` | same actual-click journey on reduced-motion phone; errors=[], overflow=false |
| `git diff --check origin/main` | clean |

Saved-mode custom runs read existing storage to assert state, and never dispatch game actions through hooks. Original journey uses hooks to read orders but actual controls perform the opening, pickup, delivery and payment. Focused tests cover all seven distinct rasters, no pre-delivery variation, rejected-delivery artifact absence, correct-table localization, quantity abstraction, mixed meals, phase geometry and reconstruction after serialization. Existing elder/tray regressions pass. The order-aware frame hash replaces the intentional generic-meal baseline; helpers receive actual order items too.

## Selected captures inspected

All links below are committed for remote reviewer access. Selected opening, journal, before/after desktop, final phone and reload captures were actually viewed. Older `after-1440` images document the intermediate food change before badge relocation; use `final-saved-*` for final acceptance.

- [Before: same generic meal](before-1440/day1-table4-checkout.png)
- [Final desktop: day1 bun, milk, porridge, youtiao](final-saved-1440/day1-table4-checkout.png)
- [Final desktop: day2 bread, egg, dumpling+milk, porridge+bread](final-saved-1440/day2-table4-checkout.png)
- [Final reduced-motion phone, day1](final-saved-390-reduce/day1-table4-checkout.png)
- [Final reduced-motion phone, mixed meals](final-saved-390-reduce/day2-table4-checkout.png)
- [Phone checkout reload](final-saved-390-reduce/day1-reload.png), [desktop checkout reload](final-saved-1440/day1-reload.png)
- [Rejected delivery on phone](final-saved-390-reduce/rejected.png)
- [Opening desktop](opening-desktop.png), [opening phone reduced motion](opening-phone-reduced.png)
- [Journal desktop](journal-desktop.png), [journal phone reduced motion](journal-phone-reduced.png)
- [Desktop saved-run result](final-saved-1440/result.json), [phone saved-run result](final-saved-390-reduce/result.json)

## Independent review and scoped quality assessment

Independent no-edit agent `scene_review` reviewed checkpoint6cd8f95, found P2 phone badge occlusion, and accepted the fix at exact code head **0bc54d7905db3deedaa38a0f3c58fc45780c7a20**. It inspected phone checkout/reload and desktop images, found no new blocking defects, and did not independently rerun journeys or assess audio. The final packaging commit changes only ticket/evidence; central lead still owns final review and integration.

These are writer self-scores for the scoped visual correction, not independent approval or observed player enjoyment:

| Dimension | Score | Evidence and limit |
|---|---|---|
| Naturalness/presentation | 8/10 | Familiar bun/cup/bowl/sticks silhouettes use the existing raster palette and primitives. Tiny scene resolution limits detail; bread and bun remain subtle at phone scale. |
| Immersion | 8/10 | Actual orders now leave matching physical objects at the right table through checkout/payment/reload. Props are static representatives and do not depict consumption. |
| Usability | 8/10 | Phone badge occlusion fixed; foods visible, labels/44px targets retained; walking and full journeys pass. Miniature props supplement the DOM receipt and cannot replace it for quantities. |
| Contribution to fun/interest | N/A | No human playtest. Better physical consequence may support interest, but that is an untested hypothesis; a pixel change is insufficient to score fun. |

Concrete discovered defect: badge overlap, fixed and independently checked. No known blocking scoped defects remain. This game remains a short vertical slice, not a release-quality Steam game; retention and enjoyment are unproven.

## Limits and remaining gate

No pstack bundle was present at the supplied path; followed authorized harness-adapted reproduce/isolate/boundary/state-shape/implement/check/independent-review process. Browser download was denied by network policy; system Chromium supplied the real surface. Playwright ffmpeg binary was absent, so the evidence-only config disables video and retains screenshots/traces. No video/audio capture or subjective listening was performed; this patch changes no audio. No human approval or listening pass is claimed. Central exact-final-head review on current main and integration remain pending. No AWS writes or deployments.
