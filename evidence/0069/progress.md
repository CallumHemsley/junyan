# Progress and PSTACK feature checklist

- [x] `how` over the affected subsystem. Read contracts, WordToken/recovery, content schemas/voices, scene renderer lifecycle, ticket ledger and accepted decisions. Pure game rules feed a controlled React view; shared App owns journal/playback/save. Feature uses those seams.
- [x] `architect` for parallel design exploration. Parent supplied independent read-only candidates from repair_design_a and repair_design_b. Synthesis uses typed object records and explicit feedback, rejecting a generic circuit/graph engine. No nested writer.
- [x] Write the throughput checkpoint as four todo items.
  - [x] Blocking first steps. Read instructions, refine ticket/plan and agree exclusive paths before implementation. Audio manifest starts early.
  - [x] Independent workstreams. Audio synthesis and central integration can proceed outside this writer. Feature rules then UI then browser evidence remain ordered.
  - [x] Shared mutable state. No shared production file writes. Feature state travels through controlled props and the central save envelope.
  - [x] Smallest safe decomposition. One feature writer owns coupled rules, content, scene and UI. Parent manages separate read-only reviewers. No extra writers.
- [x] Delegate code-writing. This worker is the sole parent-delegated implementation owner. Feature step 4 explicitly permits a subagent forbidden to spawn to own the diff with review separation.
- [x] Verify on the matching surface. Isolated desktop, 390px and 320px browser journeys pass. Integrated journey and audio are separately pending.
- [x] Rebase into small, ordered commits. Checked rules/content, switching, truthful feedback and UI are separate commits. Repair-only rebase onto main 5c90ba4 completed and was fully reverified.
- [ ] If the design is contested, interrogate before shipping. No unresolved contested choice in the supplied synthesis.
- [x] Run Opening a PR. Central lead opened [draft PR 22](https://github.com/CallumHemsley/junyan/pull/22). Central lead owns review and landing.

Applied skills read locally from PSTACK include poteto-mode, feature playbook, how, architect, Model the Domain, Prove It Works, Sequence Work into Verifiable Units, deslop and control-ui. Model the Domain chose explicit object state. Prove It Works requires actual browser evidence. Sequence Work into Verifiable Units separates checked rules from checked UI. Native tools replace Cursor-specific tool names. User-selected model and connector override skill defaults. The separate show-me visual skill is unavailable. Show-me-your-work exists and was read during this run; its canonical six-column TSV trail is evidence/0069/decision-trail.tsv. The earlier four-column decisions.tsv is retained as historical evidence. Parent owns independent trail review because this writer may not spawn.

Mandatory audio and integrated navigation/save/offline verification remain pending. No harness result will be described as integrated completion.

First rules/content unit passed `pnpm test -- src/features/repairs/rules.test.ts` on 2026-11-05. This repository command runs the full suite. 12 files and 179 tests passed, including 10 repair tests. Audio pipeline `--plan` succeeded with exact authored content. No audio generated. Parent subsequently requested free switching between both unfinished jobs; implement that as the next checked unit before UI.

Architecture comparison evidence. Candidate A offered object-state unions with guarded return and test invalidation. Candidate B offered a bounded parts table with freely ordered reversible manipulation. Root Astra compared them because a different-model-family arena judge was unavailable within the requested Sol-medium worker policy. Synthesis takes guarded test/return from A and freely ordered toy interventions from B. Explicit actions replace a generic circuit interpreter.

## Code-ready checkpoint

`pnpm test` passed 12 files and 180 tests. `pnpm build` passed. Existing dependency annotation warnings came from reused installed Zod, with no source or lock changes. `pnpm exec playwright test --config evidence/0069/playwright.config.ts` passed 9 checks across desktop, 390px phone and 320px phone. Three explicitly skipped checks record integrated navigation/save/offline/audio pending, rather than passes.

Baseline command `PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers JUNYAN_DEV_PORT=5469 JUNYAN_PREVIEW_PORT=5569 pnpm exec playwright test --config evidence/0069/baseline.config.ts` passed all 6 desktop/phone tests. These include the actual hospital opening, customer service, change, journal, day progression, keyboard walking and browser-save reload. First attempt lacked ffmpeg because the preinstalled browser-tools path was omitted; it failed before page creation. Correcting that environment variable resolved it.

The isolated harness records onPlay callbacks and does not pretend to play unavailable voices. It uses URL-encoded state to check the controlled save boundary. It does not test IndexedDB or shared routes. Shared journal and word-card integration remain central responsibilities. Audio inventory fails honestly with 64 missing clips out of 72 unique references. Eight canonical dictionary clips already exist.

Writer inspected actual desktop, phone and 320px screenshots. Labels now sit outside the bulb/fitting and toy parts, with leader rings. The lamp is enlarged and visibly seats lower, then casts warm steady light. The toy exposes its old striped cell and metal lead and moves after both fixes. Reduced motion uses fixed time and static visible differences. All visible button boxes meet 44px width/height in browser assertions. Spoken text stays at least 28px. Return moves keyboard focus to practice.

Root separately drove 320x740 UI through tighten, steady test, attempted powered loosening and retest. Root confirmed correct restored test feedback, no console/page errors and document width equal to viewport width. Root inspected its own /tmp/repairs-root320.png. This is additional isolated evidence only.

Independent rules/content review by parent-appointed reviewer found and writer fixed false reopened-part dialogue, forged feedback saves and repeat-test feedback. Parent reported exhaustive 2,717-state /73,359-transition validation with no failures before the retest patch. Parent UI notes led to 28px phone speech, practice focus, truthful material labels and shared speaker source for visible resident, label and onPlay. Full independent final UI/diff review is still pending. No nested reviewer was spawned because this writer is explicitly forbidden to spawn. No application comments, TypeScript suppressions or any-casts were introduced.

Remaining gates are final independent review, exact offline audio generation/listening, integration into 0066 routes/word registry/save/offline enumeration, real cross-feature/day transitions, old-save migration, feature IndexedDB reload and offline playback. Ticket is blocked by those concrete dependencies, not complete.

## Rebased verification

Replayed only the four repair commits after original base `37b5d22` onto current main `5c90ba4b7421755fee3dd5d12e777f70dd34f226`. Original published feature head was `e67b2ad4aea28eed218acbf658f02f8b57989220`, verified equal to the remote feature branch before rewriting. The only conflict was this ticket's review/merge wording. Main's stronger central verification requirement was preserved. No shared files changed. Rebased source head was `06e34bffa7682027efbb89d2915491e3c9d9a9b8`.

The complete required check sequence ran once on that rebased source. `pnpm test` passed 12 files and 181 tests, including main's additional ward regression. `pnpm build` passed. Isolated repair browser tests passed all 9 checks, with 3 explicit integrated/audio skips. Baseline waiter browser tests passed all 6 desktop/phone checks. Selected screenshots were refreshed and inspected on that source. Audio remains blocked with the same 64 missing exact clips; this rebase does not establish integrated feature or voice completion.

## Final review correction

Independent final UI review confirmed the browser journeys, rules, 44px targets, 28px spoken text and inspected desktop/390px/320px layouts with clean console. It found one concrete wording defect. Both powered turn directions shared “先关掉，再拧紧。”, which contradicted an attempt to loosen the fitting. The content now says neutral “先关掉。” for either direction. Mechanics are unchanged.

The exact segmented source, authoring script and pending/audio-plan manifests agree. The new Serena line content-address is `line-997547a133ff6c8c0c7ad6aa692fb658f213b26886aafadb7d178a948674a19e.wav`. Required clip count remains 64 missing, with no generated or substituted audio.

`pnpm exec vitest run src/features/repairs/rules.test.ts` passed all 13 tests, including both powered-direction regressions. `pnpm build` passed. `pnpm exec playwright test --config evidence/0069/playwright.config.ts --grep 'isolated repair journey'` passed all 3 desktop/390px/320px journeys. They assert neutral visible feedback, matching playback callback, unchanged physical state/recovery, and restoration of steady test feedback. The updated selected-lamp screenshots were visually inspected. The baseline restaurant journey was not repeated for this content-only correction; its 6-check post-rebase pass remains recorded above.

Draft PR is https://github.com/CallumHemsley/junyan/pull/22. Independent focused recheck passed at `36b0b77`, as recorded below. Audio and shared route/save/offline integration still block completion.

## Final independent isolated review

Central lead relayed PASS from `/root/repair_final_check` on code/content commit `36b0b77aabe2ccbba58e0b4e7825122913b1262d`. This reviewer independently passed all 13 repair rules tests and exercised the live desktop 1440px, phone 390px and phone 320px UI. Powered loosening, replay and retest showed the neutral warning and correct final output. Jobs, completed IDs and recovery callbacks remained unchanged during the blocked turn. Console stayed clean. Reviewer inspected fresh screenshots and independently reproduced exact Serena warning hash `line-997547a133ff6c8c0c7ad6aa692fb658f213b26886aafadb7d178a948674a19e.wav`.

Full UI reviewer `/root/repair_ui_review` passed all other isolated behavior. Its sole concrete finding was the powered-loosen wording, now resolved and independently rechecked. No unresolved isolated code/UI findings remain in the relayed reports. This documentation-only update needs no code/test rerun.

All these workers were requested as GPT-6.1 Sol, medium reasoning. The writer was `/root/repair_writer`; rules reviewers were `/root/repair_rules_review` and `/root/repair_rules_rereview`; full UI reviewer was `/root/repair_ui_review`; final focused reviewer was `/root/repair_final_check`. Read-only designs were `/root/repair_design_a` and `/root/repair_design_b`, with cloud capability probe `/root/cloud_probe`. Requested model/effort settings do not establish independently verified runtime model identity. Root Astra synthesized the designs as previously recorded.

Draft PR is https://github.com/CallumHemsley/junyan/pull/22. Ticket remains BLOCKED. Exactly 64 natural voice clips are missing. Shared 0066 routes, atomic saves, feature IndexedDB reload, old-save migration, journal/lookup recovery, offline enumeration/playback, cross-feature navigation and restaurant day preservation still require integrated verification. Central lead owns those gates and any eventual merge. Cloud checkout and evidence remain available. Only this writer's dev server on strict port 5469 will be stopped after this documentation commit; Playwright already stopped its preview on 5569.
