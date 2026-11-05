# Independent rooftop garden review

The goal is an enjoyable, coherent pixel rooftop garden that teaches Mandarin through accurate conditions and visible consequences.

Reviewer is `/root/garden_reviewer`, independent by authorship. Review checkout is `/workspace/garden-review-0070`. Initial reviewed HEAD was `14672f55250c71ab614375533788edfe2566fd7b`, against main `5c90ba4b7421755fee3dd5d12e777f70dd34f226`. Final reviewed HEAD is `b12db5845b6b7bcd48651edfc86c9fe1c7a9543d`, containing product commit `19acc466edb313c135374bd00629a31a880d5c81`. No tracked source, tests, documentation or evidence was edited by this reviewer. No commit, push, merge, deployment or audio substitution occurred.

## Verdict

Scoped implementation review PASS after fixes. No unresolved source defects found in the reviewed feature scope. Full release BLOCKED. This verdict does not authorize merging before the required integrated player and audio gates pass.

## Findings and resolution

1. **P2, resolved.** `src/features/garden/index.tsx:86` previously chose rain advice solely from weather. Reproduced live on the initial HEAD by binding day3, tidying, advancing to day4, observing flower growth, selecting the climber and reselecting the flower. The flower was sheltered at site0, dry and growth1, but the neighbour said 今天下雨不用浇水. Following that instruction prevented the next healthy growth step. Baseline screenshot is `/workspace/garden-review-scratch/rain-dry-mismatch.png`. Final code requires ready soil and exposure before rain advice. A new browser regression covers sheltered dry, sheltered watered, exposed rain-ready and overwatered pots after reselection. Both viewports pass independently.
2. **P3, resolved.** `src/features/garden/index.tsx:13` previously accepted mutable `string[]` for the two optional vocabulary props, contrary to the central readonly-array contract. A central caller with readonly arrays could not type-check. Both props now accept `readonly string[]`; the final TypeScript build passes. This was a contract mismatch, not an observed integrated build failure.

The stale action-notice day fix and ordinary DOM confirmation were inspected and exercised live. Next-day droop and growth replace prior action messages. Confirmation tokens can open lookup and restore the exact trigger, with Escape, focus containment and double-click care safety passing. This proves the harness integration, not the absent shared production route.

## Review coverage

Read AGENTS, ticket0070, the garden plan, central contract, verification evidence, decision trail and every changed source/test file. Reviewed rules for day binding, duplicate sync, rollback, large missed intervals, deterministic rain/heat order, shade, unique placement, dry/wet/extra care, recovery, bounded growth, durable gifts and boundary validation. Reviewed component acknowledgment ordering and recovery dispatch. The component waits for the exact resulting state before recovery; no recovery occurs merely on mount, lookup or restored snapshot in the exercised journeys. Reviewed authored JSON, real Zod schema, namespaced content, canonical word identity and recovery registration. No current circular registry dependency or actionable comment/suppression finding was found. No speculative refactor is requested.

The scene uses the shared renderer and existing 林姐 rig coherently. Fresh phone and desktop captures show plant stages, reversible shade, rain, flowers, the mature tree and a bird beside its crown. The final punctuation grouping removes the orphan full stop observed in an earlier phone capture. Reduced-motion browser journeys check 44px targets, 28px spoken text, no overflow, no default pinyin/English and no console/page errors. Hidden-tab/reduced-motion suspension was also inspected in source; no separate background-tab timing experiment was run.

## Independent commands and outcomes

Runtime was Node `v22.23.4`, selected with `PATH=/workspace/.junyan-tools/node_modules/node/bin:$PATH`. Dependency access used a temporary symlink to `/workspace/junyan/node_modules`. The owned server command was `./node_modules/.bin/vite --host 127.0.0.1 --port 5472 --strictPort`. Chromium used `/usr/bin/chromium` and `--mute-audio`.

- Initial HEAD, `./node_modules/.bin/vitest run`. **185/185 tests across13 files passed**, including15 garden tests. Rules/content tests are unchanged in the final product delta.
- Initial and final HEAD, `./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build`. **Passed**. Rollup emitted third-party Zod annotation warnings; no product build failure.
- Initial HEAD, `JUNYAN_CHROMIUM_EXECUTABLE=/usr/bin/chromium ./node_modules/.bin/playwright test --config /workspace/garden-review-scratch/playwright.config.ts`. **2/2 passed** before the additional condition regression existed.
- Final HEAD, the same focused browser command. **4/4 passed**. Scratch spec changes only its type-import path and screenshot destination; scratch config changes port, test/output directories and reporters.
- Initial HEAD, `JUNYAN_CHROMIUM_EXECUTABLE=/usr/bin/chromium ./node_modules/.bin/playwright test --config /workspace/garden-review-scratch/existing.config.ts`. **6/6 passed**. Desktop and phone each complete hospital opening, three customers, change, journal and progression; keyboard walking; and real existing restaurant word save/reload. Shared application source is unchanged in the final delta.
- `PYTHONDONTWRITEBYTECODE=1 python3 src/features/garden/audio-plan.py`, parsed for counts. **91 exact jobs,82 missing**. No synthesis or listening was performed.
- Compared every final `runtime.json` source hash against actual file bytes. **Zero mismatches**.

Two initial scratch-config launches failed before test collection because of scratch ESM/import setup; a third command had a scratch sed-expression error. These were corrected outside tracked files. They are not product test passes or product defects.

Results remain in `/workspace/garden-review-scratch/results.json` and `/workspace/garden-review-scratch/existing-results.json`. The port5472 server was stopped by its own recorded session after review. The temporary dependency symlink was removed. Tracked files remain untouched.

## Visually inspected screenshots

Fresh reviewer captures were inspected at `/workspace/garden-review-scratch/garden-{desktop,phone}-{welcome,wet-warning,rain-growth,retreat}.png`, all eight captures. The independent rainy-dry mismatch screenshot was also inspected. After the final delta, desktop retreat, phone retreat and phone rain-growth were inspected again from freshly regenerated captures, confirming the visible perch and punctuation changes. The earlier captures are overwritten by final captures at those names; the separate rainy-dry baseline remains.

## Audit attention flags

The earlier184-test count and Node24-only caveat were stale. Final verification documentation correctly records185 tests and Node22. Initial manually precise timestamps are now explicitly labeled approximate in decisions.tsv. The Linux MLX capability entry preserves the missing-checkpoint and listening blockers. Dictionary-caption job reduction agrees with the authored labels and exact pipeline audit. Final runtime hashes match. No unsupported integration or listening completion claim was found. Historical log rows saying checks were pending are superseded by later rows rather than silently rewritten.

The Prove It Works principle changed the review from trusting green tests to running a live condition probe, which exposed the P2. The Model the Domain principle focused review on explicit state invariants and the existing bounded reducer rather than recommending a wider refactor.

## Release blockers and missing verification

**82/91 garden audio jobs are missing.** The pinned model cache/download constraint and lack of actual listening remain blockers. No native spoken playback or pronunciation quality verdict is claimed. Muted playback callback checks cannot close this gate.

**Central0066 is absent.** Actual App/navigation entry, restaurant-authoritative transitions into the garden, migration isolation, shared journal registration and word-card integration, real garden IndexedDB save/reload, apartment gift delivery, offline service-worker enumeration, offline voices/assets and cross-feature journeys remain unverified. Snapshot reinjection in the harness is not actual save/reload. Existing restaurant save/reload passing does not prove garden persistence. The current production build does not expose the garden route.

Rejected/delayed parent acknowledgment paths have source inspection and partial recovery coverage but no dedicated component test. Actual combined-player testing must exercise shared focus/recovery ordering and all navigation/save/offline/cross-feature paths. Missing tests remain open rather than passes. Central serialized merge and post-merge verification remain the lead's responsibility, conditional on the unresolved release gates.
